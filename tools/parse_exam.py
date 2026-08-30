#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
parse_exam.py — IHK-Prüfungs-PDF → JSON für den Simulator.

Два движка:
  text   — быстрый, для PDF с текстовым слоем (PyMuPDF)
  vision — для сканов: страница → JPEG → Claude Vision → структурированный блок
  auto   — сам выбирает по наличию текстового слоя (по умолчанию)

Установка:
  pip install pymupdf google-genai
  setx GEMINI_API_KEY "AIza..."           (потом перезапустить терминал)

  Внимание: пакет google-generativeai мёртв (поддержка закончилась 30.11.2025).
  Актуальный SDK называется google-genai.

Примеры:
  python parse_exam.py --check raw/*.pdf
  python parse_exam.py --list-models
  python parse_exam.py --aufgaben raw/AP1-2026-F.pdf --exam-id ap1-2026-fs --dry-run
  python parse_exam.py --aufgaben raw/AP1-2026-F.pdf --loesungen raw/AP1-2026-F-LOE.pdf \
      --exam-id ap1-2026-fs --title "..." --part AP1 --year 2026 --season Frühjahr

Результат:
  exams/<id>.json          для симулятора
  exams/<id>.report.json   что проверить руками
  assets/<id>_*.png        вырезанные схемы + полные страницы
  .cache/                  ответы Vision (повторный запуск бесплатен)
"""

import argparse
import base64
import hashlib
import json
import os
import re
import sys
import textwrap
import time
from datetime import datetime
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:
    import fitz


PROMPT_VERSION = "v4"
DEFAULT_MODEL = "gemini-2.5-flash"
DEFAULT_RPM = 8          # бесплатный уровень: 5-15 запросов в минуту

PLACEHOLDER = ("[Схема не вырезалась автоматически. Открой полную страницу "
               "и опиши решение текстом.]")

DIAGRAM_HINTS = (
    "er-modell", "er-diagramm", "entity-relationship", "datenmodell",
    "netzplan", "netzwerkplan", "topologie", "skizzieren", "zeichnen",
    "diagramm", "struktogramm", "flussdiagramm", "pap", "uml",
    "klassendiagramm", "mockup", "wireframe", "grafisch", "ergänzen sie die tabelle",
)


# ==========================================================================
#  Vision: промпт
# ==========================================================================

SYSTEM_PROMPT = """You transcribe scanned German IHK examination papers into structured JSON.

ABSOLUTE RULES
1. Transcribe VERBATIM. Keep the original German, including umlauts, §, DIN
   references, product names and numbers exactly as printed.
2. NEVER translate, summarise, rephrase, complete or correct anything.
3. NEVER solve a task. You only transcribe what is printed.
4. NEVER invent content. If a word or number is unreadable, write <?> in its
   place and list the position in "uncertain".
5. Numbers are critical (prices, capacities, IP addresses, subnet masks, dates).
   If you are not fully certain of a digit, mark that whole value with <?>.

WHAT TO RETURN
Return ONE JSON object and nothing else. No prose, no markdown fences.

{
  "pageKind": "deckblatt" | "situation" | "aufgaben" | "anlage" | "loesung" | "leer",
  "situationText": string or null,
  "blocks": [ ... ],
  "uncertain": [string],
  "notes": string or null
}

Block types:

{"type":"task","number":1,"intro":"lead-in text printed under the Aufgabe heading","points":25}
{"type":"group","label":"c)","intro":"lead-in text shared by the lettered sub-items below"}
{"type":"subtask","label":"aa)","prompt":"full verbatim question text",
 "points":6,"answerKind":"text"|"diagram"|"table"|"calculation",
 "figureBox":[x0,y0,x1,y1] or null}
{"type":"attachment","label":"Anlage 1","caption":"Netzwerkplan",
 "figureBox":[x0,y0,x1,y1]}
{"type":"solution","label":"1.1","text":"verbatim Musterloesung / Loesungshinweis"}
{"type":"continuation","text":"text continuing a block from the previous page"}

HIERARCHY - read this carefully, German IHK papers have THREE levels:
  Aufgabe            "1. Aufgabe (25 Punkte)"        -> "task"
  lettered group     "c) <lead-in text>"             -> "group"
  scored sub-item    "ca) <question>  1 Punkt"       -> "subtask"
  A lettered item that carries points AND a question is a "subtask", not a
  "group". A lettered item followed by further letters (ca, cb, cc) and with no
  points of its own is a "group" - its text is context the sub-items depend on.
  NEVER drop group lead-in text. If it is lost, the sub-items become unanswerable.

DETAILS
- "label": use exactly the printed marker ("aa)", "b)", "1.1"). Do NOT prepend
  the Aufgabe number and do NOT repeat the label at the start of "prompt".
- "situationText": ONLY the framing scenario that explicitly applies to all
  Aufgaben (typically introduced by "Die Aufgaben 1 bis 4 beziehen sich auf die
  folgende Ausgangssituation"). A paragraph that introduces a single Aufgabe
  belongs in that task's "intro". A paragraph introducing a lettered group
  belongs in a "group" block. When in doubt it is NOT situationText.
- "points": the printed Bewertungseinheiten / Punkte for that item, as an integer.
  null if none is printed. Do not estimate.
- "answerKind": "diagram" if the candidate must draw or complete a drawing,
  "table" if a printed table must be filled in, "calculation" if a computation
  with a printed result field, otherwise "text".
- "figureBox": normalised coordinates 0..1 of the printed figure, table or
  drawing area, as [left, top, right, bottom] relative to the full page.
  Be generous - include captions and labels. null if there is no figure.
- Text belonging to a figure (node labels, legends) stays inside the figure.
  Do NOT copy it into "prompt".
- On a "loesung" page emit only "solution" blocks, keyed by the task label they
  answer.
- Headers, footers, page numbers and exam-board boilerplate: skip them.
- A page continuing a question from the previous page starts with a
  "continuation" block."""


USER_TEMPLATE = """This is page {page} of {total} from a scanned German IHK exam PDF.
Document role: {role}.

Transcribe it according to the rules. Return only the JSON object."""


# ==========================================================================
#  Общие утилиты
# ==========================================================================

def norm(text):
    if not text:
        return ""
    text = str(text).replace("\u00ad", "")
    text = re.sub(r"(\w)-\s*\n\s*([a-zäöüß])", r"\1\2", text)
    text = re.sub(r"[ \t\u00a0]+", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def _strip_label(prompt, label):
    """Модель иногда дублирует метку в начале текста вопроса: 'bb) Im Konstuktor...'"""
    if prompt and label and prompt.startswith(label):
        return prompt[len(label):].lstrip(" :.-")
    return prompt


def looks_like_diagram(text):
    low = (text or "").lower()
    return any(h in low for h in DIAGRAM_HINTS)


def page_has_text(page):
    return len(page.get_text().strip())


def is_unsure(text):
    return "<?>" in (text or "") or "‹?›" in (text or "")


# ==========================================================================
#  Рендер страниц
# ==========================================================================

def render_jpeg(page, max_px=1560, quality=82):
    """Страница → JPEG-байты, длинная сторона ≈ max_px (оптимум для Vision)."""
    long_side = max(page.rect.width, page.rect.height)
    zoom = max_px / long_side
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csRGB)
    return pix.tobytes("jpg", jpg_quality=quality), pix.width, pix.height


def crop_png(page, box, path, dpi=200, pad=0.02):
    """Вырезает область по нормированным координатам [x0,y0,x1,y1]."""
    try:
        box = [float(v) for v in box]
    except (TypeError, ValueError):
        return None
    r = page.rect
    x0 = max(0.0, min(box[0], box[2]) - pad)
    y0 = max(0.0, min(box[1], box[3]) - pad)
    x1 = min(1.0, max(box[0], box[2]) + pad)
    y1 = min(1.0, max(box[1], box[3]) + pad)
    if x1 - x0 < 0.04 or y1 - y0 < 0.03:
        return None
    clip = fitz.Rect(r.x0 + x0 * r.width, r.y0 + y0 * r.height,
                     r.x0 + x1 * r.width, r.y0 + y1 * r.height)
    pix = page.get_pixmap(clip=clip, dpi=dpi)
    path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(path))
    return {"width": pix.width, "height": pix.height}


def full_page_png(page, path, dpi=150):
    pix = page.get_pixmap(dpi=dpi)
    path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(path))
    return {"width": pix.width, "height": pix.height}


# ==========================================================================
#  Vision-движок
# ==========================================================================

class Vision:
    """Провайдер: Google Gemini (google-genai SDK).

    Кэш, ключи и структура ответа те же — меняется только транспорт.
    """

    def __init__(self, model, cache_dir, dry_run=False, offline=False,
                 rpm=DEFAULT_RPM, debug=False):
        self.model = model
        self.cache = Path(cache_dir)
        self.cache.mkdir(parents=True, exist_ok=True)
        self.dry_run = dry_run
        self.offline = offline
        self.debug = debug
        self.client = None
        self.types = None
        self.errors = None
        self.calls = 0
        self.hits = 0
        self.min_gap = 60.0 / max(rpm, 1)     # троттлинг под бесплатный лимит
        self._last = 0.0
        self._thinking = True                 # выключаем «размышления», если модель умеет

        if not (dry_run or offline):
            self.client, self.types, self.errors = _gemini_client()

    # ---------------- кэш ----------------

    def _key(self, jpeg, page_no, role):
        h = hashlib.sha1(jpeg).hexdigest()[:16]
        tag = "L" if role.startswith("L") else "A"
        return self.cache / f"{h}_{tag}_p{page_no:03d}_{PROMPT_VERSION}.json"

    def page(self, jpeg, page_no, total, role):
        path = self._key(jpeg, page_no, role)
        if path.exists():
            self.hits += 1
            return json.loads(path.read_text(encoding="utf-8"))
        if self.offline:
            raise FileNotFoundError(f"нет кэша для стр. {page_no} (режим --offline)")
        if self.dry_run:
            return {"pageKind": "leer", "situationText": None, "blocks": [],
                    "uncertain": [], "notes": "dry-run: API не вызывался"}
        data = self._call(jpeg, page_no, total, role)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        self.calls += 1
        return data

    # ---------------- вызов ----------------

    def _throttle(self):
        wait = self.min_gap - (time.monotonic() - self._last)
        if wait > 0:
            time.sleep(wait)
        self._last = time.monotonic()

    def _config(self):
        t = self.types
        kw = dict(
            system_instruction=SYSTEM_PROMPT,
            temperature=0,
            max_output_tokens=16000,
            response_mime_type="application/json",
            # без этого SDK считает, что мы пользуемся function calling,
            # и печатает ворнинг про AFC на каждый запрос
            automatic_function_calling=t.AutomaticFunctionCallingConfig(disable=True),
        )
        if self._thinking:
            # у «мыслящих» моделей рассуждения съедают лимит вывода
            # и ответ обрывается на середине JSON
            kw["thinking_config"] = t.ThinkingConfig(thinking_budget=0)
        return t.GenerateContentConfig(**kw)

    def _call(self, jpeg, page_no, total, role, tries=4):
        t = self.types
        contents = [
            t.Part.from_bytes(data=jpeg, mime_type="image/jpeg"),
            USER_TEMPLATE.format(page=page_no, total=total, role=role),
        ]

        for attempt in range(tries):
            try:
                self._throttle()
                if self.debug:
                    print(f"\n[debug] model={self.model} thinking={'off' if self._thinking else 'default'}")
                r = self.client.models.generate_content(
                    model=self.model, contents=contents, config=self._config())

                text = _gemini_text(r)
                if self.debug:
                    print(f"[debug] finish_reason={_finish(r)} длина ответа={len(text)}")
                if not text:
                    raise EmptyAnswer(f"пустой ответ, finish_reason={_finish(r)}")
                return self._parse(text)

            except self.errors.ClientError as e:
                code = getattr(e, "code", None)

                if code == 429:                       # квота — единственный 4xx, который ждём
                    wait = _retry_delay(str(e), attempt)
                    print(f"    стр. {page_no}: лимит запросов (429) — повтор через {wait}s")
                    time.sleep(wait)
                    continue

                if code == 400 and self._thinking and "thinking" in str(e).lower():
                    print(f"    стр. {page_no}: модель не поддерживает thinking_budget — "
                          f"повторяю без него")
                    self._thinking = False
                    continue

                _fatal(e, page_no, self.model, self.client)   # 400/403/404 → выходим

            except self.errors.ServerError as e:
                wait = 2 ** attempt
                print(f"    стр. {page_no}: сбой на стороне Google "
                      f"({getattr(e, 'code', '5xx')}) — повтор через {wait}s")
                time.sleep(wait)

            except (EmptyAnswer, json.JSONDecodeError) as e:
                if isinstance(e, EmptyAnswer) and "MAX_TOKENS" in str(e):
                    _die(f"Ответ обрезан по лимиту токенов на стр. {page_no}.\n"
                         f"  Страница слишком плотная. Попробуй: --max-px 1100")
                wait = 2 ** attempt
                print(f"    стр. {page_no}: {e} — повтор через {wait}s")
                time.sleep(wait)

        _die(f"Страница {page_no}: не удалось получить ответ за {tries} попытки.")

    @staticmethod
    def _parse(raw):
        raw = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.M).strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            cut = raw.rfind("}")
            if cut > 0:
                return json.loads(raw[:cut + 1])
            raise


class EmptyAnswer(RuntimeError):
    pass


# ---------------- вспомогательное для Gemini ----------------

def _die(msg):
    print("\n" + "=" * 74)
    print(msg)
    print("=" * 74)
    sys.exit(1)


def _fatal(e, page_no, model, client):
    """Ошибка запроса. Не повторяем — показываем, на что именно ругается Google."""
    code = getattr(e, "code", "?")
    status = getattr(e, "status", "") or ""
    message = getattr(e, "message", "") or str(e)

    lines = ["\n" + "=" * 74,
             f"Google отклонил запрос на странице {page_no}.",
             f"  HTTP {code} {status}",
             f"  Сообщение: {message}"]

    detail = getattr(e, "response_json", None) or getattr(e, "details", None)
    if detail:
        lines.append("  Полный ответ:")
        lines.append(textwrap.indent(
            json.dumps(detail, ensure_ascii=False, indent=2)[:2000], "    "))

    low = (message + str(status)).lower()
    if code == 404 or "not_found" in low or "is not found" in low:
        lines.append(f"\n  Модель '{model}' недоступна твоему ключу.")
        lines.append("  Доступные модели с поддержкой generateContent:")
        try:
            for name in _vision_models(client)[:12]:
                lines.append(f"    {name}")
            lines.append("\n  Возьми подходящую и передай через --model")
        except Exception:
            lines.append("    (не удалось получить список: python parse_exam.py --list-models)")
    elif code == 400 and "api key" in low:
        lines.append("\n  Ключ недействителен. Проверь: echo $env:GEMINI_API_KEY")
    elif code == 403:
        lines.append("\n  Ключ есть, но доступ запрещён — проверь регион и статус проекта")
        lines.append("  в https://aistudio.google.com/apikey")
    elif code == 400:
        lines.append("\n  Некорректный запрос. Запусти с --debug, чтобы увидеть параметры.")

    lines.append("=" * 74)
    print("\n".join(lines))
    sys.exit(1)


def _vision_models(client):
    out = []
    for m in client.models.list():
        actions = getattr(m, "supported_actions", None) or []
        if actions and "generateContent" not in actions:
            continue
        out.append((m.name or "").replace("models/", ""))
    return out


def _gemini_client():
    try:
        from google import genai
        from google.genai import types, errors
    except ImportError:
        _die("Нужен SDK:  pip install google-genai\n"
             "(пакет google-generativeai устарел и больше не поддерживается)")
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        _die('Не задан GEMINI_API_KEY.\n'
             '  setx GEMINI_API_KEY "AIza..."   и перезапусти терминал\n'
             '  ключ: https://aistudio.google.com/apikey')
    return genai.Client(api_key=key), types, errors


def _gemini_text(r):
    """Достаёт текст, не падая на пустых кандидатах."""
    try:
        txt = r.text
    except Exception:
        txt = None
    if txt:
        return txt
    out = []
    for c in getattr(r, "candidates", None) or []:
        for p in getattr(getattr(c, "content", None), "parts", None) or []:
            if getattr(p, "text", None):
                out.append(p.text)
    return "".join(out)


def _finish(r):
    for c in getattr(r, "candidates", None) or []:
        return getattr(c, "finish_reason", None)
    return None


def _retry_delay(msg, attempt):
    """Google часто присылает retryDelay прямо в теле 429."""
    m = re.search(r"retryDelay['\"]?\s*:\s*['\"]?(\d+)", msg)
    if m:
        return int(m.group(1)) + 1
    return min(60, 15 * (attempt + 1))


def estimate_cost(pages, w, h):
    """Gemini считает картинку ~258 токенов на тайл 768x768."""
    tiles = max(1, (w // 768 + 1) * (h // 768 + 1))
    inp = pages * (tiles * 258 + 900)
    out = pages * 1800
    return inp, out, 0.0     # бесплатный уровень


# ==========================================================================
#  Сборка страниц в структуру экзамена
# ==========================================================================

def collect_vision(doc, vis, role, exam_id, assets_dir, args):
    total = len(doc)
    situation, tasks, attachments, uncertain = [], [], [], []
    solutions = {}
    cur_task = cur_sub = cur_group = None
    page_images = {}

    def page_img(page, n):
        if n not in page_images:
            name = f"{exam_id}_seite_{n:02d}.png"
            full_page_png(page, assets_dir / name, dpi=args.page_dpi)
            page_images[n] = f"{assets_dir.name}/{name}"
        return page_images[n]

    for page in doc:
        n = page.number + 1
        jpeg, _, _ = render_jpeg(page, max_px=args.max_px)
        print(f"    стр. {n}/{total}", end="\r", flush=True)
        data = vis.page(jpeg, n, total, role)
        kind = data.get("pageKind", "aufgaben")

        for u in data.get("uncertain") or []:
            uncertain.append(f"S.{n}: {u}")
        if data.get("notes"):
            uncertain.append(f"S.{n} [notes]: {data['notes']}")
        if data.get("situationText"):
            situation.append(norm(data["situationText"]))

        for b in data.get("blocks") or []:
            btype = b.get("type")

            if btype == "task":
                cur_sub = None
                cur_group = None
                cur_task = {
                    "number": b.get("number") or (len(tasks) + 1),
                    "title": norm(b.get("intro") or b.get("title")),
                    "points": b.get("points"),
                    "page": n, "subtasks": [],
                }
                tasks.append(cur_task)

            elif btype == "group":
                cur_sub = None
                cur_group = {"label": norm(b.get("label")),
                             "intro": norm(b.get("intro") or b.get("text"))}

            elif btype == "subtask":
                if cur_task is None:
                    cur_task = {"number": len(tasks) + 1, "title": "", "points": None,
                                "page": n, "subtasks": []}
                    tasks.append(cur_task)
                idx = len(cur_task["subtasks"]) + 1
                lbl = str(b.get("label") or f"{cur_task['number']}.{idx}").strip()
                cur_sub = {
                    "label": lbl,
                    "prompt": _strip_label(norm(b.get("prompt")), lbl),
                    "points": b.get("points"),
                    "answerKind": b.get("answerKind") or "text",
                    "page": n, "assets": [],
                    "groupLabel": (cur_group or {}).get("label"),
                    "groupIntro": (cur_group or {}).get("intro"),
                }
                box = b.get("figureBox")
                if box and len(box) == 4:
                    name = f"{exam_id}_p{n:02d}_s{idx}.png"
                    size = crop_png(page, box, assets_dir / name, dpi=args.dpi)
                    if size:
                        cur_sub["assets"].append({
                            "id": f"s{n}_{idx}",
                            "file": f"{assets_dir.name}/{name}",
                            "sourcePage": n, **size,
                        })
                if cur_sub["answerKind"] in ("diagram", "table") or cur_sub["assets"]:
                    cur_sub["pageImage"] = page_img(page, n)
                cur_task["subtasks"].append(cur_sub)

            elif btype == "attachment":
                idx = len(attachments) + 1
                entry = {"id": f"anl{idx}", "sourcePage": n,
                         "label": norm(b.get("label")) or f"Anlage {idx}",
                         "caption": norm(b.get("caption"))}
                box = b.get("figureBox")
                if box and len(box) == 4:
                    name = f"{exam_id}_p{n:02d}_anlage{idx}.png"
                    size = crop_png(page, box, assets_dir / name, dpi=args.dpi)
                    if size:
                        entry.update({"file": f"{assets_dir.name}/{name}", **size})
                if "file" not in entry:
                    entry["file"] = page_img(page, n)
                attachments.append(entry)

            elif btype == "solution":
                lbl = str(b.get("label") or "").strip()
                txt = norm(b.get("text"))
                if lbl and txt:
                    solutions[lbl] = (solutions.get(lbl, "") + "\n" + txt).strip()

            elif btype == "continuation":
                txt = norm(b.get("text"))
                if not txt:
                    continue
                if kind == "loesung" and solutions:
                    last = list(solutions)[-1]
                    solutions[last] += "\n" + txt
                elif cur_sub is not None:
                    cur_sub["prompt"] = (cur_sub["prompt"] + "\n" + txt).strip()
                elif cur_group is not None:
                    cur_group["intro"] = (cur_group["intro"] + " " + txt).strip()
                elif cur_task is not None:
                    cur_task["title"] = (cur_task["title"] + " " + txt).strip()
                else:
                    situation.append(txt)

    print(" " * 30, end="\r")
    return "\n\n".join(situation), tasks, attachments, solutions, uncertain


# ==========================================================================
#  Текстовый движок
# ==========================================================================

RE_TASK = re.compile(r"^(?:Aufgabe|Handlungsschritt)\s+(\d{1,2})\s*[:.\-–]?\s*(.*)$", re.I)
RE_SUB = re.compile(r"^(\d{1,2})\.(\d{1,2})\s*[:.)\-–]?\s+(.+)$")
RE_PTS = re.compile(r"[\(\[–\-]?\s*(\d{1,3})\s*(?:BE|Bewertungseinheiten|Punkte?|P\.)\s*[\)\]–\-]?", re.I)


def collect_text(doc, exam_id, assets_dir, args):
    lines = []
    for page in doc:
        h = page.rect.height
        for blk in page.get_text("dict").get("blocks", []):
            if blk.get("type") != 0:
                continue
            for ln in blk.get("lines", []):
                t = "".join(s.get("text", "") for s in ln.get("spans", [])).strip()
                if not t:
                    continue
                y0, y1 = ln["bbox"][1], ln["bbox"][3]
                if y1 < 42 or y0 > h - 42:
                    continue
                lines.append((page.number + 1, y0, t))
    lines.sort(key=lambda x: (x[0], x[1]))

    situation, tasks = [], []
    cur_task = cur_sub = None
    for pageno, _, t in lines:
        found = RE_PTS.findall(t)
        pts = int(found[-1]) if found else None
        clean = RE_PTS.sub(" ", t).strip() if pts else t

        m = RE_TASK.match(t)
        if m:
            cur_task = {"number": int(m.group(1)),
                        "title": RE_PTS.sub("", m.group(2)).strip(),
                        "points": pts, "page": pageno, "subtasks": []}
            tasks.append(cur_task)
            cur_sub = None
            continue
        if cur_task:
            m = RE_SUB.match(t)
            if m and int(m.group(1)) == cur_task["number"]:
                cur_sub = {"label": f"{m.group(1)}.{m.group(2)}",
                           "prompt": RE_PTS.sub("", m.group(3)).strip(),
                           "points": pts, "answerKind": "text",
                           "page": pageno, "assets": []}
                cur_task["subtasks"].append(cur_sub)
                continue
            tgt = cur_sub or cur_task
            if pts and tgt.get("points") is None:
                tgt["points"] = pts
            key = "prompt" if cur_sub else "title"
            tgt[key] = (tgt.get(key, "") + "\n" + clean).strip()
        else:
            situation.append(t)

    for t in tasks:
        t["title"] = norm(t["title"])
        for s in t["subtasks"]:
            s["prompt"] = norm(s["prompt"])
            if looks_like_diagram(s["prompt"]):
                s["answerKind"] = "diagram"
    return norm("\n".join(situation)), tasks, [], {}, []


# ==========================================================================
#  Финальный JSON
# ==========================================================================

def assemble(args, situation, tasks, attachments, solutions, uncertain, engine):
    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "engine": engine,
        "model": args.model if engine == "vision" else None,
        "sourceTasks": Path(args.aufgaben).name,
        "sourceSolutions": Path(args.loesungen).name if args.loesungen else None,
        "uncertain": uncertain,
        "warnings": [],
    }

    expect_solutions = bool(args.loesungen)
    out_tasks, total = [], 0
    for t in tasks:
        subs = []
        for s in t["subtasks"]:
            lbl = s["label"]
            # метки в IHK-бланках повторяются между заданиями (a), b), ca)...),
            # поэтому и id, и ключ решения обязаны быть привязаны к номеру задания
            qual = f"{t['number']}{lbl}"
            sol = (solutions.get(qual) or solutions.get(qual.replace(" ", ""))
                   or solutions.get(lbl) or solutions.get(lbl.replace(" ", "")))
            pts = s.get("points")
            if isinstance(pts, str) and pts.isdigit():
                pts = int(pts)
            diagram = (s.get("answerKind") in ("diagram", "table")
                       or looks_like_diagram(s["prompt"]))
            has_img = bool(s.get("assets"))
            unsure = is_unsure(s["prompt"])

            if pts is None:
                report["warnings"].append(f"{qual}: не найдены баллы")
            if sol is None and expect_solutions:
                report["warnings"].append(f"{qual}: не найдена Lösung")
            if unsure:
                report["warnings"].append(f"{qual}: есть нераспознанные места <?>")
            total += pts or 0

            subs.append({
                "id": re.sub(r"\W+", "_", qual).strip("_"),
                "label": lbl,
                "fullLabel": f"{t['number']} {lbl}",
                "groupLabel": s.get("groupLabel"),
                "groupIntro": s.get("groupIntro"),
                "prompt": s["prompt"],
                "maxPoints": pts,
                "answerType": "diagram" if diagram else "text",
                "assets": s.get("assets", []),
                "pageImage": s.get("pageImage"),
                "placeholder": PLACEHOLDER if (diagram and not has_img) else None,
                "solution": {
                    "text": sol,
                    "extractionConfidence": "low" if (not sol or len(sol) < 40 or is_unsure(sol)) else "high",
                } if sol else None,
                "needsReview": (sol is None and expect_solutions) or pts is None
                               or unsure or (diagram and not has_img),
                "sourcePage": s["page"],
            })

        if not subs:
            report["warnings"].append(f"Aufgabe {t['number']}: подзадачи не распознаны")
            continue

        out_tasks.append({
            "id": f"a{t['number']}",
            "label": f"Aufgabe {t['number']}",
            "intro": t.get("title", ""),
            "maxPoints": t.get("points") or sum(s["maxPoints"] or 0 for s in subs) or None,
            "subtasks": subs,
        })

    data = {
        "schemaVersion": 1,
        "examId": args.exam_id,
        "meta": {
            "title": args.title, "part": args.part, "year": args.year,
            "season": args.season, "durationMinutes": args.minutes,
            "maxPoints": args.max_points or total or 100,
            "detectedPoints": total,
            "engine": engine,
            "sourceFiles": {
                "tasks": Path(args.aufgaben).name,
                "solutions": Path(args.loesungen).name if args.loesungen else None,
            },
        },
        "situation": {"text": situation, "assets": []},
        "attachments": attachments,
        "tasks": out_tasks,
        "gradingScale": "ihk-100",
    }
    return data, report


# ==========================================================================
#  Режимы запуска
# ==========================================================================

def check(paths):
    print(f"{'файл':<40} {'стр':>4} {'симв/стр':>9}  вердикт")
    print("-" * 80)
    for p in paths:
        d = fitz.open(p)
        counts = [page_has_text(pg) for pg in d]
        avg = sum(counts) / max(len(counts), 1)
        verdict = ("текстовый → --engine text" if avg > 200
                   else "частично → --engine vision" if avg > 20
                   else "СКАН → --engine vision")
        print(f"{Path(p).name[:39]:<40} {len(counts):>4} {avg:>9.0f}  {verdict}")
        d.close()


def list_models():
    client, _, _ = _gemini_client()
    print("Модели, доступные твоему ключу:\n")
    for name in _vision_models(client):
        print(f"  {name}")
    print("\nНужную передай через --model")


def process(path, role, vis, args, assets_dir):
    doc = fitz.open(path)
    avg = sum(page_has_text(p) for p in doc) / max(len(doc), 1)
    eng = args.engine if args.engine != "auto" else ("text" if avg > 200 else "vision")

    if eng == "vision":
        _, w, h = render_jpeg(doc[0], max_px=args.max_px)
        inp, out, _ = estimate_cost(len(doc), w, h)
        mins = len(doc) * 60.0 / max(args.rpm, 1) / 60.0
        print(f"  {Path(path).name}: {len(doc)} стр. · vision · {args.model} · "
              f"≈{inp/1000:.0f}k вход / {out/1000:.0f}k выход · "
              f"{len(doc)} запросов ≈ {mins:.1f} мин при {args.rpm} RPM")
        res = collect_vision(doc, vis, role, args.exam_id, assets_dir, args)
    else:
        print(f"  {Path(path).name}: {len(doc)} стр. · text (текстовый слой есть)")
        res = collect_text(doc, args.exam_id, assets_dir, args)
    doc.close()
    return eng, res


def run(args):
    assets_dir = Path(args.assets)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    vis = Vision(args.model, args.cache, dry_run=args.dry_run,
                 offline=args.offline, rpm=args.rpm, debug=args.debug)

    eng, (situation, tasks, attachments, solutions, uncertain) = process(
        args.aufgaben, "Aufgabenteil (questions)", vis, args, assets_dir)

    if args.loesungen:
        _, (_, ltasks, _, lsol, lunc) = process(
            args.loesungen, "Loesungsteil (official model answers)", vis, args, assets_dir)
        solutions.update(lsol)
        uncertain += lunc
        for t in ltasks:                      # решения, распознанные как задачи
            for s in t["subtasks"]:
                solutions.setdefault(s["label"], s["prompt"])

    data, report = assemble(args, situation, tasks, attachments,
                            solutions, uncertain, eng)

    (out_dir / f"{args.exam_id}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / f"{args.exam_id}.report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    n_sub = sum(len(t["subtasks"]) for t in data["tasks"])
    n_rev = sum(1 for t in data["tasks"] for s in t["subtasks"] if s["needsReview"])
    print(f"\n→ {out_dir / (args.exam_id + '.json')}")
    print(f"  Aufgaben: {len(data['tasks'])}   Teilaufgaben: {n_sub}   нужна проверка: {n_rev}")
    print(f"  Баллов найдено: {data['meta']['detectedPoints']}   Anlagen: {len(attachments)}")
    if eng == "vision":
        print(f"  Gemini: {vis.calls} запросов к API, {vis.hits} из кэша")
    if uncertain:
        print(f"  ⚠ {len(uncertain)} мест распознаны неуверенно — см. report.json")
    if report["warnings"]:
        print(f"  ⚠ {len(report['warnings'])} замечаний → {args.exam_id}.report.json")


def main():
    ap = argparse.ArgumentParser(description="IHK PDF → JSON (текст или скан)")
    ap.add_argument("--check", nargs="*", help="проверить текстовый слой и выйти")
    ap.add_argument("--list-models", action="store_true", help="показать доступные модели")
    ap.add_argument("--aufgaben")
    ap.add_argument("--loesungen")
    ap.add_argument("--exam-id", default="exam")
    ap.add_argument("--title", default="IHK-Prüfung")
    ap.add_argument("--part", default="AP1")
    ap.add_argument("--year", type=int, default=0)
    ap.add_argument("--season", default="")
    ap.add_argument("--minutes", type=int, default=90)
    ap.add_argument("--max-points", type=int, default=100)
    ap.add_argument("--engine", choices=["auto", "text", "vision"], default="auto")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--rpm", type=int, default=DEFAULT_RPM,
                    help="запросов в минуту (бесплатный уровень: 5-15)")
    ap.add_argument("--out-dir", default="exams")
    ap.add_argument("--assets", default="assets")
    ap.add_argument("--cache", default=".cache")
    ap.add_argument("--dpi", type=int, default=200, help="DPI вырезанных схем")
    ap.add_argument("--page-dpi", type=int, default=150, help="DPI полных страниц")
    ap.add_argument("--max-px", type=int, default=1560, help="размер картинки для Vision")
    ap.add_argument("--dry-run", action="store_true", help="без вызовов API")
    ap.add_argument("--offline", action="store_true", help="только из кэша")
    ap.add_argument("--debug", action="store_true",
                    help="показывать параметры запроса и причину ошибок")
    args = ap.parse_args()

    if args.list_models:
        list_models(); return
    if args.check is not None:
        files = args.check or sorted(Path("raw").glob("*.pdf"))
        if not files:
            sys.exit("Нет PDF. Укажи: --check raw/*.pdf")
        check(files); return
    if not args.aufgaben:
        ap.error("нужен --aufgaben (или --check / --list-models)")
    run(args)


if __name__ == "__main__":
    main()
