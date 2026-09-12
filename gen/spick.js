/* ============================================================================
   gen/spick.js — der Spickzettel als eigenes Kapitel der Anwendung
   ----------------------------------------------------------------------------
   Die Vorlage ist eine einzige Seite mit 80 KB Text: zwanzig Abschnitte,
   hundertzwanzig Karten, Tabellen mit sechs Spalten. Am Schreibtisch liest
   sich das gut. Auf dem Telefon ist es eine Rolle ohne Ende — man sucht das
   Kapitel „Netzwerk“ und scrollt dreißig Bildschirme an Use-Case-Diagrammen
   vorbei.

   Deshalb hier eine andere Ordnung, aber derselbe Inhalt:

     1. Verzeichnis — zwanzig Zeilen, eine je Kapitel, mit Untertitel.
        Das ist der Einstieg, nicht der Text.
     2. Ein Kapitel wird einzeln geöffnet. Oben eine Leiste, die mitscrollt:
        zurück zum Verzeichnis, vorheriges/nächstes Kapitel, Suche.
     3. Suche über ALLE Kapitel. Ergebnis ist eine Trefferliste mit den
        Textstellen — von dort springt man direkt ins Kapitel, und die
        Fundstellen sind dort markiert.

   Zwei Dinge, die auf dem Telefon den Unterschied machen:

     • `.grid2` ist auf schmalen Schirmen eine Spalte, nicht zwei halbe.
     • Tabellen rollen in ihrem eigenen Kasten seitwärts, die Seite selbst
       bleibt stehen. Nichts ist schlimmer als eine Seite, die beim Lesen
       nach links wegrutscht.

   Wo man zuletzt war, wird gemerkt: wer das Telefon weglegt und später
   weiterliest, landet wieder im selben Kapitel.
   ========================================================================== */
"use strict";

