/* ============================================================================
   gen/kompakt.js — Prüfungsansicht auf dem Handy: Platz für die Aufgabe
   ----------------------------------------------------------------------------
   Nachgemessen auf einem 6,1-Zoll-Gerät: von 1900 Bildpunkten Höhe gingen
   350 an die Kopfzeile (Marke, Titel über zwei Zeilen, Kästchen „veraltete
   ausblenden“, Uhr, Selbstbewertung, Start, Dunkel) und 450 an die Fußleiste
   (zwei Zählerzeilen und fünf Knöpfe). Zusammen 42 % — für die Aufgabe, um
   die es geht, blieb gut die Hälfte des Bildschirms.

   Diese Datei legt beides auf dem Handy zu je einer Zeile zusammen:

     oben   IHK AP1 · Frühjahr 2026        1:29:04   ☰
     unten  8/27 · 31/100 BE      nächste offene ↓   ⋯

   Alles Übrige zieht in zwei Klappfächer hinter ☰ und ⋯. Die Knöpfe selbst
   werden dabei VERSCHOBEN, nicht nachgebaut — sie behalten ihre Ereignis-
   behandlung, ihre Beschriftung und ihren Zustand. Am Schreibtisch (breiter
   als 700 px) wandert alles an seinen alten Platz zurück.
   ========================================================================== */
"use strict";

