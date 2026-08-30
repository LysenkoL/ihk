#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
normalize.py — приводит любой exams/<id>.json к канонической схеме v2.

Схема v2:
  examId, schemaVersion=2
  meta{title, part, year, season, durationMinutes, maxPoints, sourceFiles}
  situation{text, assets[]}
  attachments[]
  tasks[ {id, number, label, intro, maxPoints, subtasks[...]} ]
  gradingScale
  subtask{ id, label, fullLabel, groupLabel, groupIntro, prompt, maxPoints,
           answerType, topics[], solution{text,extractionConfidence},
           sourcePage, assets[], pageImage, placeholder, needsReview }

  python tools/normalize.py                 # все экзамены
  python tools/normalize.py ap1-2025-f      # один
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", "topics.override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")


def norm_solution(s):
    if s is None:
        return None
    if isinstance(s, str):
        return {"text": s.strip(), "extractionConfidence": "unknown"} if s.strip() else None
    if isinstance(s, dict):
        t = (s.get("text") or "").strip()
        if not t:
            return None
        out = {"text": t, "extractionConfidence": s.get("extractionConfidence") or "unknown"}
        if s.get("image"):
            out["image"] = s["image"]
        if s.get("solutionPage"):
            out["solutionPage"] = s["solutionPage"]
        return out
    return None


def norm_exam(path: Path):
    d = json.loads(path.read_text(encoding="utf-8"))
    exam_id = d.get("examId") or path.stem
    meta = dict(d.get("meta") or {})
    meta["maxPoints"] = meta.get("maxPoints") or meta.get("totalPoints") or 100
    meta.pop("totalPoints", None)
    meta.setdefault("durationMinutes", 90)
    meta.setdefault("part", "AP1")

    tasks_in = d.get("tasks") or []

    # ---- Ausgangssituation ----
    sit = d.get("situation")
    if isinstance(sit, str):
        sit = {"text": sit, "assets": []}
    if not sit or not (sit.get("text") or "").strip():
        # старый формат: общая ситуация лежит в первой Aufgabe
        first = tasks_in[0] if tasks_in else {}
        txt = (first.get("situation") or "").strip()
        sit = {"text": txt, "assets": []}
        if txt:
            first["situation"] = ""       # чтобы не дублировать в intro
    sit.setdefault("assets", [])

    warn = []
    tasks_out = []
    for i, t in enumerate(tasks_in, 1):
        num = t.get("number")
        if not isinstance(num, int):
            m = re.search(r"\d+", str(t.get("id") or t.get("label") or t.get("title") or i))
            num = int(m.group()) if m else i
        intro = (t.get("intro") or t.get("situation") or "").strip()
        subs_out = []
        for s in t.get("subtasks") or []:
            label = (s.get("label") or "").strip()
            sid = s.get("id") or f"{num}{re.sub(r'[^a-z0-9]', '', label.lower())}"
            full = (s.get("fullLabel") or f"{num} {label}").strip()
            assets = []
            for a in s.get("assets") or []:
                f = a.get("file")
                if f and not (ROOT / f).exists():
                    warn.append(f"нет файла {f} (у {full})")
                    continue
                assets.append(a)
            page_img = s.get("pageImage")
            if page_img and not (ROOT / page_img).exists():
                warn.append(f"нет страницы {page_img} (у {full})")
                page_img = None
            sol = norm_solution(s.get("solution"))
            if sol is None:
                warn.append(f"нет решения у {full}")
            mp = s.get("maxPoints")
            if not mp:
                warn.append(f"нет баллов у {full}")
            subs_out.append({
                "id": sid,
                "label": label,
                "fullLabel": full,
                "groupLabel": s.get("groupLabel"),
                "groupIntro": s.get("groupIntro"),
                "prompt": (s.get("prompt") or "").strip(),
                "maxPoints": mp or 0,
                "answerType": s.get("answerType") or "text",
                "topics": s.get("topics") or [],
                "solution": sol,
                "sourcePage": s.get("sourcePage"),
                "assets": assets,
                "pageImage": page_img,
                "placeholder": s.get("placeholder"),
                "needsReview": bool(s.get("needsReview")),
                # поля, которые проставляют другие скрипты — не терять
                "katalog": s.get("katalog") or {"status": None},
                "pruefung": s.get("pruefung") or {"zahlen": [], "begriffe": []},
                "felder": s.get("felder") or [],
                "netzplan": s.get("netzplan"),
            })
        tasks_out.append({
            "id": f"a{num}",
            "number": num,
            "label": f"Aufgabe {num}",
            "intro": intro,
            "maxPoints": t.get("maxPoints") or sum(x["maxPoints"] for x in subs_out),
            "subtasks": subs_out,
        })

    total = sum(s["maxPoints"] for t in tasks_out for s in t["subtasks"])
    if total != meta["maxPoints"]:
        warn.append(f"сумма баллов {total} != {meta['maxPoints']}")

    out = {
        "schemaVersion": 2,
        "examId": exam_id,
        "meta": meta,
        "situation": sit,
        "attachments": d.get("attachments") or [],
        "tasks": tasks_out,
        "gradingScale": d.get("gradingScale") or "ihk-100",
    }
    return out, warn, total


def main():
    want = set(sys.argv[1:])
    files = [p for p in sorted(EXAMS.glob("*.json"))
             if not any(p.name.endswith(s) for s in SKIP)]
    if want:
        files = [p for p in files if p.stem in want]
    if not files:
        print("нечего нормализовать");  return
    for p in files:
        out, warn, total = norm_exam(p)
        p.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        n_sub = sum(len(t["subtasks"]) for t in out["tasks"])
        print(f"{p.stem:16} Aufgaben={len(out['tasks'])} Teilaufgaben={n_sub:3} BE={total:3}"
              f"  {'OK' if not warn else str(len(warn)) + ' замечаний'}")
        for w in warn[:12]:
            print("   ·", w)


if __name__ == "__main__":
    main()
