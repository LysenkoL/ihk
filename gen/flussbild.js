/* ============================================================================
   gen/flussbild.js — das Aktivitätsdiagramm als Bild, nicht als Tabelle
   ----------------------------------------------------------------------------
   Vorher stand hier eine Tabelle mit vier Spalten pro Knoten: Bezeichnung,
   Typ, „Kante zeigt auf“ (Zielnamen abtippen, mehrere durch Komma) und
   Bedingung. Auf Papier geht das. Auf einem Telefon ist es unbrauchbar —
   vierzehn Zeilen in zufälliger Reihenfolge, aus denen man den Ablauf im
   Kopf zusammensetzen soll, und geprüft wird am Ende, ob man Zielnamen
   fehlerfrei abgeschrieben hat. Das ist keine Modellierungsaufgabe.

   Jetzt wird gezeichnet und es sind Lücken darin — die Aufgabenform, die in
   der Prüfung tatsächlich vorkommt („Vervollständigen Sie das folgende
   Aktivitätsdiagramm“). Gefragt wird an den drei Stellen, an denen es beim
   Aktivitätsdiagramm inhaltlich klemmt:

     Knotentyp     ist das eine Aktion, eine Entscheidung oder ein Fork?
     Bezeichnung   welcher Schritt gehört an diese Stelle des Ablaufs?
     Bedingung     welcher Ausgang der Entscheidung ist [ja], welcher [nein]?

   Gezeichnet wird mit ganz normalem HTML: eine Spalte von oben nach unten,
   Verzweigungen als nebeneinanderliegende Spalten (am Telefon untereinander
   mit Einzug). Kein SVG, keine Bibliothek, kein Ziehen mit dem Finger —
   jede Lücke ist ein <select>, und das kann Android besser als alles, was
   man selbst bauen würde.

   Das Layout selbst rechnet GEN.flussLayout() aus; hier steht nur, wie es
   aussieht.
   ========================================================================== */
"use strict";

