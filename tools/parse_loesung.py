#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
parse_loesung.py — вытаскивает Musterlösungen из PDF с нормальным текстовым слоем.

Формат ZPA («Lösungshinweise»):
    1. Aufgabe (25 Punkte)
    a)   4 Punkte
    ...текст...
    ba)  2 Punkte

  python tools/parse_loesung.py raw/ap1-2021-h-loesung.pdf -o exams/ap1-2021-h.loesung.json
"""
import argparse, json, re, sys
from pathlib import Path
import pymupdf

RE_AUFG = re.compile(r"^\s*(\d{1,2})\.\s*Aufgabe\s*\((\d{1,3})\s*Punkte?\)", re.I)
RE_SUB  = re.compile(r"^\s*([a-z]{1,2})\)\s*\t?\s*(\d{1,2}(?:[.,]\d)?)\s*Punkte?\b", re.I)
MUELL   = re.compile(r"^(ZPA\s*IT\s*\d+|Seite\s*\d+|\d+)\s*$", re.I)


def saeubern(zeilen):
    out = []
    for z in zeilen:
        z = z.replace("\t", " ").rstrip()
        z = re.sub(r"^\s*[–—-]\s*$", "", z)      # одинокий дефис списка
        if MUELL.match(z.strip()):
            continue
        out.append(z)
    # склеиваем "– \n Текст" обратно в "– Текст"
    txt = "\n".join(out)
    txt = re.sub(r"\n{3,}", "\n\n", txt)
    return txt.strip()


def parse(pdf_path: Path):
    doc = pymupdf.open(pdf_path)
    zeilen = []                       # (текст, номер страницы)
    for nr, p in enumerate(doc, 1):
        zeilen += [(z, nr) for z in p.get_text().split("\n")]

    aufgaben, akt_a, akt_s, puffer = [], None, None, []

    def schliesse():
        if akt_s is not None:
            akt_s["text"] = saeubern(puffer)

    for z, seite in zeilen:
        m = RE_AUFG.match(z)
        if m:
            schliesse(); puffer.clear(); akt_s = None
            akt_a = {"number": int(m.group(1)), "maxPoints": int(m.group(2)), "subtasks": []}
            aufgaben.append(akt_a)
            continue
        m = RE_SUB.match(z)
        if m and akt_a is not None:
            schliesse(); puffer.clear()
            akt_s = {"label": m.group(1).lower() + ")",
                     "maxPoints": float(m.group(2).replace(",", ".")),
                     "text": "", "seite": seite}
            if akt_s["maxPoints"].is_integer():
                akt_s["maxPoints"] = int(akt_s["maxPoints"])
            akt_a["subtasks"].append(akt_s)
            continue
        if akt_s is not None:
            puffer.append(z)
    schliesse()

    # выкидываем всё до первой Aufgabe (общие корректорские указания)
    aufgaben = [a for a in aufgaben if a["subtasks"]]

    # родительские метки: "a) 9 Punkte" + "aa) 6" + "ab) 3" -> оставляем только детей,
    # текст родителя (если он есть) уходит в groupIntro первого ребёнка
    for a in aufgaben:
        subs, raus = a["subtasks"], []
        for i, s0 in enumerate(subs):
            eltern = s0["label"][:-1]
            if len(eltern) != 1:
                continue
            kinder = [x for x in subs[i+1:] if len(x["label"]) == 3 and x["label"].startswith(eltern)]
            if kinder and abs(sum(k["maxPoints"] for k in kinder) - s0["maxPoints"]) < 0.01:
                if s0["text"].strip():
                    kinder[0]["groupIntro"] = s0["text"].strip()
                    kinder[0]["groupLabel"] = s0["label"]
                raus.append(id(s0))
        a["subtasks"] = [x for x in subs if id(x) not in raus]
    return aufgaben


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("-o", "--out")
    a = ap.parse_args()
    auf = parse(Path(a.pdf))
    ges = sum(x["maxPoints"] for x in auf)
    sub = sum(len(x["subtasks"]) for x in auf)
    sub_be = sum(s["maxPoints"] for x in auf for s in x["subtasks"])
    print(f"{Path(a.pdf).name}: Aufgaben={len(auf)} Teilaufgaben={sub} "
          f"BE(Aufgaben)={ges} BE(Teilaufgaben)={sub_be}")
    for x in auf:
        print("  %d. Aufgabe (%d BE): %s" % (
            x["number"], x["maxPoints"],
            " ".join(f"{s['label']}{s['maxPoints']}" for s in x["subtasks"])))
    if ges != sub_be:
        print("  ! суммы не сходятся — проверь глазами", file=sys.stderr)
    if a.out:
        Path(a.out).write_text(json.dumps(auf, ensure_ascii=False, indent=2), encoding="utf-8")
        print("→", a.out)


if __name__ == "__main__":
    main()
