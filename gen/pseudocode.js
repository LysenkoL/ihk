/* ============================================================================
   gen/pseudocode.js — Pseudocode und Struktogramme selbst schreiben
   ----------------------------------------------------------------------------
   In den zehn ausgewerteten Prüfungen taucht Programmablauf in zwei Formen
   auf: entweder liegt ein fertiger Ablauf vor und man soll ihn erklären oder
   einen Fehler finden — oder (teurer, bis zu 9 BE) man muss ihn selbst
   hinschreiben: als Struktogramm, als Pseudocode, als Reihenfolge vorgegebener
   Anweisungen.

   Lesen kann man das üben, indem man Lösungen anschaut. Schreiben nicht.
   Deshalb zwei Modi:

     Ordnen    — vorgegebene Anweisungen in die richtige Reihenfolge und
                 Verschachtelungstiefe bringen. Genau das IHK-Format.
     Schreiben — freier Text; geprüft wird auf die Bausteine, die drin sein
                 müssen: Initialisierung, Schleifenkopf, Zugriff aufs Feld,
                 Zählvariable erhöhen, Rückgabe.

   Geprüft wird nicht auf Wortgleichheit — „Solange“, „While“ und „wiederhole
   solange“ gelten gleich. Was zählt, ist die Struktur.
   ========================================================================== */
"use strict";

