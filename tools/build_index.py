#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_index.py — собирает все exams/*.json в один exams/exams.js.

Зачем: index.html открывается двойным кликом (file://), а из file:// браузер
запрещает fetch() к локальным файлам. <script src> — можно. Поэтому данные
кладём в JS-файл, а не грузим по сети.

Запускай после каждого изменения экзаменов:
    python tools/build_index.py
"""
import json, sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", ".override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")

TOPIC_LABELS = {
    "projekt": "Projekt & Planung",
    "kalkulation": "Kalkulation & Wirtschaft",
    "netzwerk": "Netzwerk",
    "itsicherheit": "IT-Sicherheit",
    "datenschutz": "Datenschutz & Recht",
    "hardware": "Hardware & Peripherie",
    "software": "Software & Betrieb",
    "daten": "Daten & Formate",
    "arbeitsplatz": "Arbeitsplatz & Ergonomie",
    "ki": "KI & Digitalisierung",
    "programmierung": "Programmierung & Logik",
    "kommunikation": "Beratung & Doku",
    "sonstiges": "Sonstiges",
}


def main():
    exams = []
    for p in sorted(EXAMS.glob("*.json")):
        if any(p.name.endswith(s) for s in SKIP):
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        if d.get("schemaVersion") != 2:
            print(f"  ! {p.name}: схема v{d.get('schemaVersion')} — прогони tools/normalize.py")
            continue
        exams.append(d)

    exams.sort(key=lambda d: (d["meta"].get("year", 0),
                              0 if d["meta"].get("season", "").startswith("Früh") else 1),
               reverse=True)

    def lade(name, default):
        f = EXAMS / name
        return json.loads(f.read_text(encoding="utf-8")) if f.exists() else default

    cards   = lade("cards.json", {"karten": []})
    luecken = lade("luecken.json", {"themen": []})
    katalog  = lade("katalog.json", {})
    gewichte = lade("gewichte.json", {})

    js = ("// сгенерировано tools/build_index.py — руками не править\n"
          "window.IHK_TOPICS  = " + json.dumps(TOPIC_LABELS, ensure_ascii=False, indent=2) + ";\n"
          "window.IHK_KATALOG = " + json.dumps(
              {"quelle": katalog.get("quelle"), "stand": katalog.get("stand"),
               "referenz": katalog.get("referenz")},
              ensure_ascii=False) + ";\n"
          "window.IHK_GEWICHTE = " + json.dumps(gewichte, ensure_ascii=False) + ";\n"
          "window.IHK_CARDS   = " + json.dumps(cards.get("karten", []), ensure_ascii=False) + ";\n"
          "window.IHK_LUECKEN = " + json.dumps(luecken.get("themen", []), ensure_ascii=False) + ";\n"
          "window.IHK_EXAMS   = " + json.dumps(exams, ensure_ascii=False) + ";\n")
    (EXAMS / "exams.js").write_text(js, encoding="utf-8")

    n_sub = sum(len(t["subtasks"]) for d in exams for t in d["tasks"])
    veraltet = sum(1 for d in exams for t in d["tasks"] for s in t["subtasks"]
                   if (s.get("katalog") or {}).get("status") == "veraltet")
    print(f"exams/exams.js: {len(exams)} экзаменов, {n_sub} Teilaufgaben "
          f"(из них {veraltet} вне каталога), {len(cards.get('karten', []))} карточек, "
          f"{(EXAMS / 'exams.js').stat().st_size // 1024} КБ")
    for d in exams:
        m = d["meta"]
        print(f"   {d['examId']:14} {m.get('season','')} {m.get('year','')}  "
              f"{sum(len(t['subtasks']) for t in d['tasks'])} Teilaufgaben")


if __name__ == "__main__":
    main()
