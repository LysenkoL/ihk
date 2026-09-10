/* ============================================================================
   gen/abbildungen.js — falsch zugeschnittene Abbildungen aussortieren
   ----------------------------------------------------------------------------
   Beim Zerlegen der Prüfungs-PDFs hat der Zuschneider vieles erwischt, was gar
   keine Abbildung ist: waagerechte Streifen mit dem Aufgabentext („cb) Erläutern
   Sie …  2 Punkte“), einzelne Antwortlinien, ein loses „4 Punkte“, und
   Bruchstücke von Diagrammen ohne Anfang und Ende.

   Nachgezählt: von 290 Bilddateien, die in Teilaufgaben verlinkt sind, sind 97
   solcher Fehlschnitte — jeder dritte. Sie stehen mitten in der Aufgabe, sagen
   nichts und lenken ab.

   Diese Datei nimmt sie aus den Prüfungsdaten heraus, BEVOR der Simulator sie
   liest. Die PNG-Dateien bleiben in assets/ liegen — nichts wird gelöscht, die
   Liste lässt sich jederzeit wieder kürzen.

   Zusätzlich können einzelne Bilder durch eine neu gezeichnete SVG ersetzt
   werden (ERSATZ weiter unten): scharf auf dem Handy, wenige Kilobyte statt
   Megabyte, und ohne den Ballast der umliegenden Seite.

   Wichtig: die Liste wird in die vorhandenen Datensätze hineingeschnitten
   (splice), nicht durch eine neue ersetzt — index.html hat die Teilaufgaben
   an anderer Stelle flach kopiert und teilt sich dieselben Array-Objekte.
   ========================================================================== */
"use strict";

