#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
render_loesung.py — рендерит страницы Lösungs-PDF в PNG.

Нужно там, где эталонный ответ — рисунок (Netzplan, ERD, UML): текста
у него нет, показать можно только картинкой.

  python tools/render_loesung.py ap1-2023-h
  python tools/render_loesung.py --alle
"""
import argparse, sys
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parent.parent


def render(exam_id, dpi=150):
    pdf = ROOT / "raw" / f"{exam_id}-loesung.pdf"
    if not pdf.exists():
        print(f"  нет {pdf.name}"); return 0
    doc = pymupdf.open(pdf)
    out = ROOT / "assets"
    out.mkdir(exist_ok=True)
    n = 0
    for i, page in enumerate(doc, 1):
        ziel = out / f"{exam_id}_loesung_{i:02d}.png"
        if ziel.exists():
            continue
        page.get_pixmap(dpi=dpi).save(ziel)
        n += 1
    print(f"  {exam_id}: {len(doc)} страниц ({n} новых)")
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("exam_id", nargs="?")
    ap.add_argument("--alle", action="store_true")
    ap.add_argument("--dpi", type=int, default=150)
    a = ap.parse_args()
    if a.alle:
        ids = sorted({p.name.replace("-loesung.pdf", "")
                      for p in (ROOT / "raw").glob("*-loesung.pdf")})
    elif a.exam_id:
        ids = [a.exam_id]
    else:
        sys.exit("укажи exam-id или --alle")
    for e in ids:
        render(e, a.dpi)


if __name__ == "__main__":
    main()
