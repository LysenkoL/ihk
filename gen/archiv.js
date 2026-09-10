/* ============================================================================
   gen/archiv.js — jeder Durchgang bleibt erhalten, mit den Antworten
   ----------------------------------------------------------------------------
   Bisher speicherte „Ergebnis speichern“ nur die Punktzahl: Datum, Prozent,
   Note, Minuten. Die Antworten selbst standen ausschließlich in ANSWERS, und
   ANSWERS gilt pro Aufgabe, nicht pro Durchgang. Wer dieselbe Prüfung ein
   zweites Mal schreibt, überschreibt damit die erste Fassung; „Zurücksetzen“
   löscht sie sofort. Nach neunzig Minuten Simulation war alles weg, außer
   man hatte im richtigen Moment auf „Markdown“ gedrückt.

   Das ist die falsche Reihenfolge: Erst wird gearbeitet, dann entscheidet
   man, ob es aufbewahrt wird — nicht umgekehrt.

   Diese Datei legt deshalb bei jedem Abschluss eine vollständige Kopie ab:
   jede Teilaufgabe mit dem Antworttext (inklusive Rechenweg und Diagramm-
   tabelle, denn antwortText() liefert die mit), den vergebenen Punkten und
   der Musterlösung als Bezug. Gespeichert wird an drei Stellen:

     • beim Druck auf „Ergebnis speichern“
     • VOR jedem „Zurücksetzen“ — sonst löscht man ungefragt Arbeit weg
     • jederzeit von Hand über „Diesen Stand sichern“

   Dazu kommt der eigentliche Zweck: zwei Durchgänge derselben Prüfung
   nebeneinanderlegen und lesen, was man beim ersten Mal geschrieben hat und
   was beim zweiten. Das zeigt Fortschritt genauer als jede Prozentzahl.

   Ablage: localStorage unter „ihk2:archiv“. Bei Platzmangel fallen die
   ältesten Durchgänge heraus, nie der neueste.
   ========================================================================== */
"use strict";