window.GENBILDER = (function () {


  /* ------------------------------------------------------------------------
     Welche Abbildung bei WELCHER Teilaufgabe stehen darf
     ------------------------------------------------------------------------
     Der Extraktor hängt jeder Teilaufgabe ALLE Abbildungen ihrer PDF-Seite an.
     Auf einer Seite stehen aber meist drei bis fünf Teilaufgaben. Deshalb stand
     unter „Erklären Sie den Zweck von Lasten- und Pflichtenheft“ das ER-Modell
     aus der nächsten Teilaufgabe — ein Bild, das mit der Frage nichts zu tun
     hat und beim Lernen in die Irre führt.

     Die Seite trägt keine Koordinaten, aus denen sich „oberhalb/unterhalb“
     berechnen ließe. Also wurde jede der 56 verbliebenen Bilddateien einzeln
     angesehen und ihr Inhalt mit dem Text der Teilaufgaben derselben Seite
     verglichen. Das Ergebnis steht hier: je Datei die Teilaufgaben, bei denen
     sie stehen bleibt. Überall sonst wird sie entfernt.

     Grundsatz bei Zweifeln: entfernen. Ein fehlendes Bild kostet nichts —
     „Vollständige Seite ansehen“ zeigt die Originalseite. Ein falsches Bild
     kostet Verständnis.

     Dateien, die hier nicht aufgeführt sind, bleiben unangetastet.
     ---------------------------------------------------------------------- */
  const NUR_BEI = {
    "ap1-2022-f_p02_f2.png": ["1 aa)", "1 ab)"],
    "ap1-2022-f_p05_f1.png": ["2 aa)", "2 ab)"],   /* nicht bei 2 b) */
    "ap1-2022-f_p06_f1.png": ["2 c)"],   /* nicht bei 2 d), 2 e) */
    "ap1-2022-f_p06_f3.png": ["2 e)"],   /* nicht bei 2 c), 2 d) */
    "ap1-2022-f_p07_f1.png": ["2 fa)", "2 fb)"],   /* nicht bei 2 ga), 2 gb), 2 gc) */
    "ap1-2022-f_p07_f3.png": ["2 fb)"],   /* nicht bei 2 fa), 2 ga), 2 gb), 2 gc) */
    "ap1-2022-f_p09_f3.png": ["3 ea)", "3 eb)"],   /* nicht bei 3 d) */
    "ap1-2022-f_p10_f2.png": ["3 fa)", "3 fb)"],   /* nicht bei 3 fc) */
    "ap1-2022-f_p10_f3.png": ["3 fc)"],   /* nicht bei 3 fa), 3 fb) */
    "ap1-2022-h_p05_f3.png": ["2 e)"],   /* nicht bei 2 cb), 2 cc), 2 d) */
    "ap1-2022-h_p06_f5.png": ["3 d)"],   /* nicht bei 3 a), 3 b), 3 c) */
    "ap1-2023-f_p09_f1.png": ["4 da)", "4 db)"],
    "ap1-2023-h_p02_f1.png": ["1 a)", "1 ba)"],
    "ap1-2023-h_p03_f4.png": ["1 da)", "1 db)", "1 dc)"],   /* nicht bei 1 bb), 1 c) */
    "ap1-2023-h_p05_f2.png": ["2 d)", "2 e)"],   /* nicht bei 2 c) */
    "ap1-2023-h_p12_f2.png": ["4 ab)", "4 ba)", "4 bb)", "4 bc)"],   /* nicht bei 4 aa) */
    "ap1-2023-h_p13_f1.png": ["4 ca)"],
    "ap1-2024-f_p03_f1.png": ["1 c)"],   /* nicht bei 1 d), 1 e), 1 fa), 1 fb) */
    "ap1-2024-f_p04_f1.png": ["2 a)"],   /* nicht bei 2 b) */
    "ap1-2024-f_p04_f3.png": ["2 b)"],   /* nicht bei 2 a) */
    "ap1-2024-f_p05_f1.png": ["2 c)", "2 d)"],   /* nicht bei 2 e) */
    "ap1-2024-f_p05_f2.png": ["2 e)"],   /* nicht bei 2 c), 2 d) */
    "ap1-2024-f_p06_f1.png": ["2 g)"],   /* nicht bei 2 f), 3 a), 3 b), 3 c) */
    "ap1-2024-f_p09_f4.png": ["4 f)"],   /* nicht bei 4 da), 4 db), 4 e) */
    "ap1-2024-h_p03_f1.png": ["1 da)"],   /* nicht bei 1 db), 1 dc) */
    "ap1-2024-h_p03_f2.png": ["1 db)"],   /* nicht bei 1 da), 1 dc) */
    "ap1-2024-h_p05_f1.png": ["2 d)"],
    "ap1-2024-h_p06_f1.png": ["2 e)"],   /* nicht bei 2 f) */
    "ap1-2024-h_p09_f3.png": ["4 b)"],   /* nicht bei 4 a) */
    "ap1-2025-f_p04_f1.png": ["d)"],
    "ap1-2025-f_p05_f3.png": ["ba)"],
    "ap1-2025-h_p03_f1.png": ["1 a)"],
    "ap1-2025-h_p06_f10.png": ["2 ba)"],
    "ap1-2025-h_p06_f11.png": ["2 ba)"],
    "ap1-2025-h_p06_f12.png": ["2 ba)"],
    "ap1-2025-h_p06_f2.png": ["2 ba)"],
    "ap1-2025-h_p06_f3.png": ["2 ba)"],
    "ap1-2025-h_p06_f4.png": ["2 ba)"],
    "ap1-2025-h_p06_f5.png": ["2 ba)"],
    "ap1-2025-h_p06_f6.png": ["2 ba)"],
    "ap1-2025-h_p06_f7.png": ["2 ba)"],
    "ap1-2025-h_p06_f8.png": ["2 ba)"],
    "ap1-2025-h_p06_f9.png": ["2 ba)"],
    "ap1-2025-h_p07_f1.png": [],   /* nicht bei 2 bb) */
    "ap1-2025-h_p10_f1.png": [],   /* nicht bei 3 c) */
    "ap1-2025-h_p11_f1.png": [],   /* nicht bei 3 f) */
    "ap1-2025-h_p11_f2.png": ["3 g)"],
    "ap1-2025-h_p11_f3.png": ["3 h)"],   /* nicht bei 3 g) */
    "ap1-2025-h_p13_f1.png": [],   /* nicht bei 4 aa) */
    "ap1-2026-f_p02_f1.png": ["1 aa)"],
    "ap1-2026-f_p03_f1.png": ["1 ac)"],
    "ap1-2026-f_p04_f3.png": ["1 cc)"],
    "ap1-2026-f_p05_f1.png": ["2 b)"],
    "ap1-2026-f_p08_f1.png": ["3 db)"],
    "ap1-2026-f_p09_f2.png": ["3 ec)"],
    "ap1-2026-f_p10_f3.png": ["4 ba)"],
  };

  /* --------- Fehlschnitte: werden nicht mehr als Abbildung angezeigt ----- */
  /* Herbst 2021 ist ein Sonderfall: dort ist KEIN einziger Ausschnitt zu
     gebrauchen. Seite 3 ist quer gedruckt, der Zuschneider hat sie in fünf
     gedrehte Scherben zerlegt; alle übrigen 21 „Abbildungen“ sind schlicht
     Streifen des Aufgabentextes samt Antwortkästchen — und der Text steht
     ohnehin vollständig in der Aufgabe. Ersatz: drei neu gezeichnete SVGs
     weiter unten (Vorgangstabelle, leerer Netzplan, gelöster Netzplan).   */
  const AUSBLENDEN = new Set([
    "ap1-2021-h_p02_f1.png", "ap1-2021-h_p02_f2.png", "ap1-2021-h_p03_f1.png",
    "ap1-2021-h_p03_f2.png", "ap1-2021-h_p03_f3.png", "ap1-2021-h_p03_f4.png",
    "ap1-2021-h_p03_f5.png", "ap1-2021-h_p04_f1.png", "ap1-2021-h_p04_f2.png",
    "ap1-2021-h_p05_f1.png", "ap1-2021-h_p05_f2.png", "ap1-2021-h_p05_f3.png",
    "ap1-2021-h_p06_f1.png", "ap1-2021-h_p07_f1.png", "ap1-2021-h_p07_f2.png",
    "ap1-2021-h_p07_f3.png", "ap1-2021-h_p08_f1.png",
    "ap1-2021-h_p08_f2.png", "ap1-2021-h_p08_f3.png", "ap1-2021-h_p08_f4.png",
    "ap1-2021-h_p08_f5.png", "ap1-2021-h_p09_f1.png", "ap1-2021-h_p09_f2.png",
    "ap1-2021-h_p10_f1.png", "ap1-2021-h_p10_f3.png", "ap1-2021-h_p10_f4.png",
    "ap1-2021-h_p10_f5.png", "ap1-2021-h_p10_f6.png", "ap1-2021-h_p10_f7.png",
    "ap1-2021-h_p10_f8.png",
    "ap1-2021-h_p10_f2.png", "ap1-2021-h_p10_f9.png", "ap1-2021-h_p11_f1.png",
    "ap1-2021-h_p11_f2.png",
    "ap1-2021-h_p11_f3.png", "ap1-2021-h_p11_f4.png", "ap1-2022-f_p06_f2.png",
    "ap1-2022-f_p07_f2.png",
    "ap1-2022-f_p07_f4.png", "ap1-2022-f_p07_f5.png", "ap1-2022-f_p07_f6.png",
    "ap1-2022-f_p07_f7.png", "ap1-2022-f_p09_f2.png", "ap1-2022-f_p09_f4.png",
    "ap1-2022-f_p10_f1.png", "ap1-2022-f_p11_f2.png", "ap1-2022-h_p02_f2.png",
    "ap1-2022-h_p05_f2.png", "ap1-2022-h_p06_f3.png", "ap1-2022-h_p06_f4.png",
    "ap1-2022-h_p07_f1.png", "ap1-2022-h_p08_f2.png", "ap1-2022-h_p08_f3.png",
    "ap1-2022-h_p08_f4.png", "ap1-2023-f_p03_f1.png", "ap1-2023-f_p04_f1.png",
    "ap1-2023-f_p04_f3.png", "ap1-2023-f_p05_f2.png", "ap1-2023-f_p06_f2.png",
    "ap1-2023-f_p06_f3.png", "ap1-2023-f_p06_f4.png", "ap1-2023-f_p06_f5.png",
    "ap1-2023-f_p08_f1.png", "ap1-2023-f_p09_f2.png", "ap1-2023-h_p03_f1.png",
    "ap1-2023-h_p03_f2.png", "ap1-2023-h_p03_f3.png", "ap1-2023-h_p03_f5.png",
    "ap1-2023-h_p03_f6.png", "ap1-2023-h_p03_f7.png", "ap1-2023-h_p04_f2.png",
    "ap1-2023-h_p04_f4.png", "ap1-2023-h_p05_f1.png", "ap1-2023-h_p06_f1.png",
    "ap1-2023-h_p11_f2.png", "ap1-2023-h_p11_f4.png", "ap1-2023-h_p14_f1.png",
    "ap1-2023-h_p14_f2.png", "ap1-2024-f_p02_f2.png", "ap1-2024-f_p03_f2.png",
    "ap1-2024-f_p03_f4.png", "ap1-2024-f_p04_f2.png", "ap1-2024-f_p06_f2.png",
    "ap1-2024-f_p06_f3.png", "ap1-2024-f_p09_f1.png", "ap1-2024-f_p09_f2.png",
    "ap1-2024-f_p09_f3.png", "ap1-2024-f_p09_f5.png", "ap1-2024-h_p04_f2.png",
    "ap1-2024-h_p04_f4.png", "ap1-2024-h_p04_f5.png", "ap1-2024-h_p05_f2.png",
    "ap1-2024-h_p07_f2.png", "ap1-2024-h_p08_f2.png", "ap1-2024-h_p08_f3.png",
    "ap1-2024-h_p08_f4.png", "ap1-2024-h_p08_f5.png", "ap1-2024-h_p08_f6.png",
    "ap1-2024-h_p08_f7.png", "ap1-2024-h_p10_f1.png", "ap1-2024-h_p10_f2.png",
    "ap1-2024-h_p10_f3.png", "ap1-2025-f_p04_f2.png", "ap1-2025-f_p05_f4.png",
    "ap1-2025-f_p05_f5.png", "ap1-2025-f_p06_f1.png", "ap1-2025-f_p06_f3.png",
    "ap1-2025-f_p08_f2.png", "ap1-2025-f_p12_f1.png", "ap1-2025-f_p12_f2.png",
    "ap1-2025-f_p12_f3.png", "ap1-2025-h_p04_f1.png", "ap1-2025-h_p04_f2.png",
    "ap1-2025-h_p04_f3.png", "ap1-2025-h_p04_f4.png", "ap1-2025-h_p09_f2.png",
    "ap1-2025-h_p12_f2.png", "ap1-2025-h_p12_f3.png", "ap1-2025-h_p15_f2.png",
    "ap1-2025-h_p15_f3.png", "ap1-2026-f_p04_f2.png", "ap1-2026-f_p11_f2.png",
    "ap1-2026-f_p11_f3.png"  ]);

  /* --------- zweite Durchsicht: Seitenstreifen ohne echte Abbildung ----- */
  /* 121 der noch sichtbaren Ausschnitte sind volle Textspalten. Einzeln
     angesehen: 65 davon zeigen nur Aufgabentext und Antwortkästchen — der
     Text steht ohnehin in der Aufgabe. Die übrigen 56 enthalten eine echte
     Abbildung (Fotos, Netzpläne, ER- und UML-Diagramme, Konsolenausgaben,
     Tabellen, auf die sich die Frage bezieht) und bleiben stehen.        */
  [
    "ap1-2022-f_p02_f1.png", "ap1-2022-f_p03_f1.png", "ap1-2022-f_p04_f1.png",
    "ap1-2022-f_p08_f1.png", "ap1-2022-f_p08_f2.png", "ap1-2022-f_p08_f3.png",
    "ap1-2022-f_p11_f1.png", "ap1-2022-f_p11_f3.png", "ap1-2022-f_p14_f1.png",
    "ap1-2022-h_p02_f1.png", "ap1-2022-h_p02_f3.png", "ap1-2022-h_p03_f4.png",
    "ap1-2022-h_p04_f1.png", "ap1-2022-h_p05_f1.png", "ap1-2022-h_p06_f2.png",
    "ap1-2022-h_p07_f2.png", "ap1-2022-h_p08_f1.png", "ap1-2022-h_p11_f1.png",
    "ap1-2022-h_p12_f1.png", "ap1-2023-f_p02_f1.png", "ap1-2023-f_p03_f2.png",
    "ap1-2023-f_p07_f1.png", "ap1-2023-h_p04_f1.png", "ap1-2023-h_p04_f3.png",
    "ap1-2023-h_p06_f2.png", "ap1-2023-h_p06_f3.png", "ap1-2023-h_p11_f1.png",
    "ap1-2023-h_p11_f3.png", "ap1-2023-h_p14_f3.png", "ap1-2024-f_p02_f1.png",
    "ap1-2024-f_p02_f3.png", "ap1-2024-f_p08_f1.png", "ap1-2024-f_p08_f3.png",
    "ap1-2024-h_p02_f1.png", "ap1-2024-h_p02_f2.png", "ap1-2024-h_p04_f1.png",
    "ap1-2024-h_p04_f3.png", "ap1-2024-h_p06_f2.png", "ap1-2024-h_p07_f1.png",
    "ap1-2024-h_p09_f1.png", "ap1-2025-f_p02_f1.png", "ap1-2025-f_p03_f1.png",
    "ap1-2025-f_p05_f1.png", "ap1-2025-f_p06_f2.png", "ap1-2025-f_p06_f4.png",
    "ap1-2025-f_p08_f3.png", "ap1-2025-f_p09_f1.png", "ap1-2025-f_p10_f1.png",
    "ap1-2025-f_p11_f1.png", "ap1-2025-f_p11_f2.png", "ap1-2025-h_p05_f1.png",
    "ap1-2025-h_p06_f1.png", "ap1-2025-h_p08_f1.png", "ap1-2025-h_p09_f1.png",
    "ap1-2025-h_p09_f3.png", "ap1-2025-h_p12_f1.png", "ap1-2025-h_p14_f1.png",
    "ap1-2025-h_p14_f2.png", "ap1-2025-h_p15_f1.png", "ap1-2026-f_p02_f2.png",
    "ap1-2026-f_p04_f1.png", "ap1-2026-f_p07_f1.png", "ap1-2026-f_p07_f2.png",
    "ap1-2026-f_p09_f1.png", "ap1-2026-f_p10_f2.png"
  ].forEach(f => AUSBLENDEN.add(f));

  /* --------- dritte Durchsicht: schmale Ausschnitte ---------------------- */
  /* Die 59 noch verbliebenen schmalen Bilder einzeln angesehen: 42 sind
     Scherben — eine einzelne Tabellenzelle („Medium getrennt“), ein
     halber Satz, ein leerer ER-Kasten, oder die Umfrage „Prüfungszeit —
     nicht Bestandteil der Prüfung“. Die übrigen 17 bleiben: Fotos von
     Anschlüssen, Konsolenausgaben (ping, arp, ipconfig), die Symbole des
     UML-Aktivitätsdiagramms und der Netzplan von Frühjahr 2025.        */
  [
    "ap1-2022-f_p04_f2.png", "ap1-2022-f_p04_f3.png", "ap1-2022-f_p04_f4.png",
    "ap1-2022-f_p05_f2.png", "ap1-2022-f_p05_f3.png", "ap1-2022-f_p05_f4.png",
    "ap1-2022-f_p08_f4.png", "ap1-2022-f_p09_f1.png", "ap1-2022-f_p14_f2.png",
    "ap1-2022-h_p03_f1.png", "ap1-2022-h_p03_f2.png", "ap1-2022-h_p03_f3.png",
    "ap1-2022-h_p06_f1.png", "ap1-2022-h_p12_f2.png", "ap1-2022-h_p12_f3.png",
    "ap1-2022-h_p12_f4.png", "ap1-2023-f_p04_f2.png", "ap1-2023-f_p04_f4.png",
    "ap1-2023-f_p06_f1.png", "ap1-2023-f_p07_f2.png", "ap1-2023-h_p12_f1.png",
    "ap1-2023-h_p12_f3.png", "ap1-2023-h_p14_f4.png", "ap1-2024-f_p03_f3.png",
    "ap1-2024-f_p08_f2.png", "ap1-2024-h_p02_f3.png", "ap1-2024-h_p05_f3.png",
    "ap1-2024-h_p08_f1.png", "ap1-2024-h_p09_f2.png", "ap1-2024-h_p10_f4.png",
    "ap1-2025-f_p05_f2.png", "ap1-2025-f_p07_f2.png", "ap1-2025-f_p07_f4.png",
    "ap1-2025-f_p07_f5.png", "ap1-2025-f_p08_f1.png", "ap1-2025-f_p09_f2.png",
    "ap1-2025-f_p10_f2.png", "ap1-2025-f_p12_f4.png", "ap1-2026-f_p05_f2.png",
    "ap1-2026-f_p10_f4.png", "ap1-2026-f_p12_f2.png", "ap1-2026-f_p12_f3.png"
  ].forEach(f => AUSBLENDEN.add(f));

  /* --------- Netzpläne 2025 und 2026: durch Zeichnungen ersetzt ---------- */
  /* Beide lagen nur als Seitenfoto vor (2025 sogar quer gedruckt, 831 px
     breit). Die neuen SVGs stehen weiter unten in ZUSATZ.                 */
  ["ap1-2025-f_p07_f1.png", "ap1-2025-f_p07_f3.png",
   "ap1-2026-f_p06_f1.png"].forEach(f => AUSBLENDEN.add(f));

  /* --------- neu gezeichnete Abbildungen: PNG -> SVG -------------------- */
  const ERSATZ = {
    /* Schalenmodell eines PCs. Das Original ist ein ganzer Seitenausschnitt
       mit zwei weiteren Aufgaben und einem BSI-Zitat drumherum.           */
    "assets/ap1-2023-f_p05_f1.png": {
      datei: "assets/svg/schalenmodell.svg",
      titel: "Schichten- bzw. Schalenmodell eines PCs",
      breite: 640, hoehe: 460
    }
  };

  /* --------- neu gezeichnet, wo NIE eine Abbildung extrahiert wurde ----- */
  /* Schlüssel: Prüfung | Teilaufgabe | Seite — die Buchstaben wiederholen
     sich innerhalb einer Prüfung, deshalb gehört die Seite dazu.          */
  /* Ein Wert darf auch eine Liste sein — Herbst 2021 braucht zwei Bilder.  */
  const TABELLE_2021 = {
    file: "assets/svg/netzplan-2021h-tabelle.svg", width: 840, height: 404,
    titel: "Vorgangsliste A bis K mit Dauer und Vorgängern", sourcePage: 3, neugezeichnet: true
  };
  const PLAN_2021 = {
    file: "assets/svg/netzplan-2021h.svg", width: 1240, height: 560,
    titel: "Netzplan — FAZ, FEZ, SAZ, SEZ, GP und FP eintragen", sourcePage: 3, neugezeichnet: true
  };

  const TABELLE_2025 = {
    file: "assets/svg/netzplan-2025f-tabelle.svg", width: 860, height: 374,
    titel: "Vorgangsliste A bis J mit Dauer und Vorgängern", sourcePage: 7, neugezeichnet: true
  };
  const PLAN_2025 = {
    file: "assets/svg/netzplan-2025f.svg", width: 1084, height: 542,
    titel: "Netzplan-Entwurf — FAZ, FEZ, SAZ, SEZ, GP und FP ergänzen", sourcePage: 7, neugezeichnet: true
  };
  const TABELLE_2026 = {
    file: "assets/svg/netzplan-2026f-tabelle.svg", width: 580, height: 284,
    titel: "Prozessschritte A bis G mit Dauer und Vorgängern", sourcePage: 6, neugezeichnet: true
  };
  const PLAN_2026 = {
    file: "assets/svg/netzplan-2026f.svg", width: 908, height: 482,
    titel: "Übergebener Netzplan — drei Zahlen stimmen noch nicht", sourcePage: 6, neugezeichnet: true
  };

  const ZUSATZ = {
    "ap1-2025-f|b)|3": {
      file: "assets/svg/anschluesse-mfg.svg", width: 760, height: 170,
      titel: "Anschlüsse 1 bis 4", sourcePage: 3, neugezeichnet: true
    },
    "ap1-2025-f|c)|3": {
      file: "assets/svg/symbole-mfg.svg", width: 420, height: 150,
      titel: "Symbole 1 und 2", sourcePage: 3, neugezeichnet: true
    },
    /* 3 h) verweist auf „die folgende Skizze“ — die liegt aber im Ausschnitt
       der Nachbaraufgabe 3 g). Deshalb hier zusätzlich anhängen.          */
    "ap1-2025-h|3 h)|12": {
      file: "assets/ap1-2025-h_p11_f3.png",
      titel: "Skizze zur elektronischen Signatur (aus Teilaufgabe g)", sourcePage: 11
    },
    "ap1-2025-f|aa)|7": [TABELLE_2025, PLAN_2025],
    "ap1-2025-f|ab)|6": [TABELLE_2025, PLAN_2025],
    "ap1-2026-f|2 e)|6": [TABELLE_2026, PLAN_2026],
    "ap1-2021-h|1 c)|3": [TABELLE_2021, PLAN_2021],
    "ap1-2021-h|1 d)|3": [TABELLE_2021, PLAN_2021],
    "ap1-2021-h|1 e)|2": [TABELLE_2021, PLAN_2021]
  };

  /* --------- Musterlösungen, die es nur als Seitenfoto gab --------------- */
  /* Für 1 c) und 1 d) stand in der Lösung nur „(1 Punkt Ergänzung eines
     Netzplanknotens …)“ plus ein Foto der Lösungsseite. Der gelöste Netzplan
     ist jetzt gezeichnet — samt Rechenweg im Text.                        */
  const LOESUNG = {
    "ap1-2025-f|aa)|7": {
      mono: true,
      bild: "assets/svg/netzplan-2025f-loesung.svg",
      text:
        "Vorwärts (FAZ → FEZ), Start bei 0:\n" +
        "  A 0→2 · B 2→27 · C 27→59 · D 27→67 · G 27→35 · E 67→137 · H 35→37 ·\n" +
        "  F 137→152 · I 137→153 · J 153→157\n" +
        "  E wartet auf den späteren Vorgänger: max(FEZ C 59, FEZ D 67) = 67.\n" +
        "  J wartet auf F 152, I 153, H 37 → 153.\n\n" +
        "Rückwärts (SEZ → SAZ), Projektende 157:\n" +
        "  J 153→157 · I 137→153 · F 138→153 · H 151→153 · E 67→137 ·\n" +
        "  D 27→67 · C 35→67 · G 143→151 · B 2→27 · A 0→2\n\n" +
        "Puffer (GP = SAZ − FAZ, FP = FAZ des Nachfolgers − FEZ):\n" +
        "  A 0/0 · B 0/0 · C 8/8 · D 0/0 · E 0/0 · F 1/1 ·\n" +
        "  G 116/0 · H 116/116 · I 0/0 · J 0/0\n\n" +
        "Kritischer Pfad A – B – D – E – I – J, Projektdauer 157 Stunden.\n\n" +
        "Bewertung: 2 Punkte je vollständig richtigem Knoten, 1 Punkt für die richtige " +
        "Ergänzung von G."
    },
    "ap1-2025-f|ab)|6": {
      bild: "assets/svg/netzplan-2025f-loesung.svg",
      text:
        "Kritischer Pfad: A – B – D – E – I – J.\n\n" +
        "Das ist der einzige Weg, auf dem jeder Vorgang GP = 0 hat: " +
        "2 + 25 + 40 + 70 + 16 + 4 = 157 Stunden. " +
        "Über C statt D wären es nur 149, über G/H nur 41 Stunden — beide haben deshalb Puffer."
    },
    "ap1-2026-f|2 e)|6": {
      mono: true,
      bild: "assets/svg/netzplan-2026f-loesung.svg",
      text:
        "Prozessschritt   Fehler bei   Korrektur\n" +
        "B                FAZ          7           (war schon korrigiert)\n" +
        "D                GP           5\n" +
        "F                SAZ          17\n" +
        "F                SEZ          20\n\n" +
        "So kommt man darauf — erst der richtige Plan, dann der Vergleich:\n" +
        "  vorwärts:  A 0→7 · B 7→9 · C 9→15 · D 9→10 · E 15→20 · F 10→13 · G 20→21\n" +
        "  rückwärts: G 20→21 · E 15→20 · F 17→20 · C 9→15 · D 14→15 · B 7→9 · A 0→7\n" +
        "  GP:  A 0 · B 0 · C 0 · D 5 · E 0 · F 7 · G 0\n" +
        "  FP:  A 0 · B 0 · C 0 · D 0 · E 0 · F 7 · G 0\n\n" +
        "D: GP = SAZ − FAZ = 14 − 9 = 5, im Plan stand 6.\n" +
        "F: F ist Vorgänger von G, also SEZ = SAZ(G) = 20 und SAZ = 20 − 3 = 17. " +
        "Im Plan standen 18 und 15. Dass dort trotzdem GP = 7 steht, ist der Hinweis: " +
        "7 passt zu SAZ 17, nicht zu SAZ 15.\n\n" +
        "Bewertung: je Zeile 1 Punkt für „Prozessschritt“ und „Fehler bei“ zusammen, " +
        "1 Punkt für die Korrektur.\n" +
        "Kritischer Pfad: A – B – C – E – G, Projektdauer 21 Tage."
    },
    "ap1-2023-f|1 b)|2": {
      mono: true,
      text:
        "Nutzwertanalyse vollständig (gP = Punkte × Gewichtung; je Kriterium darf jeder " +
        "Punktwert 1–4 nur einmal vergeben werden):\n\n" +
        "Nr Kriterium                    Gew.   Notebook    All-in-One  Thin-Client Desktop\n" +
        "1  Platzbedarf                  15 %   2 / 0,30    3 / 0,45    4 / 0,60    1 / 0,15\n" +
        "2  Ergonomie                    20 %   2 / 0,40    1 / 0,20    4 / 0,80    3 / 0,60\n" +
        "3  Performance                  10 %   3 / 0,30    1 / 0,10    2 / 0,20    4 / 0,40\n" +
        "4  Verfügbarkeit                20 %   4 / 0,80    2 / 0,40    1 / 0,20    3 / 0,60\n" +
        "5  Kosten Wartung/Erweiterung   15 %   2 / 0,30    1 / 0,15    4 / 0,60    3 / 0,45\n" +
        "6  Preis                        20 %   1 / 0,20    3 / 0,60    4 / 0,80    2 / 0,40\n" +
        "   Auswertung                  100 %      2,30        1,90        3,20        2,60\n\n" +
        "Bester Nutzwert: Thin-Client mit 3,20.\n\n" +
        "Bewertung: 12 Punkte für die richtige Vergabe der Punktwerte, 4 Punkte für die vier " +
        "Summen. Für das Ausrechnen der gewichteten Punkte gibt es keine eigenen Punkte — " +
        "gerechnet werden muss trotzdem, sonst stimmen die Summen nicht."
    },
    "ap1-2022-f|4 d)|12": {
      mono: true,
      text:
        "Struktogramm — die neun Anweisungen in dieser Reihenfolge (Nummern aus der Aufgabe):\n\n" +
        "  5   PCNr = 0\n" +
        "  3   PCListe[] = getPC()\n" +
        "  9   Solange PCNr < Anzahl der Elemente in PCListe[]\n" +
        "  6   │   SoftwareListe[] = getSoftware(PCListe[PCNr])\n" +
        "  7   │   SoftwareNr = 0\n" +
        "  2   │   Solange SoftwareNr < Anzahl der Elemente in SoftwareListe[]\n" +
        "  1   │   │   installSoftware(SoftwareListe[SoftwareNr], PCListe[PCNr])\n" +
        "  8   │   │   SoftwareNr = SoftwareNr + 1\n" +
        "  4   │   PCNr = PCNr + 1\n\n" +
        "Also: 5 – 3 – 9 – 6 – 7 – 2 – 1 – 8 – 4.\n\n" +
        "Die zwei Stolperstellen: die Liste der Software gehört IN die äußere Schleife " +
        "(sie ist für jeden PC eine andere), und SoftwareNr muss dort ebenfalls wieder auf 0 " +
        "gesetzt werden — sonst läuft die innere Schleife beim zweiten PC gar nicht mehr. " +
        "Die Zählvariable wird jeweils als letzte Anweisung ihrer eigenen Schleife erhöht."
    },
    "ap1-2023-h|1 a)|2": {
      bild: "assets/svg/uml-2023h-1a.svg",
      text:
        "Zu ergänzen waren sechs Elemente (je 1 Punkt):\n\n" +
        "Akteure: Kunde (links) und IT-Abteilung (rechts oben).\n" +
        "Anwendungsfälle: „Störungsmeldung senden“ (vom Kunden), „Arbeitsplanung“ und " +
        "„Priorisierung“ (IT-Abteilung), „Rückmeldung“ (aus „Arbeitsauftrag bearbeiten“).\n\n" +
        "Die «include»-Pfeile zeigen vom größeren Anwendungsfall auf den eingeschlossenen: " +
        "Arbeitsplanung «include» Priorisierung, Arbeitsauftrag bearbeiten «include» Rückmeldung. " +
        "Der Pfeil zeigt also NICHT in Ablaufrichtung — das ist der häufigste Fehler.\n\n" +
        "Akteure stehen außerhalb der Systemgrenze, Anwendungsfälle innerhalb."
    },
    "ap1-2023-h|4 ba)|12": {
      mono: true,
      bild: "assets/svg/gantt-2023h-4ba.svg",
      text:
        "Gantt-Diagramm (je richtigem Vorgang 1 Punkt):\n\n" +
        "  A  Tag 1–3   (Vorgabe)\n" +
        "  B  Tag 4–9   (6 Tage, nach A)\n" +
        "  D  Tag 4–11  (8 Tage, nach A)\n" +
        "  E  Tag 4–8   (5 Tage, nach A)\n" +
        "  C  Tag 10–13 (4 Tage, nach B)\n" +
        "  F  Tag 14–16 (3 Tage, nach C, D und E)\n" +
        "  G  Tag 17–18 (2 Tage, nach F)\n\n" +
        "F darf erst starten, wenn ALLE drei Vorgänger fertig sind — der späteste ist C mit " +
        "Tag 13. Projektende: Tag 18.\n\n" +
        "Kritischer Pfad A – B – C – F – G (3+6+4+3+2 = 18 Tage). " +
        "Puffer: D 2 Tage, E 5 Tage, alle übrigen 0."
    },
    "ap1-2023-h|4 bc)|12": {
      text:
        "Größter Puffer: Vorgang E mit 5 Tagen.\n\n" +
        "Rechnung: F beginnt an Tag 14. E endet an Tag 8, könnte also bis Tag 13 laufen " +
        "→ 5 Tage Puffer. D endet an Tag 11 → 2 Tage. C endet an Tag 13 und wird sofort " +
        "gebraucht → 0 Tage; C liegt auf dem kritischen Pfad.\n\n" +
        "Achtung: die veröffentlichte IHK-Musterlösung nennt hier „Vorgang C“. Nach dem " +
        "Diagramm derselben Musterlösung hat C aber keinen Puffer. Rechne im Zweifel selbst " +
        "nach: Puffer = spätester möglicher Endtermin − tatsächlicher Endtermin."
    },
    "ap1-2021-h|1 c)|3": {
      mono: true,
      bild: "assets/svg/netzplan-2021h-loesung.svg",
      text:
        "Vorwärtsrechnung (FAZ → FEZ):\n" +
        "A 0→2 · B 2→6 · C 6→9 · D 6→14 · E 6→8 · F 6→11 · G 14→18 · H 8→9 · " +
        "I 18→21 · J 21→22 · K 22→24\n\n" +
        "Rückwärtsrechnung (SEZ → SAZ), Projektende 24:\n" +
        "K 22→24 · J 21→22 · I 18→21 · G 14→18 · H 17→18 · F 17→22 · E 15→17 · " +
        "D 6→14 · C 11→14 · B 2→6 · A 0→2\n\n" +
        "Puffer (GP = SAZ − FAZ, FP = FAZ des Nachfolgers − FEZ):\n" +
        "A 0/0 · B 0/0 · C 5/5 · D 0/0 · E 9/0 · F 11/11 · G 0/0 · H 9/9 · " +
        "I 0/0 · J 0/0 · K 0/0\n\n" +
        "(1 Punkt je ergänztem Netzplanknoten, 2 Punkte je vollem Knoten)"
    },
    "ap1-2021-h|1 d)|3": {
      bild: "assets/svg/netzplan-2021h-loesung.svg",
      text: "A – B – D – G – I – J – K\n\n" +
            "Das ist der einzige Weg ohne Puffer: alle Vorgänge darauf haben GP = 0. " +
            "Die Projektdauer beträgt 24 Stunden."
    }
  };

  const kurz = f => String(f || "").replace(/^assets\//, "");

  function aufraeumen() {
    const EX = (typeof IHK_EXAMS !== "undefined" && IHK_EXAMS) ? IHK_EXAMS : window.IHK_EXAMS;
    if (!EX || !EX.length) return { weg: 0, ersetzt: 0 };
    let weg = 0, ersetzt = 0;

    const durch = (liste, label) => {
      if (!Array.isArray(liste)) return;
      for (let i = liste.length - 1; i >= 0; i--) {
        const a = liste[i];
        if (!a || !a.file) continue;
        if (AUSBLENDEN.has(kurz(a.file))) { liste.splice(i, 1); weg++; continue; }
        /* gehört das Bild bei DIESER Teilaufgabe hin? */
        const erlaubt = NUR_BEI[kurz(a.file)];
        if (erlaubt && label && erlaubt.indexOf(label) < 0) { liste.splice(i, 1); falsch++; continue; }
        const e = ERSATZ[a.file] || ERSATZ["assets/" + kurz(a.file)];
        if (e) {
          a.file = e.datei;
          if (e.breite) a.width = e.breite;
          if (e.hoehe) a.height = e.hoehe;
          a.titel = e.titel;
          a.neugezeichnet = true;
          ersetzt++;
        }
      }
    };

    let ergaenzt = 0, loesungen = 0, falsch = 0;
    EX.forEach(ex => {
      durch(ex.attachments);
      if (ex.situation) durch(ex.situation.assets);
      (ex.tasks || []).forEach(t => {
        durch(t.assets);
        (t.subtasks || []).forEach(st => {
          durch(st.assets, st.fullLabel || st.label || "");
          /* Aufgaben, für die es nie eine Abbildung gab: hinzufügen */
          const k = ex.examId + "|" + (st.fullLabel || st.label || "") + "|" + (st.sourcePage || "");
          const z = ZUSATZ[k];
          if (z) {
            (Array.isArray(z) ? z : [z]).forEach(bild => {
              if ((st.assets || []).some(a => a.file === bild.file)) return;
              if (!Array.isArray(st.assets)) st.assets = [];
              st.assets.push(Object.assign({}, bild));
              ergaenzt++;
            });
          }
          /* Musterlösung, die nur als Seitenfoto vorlag, durch Zeichnung
             und ausformulierten Rechenweg ersetzen                        */
          const l = LOESUNG[k];
          if (l) {
            if (!st.solution) st.solution = {};
            if (l.bild && st.solution.image !== l.bild) {
              st.solution.image = l.bild;
              st.solution.neugezeichnet = true;
              loesungen++;
            }
            if (l.text) st.solution.text = l.text;
            if (l.mono) st.solution.mono = true;   /* Tabelle/Struktogramm: feste Breite */
          }
        });
      });
    });
    return { weg, ersetzt, ergaenzt, loesungen, falsch };
  }

  const ergebnis = aufraeumen();

  return {
    AUSBLENDEN, ERSATZ, ZUSATZ, LOESUNG, aufraeumen,
    NUR_BEI,
    entfernt: ergebnis.weg,
    falschZugeordnet: ergebnis.falsch,
    ersetzt: ergebnis.ersetzt,
    ergaenzt: ergebnis.ergaenzt,
    loesungen: ergebnis.loesungen
  };
})();
