#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
assemble.py — сшивает готовый экзамен из трёх кусков:

  exams/<id>.text.json      тексты заданий (распознанные)
  <id>.loesung.json         Musterlösungen + баллы (tools/parse_loesung.py)
  exams/<id>.figures.json   вырезанные схемы (tools/extract_figures.py)
      ↓
  exams/<id>.json           то, что читает симулятор

  python tools/assemble.py ap1-2021-h
  python tools/assemble.py ap1-2021-h --loesung _work/ap1-2021-h.loesung.json
"""
import argparse, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"

DIAGRAMM = ("er-modell", "er-diagramm", "netzplan", "topologie", "skizzieren",
            "zeichnen", "struktogramm", "flussdiagramm", "pap", "uml",
            "klassendiagramm", "mockup", "wireframe", "tragen sie",
            "markieren sie", "verbinden sie", "ergänzen sie")


def lade(p: Path):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("exam_id")
    ap.add_argument("--text")
    ap.add_argument("--loesung")
    ap.add_argument("--figures")
    ap.add_argument("--out")
    a = ap.parse_args()
    eid = a.exam_id

    text = lade(Path(a.text or EXAMS / f"{eid}.text.json"))
    if not text:
        raise SystemExit(f"нет текстов: exams/{eid}.text.json")
    loes = lade(Path(a.loesung or ROOT / "_work" / f"{eid}.loesung.json")) or []
    figs = lade(Path(a.figures or EXAMS / f"{eid}.figures.json")) or {"figures": []}

    # решения по (номер Aufgabe, метка)
    sol = {}
    for auf in loes:
        for s in auf["subtasks"]:
            sol[(auf["number"], s["label"].lower())] = s

    # схемы по страницам
    proSeite = {}
    for f in figs.get("figures", []):
        proSeite.setdefault(f["sourcePage"], []).append(f)

    warn = []
    for t in text["tasks"]:
        num = t.get("number") or int(re.search(r"\d+", str(t.get("id", "0"))).group())
        for s in t["subtasks"]:
            lbl = s["label"].lower()
            treffer = sol.get((num, lbl))
            if treffer:
                s["maxPoints"] = treffer["maxPoints"]
                txt = (treffer.get("text") or "").strip()
                bild = None
                ls = treffer.get("seite")
                if ls:
                    kand = ROOT / "assets" / f"{eid}_loesung_{ls:02d}.png"
                    if kand.exists():
                        bild = f"assets/{eid}_loesung_{ls:02d}.png"
                if not txt and bild:
                    txt = "Die Musterlösung liegt nur als Abbildung vor — siehe Lösungsseite unten."
                    warn.append(f"{num}{lbl}: решение только картинкой (Lösung S.{ls})")
                elif not txt:
                    warn.append(f"{num}{lbl}: пустое решение")
                s["solution"] = {"text": txt, "extractionConfidence": "high",
                                 "image": bild, "solutionPage": ls}
                if treffer.get("groupIntro") and not s.get("groupIntro"):
                    s["groupIntro"] = treffer["groupIntro"]
                    s["groupLabel"] = treffer.get("groupLabel")
            else:
                warn.append(f"{num}{lbl}: нет решения в Lösungs-PDF")
                s.setdefault("maxPoints", 0)
                s.setdefault("solution", None)

            s["id"] = f"{num}{re.sub(r'[^a-z0-9]', '', lbl)}"
            s["fullLabel"] = f"{num} {s['label']}"
            p = s.get("sourcePage")
            s["assets"] = [{"id": f["id"], "file": f["file"], "sourcePage": f["sourcePage"],
                            "width": f.get("width"), "height": f.get("height")}
                           for f in proSeite.get(p, [])]
            seite = ROOT / "assets" / f"{eid}_seite_{p:02d}.png" if p else None
            s["pageImage"] = f"assets/{eid}_seite_{p:02d}.png" if seite and seite.exists() else None
            if s.get("answerType") in (None, "text"):
                low = (s.get("prompt") or "").lower()
                if any(w in low for w in DIAGRAMM):
                    s["answerType"] = "diagram"
            s.setdefault("needsReview", False)
            s.setdefault("placeholder", None)
            s.setdefault("topics", [])

    # решения, которым не нашлось задания
    genutzt = {(t.get("number"), s["label"].lower()) for t in text["tasks"] for s in t["subtasks"]}
    for k in sol:
        if k not in genutzt:
            warn.append(f"{k[0]}{k[1]}: есть решение, но нет текста задания")

    out = Path(a.out or EXAMS / f"{eid}.json")
    out.write_text(json.dumps(text, ensure_ascii=False, indent=2), encoding="utf-8")
    be = sum(s.get("maxPoints") or 0 for t in text["tasks"] for s in t["subtasks"])
    n = sum(len(t["subtasks"]) for t in text["tasks"])
    print(f"→ {out.relative_to(ROOT)}   Teilaufgaben={n}  BE={be}")
    for w in warn:
        print("   ·", w)
    if not warn:
        print("   всё сошлось")


if __name__ == "__main__":
    main()
