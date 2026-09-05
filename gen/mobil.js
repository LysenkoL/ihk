/* ============================================================================
   gen/mobil.js — kleine Helfer für die Handyansicht
   ----------------------------------------------------------------------------
   Das Meiste macht mobil.css. Hier bleibt nur, was CSS nicht kann:
     • Hinweis „seitwärts wischen“ über Tabellen, die breiter sind als das Display
     • die klebende Aufgabenleiste unter den tatsächlich hohen Kopf schieben
   Ändert am Desktop nichts.
   ========================================================================== */
"use strict";

window.GENMOBIL = (function () {

  const handy = () => window.matchMedia("(max-width: 700px)").matches;

  /* --------- Hinweis über breite Tabellen ------------------------------- */
  const BREIT = "table.gdaten, table.gzuo, table.graster, table.gwf, table.gknoten, " +
                "table.gmodell, table.tab, table.prio, table.bringer";

  function wischHinweise() {
    document.querySelectorAll(".g-wisch").forEach(x => x.remove());
    if (!handy()) return;
    document.querySelectorAll(BREIT).forEach(t => {
      if (t.scrollWidth <= t.clientWidth + 4) return;
      const h = document.createElement("div");
      h.className = "g-wisch";
      h.textContent = "← seitwärts wischen →";
      if (t.parentNode) t.parentNode.insertBefore(h, t.nextSibling);
    });
  }

  /* --------- Klebende Leisten an die echte Kopfhöhe anpassen ------------ */
  function leistenAusrichten() {
    const kopf = document.querySelector(".kopf");
    if (!kopf) return;
    const h = Math.round(kopf.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--kopfhoehe", h + "px");
    document.querySelectorAll(".gen-leiste, .satz-kopf-fest").forEach(l => {
      l.style.top = handy() ? (h + 2) + "px" : "";
    });
  }

  function auffrischen() {
    try { leistenAusrichten(); } catch (e) { }
    try { wischHinweise(); } catch (e) { }
  }

  /* --------- Einhängen ------------------------------------------------- */
  function start() {
    const nach = () => setTimeout(auffrischen, 60);

    ["schirm", "renderStart", "zeigeBogen"].forEach(name => {
      const alt = window[name];
      if (typeof alt !== "function") return;
      window[name] = function () { const w = alt.apply(this, arguments); nach(); return w; };
    });

    if (window.GENUI) {
      ["oeffne", "erzeugeBlatt", "assistent"].forEach(name => {
        const alt = window.GENUI[name];
        if (typeof alt !== "function") return;
        window.GENUI[name] = function () { const w = alt.apply(this, arguments); nach(); return w; };
      });
    }
    if (window.GENSATZ && typeof window.GENSATZ.starten === "function") {
      const alt = window.GENSATZ.starten;
      window.GENSATZ.starten = function () { const w = alt.apply(this, arguments); nach(); return w; };
    }

    window.addEventListener("resize", () => {
      clearTimeout(start._t);
      start._t = setTimeout(auffrischen, 180);
    });
    window.addEventListener("orientationchange", () => setTimeout(auffrischen, 260));
    document.addEventListener("click", () => setTimeout(auffrischen, 120), true);

    auffrischen();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  return { auffrischen, handy };
})();
