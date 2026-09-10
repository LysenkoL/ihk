#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tag_topics.py — проставляет темы каждой Teilaufgabe (поле "topics").

Работает по ключевым словам в тексте задания + решения.
Ручные правки складывай в exams/topics.override.json:
    { "1aa": ["netzwerk"], "2b": ["kalkulation","projekt"] }
Они всегда побеждают автоматику и переживают перезапуск.

  python tools/tag_topics.py            # все экзамены
  python tools/tag_topics.py --report   # что получилось, без записи
"""
import json, re, sys
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ROOT / "exams"
OVERRIDE = EXAMS / "topics.override.json"
SKIP = (".text.json", ".figures.json", ".report.json", ".loesung.json",
        ".topics.json", ".override.json", "katalog.json",
        "luecken.json", "cards.json", "gewichte.json", "exams.js")

TOPICS = {
    "projekt": dict(label="Projekt & Planung", words=[
        "projekt", "lastenheft", "pflichtenheft", "smart", "netzplan", "meilenstein",
        "gantt", "phasen", "kick-off", "auftraggeber", "abnahme", "teilprojekt",
        "zeitplan", "vorgang", "pufferzeit", "kritischer pfad", "stakeholder",
        "soll-ist", "projektziel", "risikoanalyse", "netzplan", "vorgangsknoten",
        "gesamtpuffer", "freier puffer", "vorgangsdauer", "projektstrukturplan"]),
    "kalkulation": dict(label="Kalkulation & Wirtschaft", words=[
        "kosten", "angebot", "preis", "rabatt", "skonto", "nutzwertanalyse",
        "amortisation", "wirtschaftlich", "investition", "leasing", "miete",
        "kauf", "tco", "euro", "netto", "brutto", "kalkul", "gewinn", "budget",
        "abschreibung", "bezugspreis", "listenpreis", "angebotsvergleich",
        "gesamtkosten", "stundensatz", "roi"]),
    "netzwerk": dict(label="Netzwerk", words=[
        "ip-adresse", "ipv4", "ipv6", "subnetz", "subnetzmaske", "vlan", "dhcp",
        "dns", "switch", "router", "wlan", "osi", "poe", "patch", "ethernet",
        "netzwerk", "lan", "wan", "gateway", "mac-adresse", "port", "protokoll",
        "bandbreite", "übertragungsrate", "datenrate", "topologie", "kabel",
        "glasfaser", "twisted", "cat 6", "cat6", "nat", "ping", "latenz",
        "access point", "netzplan der", "802.3", "802.11"]),
    "itsicherheit": dict(label="IT-Sicherheit", words=[
        "verschlüssel", "kryptograf", "firewall", "backup", "datensicherung",
        "passwort", "kennwort", "malware", "virus", "phishing", "ransomware",
        "zertifikat", "vpn", "authentifizier", "signatur", "s/mime", "pgp",
        "angriff", "sicherheitslücke", "berechtigung", "zugriffsrecht",
        "zwei-faktor", "mfa", "bsi", "notfall", "usv", "redundan",
        "schutzbedarf", "hash", "public key", "privater schlüssel", "tls", "ssl"]),
    "datenschutz": dict(label="Datenschutz & Recht", words=[
        "dsgvo", "datenschutz", "personenbezogen", "auftragsverarbeitung",
        "löschfrist", "einwilligung", "betroffenenrecht", "tom ", "urheberrecht",
        "lizenzrecht", "impressum", "aufbewahrungsfrist", "vertrag", "sla",
        "gewährleistung", "haftung", "bdsg", "compliance"]),
    "hardware": dict(label="Hardware & Peripherie", words=[
        "cpu", "prozessor", "arbeitsspeicher", "ram", "ssd", "festplatte", "hdd",
        "raid", "drucker", "multifunktionsgerät", "scanner", "monitor", "display",
        "usb", "hdmi", "displayport", "schnittstelle", "mainboard", "netzteil",
        "leistungsaufnahme", "watt", "akku", "kamera", "sensor", "peripherie",
        "toner", "auflösung", "dpi", "gehäuse", "steckplatz", "docking",
        "notebook", "thin client", "server-hardware"]),
    "software": dict(label="Software & Betrieb", words=[
        "betriebssystem", "lizenz", "installation", "virtualisier", "hypervisor",
        "container", "cloud", "saas", "iaas", "paas", "update", "patch-management",
        "software", "anwendung", "app ", "treiber", "image", "rollout",
        "fernwartung", "remote", "ticketsystem", "monitoring", "log",
        "open source", "gpl", "abo", "subscription"]),
    "daten": dict(label="Daten & Formate", words=[
        "datenbank", "er-modell", "er-diagramm", "entity", "kardinalität",
        "sql", "tabelle normalis", "normalform", "primärschlüssel", "fremdschlüssel",
        "csv", "xml", "json", "dateiformat", "komprimier", "speicherbedarf",
        "berechnen sie die erforderliche", "byte", "bit", "auflösung x",
        "datenmodell", "redundanz der daten"]),
    "arbeitsplatz": dict(label="Arbeitsplatz & Ergonomie", words=[
        "ergonom", "arbeitsplatz", "bildschirmarbeit", "beleuchtung",
        "barrierefrei", "arbeitsschutz", "sitzhöhe", "blendung", "lärm",
        "gesundheit", "unterweisung", "arbeitsstätten", "green it",
        "nachhaltig", "energieeffizien", "entsorgung", "recycling"]),
    "ki": dict(label="KI & Digitalisierung", words=[
        "künstliche intelligenz", "ki-", " ki ", "machine learning",
        "maschinelles lernen", "chatbot", "sprachmodell", "trainingsdaten",
        "algorithmus", "digitalisierung", "automatisier"]),
    "programmierung": dict(label="Programmierung & Logik", words=[
        "struktogramm", "pseudocode", "pap", "flussdiagramm", "schreibtischtest",
        "array", "dictionary", "schleife", "verzweigung", "variable", "algorithmus",
        "quellcode", "funktion", "parameter", "boolesch", "if ", "while ",
        "for ", "rückgabewert", "programmablauf", "uml", "klassendiagramm"]),
    "kommunikation": dict(label="Beratung & Doku", words=[
        "kunde", "beratung", "präsentation", "schulung", "einweisung",
        "dokumentation", "protokoll", "übergabe", "handbuch", "checkliste",
        "gesprächs", "argument", "einwand", "angebotsschreiben", "e-mail an"]),
}

# слова, которые почти всегда означают расчёт
CALC = re.compile(r"berechnen sie|rechenweg|ermitteln sie den preis|formel")


def score(text: str):
    t = " " + text.lower() + " "
    hits = {}
    for key, cfg in TOPICS.items():
        n = 0
        for w in cfg["words"]:
            if w in t:
                n += 2 if len(w) > 8 else 1
        if n:
            hits[key] = n
    return hits


def tag_sub(s):
    txt = (s.get("prompt") or "") + "\n" + (s.get("groupIntro") or "")
    sol = ((s.get("solution") or {}) or {}).get("text") or ""
    hits = score(txt + "\n" + sol)
    if not hits:
        return ["sonstiges"]
    best = max(hits.values())
    keep = [k for k, v in hits.items() if v >= max(2, best * 0.6)]
    if not keep:
        keep = [max(hits, key=lambda k: hits[k])]
    keep.sort(key=lambda k: -hits[k])
    if CALC.search(txt.lower()) and "kalkulation" not in keep and "netzwerk" not in keep:
        keep.append("kalkulation")
    return keep[:2]


def main():
    report_only = "--report" in sys.argv
    over = {}
    if OVERRIDE.exists():
        over = json.loads(OVERRIDE.read_text(encoding="utf-8"))

    counts = {}
    for p in sorted(EXAMS.glob("*.json")):
        if any(p.name.endswith(s) for s in SKIP):
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        for t in d["tasks"]:
            for s in t["subtasks"]:
                key = f"{d['examId']}:{s['id']}"
                s["topics"] = over.get(key) or over.get(s["id"]) or tag_sub(s)
                for k in s["topics"]:
                    counts[k] = counts.get(k, 0) + 1
        if not report_only:
            p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
        print(p.stem, "готово")

    print("\nРаспределение тем:")
    for k, v in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {TOPICS.get(k,{}).get('label',k):26} {v}")


if __name__ == "__main__":
    main()
