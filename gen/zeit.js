/* ============================================================================
   gen/zeit.js — wie lange dauert welcher Aufgabentyp?
   ----------------------------------------------------------------------------
   In der AP1 sind 100 Bewertungseinheiten in 90 Minuten zu schaffen. Das sind
   0,9 Minuten — 54 Sekunden — pro BE. Wer das nicht weiß, merkt erst in der
   Prüfung, dass die zwei Rechenaufgaben eine Viertelstunde gefressen haben
   und für die letzten drei „Nennen Sie …“ nichts mehr übrig ist.

   Diese Datei misst still mit: sobald ein Antwortfeld den Fokus bekommt, läuft
   für diese Aufgabe die Uhr; sie hält an, wenn eine andere Aufgabe dran ist,
   der Tab in den Hintergrund geht oder 90 Sekunden lang nichts passiert.
   Gerechnet wird nicht in Sekunden pro Aufgabe, sondern in Sekunden pro BE —
   nur so sind eine 2-BE-Frage und eine 9-BE-Rechnung vergleichbar.

   Sechs Typen, weil sie sich im Tempo wirklich unterscheiden:
     nennen · begründen/erläutern · rechnen · Tabelle · Diagramm · Sonstiges

   Nichts davon verlässt den Browser. Wer die Messung nicht will, löscht sie
   auf der Startseite mit einem Klick.
   ========================================================================== */
"use strict";

