/* ============================================================================
   gen/operatoren.js — IHK-Operatoren als Schreibhilfe direkt im Antwortfeld
   ----------------------------------------------------------------------------
   In der Prüfung entscheidet das Verb der Aufgabenstellung, wie viel Text
   verlangt ist. „Nennen“ will Stichworte, „Erläutern“ will ganze Sätze mit
   Begründung. Wer bei „Begründen“ nur ein Wort hinschreibt, verliert Punkte,
   obwohl er die Sache weiß — und wer bei „Nennen“ Aufsätze schreibt, verliert
   Zeit.

   Diese Datei kennt die Operatoren, hängt an jedes Textfeld eine aufklappbare
   Hilfe und liefert anklickbare Satzgerüste (B2, einfache Sprache).
   ========================================================================== */
"use strict";

window.GENOP = (function () {
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  /* ---------------------------------------------------------------------
     Die Operatoren. `regex` erkennt sie in Aufgabentext und Feldbezeichnung,
     `rang` entscheidet bei mehreren Treffern: der anspruchsvollste gewinnt,
     denn „Nennen und begründen Sie“ ist eine Begründungsaufgabe.
     ------------------------------------------------------------------ */
  const OPERATOREN = [
    {
      key: "nennen", rang: 1,
      name: "Nennen / Aufzählen",
      regex: /\bnennen\b|\baufz(ä|ae)hlen\b|\bgeben sie .* an\b/i,
      verlangt: "Nur die Begriffe — ohne Erklärung, ohne ganze Sätze.",
      umfang: "Ein Stichwort oder eine kurze Wortgruppe je geforderter Nennung, jede in einer eigenen Zeile.",
      falle: "Hier bringt ein ausformulierter Absatz keinen einzigen Punkt mehr — er kostet nur Zeit. " +
             "Umgekehrt: genau so viele Nennungen wie verlangt. Stehen fünf da und drei sind gefragt, " +
             "zählt der Korrektor oft nur die ersten drei.",
      muster: ["Firewall", "regelmäßige Updates", "Zwei-Faktor-Authentifizierung"]
    },
    {
      key: "beschreiben", rang: 2,
      name: "Beschreiben / Darstellen",
      regex: /\bbeschreiben\b|\bdarstellen\b|\bschildern\b/i,
      verlangt: "Den Sachverhalt in eigenen Worten wiedergeben — was passiert, in welcher Reihenfolge.",
      umfang: "Zwei bis vier Sätze, sachlich, ohne Wertung.",
      falle: "Beschreiben heißt noch nicht begründen. Ein „weil“ ist hier nicht verlangt — " +
             "aber die Reihenfolge muss stimmen.",
      muster: [
        "Zuerst wird … , danach … .",
        "Der Ablauf beginnt mit … und endet mit … .",
        "Dabei wird … an … übergeben."
      ]
    },
    {
      key: "erklaeren", rang: 3,
      name: "Erklären",
      regex: /\berkl(ä|ae)ren\b|\bwas versteht man\b|\bwie funktioniert\b/i,
      verlangt: "Den Zusammenhang so darstellen, dass ihn jemand versteht, der die Sache nicht kennt.",
      umfang: "Zwei bis vier Sätze mit einem klaren Ursache-Wirkung-Zusammenhang.",
      falle: "Ein Fachbegriff allein erklärt nichts. Sag, WAS es ist und WOZU es dient.",
      muster: [
        "… bedeutet, dass … .",
        "Das funktioniert so: … . Dadurch … .",
        "Der Grund dafür ist, dass … ."
      ]
    },
    {
      key: "erlaeutern", rang: 4,
      name: "Erläutern",
      regex: /\berl(ä|ae)utern\b/i,
      verlangt: "Nennen UND ausführen: erst den Punkt, dann in eigenen Worten, was er bewirkt.",
      umfang: "Je gefordertem Punkt ein bis zwei vollständige Sätze — nicht mehr, aber auch nicht weniger.",
      falle: "Der häufigste Punktverlust der ganzen Prüfung: hingeschrieben wird nur das Stichwort. " +
             "„Verschlüsselung“ ist eine Nennung. „Die Festplatte wird verschlüsselt, damit die Daten " +
             "bei Diebstahl nicht lesbar sind“ ist eine Erläuterung.",
      muster: [
        "… . Dadurch wird … .",
        "… , weil … . So wird … verhindert.",
        "… . Das bedeutet, dass … .",
        "… . Der Vorteil ist, dass … ."
      ]
    },
    {
      key: "begruenden", rang: 5,
      name: "Begründen",
      regex: /\bbegr(ü|ue)nden\b|\bwarum\b|\bweshalb\b|\bwieso\b/i,
      verlangt: "Eine Aussage plus das WARUM. Ohne „weil / damit / dadurch“ ist es keine Begründung.",
      umfang: "Je Begründung mindestens zwei Sätze oder ein Satz mit Nebensatz. " +
              "Sind zwei Begründungen gefragt, müssen es zwei VERSCHIEDENE sein.",
      falle: "Zwei Umformulierungen derselben Sache zählen als eine Begründung. " +
             "Und: der Bezug zur Situation in der Aufgabe muss drin stehen, nicht nur allgemeines Wissen.",
      muster: [
        "… ist sinnvoll, weil … . Dadurch … .",
        "Wir wählen … , da … . Andernfalls … .",
        "… , damit … nicht … .",
        "Das ist nötig, weil sonst … ."
      ]
    },
    {
      key: "beurteilen", rang: 6,
      name: "Beurteilen / Bewerten / Stellung nehmen",
      regex: /\bbeurteilen\b|\bbewerten\b|\bstellung nehmen\b|\bw(ä|ae)gen sie ab\b|\babw(ä|ae)gen\b/i,
      verlangt: "Beide Seiten nennen UND am Ende ein eigenes Urteil ziehen.",
      umgang: "",
      umfang: "Pro Seite ein bis zwei Sätze, dann ein klarer Schlusssatz mit deiner Entscheidung.",
      falle: "Ohne Schlusssatz gibt es keine volle Punktzahl, auch wenn davor alles richtig steht. " +
             "Der Satz muss anfangen wie „Insgesamt …“ oder „Ich empfehle …“.",
      muster: [
        "Dafür spricht, dass … . Dagegen spricht, dass … . Insgesamt … .",
        "Der Vorteil ist … , das Risiko ist … . Ich empfehle deshalb … .",
        "Kurzfristig … , langfristig … . Deshalb halte ich … für sinnvoller."
      ]
    },
    {
      key: "vergleichen", rang: 4,
      name: "Vergleichen / Gegenüberstellen / Unterscheiden",
      regex: /\bvergleichen\b|\bgegen(ü|ue)berstellen\b|\bunterscheiden\b|\bworin unterscheiden\b|\bunterschied\b/i,
      verlangt: "Beide Seiten am GLEICHEN Merkmal messen — nicht zwei getrennte Beschreibungen.",
      umfang: "Je Merkmal ein Satz, der beide Seiten enthält. Zwei bis drei Merkmale reichen meist.",
      falle: "Erst alles über A, dann alles über B — das ist kein Vergleich. " +
             "Jeder Satz muss beide nennen: „A … , B dagegen … “.",
      muster: [
        "Bei … ist … , bei … dagegen … .",
        "… ist schneller als … , dafür … .",
        "Beide … , der Unterschied liegt darin, dass … ."
      ]
    },
    {
      key: "empfehlen", rang: 5,
      name: "Empfehlen / Entscheiden / Vorschlagen",
      regex: /\bempfehlen\b|\bentscheiden\b|\bvorschlagen\b|\bwelche .* w(ä|ae)hlen\b|\bwof(ü|ue)r entscheiden\b/i,
      verlangt: "Eine klare Entscheidung nennen und sie mit der Situation aus der Aufgabe begründen.",
      umfang: "Ein Satz Entscheidung, danach zwei Begründungen mit Bezug auf die genannten Zahlen oder Vorgaben.",
      falle: "„Beides ist möglich“ bringt null Punkte. Entscheide dich — auch wenn du unsicher bist. " +
             "Eine begründete Entscheidung ist immer mehr wert als keine.",
      muster: [
        "Ich empfehle … , weil … . Außerdem … .",
        "Für die … GmbH ist … die bessere Wahl, da … .",
        "… , weil die Aufgabe … vorgibt und … dies erfüllt."
      ]
    },
    {
      key: "berechnen", rang: 3,
      name: "Berechnen / Ermitteln",
      regex: /\bberechnen\b|\bermitteln\b|\brechnen sie\b|\brechenweg\b/i,
      verlangt: "Ergebnis MIT Rechenweg und mit Einheit.",
      umfang: "Jeder Schritt eine Zeile: Ansatz, Zwischenergebnis, Endergebnis mit Einheit.",
      falle: "Zwei sichere Punktquellen werden oft verschenkt: die Einheit hinter dem Ergebnis " +
             "und der Rechenweg. Für einen nachvollziehbaren Rechenweg gibt es auch dann Punkte, " +
             "wenn das Endergebnis falsch ist (Folgefehler).",
      muster: ["Ansatz:  … ÷ … = …", "Zwischenergebnis: … €", "Ergebnis: … € (gerundet auf … )"]
    },
    {
      key: "pruefen", rang: 4,
      name: "Prüfen / Überprüfen / Kontrollieren",
      regex: /\bpr(ü|ue)fen sie\b|\b(ü|ue)berpr(ü|ue)fen\b|\bkontrollieren\b|\btrifft .* zu\b/i,
      verlangt: "Aussage mit einem Kriterium abgleichen und das Ergebnis als klares Ja oder Nein sagen.",
      umfang: "Kriterium nennen, prüfen, Ergebnis in einem Satz.",
      falle: "Die Antwort „ja“ oder „nein“ allein reicht nicht — der Prüfschritt gehört dazu.",
      muster: [
        "Das Kriterium ist … . Hier gilt … , also … .",
        "Nein, weil … . Nötig wäre … ."
      ]
    }
  ];

  /** Passenden Operator zu Aufgabentext und Feldbezeichnung finden */
  function erkenne(text) {
    const t = String(text == null ? "" : text);
    let best = null;
    OPERATOREN.forEach(o => {
      if (!o.regex.test(t)) return;
      if (!best || o.rang > best.rang) best = o;
    });
    return best;
  }

  /** Text an der Cursorposition einfügen */
  function einfuegen(feld, text) {
    const a = feld.selectionStart == null ? feld.value.length : feld.selectionStart;
    const b = feld.selectionEnd == null ? a : feld.selectionEnd;
    const vor = feld.value.slice(0, a);
    const nach = feld.value.slice(b);
    const trenner = (vor && !/\n$/.test(vor)) ? "\n" : "";
    feld.value = vor + trenner + text + nach;
    const pos = (vor + trenner + text).indexOf("…", vor.length);
    feld.focus();
    if (pos >= 0) feld.setSelectionRange(pos, pos + 1);
    else feld.setSelectionRange(feld.value.length - nach.length, feld.value.length - nach.length);
    feld.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * Aufklappbare Hilfe unter ein Antwortfeld hängen.
   * @param op    Operator aus erkenne()
   * @param feld  das textarea/input, in das die Muster geschrieben werden
   */
  function hilfeEl(op, feld) {
    const d = el("details", "op-hilfe");
    const s = el("summary");
    s.innerHTML = 'Hilfe zum Operator <b>„' + op.name.split(" / ")[0] + '“</b>';
    d.appendChild(s);

    const in_ = el("div", "op-in");
    const z1 = el("div", "op-zeile");
    z1.appendChild(el("span", "op-lbl", "Verlangt"));
    z1.appendChild(el("span", null, op.verlangt));
    const z2 = el("div", "op-zeile");
    z2.appendChild(el("span", "op-lbl", "Umfang"));
    z2.appendChild(el("span", null, op.umfang));
    const z3 = el("div", "op-zeile op-falle");
    z3.appendChild(el("span", "op-lbl", "Falle"));
    z3.appendChild(el("span", null, op.falle));
    in_.append(z1, z2, z3);

    if (op.muster && op.muster.length && feld) {
      const mt = el("div", "op-mt", op.key === "nennen"
        ? "So kurz reicht es:"
        : "Satzgerüste — anklicken, dann die Lücken füllen:");
      in_.appendChild(mt);
      const box = el("div", "op-muster");
      op.muster.forEach(m => {
        const b = el("button", "op-chip", m);
        b.type = "button";
        b.onclick = ev => { ev.preventDefault(); einfuegen(feld, m); };
        box.appendChild(b);
      });
      in_.appendChild(box);
    }
    d.appendChild(in_);
    return d;
  }

  /* ---------------------------------------------------------------------
     Übersichtsseite: alle Operatoren auf einen Blick, druckbar wie das
     Formelblatt. Nutzt den Behälter von GENDRUCK.
     ------------------------------------------------------------------ */
  function zeigen() {
    if (!window.GENDRUCK) return;
    const $ = id => document.getElementById(id);
    window.GENDRUCK.zeige({ titel: "Operatoren", erstellt: "" }, [], { loesung: false });
    const leiste = $("druckLeiste");
    leiste.innerHTML = "";
    const info = el("div", "dr-info");
    info.innerHTML = "<b>Operatoren</b> — welches Verb wie viel Text verlangt. " +
      "Zum Ausdrucken und neben den Übungsbogen legen.";
    leiste.appendChild(info);
    leiste.appendChild(el("span", "weit"));
    const dr = el("button", "btn primary", "Drucken / als PDF speichern");
    dr.onclick = () => window.print();
    leiste.appendChild(dr);
    const zu = el("button", "btn ghost", "zurück");
    zu.onclick = () => window.GENDRUCK.schliessen();
    leiste.appendChild(zu);
    const b = $("druckBogen");
    b.innerHTML = "";
    b.appendChild(bauSeite());
    window.scrollTo(0, 0);
  }

  function bauSeite() {
    const s = el("section", "dr-seite");
    s.appendChild(el("h2", "dr-h2", "IHK-Operatoren"));
    s.appendChild(el("div", "dr-klein",
      "Das Verb der Aufgabenstellung sagt, wie viel Text verlangt ist. " +
      "Zu wenig kostet Punkte, zu viel kostet Zeit."));
    const tab = el("table", "dr-verteilung");
    tab.innerHTML = "<thead><tr><th>Operator</th><th>Verlangt</th><th>Umfang</th></tr></thead>";
    const tb = el("tbody");
    OPERATOREN.slice().sort((a, b) => a.rang - b.rang).forEach(o => {
      const tr = el("tr");
      tr.appendChild(el("td", null, o.name));
      tr.appendChild(el("td", null, o.verlangt));
      tr.appendChild(el("td", null, o.umfang));
      tb.appendChild(tr);
    });
    tab.appendChild(tb);
    s.appendChild(tab);

    s.appendChild(el("h2", "dr-h2", "Satzgerüste"));
    OPERATOREN.filter(o => o.muster && o.key !== "nennen" && o.key !== "berechnen").forEach(o => {
      const b = el("div", "dr-merk");
      b.appendChild(el("b", null, o.name));
      o.muster.forEach(m => b.appendChild(el("div", "dr-klein", "· " + m)));
      s.appendChild(b);
    });
    return s;
  }

  /* ------------------------------------------------------------- Startbox */
  function knopfEinbauen() {
    const $ = id => document.getElementById(id);
    const ziel = $("satzBox") || $("genStartBox");
    if (!ziel || $("btnOperatoren")) return;
    const zeile = el("div", "gen-knopfzeile");
    zeile.style.marginTop = "10px";
    const k = el("button", "btn"); k.id = "btnOperatoren";
    k.textContent = "Operatoren-Blatt ansehen und drucken";
    k.onclick = zeigen;
    zeile.appendChild(k);
    const hin = el("span");
    hin.style.cssText = "font-size:13px;color:var(--muted)";
    hin.textContent = OPERATOREN.length + " Operatoren mit Umfang, Falle und Satzgerüsten. " +
      "Im Arbeitsblatt steckt dieselbe Hilfe unter jedem Textfeld.";
    zeile.appendChild(hin);
    ziel.appendChild(zeile);
  }

  function einhaengen() {
    const alt = window.renderStart;
    if (typeof alt === "function") {
      window.renderStart = function () {
        alt.apply(null, arguments);
        try { knopfEinbauen(); } catch (e) { console.error("Operatoren:", e); }
      };
    }
    try { knopfEinbauen(); } catch (e) { }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { OPERATOREN, erkenne, hilfeEl, einfuegen, zeigen, bauSeite };
})();
