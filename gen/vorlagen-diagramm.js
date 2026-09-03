/* ============================================================================
   gen/vorlagen-diagramm.js — Diagramme und Modelle als generierte Aufgaben:
   UML-Aktivitätsdiagramm, ER-Modell, Use-Case, Netzplan, Gantt, Pseudocode.
   Alles wird gewürfelt und automatisch geprüft.
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde, Z = G.ZAHLWORT;

  /* ====================================================== 1. Aktivität == */
  const AKT_SZENARIEN = [
    {
      titel: "Einrichtung und Abnahme eines hybriden Arbeitsplatzes",
      schritte: ["Notebook inventarisieren", "Betriebssystem-Image aufspielen", "WLAN konfigurieren",
                 "VPN-Zertifikat importieren", "VPN-Verbindung testen"],
      pruefung: "VPN-Test erfolgreich?",
      ja: "Übergabe und Einweisung", nein: "Ticket an das Netzwerkteam erstellen",
      parallel: ["Zubehör kommissionieren", "Benutzerkonto anlegen"]
    },
    {
      titel: "Bearbeitung einer Störungsmeldung im First Level Support",
      schritte: ["Ticket aufnehmen", "Störung kategorisieren", "Priorität festlegen",
                 "Lösung aus der Wissensdatenbank suchen"],
      pruefung: "Lösung im First Level möglich?",
      ja: "Störung beheben und Ticket schließen", nein: "An den Second Level eskalieren",
      parallel: ["Melder informieren", "Ersatzgerät reservieren"]
    },
    {
      titel: "Wareneingang einer Hardwarelieferung",
      schritte: ["Lieferung annehmen", "Lieferschein mit Bestellung abgleichen",
                 "Geräte auf Transportschäden prüfen", "Seriennummern erfassen"],
      pruefung: "Lieferung vollständig und unbeschädigt?",
      ja: "Ware einlagern und Rechnung freigeben", nein: "Mängelrüge an den Lieferanten senden",
      parallel: ["Inventarnummern vergeben", "Garantiedaten hinterlegen"]
    },
    {
      titel: "Onboarding einer neuen Mitarbeiterin",
      schritte: ["Antrag der Fachabteilung prüfen", "Benutzerkonto anlegen",
                 "Rechte nach Rollenkonzept vergeben", "Arbeitsplatz vorbereiten"],
      pruefung: "Alle Freigaben vorhanden?",
      ja: "Zugangsdaten übergeben", nein: "Fehlende Freigabe beim Vorgesetzten anfordern",
      parallel: ["Hardware bestellen", "Schulungstermin buchen"]
    },
    {
      titel: "Einspielen eines Sicherheitsupdates",
      schritte: ["Update aus der Herstellerquelle laden", "Signatur prüfen",
                 "Update in der Testumgebung installieren", "Funktionstest durchführen"],
      pruefung: "Test ohne Fehler?",
      ja: "Update produktiv ausrollen", nein: "Rollback durchführen und Hersteller informieren",
      parallel: ["Wartungsfenster ankündigen", "Rücksicherung bereitstellen"]
    },
    {
      titel: "Rückgabe eines Notebooks beim Austritt",
      schritte: ["Gerät entgegennehmen", "Vollständigkeit des Zubehörs prüfen",
                 "Daten sichern", "Datenträger sicher löschen"],
      pruefung: "Gerät weiter verwendbar?",
      ja: "Gerät neu aufsetzen und einlagern", nein: "Gerät zertifiziert entsorgen",
      parallel: ["Benutzerkonto deaktivieren", "Inventar aktualisieren"]
    }
  ];

  const TYPEN_AKT = ["Startknoten", "Aktion", "Entscheidung", "Zusammenführung",
                     "Parallelisierung", "Synchronisation", "Endknoten"];

  G.vorlage({
    id: "dia-aktivitaet", thema: "diagramm", sub: "UML-Aktivitätsdiagramm",
    titel: "Aktivitätsdiagramm modellieren", stufe: 2,
    merksatz: "Genau ein Startknoten · aus einer Aktion führt genau eine Kante · eine Entscheidung hat mindestens zwei Ausgänge mit Bedingungen in [eckigen Klammern] · was ein Fork aufteilt, führt ein Join wieder zusammen.",
    bau(R, c) {
      const sz = R.waehle(AKT_SZENARIEN);
      const variante = R.waehle(["verzweigung", "schleife", "parallel"]);
      const schritte = sz.schritte.slice(0, R.ganz(3, sz.schritte.length));
      const soll = [];
      const nach = [];

      soll.push({ name: "Start", typ: "Startknoten", nach: [schritte[0]], bed: [] });

      if (variante === "parallel") {
        /* Start → Aktionen … → Fork → 2 parallele Aktionen → Join → Entscheidung */
        schritte.forEach((s, i) => {
          soll.push({ name: s, typ: "Aktion", nach: [i + 1 < schritte.length ? schritte[i + 1] : "Aufspaltung"], bed: [] });
        });
        soll.push({ name: "Aufspaltung", typ: "Parallelisierung", nach: sz.parallel.slice(), bed: [] });
        sz.parallel.forEach(p => soll.push({ name: p, typ: "Aktion", nach: ["Synchronisation"], bed: [] }));
        soll.push({ name: "Synchronisation", typ: "Synchronisation", nach: [sz.pruefung], bed: [] });
        soll.push({ name: sz.pruefung, typ: "Entscheidung", nach: [sz.ja, sz.nein], bed: ["[ja]", "[nein]"] });
        soll.push({ name: sz.ja, typ: "Aktion", nach: ["Ende"], bed: [] });
        soll.push({ name: sz.nein, typ: "Aktion", nach: ["Ende"], bed: [] });
        soll.push({ name: "Ende", typ: "Endknoten", nach: [], bed: [] });

      } else if (variante === "schleife") {
        /* Nein-Zweig springt auf einen früheren Schritt zurück */
        const rueck = schritte[Math.max(0, schritte.length - 2)];
        schritte.forEach((s, i) => {
          soll.push({ name: s, typ: "Aktion", nach: [i + 1 < schritte.length ? schritte[i + 1] : sz.pruefung], bed: [] });
        });
        soll.push({ name: sz.pruefung, typ: "Entscheidung", nach: [sz.ja, rueck], bed: ["[ja]", "[nein]"] });
        soll.push({ name: sz.ja, typ: "Aktion", nach: ["Ende"], bed: [] });
        soll.push({ name: "Ende", typ: "Endknoten", nach: [], bed: [] });

      } else {
        /* Verzweigung mit Zusammenführung */
        schritte.forEach((s, i) => {
          soll.push({ name: s, typ: "Aktion", nach: [i + 1 < schritte.length ? schritte[i + 1] : sz.pruefung], bed: [] });
        });
        soll.push({ name: sz.pruefung, typ: "Entscheidung", nach: [sz.ja, sz.nein], bed: ["[ja]", "[nein]"] });
        soll.push({ name: sz.ja, typ: "Aktion", nach: ["Zusammenführung"], bed: [] });
        soll.push({ name: sz.nein, typ: "Aktion", nach: ["Zusammenführung"], bed: [] });
        soll.push({ name: "Zusammenführung", typ: "Zusammenführung", nach: ["Ende"], bed: [] });
        soll.push({ name: "Ende", typ: "Endknoten", nach: [], bed: [] });
      }

      const auftrag =
        variante === "parallel"
          ? `Die Schritte „${sz.parallel[0]}“ und „${sz.parallel[1]}“ laufen parallel und müssen beide ` +
            `abgeschlossen sein, bevor es weitergeht.`
          : variante === "schleife"
            ? `Ist die Prüfung nicht erfolgreich, wird zu „${schritte[Math.max(0, schritte.length - 2)]}“ ` +
              `zurückgesprungen und erneut geprüft.`
            : `Beide Zweige der Entscheidung werden anschließend wieder zusammengeführt.`;

      return {
        situation:
`In der ${c.firma} ist der folgende Ablauf zu modellieren: ${sz.titel}.

Ablauf: ${schritte.map((s, i) => (i + 1) + ". " + s).join(" · ")}
Danach wird geprüft: „${sz.pruefung}“
  [ja]   → ${sz.ja}
  [nein] → ${variante === "schleife" ? "zurück zu „" + schritte[Math.max(0, schritte.length - 2)] + "\"" : sz.nein}
${auftrag}`,
        prompt:
          "Stellen Sie den Ablauf als UML-Aktivitätsdiagramm dar. Tragen Sie jeden Knoten in eine Zeile ein: " +
          "Bezeichnung, Knotentyp, die Knoten, auf die Kanten zeigen (mehrere durch Komma getrennt), " +
          "und bei Entscheidungen die Bedingungen in eckigen Klammern.",
        felder: [
          { typ: "knoten", label: "Knoten des Aktivitätsdiagramms", be: soll.length,
            spalten: ["Knoten", "Typ", "Kante zeigt auf", "Bedingung"],
            typen: TYPEN_AKT, soll, zeilen: soll.length + 2 },
          { typ: "text", label: "Wie viele Endknoten darf ein Aktivitätsdiagramm haben und warum genau ein Startknoten?",
            be: 2, zeilen: 3, satzbau: true, minWorte: 8, noetig: 2,
            erwartet: [
              ["mehrere Endknoten sind erlaubt", "beliebig viele Endknoten", "mehr als ein Ende möglich"],
              ["nur ein Startpunkt", "der Ablauf beginnt eindeutig an einer Stelle", "eindeutiger Beginn",
                "sonst wäre der Beginn nicht eindeutig"]
            ] }
        ],
        loesung:
          soll.map(k => `${k.name}  [${k.typ}]` +
            (k.nach.length ? "  →  " + k.nach.map((n, i) => (k.bed[i] ? k.bed[i] + " " : "") + n).join(" , ") : "  → (Ende)")
          ).join("\n") +
`\n\nNotationsregeln, die hier Punkte kosten:
• genau ein Startknoten (ausgefüllter Kreis), Endknoten (Kreis mit Ring) darf es mehrere geben
• aus einer Aktion führt genau eine Kante — Verzweigen nur über Entscheidung (Raute) oder Fork (Balken)
• jede Kante aus einer Entscheidung trägt eine Bedingung in eckigen Klammern, die Bedingungen
  müssen sich gegenseitig ausschließen und alle Fälle abdecken
• was eine Parallelisierung (Fork) aufteilt, führt eine Synchronisation (Join) wieder zusammen
• der Ablauf endet nie im Nichts: jeder Pfad läuft in einen Endknoten`
      };
    }
  });

  /* ====================================================== 2. ER-Modell == */
  G.vorlage({
    id: "dia-er", thema: "diagramm", sub: "ER-Modell & Kardinalitäten",
    titel: "Entity-Relationship-Modell", stufe: 2,
    merksatz: "n:m-Beziehungen werden immer über eine Zwischentabelle aufgelöst; deren Primärschlüssel ist meist die Kombination der beiden Fremdschlüssel.",
    bau(R, c) {
      const faelle = [
        { a: "Mitarbeiter", b: "Abteilung", bez: "arbeitet in",
          txt: "Jeder Mitarbeiter gehört zu genau einer Abteilung, eine Abteilung hat mehrere Mitarbeiter.",
          kard: "1:n", fk: "Abteilung", fkIn: "Mitarbeiter" },
        { a: "Projekt", b: "Mitarbeiter", bez: "arbeitet mit an",
          txt: "Ein Projekt beschäftigt mehrere Mitarbeiter, ein Mitarbeiter arbeitet in mehreren Projekten.",
          kard: "n:m", fk: null, fkIn: null },
        { a: "Notebook", b: "Mitarbeiter", bez: "ist zugewiesen an",
          txt: "Jedes Notebook ist genau einem Mitarbeiter zugewiesen, jeder Mitarbeiter hat höchstens ein Notebook.",
          kard: "1:1", fk: "Mitarbeiter", fkIn: "Notebook" },
        { a: "Ticket", b: "Kunde", bez: "gehört zu",
          txt: "Ein Kunde kann viele Tickets melden, jedes Ticket gehört zu genau einem Kunden.",
          kard: "1:n", fk: "Kunde", fkIn: "Ticket" },
        { a: "Bestellung", b: "Artikel", bez: "enthält",
          txt: "Eine Bestellung enthält mehrere Artikel, ein Artikel kommt in mehreren Bestellungen vor.",
          kard: "n:m", fk: null, fkIn: null },
        { a: "Rechnung", b: "Bestellung", bez: "gehört zu",
          txt: "Zu jeder Bestellung gehört genau eine Rechnung und umgekehrt.",
          kard: "1:1", fk: "Bestellung", fkIn: "Rechnung" }
      ];
      const fall = R.waehle(faelle);
      const nm = fall.kard === "n:m";

      const felder = [
        { typ: "auswahl", label: `Welche Kardinalität hat die Beziehung ${fall.a} — „${fall.bez}“ — ${fall.b}?`,
          be: 2, optionen: ["1:1", "1:n", "n:m"], loesung: fall.kard },
        { typ: "text", label: `Nennen Sie einen sinnvollen Primärschlüssel für die Tabelle ${fall.a}`,
          be: 1, zeilen: 1,
          erwartet: [[fall.a + "ID", fall.a + "nummer", fall.a + "_id", "ID", "Nummer", "eindeutige Nummer"]] }
      ];

      if (nm) {
        felder.push({
          typ: "text", label: "Wie wird diese Beziehung in einer relationalen Datenbank umgesetzt? Begründen Sie.",
          be: 3, zeilen: 4, satzbau: true, minWorte: 10, noetig: 2,
          erwartet: [
            ["Zwischentabelle", "Verbindungstabelle", "Beziehungstabelle", "Auflösung über eine dritte Tabelle", "Zuordnungstabelle"],
            ["enthält beide Fremdschlüssel", "die Primärschlüssel beider Tabellen", "zusammengesetzter Primärschlüssel",
              "Fremdschlüssel aus beiden Tabellen"]
          ]
        });
        felder.push({
          typ: "text", label: "Welches Attribut könnte zusätzlich in dieser Zwischentabelle stehen?",
          be: 1, zeilen: 1, satzbau: false,
          erwattetLeer: true,
          erwartet: [["Menge", "Anzahl", "Stunden", "Rolle", "Datum", "Beginn", "Ende", "Stückzahl", "Einzelpreis", "Position", "Aufwand"]]
        });
      } else {
        felder.push({
          typ: "auswahl", label: "In welcher Tabelle steht der Fremdschlüssel?",
          be: 2, optionen: [fall.a, fall.b], loesung: fall.fkIn
        });
        felder.push({
          typ: "text", label: "Begründen Sie, warum der Fremdschlüssel dort steht",
          be: 2, zeilen: 3, satzbau: true, minWorte: 8,
          erwartet: [["auf der n-Seite", "dort steht genau ein Wert", "Seite mit der Kardinalität 1 wird referenziert",
            "sonst müsste man mehrere Werte in ein Feld schreiben", "eindeutig", "keine Wiederholgruppe"]]
        });
      }

      felder.push({
        typ: "text", label: "Was beschreibt die referentielle Integrität?", be: 1.5, zeilen: 3,
        satzbau: true, minWorte: 8,
        erwartet: [["Fremdschlüssel muss auf einen vorhandenen Datensatz zeigen", "kein Verweis ins Leere",
          "Datensatz darf nicht gelöscht werden solange er referenziert wird", "gültiger Primärschlüssel"]]
      });

      return {
        situation: `Für eine Datenbank der ${c.firma} sind die Entitäten ${fall.a} und ${fall.b} zu modellieren. ` +
          fall.txt,
        prompt: "Beurteilen Sie die Beziehung und ihre Umsetzung in einer relationalen Datenbank.",
        felder,
        loesung:
`Beziehung: ${fall.a} —(${fall.bez})— ${fall.b}, Kardinalität ${fall.kard}.
Primärschlüssel: eine künstliche, eindeutige Nummer, z. B. ${fall.a}ID bzw. ${fall.b}ID.
` + (nm
  ? `Eine n:m-Beziehung lässt sich relational nicht direkt abbilden. Sie wird über eine Zwischentabelle
(z. B. ${fall.a}_${fall.b}) aufgelöst. Diese enthält die Primärschlüssel beider Tabellen als
Fremdschlüssel; beide zusammen bilden den zusammengesetzten Primärschlüssel. Zusätzliche Attribute
der Beziehung selbst — Menge, Stunden, Rolle, Zeitraum — gehören ebenfalls in diese Tabelle.`
  : `Der Fremdschlüssel steht in der Tabelle ${fall.fkIn} und verweist auf den Primärschlüssel von
${fall.fk}. Er gehört auf die Seite, die genau einen Partner hat: Dort lässt sich genau ein Wert
speichern. Auf der anderen Seite müsste man mehrere Werte in ein Feld schreiben — eine
Wiederholgruppe, die gegen die 1. Normalform verstößt.`) +
`\n\nReferentielle Integrität heißt: Jeder Fremdschlüsselwert muss auf einen tatsächlich vorhandenen
Datensatz der referenzierten Tabelle zeigen. Ein Datensatz darf nicht gelöscht werden, solange
noch Verweise auf ihn bestehen — sonst entstehen Verweise ins Leere.`
      };
    }
  });

  /* ====================================================== 3. Use-Case === */
  G.vorlage({
    id: "dia-usecase", thema: "diagramm", sub: "UML Use-Case-Diagramm",
    titel: "Anwendungsfalldiagramm lesen", stufe: 1,
    merksatz: "«include» = wird immer mit ausgeführt. «extend» = wird nur unter einer Bedingung zusätzlich ausgeführt. Der Akteur steht außerhalb des Systems.",
    bau(R, c) {
      const systeme = [
        { name: "Ticketsystem", akteure: ["Melder", "First Level Support", "Second Level Support", "Zeitgeber (nachts)"],
          faelle: ["Ticket erfassen", "Ticket bearbeiten", "Ticket eskalieren", "Statusbericht erzeugen"],
          inc: ["Ticket erfassen", "Melder authentifizieren"], ext: ["Ticket bearbeiten", "Ticket eskalieren"] },
        { name: "Bestellportal", akteure: ["Kunde", "Sachbearbeiter", "Zahlungsdienstleister", "Lagerverwaltung"],
          faelle: ["Bestellung aufgeben", "Zahlung abwickeln", "Gutschein einlösen", "Lieferung anstoßen"],
          inc: ["Bestellung aufgeben", "Zahlung abwickeln"], ext: ["Bestellung aufgeben", "Gutschein einlösen"] },
        { name: "Zeiterfassung", akteure: ["Mitarbeiter", "Vorgesetzter", "Lohnbuchhaltung", "Kalendersystem"],
          faelle: ["Zeit buchen", "Urlaub beantragen", "Antrag genehmigen", "Monatsauswertung erstellen"],
          inc: ["Zeit buchen", "Benutzer anmelden"], ext: ["Zeit buchen", "Fehlbuchung korrigieren"] }
      ];
      const s = R.waehle(systeme);
      const paare = R.mische([
        [`„${s.inc[0]}“ führt „${s.inc[1]}“ immer mit aus.`, "«include»"],
        [`„${s.ext[1]}“ wird nur unter einer Bedingung zusätzlich zu „${s.ext[0]}“ ausgeführt.`, "«extend»"],
        ["Ein Mensch oder ein anderes System, das mit dem System interagiert.", "Akteur"],
        ["Die Grenze zwischen System und Umwelt.", "Systemgrenze"]
      ]);

      return {
        situation: `Für das ${s.name} der ${c.firma} wurde ein Use-Case-Diagramm erstellt. ` +
          `Beteiligt sind unter anderem: ${s.akteure.join(", ")}. ` +
          `Zu den Anwendungsfällen zählen: ${s.faelle.join(", ")}.`,
        prompt: "Beantworten Sie die Fragen zum Use-Case-Diagramm.",
        felder: [
          { typ: "zuordnung", label: "Beschreibung → Begriff", be: 4,
            optionen: ["«include»", "«extend»", "Akteur", "Systemgrenze"], paare },
          { typ: "liste", label: "Nennen Sie zwei Akteure dieses Systems", be: 2, zeilen: 3, noetig: 2,
            satzbau: false, erwartet: s.akteure.map(a => [a]) },
          { typ: "text", label: "Kann ein Akteur auch ein anderes System sein? Begründen Sie.",
            be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["ja", "auch technische Systeme", "Fremdsystem", "Schnittstelle", "Zeitgeber", "Nachbarsystem"]] },
          { typ: "text", label: "Was zeigt ein Use-Case-Diagramm NICHT?", be: 1.5, zeilen: 2,
            satzbau: true, minWorte: 6,
            erwartet: [["keine Reihenfolge", "keinen Ablauf", "keine zeitliche Abfolge", "nicht wie es umgesetzt wird",
              "keine technische Umsetzung", "keine Details"]] }
        ],
        loesung:
          paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nAkteure des ${s.name}s: ${s.akteure.join(", ")}. Ein Akteur muss kein Mensch sein — auch ein
Nachbarsystem, eine Schnittstelle oder ein Zeitgeber („jede Nacht um 2 Uhr“) ist ein Akteur,
sobald er außerhalb der Systemgrenze steht und mit dem System interagiert.

Ein Use-Case-Diagramm zeigt, WER das System WOFÜR benutzt. Es zeigt weder die zeitliche Reihenfolge
der Schritte (das leistet das Aktivitätsdiagramm) noch die technische Umsetzung.`
      };
    }
  });

  /* ====================================================== 4. Netzplan === */
  function netzWuerfeln(R, n) {
    const namen = "ABCDEFGHIJ".split("");
    const v = [];
    const schichten = [];
    let i = 0;
    while (i < n) {
      const breite = Math.min(n - i, R.ganz(1, 3));
      schichten.push(namen.slice(i, i + breite));
      i += breite;
    }
    schichten.forEach((s, si) => s.forEach(name => {
      const vor = si === 0 ? [] : R.waehleN(schichten[si - 1], R.ganz(1, schichten[si - 1].length));
      v.push({ name, dauer: R.ganz(2, 12), vor });
    }));
    const byName = {};
    v.forEach(x => byName[x.name] = x);
    /* Vorwärts */
    v.forEach(x => {
      x.faz = x.vor.length ? Math.max(...x.vor.map(p => byName[p].fez)) : 0;
      x.fez = x.faz + x.dauer;
    });
    const ende = Math.max(...v.map(x => x.fez));
    /* Rückwärts */
    for (let k = v.length - 1; k >= 0; k--) {
      const x = v[k];
      const nach = v.filter(y => y.vor.includes(x.name));
      x.sez = nach.length ? Math.min(...nach.map(y => y.saz)) : ende;
      x.saz = x.sez - x.dauer;
      x.gp = x.saz - x.faz;
      x.fp = (nach.length ? Math.min(...nach.map(y => y.faz)) : ende) - x.fez;
    }
    const kritisch = v.filter(x => x.gp === 0).map(x => x.name);
    return { v, byName, ende, kritisch };
  }

  G.vorlage({
    id: "dia-netzplan", thema: "diagramm", sub: "Netzplantechnik",
    titel: "Netzplan berechnen", stufe: 3,
    merksatz: "Vorwärts: FAZ = größter FEZ der Vorgänger, FEZ = FAZ + D. Rückwärts: SEZ = kleinster SAZ der Nachfolger, SAZ = SEZ − D. GP = SAZ − FAZ. Kritisch ist alles mit GP = 0.",
    bau(R, c) {
      const n = R.ganz(6, 8);
      const np = netzWuerfeln(R, n);
      const gefragt = R.waehleN(np.v.filter(x => x.vor.length), 2).map(x => x.name).sort();
      const zeilen = gefragt.map(name => {
        const x = np.byName[name];
        return {
          zellen: [
            { t: x.name },
            { eingabe: true, loesung: x.faz, dez: 0, be: 0.5 },
            { eingabe: true, loesung: x.fez, dez: 0, be: 0.5 },
            { eingabe: true, loesung: x.saz, dez: 0, be: 0.5 },
            { eingabe: true, loesung: x.sez, dez: 0, be: 0.5 },
            { eingabe: true, loesung: x.gp, dez: 0, be: 1 }
          ]
        };
      });

      return {
        situation: `Für ein Projekt der ${c.firma} liegt folgende Vorgangsliste vor. Die Dauern sind in Tagen ` +
          `angegeben, der Projektstart liegt bei Zeitpunkt 0.`,
        prompt: `Berechnen Sie die Zeitwerte für die Vorgänge ${gefragt.join(" und ")} sowie die Projektdauer und den kritischen Pfad.`,
        tabellen: [{
          titel: "Vorgangsliste",
          kopf: ["Vorgang", "Dauer (Tage)", "Vorgänger"],
          zeilen: np.v.map(x => [x.name, String(x.dauer), x.vor.length ? x.vor.join(", ") : "—"])
        }],
        felder: [
          { typ: "raster", label: "Zeitwerte", kopf: ["Vorgang", "FAZ", "FEZ", "SAZ", "SEZ", "GP"], zeilen },
          { typ: "zahl", label: "Gesamte Projektdauer", einheit: "Tage", be: 1.5, dez: 0, loesung: np.ende, tolAbs: 0 },
          { typ: "text", label: "Kritischer Pfad (Vorgänge in Reihenfolge, z. B. A B D)", be: 2, zeilen: 1,
            erwartet: [[np.kritisch.join(" "), np.kritisch.join(", "), np.kritisch.join("-")]] },
          { typ: "text", label: "Was bedeutet ein Gesamtpuffer von 0?", be: 1.5, zeilen: 3,
            satzbau: true, minWorte: 8,
            erwartet: [["Vorgang kann nicht verschoben werden", "jede Verzögerung verschiebt das Projektende",
              "liegt auf dem kritischen Pfad", "keine zeitliche Reserve"]] }
        ],
        loesung:
`Vorwärtsrechnung (FAZ = größter FEZ der Vorgänger, FEZ = FAZ + Dauer):
` + np.v.map(x => `  ${x.name}: FAZ ${x.faz}, FEZ ${x.fez}`).join("\n") +
`\nProjektdauer = größter FEZ = ${np.ende} Tage.

Rückwärtsrechnung (SEZ = kleinster SAZ der Nachfolger, SAZ = SEZ − Dauer):
` + np.v.map(x => `  ${x.name}: SAZ ${x.saz}, SEZ ${x.sez}, GP ${x.gp}, FP ${x.fp}`).join("\n") +
`\nKritischer Pfad (GP = 0): ${np.kritisch.join(" – ")}

Ein Gesamtpuffer von 0 heißt: Der Vorgang hat keine zeitliche Reserve. Verschiebt er sich um einen
Tag, verschiebt sich das gesamte Projektende um einen Tag.`
      };
    }
  });

  /* ====================================================== 5. Gantt ====== */
  G.vorlage({
    id: "dia-gantt", thema: "diagramm", sub: "Gantt-Diagramm",
    titel: "Balkenplan aufstellen", stufe: 2,
    bau(R, c) {
      const np = netzWuerfeln(R, R.ganz(5, 7));
      const zeilen = np.v.map(x => ({
        zellen: [
          { t: x.name + " (" + x.dauer + " Tage)" },
          { eingabe: true, loesung: x.faz + 1, dez: 0, be: 0.5 },
          { eingabe: true, loesung: x.fez, dez: 0, be: 0.5 }
        ]
      }));
      return {
        situation: `Ein Projekt der ${c.firma} soll als Balkenplan (Gantt-Diagramm) dargestellt werden. ` +
          `Alle Vorgänge starten so früh wie möglich, der erste Projekttag ist Tag 1.`,
        prompt: "Bestimmen Sie für jeden Vorgang den frühesten Starttag und den frühesten Endtag.",
        tabellen: [{
          titel: "Vorgangsliste",
          kopf: ["Vorgang", "Dauer (Tage)", "Vorgänger"],
          zeilen: np.v.map(x => [x.name, String(x.dauer), x.vor.length ? x.vor.join(", ") : "—"])
        }],
        felder: [
          { typ: "raster", label: "Balkenlage", kopf: ["Vorgang", "Start (Tag)", "Ende (Tag)"], zeilen },
          { typ: "zahl", label: "Projektdauer insgesamt", einheit: "Tage", be: 1, dez: 0, loesung: np.ende, tolAbs: 0 },
          { typ: "text", label: "Nennen Sie einen Vorteil des Gantt-Diagramms gegenüber dem Netzplan",
            be: 1.5, zeilen: 2, satzbau: true, minWorte: 6,
            erwartet: [["auf einen Blick verständlich", "zeigt die Zeitachse", "anschaulich", "leicht lesbar",
              "Auslastung erkennbar", "gut für die Kommunikation", "Überschneidungen sichtbar"]] },
          { typ: "text", label: "Und einen Nachteil?", be: 1.5, zeilen: 2, satzbau: true, minWorte: 6,
            erwartet: [["Abhängigkeiten nicht erkennbar", "Puffer nicht sichtbar", "kritischer Pfad nicht erkennbar",
              "bei vielen Vorgängen unübersichtlich", "keine Pufferzeiten"]] }
        ],
        loesung:
          np.v.map(x => `${x.name}: Start Tag ${x.faz + 1}, Ende Tag ${x.fez} (Dauer ${x.dauer})`).join("\n") +
`\nProjektdauer: ${np.ende} Tage.

Der Balkenplan zeigt Lage und Dauer aller Vorgänge auf einer Zeitachse und ist dadurch sofort
verständlich — gut für Abstimmung und Berichte. Er zeigt aber nicht, welcher Vorgang von welchem
abhängt, wo Puffer liegen und welcher Pfad kritisch ist; dafür braucht es den Netzplan.`
      };
    }
  });

  /* ================================================== 6. Pseudocode ===== */
  G.vorlage({
    id: "dia-schreibtischtest", thema: "programmierung", sub: "Schreibtischtest & Pseudocode",
    titel: "Schreibtischtest durchführen", stufe: 2,
    merksatz: "Zeile für Zeile abarbeiten, nach jedem Durchlauf alle Variablen notieren. Erst am Schluss die Ausgabe ablesen.",
    bau(R, c) {
      const n = R.ganz(4, 7);
      const start = R.ganz(1, 5);
      const art = R.waehle(["summe", "produkt", "bedingt"]);
      const faktor = R.ganz(2, 4);
      const schwelle = R.ganz(2, 4);

      const spur = [];
      let wert = art === "produkt" ? 1 : 0;
      for (let i = 1; i <= n; i++) {
        const x = start + i - 1;
        if (art === "summe") wert = wert + x;
        else if (art === "produkt") wert = wert * (x % 5 === 0 ? 1 : 2);
        else wert = wert + (x % schwelle === 0 ? x * faktor : x);
        spur.push({ i, x, wert });
      }

      const code = art === "summe"
        ? `ergebnis = 0
zahl = ${start}
FÜR i VON 1 BIS ${n}
    ergebnis = ergebnis + zahl
    zahl = zahl + 1
ENDE FÜR
AUSGABE ergebnis`
        : art === "produkt"
          ? `ergebnis = 1
zahl = ${start}
FÜR i VON 1 BIS ${n}
    WENN zahl MOD 5 = 0 DANN
        ergebnis = ergebnis * 1
    SONST
        ergebnis = ergebnis * 2
    ENDE WENN
    zahl = zahl + 1
ENDE FÜR
AUSGABE ergebnis`
          : `ergebnis = 0
zahl = ${start}
FÜR i VON 1 BIS ${n}
    WENN zahl MOD ${schwelle} = 0 DANN
        ergebnis = ergebnis + zahl * ${faktor}
    SONST
        ergebnis = ergebnis + zahl
    ENDE WENN
    zahl = zahl + 1
ENDE FÜR
AUSGABE ergebnis`;

      const zeigen = Math.min(spur.length, R.ganz(3, 5));
      const zeilen = spur.slice(0, zeigen).map(s => ({
        zellen: [
          { t: String(s.i) },
          { eingabe: true, loesung: s.x, dez: 0, be: 0.5 },
          { eingabe: true, loesung: s.wert, dez: 0, be: 0.5 }
        ]
      }));

      return {
        situation: `Die ${c.firma} lässt den folgenden Algorithmus im Pseudocode prüfen.`,
        code,
        prompt: "Führen Sie einen Schreibtischtest durch und geben Sie das Ergebnis an.",
        felder: [
          { typ: "raster", label: "Schreibtischtest — Werte nach jedem Durchlauf",
            kopf: ["Durchlauf i", "zahl zu Beginn des Durchlaufs", "ergebnis am Ende des Durchlaufs"], zeilen },
          { typ: "zahl", label: "Ausgabe des Algorithmus", be: 2, dez: 0, loesung: spur[spur.length - 1].wert, tolAbs: 0 },
          { typ: "zahl", label: "Wie oft wird die Schleife durchlaufen?", einheit: "mal", be: 1, dez: 0, loesung: n, tolAbs: 0 },
          { typ: "text", label: "Was passiert, wenn die Zählschleife durch eine kopfgesteuerte Schleife ohne Erhöhung von i ersetzt wird?",
            be: 1.5, zeilen: 2, satzbau: true, minWorte: 6,
            erwartet: [["Endlosschleife", "die Schleife endet nie", "Abbruchbedingung wird nie erreicht", "läuft unendlich"]] }
        ],
        loesung:
`Schreibtischtest:
Durchlauf | zahl | ergebnis
` + spur.map(s => `    ${String(s.i).padStart(2)}    |  ${String(s.x).padStart(3)} | ${s.wert}`).join("\n") +
`\n\nAusgabe: ${spur[spur.length - 1].wert}
Die Schleife läuft ${n}-mal (FÜR i VON 1 BIS ${n}).

Ohne Erhöhung der Laufvariablen wird die Abbruchbedingung nie wahr — das Ergebnis ist eine
Endlosschleife. Jede kopfgesteuerte Schleife braucht im Rumpf eine Anweisung, die die
Bedingung irgendwann falsch werden lässt.`
      };
    }
  });

  /* ================================================= 7. Klassendiagramm = */
  G.vorlage({
    id: "dia-klasse", thema: "diagramm", sub: "UML-Klassendiagramm",
    titel: "Klassendiagramm beurteilen", stufe: 2,
    merksatz: "Klasse = drei Fächer: Name, Attribute, Methoden. + öffentlich, − privat, # geschützt. Methoden immer mit Klammern.",
    bau(R, c) {
      const modelle = [
        { klasse: "Gerät", attr: ["inventarnummer", "hersteller", "anschaffungsdatum"],
          meth: ["ausleihen()", "zurückgeben()"], kind: "Notebook", kindAttr: "akkulaufzeit" },
        { klasse: "Ticket", attr: ["ticketnummer", "titel", "priorität"],
          meth: ["eskalieren()", "schließen()"], kind: "Störungsticket", kindAttr: "betroffenesSystem" },
        { klasse: "Person", attr: ["personalnummer", "name", "abteilung"],
          meth: ["anmelden()", "abmelden()"], kind: "Mitarbeiter", kindAttr: "eintrittsdatum" }
      ];
      const m = R.waehle(modelle);
      const paare = R.mische([
        ["Der Name eines Merkmals mit Datentyp, z. B. − " + m.attr[0] + ": String", "Attribut"],
        ["Eine Fähigkeit der Klasse, immer mit Klammern geschrieben", "Methode"],
        ["Das Zeichen − vor einem Merkmal", "privat (nur innerhalb der Klasse sichtbar)"],
        ["Die leere Dreieckspitze am Ende einer Linie", "Vererbung (ist-ein)"],
        ["Die Angabe 1 … 0..* an den Enden einer Verbindung", "Multiplizität"]
      ]);

      return {
        situation: `Für eine Anwendung der ${c.firma} liegt eine Klasse „${m.klasse}“ vor mit den Attributen ` +
          `${m.attr.join(", ")} und den Methoden ${m.meth.join(", ")}. ` +
          `Zusätzlich soll die Klasse „${m.kind}“ ergänzt werden, die alles von „${m.klasse}“ übernimmt ` +
          `und das Attribut ${m.kindAttr} hinzufügt.`,
        prompt: "Beantworten Sie die Fragen zum Klassendiagramm.",
        felder: [
          { typ: "zuordnung", label: "Beschreibung → Begriff", be: 5,
            optionen: ["Attribut", "Methode", "privat (nur innerhalb der Klasse sichtbar)",
              "Vererbung (ist-ein)", "Multiplizität"], paare },
          { typ: "auswahl", label: `Welche Beziehung besteht zwischen „${m.klasse}“ und „${m.kind}“?`, be: 1.5,
            optionen: ["Vererbung (Generalisierung)", "Assoziation", "Aggregation", "Komposition"],
            loesung: "Vererbung (Generalisierung)" },
          { typ: "text", label: `Welche Attribute besitzt „${m.kind}“ insgesamt? Begründen Sie.`,
            be: 2.5, zeilen: 3, satzbau: true, minWorte: 8, noetig: 2,
            erwartet: [
              [m.kindAttr, "das eigene Attribut"],
              ["alle Attribute der Oberklasse", "erbt die Attribute", "zusätzlich die geerbten", m.attr[0]]
            ] },
          { typ: "text", label: "Nennen Sie einen Vorteil der Vererbung", be: 1.5, zeilen: 2,
            satzbau: true, minWorte: 6,
            erwartet: [["kein doppelter Code", "Wiederverwendung", "Änderung nur an einer Stelle",
              "weniger Redundanz", "einheitliche Struktur", "leichter wartbar"]] }
        ],
        loesung:
          paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\n„${m.kind}“ steht über eine Vererbung (Generalisierung) mit „${m.klasse}“ in Beziehung — im
Diagramm eine Linie mit leerer Dreieckspitze, die auf die Oberklasse zeigt.

„${m.kind}“ besitzt damit ${m.attr.length + 1} Attribute: das eigene Attribut ${m.kindAttr}
sowie die geerbten Attribute ${m.attr.join(", ")}. Die Methoden ${m.meth.join(", ")} erbt sie ebenfalls.

Vorteil: Gemeinsames wird nur einmal beschrieben. Das vermeidet doppelten Code, hält die Struktur
einheitlich und macht Änderungen an einer einzigen Stelle wirksam.`
      };
    }
  });

})(window.GEN);
