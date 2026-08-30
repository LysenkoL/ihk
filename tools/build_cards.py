#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_cards.py — делает флешкарты из 279 эталонных решений.

Два типа:
  begriff — строки вида «Trojaner: eingebettet in nützliche Software»
  frage   — короткая Teilaufgabe целиком: вопрос → эталон

Задания, помеченные как veraltet, в карточки не попадают.

  python tools/build_cards.py                 # → exams/cards.json
  python tools/build_cards.py --anki out.tsv  # + файл для импорта в Anki
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", "topics.override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")

RE_DEF = re.compile(r"^\s*[–—\-•*]?\s*([A-ZÄÖÜ][\wÄÖÜäöüß /()\.\-]{2,45}?)\s*[:–—]\s+(.{15,400})$")
RE_KURZFRAGE = re.compile(r"^(nennen|erklären|beschreiben|erläutern|benennen|geben sie an)", re.I)
MUELL = re.compile(r"^(z\.?\s?b|beispiel|hinweis|lösung|alternativ|weitere|andere|"
                   r"vorteil|nachteil|punkte?|aufgabe|mögliche)", re.I)


def saubere_zeilen(text):
    for z in (text or "").split("\n"):
        z = z.strip()
        if 20 <= len(z) <= 420:
            yield z


def main():
    karten, gesehen = [], set()
    dateien = [p for p in sorted(EXAMS.glob("*.json"))
               if not any(p.name.endswith(s) for s in SKIP)]

    for p in dateien:
        d = json.loads(p.read_text(encoding="utf-8"))
        jahr = f"{d['meta'].get('season','')} {d['meta'].get('year','')}".strip()
        for t in d["tasks"]:
            for s in t["subtasks"]:
                if (s.get("katalog") or {}).get("status") == "veraltet":
                    continue
                sol = (s.get("solution") or {}).get("text") or ""
                if not sol.strip():
                    continue
                herkunft = {"examId": d["examId"], "subId": s["id"],
                            "label": s.get("fullLabel"), "jahr": jahr,
                            "topics": s.get("topics") or []}

                # 1) определения внутри решения
                for z in saubere_zeilen(sol):
                    m = RE_DEF.match(z)
                    if not m:
                        continue
                    vorne, hinten = m.group(1).strip(), m.group(2).strip()
                    if MUELL.match(vorne) or len(vorne.split()) > 5 or len(vorne) < 4:
                        continue
                    # рассчёт, а не определение: «7,53 EUR - 4,26 EUR = 3,27 EUR»
                    woerter = re.findall(r"[A-Za-zÄÖÜäöüß]{3,}", hinten)
                    ziffern = len(re.findall(r"\d", hinten))
                    if len(woerter) < 4 or ziffern > len(hinten) * 0.25:
                        continue
                    if re.search(r"[=*/]|\d\s*[+\-]\s*\d", hinten):
                        continue
                    key = vorne.lower()
                    if key in gesehen:
                        continue
                    gesehen.add(key)
                    karten.append({"typ": "begriff", "vorne": vorne,
                                   "hinten": hinten, **herkunft})

                # 2) короткий вопрос целиком
                prompt = (s.get("prompt") or "").strip()
                letzte = prompt.split("\n")[-1].strip()
                if (s.get("maxPoints") or 0) <= 4 and len(sol) <= 500 \
                        and RE_KURZFRAGE.match(letzte) and len(letzte) <= 220:
                    key = letzte.lower()[:80]
                    if key not in gesehen:
                        gesehen.add(key)
                        karten.append({"typ": "frage", "vorne": letzte,
                                       "hinten": sol.strip(), **herkunft})

    (EXAMS / "cards.json").write_text(
        json.dumps({"karten": karten}, ensure_ascii=False, indent=2), encoding="utf-8")

    nach_typ = {}
    for k in karten:
        nach_typ[k["typ"]] = nach_typ.get(k["typ"], 0) + 1
    print(f"exams/cards.json: {len(karten)} карточек ({nach_typ})")

    if "--anki" in sys.argv:
        ziel = Path(sys.argv[sys.argv.index("--anki") + 1])
        zeilen = []
        for k in karten:
            v = k["vorne"].replace("\t", " ").replace("\n", "<br>")
            h = k["hinten"].replace("\t", " ").replace("\n", "<br>")
            tags = " ".join(["IHK-AP1"] + k["topics"])
            zeilen.append(f"{v}\t{h}\t{tags}")
        ziel.write_text("\n".join(zeilen), encoding="utf-8")
        print(f"→ {ziel}  (в Anki: Datei → Importieren, Trennzeichen Tab)")

    print("\nПримеры:")
    for k in karten[:5]:
        print(f"  [{k['typ']}] {k['vorne']}  →  {k['hinten'][:70]}…")


if __name__ == "__main__":
    main()