window.GENARCHIV = (function () {
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const SK = "ihk2:archiv";
  const MAX = 60;                       /* mehr braucht kein Mensch bis zur Prüfung */

  /* ANSWERS, SCORES, VIEW, EXAMS liegen im globalen Lexical Environment */
  const A = () => (typeof ANSWERS !== "undefined" ? ANSWERS : {});
  const S = () => (typeof SCORES !== "undefined" ? SCORES : {});
  const V = () => (typeof VIEW !== "undefined" ? VIEW : null);
  const EX = () => (typeof IHK_EXAMS !== "undefined" ? IHK_EXAMS : (window.IHK_EXAMS || []));
  const subs = ex => (typeof examSubs === "function" ? examSubs(ex) : []);
  const txt = it => (typeof antwortText === "function" ? (antwortText(it) || "") : (A()[it.k] || ""));

  /* ------------------------------------------------------------ Ablage --- */
  function lesen() {
    try { return JSON.parse(localStorage.getItem(SK) || "[]"); } catch (e) { return []; }
  }
  function schreiben(liste) {
    let l = liste.slice(-MAX);
    for (;;) {
      try { localStorage.setItem(SK, JSON.stringify(l)); return true; }
      catch (e) {
        if (l.length <= 1) { console.warn("Archiv: kein Platz mehr"); return false; }
        l = l.slice(1);                 /* ältesten opfern, nie den neuesten */
      }
    }
  }

  /* --------------------------------------------------- Durchgang bauen --- */
  /**
   * Aus dem aktuellen Stand einen vollständigen Durchgang machen.
   * quelle: "gespeichert" | "vor dem Zurücksetzen" | "von Hand"
   */
  function baue(view, quelle) {
    const items = (view && view.items) || [];
    if (!items.length) return null;
    const aufgaben = items.map(it => ({
      k: it.k,
      label: it.fullLabel || it.label || "",
      frage: (it.prompt || "").replace(/\s+/g, " ").trim().slice(0, 400),
      antwort: txt(it),
      punkte: S()[it.k] == null ? null : S()[it.k],
      be: it.maxPoints || 0,
      loesung: ((it.solution && it.solution.text) || "").replace(/\s+/g, " ").trim().slice(0, 600)
    }));
    const mitAntwort = aufgaben.filter(a => a.antwort.trim()).length;
    if (!mitAntwort) return null;        /* leere Durchgänge nicht sammeln */
    const max = aufgaben.reduce((s, a) => s + a.be, 0);
    const got = aufgaben.reduce((s, a) => s + (a.punkte || 0), 0);
    return {
      id: "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      datum: new Date().toISOString(),
      examId: view.exam ? view.exam.examId : "uebung",
      titel: view.titel || (view.exam ? view.exam.examId : "Übung"),
      modus: view.modus || "uebung",
      quelle: quelle || "gespeichert",
      punkte: got, maxPunkte: max,
      prozent: max ? Math.round(got / max * 100) : 0,
      beantwortet: mitAntwort, anzahl: aufgaben.length,
      aufgaben
    };
  }

  /** Aktuellen Stand einer Prüfung sichern, auch ohne offene Ansicht. */
  function bauePruefung(ex, quelle) {
    return baue({ modus: "pruefung", exam: ex, items: subs(ex),
                  titel: [ex.meta.part, ex.meta.season, ex.meta.year].filter(Boolean).join(" ") }, quelle);
  }

  function sichern(durchgang, still) {
    if (!durchgang) { if (!still) toastet("Nichts zu sichern — es steht noch keine Antwort da."); return null; }
    const l = lesen();
    l.push(durchgang);
    schreiben(l);
    if (!still) {
      toastet("Durchgang gesichert — im Archiv nachlesbar.");
      /* Nur bei Handbedienung neu zeichnen: mitten im Abgeben würde das
         die gerade aufgebaute Seite unter den Füßen wegziehen. */
      try { if (window.renderStart) window.renderStart(); } catch (e) { }
    }
    return durchgang;
  }
  function toastet(s) { if (typeof toast === "function") toast(s); }

  /* Ein bereits gespeichertes Arbeitsblatt nachträglich archivieren — für
     alles, was vor dieser Fassung abgegeben wurde und deshalb nie in den
     Archivlauf kam. Läuft über GENUI, damit die Aufgaben mit demselben
     Zufallskeim wieder entstehen wie beim Ausfüllen.                    */
  function blattSichern(b) {
    if (!window.GENUI || !window.GENUI.archivieren || !b) return null;
    try { return window.GENUI.archivieren("nachträglich gesichert", b); }
    catch (e) { console.error("Archiv:", e); return null; }
  }

  /* ------------------------------------------------------- Startblock --- */
  function block() {
    const start = $("scStart");
    if (!start) return;
    let box = $("archivBox");
    const l = lesen();
    if (!box) {
      box = el("div", "abschnitt"); box.id = "archivBox";
      box.appendChild(el("h2", null, "Archiv der Durchgänge"));
      const p = el("p", "hint");
      p.textContent = "Jede abgeschlossene Prüfung bleibt hier vollständig liegen — mit dem, " +
        "was du geschrieben hast. Zwei Durchgänge derselben Prüfung lassen sich nebeneinander lesen.";
      box.appendChild(p);
      const inhalt = el("div"); inhalt.id = "archivInhalt";
      box.appendChild(inhalt);
      /* Direkt hinter „Wo stehe ich?“. Hat gen/start.js diesen Abschnitt
         schon in ein Klappfach gesteckt, dann hinter das Klappfach — sonst
         läge das Archiv INNEN drin und wäre nur zu finden, wenn man
         „Wo stehe ich?“ aufklappt.                                      */
      const gesamt = $("gesamtBox");
      const anker = gesamt ? (gesamt.closest("details.st-block") || gesamt) : null;
      if (anker && anker.parentNode) anker.parentNode.insertBefore(box, anker.nextSibling);
      else start.appendChild(box);
    }
    const inhalt = $("archivInhalt");
    inhalt.innerHTML = "";

    if (!l.length) {
      inhalt.appendChild(el("div", "leer-hinweis",
        "Noch nichts archiviert. Nach einer Simulation auf „Ergebnis speichern“ drücken — " +
        "oder unten „Aktuellen Stand sichern“."));
    } else {
      const tab = el("table", "tab");
      tab.innerHTML = "<thead><tr><th>Datum</th><th>Prüfung</th><th>Antworten</th>" +
                      "<th>Punkte</th><th>%</th><th></th></tr></thead>";
      const tb = el("tbody");
      l.slice().reverse().forEach(d => {
        const tr = el("tr");
        const dt = new Date(d.datum);
        tr.appendChild(el("td", "z", dt.toLocaleDateString("de-DE") + " " +
          dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })));
        tr.appendChild(el("td", null, d.titel));
        tr.appendChild(el("td", "z", d.beantwortet + "/" + d.anzahl));
        tr.appendChild(el("td", "z", d.punkte + "/" + d.maxPunkte));
        tr.appendChild(el("td", "z", d.prozent + " %"));
        const td = el("td", "z");
        const auf = el("button", "btn ghost klein", "ansehen");
        auf.onclick = () => zeige(d.id);
        td.appendChild(auf);
        tr.appendChild(td);
        tb.appendChild(tr);
      });
      tab.appendChild(tb);
      inhalt.appendChild(tab);

      /* Vergleich zweier Durchgänge derselben Prüfung */
      const gleiche = {};
      l.forEach(d => (gleiche[d.examId] = gleiche[d.examId] || []).push(d));
      const mehrfach = Object.keys(gleiche).filter(k => gleiche[k].length > 1);
      if (mehrfach.length) {
        const z = el("div", "steuer");
        z.style.marginTop = "10px";
        z.appendChild(el("span", "eyebrow", "Vergleichen"));
        mehrfach.forEach(k => {
          const b = el("button", "btn klein", gleiche[k][0].titel + " (" + gleiche[k].length + "×)");
          b.onclick = () => vergleiche(k);
          z.appendChild(b);
        });
        inhalt.appendChild(z);
      }
    }

    /* --------------------------------------------------------------------
       Was liegt hier herum und ist noch nicht gesichert?
       Antworten überleben im localStorage auch dann, wenn man die Ansicht
       verlassen hat — sie sind nur nirgends aufgelistet. Das ist der Grund,
       warum nach einer Simulation „alles weg“ schien. Wenn also noch etwas
       da ist, steht es hier oben mit einem Knopf.
       ------------------------------------------------------------------ */
    const offen = [];
    EX().forEach(ex => {
      const s = subs(ex);
      const n = s.filter(x => (A()[x.k] || "").trim()).length;
      if (!n) return;
      const schonDa = l.some(d => d.examId === ex.examId &&
        d.beantwortet >= n && Date.now() - new Date(d.datum).getTime() < 1000 * 3600 * 24 * 400);
      if (!schonDa) offen.push({ ex, n });
    });
    const blaetterOffen = (function () {
      try {
        const bl = JSON.parse(localStorage.getItem("ihk2:gen:blaetter") || "[]");
        return bl.filter(b => b.antworten && Object.keys(b.antworten).length &&
          !l.some(d => d.titel && d.titel.indexOf(b.titel) >= 0));
      } catch (e) { return []; }
    })();

    if (offen.length || blaetterOffen.length) {
      const w = el("div", "ar-warnung");
      const teile = [];
      offen.forEach(o => teile.push(o.n + " Teilaufgaben in „" +
        [o.ex.meta.season, o.ex.meta.year].filter(Boolean).join(" ") + "“"));
      if (blaetterOffen.length) teile.push(blaetterOffen.length + " Arbeitsblatt/Simulation");
      w.appendChild(el("div", null,
        "Noch nicht archiviert: " + teile.join(", ") + ". Solange sie nicht gesichert sind, " +
        "gehen sie beim nächsten Zurücksetzen verloren."));
      const k = el("button", "btn primary klein", "Alles jetzt sichern");
      k.onclick = () => {
        let n = 0;
        offen.forEach(o => { if (sichern(bauePruefung(o.ex, "nachträglich gesichert"), true)) n++; });
        blaetterOffen.forEach(b => { if (blattSichern(b)) n++; });
        toastet(n ? n + " Durchgänge ins Archiv übernommen." : "Es war nichts zu sichern.");
        block();
      };
      w.appendChild(k);
      inhalt.appendChild(w);
    }

    const steuer = el("div", "steuer");
    steuer.style.marginTop = "10px";
    const jetzt = el("button", "btn klein", "Aktuellen Stand sichern");
    jetzt.title = "Sichert die Prüfung, an der du gerade arbeitest — ohne sie abzugeben.";
    jetzt.onclick = () => {
      const v = V();
      let d = (v && v.items && v.items.length) ? baue(v, "von Hand") : null;
      if (!d) {
        /* keine Prüfung offen: die mit den meisten Antworten nehmen */
        let best = null, bestN = 0;
        EX().forEach(ex => {
          const n = subs(ex).filter(s => (A()[s.k] || "").trim()).length;
          if (n > bestN) { bestN = n; best = ex; }
        });
        if (best) d = bauePruefung(best, "von Hand");
      }
      sichern(d);
      block();
    };
    steuer.appendChild(jetzt);
    if (l.length) {
      const alle = el("button", "btn ghost klein", "Archiv als Markdown");
      alle.onclick = () => markdownAlle();
      steuer.appendChild(alle);
    }
    inhalt.appendChild(steuer);
  }

  /* ---------------------------------------------------------- Ansicht --- */
  function seite() {
    let s = $("scArchiv");
    if (s) return s;
    s = el("div", "seite"); s.id = "scArchiv"; s.hidden = true;
    const inner = el("div", "abschnitt"); inner.id = "archivSeite";
    s.appendChild(inner);
    const start = $("scStart");
    start.parentNode.insertBefore(s, start.nextSibling);
    return s;
  }
  function oeffne() {
    document.querySelectorAll(".seite").forEach(x => { x.hidden = (x.id !== "scArchiv"); });
    const f = $("fuss"); if (f) f.hidden = true;
    const kt = $("kopfTitel"); if (kt) kt.hidden = false;
    window.scrollTo(0, 0);
  }
  function zurueck() {
    if (typeof schirm === "function") schirm("scStart");
    else document.querySelectorAll(".seite").forEach(x => { x.hidden = (x.id !== "scStart"); });
  }

  function kopfzeile(inner, titel, unter) {
    inner.innerHTML = "";
    const z = el("div", "steuer");
    const zur = el("button", "btn ghost klein", "← Start");
    zur.onclick = zurueck;
    z.appendChild(zur);
    inner.appendChild(z);
    inner.appendChild(el("h2", null, titel));
    if (unter) inner.appendChild(el("p", "hint", unter));
  }

  function zeige(id) {
    const d = lesen().find(x => x.id === id);
    if (!d) return;
    seite();
    const inner = $("archivSeite");
    const dt = new Date(d.datum);
    kopfzeile(inner, d.titel,
      dt.toLocaleString("de-DE") + " · " + d.punkte + " von " + d.maxPunkte + " BE · " +
      d.prozent + " % · " + d.beantwortet + " von " + d.anzahl + " Teilaufgaben beantwortet" +
      (d.quelle ? " · " + d.quelle : ""));

    const werkz = el("div", "steuer");
    const md = el("button", "btn klein", "als Markdown laden");
    md.onclick = () => datei(markdownEines(d), dateiname(d) + ".md");
    werkz.appendChild(md);
    const weg = el("button", "btn ghost klein", "diesen Durchgang löschen");
    weg.onclick = () => {
      if (!confirm("Diesen Durchgang endgültig löschen?")) return;
      schreiben(lesen().filter(x => x.id !== id));
      block(); zurueck();
    };
    werkz.appendChild(weg);
    inner.appendChild(werkz);

    d.aufgaben.forEach(a => {
      const k = el("div", "ar-karte");
      const kopf = el("div", "ar-kopf");
      kopf.appendChild(el("span", "ar-label", a.label));
      kopf.appendChild(el("span", "ar-be",
        (a.punkte == null ? "—" : a.punkte) + " / " + a.be + " BE"));
      k.appendChild(kopf);
      if (a.frage) k.appendChild(el("div", "ar-frage", a.frage));
      const ant = el("div", "ar-antwort" + (a.antwort.trim() ? "" : " leer"));
      ant.textContent = a.antwort.trim() || "— nichts geschrieben —";
      k.appendChild(ant);
      if (a.loesung) {
        const det = el("details", "ar-loesung");
        det.appendChild(el("summary", null, "Musterlösung"));
        det.appendChild(el("div", "ar-loestxt", a.loesung));
        k.appendChild(det);
      }
      inner.appendChild(k);
    });
    oeffne();
  }

  /* -------------------------------------------------------- Vergleich --- */
  function vergleiche(examId, idA, idB) {
    const l = lesen().filter(d => d.examId === examId);
    if (l.length < 2) return;
    const a = l.find(x => x.id === idA) || l[0];
    const b = l.find(x => x.id === idB) || l[l.length - 1];
    seite();
    const inner = $("archivSeite");
    kopfzeile(inner, a.titel + " — zwei Durchgänge nebeneinander",
      "Links der ältere, rechts der neuere. Gelesen wird, was sich in der Formulierung " +
      "geändert hat — nicht nur die Punktzahl.");

    /* Auswahl, falls es mehr als zwei gibt */
    if (l.length > 2) {
      const w = el("div", "steuer");
      const mach = (wert, welche) => {
        const s = el("select", "ar-wahl");
        l.forEach(d => {
          const o = el("option", null, new Date(d.datum).toLocaleString("de-DE") + " · " + d.prozent + " %");
          o.value = d.id; s.appendChild(o);
        });
        s.value = wert;
        s.onchange = () => vergleiche(examId,
          welche === "a" ? s.value : a.id, welche === "b" ? s.value : b.id);
        return s;
      };
      w.appendChild(el("span", "eyebrow", "links"));
      w.appendChild(mach(a.id, "a"));
      w.appendChild(el("span", "eyebrow", "rechts"));
      w.appendChild(mach(b.id, "b"));
      inner.appendChild(w);
    }

    const kopf = el("div", "ar-vgl-kopf");
    kopf.appendChild(el("div", null, new Date(a.datum).toLocaleDateString("de-DE") +
      " · " + a.punkte + "/" + a.maxPunkte + " BE · " + a.prozent + " %"));
    kopf.appendChild(el("div", null, new Date(b.datum).toLocaleDateString("de-DE") +
      " · " + b.punkte + "/" + b.maxPunkte + " BE · " + b.prozent + " %"));
    inner.appendChild(kopf);

    const nachK = {};
    b.aufgaben.forEach(x => { nachK[x.k] = x; });
    a.aufgaben.forEach(x => {
      const y = nachK[x.k];
      if (!y) return;
      const beide = (x.antwort || "").trim() || (y.antwort || "").trim();
      if (!beide) return;
      const k = el("div", "ar-karte");
      const kz = el("div", "ar-kopf");
      kz.appendChild(el("span", "ar-label", x.label));
      const diff = (y.punkte || 0) - (x.punkte || 0);
      const be = el("span", "ar-be" + (diff > 0 ? " besser" : (diff < 0 ? " schlechter" : "")));
      be.textContent = (x.punkte == null ? "—" : x.punkte) + " → " +
        (y.punkte == null ? "—" : y.punkte) + " von " + x.be + " BE" +
        (diff ? "  (" + (diff > 0 ? "+" : "") + diff + ")" : "");
      kz.appendChild(be);
      k.appendChild(kz);
      if (x.frage) k.appendChild(el("div", "ar-frage", x.frage));
      const paar = el("div", "ar-paar");
      [x, y].forEach(q => {
        const s = el("div", "ar-spalte" + ((q.antwort || "").trim() ? "" : " leer"));
        s.textContent = (q.antwort || "").trim() || "— nichts geschrieben —";
        paar.appendChild(s);
      });
      k.appendChild(paar);
      inner.appendChild(k);
    });
    oeffne();
  }

  /* --------------------------------------------------------- Markdown --- */
  function dateiname(d) {
    return "durchgang-" + (d.examId || "uebung") + "-" +
      new Date(d.datum).toISOString().slice(0, 16).replace(/[:T]/g, "-");
  }
  function markdownEines(d) {
    const z = [];
    z.push("# " + d.titel + " — " + new Date(d.datum).toLocaleString("de-DE"));
    z.push("");
    z.push(d.punkte + " von " + d.maxPunkte + " BE · " + d.prozent + " % · " +
           d.beantwortet + " von " + d.anzahl + " Teilaufgaben beantwortet");
    z.push("");
    d.aufgaben.forEach(a => {
      z.push("## " + a.label + "  (" + (a.punkte == null ? "—" : a.punkte) + "/" + a.be + " BE)");
      if (a.frage) { z.push(""); z.push("> " + a.frage); }
      z.push("");
      z.push("**Meine Antwort**");
      z.push("");
      z.push(a.antwort.trim() ? a.antwort.trim() : "_nichts geschrieben_");
      if (a.loesung) {
        z.push("");
        z.push("<details><summary>Musterlösung</summary>");
        z.push("");
        z.push(a.loesung);
        z.push("");
        z.push("</details>");
      }
      z.push("");
    });
    return z.join("\n");
  }
  function markdownAlle() {
    const l = lesen();
    const z = ["# Archiv aller Durchgänge", ""];
    l.slice().reverse().forEach(d => { z.push(markdownEines(d)); z.push("---"); z.push(""); });
    datei(z.join("\n"), "ihk-archiv.md");
  }
  function datei(text, name) {
    const b = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* -------------------------------------------------------- Einhängen --- */
  function einhaengen() {
    /* 1. „Ergebnis speichern“ archiviert mit */
    const sp = $("btnAusSpeichern");
    if (sp && !sp.dataset.arch) {
      sp.dataset.arch = "1";
      sp.addEventListener("click", () => {
        try { sichern(baue(V(), "gespeichert"), true); } catch (e) { console.error("Archiv:", e); }
      }, true);                          /* Capture: vor dem Wechsel zum Start */
    }

    /* 2. Vor jedem Zurücksetzen sichern — das ist der Fall, der weh tut */
    if (typeof window.resetExam === "function" && !window.resetExam.__arch) {
      const alt = window.resetExam;
      const neu = function (ex) {
        try { sichern(bauePruefung(ex, "vor dem Zurücksetzen"), true); }
        catch (e) { console.error("Archiv:", e); }
        return alt.apply(this, arguments);
      };
      neu.__arch = true;
      window.resetExam = neu;
    }

    /* 3. Block auf der Startseite mitzeichnen */
    const altStart = window.renderStart;
    if (typeof altStart === "function" && !altStart.__arch) {
      const neu = function () {
        const r = altStart.apply(this, arguments);
        try { block(); } catch (e) { console.error("Archiv:", e); }
        return r;
      };
      neu.__arch = true;
      window.renderStart = neu;
    }

    /* 4. schirm() blendet fremde Seiten ein — dann muss die Archivseite weg */
    const altSchirm = window.schirm;
    if (typeof altSchirm === "function" && !altSchirm.__arch) {
      const neu = function () {
        const s = $("scArchiv"); if (s) s.hidden = true;
        return altSchirm.apply(this, arguments);
      };
      neu.__arch = true;
      window.schirm = neu;
    }

    try { block(); } catch (e) { }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { lesen, sichern, baue, bauePruefung, zeige, vergleiche, block,
           markdownEines, anzahl: () => lesen().length };
})();
