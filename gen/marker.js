/* ============================================================================
   gen/marker.js — Textmarker für Aufgabentexte
   ----------------------------------------------------------------------------
   Beim Lesen einer IHK-Aufgabe steht das Entscheidende selten am Anfang: die
   Zahl, die man braucht, das Wörtchen „nicht“, der Operator, der bestimmt, ob
   drei Stichworte reichen oder ein Satz verlangt ist. Ohne Markierung liest
   man denselben Absatz drei Mal.

   Auf Papier nimmt man den Textmarker. Hier auch: Text mit der Maus oder dem
   Finger auswählen, aus dem kleinen Kasten eine Farbe wählen — fertig.

     gelb  = das ist gefragt (Operator, Anzahl, Ergebnisgröße)
     grün  = gegeben (Zahlen, Einheiten, Randbedingungen)
     rot   = Falle (nicht, kein, außer, mindestens, netto/brutto)

   Auf dem Handy stört die Auswahl: Android legt über die Markierung sein
   eigenes Menü („Kopieren“, „Teilen“, Wörterbuch) und verdeckt genau die
   Stelle, an der die Farbe gewählt werden soll. Deshalb gibt es dort einen
   Markierstift-Modus: einmal auf 🖍 tippen, danach färbt jeder Tipp auf ein
   Wort es gelb — ohne Auswahl, ohne Rückfrage, ohne fremdes Menü. Nochmal
   tippen nimmt die Farbe weg, Wischen färbt eine ganze Passage.

   Gespeichert wird nicht die Stelle im Dokument, sondern die Stelle im TEXT:
   Schlüssel ist eine Prüfsumme des Absatzes, dazu Anfang und Ende als
   Zeichenposition. Dadurch überlebt eine Markierung den Neuaufbau der Seite,
   den Wechsel zwischen Prüfung und Arbeitsblatt und jeden Reload — und
   derselbe Aufgabentext trägt seine Markierung überall.
   ========================================================================== */
"use strict";

