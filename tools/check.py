#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check.py — проверяет все экзамены перед сборкой exams.js.

Ловит: битые ссылки на картинки, пропавшие решения, несходящиеся баллы,
подзадачи без темы, дубли id.

  python tools/check.py
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", "topics.override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")

fehler = warnungen = 0
for p in sorted(EXAMS.glob("*.json")):
    if any(p.name.endswith(s) for s in SKIP):
        continue
    d = json.loads(p.read_text(encoding="utf-8"))
    probleme = []
    ids, be, n = set(), 0, 0

    if d.get("schemaVersion") != 2:
        probleme.append(("ОШИБКА", f"схема v{d.get('schemaVersion')} — прогони normalize.py"))
    if not (d.get("situation") or {}).get("text"):
        probleme.append(("предупр", "нет Ausgangssituation"))

    for t in d["tasks"]:
        for s in t["subtasks"]:
            n += 1
            be += s.get("maxPoints") or 0
            if s["id"] in ids:
                probleme.append(("ОШИБКА", f"дубль id {s['id']}"))
            ids.add(s["id"])
            if not (s.get("prompt") or "").strip():
                probleme.append(("ОШИБКА", f"{s['fullLabel']}: пустой вопрос"))
            if not s.get("maxPoints"):
                probleme.append(("ОШИБКА", f"{s['fullLabel']}: нет баллов"))
            if not (s.get("solution") or {}).get("text"):
                probleme.append(("предупр", f"{s['fullLabel']}: нет решения"))
            if not s.get("topics"):
                probleme.append(("предупр", f"{s['fullLabel']}: нет темы"))
            for a in s.get("assets") or []:
                if not (ROOT / a["file"]).exists():
                    probleme.append(("ОШИБКА", f"{s['fullLabel']}: нет {a['file']}"))
            for feld in ("pageImage",):
                v = s.get(feld)
                if v and not (ROOT / v).exists():
                    probleme.append(("ОШИБКА", f"{s['fullLabel']}: нет {v}"))
            bild = (s.get("solution") or {}).get("image")
            if bild and not (ROOT / bild).exists():
                probleme.append(("ОШИБКА", f"{s['fullLabel']}: нет {bild}"))

    soll = d["meta"].get("maxPoints", 100)
    if be != soll:
        probleme.append(("ОШИБКА", f"сумма баллов {be} != {soll}"))

    e = sum(1 for k, _ in probleme if k == "ОШИБКА")
    w = len(probleme) - e
    fehler += e
    warnungen += w
    status = "OK" if not probleme else f"{e} ошибок, {w} предупреждений"
    print(f"{p.stem:14} {n:3} Teilaufgaben  {be:3} BE   {status}")
    for k, m in probleme[:10]:
        print(f"    {k}: {m}")

print()
print(f"Итого: {fehler} ошибок, {warnungen} предупреждений")
sys.exit(1 if fehler else 0)
