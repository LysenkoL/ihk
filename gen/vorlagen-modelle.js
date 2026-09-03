/* ============================================================================
   gen/vorlagen-modelle.js — Modelle bauen statt nur beschreiben:
   ER-Modell mit relationalem Schema, Use-Case-Diagramm, Klassendiagramm.
   Genau die drei Formen, die in den echten AP1-Prüfungen zum Zeichnen kommen.
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* ============================== ER-Modell ============================= */

  const ER_SZENARIEN = [
    {
      kontext: "Kfz-Werkstatt", was: "die Verwaltung von Kunden, Fahrzeugen und Reparaturaufträgen",
      entitaeten: [
        { name: "Kunde", attr: ["KundenID", "Name", "Anschrift", "Telefon"], pk: "KundenID" },
        { name: "Fahrzeug", attr: ["FahrzeugID", "Kennzeichen", "Modell", "Baujahr"], pk: "FahrzeugID" },
        { name: "Auftrag", attr: ["AuftragID", "Datum", "Beschreibung"], pk: "AuftragID" }
      ],
      beziehungen: [
        { von: "Kunde", nach: "Fahrzeug", kard: "1:n", verb: ["besitzt", "hat", "gehört"],
          text: "Ein Kunde kann mehrere Fahrzeuge besitzen, jedes Fahrzeug gehört genau einem Kunden." },
        { von: "Fahrzeug", nach: "Auftrag", kard: "1:n", verb: ["hat", "wird bearbeitet in", "gehört zu"],
          text: "Zu einem Fahrzeug kann es mehrere Aufträge geben, ein Auftrag betrifft genau ein Fahrzeug." }
      ]
    },
    {
      kontext: "IT-Support", was: "die Verwaltung von Tickets",
      entitaeten: [
        { name: "Kunde", attr: ["KundenID", "Firma", "Ansprechpartner"], pk: "KundenID" },
        { name: "Ticket", attr: ["TicketID", "Betreff", "Priorität", "Eingangsdatum"], pk: "TicketID" },
        { name: "Mitarbeiter", attr: ["PersonalNr", "Name", "Abteilung"], pk: "PersonalNr" }
      ],
      beziehungen: [
        { von: "Kunde", nach: "Ticket", kard: "1:n", verb: ["meldet", "hat", "eröffnet"],
          text: "Ein Kunde kann viele Tickets melden, jedes Ticket gehört zu genau einem Kunden." },
        { von: "Mitarbeiter", nach: "Ticket", kard: "1:n", verb: ["bearbeitet", "betreut", "löst"],
          text: "Ein Mitarbeiter bearbeitet mehrere Tickets, ein Ticket wird von genau einem Mitarbeiter bearbeitet." }
      ]
    },
    {
      kontext: "Weiterbildung", was: "die Verwaltung von Schulungen",
      entitaeten: [
        { name: "Mitarbeiter", attr: ["PersonalNr", "Name", "Abteilung"], pk: "PersonalNr" },
        { name: "Schulung", attr: ["SchulungsID", "Titel", "Dauer"], pk: "SchulungsID" }
      ],
      beziehungen: [
        { von: "Mitarbeiter", nach: "Schulung", kard: "n:m", verb: ["besucht", "nimmt teil an", "belegt"],
          text: "Ein Mitarbeiter besucht mehrere Schulungen, an einer Schulung nehmen mehrere Mitarbeitende teil.",
          zwischen: { name: ["Teilnahme", "Mitarbeiter_Schulung", "Besucht", "Schulungsteilnahme"], extra: ["Teilnahmedatum", "Note", "Status"] } }
      ]
    },
    {
      kontext: "Lager", was: "die Verwaltung von Artikeln und Bestellungen",
      entitaeten: [
        { name: "Artikel", attr: ["ArtikelNr", "Bezeichnung", "Einzelpreis"], pk: "ArtikelNr" },
        { name: "Bestellung", attr: ["BestellNr", "Bestelldatum", "Lieferdatum"], pk: "BestellNr" }
      ],
      beziehungen: [
        { von: "Bestellung", nach: "Artikel", kard: "n:m", verb: ["enthält", "umfasst", "besteht aus"],
          text: "Eine Bestellung enthält mehrere Artikel, ein Artikel kommt in mehreren Bestellungen vor.",
          zwischen: { name: ["Bestellposition", "Bestellung_Artikel", "Position"], extra: ["Menge", "Einzelpreis", "Positionsnummer"] } }
      ]
    },
    {
      kontext: "Geräteverwaltung", was: "die Zuordnung von Hardware zu Beschäftigten",
      entitaeten: [
        { name: "Mitarbeiter", attr: ["PersonalNr", "Name", "Standort"], pk: "PersonalNr" },
        { name: "Gerät", attr: ["InventarNr", "Typ", "Seriennummer", "Anschaffungsdatum"], pk: "InventarNr" },
        { name: "Standort", attr: ["StandortID", "Bezeichnung", "Raum"], pk: "StandortID" }
      ],
      beziehungen: [
        { von: "Mitarbeiter", nach: "Gerät", kard: "1:n", verb: ["nutzt", "hat", "ist zugewiesen"],
          text: "Einer Person können mehrere Geräte zugewiesen sein, jedes Gerät ist genau einer Person zugewiesen." },
        { von: "Standort", nach: "Gerät", kard: "1:n", verb: ["beherbergt", "hat", "steht an"],
          text: "An einem Standort stehen mehrere Geräte, jedes Gerät steht an genau einem Standort." }
      ]
    }
  ];

  G.vorlage({
    id: "dia-er-bauen", thema: "diagramm", sub: "ER-Modell & Kardinalitäten",
    titel: "ER-Modell und relationales Schema erstellen", stufe: 3,
    merksatz: "Der Fremdschlüssel steht immer auf der n-Seite. Eine n:m-Beziehung braucht eine Zwischentabelle mit beiden Fremdschlüsseln als zusammengesetztem Primärschlüssel.",
    bau(R, c) {
      const sz = R.waehle(ER_SZENARIEN);
      /* Attribute leicht variieren: Schlüssel bleibt, ein Attribut kann entfallen */
      const ent = sz.entitaeten.map(e => {
        const rest = e.attr.filter(a => a !== e.pk);
        const gewaehlt = R.waehleN(rest, Math.max(2, rest.length - R.ganz(0, 1)));
        return { name: e.name, pk: e.pk, attr: [e.pk].concat(gewaehlt) };
      });

      /* Tabelle 1: Entitäten mit Beziehung */
      const sollEnt = ent.map(e => {
        const bez = sz.beziehungen.find(b => b.von === e.name);
        return {
          name: e.name,
          attr: e.attr,
          pk: e.pk,
          bezName: bez ? bez.verb : null,
          bez: bez ? bez.nach : null,
          kard: bez ? bez.kard : null
        };
      });

      /* Tabelle 2: relationales Schema — nur die Fremdschlüssel */
      const sollFk = [];
      sz.beziehungen.forEach(b => {
        const von = ent.find(e => e.name === b.von), nach = ent.find(e => e.name === b.nach);
        if (b.kard === "n:m") {
          sollFk.push({
            tabelle: b.zwischen.name,
            fk: [von.pk, nach.pk],
            ziel: [von.name + ", " + nach.name, von.name + " und " + nach.name, von.name, nach.name]
          });
        } else {
          sollFk.push({ tabelle: nach.name, fk: [von.pk], ziel: von.name });
        }
      });

      const nm = sz.beziehungen.some(b => b.kard === "n:m");
      const situation =
        `Die ${c.firma} braucht für ${sz.was} eine Datenbank (Bereich ${sz.kontext}).\n\n` +
        ent.map(e => `${e.name}: ${e.attr.join(", ")}`).join("\n") + "\n\n" +
        sz.beziehungen.map(b => "• " + b.text).join("\n");

      const felder = [
        {
          typ: "modell", art: "er", be: ent.length * 2.5,
          label: "ER-Modell — Entitäten, Attribute und Beziehungen",
          spalten: [
            { key: "name", label: "Entität", platzhalter: "z. B. Kunde" },
            { key: "attr", label: "Attribute (Komma getrennt)", art: "menge", gewicht: 2, platzhalter: "AttributA, AttributB" },
            { key: "pk", label: "Primärschlüssel", art: "text", gewicht: 1, platzhalter: "z. B. KundenID" },
            { key: "bezName", label: "Beziehung heißt", art: "text", gewicht: 1, platzhalter: "z. B. besitzt" },
            { key: "bez", label: "Beziehung zu", art: "text", gewicht: 1, platzhalter: "Entität" },
            { key: "kard", label: "Kardinalität", art: "auswahl", gewicht: 1, optionen: ["1:1", "1:n", "n:m", "—"] }
          ],
          soll: sollEnt,
          regeln: [
            "Jede Entität braucht genau einen Primärschlüssel, der jeden Datensatz eindeutig macht.",
            "Kardinalität immer aus Sicht der Zeile lesen: „ein Kunde hat n Fahrzeuge“ = 1:n.",
            "Die Beziehung bekommt einen Namen in Verbform („besitzt“, „bearbeitet“) und steht im Diagramm in der Raute.",
            "Entität ohne Beziehung: Felder frei lassen oder einen Strich eintragen."
          ]
        },
        {
          typ: "modell", art: "schema", be: sollFk.length * 3,
          label: "Relationales Schema — wo stehen die Fremdschlüssel?",
          spalten: [
            { key: "tabelle", label: "Tabelle", platzhalter: "Tabellenname" },
            { key: "fk", label: "Fremdschlüssel", art: "menge", gewicht: 2, platzhalter: "z. B. KundenID" },
            { key: "ziel", label: "verweist auf Tabelle", art: "text", gewicht: 1, platzhalter: "Tabellenname" }
          ],
          soll: sollFk,
          regeln: nm
            ? ["Der Fremdschlüssel steht auf der n-Seite.",
               "Eine n:m-Beziehung wird über eine Zwischentabelle aufgelöst; sie enthält beide Fremdschlüssel."]
            : ["Der Fremdschlüssel steht auf der n-Seite — dort, wo genau ein Partner existiert."]
        }
      ];

      if (nm) {
        const b = sz.beziehungen.find(x => x.kard === "n:m");
        felder.push({
          typ: "text", label: "Welches zusätzliche Attribut gehört sinnvollerweise in die Zwischentabelle?",
          be: 1, zeilen: 1, satzbau: false,
          erwartet: [b.zwischen.extra]
        });
        felder.push({
          typ: "text", label: "Woraus besteht der Primärschlüssel dieser Zwischentabelle? Begründen Sie.",
          be: 2, zeilen: 3, satzbau: true, minWorte: 8, noetig: 2,
          erwartet: [
            ["aus beiden Fremdschlüsseln", "zusammengesetzter Primärschlüssel", "Kombination beider Schlüssel",
              "beide Primärschlüssel zusammen"],
            ["nur so ist die Zuordnung eindeutig", "jede Kombination nur einmal", "verhindert doppelte Zuordnung",
              "eindeutig"]
          ]
        });
      } else {
        felder.push({
          typ: "text", label: "Warum steht der Fremdschlüssel nicht auf der 1-Seite? Begründen Sie.",
          be: 2, zeilen: 3, satzbau: true, minWorte: 8,
          erwartet: [["dort müssten mehrere Werte in ein Feld", "Wiederholgruppe", "verstößt gegen die 1. Normalform",
            "nur ein Wert pro Feld", "n-Seite hat genau einen Partner"]]
        });
      }

      return {
        situation,
        prompt: "Erstellen Sie das ER-Modell und überführen Sie es in ein relationales Schema.",
        felder,
        loesung:
`ER-Modell:
` + sollEnt.map(e =>
`  ${e.name} (${e.attr.join(", ")}) — Primärschlüssel ${e.pk}` +
  (e.kard ? `\n     └─ ${Array.isArray(e.bezName) ? e.bezName[0] : e.bezName} → ${Array.isArray(e.bez) ? e.bez[0] : e.bez}   (${e.kard})` : "")).join("\n") +
`\n\nRelationales Schema (Primärschlüssel unterstrichen, Fremdschlüssel mit #):
` + ent.map(e => {
  const zu = sollFk.filter(x => (Array.isArray(x.tabelle) ? x.tabelle[0] : x.tabelle) === e.name);
  const fks = zu.flatMap(x => x.fk).map(k => "#" + k);
  return `  ${e.name}(${[e.pk + " [PK]"].concat(e.attr.filter(a => a !== e.pk)).concat(fks).join(", ")})`;
}).join("\n") +
(nm ? "\n" + sollFk.filter(x => Array.isArray(x.tabelle)).map(x =>
  `  ${x.tabelle[0]}(${x.fk.map(k => "#" + k + " [PK]").join(", ")}, weitere Attribute der Beziehung)`).join("\n") : "") +
`\n\n` + (nm
  ? `Die n:m-Beziehung lässt sich relational nicht direkt abbilden und wird über eine Zwischentabelle
aufgelöst. Diese enthält die Primärschlüssel beider Tabellen als Fremdschlüssel; beide zusammen
bilden den zusammengesetzten Primärschlüssel — nur so ist jede Zuordnung genau einmal möglich.
Attribute, die zur Beziehung selbst gehören (Menge, Datum, Note), gehören ebenfalls dorthin.`
  : `Der Fremdschlüssel gehört auf die n-Seite: Dort gibt es genau einen Partner, also genau einen Wert
pro Feld. Auf der 1-Seite müsste man mehrere Werte in ein Feld schreiben — eine Wiederholgruppe,
die gegen die erste Normalform verstößt.`)
      };
    }
  });

  /* ============================= Use-Case =============================== */

  const UC_SZENARIEN = [
    {
      system: "Ticketsystem",
      faelle: [
        { fall: "Ticket erfassen", akteur: "Melder", bez: "Benutzer anmelden", art: "«include»" },
        { fall: "Ticket bearbeiten", akteur: "First Level Support", bez: "", art: "—" },
        { fall: "Ticket eskalieren", akteur: "First Level Support", bez: "Ticket bearbeiten", art: "«extend»",
          extPunkt: ["nicht im First Level lösbar", "Lösung nicht möglich", "Eskalationsprüfung", "nach der Lösungssuche"],
          bedingung: ["Störung kann im First Level nicht behoben werden", "keine Lösung gefunden",
            "Wissensdatenbank liefert keine Lösung", "Zuständigkeit fehlt", "SLA-Zeit läuft ab"] },
        { fall: "Statusbericht erzeugen", akteur: "Teamleitung", bez: "", art: "—" }
      ],
      extraAkteure: ["Zeitgeber (nächtlicher Lauf)", "Second Level Support"]
    },
    {
      system: "Bestellportal",
      faelle: [
        { fall: "Bestellung aufgeben", akteur: "Kunde", bez: "Zahlung abwickeln", art: "«include»" },
        { fall: "Gutschein einlösen", akteur: "Kunde", bez: "Bestellung aufgeben", art: "«extend»",
          extPunkt: ["vor der Zahlung", "Gutscheinprüfung", "in der Warenkorbübersicht", "vor dem Absenden"],
          bedingung: ["Kunde besitzt einen gültigen Gutschein", "Gutscheincode wird eingegeben",
            "Gutschein ist vorhanden", "Code ist gültig"] },
        { fall: "Lieferung anstoßen", akteur: "Sachbearbeiter", bez: "", art: "—" },
        { fall: "Zahlung abwickeln", akteur: "Zahlungsdienstleister", bez: "", art: "—" }
      ],
      extraAkteure: ["Lagerverwaltung", "Versanddienstleister"]
    },
    {
      system: "Zeiterfassung",
      faelle: [
        { fall: "Zeit buchen", akteur: "Mitarbeiter", bez: "Benutzer anmelden", art: "«include»" },
        { fall: "Fehlbuchung korrigieren", akteur: "Mitarbeiter", bez: "Zeit buchen", art: "«extend»",
          extPunkt: ["nach dem Speichern der Buchung", "Buchungsprüfung", "in der Buchungsübersicht"],
          bedingung: ["Buchung ist fehlerhaft", "Zeiten stimmen nicht", "Korrektur ist nötig",
            "Mitarbeiter stellt einen Fehler fest"] },
        { fall: "Urlaubsantrag genehmigen", akteur: "Vorgesetzter", bez: "", art: "—" },
        { fall: "Monatsauswertung erstellen", akteur: "Lohnbuchhaltung", bez: "", art: "—" }
      ],
      extraAkteure: ["Kalendersystem", "Personalabteilung"]
    }
  ];

  G.vorlage({
    id: "dia-usecase-bauen", thema: "diagramm", sub: "UML Use-Case-Diagramm",
    titel: "Use-Case-Diagramm erstellen", stufe: 2,
    merksatz: "Akteure stehen außerhalb der Systemgrenze. «include» wird immer mit ausgeführt, «extend» nur unter einer Bedingung — der Pfeil zeigt bei beiden auf den Anwendungsfall, der die Bedingung bzw. den Baustein liefert bzw. erweitert wird.",
    bau(R, c) {
      const sz = R.waehle(UC_SZENARIEN);
      const anzahl = R.ganz(3, sz.faelle.length);
      const soll = R.mische(sz.faelle).slice(0, anzahl);
      /* mindestens eine Beziehung soll dabei sein */
      if (!soll.some(x => x.art !== "—")) soll[0] = sz.faelle.find(x => x.art !== "—");
      /* Wenn ein «extend» dabei ist, kommen Extension Point und Bedingung dazu —
         genau die Zusatzangaben, die die IHK am erweiternden Anwendungsfall notiert. */
      let ext = soll.find(x => x.art === "«extend»" && x.extPunkt);
      if (!ext && R.muenze(0.6)) {
        const kandidat = sz.faelle.find(x => x.art === "«extend»" && x.extPunkt);
        if (kandidat && !soll.some(x => x.fall === kandidat.fall)) { soll.push(kandidat); ext = kandidat; }
      }

      const beschreibung = soll.map(x => {
        let t = `„${x.fall}“ wird von ${x.akteur} ausgelöst.`;
        if (x.art === "«include»") t += ` Dabei wird „${x.bez}“ immer mit ausgeführt.`;
        if (x.art === "«extend»") t += ` Unter bestimmten Bedingungen erweitert dieser Fall „${x.bez}“.`;
        return "• " + t;
      }).join("\n");

      return {
        situation: `Für das ${sz.system} der ${c.firma} soll ein UML-Anwendungsfalldiagramm (Use-Case-Diagramm) ` +
          `erstellt werden. Die Fachabteilung hat den Bedarf so beschrieben:\n\n${beschreibung}`,
        prompt: "Tragen Sie die Anwendungsfälle, ihre Akteure und die Beziehungen zwischen den Anwendungsfällen ein.",
        felder: [
          {
            typ: "modell", art: "usecase", be: soll.length * 2,
            label: "Anwendungsfälle, Akteure und Beziehungen",
            spalten: [
              { key: "fall", label: "Anwendungsfall", platzhalter: "z. B. Ticket erfassen" },
              { key: "akteur", label: "Akteur", art: "text", gewicht: 2, platzhalter: "wer löst aus?" },
              { key: "bez", label: "verbunden mit Anwendungsfall", art: "text", gewicht: 1, platzhalter: "— oder Name" },
              { key: "art", label: "Art der Beziehung", art: "auswahl", gewicht: 1, optionen: ["—", "«include»", "«extend»"] }
            ],
            soll: soll.map(x => ({
              fall: x.fall, akteur: x.akteur,
              bez: x.bez ? x.bez : ["—", "keine", "-"],
              art: x.art
            })),
            regeln: [
              "Akteure stehen außerhalb der Systemgrenze, Anwendungsfälle als Ovale darin.",
              "Ein Akteur muss kein Mensch sein — auch ein Nachbarsystem oder ein Zeitgeber zählt.",
              "Anwendungsfall ohne Verbindung zu einem anderen: bei „verbunden mit“ einen Strich eintragen."
            ]
          },
          {
            typ: "auswahl", be: 1.5,
            label: "Welcher der folgenden gehört NICHT als Anwendungsfall ins Diagramm?",
            optionen: soll.slice(0, 2).map(x => x.fall).concat(["Datenbanktabellen anlegen", "Server neu starten"]),
            loesung: "Datenbanktabellen anlegen"
          },
          {
            typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 10, noetig: 2,
            label: "Erklären Sie den Unterschied zwischen «include» und «extend»",
            erwartet: [
              ["include wird immer ausgeführt", "immer mit ausgeführt", "verpflichtender Bestandteil", "stets"],
              ["extend nur unter einer Bedingung", "optional", "nur in bestimmten Fällen", "Erweiterung unter Bedingung"]
            ]
          },
          {
            typ: "text", be: 1.5, zeilen: 2, satzbau: true, minWorte: 6,
            label: "Wozu dient die Systemgrenze im Diagramm?",
            erwartet: [["trennt System von Umwelt", "zeigt was zum System gehört", "Abgrenzung des Systemumfangs",
              "Akteure stehen außerhalb", "Umfang der Software"]]
          },
          {
            typ: "aussagen", be: 2.5,
            label: "Richtig oder falsch?",
            aussagen: R.waehleN([
              { text: "Ein «include»-Anwendungsfall kann von mehreren Basisfällen genutzt werden.", wahr: true },
              { text: "Der gestrichelte Pfeil bei «extend» zeigt vom erweiternden auf den Basisanwendungsfall.", wahr: true },
              { text: "Ein Akteur muss immer ein Mensch sein.", wahr: false },
              { text: "Ein Use-Case-Diagramm legt die Reihenfolge der Arbeitsschritte fest.", wahr: false },
              { text: "Anwendungsfälle werden aus Sicht des Akteurs benannt, nicht aus Sicht der Technik.", wahr: true },
              { text: "Ohne den «extend»-Fall ist der Basisanwendungsfall nicht lauffähig.", wahr: false }
            ], 5)
          }
        ].concat(ext ? [
          {
            typ: "text", be: 1.5, zeilen: 2, satzbau: false,
            label: `An welcher Stelle von „${ext.bez}“ setzt die Erweiterung an? Benennen Sie den Extension Point.`,
            erwartet: [ext.extPunkt]
          },
          {
            typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            label: `Formulieren Sie die Bedingung (condition), unter der „${ext.fall}“ ausgeführt wird.`,
            erwartet: [ext.bedingung]
          }
        ] : []),
        loesung:
          soll.map(x => `• ${x.fall} ← Akteur ${x.akteur}` +
            (x.art !== "—" ? `\n     ${x.art} → ${x.bez}` : "")).join("\n") +
`\n\nWeitere mögliche Akteure dieses Systems: ${sz.extraAkteure.join(", ")}.

«include»: Der eingebundene Anwendungsfall wird bei jedem Ablauf mit ausgeführt — er ist ein
verpflichtender Baustein, der mehrfach verwendet wird (typisch: „Benutzer anmelden“).
«extend»: Der erweiternde Anwendungsfall läuft nur unter einer Bedingung zusätzlich ab; ohne ihn
funktioniert der Basisfall trotzdem.

Nicht ins Diagramm gehören technische Tätigkeiten wie „Datenbanktabellen anlegen“ oder
„Server neu starten“ — ein Use-Case beschreibt einen fachlichen Nutzen für einen Akteur,
keine Implementierung.

Die Systemgrenze trennt das System von seiner Umwelt: Innen stehen die Anwendungsfälle,
außen die Akteure. Sie macht sichtbar, was das System leisten soll und was nicht.` +
(ext ? `

Extension Point: Am Basisanwendungsfall „${ext.bez}“ wird die Stelle benannt, an der die
Erweiterung ansetzt — hier zum Beispiel „${ext.extPunkt[0]}“. Dazu gehört die Bedingung:
condition (${ext.bedingung[0]}). Im Diagramm steht beides in einem Notizfeld am Basisfall,
der gestrichelte Pfeil mit «extend» zeigt von „${ext.fall}“ auf „${ext.bez}“.` : "")
      };
    }
  });

  /* =========================== Klassendiagramm ========================== */

  const KL_SZENARIEN = [
    {
      thema: "Geräteverwaltung",
      ober: { name: "Gerät", attr: ["- inventarNr: String", "- hersteller: String", "- anschaffungsdatum: Date"],
              meth: ["+ ausleihen()", "+ zurueckgeben()"] },
      kind: { name: "Notebook", attr: ["- akkulaufzeit: int"], meth: ["+ akkuTauschen()"] },
      partner: { name: "Mitarbeiter", attr: ["- personalNr: String", "- name: String"], meth: ["+ anmelden()"] },
      mult: "1:0..*", multText: "Ein Mitarbeiter kann mehrere Geräte haben, jedes Gerät gehört zu höchstens einer Person."
    },
    {
      thema: "Ticketsystem",
      ober: { name: "Ticket", attr: ["- ticketNr: int", "- betreff: String", "- prioritaet: int"],
              meth: ["+ eskalieren()", "+ schliessen()"] },
      kind: { name: "Störungsticket", attr: ["- betroffenesSystem: String"], meth: ["+ ausfallzeitBerechnen()"] },
      partner: { name: "Kunde", attr: ["- kundenNr: int", "- firma: String"], meth: ["+ ticketMelden()"] },
      mult: "1:0..*", multText: "Ein Kunde kann viele Tickets melden, ein Ticket gehört zu genau einem Kunden."
    },
    {
      thema: "Versand",
      ober: { name: "Sendung", attr: ["- sendungsNr: String", "- gewicht: double"],
              meth: ["+ portoBerechnen()", "+ verfolgen()"] },
      kind: { name: "Expresssendung", attr: ["- zustellzeit: int"], meth: ["+ zuschlagBerechnen()"] },
      partner: { name: "Empfänger", attr: ["- empfaengerID: int", "- anschrift: String"], meth: [] },
      mult: "1:1..*", multText: "Zu einem Empfänger gehören eine oder mehrere Sendungen, jede Sendung hat genau einen Empfänger."
    }
  ];

  const TYP_SYN = {
    "String": ["Zeichenkette", "String", "Text", "varchar", "char"],
    "int": ["Ganzzahl", "int", "Integer", "ganze Zahl"],
    "double": ["Dezimalzahl", "double", "float", "Kommazahl", "Gleitkommazahl"],
    "Date": ["Datum", "Date", "Datumswert"],
    "boolean": ["Wahrheitswert", "boolean", "bool", "ja/nein"]
  };
  const ohneTyp = a => a.replace(/^[-+#]\s*/, "").split(":")[0].trim();
  const nurTyp = a => (a.split(":")[1] || "String").trim();

  G.vorlage({
    id: "dia-klasse-bauen", thema: "diagramm", sub: "UML-Klassendiagramm",
    titel: "Klassendiagramm erstellen", stufe: 3,
    merksatz: "Drei Fächer je Klasse: Name, Attribute, Methoden. − privat, + öffentlich, # geschützt. Attribute mit Datentyp, Methoden mit Klammern. Vererbung: leere Dreieckspitze zeigt auf die Oberklasse.",
    bau(R, c) {
      const sz = R.waehle(KL_SZENARIEN);
      const oberAttr = [sz.ober.attr[0]].concat(R.waehleN(sz.ober.attr.slice(1), R.ganz(1, sz.ober.attr.length - 1)));

      const soll = [
        { klasse: sz.ober.name, attr: oberAttr.map(a => a.replace(/^[-+#]\s*/, "").split(":")[0].trim()),
          meth: sz.ober.meth.map(m => m.replace(/^[-+#]\s*/, "")), erbt: ["—", "keine", "-"], mult: ["—", "keine", "-"] },
        { klasse: sz.kind.name, attr: sz.kind.attr.map(a => a.replace(/^[-+#]\s*/, "").split(":")[0].trim()),
          meth: sz.kind.meth.map(m => m.replace(/^[-+#]\s*/, "")), erbt: sz.ober.name, mult: ["—", "keine", "-"] },
        { klasse: sz.partner.name, attr: sz.partner.attr.map(a => a.replace(/^[-+#]\s*/, "").split(":")[0].trim()),
          meth: sz.partner.meth.map(m => m.replace(/^[-+#]\s*/, "")), erbt: ["—", "keine", "-"],
          mult: [sz.mult, sz.mult.replace(":", " zu "), "1:n", "1:*"] }
      ];

      return {
        situation:
`Für eine Anwendung der ${c.firma} (${sz.thema}) sind drei Klassen zu modellieren.

${sz.ober.name}
   Attribute: ${oberAttr.map(ohneTyp).join(", ")}
   Methoden:  ${sz.ober.meth.join(", ")}

${sz.kind.name} ist eine Sonderform von ${sz.ober.name} und ergänzt
   Attribute: ${sz.kind.attr.map(ohneTyp).join(", ")}
   Methoden:  ${sz.kind.meth.join(", ")}

${sz.partner.name}
   Attribute: ${sz.partner.attr.map(ohneTyp).join(", ")}${sz.partner.meth.length ? "\n   Methoden:  " + sz.partner.meth.join(", ") : ""}

Beziehung: ${sz.multText}`,
        prompt: "Tragen Sie die Klassen mit Attributen, Methoden, Vererbung und Multiplizität ein.",
        felder: [
          {
            typ: "modell", art: "klasse", be: 6,
            label: "Klassen",
            spalten: [
              { key: "klasse", label: "Klasse", platzhalter: "Klassenname" },
              { key: "attr", label: "Attribute (Komma getrennt)", art: "menge", gewicht: 2, platzhalter: "attributA, attributB" },
              { key: "meth", label: "Methoden", art: "menge", gewicht: 2, platzhalter: "methode()" },
              { key: "erbt", label: "erbt von", art: "text", gewicht: 1, platzhalter: "— oder Klasse" },
              { key: "mult", label: "Multiplizität zur Beziehung", art: "text", gewicht: 1, platzhalter: "z. B. 1:0..*" }
            ],
            soll,
            regeln: [
              "Methoden immer mit Klammern schreiben, Attribute mit Datentyp.",
              "Sichtbarkeit angeben: − privat, + öffentlich, # geschützt.",
              "Geerbte Attribute nicht noch einmal in der Unterklasse aufführen."
            ]
          },
          {
            typ: "raster", label: "Sinnvolle Datentypen der Attribute",
            kopf: ["Attribut", "Datentyp"],
            zeilen: oberAttr.concat(sz.kind.attr).map(a => ({
              zellen: [{ t: ohneTyp(a) }, { eingabe: true, text: TYP_SYN[nurTyp(a)] || [nurTyp(a)], be: 0.5 }]
            })) },
          {
            typ: "auswahl", be: 1.5,
            label: `Welche Beziehung besteht zwischen ${sz.ober.name} und ${sz.kind.name}?`,
            optionen: ["Vererbung (Generalisierung)", "Assoziation", "Aggregation", "Komposition"],
            loesung: "Vererbung (Generalisierung)"
          },
          {
            typ: "zahl", be: 1.5, dez: 0, tolAbs: 0,
            label: `Über wie viele Attribute verfügt ${sz.kind.name} insgesamt (eigene und geerbte)?`,
            loesung: oberAttr.length + sz.kind.attr.length
          },
          {
            typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 8, noetig: 2,
            label: "Was bedeutet die Sichtbarkeit − (privat), und warum werden Attribute meist privat gesetzt?",
            erwartet: [
              ["nur innerhalb der Klasse zugreifbar", "von außen nicht sichtbar", "nur die eigene Klasse"],
              ["Datenkapselung", "Zugriff nur über Methoden", "Getter und Setter", "schützt vor ungültigen Werten",
                "Konsistenz der Daten"]
            ]
          }
        ],
        loesung:
`${sz.ober.name}
   ${oberAttr.join("\n   ")}      (Datentypen: Zeichenkette = String, Ganzzahl = int, Dezimalzahl = double, Datum = Date)
   ${sz.ober.meth.join("\n   ")}

${sz.kind.name}  ──▷  ${sz.ober.name}   (Vererbung, leere Dreieckspitze zeigt auf die Oberklasse)
   ${sz.kind.attr.join("\n   ")}
   ${sz.kind.meth.join("\n   ")}

${sz.partner.name}
   ${sz.partner.attr.join("\n   ")}${sz.partner.meth.length ? "\n   " + sz.partner.meth.join("\n   ") : ""}

Beziehung ${sz.partner.name} — ${sz.ober.name}: Multiplizität ${sz.mult}
   (${sz.multText})

${sz.kind.name} hat insgesamt ${oberAttr.length + sz.kind.attr.length} Attribute:
${sz.kind.attr.length} eigene plus ${oberAttr.length} geerbte. Geerbte Attribute werden im Diagramm
NICHT wiederholt — sie ergeben sich aus der Vererbungsbeziehung.

Die Sichtbarkeit − bedeutet privat: Auf das Attribut kann nur die eigene Klasse zugreifen.
Attribute werden privat gesetzt, damit der Zugriff ausschließlich über Methoden läuft
(Datenkapselung). So lässt sich prüfen, ob ein Wert gültig ist, und die interne Darstellung
kann geändert werden, ohne dass fremder Code bricht.`
      };
    }
  });

})(window.GEN);