window.GENMARKER = (function () {
  const SK = "ihk2:marker";
  const MAX = 600;                    /* so viele Absätze werden behalten */

  const FARBEN = [
    { key: "gelb", name: "gefragt", titel: "Das ist gefragt: Operator, Anzahl, Ergebnis" },
    { key: "gruen", name: "gegeben", titel: "Gegeben: Zahlen, Einheiten, Bedingungen" },
    { key: "rot", name: "Falle", titel: "Achtung: nicht, kein, außer, mindestens …" }
  ];

  const TIPP_FARBE = "gelb";      /* im Stiftmodus wird nur gelb gemalt */

  /* Wo darf markiert werden */
  const SELEKTOR = ".tk-frage, .gruppe-txt, .tk-gintro, .gfrage, .gsituation, " +
                   ".loesung-txt, .katalog-hinweis, .gmerksatz";

  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  /* ------------------------------------------------------------ Speicher */
  let DATEN = {};
  try { DATEN = JSON.parse(localStorage.getItem(SK)) || {}; } catch (e) { DATEN = {}; }

  function sichern() {
    try {
      const schluessel = Object.keys(DATEN);
      if (schluessel.length > MAX) {
        schluessel.sort((a, b) => (DATEN[a].z || 0) - (DATEN[b].z || 0));
        schluessel.slice(0, schluessel.length - MAX).forEach(k => delete DATEN[k]);
      }
      localStorage.setItem(SK, JSON.stringify(DATEN));
    } catch (e) { }
  }

  /* FNV-1a über den Absatztext — kurz, stabil, kollisionsarm genug */
  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36) + "-" + (s.length % 4096).toString(36);
  }

  /* -------------------------------------------------------- Bereichslogik */
  /* Bereiche liegen als [anfang, ende, farbe] vor, aufsteigend und ohne
     Überschneidung. Neues überschreibt Altes — wie ein echter Marker.     */
  function einfuegen(liste, a, b, farbe) {
    const raus = [];
    liste.forEach(r => {
      if (r[1] <= a || r[0] >= b) { raus.push(r); return; }      /* daneben */
      if (r[0] < a) raus.push([r[0], a, r[2]]);                  /* linker Rest */
      if (r[1] > b) raus.push([b, r[1], r[2]]);                  /* rechter Rest */
    });
    if (farbe) raus.push([a, b, farbe]);
    raus.sort((x, y) => x[0] - y[0]);
    /* gleichfarbige Nachbarn zusammenziehen */
    const fertig = [];
    raus.forEach(r => {
      const l = fertig[fertig.length - 1];
      if (l && l[2] === r[2] && l[1] >= r[0]) l[1] = Math.max(l[1], r[1]);
      else fertig.push(r.slice());
    });
    return fertig.filter(r => r[1] > r[0]);
  }

  /* ------------------------------------------------------- Textknoten ---- */
  function textKnoten(wurzel) {
    const w = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, null);
    const raus = []; let n;
    while ((n = w.nextNode())) raus.push(n);
    return raus;
  }

  let amArbeiten = false;

  function entmarkieren(box) {
    box.querySelectorAll("mark.mk").forEach(m => {
      const t = document.createTextNode(m.textContent);
      m.parentNode.replaceChild(t, m);
    });
    box.normalize();
  }

  function anwenden(box, liste) {
    amArbeiten = true;
    try {
      entmarkieren(box);
      if (!liste || !liste.length) return;
      /* von hinten nach vorne, dann verschieben sich die Positionen nicht */
      liste.slice().sort((a, b) => b[0] - a[0]).forEach(r => {
        const stellen = orte(box, r[0], r[1]);
        stellen.forEach(st => {
          const m = document.createElement("mark");
          m.className = "mk mk-" + r[2];
          try {
            const rg = document.createRange();
            rg.setStart(st.knoten, st.von);
            rg.setEnd(st.knoten, st.bis);
            rg.surroundContents(m);
          } catch (e) { }
        });
      });
    } finally { amArbeiten = false; }
  }

  /* Zeichenbereich [a,b) auf Textknoten-Stücke abbilden */
  function orte(box, a, b) {
    const raus = []; let pos = 0;
    textKnoten(box).forEach(n => {
      const len = n.nodeValue.length;
      const s = Math.max(a, pos), e = Math.min(b, pos + len);
      if (e > s) raus.push({ knoten: n, von: s - pos, bis: e - pos });
      pos += len;
    });
    return raus;
  }

  /* Position einer Auswahl innerhalb der Box in Zeichen */
  function versatz(box, knoten, offset) {
    let pos = 0, gefunden = -1;
    textKnoten(box).some(n => {
      if (n === knoten) { gefunden = pos + offset; return true; }
      pos += n.nodeValue.length;
      return false;
    });
    return gefunden;
  }

  /* ------------------------------------------------------------ Anzeigen */
  function schluesselVon(box) {
    if (!box.dataset.mkText) box.dataset.mkText = hash(box.textContent || "");
    return box.dataset.mkText;
  }

  function auffrischen(box) {
    const k = schluesselVon(box);
    const e = DATEN[k];
    anwenden(box, e && e.r);
  }

  function scannen() {
    if (amArbeiten) return;
    document.querySelectorAll(SELEKTOR).forEach(box => {
      if (box.closest("mark.mk")) return;
      const k = hash(box.textContent || "");
      if (box.dataset.mkFertig === k) return;
      box.dataset.mkText = k;
      const e = DATEN[k];
      if (e && e.r && e.r.length) anwenden(box, e.r);
      box.dataset.mkFertig = schluesselVon(box);
    });
  }

  /* ------------------------------------------------------- Stiftmodus --- */
  let malmodus = false;
  try { malmodus = localStorage.getItem("ihk2:marker:stift") === "1"; } catch (e) { }

  function stiftSetzen(an) {
    malmodus = !!an;
    document.body.classList.toggle("mk-stift", malmodus);
    try { localStorage.setItem("ihk2:marker:stift", malmodus ? "1" : "0"); } catch (e) { }
    const k = $("mkStift");
    if (k) { k.classList.toggle("an", malmodus); k.setAttribute("aria-pressed", malmodus ? "true" : "false"); }
    if (malmodus) {
      verstecken();
      const s = window.getSelection(); if (s) s.removeAllRanges();
      if (window.toast) window.toast("Markierstift an: tippe auf ein Wort. Wischen färbt mehrere.");
    }
  }

  /** Zeichenposition unter einem Bildschirmpunkt. */
  function stelleAn(box, x, y) {
    let r = null;
    if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(x, y);
    else if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p) { r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); }
    }
    if (!r || !box.contains(r.startContainer)) return -1;
    return versatz(box, r.startContainer, r.startOffset);
  }

  /** Endpunkt einer Wischgeste, die den Absatz verlassen hat: an den näheren
      Rand klemmen, statt die Geste wegzuwerfen. */
  function endeSchaetzen(box, x, y) {
    const r = box.getBoundingClientRect();
    const len = (box.textContent || "").length;
    if (y > r.bottom || (y >= r.top && x > r.right)) return len;
    if (y < r.top || (y <= r.bottom && x < r.left)) return 0;
    return -1;
  }

  /** Von einer Position auf das ganze Wort (bis zum nächsten Leerzeichen) ausweiten. */
  function wortUm(text, pos) {
    if (pos < 0) return null;
    let a = Math.min(pos, text.length - 1), b = a;
    if (a < 0) return null;
    if (/\s/.test(text[a])) {                 /* auf einer Lücke: nach links suchen */
      while (a > 0 && /\s/.test(text[a])) a--;
      b = a;
    }
    while (a > 0 && !/\s/.test(text[a - 1])) a--;
    while (b < text.length && !/\s/.test(text[b])) b++;
    return b > a ? [a, b] : null;
  }

  /** Tipp oder Wischen im Stiftmodus auswerten. */
  function malen_tipp(box, von, bis) {
    const text = box.textContent || "";
    const w1 = wortUm(text, von), w2 = wortUm(text, bis);
    if (!w1 && !w2) return;
    const a = Math.min((w1 || w2)[0], (w2 || w1)[0]);
    const b = Math.max((w1 || w2)[1], (w2 || w1)[1]);
    if (b <= a) return;

    const k = schluesselVon(box);
    const alt = (DATEN[k] && DATEN[k].r) || [];
    /* liegt der Anfang schon in einer Markierung? dann weg damit */
    const drin = alt.find(r => r[0] < b && r[1] > a);
    const neu = einfuegen(alt, drin ? Math.min(a, drin[0]) : a,
                               drin ? Math.max(b, drin[1]) : b,
                               drin ? null : TIPP_FARBE);
    if (neu.length) DATEN[k] = { r: neu, z: Date.now() };
    else delete DATEN[k];
    sichern();
    anwenden(box, neu);
    box.dataset.mkFertig = box.dataset.mkText;
  }

  /* ------------------------------------------------------------- Kasten - */
  let kasten = null;

  function kastenBauen() {
    if (kasten) return kasten;
    kasten = el("div", "mk-kasten");
    kasten.hidden = true;
    FARBEN.forEach(f => {
      const b = el("button", "mk-knopf mk-" + f.key, f.name);
      b.type = "button"; b.title = f.titel;
      b.onmousedown = ev => ev.preventDefault();     /* Auswahl behalten */
      b.onclick = () => malen(f.key);
      kasten.appendChild(b);
    });
    const w = el("button", "mk-knopf mk-weg", "löschen");
    w.type = "button"; w.title = "Markierung in der Auswahl entfernen";
    w.onmousedown = ev => ev.preventDefault();
    w.onclick = () => malen(null);
    kasten.appendChild(w);
    document.body.appendChild(kasten);
    return kasten;
  }

  function boxVon(knoten) {
    const e = knoten && (knoten.nodeType === 1 ? knoten : knoten.parentElement);
    return e ? e.closest(SELEKTOR) : null;
  }

  let letzte = null;      /* {box, a, b} */

  function auswahlPruefen() {
    if (malmodus) return verstecken();
    const s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return verstecken();
    const r = s.getRangeAt(0);
    const box = boxVon(r.startContainer);
    if (!box || box !== boxVon(r.endContainer)) return verstecken();
    const a = versatz(box, r.startContainer, r.startOffset);
    const b = versatz(box, r.endContainer, r.endOffset);
    if (a < 0 || b < 0 || b - a < 1) return verstecken();
    letzte = { box, a: Math.min(a, b), b: Math.max(a, b) };
    zeigen(r);
  }

  function zeigen(r) {
    const k = kastenBauen();
    k.hidden = false;
    const rect = r.getBoundingClientRect();
    const bb = k.getBoundingClientRect();
    let x = rect.left + rect.width / 2 - bb.width / 2;
    let y = rect.top - bb.height - 10;
    if (y < 8) y = rect.bottom + 10;
    x = Math.max(8, Math.min(x, window.innerWidth - bb.width - 8));
    k.style.left = Math.round(x) + "px";
    k.style.top = Math.round(y) + "px";
  }

  function verstecken() {
    if (kasten) kasten.hidden = true;
    letzte = null;
  }

  function malen(farbe) {
    if (!letzte) return;
    const { box, a, b } = letzte;
    const k = schluesselVon(box);
    const alt = (DATEN[k] && DATEN[k].r) || [];
    const neu = einfuegen(alt, a, b, farbe);
    if (neu.length) DATEN[k] = { r: neu, z: Date.now() };
    else delete DATEN[k];
    sichern();
    anwenden(box, neu);
    box.dataset.mkFertig = box.dataset.mkText;
    const s = window.getSelection(); if (s) s.removeAllRanges();
    verstecken();
  }

  /* ------------------------------------------------------------ Aufräumen */
  function alleLoeschen() {
    if (!confirm("Alle Textmarkierungen löschen?")) return;
    DATEN = {}; sichern();
    document.querySelectorAll(SELEKTOR).forEach(b => { anwenden(b, null); delete b.dataset.mkFertig; });
  }

  function anzahl() {
    return Object.keys(DATEN).reduce((n, k) => n + (DATEN[k].r || []).length, 0);
  }

  /* --------------------------------------------------- Knopf im Kopf ---- */
  function stiftKnopf() {
    if ($("mkStift")) return $("mkStift");
    const kopf = document.querySelector(".kopf .kopf-in");
    if (!kopf) return null;
    const b = el("button", "mk-stift", "🖍");
    b.id = "mkStift"; b.type = "button";
    b.title = "Markierstift: tippe auf ein Wort, um es gelb zu färben";
    b.setAttribute("aria-label", "Markierstift");
    b.onclick = ev => { ev.stopPropagation(); stiftSetzen(!malmodus); };
    const km = $("kmKnopf");
    if (km) kopf.insertBefore(b, km); else kopf.appendChild(b);
    b.classList.toggle("an", malmodus);
    return b;
  }

  /** Der Stift erscheint nur, wo es etwas zu markieren gibt. */
  function knopfPflegen() {
    const b = stiftKnopf();
    if (!b) return;
    const etwas = !!document.querySelector(".tk-frage, .gfrage, .gruppe-txt, .gsituation");
    b.hidden = !etwas;
    if (!etwas && malmodus) document.body.classList.remove("mk-stift");
    else document.body.classList.toggle("mk-stift", malmodus);
  }

  /* ------------------------------------------------- Legende & Aufräumen */
  /* Die Erklärung steht dort, wo auch der Rest der eigenen Daten liegt:
     im Abschnitt „Fortschritt sichern“.                                   */
  function legendeBauen() {
    const s = document.getElementById("scStart");
    if (!s || document.getElementById("mkHilfe")) return;
    const h = [...s.querySelectorAll("h2")].find(x => /^Fortschritt sichern/.test((x.textContent || "").trim()));
    if (!h || !h.parentNode) return;
    const box = el("div", "mk-hilfe"); box.id = "mkHilfe";
    box.appendChild(el("span", null,
      "Textmarker: oben auf 🖍 tippen, dann färbt jeder Tipp auf ein Wort es gelb " +
      "(nochmal tippen nimmt es weg, Wischen färbt mehrere). Ohne Stift: Text " +
      "auswählen und Farbe wählen —"));
    FARBEN.forEach(f => {
      const p = el("span", "mk-probe mk-" + f.key, f.name);
      box.appendChild(p);
    });
    const z = el("span", null, "");
    box.appendChild(z);
    const w = el("button", "btn ghost klein", "alle Markierungen löschen");
    w.type = "button";
    w.onclick = () => { alleLoeschen(); z.textContent = anzahl() + " Markierungen"; };
    box.appendChild(w);
    z.textContent = anzahl() + " Markierungen";
    h.parentNode.appendChild(box);
  }

  /* Einmaliger Hinweis, wenn zum ersten Mal eine Aufgabe offen ist */
  function tipp() {
    try {
      if (localStorage.getItem("ihk2:marker:tip")) return;
      if (!document.querySelector(".tk-frage, .gfrage")) return;
      localStorage.setItem("ihk2:marker:tip", "1");
      if (window.toast) window.toast("Neu: Text in der Aufgabe auswählen — dann erscheint der Textmarker.");
    } catch (e) { }
  }

  /* --------------------------------------------------------- Einhängen -- */
  let warten = null;
  function spaeter() {
    if (amArbeiten) return;
    clearTimeout(warten);
    warten = setTimeout(scannen, 120);
  }

  function einhaengen() {
    document.addEventListener("selectionchange", () => {
      clearTimeout(auswahlPruefen._t);
      auswahlPruefen._t = setTimeout(auswahlPruefen, 90);
    });
    document.addEventListener("mousedown", ev => {
      if (kasten && !kasten.hidden && !kasten.contains(ev.target)) verstecken();
    });

    /* Stiftmodus: Tippen und Wischen statt Auswählen */
    let start = null;
    document.addEventListener("pointerdown", ev => {
      if (!malmodus) return;
      const box = boxVon(ev.target);
      if (!box) return;
      start = { box: box, x: ev.clientX, y: ev.clientY, pos: stelleAn(box, ev.clientX, ev.clientY) };
    }, true);
    document.addEventListener("pointerup", ev => {
      if (!malmodus || !start) return;
      const s = start; start = null;
      /* Maßgeblich ist die Box, in der der Finger AUFGESETZT hat. Beim
         Wischen über einen Zeilenumbruch liegt der Endpunkt sonst schon
         außerhalb, und die ganze Geste ginge verloren.                  */
      const box = s.box;
      let bis = stelleAn(box, ev.clientX, ev.clientY);
      const gewischt = Math.abs(ev.clientX - s.x) + Math.abs(ev.clientY - s.y) > 12;
      if (bis < 0 && gewischt) bis = endeSchaetzen(box, ev.clientX, ev.clientY);
      if (s.pos < 0 && bis < 0) return;
      ev.preventDefault();
      malen_tipp(box, s.pos < 0 ? bis : s.pos, bis < 0 ? s.pos : bis);
    }, true);
    document.addEventListener("pointercancel", () => { start = null; }, true);
    window.addEventListener("resize", verstecken);

    const alt = window.renderStart;
    if (typeof alt === "function") {
      window.renderStart = function () {
        alt.apply(null, arguments);
        try { setTimeout(legendeBauen, 0); } catch (e) { console.error("Marker:", e); }
      };
    }

    const beo = new MutationObserver(() => { spaeter(); knopfPflegen(); });
    beo.observe(document.body, { childList: true, subtree: true });
    scannen();
    knopfPflegen();
    setTimeout(() => { legendeBauen(); tipp(); knopfPflegen(); }, 400);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { scannen, anwenden, alleLoeschen, anzahl, legendeBauen, stiftSetzen,
           stift: () => malmodus, daten: () => DATEN, FARBEN, SELEKTOR, hash };
})();
