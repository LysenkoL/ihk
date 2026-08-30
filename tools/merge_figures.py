#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
merge_figures.py — приклеивает найденные схемы к тексту заданий.

Разделение труда:
  extract_figures.py  делает пиксельную работу локально (схемы, страницы)
  текст JSON          пишется отдельно (вручную, через чат или через Gemini)
  merge_figures.py    сшивает одно с другим по номеру страницы

Текстовый JSON должен содержать у каждой подзадачи "sourcePage".
Ключи "assets", "pageImage", "id" проставляются здесь.

  python merge_figures.py exams/ap1-2026-f.text.json exams/ap1-2026-f.figures.json
  python merge_figures.py ... --out exams/ap1-2026-f.json --minutes 90
"""

import argparse
import json
import re
from pathlib import Path

DIAGRAM_HINTS = (
    "er-modell", "er-diagramm", "entity-relationship", "datenmodell",
    "netzplan", "netzwerkplan", "topologie", "skizzieren", "zeichnen",
    "diagramm", "struktogramm", "flussdiagramm", "pap", "uml",
    "klassendiagramm", "mockup", "wireframe", "grafisch", "ergänzen sie",
    "tragen sie", "verbinden sie", "füllen sie",
)


def looks_like_diagram(t):
    low = (t or "").lower()
    return any(h in low for h in DIAGRAM_HINTS)


def main():
    ap = argparse.ArgumentParser(description="Сшивка текста и схем")
    ap.add_argument("text_json")
    ap.add_argument("figures_json")
    ap.add_argument("--out")
    ap.add_argument("--minutes", type=int)
    ap.add_argument("--max-points", type=int)
    ap.add_argument("--attach", choices=["page", "nearest", "all"], default="nearest",
                    help="page: все схемы страницы; nearest: только те, что ниже "
                         "начала подзадачи; all: без фильтра")
    args = ap.parse_args()

    data = json.loads(Path(args.text_json).read_text(encoding="utf-8"))
    figs = json.loads(Path(args.figures_json).read_text(encoding="utf-8"))

    by_page = {}
    for f in figs.get("figures", []):
        by_page.setdefault(int(f["sourcePage"]), []).append(f)
    for v in by_page.values():
        v.sort(key=lambda f: f["box"][1])
    page_images = {int(k): v for k, v in figs.get("pageImages", {}).items()}

    # порядок подзадач на странице → чтобы делить схемы между ними
    flat = [(t, s) for t in data["tasks"] for s in t["subtasks"]]
    order = {}
    for t, s in flat:
        order.setdefault(int(s.get("sourcePage", 0)), []).append(s)

    used = set()
    n_att = 0
    for t, s in flat:
        page = int(s.get("sourcePage", 0))
        lbl = s.get("label", "")
        s["id"] = re.sub(r"\W+", "_", f"{t.get('number', t['id'])}{lbl}").strip("_")
        s["fullLabel"] = f"{t.get('number', '')} {lbl}".strip()

        cands = by_page.get(page, [])
        if args.attach == "nearest":
            siblings = order.get(page, [])
            idx = siblings.index(s)
            # схемы делим по порядку: каждой подзадаче — ещё не занятые
            cands = [f for f in cands if id(f) not in used]
            if idx < len(siblings) - 1 and len(cands) > 1:
                cands = cands[:max(1, len(cands) // (len(siblings) - idx))]
        s["assets"] = [{"id": f["id"], "file": f["file"], "sourcePage": f["sourcePage"],
                        "width": f["width"], "height": f["height"]} for f in cands]
        for f in cands:
            used.add(id(f))
        n_att += len(s["assets"])

        diagram = looks_like_diagram(s.get("prompt")) or s.get("answerType") == "diagram"
        s["answerType"] = "diagram" if diagram else s.get("answerType", "text")
        if s["assets"] or diagram:
            s["pageImage"] = page_images.get(page)
        s.setdefault("solution", None)
        s.setdefault("placeholder", None)
        s["needsReview"] = diagram and not s["assets"]

    total = sum(x["maxPoints"] or 0 for _, x in flat)
    meta = data.setdefault("meta", {})
    meta.setdefault("durationMinutes", args.minutes or 90)
    meta["maxPoints"] = args.max_points or meta.get("maxPoints") or total or 100
    meta["detectedPoints"] = total
    data.setdefault("schemaVersion", 1)
    data.setdefault("attachments", [])
    data.setdefault("gradingScale", "ihk-100")

    out = Path(args.out or Path(args.text_json).with_suffix("").with_suffix(".json"))
    if out.resolve() == Path(args.text_json).resolve():
        out = out.with_name(out.stem + ".merged.json")
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"→ {out}")
    print(f"  подзадач: {len(flat)}   схем привязано: {n_att}   баллов: {total}")
    miss = [s['fullLabel'] for _, s in flat if s['needsReview']]
    if miss:
        print(f"  ⚠ без схемы, хотя похоже на графику: {', '.join(miss)}")


if __name__ == "__main__":
    main()
