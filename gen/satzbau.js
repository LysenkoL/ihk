/* ============================================================================
   gen/satzbau.js — Satzbau-Training: vom Stichwort zum ganzen Satz
   ----------------------------------------------------------------------------
   Die Prüfung gibt Punkte für ausgeführte Antworten, nicht für Stichworte.
   Hier wird genau das geübt: eine echte Prüfungsfrage, daneben das Stichwort,
   das man normalerweise hinschreibt — und die Aufgabe, daraus einen Satz zu
   machen. Geprüft wird auf Fachbegriff, Begründung, Länge und ganzen Satz.
   ========================================================================== */
"use strict";

window.GENSATZ = (function () {
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const esc = s => { const d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; };

  const SK = "ihk2:gen:satz";
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch { return {}; } },
    set(v) { try { localStorage.setItem(SK, JSON.stringify(v)); } catch { } }
  };
  let STAT = store.get();
  let LAUF = null;   // { karten: [], i: 0, punkte: 0 }

  const POOL = () => window.SATZ_POOL || [];
  const MUSTER = () => window.SATZ_MUSTER || [];

  /* ------------------------------------------------------------ Bewertung */
  /* Begründungssignale — bewusst breit: die Prüfung verlangt einen Zusammenhang,
     nicht ein bestimmtes Wort.                                               */
  const KONNEKTOR = /(weil|damit|dadurch|so\s?dass|sodass|denn|deshalb|daher|somit|folglich|wenn|sobald|sonst|andernfalls|ohne\s|um\s+\S+\s+zu\s|f(ü|u)hrt\s+dazu|bedeutet|hei(ß|ss)t|dient|sorgt|verhindert|erm(ö|o)glicht|sch(ü|u)tzt|senkt|erh(ö|o)ht|spart|vermeidet|reduziert|stellt\s+sicher|macht\s+es)/i;

  function bewerte(item, text) {
    const G = window.GEN;
    const roh = String(text || "").trim();
    const worte = roh ? roh.split(/\s+/).filter(Boolean).length : 0;
    const minW = item.minWorte || 12;

    const begriffe = (item.muss || []).map(g => ({ soll: g[0], ok: G.enthaeltEines(roh, g) }));
    const alleBegriffe = begriffe.length > 0 && begriffe.every(b => b.ok);
    const einBegriff = begriffe.some(b => b.ok);
    /* Zwei Sätze mit ausreichender Länge erklären auch ohne Signalwort:
       „Die Platte wird verschlüsselt. Niemand kann die Daten lesen."         */
    const saetze = (roh.match(/[.!?]+/g) || []).length;
    /* Ergebnis- und Empfehlungssätze brauchen keine Begründung, sondern
       Zahl, Einheit und Bezug — dort zählt das Kriterium nicht.             */
    const konnektor = item.ohneBegruendung
      ? true
      : (KONNEKTOR.test(roh) || (saetze >= 2 && worte >= minW));
    const langGenug = worte >= minW;
    const ganzerSatz = /^[A-ZÄÖÜ„»]/.test(roh) && /[.!?][“»“]?\s*$/.test(roh);

    let punkte = 0;
    if (alleBegriffe && konnektor && langGenug) punkte = 2;
    else if (alleBegriffe && (konnektor || langGenug)) punkte = 1.5;
    else if (alleBegriffe) punkte = 1;
    else if (einBegriff) punkte = 0.5;

    return { punkte, worte, minW, begriffe, alleBegriffe, konnektor, langGenug, ganzerSatz,
             ohneBegruendung: !!item.ohneBegruendung, leer: !roh };
  }

  /* ------------------------------------------------------------- Startbox */
  function startBox() {
    let b = $("satzBox");
    if (!b) {
      b = el("div", "abschnitt"); b.id = "satzBox";
      const ziel = $("genStartBox");
      if (ziel && ziel.parentNode) ziel.parentNode.insertBefore(b, ziel.nextSibling);
      else $("scStart").appendChild(b);
    }
    b.innerHTML = "";

    const kopf = el("div", "gen-kopf");
    const links = el("div");
    links.appendChild(el("h2", null, "Satzbau-Training — vom Stichwort zum Satz"));
    links.appendChild(el("p", null,
      "Die häufigste Punktequelle in der AP1 sind ausgeführte Antworten. Hier übst du genau das: " +
      "fünf Minuten, sechs Fragen, sofortige Rückmeldung."));
    const knopf = el("button", "btn primary", "Training starten");
    knopf.onclick = () => starten();
    kopf.append(links, knopf);
    b.appendChild(kopf);

    /* Fortschritt */
    const ids = Object.keys(STAT);
    const geuebt = ids.length, gesamt = POOL().length;
    const sitzen = ids.filter(k => STAT[k].bestPunkte >= 2).length;
    const wackelig = ids.filter(k => STAT[k].bestPunkte < 1.5)
      .map(k => POOL().find(x => x.id === k)).filter(Boolean);

    const hin = el("div", "gen-hinweis");
    hin.innerHTML = geuebt
      ? "<b>" + sitzen + " von " + gesamt + "</b> Fragen sitzen (volle Punkte), " +
        geuebt + " insgesamt geübt." +
        (wackelig.length ? " Noch wackelig: " + wackelig.slice(0, 4).map(x => esc(x.thema)).join(" · ") + "." : "")
      : "<b>" + gesamt + " Fragen</b> aus deinen Schwachstellen: IT-Sicherheit, Datenschutz, Recht, " +
        "Projektmanagement, Netzwerk, Wirtschaftlichkeit — plus Prüfungstechnik " +
        "(Antwortsatz mit Zahl und Einheit, Empfehlung aussprechen, Teilfragen zählen).";
    b.appendChild(hin);

    if (wackelig.length) {
      const z = el("div", "gen-knopfzeile");
      const k2 = el("button", "btn", "nur die wackeligen üben (" + wackelig.length + ")");
      k2.onclick = () => starten(wackelig.map(x => x.id));
      z.appendChild(k2);
      const k3 = el("button", "btn ghost klein", "Fortschritt zurücksetzen");
      k3.onclick = () => { if (confirm("Satzbau-Fortschritt löschen?")) { STAT = {}; store.set(STAT); startBox(); } };
      z.appendChild(k3);
      b.appendChild(z);
    }
  }

  /* --------------------------------------------------------------- Screen */
  function seite() {
    if ($("scSatz")) return;
    const s = el("div", "seite"); s.id = "scSatz"; s.hidden = true;
    s.innerHTML = '<div class="abschnitt" id="satzInhalt"></div>';
    document.body.insertBefore(s, $("fuss") || null);
  }

  function zeigen() {
    seite();
    const alt = window.schirm;
    /* schirm() kennt scSatz nicht — wir blenden selbst um */
    alt("scStart");
    ["scStart", "scGen", "scBogen", "scNetz", "scKK", "scModell", "scUml", "scAuswertung"]
      .forEach(id => { const e = $(id); if (e) e.hidden = true; });
    $("scSatz").hidden = false;
    $("kopfTitel").hidden = false;
    $("kEyebrow").textContent = "Training";
    $("kTitel").textContent = "Satzbau";
    $("schalterKatalog").hidden = true;
    $("fuss").hidden = true;
    window.scrollTo(0, 0);
  }

  function zurueck() {
    const s = $("scSatz"); if (s) s.hidden = true;
    window.schirm("scStart");
    window.renderStart();
  }

  /* -------------------------------------------------------------- Ablauf */
  function starten(ids) {
    let pool = POOL();
    if (ids && ids.length) pool = pool.filter(x => ids.includes(x.id));
    if (!pool.length) return;
    /* wenig Geübtes und Schwaches zuerst */
    const bewertetPool = pool.map(x => {
      const s = STAT[x.id];
      return { x, rang: s ? (s.bestPunkte || 0) + Math.random() * 0.4 : -1 + Math.random() * 0.4 };
    }).sort((a, b) => a.rang - b.rang);
    LAUF = { karten: bewertetPool.slice(0, Math.min(6, pool.length)).map(o => o.x), i: 0, punkte: 0, max: 0 };
    zeigen();
    karte();
  }

  function karte() {
    const w = $("satzInhalt"); w.innerHTML = "";
    if (LAUF.i >= LAUF.karten.length) return abschluss();
    const item = LAUF.karten[LAUF.i];

    const k = el("div", "satz-karte");
    const kopf = el("div", "satz-kopf");
    kopf.appendChild(el("span", "eyebrow", "Frage " + (LAUF.i + 1) + " von " + LAUF.karten.length));
    kopf.appendChild(el("span", "thema", item.thema));
    k.appendChild(kopf);

    k.appendChild(el("div", "satz-frage", item.frage));

    const stich = el("div", "satz-stich");
    stich.innerHTML = "<span class='eyebrow'>So schreibst du es oft</span><b>„" + esc(item.stichwort) + "“</b>" +
      "<div class='satz-auftrag'>Mach daraus eine vollständige Antwort. Sag, <b>was</b> gemeint ist " +
      "und <b>warum</b> das wichtig ist. Zwei bis drei kurze Sätze reichen.</div>";
    k.appendChild(stich);

    const ta = el("textarea");
    ta.rows = 5; ta.id = "satzEingabe";
    ta.placeholder = "Zum Beispiel: Die Festplatte wird verschlüsselt. Dadurch …";
    k.appendChild(ta);

    const chips = el("div", "satz-chips");
    chips.appendChild(el("span", "eyebrow", "Satzmuster einfügen"));
    MUSTER().forEach(m => {
      const c = el("button", "satz-chip", m);
      c.onclick = () => {
        const t = ta.value.trim();
        ta.value = (t ? t + " " : "") + m.replace(/…/g, "").trim() + " ";
        ta.focus();
      };
      chips.appendChild(c);
    });
    k.appendChild(chips);

    const zeile = el("div", "gen-knopfzeile");
    const pruefen = el("button", "btn primary", "Prüfen");
    const weiter = el("button", "btn", "weiter →"); weiter.hidden = true;
    const zeigenL = el("button", "btn ghost", "Musterantwort");
    const raus = el("button", "btn ghost", "beenden");
    raus.onclick = zurueck;
    zeile.append(pruefen, weiter, zeigenL, el("span", "weit"), raus);
    k.appendChild(zeile);

    const rueck = el("div"); rueck.id = "satzRueck";
    k.appendChild(rueck);

    const loes = el("details", "gloesung"); loes.id = "satzLoesung";
    loes.appendChild(el("summary", null, "Musterantwort in einfachem Deutsch"));
    const lt = el("div", "txt", item.muster);
    lt.style.fontFamily = "var(--body)";
    loes.appendChild(lt);
    if (item.tipp) {
      const t = el("div", "gmerksatz");
      t.innerHTML = "<b>Worauf es ankommt</b>" + esc(item.tipp);
      loes.appendChild(t);
    }
    k.appendChild(loes);

    zeigenL.onclick = () => { loes.open = true; };
    pruefen.onclick = () => {
      const erg = bewerte(item, ta.value);
      zeigeRueck(item, erg, rueck, ta);
      if (!erg.leer) {
        LAUF.punkte += erg.punkte; LAUF.max += 2;
        const s = STAT[item.id] || { versuche: 0, bestPunkte: 0 };
        s.versuche++; s.bestPunkte = Math.max(s.bestPunkte, erg.punkte);
        STAT[item.id] = s; store.set(STAT);
        pruefen.disabled = true; weiter.hidden = false;
        if (erg.punkte < 2) loes.open = true;
      }
    };
    weiter.onclick = () => { LAUF.i++; karte(); };

    w.appendChild(k);
    ta.focus();
  }

  function zeigeRueck(item, erg, ziel, ta) {
    ziel.innerHTML = "";
    ta.classList.remove("richtig", "falsch", "teil");
    if (erg.leer) {
      ziel.innerHTML = '<div class="grueck"><span class="mittel">Da steht noch nichts.</span></div>';
      return;
    }
    ta.classList.add(erg.punkte >= 2 ? "richtig" : (erg.punkte > 0 ? "teil" : "falsch"));

    const box = el("div", "satz-rueck");
    const kopf = el("div", "satz-punkte");
    kopf.innerHTML = "<b>" + window.GEN.fmt.kurz(erg.punkte) + " von 2 BE</b> " +
      (erg.punkte >= 2 ? '<span class="gut">— so würde das in der Prüfung zählen.</span>'
        : erg.punkte >= 1 ? '<span class="mittel">— der Kern stimmt, es fehlt noch etwas.</span>'
          : '<span class="schlecht">— das reicht noch nicht.</span>');
    box.appendChild(kopf);

    const liste = el("ul", "satz-kriterien");
    const zeile = (ok, gut, schlecht) => {
      const li = el("li", ok ? "ja" : "nein");
      li.innerHTML = (ok ? "✓ " : "✗ ") + (ok ? gut : schlecht);
      liste.appendChild(li);
    };

    erg.begriffe.forEach(b =>
      zeile(b.ok, "Fachbegriff <b>" + esc(b.soll) + "</b> steht drin",
        "Fachbegriff fehlt: <b>" + esc(b.soll) + "</b> — ohne ihn gibt es keinen Punkt"));
    if (!item.ohneBegruendung) zeile(erg.konnektor, "Du erklärst den Zusammenhang",
      "Es fehlt die Begründung — ergänze „weil …“, „Dadurch …“ oder einen zweiten Satz, der erklärt");
    zeile(erg.langGenug, "Länge passt (" + erg.worte + " Wörter)",
      "Zu kurz: " + erg.worte + " Wörter. Für zwei Punkte brauchst du etwa " + erg.minW + ".");
    zeile(erg.ganzerSatz, "Ganzer Satz mit Punkt am Ende",
      "Schreib einen ganzen Satz: groß anfangen, Punkt am Ende");
    box.appendChild(liste);

    if (erg.punkte < 2 && item.tipp) {
      const t = el("div", "gmerksatz");
      t.innerHTML = "<b>Tipp</b>" + esc(item.tipp);
      box.appendChild(t);
    }
    ziel.appendChild(box);
  }

  function abschluss() {
    const w = $("satzInhalt"); w.innerHTML = "";
    const proz = LAUF.max ? Math.round(LAUF.punkte / LAUF.max * 100) : 0;
    const k = el("div", "satz-karte");
    k.appendChild(el("h2", null, "Fertig"));
    const hero = el("div", "hero");
    hero.innerHTML =
      '<div><span class="eyebrow">Ergebnis</span><div class="zahl">' + proz + ' %</div></div>' +
      '<div><span class="eyebrow">Punkte</span><div class="neben">' +
        window.GEN.fmt.kurz(LAUF.punkte) + " / " + LAUF.max + "</div></div>" +
      '<div class="txt">' +
      (proz >= 80
        ? "Das ist Prüfungsniveau. Mach morgen sechs neue Fragen — die Formulierungen müssen sitzen, ohne dass du überlegst."
        : proz >= 50
          ? "Der Kern stimmt oft, die Begründung fehlt noch. Nimm dir vor: nach jedem Fachbegriff kommt ein „weil“ oder „dadurch“."
          : "Hier liegen die meisten Punkte deiner Prüfung. Geh die Musterantworten durch und mach die Runde gleich noch einmal.") +
      "</div>";
    k.appendChild(hero);
    const zeile = el("div", "gen-knopfzeile");
    const neu = el("button", "btn primary", "Noch eine Runde");
    neu.onclick = () => starten();
    const zur = el("button", "btn ghost", "zur Übersicht");
    zur.onclick = zurueck;
    zeile.append(neu, el("span", "weit"), zur);
    k.appendChild(zeile);
    w.appendChild(k);
  }

  /* ------------------------------------------------------------ Einhängen */
  function einhaengen() {
    seite();
    const altSchirm = window.schirm;
    window.schirm = function (name) {
      altSchirm(name);
      const s = $("scSatz"); if (s && name !== "scSatz") s.hidden = true;
    };
    const altStart = window.renderStart;
    window.renderStart = function () {
      altStart.apply(null, arguments);
      try { startBox(); } catch (e) { console.error("Satzbau:", e); }
    };
    try { startBox(); } catch (e) { console.error("Satzbau:", e); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { starten, startBox, bewerte };
})();
