/* ============================================================================
   gen/offline.js — eine ganze Prüfung im Voraus für unterwegs laden
   ----------------------------------------------------------------------------
   Der Service Worker behält jedes Bild, das einmal angesehen wurde. Für die
   Bahnfahrt reicht das nicht: dort will man eine Prüfung öffnen, die man noch
   nie aufgeschlagen hat. Deshalb bekommt jede Prüfungskachel einen Knopf, der
   ihre Bilder vorab in denselben Cache legt — mit Fortschritt und Abbruch.

   Geladen wird bewusst pro Prüfung und nur auf Knopfdruck: alle zehn zusammen
   wären über 200 MB.
   ========================================================================== */
"use strict";

window.GENOFFLINE = (function () {
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  const CACHE = "ihk-ap1-bilder";        /* derselbe Name wie in sw.js */
  const moeglich = () => ("caches" in window) && /^https?:$/.test(location.protocol);

  /* ------------------------------------------------- Bilder einer Prüfung */
  function bilderVon(ex) {
    const s = new Set();
    const add = a => (a || []).forEach(x => { if (x && x.file) s.add(x.file); });
    add(ex.situation && ex.situation.assets);
    add(ex.attachments);
    (ex.tasks || []).forEach(t => {
      add(t.assets);
      (t.subtasks || []).forEach(st => {
        add(st.assets);
        if (st.pageImage) s.add(st.pageImage);
        if (st.solutionImage) s.add(st.solutionImage);
      });
    });
    return [...s];
  }

  /* Welche davon liegen schon im Cache? */
  async function standVon(urls) {
    if (!moeglich()) return { da: 0, gesamt: urls.length };
    try {
      const c = await caches.open(CACHE);
      let da = 0;
      for (const u of urls) if (await c.match(u)) da++;
      return { da, gesamt: urls.length };
    } catch (e) { return { da: 0, gesamt: urls.length }; }
  }

  /* ------------------------------------------------------------- Laden --- */
  const laeuft = {};          /* examId -> {abbruch:true} */

  async function laden(ex, urls, aufStand) {
    const c = await caches.open(CACHE);
    const marke = laeuft[ex.examId] = { abbruch: false };
    let fertig = 0, bytes = 0, fehler = 0;
    for (const u of urls) {
      if (marke.abbruch) break;
      try {
        if (!(await c.match(u))) {
          const r = await fetch(u, { cache: "no-cache" });
          if (r && r.ok) {
            bytes += Number(r.headers.get("content-length") || 0);
            await c.put(u, r.clone());
          } else fehler++;
        }
      } catch (e) { fehler++; }
      fertig++;
      aufStand(fertig, urls.length, bytes, fehler);
    }
    delete laeuft[ex.examId];
    return { fertig, bytes, fehler, abgebrochen: marke.abbruch };
  }

  async function loeschen(urls) {
    try {
      const c = await caches.open(CACHE);
      for (const u of urls) await c.delete(u);
    } catch (e) { }
  }

  /* ------------------------------------------------ Knopf an die Kachel -- */
  function knopfBauen(karte, ex) {
    if (karte.querySelector(".off-knopf")) return;
    const urls = bilderVon(ex);
    if (!urls.length) return;

    const box = el("div", "off-zeile");
    const b = el("button", "btn ghost klein off-knopf", "↓ offline laden");
    const stand = el("span", "off-stand");
    const spur = el("div", "off-spur"); const i = el("i"); spur.appendChild(i); spur.hidden = true;
    box.append(b, stand);
    karte.appendChild(box);
    karte.appendChild(spur);

    const zeigeStand = async () => {
      const s = await standVon(urls);
      if (s.da >= s.gesamt) {
        b.textContent = "✓ offline verfügbar";
        b.classList.add("fertig");
        stand.textContent = s.gesamt + " Bilder";
        b.title = "Zum Freigeben des Speichers anklicken";
      } else if (s.da > 0) {
        b.textContent = "↓ offline vervollständigen";
        b.classList.remove("fertig");
        stand.textContent = s.da + " von " + s.gesamt + " Bildern da";
      } else {
        b.textContent = "↓ offline laden";
        b.classList.remove("fertig");
        stand.textContent = urls.length + " Bilder";
      }
    };
    zeigeStand();

    b.onclick = async () => {
      /* schon vollständig: auf Nachfrage wieder freigeben */
      if (b.classList.contains("fertig")) {
        if (!confirm("Die Bilder dieser Prüfung wieder aus dem Offline-Speicher entfernen?")) return;
        await loeschen(urls);
        return zeigeStand();
      }
      /* läuft gerade: abbrechen */
      if (laeuft[ex.examId]) { laeuft[ex.examId].abbruch = true; return; }

      b.textContent = "abbrechen";
      spur.hidden = false;
      const erg = await laden(ex, urls, (fertig, gesamt, bytes) => {
        i.style.width = (fertig / gesamt * 100) + "%";
        stand.textContent = fertig + " von " + gesamt +
          (bytes ? " · " + (bytes / 1048576).toFixed(1) + " MB" : "");
      });
      spur.hidden = true;
      await zeigeStand();
      if (erg.abgebrochen) window.toast && window.toast("Abgebrochen — das Geladene bleibt gespeichert.");
      else if (erg.fehler) window.toast && window.toast(erg.fehler + " Bilder konnten nicht geladen werden.");
      else window.toast && window.toast("Diese Prüfung ist jetzt offline verfügbar.");
    };
  }

  /* -------------------------------------------------------- Nachrüsten --- */
  function nachruesten() {
    if (!moeglich()) return;
    const EX = (typeof IHK_EXAMS !== "undefined" && IHK_EXAMS) ? IHK_EXAMS : window.IHK_EXAMS;
    if (!EX || !EX.length) return;
    document.querySelectorAll("#scStart .ekarte").forEach(karte => {
      /* die Kachel trägt ihre Prüfung entweder als data-Attribut oder im Titel */
      let ex = null;
      const id = karte.dataset ? (karte.dataset.exam || karte.dataset.id) : null;
      if (id) ex = EX.find(x => x.examId === id);
      if (!ex) {
        const t = (karte.querySelector("h3") || {}).textContent || "";
        ex = EX.find(x => {
          const m = x.meta || {};
          return t.indexOf(String(m.year)) >= 0 &&
                 (!m.season || t.toLowerCase().indexOf(String(m.season).toLowerCase().slice(0, 6)) >= 0);
        });
      }
      if (ex) knopfBauen(karte, ex);
    });
  }

  function einhaengen() {
    const alt = window.renderStart;
    if (typeof alt === "function") {
      window.renderStart = function () {
        alt.apply(null, arguments);
        try { setTimeout(nachruesten, 0); } catch (e) { console.error("Offline:", e); }
      };
    }
    try { setTimeout(nachruesten, 200); } catch (e) { }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { bilderVon, standVon, nachruesten, CACHE };
})();
