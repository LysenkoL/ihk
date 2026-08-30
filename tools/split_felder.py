#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
split_felder.py — превращает задания-таблицы в набор отдельных полей ввода.

Многие Teilaufgaben — это таблица, которую надо заполнить («Vorteil/Nachteil
für vier Modelle», «Schutzziel + Begründung für fünf Maßnahmen»). Сейчас на
всё одно текстовое поле и одна оценка 0–N: непонятно, что именно не сошлось.

Скрипт находит такие задания и проставляет поле "felder":
    [{"label": "Notebook — Vorteil"}, {"label": "Notebook — Nachteil"}, ...]

Интерфейс тогда рисует отдельную строку ввода на каждый пункт.

  python tools/split_felder.py            # показать предложения
  python tools/split_felder.py --apply    # записать в exams/*.json
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", "topics.override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")

RE_TABELLE = re.compile(r"^\s*(.{2,60}?)\s*\|\s*(.+?)\s*$")
RE_NUMMER  = re.compile(r"^\s*(\d{1,2})[.)]\s+(.{3,90}?)\s*(?:—|–|-\s|:)\s*\??\s*$")
RE_SPIEGEL = re.compile(r"^\s*([A-ZÄÖÜ][\wÄÖÜäöüß /()\.\-]{2,40})\s*:\s*$")
# подписи-ловушки: это начало предложения, а не поле для ответа
SATZANFANG = re.compile(r"^(Es |Hinweis|Manual|Note|Beispiel|Gegeben|Vorgegeben|"
                        r"Erstelltes|Tabelle|Angaben|Quelle|Aufgabe)", re.I)


def felder_aus_prompt(prompt):
    zeilen = [z.rstrip() for z in (prompt or "").split("\n")]
    # --- вариант 1: настоящая таблица со столбцами через | ---
    tab = [z for z in zeilen if z.count("|") >= 1 and len(z.strip()) > 5]
    if len(tab) >= 3:
        kopf = RE_TABELLE.match(tab[0])
        if kopf:
            spalten = [c.strip() for c in tab[0].split("|")][1:]
            felder = []
            for z in tab[1:]:
                teile = [c.strip() for c in z.split("|")]
                zeile = teile[0]
                if not zeile or zeile.lower().startswith(("nr", "---")):
                    continue
                leer = [i for i, c in enumerate(teile[1:]) if c in ("", "?")]
                if not leer:
                    continue
                for i in leer:
                    sp = spalten[i] if i < len(spalten) else f"Spalte {i+1}"
                    felder.append({"label": f"{zeile} — {sp}"})
            if 2 <= len(felder) <= 20:
                return felder, "tabelle"

    # --- вариант 2: нумерованный список пунктов, которые надо заполнить ---
    punkte = [RE_NUMMER.match(z) for z in zeilen]
    punkte = [m for m in punkte if m]
    if len(punkte) >= 3:
        felder = [{"label": f"{m.group(1)}. {m.group(2)}"} for m in punkte]
        if len(felder) <= 12:
            return felder, "liste"

    # --- вариант 3: подписи вида «Konsolenbefehl:» на отдельных строках ---
    marken = [RE_SPIEGEL.match(z) for z in zeilen]
    marken = [m for m in marken if m]
    marken = [m for m in marken
              if not SATZANFANG.match(m.group(1)) and len(m.group(1).split()) <= 4]
    if 2 <= len(marken) <= 10:
        felder = [{"label": m.group(1)} for m in marken]
        return felder, "marken"

    return None, None


def main():
    anwenden = "--apply" in sys.argv
    dateien = [p for p in sorted(EXAMS.glob("*.json"))
               if not any(p.name.endswith(s) for s in SKIP)]
    vorschlaege, n = [], 0
    for p in dateien:
        d = json.loads(p.read_text(encoding="utf-8"))
        geaendert = False
        for t in d["tasks"]:
            for s in t["subtasks"]:
                if s.get("felder"):
                    continue
                felder, art = felder_aus_prompt(s.get("prompt"))
                if not felder:
                    continue
                # баллы делим поровну, но не мельче 0,5
                be = s.get("maxPoints") or 0
                pro = round(be / len(felder) * 2) / 2
                for f in felder:
                    f["maxPoints"] = pro
                vorschlaege.append({"examId": d["examId"], "subId": s["id"],
                                    "label": s.get("fullLabel"), "art": art,
                                    "maxPoints": be,
                                    "felder": [f["label"] for f in felder]})
                n += 1
                if anwenden:
                    s["felder"] = felder
                    geaendert = True
        if anwenden and geaendert:
            p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

    (ROOT / "_work").mkdir(exist_ok=True)
    (ROOT / "_work" / "felder-vorschlag.json").write_text(
        json.dumps(vorschlaege, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Найдено заданий-таблиц: {n}"
          + ("  (записано)" if anwenden else "  (только предложение, --apply чтобы записать)"))
    for v in vorschlaege[:10]:
        print(f"  {v['examId']}:{v['subId']:5} [{v['art']}] {v['maxPoints']} BE → "
              + " / ".join(v["felder"][:4]) + ("…" if len(v["felder"]) > 4 else ""))
    print("\nПолный список: _work/felder-vorschlag.json")


if __name__ == "__main__":
    main()