window.GENSPICK = (function () {
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const SK = "ihk2:spick";

  const KAP = () => (window.SPICK_KAPITEL || []);
  let stand = { kapitel: null, suche: "" };
  try { stand = Object.assign(stand, JSON.parse(localStorage.getItem(SK) || "{}")); } catch (e) { }
  const merken = () => { try { localStorage.setItem(SK, JSON.stringify(stand)); } catch (e) { } };

  /* ------------------------------------------------------------ Seite --- */
  function seite() {
    let s = $("scSpick");
    if (s) return s;
    s = el("div", "seite"); s.id = "scSpick"; s.hidden = true;
    s.innerHTML = '<div class="abschnitt sp-wrap">' +
      '<div class="sp-leiste" id="spLeiste"></div>' +
      '<div id="spInhalt"></div></div>';
    const start = $("scStart");
    start.parentNode.insertBefore(s, start.nextSibling);
    return s;
  }

  function zeigen() {
    seite();
    ["scStart", "scBogen", "scAuswertung", "scNetz", "scKK", "scModell", "scUml", "scArchiv", "scGen"]
      .forEach(id => { const e = $(id); if (e) e.hidden = true; });
    $("scSpick").hidden = false;
    const f = $("fuss"); if (f) f.hidden = true;
    const kt = $("kopfTitel"); if (kt) kt.hidden = false;
    if (window.GENZURUECK) window.GENZURUECK.knopfPflegen();
  }

  /* ------------------------------------------------------- Suchtreffer --- */
  const norm = s => String(s || "").toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");

  /** HTML entschärfen und den reinen Text holen — darin wird gesucht.
   *  Zwischen Blöcken muss ein Leerzeichen stehen: textContent klebt
   *  „…zurückgeben.“ und „include vs. extend“ sonst zu einem Wort zusammen,
   *  und der Ausschnitt in der Trefferliste liest sich wie ein Druckfehler. */
  const BLOCK = /^(P|DIV|LI|UL|OL|TR|TD|TH|H1|H2|H3|H4|BR|SECTION|TABLE|THEAD|TBODY|PRE)$/;
  function nurText(h) {
    const d = document.createElement("div");
    d.innerHTML = h;
    const teile = [];
    (function lauf(n) {
      n.childNodes.forEach(k => {
        if (k.nodeType === 3) teile.push(k.nodeValue);
        else if (k.nodeType === 1) {
          if (BLOCK.test(k.nodeName)) teile.push(" ");
          lauf(k);
          if (BLOCK.test(k.nodeName)) teile.push(" ");
        }
      });
    })(d);
    return teile.join("").replace(/\s+/g, " ");
  }

  function treffer(wort) {
    const w = norm(wort).trim();
    if (w.length < 2) return [];
    return KAP().map(k => {
      const txt = nurText(k.titel + " " + k.unter + " " + k.html);
      const n = norm(txt);
      const stellen = [];
      let i = n.indexOf(w);
      while (i >= 0 && stellen.length < 4) {
        stellen.push(txt.slice(Math.max(0, i - 55), i + w.length + 75).replace(/\s+/g, " ").trim());
        i = n.indexOf(w, i + w.length);
      }
      let anzahl = 0, j = n.indexOf(w);
      while (j >= 0) { anzahl++; j = n.indexOf(w, j + w.length); }
      return { k, anzahl, stellen };
    }).filter(x => x.anzahl > 0).sort((a, b) => b.anzahl - a.anzahl);
  }

  /** Fundstellen im gezeigten Kapitel gelb unterlegen — ohne das HTML
   *  kaputtzuschneiden: es werden nur Textknoten angefasst.            */
  function markieren(wurzel, wort) {
    const w = norm(wort).trim();
    if (w.length < 2) return 0;
    let n = 0;
    const lauf = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, {
      acceptNode: kn => (kn.parentNode && /^(SCRIPT|STYLE|MARK)$/.test(kn.parentNode.nodeName))
        ? NodeFilter.FILTER_REJECT
        : (norm(kn.nodeValue).includes(w) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
    });
    const knoten = [];
    while (lauf.nextNode()) knoten.push(lauf.currentNode);
    knoten.forEach(kn => {
      const txt = kn.nodeValue, nt = norm(txt);
      const teile = document.createDocumentFragment();
      let pos = 0, i = nt.indexOf(w);
      while (i >= 0) {
        if (i > pos) teile.appendChild(document.createTextNode(txt.slice(pos, i)));
        const m = el("mark", "sp-treffer", txt.slice(i, i + w.length));
        teile.appendChild(m); n++;
        pos = i + w.length;
        i = nt.indexOf(w, pos);
      }
      if (pos < txt.length) teile.appendChild(document.createTextNode(txt.slice(pos)));
      kn.parentNode.replaceChild(teile, kn);
    });
    return n;
  }

  /* ----------------------------------------------------------- Leiste --- */
  function leiste(modus, k) {
    const l = $("spLeiste");
    l.innerHTML = "";

    const reihe = el("div", "sp-leiste-reihe");
    if (modus === "kapitel") {
      const zur = el("button", "btn ghost klein", "☰ Kapitel");
      zur.onclick = () => verzeichnis();
      reihe.appendChild(zur);

      const i = KAP().findIndex(x => x.id === k.id);
      const vor = el("button", "btn ghost klein", "‹");
      vor.title = "vorheriges Kapitel";
      vor.setAttribute("aria-label", "vorheriges Kapitel");
      vor.disabled = i <= 0;
      vor.onclick = () => kapitel(KAP()[i - 1].id);
      const nach = el("button", "btn ghost klein", "›");
      nach.title = "nächstes Kapitel";
      nach.setAttribute("aria-label", "nächstes Kapitel");
      nach.disabled = i >= KAP().length - 1;
      nach.onclick = () => kapitel(KAP()[i + 1].id);
      reihe.append(vor, el("span", "sp-zaehler", (i + 1) + " / " + KAP().length), nach);
    } else {
      reihe.appendChild(el("span", "sp-titel-klein", "Spickzettel · " + KAP().length + " Kapitel"));
    }

    const such = el("div", "sp-suche");
    const lab = el("label", "sr-only", "Im Spickzettel suchen");
    lab.htmlFor = "spSuche";
    const inp = el("input"); inp.type = "search"; inp.id = "spSuche";
    inp.placeholder = "suchen: include, APIPA, Wirkungsgrad …";
    inp.value = stand.suche || "";
    inp.autocomplete = "off";
    let warte = null;
    inp.oninput = () => {
      clearTimeout(warte);
      warte = setTimeout(() => {
        stand.suche = inp.value; merken();
        if (inp.value.trim().length >= 2) suchseite(inp.value);
        else if (modus === "kapitel") kapitel(k.id, true);
        else verzeichnis(true);
      }, 220);
    };
    such.append(lab, inp);
    reihe.appendChild(such);
    l.appendChild(reihe);
  }

  /* ------------------------------------------------------ Verzeichnis --- */
  function verzeichnis(ohneFokus) {
    seite();
    leiste("liste");
    const box = $("spInhalt");
    box.innerHTML = "";

    const kopf = el("div", "sp-kopf");
    kopf.appendChild(el("h2", null, "AP1 Spickzettel"));
    kopf.appendChild(el("p", "hint",
      "Das Wichtigste aus dem Prüfungsvorbereitungskurs — Format, die neuen Themen ab 2025, " +
      "Diagramme, Rechenwege, Netzwerk, Projektmanagement, IT-Sicherheit. Ein Kapitel je Zeile; " +
      "die Suche geht über alle Kapitel."));
    const zahlen = el("div", "sp-fakten");
    [["90", "Minuten"], ["100", "Punkte"], ["4", "Aufgaben"], ["54 s", "je Punkt"], ["20 %", "der Endnote"]]
      .forEach(([a, b]) => {
        const f = el("div", "sp-fakt");
        f.append(el("b", null, a), el("span", null, b));
        zahlen.appendChild(f);
      });
    kopf.appendChild(zahlen);
    box.appendChild(kopf);

    const liste = el("div", "sp-liste");
    KAP().forEach(k => {
      const a = el("button", "sp-zeile");
      a.type = "button";
      a.appendChild(el("span", "sp-nr", k.nr));
      const t = el("span", "sp-text");
      t.appendChild(el("b", null, k.titel));
      if (k.unter) t.appendChild(el("span", "sp-unter", k.unter));
      a.appendChild(t);
      a.appendChild(el("span", "sp-pfeil", "›"));
      a.onclick = () => kapitel(k.id);
      liste.appendChild(a);
    });
    box.appendChild(liste);

    const quelle = el("p", "sp-quelle");
    quelle.innerHTML = "Inhaltlich zusammengefasst aus dem Kurs „PV-Kurs 2025-03 B“ " +
      "(Dozentin Alisa Dappa, Mischok Academy). Prüfungsthema aller IT-Berufe: " +
      "<b>„Einrichten eines IT-gestützten Arbeitsplatzes“</b>.";
    box.appendChild(quelle);

    stand.kapitel = null; merken();
    zeigen();
    if (!ohneFokus) window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------- Kapitel --- */
  function kapitel(id, stillHalten) {
    seite();
    const k = KAP().find(x => x.id === id) || KAP()[0];
    if (!k) return;
    leiste("kapitel", k);
    const box = $("spInhalt");
    box.innerHTML = "";

    const kopf = el("div", "sp-kopf");
    const h = el("h2");
    h.appendChild(el("i", "sp-nr-gross", k.nr));
    h.appendChild(document.createTextNode(" " + k.titel));
    kopf.appendChild(h);
    if (k.unter) kopf.appendChild(el("p", "hint", k.unter));
    box.appendChild(kopf);

    const inhalt = el("div", "sp-inhalt");
    inhalt.innerHTML = k.html;
    /* Tabellen bekommen ihren eigenen Rollkasten, falls die Vorlage keinen
       vorgesehen hat — sonst schiebt eine breite Tabelle die ganze Seite. */
    inhalt.querySelectorAll("table").forEach(t => {
      if (t.closest(".tablewrap") || t.closest(".sp-tab")) return;
      const w = el("div", "sp-tab");
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
    box.appendChild(inhalt);

    if (stand.suche && stand.suche.trim().length >= 2) markieren(inhalt, stand.suche);

    const i = KAP().findIndex(x => x.id === k.id);
    const fuss = el("div", "sp-fuss");
    if (i > 0) {
      const b = el("button", "btn ghost klein", "‹ " + KAP()[i - 1].titel);
      b.onclick = () => kapitel(KAP()[i - 1].id);
      fuss.appendChild(b);
    }
    if (i < KAP().length - 1) {
      const b = el("button", "btn klein", KAP()[i + 1].titel + " ›");
      b.onclick = () => kapitel(KAP()[i + 1].id);
      fuss.appendChild(b);
    }
    const zurListe = el("button", "btn ghost klein", "☰ alle Kapitel");
    zurListe.onclick = () => verzeichnis();
    fuss.appendChild(zurListe);
    box.appendChild(fuss);

    stand.kapitel = k.id; merken();
    zeigen();
    if (!stillHalten) window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------ Suchergebnis --- */
  function suchseite(wort) {
    seite();
    leiste("liste");
    const box = $("spInhalt");
    box.innerHTML = "";
    const tr = treffer(wort);

    const kopf = el("div", "sp-kopf");
    kopf.appendChild(el("h2", null, "„" + wort.trim() + "“"));
    kopf.appendChild(el("p", "hint", tr.length
      ? tr.reduce((s, x) => s + x.anzahl, 0) + " Fundstellen in " + tr.length + " Kapiteln"
      : "Nichts gefunden. Andere Schreibweise probieren — die Suche achtet nicht auf Groß- und Kleinschreibung oder Umlaute."));
    box.appendChild(kopf);

    tr.forEach(x => {
      const k = el("div", "sp-fund");
      const t = el("button", "sp-fund-kopf");
      t.type = "button";
      t.innerHTML = "<b>" + x.k.nr + " " + escHtml(x.k.titel) + "</b> <span>" + x.anzahl + "×</span>";
      t.onclick = () => kapitel(x.k.id);
      k.appendChild(t);
      x.stellen.forEach(s => {
        const p = el("p", "sp-stelle");
        p.textContent = "… " + s + " …";
        markieren(p, wort);
        k.appendChild(p);
      });
      box.appendChild(k);
    });
    zeigen();
    window.scrollTo(0, 0);
  }
  function escHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* ------------------------------------------------------- Startblock --- */
  function block() {
    const start = $("scStart");
    if (!start || !KAP().length) return;
    let box = $("spickBox");
    if (!box) {
      box = el("div", "abschnitt"); box.id = "spickBox";
      box.appendChild(el("h2", null, "Spickzettel"));
      const p = el("p", "hint");
      p.textContent = "Der ganze Stoff in " + KAP().length + " Kapiteln — Format, Diagramme, " +
        "Rechenwege, Netzwerk, Projektmanagement, IT-Sicherheit. Zum Nachschlagen zwischendurch.";
      box.appendChild(p);
      const inhalt = el("div"); inhalt.id = "spickInhalt";
      box.appendChild(inhalt);
      const anker = $("archivBox") || $("gesamtBox");
      const ziel = anker ? (anker.closest("details.st-block") || anker) : null;
      if (ziel && ziel.parentNode) ziel.parentNode.insertBefore(box, ziel.nextSibling);
      else start.appendChild(box);
    }
    const inhalt = $("spickInhalt");
    inhalt.innerHTML = "";

    const reihe = el("div", "sp-schnell");
    KAP().slice(0, 8).forEach(k => {
      const b = el("button", "btn ghost klein", k.nr + " " + k.titel);
      b.onclick = () => kapitel(k.id);
      reihe.appendChild(b);
    });
    inhalt.appendChild(reihe);

    const steuer = el("div", "steuer");
    steuer.style.marginTop = "10px";
    const auf = el("button", "btn primary klein", "Spickzettel öffnen");
    auf.onclick = () => { if (stand.kapitel) kapitel(stand.kapitel); else verzeichnis(); };
    steuer.appendChild(auf);
    if (stand.kapitel) {
      const k = KAP().find(x => x.id === stand.kapitel);
      if (k) {
        const w = el("button", "btn klein", "weiter bei „" + k.titel + "“");
        w.onclick = () => kapitel(k.id);
        steuer.appendChild(w);
      }
    }
    inhalt.appendChild(steuer);
  }

  /* -------------------------------------------------------- Einhängen --- */
  function einhaengen() {
    seite();
    const altStart = window.renderStart;
    if (typeof altStart === "function" && !altStart.__sp) {
      const neu = function () {
        const r = altStart.apply(this, arguments);
        try { block(); } catch (e) { console.error("Spickzettel:", e); }
        return r;
      };
      neu.__sp = true;
      window.renderStart = neu;
    }
    const altSchirm = window.schirm;
    if (typeof altSchirm === "function" && !altSchirm.__sp) {
      const neu = function () {
        const s = $("scSpick"); if (s) s.hidden = true;
        return altSchirm.apply(this, arguments);
      };
      neu.__sp = true;
      window.schirm = neu;
    }
    try { block(); } catch (e) { }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { verzeichnis, kapitel, suchseite, block, zeigen };
})();
