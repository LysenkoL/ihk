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
    "ap1-2021-h|1 c)|3": [TABELLE_2021, PLAN_2021],
    "ap1-2021-h|1 d)|3": [TABELLE_2021, PLAN_2021],
    "ap1-2021-h|1 e)|2": [TABELLE_2021, PLAN_2021]
  };

  /* --------- Musterlösungen, die es nur als Seitenfoto gab --------------- */
  /* Für 1 c) und 1 d) stand in der Lösung nur „(1 Punkt Ergänzung eines
     Netzplanknotens …)“ plus ein Foto der Lösungsseite. Der gelöste Netzplan
     ist jetzt gezeichnet — samt Rechenweg im Text.                        */
  const LOESUNG = {
    "ap1-2021-h|1 c)|3": {
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

    const durch = liste => {
      if (!Array.isArray(liste)) return;
      for (let i = liste.length - 1; i >= 0; i--) {
        const a = liste[i];
        if (!a || !a.file) continue;
        if (AUSBLENDEN.has(kurz(a.file))) { liste.splice(i, 1); weg++; continue; }
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

    let ergaenzt = 0, loesungen = 0;
    EX.forEach(ex => {
      durch(ex.attachments);
      if (ex.situation) durch(ex.situation.assets);
      (ex.tasks || []).forEach(t => {
        durch(t.assets);
        (t.subtasks || []).forEach(st => {
          durch(st.assets);
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
          }
        });
      });
    });
    return { weg, ersetzt, ergaenzt, loesungen };
  }

  const ergebnis = aufraeumen();

  return {
    AUSBLENDEN, ERSATZ, ZUSATZ, LOESUNG, aufraeumen,
    entfernt: ergebnis.weg,
    ersetzt: ergebnis.ersetzt,
    ergaenzt: ergebnis.ergaenzt,
    loesungen: ergebnis.loesungen
  };
})();
