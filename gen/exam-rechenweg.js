/* ============================================================================
   gen/exam-rechenweg.js — Rechenweg-Feld auch in den echten Prüfungen
   ----------------------------------------------------------------------------
   In den zehn eingelesenen Prüfungen sind 46 Teilaufgaben Rechenaufgaben —
   zusammen 200 BE, also rund 20 BE je Prüfung. Bisher gab es dafür nur ein
   leeres Textfeld: Ergebnis hinschreiben, fertig. Auf dem echten Bogen zählt
   aber der Rechenweg mit, und bei falschem Endergebnis rettet er die halbe
   Punktzahl (Folgefehlerbewertung).

   Diese Datei hängt unter jede erkannte Rechenaufgabe ein eigenes
   Rechenweg-Feld, zieht die Zwischenwerte aus der Musterlösung und zeigt nach
   dem Aufdecken, an welcher Stelle die eigene Rechnung abgewichen ist.
   Der Text wandert in die Antwort, also auch in Export, Druck und Auswertung.
   ========================================================================== */
"use strict";

window.GENEXAMWEG = (function () {
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const G = () => window.GEN;

  /* Zugriff auf die Bindungen von index.html (dort mit let/const deklariert) */
  const A = () => (typeof ANSWERS !== "undefined" ? ANSWERS : null);
  const V = () => (typeof VIEW !== "undefined" ? VIEW : null);
  const S = () => (typeof SHOW_SOL !== "undefined" ? SHOW_SOL : false);

  /* ------------------------------------------------------- Erkennung ---- */
  function istRechenaufgabe(it) {
    if (!it) return false;
    if (it.answerType === "diagram") return false;
    const txt = [it.prompt, it.groupIntro, it.task && it.task.intro].filter(Boolean).join(" ");
    if (!/berechnen|errechnen|ermitteln sie|rechnen sie|rechenweg|wie viel|wie hoch|wie lange|welche kosten|gesamtkosten|geben sie den rechenweg/i.test(txt)) return false;
    /* Eine Lösung ohne Zahlen ist keine Rechenaufgabe */
    const soll = werte(it);
    return soll.length >= 2;
  }

  const cache = {};
  function werte(it) {
    if (cache[it.k]) return cache[it.k];
    const txt = (it.solution && it.solution.text) || "";
    let w = [];
    try { w = G().zwischenwerte(txt, 12); } catch (e) { w = []; }
    /* Fällt die zeilenweise Erkennung durch (viele Lösungen sind Fließtext),
       nehmen wir alle Zahlen der Lösung in Lesereihenfolge.               */
    if (w.length < 3) {
      try {
        /* Musterlösungen sind kurz und bestehen fast nur aus der Rechnung —
           hier dürfen auch kleine Zahlen Zwischenwerte sein (2 × 3 TiB = 6). */
        const gesehen = new Set();
        w = G().zahlenAusText(txt.replace(/\d{1,3}(?:\.\d{1,3}){2,}/g, " "))
          .map(x => ({ roh: x.roh, wert: G().runde(x.wert, 4) }))
          .filter(x => {
            if (!isFinite(x.wert)) return false;
            if (Number.isInteger(x.wert) && Math.abs(x.wert) < 3) return false;
            if (Number.isInteger(x.wert) && x.wert >= 1900 && x.wert <= 2100) return false;
            const k = String(x.wert);
            if (gesehen.has(k)) return false;
            gesehen.add(k); return true;
          }).slice(0, 12);
      } catch (e) { w = []; }
    }
    cache[it.k] = w;
    return w;
  }

  const wegKey = k => k + "#weg";

  /* ------------------------------------------------------------- Aufbau - */
  function feldBauen(it) {
    const soll = werte(it);
    const box = el("div", "exw-box");

    const kopf = el("div", "exw-kopf");
    kopf.appendChild(el("span", "exw-lbl", "Rechenweg / Nebenrechnung"));
    kopf.appendChild(el("span", "exw-hint", "zählt über die Folgefehlerregel mit"));
    box.appendChild(kopf);

    box.appendChild(el("div", "exw-info",
      "Jeden Schritt in eine eigene Zeile. Auch wenn das Endergebnis kippt: für einen " +
      "nachvollziehbaren Rechenweg gibt es in der Prüfung Teilpunkte."));

    const ta = el("textarea", "exw-feld");
    ta.rows = 5; ta.spellcheck = false;
    ta.placeholder = "z. B.\n85 W × 2200 h = 187 kWh\n187 × 18 = 3.366 kWh\n3.366 × 0,37 € = …";
    const ans = A();
    ta.value = (ans && ans[wegKey(it.k)]) || "";
    ta.oninput = () => {
      const a = A(); if (!a) return;
      if (ta.value.trim()) a[wegKey(it.k)] = ta.value; else delete a[wegKey(it.k)];
      if (typeof window.speichern === "function") window.speichern();
      spurZeichnen(box, it, soll);
    };
    box.appendChild(ta);

    const spur = el("div", "exw-spur");
    box.appendChild(spur);
    spurZeichnen(box, it, soll);
    return box;
  }

  /** Zwischenwerte der Musterlösung anzeigen — erst wenn die Lösung offen ist */
  function spurZeichnen(box, it, soll) {
    const spur = box.querySelector(".exw-spur");
    if (!spur) return;
    spur.innerHTML = "";
    const ans = A();
    const mein = (ans && ans[wegKey(it.k)]) || "";

    if (!S()) {
      if (mein.trim()) {
        spur.appendChild(el("div", "exw-zu",
          "Die Zwischenwerte der Musterlösung erscheinen hier, sobald du die Lösung einblendest."));
      }
      return;
    }
    if (!soll.length) return;

    let w;
    try { w = G().pruefeRechenweg(mein, soll); } catch (e) { return; }
    spur.appendChild(el("div", "exw-titel", "Zwischenwerte der Musterlösung"));
    const kette = el("div", "exw-kette");
    soll.forEach((sv, i) => {
      const da = !w.fehlt.includes(sv.roh);
      const chip = el("span", "exw-wert " + (da ? "da" : "weg") +
        (i === w.ersteLuecke && i < w.kernN ? " bruch" : ""), sv.roh);
      chip.title = da ? "steht in deinem Rechenweg" : "fehlt in deinem Rechenweg";
      kette.appendChild(chip);
    });
    spur.appendChild(kette);

    if (mein.trim()) {
      const t = el("div", "exw-fazit" + (w.tragfaehig ? " gut" : " warn"));
      t.innerHTML = w.tragfaehig
        ? "<b>Der Rechenweg trägt.</b> " + w.gefunden + " von " + w.gesamt +
          " Zwischenwerten stimmen. Wäre nur das Endergebnis falsch, gäbe es in der " +
          "Prüfung dafür die halbe Punktzahl — vergiss das bei der Selbstbewertung nicht."
        : "<b>Noch zu wenig für Teilpunkte.</b> " + w.gefunden + " von " + w.gesamt +
          " Zwischenwerten erkannt" +
          (w.ersteLuecke >= 0 && w.ersteLuecke < w.kernN
            ? " · ab „" + soll[w.ersteLuecke].roh + "“ läuft es auseinander."
            : ".");
      spur.appendChild(t);
    }
  }

  /* -------------------------------------------------------- Nachrüsten -- */
  function nachruesten() {
    const view = V();
    if (!view || !view.items) return;
    document.querySelectorAll("#bogenMain .tk").forEach(karte => {
      const k = karte.dataset ? karte.dataset.k : null;
      if (!k) return;
      const it = view.items.find(x => x.k === k);
      if (!it) return;

      const vorhanden = karte.querySelector(".exw-box");
      if (!istRechenaufgabe(it)) { if (vorhanden) vorhanden.remove(); return; }

      if (vorhanden) { spurZeichnen(vorhanden, it, werte(it)); return; }
      const haupt = karte.querySelector(".tk-haupt");
      if (!haupt) return;
      /* hinter das letzte Antwortfeld, vor Lösung und Prüfhilfe */
      const anker = haupt.querySelector(".loesung, .pruefhilfe");
      const box = feldBauen(it);
      if (anker) haupt.insertBefore(box, anker); else haupt.appendChild(box);
    });
  }

  /* ------------------------------------------------------------ Einhängen */
  function einhaengen() {
    /* Rechenweg in die Antwort übernehmen — Export, Druck und „hat Antwort“ */
    const altText = window.antwortText;
    if (typeof altText === "function" && !altText.__exw) {
      const neu = function (it) {
        const basis = altText.apply(null, arguments);
        const ans = A();
        const w = (it && ans) ? (ans[wegKey(it.k)] || "").trim() : "";
        if (!w) return basis;
        return basis ? basis + "\n\nRechenweg:\n" + w : "Rechenweg:\n" + w;
      };
      neu.__exw = true;
      window.antwortText = neu;
    }

    const altBogen = window.zeigeBogen;
    if (typeof altBogen === "function" && !altBogen.__exw) {
      const neu = function () {
        const r = altBogen.apply(this, arguments);
        try { setTimeout(nachruesten, 0); } catch (e) { console.error("Rechenweg:", e); }
        return r;
      };
      neu.__exw = true;
      window.zeigeBogen = neu;
    }

    /* Beim Umschalten „Lösungen einblenden“ die Spur neu zeichnen */
    document.addEventListener("click", ev => {
      const t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest("#btnLoesung, #btnSol, [data-loesung]") &&
          !/lösung|loesung/i.test(t.textContent || "")) return;
      setTimeout(nachruesten, 30);
    }, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { istRechenaufgabe, werte, nachruesten, wegKey };
})();
