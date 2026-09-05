/* ============================================================================
   gen/simulation.js — Prüfungssimulation über 90 Minuten
   ----------------------------------------------------------------------------
   Ein normales Arbeitsblatt mischt alle Aufgabentypen gleich oft. Die echte
   AP1 tut das nicht: dort hängen 23 von 100 Punkten an Kalkulation und 16 an
   Netzwerken, und mehr als ein Drittel der Punkte sind schlichte Nennungen.
   Wer immer nur gemischt übt, trainiert eine Verteilung, die es in der
   Prüfung nicht gibt — und teilt sich die 90 Minuten falsch ein.

   Diese Datei stellt ein Blatt nach den GEMESSENEN Gewichten der zehn
   eingelesenen Prüfungen zusammen: 100 BE, Themen im richtigen Verhältnis,
   90 Minuten Countdown, Lösungen gesperrt bis zur Abgabe.
   ========================================================================== */
"use strict";

window.GENSIM = (function () {
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const G = () => window.GEN;

  /* ---------------------------------------------------------------------
     Gemessene Verteilung aus den zehn Prüfungen 2021–2026 (BE je Prüfung).
     Die Schlüssel sind die Themenschlüssel der Prüfungsdaten — genau die,
     die auch jede Generator-Vorlage als `thema` trägt.
     ------------------------------------------------------------------ */
  const GEWICHT = {
    kalkulation:    22.8,
    netzwerk:       15.8,
    hardware:       10.8,
    itsicherheit:    9.2,
    projekt:         8.6,
    daten:           8.3,
    software:        7.4,
    programmierung:  6.5,
    datenschutz:     3.5,
    arbeitsplatz:    3.0,
    ki:              2.2,   /* im Generator (noch) nicht abgedeckt */
    kommunikation:   2.0    /* im Generator (noch) nicht abgedeckt */
  };
  const LABEL = {
    kalkulation: "Kalkulation & Wirtschaft", netzwerk: "Netzwerke", hardware: "Hardware",
    itsicherheit: "IT-Sicherheit", projekt: "Projektmanagement", daten: "Daten & Speicher",
    software: "Software & UML", programmierung: "Algorithmen", datenschutz: "Datenschutz & Recht",
    arbeitsplatz: "Arbeitsplatz & Support", ki: "Künstliche Intelligenz", kommunikation: "Kommunikation"
  };

  const ZIEL_BE = 100;
  const MINUTEN = 90;

  /* ---------------------------------------------------------------------
     Klickanteil je Vorlage: welcher Anteil der Punkte ist Ankreuzen,
     Zuordnen oder richtig/falsch? Wird einmal gemessen und gemerkt.
     ------------------------------------------------------------------ */
  const KLICK = { auswahl: 1, mehrfachwahl: 1, aussagen: 1, zuordnung: 1 };
  const _klick = {};
  function klickAnteil(id) {
    if (_klick[id] != null) return _klick[id];
    let k = 0, g = 0;
    for (let s = 0; s < 5; s++) {
      let a; try { a = G().erzeuge(id, s * 7919 + 5); } catch (e) { break; }
      a.felder.forEach(f => { if (!f.be) return; g += f.be; if (KLICK[f.typ]) k += f.be; });
    }
    return (_klick[id] = g ? k / g : 0);
  }

  /** Eine Vorlage ziehen — je weniger Ankreuzpunkte, desto wahrscheinlicher */
  function gewichtetZiehen(pool, R) {
    const gew = pool.map(v => 1 / (1 + 4 * klickAnteil(v.id)));
    const summe = gew.reduce((s, x) => s + x, 0);
    let w = R.f() * summe;
    for (let i = 0; i < pool.length; i++) { w -= gew[i]; if (w <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  /* --------- Verteilung auf das umrechnen, was der Generator kann ------ */
  function budget() {
    const alle = G().alleVorlagen();
    const vorhanden = {}, fehlend = {};
    Object.keys(GEWICHT).forEach(k => {
      const n = alle.filter(v => v.thema === k).length;
      if (n) vorhanden[k] = GEWICHT[k]; else fehlend[k] = GEWICHT[k];
    });
    const summeDa = Object.values(vorhanden).reduce((s, x) => s + x, 0);
    const summeWeg = Object.values(fehlend).reduce((s, x) => s + x, 0);
    /* Was der Generator nicht kann, wird anteilig auf den Rest verteilt —
       ehrlich benannt, damit klar bleibt, dass hier eine Lücke ist.      */
    const plan = {};
    Object.keys(vorhanden).forEach(k => {
      plan[k] = vorhanden[k] / summeDa * ZIEL_BE;
    });
    return { plan, fehlend, summeWeg };
  }

  /* --------- Aufgaben ziehen, bis das Budget je Thema voll ist --------- */
  function stelleZusammen(saat) {
    const R = new (G().Rng)(saat == null ? ((Math.random() * 4294967295) >>> 0) : saat);
    const alle = G().alleVorlagen();
    const b = budget();
    const themen = Object.keys(b.plan);

    /* Kandidaten je Thema würfeln — mit BE, damit sich das Blatt danach
       sauber auf 100 BE trimmen lässt.                                   */
    function ziehe(thema) {
      const pool = alle.filter(v => v.thema === thema);
      if (!pool.length) return null;
      /* Aufgaben mit viel Ankreuzen und Zuordnen werden seltener gezogen:
         in der echten Prüfung machen die nur 2 % der Punkte aus, im
         Generator sonst gut 20 %. Sonst fällt die Simulation zu leicht aus. */
      const v = gewichtetZiehen(pool, R);
      const s = R.ganz(0, 2147483647);
      return { vorlageId: v.id, saat: s, thema, be: G().erzeuge(v.id, s).maxPoints };
    }

    /* 1. Grundstock: je Thema so weit füllen, wie das Budget trägt */
    const gewaehlt = [];
    const istJe = {};
    themen.forEach(t => {
      istJe[t] = 0;
      let schutz = 0;
      while (istJe[t] < b.plan[t] - 2 && schutz++ < 30) {
        const k = ziehe(t); if (!k) break;
        if (istJe[t] && istJe[t] + k.be > b.plan[t] + 2) continue;   // passt nicht mehr
        gewaehlt.push(k); istJe[t] += k.be;
      }
    });
    const summe = () => gewaehlt.reduce((s, k) => s + k.be, 0);

    /* 2. Global trimmen: solange über dem Ziel, aus dem Thema mit dem
          größten Überhang die Aufgabe entfernen, die am besten passt.  */
    let schutz = 0;
    while (summe() > ZIEL_BE + 3 && schutz++ < 40) {
      const ueber = themen.map(t => ({ t, d: istJe[t] - b.plan[t] })).sort((x, y) => y.d - x.d)[0];
      if (!ueber || ueber.d <= 0) break;
      let idx = -1, best = Infinity;
      gewaehlt.forEach((k, i) => {
        if (k.thema !== ueber.t) return;
        const rest = Math.abs(summe() - k.be - ZIEL_BE);
        if (rest < best) { best = rest; idx = i; }
      });
      if (idx < 0) break;
      istJe[ueber.t] -= gewaehlt[idx].be;
      gewaehlt.splice(idx, 1);
    }

    /* 3. Global auffüllen: fehlt noch etwas, kommt es aus dem Thema mit
          dem größten Rückstand.                                         */
    schutz = 0;
    while (summe() < ZIEL_BE - 3 && schutz++ < 40) {
      const unter = themen.map(t => ({ t, d: b.plan[t] - istJe[t] })).sort((x, y) => y.d - x.d)[0];
      const k = ziehe(unter.t); if (!k) break;
      if (summe() + k.be > ZIEL_BE + 6) {
        /* zu groß — lieber im kleinsten Thema etwas Kleines suchen */
        const klein = ziehe(R.waehle(themen));
        if (!klein || summe() + klein.be > ZIEL_BE + 6) break;
        gewaehlt.push(klein); istJe[klein.thema] += klein.be;
        continue;
      }
      gewaehlt.push(k); istJe[k.thema] += k.be;
    }

    let kBe = 0;
    gewaehlt.forEach(k => { kBe += klickAnteil(k.vorlageId) * k.be; });
    return {
      liste: R.mische(gewaehlt).map(k => ({ vorlageId: k.vorlageId, saat: k.saat })),
      be: G().runde(summe(), 1),
      klickAnteil: summe() ? kBe / summe() : 0,
      istJe, budget: b
    };
  }

  /* --------------------------------------------------------- Starten -- */
  function starten() {
    if (!window.GENUI) return;
    const z = stelleZusammen();
    if (!z.liste.length) { window.toast && window.toast("Keine Aufgaben verfügbar."); return; }
    window.GENUI.erzeugeBlatt({
      liste: z.liste,
      titel: "Prüfungssimulation · " + new Date().toLocaleDateString("de-DE"),
      zeit: 1, minuten: MINUTEN, pruefung: true
    });
  }

  /* --------------------------------------------------- Kachel im Start */
  function box() {
    const ziel = $("genStartBox");
    if (!ziel || $("simBox")) return;
    const b = budget();

    const kasten = el("div", "sim-box"); kasten.id = "simBox";

    const kopf = el("div", "sim-kopf");
    const links = el("div");
    links.appendChild(el("h3", null, "Prüfungssimulation — 90 Minuten, 100 BE"));
    links.appendChild(el("p", null,
      "Nicht gleichmäßig gemischt, sondern nach der gemessenen Verteilung der zehn " +
      "eingelesenen Prüfungen. Lösungen bleiben bis zur Abgabe gesperrt, die Uhr läuft rückwärts."));
    const start = el("button", "btn primary", "Prüfung starten");
    start.onclick = () => {
      if (!confirm("90 Minuten, 100 BE, keine Lösungen bis zur Abgabe. Jetzt starten?")) return;
      starten();
    };
    kopf.append(links, start);
    kasten.appendChild(kopf);

    /* Verteilung als Balken */
    const bal = el("div", "sim-balken");
    const max = Math.max(...Object.values(b.plan));
    Object.keys(b.plan).sort((x, y) => b.plan[y] - b.plan[x]).forEach(k => {
      const z = el("div", "sim-zeile");
      z.appendChild(el("span", "sim-name", LABEL[k] || k));
      const spur = el("span", "sim-spur");
      const i = el("i"); i.style.width = (b.plan[k] / max * 100) + "%";
      spur.appendChild(i);
      z.appendChild(spur);
      z.appendChild(el("span", "sim-be", Math.round(b.plan[k]) + " BE"));
      bal.appendChild(z);
    });
    kasten.appendChild(bal);

    const fehlt = Object.keys(b.fehlend);
    const hin = el("div", "sim-hinweis");
    hin.innerHTML = fehlt.length
      ? "<b>Offen:</b> für " + fehlt.map(k => LABEL[k] || k).join(" und ") +
        " gibt es im Generator noch keine Aufgaben (zusammen rund " +
        Math.round(b.summeWeg) + " BE je echter Prüfung). Diese Punkte sind hier auf die " +
        "übrigen Themen verteilt — in der echten Prüfung kommen sie zusätzlich."
      : "Alle Prüfungsthemen sind abgedeckt.";
    kasten.appendChild(hin);

    /* direkt unter den Einleitungstext, nicht ganz nach unten — das ist
       in den letzten Wochen die wichtigste Übung auf der Seite. */
    const nach = ziel.querySelector(".gen-hinweis");
    if (nach && nach.nextSibling) ziel.insertBefore(kasten, nach.nextSibling);
    else ziel.appendChild(kasten);
  }

  function einhaengen() {
    const alt = window.renderStart;
    if (typeof alt === "function") {
      window.renderStart = function () {
        alt.apply(null, arguments);
        try { box(); } catch (e) { console.error("Simulation:", e); }
      };
    }
    try { box(); } catch (e) { }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { starten, box, budget, stelleZusammen, klickAnteil, GEWICHT, ZIEL_BE, MINUTEN };
})();
