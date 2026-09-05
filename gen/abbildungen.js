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
  const AUSBLENDEN = new Set([
    "ap1-2021-h_p05_f1.png", "ap1-2021-h_p05_f2.png", "ap1-2021-h_p07_f3.png",
    "ap1-2021-h_p08_f2.png", "ap1-2021-h_p08_f3.png", "ap1-2021-h_p08_f4.png",
    "ap1-2021-h_p10_f2.png", "ap1-2021-h_p10_f9.png", "ap1-2021-h_p11_f2.png",
    "ap1-2021-h_p11_f3.png", "ap1-2022-f_p06_f2.png", "ap1-2022-f_p07_f2.png",
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
  const ZUSATZ = {
    "ap1-2025-f|b)|3": {
      file: "assets/svg/anschluesse-mfg.svg", width: 760, height: 170,
      titel: "Anschlüsse 1 bis 4", sourcePage: 3, neugezeichnet: true
    },
    "ap1-2025-f|c)|3": {
      file: "assets/svg/symbole-mfg.svg", width: 420, height: 150,
      titel: "Symbole 1 und 2", sourcePage: 3, neugezeichnet: true
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

    let ergaenzt = 0;
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
          if (z && !(st.assets || []).some(a => a.file === z.file)) {
            if (!Array.isArray(st.assets)) st.assets = [];
            st.assets.push(Object.assign({}, z));
            ergaenzt++;
          }
        });
      });
    });
    return { weg, ersetzt, ergaenzt };
  }

  const ergebnis = aufraeumen();

  return {
    AUSBLENDEN, ERSATZ, ZUSATZ, aufraeumen,
    entfernt: ergebnis.weg,
    ersetzt: ergebnis.ersetzt,
    ergaenzt: ergebnis.ergaenzt
  };
})();
