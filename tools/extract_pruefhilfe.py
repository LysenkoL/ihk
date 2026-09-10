#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract_pruefhilfe.py — готовит данные для офлайн-проверки ответа.

Никакого API. Из Musterlösung вытаскивается два набора:
  zahlen   — числа с единицами («448 Mbit/s», «81,59 EUR»)
  begriffe — ключевые термины, отранжированные по редкости в корпусе
             (термин, встречающийся в 100 решениях, ничего не проверяет;
              термин из трёх решений — проверяет)

Результат ложится в поле "pruefung" каждой Teilaufgabe. Интерфейс потом
сверяет их с тем, что ты написала, и предлагает балл.

  python tools/extract_pruefhilfe.py
"""
import json, math, re, sys
from collections import Counter
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", ".override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")

STOP = set("""
alle also andere anderen auch auf aus bei beim bzw dabei damit dann das dass dazu
dem den der des die dies diese diesem diesen dieser dieses doch dort durch ein eine
einem einen einer eines etc etwa für gibt hat haben hier ihre ihren ist kann können
man mehr muss müssen nach nicht noch nur oder ohne sein seine sich sie sind sowie
über und uns unter viel vom von vor wenn werden wird wie wird wobei zum zur zwei
zwischen z.b beispiel beispielsweise möglich mögliche möglichen lösung lösungen
punkt punkte antwort antworten aufgabe nennung nennen nennt weitere weiteren
richtig richtige folgende folgenden jeweils sowohl daher somit ggf usw sonstige
andere alternativ alternativlösung teilpunkte korrektor prüfer hinweis hinweise
""".split())

RE_ZAHL = re.compile(
    r"(?<![\w.,])(\d{1,3}(?:[.\s]\d{3})*(?:,\d+)?|\d+(?:[.,]\d+)?)\s*"
    r"(EUR|€|Euro|W\b|Watt|kWh|mA|A\b|V\b|Mbit/s|MBit/s|Gbit/s|kbit/s|bit|Byte|"
    r"KiB|MiB|GiB|TiB|KB|MB|GB|TB|%|Monate?|Tage?|Stunden?|Minuten?|Sekunden?|"
    r"Punkte?|Stück|dpi|Hz|GHz|MHz)\b", re.I)

RE_TECH = re.compile(r"\b(?:[A-Z]{2,6}\d*|\d+\.\d+[a-z]{0,3}|IPv[46]|802\.\d+[a-z]*|"
                     r"RAID\s*\d|Cat\s*\d[a-z]?|USB-?[A-C0-9.]+)\b")
# слово или связка «Прилагательное Существительное» целиком
RE_NOMEN = re.compile(
    r"\b[A-ZÄÖÜ][a-zäöüß]{3,}(?:-[A-ZÄÖÜa-zäöüß]{2,})*"
    r"(?:[ \t]+[A-ZÄÖÜ][a-zäöüß]{3,}(?:-[A-ZÄÖÜa-zäöüß]{2,})*)?\b")
# одинокое прилагательное без существительного проверять нечего
RE_ADJEKTIV = re.compile(r"^[A-ZÄÖÜ][a-zäöüß]*"
                         r"(liche|lichen|ische|ischen|bare|baren|ige|igen|"
                         r"elle|ellen|ive|iven|same|samen|ende|enden)$")


def zahl_wert(s):
    s = s.replace(" ", "").replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def kandidaten(text):
    """термины-кандидаты из текста решения"""
    k = set()
    for m in RE_TECH.finditer(text):
        w = m.group(0).strip()
        if len(w) >= 2:
            k.add(w)
    for m in RE_NOMEN.finditer(text):
        w = " ".join(m.group(0).split())
        if w.lower() in STOP or len(w) < 5:
            continue
        if " " not in w and RE_ADJEKTIV.match(w):
            continue                      # «Zeitliche» без «Begrenzung» — мусор
        teile = w.split()
        if len(teile) == 2 and teile[1].lower() in STOP:
            w = teile[0]
        if w.lower() in STOP or (" " not in w and RE_ADJEKTIV.match(w)):
            continue
        k.add(w)
    return k


def main():
    dateien = [p for p in sorted(EXAMS.glob("*.json"))
               if not any(p.name.endswith(s) for s in SKIP)]
    docs = []   # (datei, task, sub, text, kandidaten)
    daten = {}
    for p in dateien:
        d = json.loads(p.read_text(encoding="utf-8"))
        daten[p] = d
        for t in d["tasks"]:
            for s in t["subtasks"]:
                txt = (s.get("solution") or {}).get("text") or ""
                docs.append((p, s, txt, kandidaten(txt)))

    # насколько термин редкий: чем в меньшем числе решений встречается, тем ценнее
    df = Counter()
    for _, _, _, k in docs:
        df.update(k)
    N = max(1, len(docs))

    stat = Counter()
    for p, s, txt, kand in docs:
        zahlen = []
        gesehen = set()
        for m in RE_ZAHL.finditer(txt):
            roh = m.group(0).strip()
            w = zahl_wert(m.group(1))
            if w is None or roh.lower() in gesehen:
                continue
            gesehen.add(roh.lower())
            zahlen.append({"text": roh, "wert": w, "einheit": m.group(2)})
        zahlen = zahlen[:12]

        bewertet = sorted(
            ((w, math.log(N / df[w])) for w in kand if df[w] <= N * 0.25),
            key=lambda x: -x[1])
        begriffe = [w for w, _ in bewertet[:8]]

        s["pruefung"] = {"zahlen": zahlen, "begriffe": begriffe}
        stat["mit_zahlen"] += 1 if zahlen else 0
        stat["mit_begriffen"] += 1 if begriffe else 0
        stat["gesamt"] += 1

    for p, d in daten.items():
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Teilaufgaben: {stat['gesamt']}")
    print(f"  с числами для сверки:   {stat['mit_zahlen']}")
    print(f"  с терминами для сверки: {stat['mit_begriffen']}")
    beispiel = docs[0][1]
    print("\nПример:", beispiel["id"])
    print("  zahlen:  ", [z["text"] for z in beispiel["pruefung"]["zahlen"]])
    print("  begriffe:", beispiel["pruefung"]["begriffe"])


if __name__ == "__main__":
    main()