window.GENKOMPAKT = (function () {
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  const MQ = window.matchMedia ? window.matchMedia("(max-width: 700px)") : null;

  /* Was in welches Fach zieht. Reihenfolge = Reihenfolge im Fach. */
  const KOPF_FACH = ["btnUhr", "schalterKatalog", "mwPunkte", "btnTheme"];
  const FUSS_FACH = ["btnLoes", "btnDrucken", "btnReset", "btnAbgeben"];

  const heimat = {};        /* id -> {eltern, davor} — für den Rückweg */
  let gebaut = false;

  function merken(id) {
    const n = $(id);
    if (!n || heimat[id]) return n;
    heimat[id] = { eltern: n.parentNode, davor: n.nextSibling };
    return n;
  }

  function zurueck(id) {
    const n = $(id), h = heimat[id];
    if (!n || !h || !h.eltern) return;
    h.eltern.insertBefore(n, h.davor && h.davor.parentNode === h.eltern ? h.davor : null);
  }

  /* ---------------------------------------------------------- Aufbauen -- */
  function bauen() {
    if (gebaut) return;
    const kopfIn = document.querySelector(".kopf .kopf-in");
    const fussIn = document.querySelector("#fuss .fuss-in");
    if (!kopfIn || !fussIn) return;

    /* ---- Kopf: ☰ und Fach ---- */
    const kb = el("button", "km-menue", "☰");
    kb.type = "button"; kb.id = "kmKnopf";
    kb.setAttribute("aria-label", "Werkzeuge");
    kopfIn.appendChild(kb);

    const kf = el("div", "km-fach"); kf.id = "kmFach"; kf.hidden = true;
    document.querySelector(".kopf").appendChild(kf);
    KOPF_FACH.forEach(id => { const n = merken(id); if (n) kf.appendChild(n); });

    kb.onclick = ev => { ev.stopPropagation(); auf(kf, kb); };

    /* ---- Fuß: ⋯ und Fach ---- */
    const fb = el("button", "km-menue", "⋯");
    fb.type = "button"; fb.id = "kfKnopf";
    fb.setAttribute("aria-label", "Weitere Aktionen");
    fussIn.appendChild(fb);

    const ff = el("div", "km-fach km-fach-unten"); ff.id = "kfFach"; ff.hidden = true;
    $("fuss").appendChild(ff);
    FUSS_FACH.forEach(id => { const n = merken(id); if (n) ff.appendChild(n); });

    fb.onclick = ev => { ev.stopPropagation(); auf(ff, fb); };

    /* Nach jedem Klick im Fach schließen — der Knopf hat schon gewirkt */
    [kf, ff].forEach(f => f.addEventListener("click", ev => {
      if (ev.target.closest("button") && !ev.target.closest("label")) setTimeout(zu, 30);
    }));

    document.addEventListener("click", zu);
    window.addEventListener("scroll", zu, { passive: true });

    document.body.classList.add("kompakt");
    gebaut = true;
    kuerzen();
  }

  function auf(fach, knopf) {
    const offen = !fach.hidden;
    zu();
    if (offen) return;
    fach.hidden = false;
    knopf.classList.add("offen");
  }

  function zu() {
    ["kmFach", "kfFach"].forEach(id => { const f = $(id); if (f) f.hidden = true; });
    ["kmKnopf", "kfKnopf"].forEach(id => { const k = $(id); if (k) k.classList.remove("offen"); });
  }

  /* ---------------------------------------------------------- Abbauen --- */
  function abbauen() {
    if (!gebaut) return;
    zu();
    KOPF_FACH.concat(FUSS_FACH).forEach(zurueck);
    ["kmFach", "kfFach", "kmKnopf", "kfKnopf"].forEach(id => {
      const n = $(id); if (n && n.parentNode) n.parentNode.removeChild(n);
    });
    document.removeEventListener("click", zu);
    window.removeEventListener("scroll", zu);
    document.body.classList.remove("kompakt");
    const t = $("kTitelKurz"); if (t && t.parentNode) t.parentNode.removeChild(t);
    gebaut = false;
  }

  /* ------------------------------------------------- Titel und Zähler --- */
  /* „Einrichten eines IT-gestützten Arbeitsplatzes“ über zwei Zeilen bringt
     auf dem Handy nichts — welche Prüfung offen ist, sagt die Zeile darüber. */
  function kuerzen() {
    if (!gebaut) return;
    const box = $("kopfTitel");
    if (box && !$("kTitelKurz")) {
      const k = el("div", "km-kurz"); k.id = "kTitelKurz";
      box.appendChild(k);
    }
    const k = $("kTitelKurz");
    if (k) {
      const e = ($("kEyebrow") || {}).textContent || "";
      k.textContent = e.replace(/\s*·\s*/g, " · ").trim();
    }
    zaehler();
  }

  /* Beide Zählerzeilen in eine: „8/27 · 31/100 BE“ */
  function zaehler() {
    const fussIn = document.querySelector("#fuss .fuss-in");
    if (!fussIn) return;
    let z = $("kmZaehler");
    if (!z) {
      z = el("span", "km-zaehler"); z.id = "kmZaehler";
      fussIn.insertBefore(z, fussIn.firstChild);
    }
    const a = ($("statAnz") || {}).textContent || "";
    const b = ($("statBe") || {}).textContent || "";
    const n = ($("statNote") || {}).textContent || "";
    const neu = a + (b ? " · " + b + " BE" : "") + (n ? " · " + n : "");
    if (z.textContent !== neu) z.textContent = neu;   /* sonst dreht sich der Beobachter im Kreis */
  }

  /* ------------------------------------------------------------ Pflege -- */
  function pruefen() {
    if (MQ && MQ.matches) { bauen(); kuerzen(); }
    else abbauen();
  }

  function einhaengen() {
    if (MQ) {
      if (MQ.addEventListener) MQ.addEventListener("change", pruefen);
      else if (MQ.addListener) MQ.addListener(pruefen);
    }
    /* schirm() setzt Titel und Sichtbarkeiten — danach nachziehen */
    const altSchirm = window.schirm;
    if (typeof altSchirm === "function") {
      window.schirm = function () {
        altSchirm.apply(null, arguments);
        try { zu(); pruefen(); } catch (e) { console.error("Kompakt:", e); }
      };
    }
    /* Zähler aktualisieren, wenn index.html sie neu schreibt */
    const ziel = $("statBe");
    if (ziel && window.MutationObserver) {
      new MutationObserver(() => { if (gebaut) zaehler(); })
        .observe($("fuss"), { childList: true, subtree: true, characterData: true });
    }
    pruefen();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { bauen, abbauen, pruefen, zu, aktiv: () => gebaut };
})();