window.GENFLUSS = (function () {
  const G = window.GEN;
  const el = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  };

  /* Typ → CSS-Klasse und Symbol. Die Form trägt die Bedeutung, deshalb
     bekommt jeder Knotentyp seine eigene.                                */
  const FORM = {
    start:            { klasse: "fb-start",  zeichen: "●" },
    ende:             { klasse: "fb-ende",   zeichen: "◉" },
    aktion:           { klasse: "fb-aktion", zeichen: "" },
    entscheidung:     { klasse: "fb-raute",  zeichen: "◇" },
    zusammenfuehrung: { klasse: "fb-merge",  zeichen: "◇" },
    merge:            { klasse: "fb-merge",  zeichen: "◇" },
    parallelisierung: { klasse: "fb-balken", zeichen: "▬" },
    fork:             { klasse: "fb-balken", zeichen: "▬" },
    synchronisation:  { klasse: "fb-balken", zeichen: "▬" },
    join:             { klasse: "fb-balken", zeichen: "▬" }
  };
  function form(typ) {
    const t = G && G.normTyp ? G.normTyp(typ) : String(typ || "").toLowerCase();
    return FORM[t] || FORM.aktion;
  }

  /* -------------------------------------------------------------------- */
  /* Ein Feld zeichnen.                                                    */
  /* onWert(nr, wert) meldet jede Änderung nach außen; werte enthält den   */
  /* gespeicherten Stand. lesen=true zeichnet die fertige Lösung.          */
  /* -------------------------------------------------------------------- */
  function bau(f, werte, onWert, lesen) {
    const soll = f.soll || [];
    const L = f.luecken || [];
    const bloecke = G.flussLayout(soll, f.start);

    /* Lücken schnell finden: Knoten → {typ:nr, name:nr, bed:{kante:nr}} */
    const karte = {};
    L.forEach((l, nr) => {
      const k = karte[l.n] || (karte[l.n] = { bed: {} });
      if (l.art === "bed") k.bed[l.e || 0] = nr;
      else k[l.art] = nr;
    });

    const wurzel = el("div", "fb" + (lesen ? " fb-loesung" : ""));

    /* --- eine Lücke ------------------------------------------------- */
    function luecke(nr, art) {
      const l = L[nr];
      if (lesen) {
        const s = el("span", "fb-fest", l.soll);
        return s;
      }
      const sel = el("select", "fb-luecke fb-l-" + art);
      sel.dataset.nr = nr;
      const leer = el("option", null, art === "typ" ? "— Typ wählen —"
        : art === "bed" ? "— Bedingung —" : "— Schritt wählen —");
      leer.value = "";
      sel.appendChild(leer);
      ((f.pool || {})[art] || []).forEach(o => {
        const op = el("option", null, o); op.value = o; sel.appendChild(op);
      });
      const w = werte && werte[nr];
      sel.value = w == null ? "" : w;
      if (sel.value !== (w == null ? "" : w)) sel.value = "";   /* Altstand passt nicht mehr */
      sel.onchange = () => { onWert(nr, sel.value); sel.classList.remove("richtig", "falsch"); };
      return sel;
    }

    /* Start, Ende, Fork, Join und Merge tragen in UML keine Beschriftung —
       und wenn dort „Aufspaltung“ stünde, wäre die Typfrage geschenkt. */
    const OHNE_NAME = { start: 1, ende: 1, parallelisierung: 1, fork: 1,
                        synchronisation: 1, join: 1, zusammenfuehrung: 1, merge: 1 };

    /* --- ein Knotenkasten -------------------------------------------- */
    function knotenEl(i) {
      const k = soll[i];
      const lk = karte[i] || { bed: {} };
      const offenerTyp = lk.typ != null && !lesen;
      const box = el("div", "fb-knoten");
      box.dataset.knoten = i;

      const sym = el("span", "fb-sym");
      box.appendChild(sym);

      /* Solange der Typ nicht gewählt ist, bleibt der Kasten neutral —
         sonst verrät die Form die Antwort. Mit der Auswahl nimmt er
         sofort die passende Gestalt an; das ist die Rückmeldung.      */
      function gestalt(typ) {
        const fm = form(typ);
        box.className = "fb-knoten " + (typ ? fm.klasse : "fb-offen");
        sym.textContent = typ ? fm.zeichen : "?";
      }

      /* Der Name eines Strukturknotens („Aufspaltung“, „Ende“) wird nie
         gezeigt: er wäre die Antwort auf die Typfrage daneben.        */
      const txt = el("div", "fb-txt");
      if (lk.name != null) txt.appendChild(luecke(lk.name, "name"));
      else if (!OHNE_NAME[G.normTyp(k.typ)]) txt.appendChild(el("span", "fb-name", k.name));
      else txt.appendChild(el("span", "fb-name fb-anonym", offenerTyp ? "" : k.typ));
      box.appendChild(txt);

      const typ = el("div", "fb-typ");
      if (offenerTyp) {
        const s = luecke(lk.typ, "typ");
        const alt = s.onchange;
        s.onchange = () => { alt(); gestalt(s.value); };
        typ.appendChild(s);
        box.appendChild(typ);
        gestalt(s.value);
      } else {
        typ.appendChild(el("span", "fb-typname", k.typ));
        box.appendChild(typ);
        gestalt(k.typ);
      }
      return box;
    }

    function pfeil() { return el("div", "fb-pfeil"); }

    /* --- Blockliste zeichnen ------------------------------------------ */
    function reihe(liste) {
      const w = el("div", "fb-reihe");
      liste.forEach((b, n) => {
        if (n) w.appendChild(pfeil());
        if (b.art === "knoten") w.appendChild(knotenEl(b.i));
        else if (b.art === "sprung") {
          const s = el("div", "fb-sprung");
          s.appendChild(el("span", "fb-sym", "↑"));
          s.appendChild(el("span", null, "zurück zu „" + (soll[b.ziel] || {}).name + "“"));
          w.appendChild(s);
        } else if (b.art === "zweige") {
          const z = el("div", "fb-zweige");
          const lk = karte[b.von] || { bed: {} };
          b.spalten.forEach((sp, e) => {
            const s = el("div", "fb-spalte");
            const kopf = el("div", "fb-bed");
            if (lk.bed[e] != null) kopf.appendChild(luecke(lk.bed[e], "bed"));
            else if (sp.bed) kopf.appendChild(el("span", "fb-bedtext", sp.bed));
            else kopf.appendChild(el("span", "fb-bedtext fb-leer", "▼"));
            s.appendChild(kopf);
            if (sp.bloecke.length) s.appendChild(reihe(sp.bloecke));
            else s.appendChild(el("div", "fb-weiter", "weiter unten"));
            z.appendChild(s);
          });
          w.appendChild(z);
        }
      });
      return w;
    }

    wurzel.appendChild(reihe(bloecke));
    return wurzel;
  }

  /* Nach dem Prüfen die Lücken einfärben. */
  function markiere(box, stand) {
    if (!box) return;
    box.querySelectorAll(".fb-luecke").forEach(s => {
      s.classList.remove("richtig", "falsch");
      const z = stand && stand[s.dataset.nr];
      if (z === "richtig" || z === "falsch") s.classList.add(z);
    });
  }

  return { bau, markiere, form };
})();