window.GENZEIT = (function () {
  const SK = "ihk2:zeit";
  const BUDGET = 54;              /* Sekunden je BE: 90 min / 100 BE */
  const PAUSE_MS = 90000;         /* so lange Stille zählt noch als Arbeit */
  const MAX_KARTEN = 500;

  const TYPEN = [
    { key: "diagramm", name: "Diagramm / Modell" },
    { key: "tabelle", name: "Tabelle ausfüllen" },
    { key: "rechnen", name: "Rechnen" },
    { key: "begruenden", name: "Begründen / Erläutern" },
    { key: "nennen", name: "Nennen / Aufzählen" },
    { key: "sonst", name: "Sonstiges" }
  ];
  const NAME = {}; TYPEN.forEach(t => NAME[t.key] = t.name);

  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  /* ------------------------------------------------------------ Speicher */
  let DATEN = { karten: {} };
  try {
    const r = JSON.parse(localStorage.getItem(SK));
    if (r && r.karten) DATEN = r;
  } catch (e) { }

  let schreibWartet = null;
  function sichern(sofort) {
    clearTimeout(schreibWartet);
    const tun = () => {
      try {
        const k = Object.keys(DATEN.karten);
        if (k.length > MAX_KARTEN) {
          k.sort((a, b) => (DATEN.karten[a].z || 0) - (DATEN.karten[b].z || 0));
          k.slice(0, k.length - MAX_KARTEN).forEach(x => delete DATEN.karten[x]);
        }
        localStorage.setItem(SK, JSON.stringify(DATEN));
      } catch (e) { }
    };
    if (sofort) tun(); else schreibWartet = setTimeout(tun, 800);
  }

  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return h.toString(36);
  }

  /* --------------------------------------------------- Aufgabe erkennen -- */
  const RE_RECHNEN = /\b(berechne|errechne|ermittle|ermitteln Sie|berechnen Sie|errechnen Sie|weisen Sie durch eine Rechnung|Rechenweg)/i;
  const RE_BEGRUEND = /\b(erläuter|begründ|beschreib|erklär|beurteil|vergleich|analysier|bewert)/i;
  const RE_NENNEN = /\b(nennen Sie|benennen Sie|geben Sie .{0,24}an\b|zählen Sie|führen Sie .{0,12}an\b|machen Sie .{0,24}(vorschläge|vorschlag)|unterbreiten Sie|stellen Sie .{0,20}vor\b|wählen Sie)/i;
  const RE_DIAGRAMM = /\b(netzplan|struktogramm|gantt|er-modell|entity|uml|anwendungsfall|use.?case|aktivitätsdiagramm|klassendiagramm|diagramm|skizze|zeichnen Sie)/i;
  const RE_TABELLE = /\b(tragen Sie .{0,30}tabelle|ergänzen Sie .{0,30}tabelle|in der folgenden Tabelle|füllen Sie .{0,20}tabelle|in die nachfolgende Tabelle|ordnen Sie .{0,20}zu)/i;

  function karteVon(knoten) {
    const e = knoten && (knoten.nodeType === 1 ? knoten : knoten.parentElement);
    return e ? e.closest(".tk[data-k], .gaufgabe") : null;
  }

  /** Typ und BE einer Karte bestimmen — allein aus dem, was im DOM steht. */
  function bestimme(karte) {
    const gen = karte.classList.contains("gaufgabe");
    const frage = karte.querySelector(gen ? ".gfrage" : ".tk-frage");
    const text = (frage ? frage.textContent : karte.textContent) || "";

    /* BE: im Prüfungsbogen aus ALLE, im Generator aus „von X BE“ */
    let be = 0;
    if (!gen) {
      try {
        const k = karte.dataset.k;
        const it = (typeof ALLE !== "undefined" && ALLE ? ALLE : []).find(x => x.k === k);
        be = (it && it.maxPoints) || 0;
      } catch (e) { }
    }
    if (!be) {
      const m = /von\s+([\d.,]+)\s*BE/.exec(karte.textContent || "");
      if (m) be = parseFloat(m[1].replace(",", ".")) || 0;
    }

    /* Typ — die auffälligste Bauform gewinnt vor dem Wortlaut */
    let typ = "sonst";
    if (karte.querySelector(".ex-dia, .gmodell, .exd-gitter, .netz-tab, .gnetz")) typ = "diagramm";
    else if (RE_DIAGRAMM.test(text)) typ = "diagramm";
    else if (karte.querySelector(".gtab-rollen, .gtabelle, table input, table textarea, table select")) typ = "tabelle";
    else if (RE_TABELLE.test(text)) typ = "tabelle";
    else if (RE_RECHNEN.test(text)) typ = "rechnen";
    else if (RE_BEGRUEND.test(text)) typ = "begruenden";
    else if (RE_NENNEN.test(text)) typ = "nennen";

    const key = (gen ? "g|" : "e|") + (gen ? hash(text) : karte.dataset.k);
    return { key, typ, be, gen };
  }

  /* -------------------------------------------------------------- Uhr --- */
  let aktiv = null;             /* {key, typ, be} */
  let letzte = 0;               /* Zeitpunkt der letzten Regung */
  let ticker = null;

  function regung() { letzte = Date.now(); }

  function starte(karte) {
    const info = bestimme(karte);
    if (aktiv && aktiv.key === info.key) { regung(); return; }
    halte();
    aktiv = info;
    regung();
    if (!ticker) ticker = setInterval(tick, 1000);
  }

  function halte() {
    if (aktiv) sichern(true);      /* beim Wechsel sofort wegschreiben */
    aktiv = null;
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function tick() {
    if (!aktiv) return halte();
    if (document.hidden) return;                       /* Tab im Hintergrund */
    if (Date.now() - letzte > PAUSE_MS) return halte(); /* eingeschlafen */
    const e = DATEN.karten[aktiv.key] || (DATEN.karten[aktiv.key] = { t: aktiv.typ, be: aktiv.be, s: 0 });
    e.t = aktiv.typ;
    if (aktiv.be) e.be = aktiv.be;
    e.s += 1;
    e.z = Date.now();
    if (e.s % 5 === 0) sichern();
  }

  /* ------------------------------------------------------- Auswertung --- */
  function daten() {
    const proTyp = {};
    TYPEN.forEach(t => proTyp[t.key] = { key: t.key, name: t.name, s: 0, be: 0, n: 0 });
    let gesamtS = 0, gesamtBE = 0;
    Object.keys(DATEN.karten).forEach(k => {
      const e = DATEN.karten[k];
      if (!e || e.s < 10) return;                  /* Streifschüsse zählen nicht */
      const z = proTyp[e.t] || proTyp.sonst;
      z.s += e.s; z.be += (e.be || 0); z.n++;
      gesamtS += e.s; gesamtBE += (e.be || 0);
    });
    const zeilen = TYPEN.map(t => proTyp[t.key]).filter(z => z.n > 0).map(z => {
      z.proBE = z.be > 0 ? z.s / z.be : null;
      z.proAufgabe = z.s / z.n;
      z.faktor = z.proBE != null ? z.proBE / BUDGET : null;
      return z;
    });
    zeilen.sort((a, b) => (b.faktor || 0) - (a.faktor || 0));
    return {
      zeilen, gesamtS, gesamtBE, BUDGET,
      schnitt: gesamtBE > 0 ? gesamtS / gesamtBE : null,
      hochgerechnet: gesamtBE > 0 ? Math.round(gesamtS / gesamtBE * 100 / 60) : null
    };
  }

  function mmss(sek) {
    const m = Math.floor(sek / 60), s = Math.round(sek % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  /* ----------------------------------------------------------- Anzeige -- */
  function box() {
    const s = $("scStart");
    if (!s) return;
    const d = daten();
    let b = $("zeitBox");
    if (!b) {
      b = el("div", "abschnitt"); b.id = "zeitBox";
      /* hinter „Wo stehe ich“ — aber NEBEN dessen Klappfach, nicht darin,
         damit gen/start.js daraus einen eigenen Block machen kann          */
      const g = $("planBox") || $("gesamtBox");
      const nach = g ? (g.closest("details.st-block") || g) : null;
      if (nach && nach.parentNode) nach.parentNode.insertBefore(b, nach.nextSibling);
      else s.appendChild(b);
    }
    b.innerHTML = "";
    b.appendChild(el("h2", null, "Tempo — Sekunden je BE"));

    if (!d.zeilen.length) {
      b.appendChild(el("p", null,
        "Sobald du Aufgaben bearbeitest, wird hier mitgemessen, wie lange du je Aufgabentyp " +
        "brauchst. In der Prüfung stehen 54 Sekunden pro BE zur Verfügung (90 Minuten für 100 BE)."));
      return;
    }

    const kopf = el("p", null, "");
    kopf.innerHTML = "Gemessen wird nur, während du wirklich an einer Aufgabe bist. " +
      "<b>" + d.zeilen.reduce((n, z) => n + z.n, 0) + " Aufgaben</b>, zusammen " +
      mmss(d.gesamtS) + " Minuten." +
      (d.hochgerechnet != null
        ? " In deinem Tempo bräuchtest du für 100 BE <b>rund " + d.hochgerechnet +
          " Minuten</b> — erlaubt sind 90."
        : "");
    b.appendChild(kopf);

    const t = el("div", "zt-liste");
    d.zeilen.forEach(z => {
      const r = el("div", "zt-zeile" + (z.faktor != null && z.faktor > 1.15 ? " eng" :
                                       (z.faktor != null && z.faktor < 0.8 ? " gut" : "")));
      r.appendChild(el("span", "zt-name", z.name));
      r.appendChild(el("span", "zt-n", z.n + "×"));
      const spur = el("span", "zt-spur");
      const i = el("i");
      const anteil = z.faktor != null ? Math.min(2, z.faktor) / 2 : 0;
      i.style.width = (anteil * 100) + "%";
      spur.appendChild(i);
      const marke = el("b", "zt-marke");        /* Budgetlinie bei 54 s */
      marke.style.left = "50%";
      spur.appendChild(marke);
      r.appendChild(spur);
      r.appendChild(el("span", "zt-wert",
        z.proBE != null ? Math.round(z.proBE) + " s/BE" : mmss(z.proAufgabe) + " je Aufg."));
      t.appendChild(r);
    });
    b.appendChild(t);

    const eng = d.zeilen.filter(z => z.faktor != null && z.faktor > 1.15);
    const fazit = el("div", "zt-fazit");
    if (eng.length) {
      fazit.innerHTML = "<b>Zeitfresser: " + eng.map(z => z.name).join(", ") + ".</b> " +
        "Das ist die Stelle zum Üben — nicht unbedingt, weil du es nicht kannst, sondern " +
        "weil es dich Minuten kostet, die am Ende bei anderen Aufgaben fehlen.";
    } else {
      fazit.innerHTML = "<b>Du liegst überall im Budget.</b> " +
        "Die 54 Sekunden je BE sind ein Mittelwert — kurze „Nennen Sie“-Aufgaben dürfen " +
        "deutlich schneller gehen, damit für Rechnen und Diagramme Luft bleibt.";
    }
    b.appendChild(fazit);

    const fuss = el("div", "zt-fuss");
    fuss.appendChild(el("span", null, "Die Linie in der Mitte ist das Prüfungsbudget von 54 s/BE."));
    const w = el("button", "btn ghost klein", "Messung zurücksetzen");
    w.onclick = () => {
      if (!confirm("Alle gemessenen Zeiten löschen?")) return;
      DATEN = { karten: {} };
      try { localStorage.removeItem(SK); } catch (e) { }
      box();
    };
    fuss.appendChild(w);
    b.appendChild(fuss);
  }

  /* --------------------------------------------------------- Einhängen -- */
  function einhaengen() {
    document.addEventListener("focusin", ev => {
      const k = karteVon(ev.target);
      if (k) starte(k); else halte();
    });
    ["keydown", "pointerdown", "input"].forEach(n =>
      document.addEventListener(n, regung, { passive: true }));
    document.addEventListener("visibilitychange", () => { if (document.hidden) { halte(); sichern(true); } });
    window.addEventListener("pagehide", () => { halte(); sichern(true); });
    window.addEventListener("beforeunload", () => { halte(); sichern(true); });

    const alt = window.renderStart;
    if (typeof alt === "function") {
      window.renderStart = function () {
        alt.apply(null, arguments);
        try { setTimeout(box, 0); } catch (e) { console.error("Zeit:", e); }
      };
    }
    setTimeout(box, 260);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { daten, box, bestimme, BUDGET, TYPEN, roh: () => DATEN };
})();