window.GENPSEUDO = (function () {
  const SK = "ihk2:pseudo";
  const $ = id => document.getElementById(id);
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  /* ------------------------------------------------------------ Aufgaben */
  /* zeilen: [Text, Tiefe] in der RICHTIGEN Reihenfolge.
     bausteine: was im frei geschriebenen Text vorkommen muss.            */
  const AUFGABEN = [
    {
      id: "install",
      titel: "Software auf allen PCs installieren",
      herkunft: "nach AP1 Frühjahr 2022, Aufgabe 4 d) — 9 BE",
      text:
        "Aus einer Datenbank werden alle zu konfigurierenden PCs ausgelesen. Danach wird " +
        "für jeden PC die zu installierende Software abgefragt und installiert.\n\n" +
        "Variablen: PCNr, SoftwareNr (Ganzzahl)\n" +
        "Felder: PCListe[], SoftwareListe[]\n" +
        "Funktionen: getPC(), getSoftware(String), installSoftware(Software, PC)",
      zeilen: [
        ["PCNr = 0", 0],
        ["PCListe[] = getPC()", 0],
        ["Solange PCNr < Anzahl der Elemente in PCListe[]", 0],
        ["SoftwareListe[] = getSoftware(PCListe[PCNr])", 1],
        ["SoftwareNr = 0", 1],
        ["Solange SoftwareNr < Anzahl der Elemente in SoftwareListe[]", 1],
        ["installSoftware(SoftwareListe[SoftwareNr], PCListe[PCNr])", 2],
        ["SoftwareNr = SoftwareNr + 1", 2],
        ["PCNr = PCNr + 1", 1]
      ],
      falle: "SoftwareNr muss INNERHALB der äußeren Schleife auf 0 gesetzt werden — " +
             "sonst läuft die innere Schleife ab dem zweiten PC nicht mehr.",
      bausteine: [
        { name: "Zähler initialisieren", muster: [/\b(pcnr)\s*(=|:=|←)\s*0/], tipp: "PCNr = 0 vor der Schleife." },
        { name: "PC-Liste holen", muster: [/getpc\s*\(/], tipp: "PCListe[] = getPC()" },
        { name: "äußere Schleife", muster: [/(solange|while|wiederhole|für|for).*pcliste/], tipp: "Solange PCNr < Anzahl der Elemente in PCListe[]" },
        { name: "Software zum PC holen", muster: [/getsoftware\s*\(/], tipp: "SoftwareListe[] = getSoftware(PCListe[PCNr])" },
        { name: "inneren Zähler zurücksetzen", muster: [/\bsoftwarenr\s*(=|:=|←)\s*0/], tipp: "SoftwareNr = 0 — und zwar in der äußeren Schleife." },
        { name: "innere Schleife", muster: [/(solange|while|wiederhole|für|for).*softwareliste/], tipp: "Solange SoftwareNr < Anzahl der Elemente in SoftwareListe[]" },
        { name: "installieren", muster: [/installsoftware\s*\(/], tipp: "installSoftware(SoftwareListe[SoftwareNr], PCListe[PCNr])" },
        { name: "innerer Zähler + 1", muster: [/softwarenr\s*(=|:=|←)\s*softwarenr\s*\+\s*1/, /softwarenr\s*\+\+/], tipp: "SoftwareNr = SoftwareNr + 1" },
        { name: "äußerer Zähler + 1", muster: [/pcnr\s*(=|:=|←)\s*pcnr\s*\+\s*1/, /pcnr\s*\+\+/], tipp: "PCNr = PCNr + 1 als letzte Anweisung der äußeren Schleife." }
      ]
    },
    {
      id: "bestand",
      titel: "Medikamente unter Mindestbestand melden",
      herkunft: "nach AP1 Herbst 2025, Aufgabe 4 c)",
      text:
        "Ein Algorithmus prüft den Lagerbestand aller Medikamente und gibt jedes aus, " +
        "dessen Menge unter einer Grenze liegt.\n\n" +
        "Übergeben werden: daten (Liste von Medikamenten mit name und menge), grenze",
      zeilen: [
        ["FUNKTION pruefeBestand(daten, grenze)", 0],
        ["Für jedes medikament in daten", 1],
        ["Wenn medikament.menge < grenze dann", 2],
        ["AUSGABE medikament.name + \" liegt unter der Grenze\"", 3],
        ["Ende Wenn", 2],
        ["Ende Für", 1],
        ["ENDE FUNKTION", 0]
      ],
      falle: "Die Bedingung gehört IN die Schleife. Eine Prüfung vor der Schleife " +
             "würde nur das erste Medikament betrachten.",
      bausteine: [
        { name: "Funktionskopf mit Parametern", muster: [/(funktion|function|algorithmus)\s+\w+\s*\(.*\)/], tipp: "FUNKTION pruefeBestand(daten, grenze)" },
        { name: "Schleife über alle Einträge", muster: [/(für jedes|for each|für alle|solange|while|for)/], tipp: "Für jedes medikament in daten" },
        { name: "Vergleich mit der Grenze", muster: [/(wenn|if).*(<|kleiner|unter)/], tipp: "Wenn medikament.menge < grenze dann" },
        { name: "Ausgabe", muster: [/(ausgabe|print|schreibe|gib .* aus)/], tipp: "AUSGABE medikament.name …" }
      ]
    },
    {
      id: "gesamtpreis",
      titel: "Gesamtpreis einer Bestellung",
      herkunft: "nach AP1 Herbst 2025, Aufgabe 4 d)",
      text:
        "Eine Bestellung besteht aus mehreren Produkten mit Name, Preis pro Einheit und " +
        "Menge. Gesucht ist eine Funktion, die den Gesamtpreis zurückgibt.",
      zeilen: [
        ["FUNKTION berechneGesamtpreis(bestellung)", 0],
        ["gesamtpreis = 0", 1],
        ["Für jedes produkt in bestellung", 1],
        ["gesamtpreis = gesamtpreis + (produkt.preis * produkt.menge)", 2],
        ["Ende Für", 1],
        ["Rückgabe gesamtpreis", 1],
        ["ENDE FUNKTION", 0]
      ],
      falle: "Zwei Klassiker: die Rückgabe steht INNERHALB der Schleife (dann bricht sie " +
             "nach dem ersten Produkt ab), oder gesamtpreis wird in der Schleife auf 0 " +
             "gesetzt (dann bleibt nur das letzte Produkt übrig).",
      bausteine: [
        { name: "Summe initialisieren", muster: [/\w*(gesamt|summe|total)\w*\s*(=|:=|←)\s*0/], tipp: "gesamtpreis = 0 — vor der Schleife." },
        { name: "Schleife über die Produkte", muster: [/(für jedes|for each|für alle|solange|while|for)/], tipp: "Für jedes produkt in bestellung" },
        { name: "Preis mal Menge", muster: [/\*|·|mal\b/], tipp: "produkt.preis * produkt.menge" },
        { name: "aufsummieren", muster: [/(gesamt|summe|total)\w*\s*(=|:=|←)\s*\w*(gesamt|summe|total)/, /\+=/], tipp: "gesamtpreis = gesamtpreis + …" },
        { name: "Rückgabe", muster: [/(rückgabe|return|gib .* zurück|liefere)/], tipp: "Rückgabe gesamtpreis — nach der Schleife." }
      ]
    },
    {
      id: "maximum",
      titel: "Teuerste Position finden",
      herkunft: "häufiger Baustein in Kalkulationsaufgaben",
      text:
        "Aus einer Liste von Angeboten (name, preis) soll das teuerste zurückgegeben werden. " +
        "Die Liste ist nicht leer.",
      zeilen: [
        ["FUNKTION teuerstes(angebote)", 0],
        ["bestes = angebote[0]", 1],
        ["i = 1", 1],
        ["Solange i < Anzahl der Elemente in angebote", 1],
        ["Wenn angebote[i].preis > bestes.preis dann", 2],
        ["bestes = angebote[i]", 3],
        ["Ende Wenn", 2],
        ["i = i + 1", 2],
        ["Ende Solange", 1],
        ["Rückgabe bestes", 1],
        ["ENDE FUNKTION", 0]
      ],
      falle: "Startwert ist das erste Element, nicht 0 — bei Preisen käme man mit 0 zufällig " +
             "durch, bei negativen Werten (z. B. Temperaturen) nicht. Und: i = i + 1 muss " +
             "AUSSERHALB der Wenn-Bedingung stehen, sonst hängt die Schleife.",
      bausteine: [
        { name: "Startwert = erstes Element", muster: [/(bestes|max\w*|groesstes|größtes)\s*(=|:=|←)[^\n]*\[\s*0\s*\]/], tipp: "bestes = angebote[0] — nicht 0." },
        { name: "Schleife", muster: [/(solange|while|für|for)/], tipp: "Solange i < Anzahl der Elemente" },
        { name: "Vergleich", muster: [/(wenn|if).*(>|größer|groesser)/], tipp: "Wenn angebote[i].preis > bestes.preis dann" },
        { name: "neues Maximum merken", muster: [/(bestes|max\w*)\s*(=|:=|←)[^\n]*\[\s*(i|j|index|n)\s*\]/], tipp: "bestes = angebote[i]" },
        { name: "Zähler erhöhen", muster: [/\bi\s*(=|:=|←)\s*i\s*\+\s*1/, /\bi\s*\+\+/], tipp: "i = i + 1 — außerhalb der Wenn-Bedingung." },
        { name: "Rückgabe", muster: [/(rückgabe|return|gib .* zurück)/], tipp: "Rückgabe bestes" }
      ]
    },
    {
      id: "warnung",
      titel: "Speicherplatz-Warnung (Fehler im Skript)",
      herkunft: "nach AP1 Herbst 2021, Aufgabe 2 e)",
      text:
        "Ein Skript soll warnen, wenn auf Laufwerk Z weniger als 15 % frei sind. " +
        "Schreibe den Ablauf richtig auf — im Original waren zwei Fehler eingebaut " +
        "(Faktor 1000 statt 100 und ein verdrehter Vergleich).",
      zeilen: [
        ["laufwerk = Get-Volume(Z)", 0],
        ["prozent = (laufwerk.frei / laufwerk.gesamt) * 100", 0],
        ["Wenn prozent < 15 dann", 0],
        ["AUSGABE \"Es sind weniger als 15 % Speicherplatz frei.\"", 1],
        ["Sonst", 0],
        ["AUSGABE \"Es ist genügend Speicherplatz verfügbar.\"", 1],
        ["Ende Wenn", 0]
      ],
      falle: "Anteil × 100 ergibt Prozent, nicht × 1000. Und „weniger als 15 %“ heißt " +
             "prozent < 15, nicht > 15 — im Original war beides falsch.",
      bausteine: [
        { name: "Prozent aus Anteil", muster: [/\*\s*100\b/], tipp: "… * 100, nicht * 1000." },
        { name: "Division frei durch gesamt", muster: [/\//], tipp: "frei / gesamt" },
        { name: "richtiger Vergleich", muster: [/(wenn|if)[^\n]*<\s*15/], tipp: "Wenn prozent < 15 dann" },
        { name: "Warnung ausgeben", muster: [/(ausgabe|print|write-host|schreibe)/], tipp: "AUSGABE \"…\"" },
        { name: "Sonst-Zweig", muster: [/(sonst|else)/], tipp: "Sonst: genügend Speicherplatz." }
      ]
    },
    {
      id: "berechtigung",
      titel: "Zutrittsberechtigung prüfen",
      herkunft: "nach AP1 Herbst 2024, Aufgabe 2 e)",
      text:
        "Ein zweidimensionales Feld keyData[][] enthält in der ersten Spalte die " +
        "Mitarbeiter-ID, in den weiteren Spalten die Raumnummern, für die sie " +
        "berechtigt ist. Die Funktion soll Wahr liefern, wenn id für roomNr " +
        "berechtigt ist.",
      zeilen: [
        ["FUNKTION checkAuthority(id, roomNr)", 0],
        ["Für i von 0 bis AnzahlZeilen(keyData) − 1", 1],
        ["Für j von 1 bis AnzahlSpalten(keyData) − 1", 2],
        ["Wenn keyData[i][0] = id UND keyData[i][j] = roomNr dann", 3],
        ["Rückgabe Wahr", 4],
        ["Ende Wenn", 3],
        ["Ende Für", 2],
        ["Ende Für", 1],
        ["Rückgabe Falsch", 1],
        ["ENDE FUNKTION", 0]
      ],
      falle: "„Rückgabe Falsch“ steht NACH beiden Schleifen. Steht es im Sonst-Zweig " +
             "innerhalb der Schleife, bricht die Suche schon bei der ersten Zeile ab.",
      bausteine: [
        { name: "zwei verschachtelte Schleifen", muster: [/(für|for|solange|while)[\s\S]*(für|for|solange|while)/], tipp: "Eine Schleife über die Zeilen, eine über die Spalten." },
        { name: "Spalte 0 ist die ID", muster: [/\[\s*0\s*\]/], tipp: "keyData[i][0] = id" },
        { name: "UND-Verknüpfung", muster: [/(und|and|&&)/], tipp: "… UND keyData[i][j] = roomNr" },
        { name: "Rückgabe Wahr", muster: [/(rückgabe|return)\s*(wahr|true)/], tipp: "Rückgabe Wahr, sobald der Treffer da ist." },
        { name: "Rückgabe Falsch am Ende", muster: [/(rückgabe|return)\s*(falsch|false)/], tipp: "Rückgabe Falsch nach beiden Schleifen." }
      ]
    }
  ];

  /* ------------------------------------------------------------ Speicher */
  let STAND = {};
  try { STAND = JSON.parse(localStorage.getItem(SK)) || {}; } catch (e) { }
  function sichern() { try { localStorage.setItem(SK, JSON.stringify(STAND)); } catch (e) { } }

  function merken(id, quote) {
    const s = STAND[id] || (STAND[id] = { n: 0, best: 0 });
    s.n++;
    s.best = Math.max(s.best, quote);
    s.z = Date.now();
    sichern();
  }

  /* --------------------------------------------------------- Prüfen ----- */
  function normal(s) {
    return String(s || "").toLowerCase()
      .replace(/[„“”"']/g, '"')
      .replace(/\s+/g, " ").trim();
  }

  /** Freitext gegen die Bausteine prüfen.
      Ein Baustein beschreibt fast immer EINE Anweisung — also wird Zeile für
      Zeile geprüft. Sonst würde „Solange … PCListe“ plus zwei Zeilen später
      „SoftwareListe“ fälschlich als innere Schleife durchgehen. Nur Muster,
      die ausdrücklich über mehrere Zeilen gehen ([\s\S]), sehen den ganzen
      Text.                                                                */
  function pruefeText(auf, text) {
    const t = normal(text);
    const zeilen = String(text || "").split(/\n/).map(normal).filter(Boolean);
    const trifft = m => m.source.indexOf("[\\s\\S]") >= 0
      ? m.test(t)
      : zeilen.some(z => m.test(z));
    const treffer = auf.bausteine.map(b => ({
      name: b.name, tipp: b.tipp,
      da: b.muster.some(trifft)
    }));
    const gefunden = treffer.filter(x => x.da).length;

    /* Reihenfolge: an welcher Stelle taucht der erste Treffer je Baustein auf? */
    const pos = auf.bausteine.map(b => {
      for (let i = 0; i < zeilen.length; i++) if (b.muster.some(m => m.test(zeilen[i]))) return i;
      return -1;
    });
    const da = pos.filter(p => p >= 0);
    let sortiert = true;
    for (let i = 1; i < da.length; i++) if (da[i] < da[i - 1]) sortiert = false;

    const quote = auf.bausteine.length ? gefunden / auf.bausteine.length : 0;
    return { treffer, gefunden, gesamt: auf.bausteine.length, quote, sortiert: da.length > 1 ? sortiert : null };
  }

  /** Reihenfolge im Ordnen-Modus prüfen. */
  function pruefeOrdnung(auf, folge) {
    const soll = auf.zeilen.map((_, i) => i);
    let richtigePaare = 0, paare = 0;
    for (let i = 0; i < folge.length; i++)
      for (let j = i + 1; j < folge.length; j++) {
        paare++;
        if (folge[i] < folge[j]) richtigePaare++;
      }
    const exakt = folge.every((v, i) => v === soll[i]);
    return { exakt, quote: paare ? richtigePaare / paare : 1, richtigePaare, paare };
  }

  /* ---------------------------------------------------------- Anzeige --- */
  let aktuell = null, modus = "ordnen", folge = [];

  /** nur die Prozentzahlen in der Kachelliste nachziehen — der Rest der
      Anzeige (und damit das gerade gezeigte Ergebnis) bleibt stehen. */
  function standAuffrischen() {
    document.querySelectorAll("#pseudoBox .ps-karte").forEach((k, i) => {
      const a = AUFGABEN[i]; if (!a) return;
      const s = STAND[a.id];
      const z = k.querySelector(".ps-stand");
      if (z) z.textContent = s ? Math.round(s.best * 100) + " % · " + s.n + "×" : "noch nicht versucht";
    });
  }

  function mische(n, saat) {
    const a = []; for (let i = 0; i < n; i++) a.push(i);
    let x = saat || 12345;
    const r = () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function box() {
    const s = $("scStart");
    if (!s) return;
    let b = $("pseudoBox");
    if (!b) {
      b = el("div", "abschnitt"); b.id = "pseudoBox";
      const g = $("zeitBox") || $("planBox") || $("gesamtBox");
      const nach = g ? (g.closest("details.st-block") || g) : null;
      if (nach && nach.parentNode) nach.parentNode.insertBefore(b, nach.nextSibling);
      else s.appendChild(b);
    }
    b.innerHTML = "";
    b.appendChild(el("h2", null, "Pseudocode selbst schreiben"));
    b.appendChild(el("p", null,
      "Lesen und Schreiben sind zwei verschiedene Fertigkeiten. Hier schreibst du den " +
      "Ablauf selbst — entweder als Reihenfolge vorgegebener Anweisungen oder frei. " +
      "Geprüft wird die Struktur, nicht der Wortlaut."));

    const liste = el("div", "ps-liste");
    AUFGABEN.forEach(a => {
      const s2 = STAND[a.id];
      const k = el("button", "ps-karte" + (aktuell && aktuell.id === a.id ? " an" : ""));
      k.type = "button";
      k.appendChild(el("span", "ps-titel", a.titel));
      k.appendChild(el("span", "ps-herk", a.herkunft));
      k.appendChild(el("span", "ps-stand", s2 ? Math.round(s2.best * 100) + " % · " + s2.n + "×" : "noch nicht versucht"));
      k.onclick = () => { oeffne(a.id); };
      liste.appendChild(k);
    });
    b.appendChild(liste);

    if (aktuell) b.appendChild(uebung());
  }

  function oeffne(id) {
    aktuell = AUFGABEN.find(a => a.id === id) || null;
    folge = aktuell ? mische(aktuell.zeilen.length, id.length * 7919 + Date.now() % 1000) : [];
    box();
    const b = $("pseudoBox");
    if (b) b.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function uebung() {
    const a = aktuell;
    const w = el("div", "ps-uebung");

    const kopf = el("div", "ps-kopf");
    kopf.appendChild(el("h3", null, a.titel));
    const wahl = el("div", "ps-modus");
    [["ordnen", "Reihenfolge"], ["schreiben", "frei schreiben"]].forEach(([m, n]) => {
      const k = el("button", "ps-mk" + (modus === m ? " an" : ""), n);
      k.type = "button";
      k.onclick = () => { modus = m; box(); };
      wahl.appendChild(k);
    });
    kopf.appendChild(wahl);
    w.appendChild(kopf);

    w.appendChild(el("div", "ps-text", a.text));

    if (modus === "ordnen") w.appendChild(ordnen(a));
    else w.appendChild(schreiben(a));
    return w;
  }

  /* ---- Modus 1: Reihenfolge --------------------------------------------- */
  function ordnen(a) {
    const w = el("div", "ps-ordnen");
    const ziel = el("div", "ps-ergebnis");

    function zeichne() {
      w.innerHTML = "";
      folge.forEach((idx, i) => {
        const z = el("div", "ps-zeile");
        z.style.paddingLeft = (10 + a.zeilen[idx][1] * 0) + "px";   /* Tiefe erst in der Lösung */
        const hoch = el("button", "ps-pfeil", "↑"); hoch.type = "button";
        hoch.disabled = i === 0;
        hoch.onclick = () => { const t = folge[i - 1]; folge[i - 1] = folge[i]; folge[i] = t; zeichne(); };
        const runter = el("button", "ps-pfeil", "↓"); runter.type = "button";
        runter.disabled = i === folge.length - 1;
        runter.onclick = () => { const t = folge[i + 1]; folge[i + 1] = folge[i]; folge[i] = t; zeichne(); };
        z.appendChild(el("code", "ps-code", a.zeilen[idx][0]));
        const wz = el("span", "ps-wz"); wz.append(hoch, runter);
        z.appendChild(wz);
        w.appendChild(z);
      });
      const leiste = el("div", "ps-leiste");
      const pr = el("button", "btn primary klein", "Reihenfolge prüfen");
      pr.type = "button";
      pr.onclick = () => {
        const e = pruefeOrdnung(a, folge);
        merken(a.id, e.quote);
        ziel.innerHTML = "";
        ziel.appendChild(ordnungsErgebnis(a, e));
        standAuffrischen();
      };
      const neu = el("button", "btn ghost klein", "neu mischen");
      neu.type = "button";
      neu.onclick = () => { folge = mische(a.zeilen.length, Date.now()); ziel.innerHTML = ""; zeichne(); };
      leiste.append(pr, neu);
      w.appendChild(leiste);
      w.appendChild(ziel);
    }
    zeichne();
    return w;
  }

  function ordnungsErgebnis(a, e) {
    const w = el("div", "ps-erg");
    w.appendChild(el("div", "ps-note" + (e.exakt ? " gut" : (e.quote > 0.85 ? " fast" : " schlecht")),
      e.exakt ? "Genau richtig."
              : Math.round(e.quote * 100) + " % der Paare stehen in der richtigen Ordnung."));
    w.appendChild(el("div", "ps-titel2", "Musterlösung"));
    const pre = el("pre", "ps-loesung");
    pre.textContent = a.zeilen.map(([t, d]) => "  ".repeat(d) + t).join("\n");
    w.appendChild(pre);
    w.appendChild(el("div", "ps-falle", "Typische Falle: " + a.falle));
    return w;
  }

  /* ---- Modus 2: frei schreiben ------------------------------------------ */
  function schreiben(a) {
    const w = el("div", "ps-schreiben");
    const ta = el("textarea", "ps-feld");
    ta.rows = 9;
    ta.placeholder = "Schreibe den Ablauf Zeile für Zeile — Einrückung mit Leerzeichen.\n" +
                     "Beispiel:\n  zaehler = 0\n  Solange zaehler < Anzahl …";
    ta.value = (STAND[a.id] && STAND[a.id].text) || "";
    w.appendChild(ta);

    const ziel = el("div", "ps-ergebnis");
    const leiste = el("div", "ps-leiste");
    const pr = el("button", "btn primary klein", "Prüfen");
    pr.type = "button";
    pr.onclick = () => {
      const e = pruefeText(a, ta.value);
      const s = STAND[a.id] || (STAND[a.id] = { n: 0, best: 0 });
      s.text = ta.value;
      merken(a.id, e.quote);
      ziel.innerHTML = "";
      ziel.appendChild(textErgebnis(a, e));
      standAuffrischen();
    };
    leiste.appendChild(pr);
    w.append(leiste, ziel);
    return w;
  }

  function textErgebnis(a, e) {
    const w = el("div", "ps-erg");
    w.appendChild(el("div", "ps-note" + (e.quote === 1 ? " gut" : (e.quote >= 0.6 ? " fast" : " schlecht")),
      e.gefunden + " von " + e.gesamt + " Bausteinen gefunden" +
      (e.sortiert === false ? " — aber die Reihenfolge stimmt noch nicht." : ".")));
    const l = el("div", "ps-bausteine");
    e.treffer.forEach(t => {
      const z = el("div", "ps-bs" + (t.da ? " da" : ""));
      z.appendChild(el("span", "ps-bsmark", t.da ? "✓" : "○"));
      z.appendChild(el("span", "ps-bsname", t.name));
      if (!t.da) z.appendChild(el("span", "ps-bstipp", t.tipp));
      l.appendChild(z);
    });
    w.appendChild(l);
    w.appendChild(el("div", "ps-titel2", "Musterlösung"));
    const pre = el("pre", "ps-loesung");
    pre.textContent = a.zeilen.map(([t, d]) => "  ".repeat(d) + t).join("\n");
    w.appendChild(pre);
    w.appendChild(el("div", "ps-falle", "Typische Falle: " + a.falle));
    return w;
  }

  /* --------------------------------------------------------- Einhängen -- */
  function einhaengen() {
    const alt = window.renderStart;
    if (typeof alt === "function") {
      window.renderStart = function () {
        alt.apply(null, arguments);
        try { setTimeout(() => { aktuell = null; box(); }, 0); } catch (e) { console.error("Pseudocode:", e); }
      };
    }
    setTimeout(box, 340);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  return { AUFGABEN, pruefeText, pruefeOrdnung, box, oeffne, stand: () => STAND };
})();
