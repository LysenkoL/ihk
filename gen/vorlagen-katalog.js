/* ============================================================================
   gen/vorlagen-katalog.js — Themen, die der Prüfungskatalog ab 2025 NEU
   verlangt und die in keinem der zehn gesammelten Examen vorkommen
   (siehe exams/luecken.json): Konsolenbefehle, Vorgehensmodelle, Dateisysteme,
   Projektstrukturplan, Domäne, Testprotokoll, Risikomatrix, Teamphasen,
   Barrierefreiheit — plus Support, Ergonomie und Lastenheft/Pflichtenheft.
   ========================================================================== */
"use strict";
(function (G) {
  const Z = G.ZAHLWORT, f = G.fmt, r = G.runde;

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-konsole", thema: "arbeitsplatz", sub: "Konsolenbefehle",
    titel: "Befehle auf der Kommandozeile", stufe: 1,
    merksatz: "ping = erreichbar? · nslookup/dig = Namensauflösung · ipconfig/ip a = eigene Konfiguration · tracert = Weg · arp -a = MAC zu IP",
    bau(R, c) {
      const alle = [
        ["Prüfen, ob ein Server im Netz antwortet", "ping"],
        ["Die eigene IP-Adresse und das Standardgateway unter Windows anzeigen", "ipconfig"],
        ["Die eigene IP-Konfiguration unter Linux anzeigen", "ip a"],
        ["Zu einem Domainnamen die IP-Adresse ermitteln", "nslookup"],
        ["Den Weg der Pakete bis zum Zielsystem anzeigen", "tracert"],
        ["Die Zuordnung von IP- zu MAC-Adressen im lokalen Netz anzeigen", "arp -a"],
        ["Den Inhalt eines Verzeichnisses unter Linux auflisten", "ls"],
        ["Ein neues Verzeichnis anlegen", "mkdir"],
        ["Eine Datei kopieren", "cp"],
        ["Die Zugriffsrechte einer Datei ändern", "chmod"],
        ["Offene Netzwerkverbindungen und Ports anzeigen", "netstat"]
      ];
      const paare = R.waehleN(alle, 5);
      const optionen = ["ping", "ipconfig", "ip a", "nslookup", "tracert", "arp -a", "ls", "mkdir", "cp", "chmod", "netstat"];

      // chmod-Teil
      const rechte = [R.ganz(4, 7), R.ganz(0, 7), R.ganz(0, 5)];
      const symbol = rechte.map(n => (n & 4 ? "r" : "-") + (n & 2 ? "w" : "-") + (n & 1 ? "x" : "-")).join("");
      const oktal = rechte.join("");

      return {
        situation: `Bei der Fehlersuche an einem Arbeitsplatz der ${c.firma} arbeitet ${c.person} auf der ` +
          `Kommandozeile. Auf dem Linux-Server sind außerdem die Zugriffsrechte einer Konfigurationsdatei zu prüfen.`,
        prompt: "Ordnen Sie die Befehle zu und lösen Sie die Aufgabe zu den Zugriffsrechten.",
        felder: [
          { typ: "zuordnung", label: "Aufgabe → Befehl", be: 5, optionen, paare },
          { typ: "text", label: `Die Datei hat die Rechte ${symbol} — wie lautet die oktale Schreibweise?`,
            be: 2, zeilen: 1, erwartet: [[oktal, "0" + oktal]] },
          { typ: "text", label: `Mit welchem Befehl setzen Sie diese Rechte auf die Datei server.conf?`,
            be: 1.5, zeilen: 1, erwartet: [["chmod " + oktal + " server.conf", "chmod " + oktal]] },
          { typ: "text", label: "Was bedeutet das Recht x bei einem Verzeichnis?", be: 1.5, zeilen: 2,
            satzbau: true, minWorte: 5,
            erwartet: [["Verzeichnis betreten", "hineinwechseln", "cd möglich", "durchqueren", "Zugriff auf Inhalte"]] }
        ],
        loesung: paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nZugriffsrechte: r = 4, w = 2, x = 1. Die Ziffern stehen für Benutzer (user), Gruppe (group) und
alle anderen (others).
${symbol}  →  ${symbol.slice(0, 3)} = ${rechte[0]} · ${symbol.slice(3, 6)} = ${rechte[1]} · ${symbol.slice(6)} = ${rechte[2]}  →  ${oktal}
Befehl: chmod ${oktal} server.conf

Bei einer Datei erlaubt x das Ausführen. Bei einem Verzeichnis bedeutet x, dass man es betreten
(cd) und auf die enthaltenen Objekte zugreifen darf — ohne x nützt selbst ein Leserecht nichts.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-vorgehensmodell", thema: "projekt", sub: "Vorgehensmodelle (Wasserfall & Scrum)",
    titel: "Wasserfall oder Scrum", stufe: 2,
    merksatz: "Wasserfall: Anforderungen stehen fest, Phasen nacheinander, Änderungen teuer. Scrum: Anforderungen entwickeln sich, Sprints, frühe Rückmeldung.",
    bau(R, c) {
      const faelle = [
        { txt: "Ein gesetzlich vorgeschriebenes Meldeverfahren muss exakt nach einer feststehenden Spezifikation und zu einem festen Stichtag umgesetzt werden.",
          wahl: "Wasserfallmodell",
          warum: [["Anforderungen stehen von Anfang an fest", "vollständig spezifiziert", "unveränderliche Vorgaben", "feste Anforderungen"],
                  ["Termin und Umfang sind fix", "klarer Endtermin", "Abnahme nach Vorgabe", "Nachweisbarkeit", "Dokumentation"]] },
        { txt: "Für ein neues Kundenportal ist noch unklar, welche Funktionen die Nutzer wirklich brauchen; erste Rückmeldungen sollen früh einfließen.",
          wahl: "Scrum",
          warum: [["Anforderungen sind unklar", "ändern sich noch", "unvollständige Anforderungen"],
                  ["frühe Rückmeldung", "lauffähiges Zwischenergebnis nach jedem Sprint", "Feedback der Nutzer", "schnell reagieren"]] },
        { txt: "Eine Fachanwendung soll schrittweise abgelöst werden; die Fachabteilung will nach jeder Ausbaustufe neu über die nächsten Funktionen entscheiden.",
          wahl: "Scrum",
          warum: [["Priorisierung wird laufend angepasst", "Backlog", "Änderungen jederzeit möglich"],
                  ["Teilergebnisse sind nutzbar", "inkrementell", "Ausbaustufen"]] }
      ];
      const fall = R.waehle(faelle);
      const rollen = [
        ["Product Owner", "verantwortet den Product Backlog und die Priorisierung der Anforderungen"],
        ["Scrum Master", "sorgt für die Einhaltung des Rahmenwerks und beseitigt Hindernisse"],
        ["Entwicklungsteam", "setzt die Anforderungen eines Sprints eigenverantwortlich um"]
      ];
      const paare = R.mische(rollen).map(x => [x[1], x[0]]);

      return {
        situation: `In der ${c.firma} steht ein neues Softwareprojekt an. ${fall.txt}`,
        prompt: "Wählen Sie ein Vorgehensmodell, begründen Sie die Wahl und ordnen Sie die Scrum-Rollen zu.",
        felder: [
          { typ: "auswahl", label: "Empfohlenes Vorgehensmodell", be: 1,
            optionen: ["Wasserfallmodell", "Scrum"], loesung: fall.wahl },
          { typ: "liste", label: "Zwei Begründungen, jeweils mit Bezug zur Situation", be: 3, zeilen: 3,
            noetig: 2, satzbau: true, minWorte: 6, erwartet: fall.warum.flat().map(x => [x]) },
          { typ: "zuordnung", label: "Aufgabe → Scrum-Rolle", be: 3,
            optionen: ["Product Owner", "Scrum Master", "Entwicklungsteam"], paare },
          { typ: "text", label: "Nennen Sie einen Nachteil des Wasserfallmodells", be: 1.5, zeilen: 2,
            satzbau: true, minWorte: 6,
            erwartet: [["späte Änderungen sind teuer", "keine Rückkehr in frühere Phase", "Fehler fallen spät auf",
              "erst am Ende ein lauffähiges Ergebnis", "unflexibel", "starr"]] }
        ],
        loesung:
`Empfehlung: ${fall.wahl}.
Begründung: ${fall.warum.map(g => g[0]).join("; ")} — jeweils bezogen auf die geschilderte Ausgangslage.

Scrum-Rollen:
• Product Owner — pflegt und priorisiert den Product Backlog, vertritt die Interessen der Auftraggeber.
• Scrum Master — verantwortet den Prozess, moderiert die Events und räumt Hindernisse aus dem Weg.
• Entwicklungsteam — setzt das Sprint-Ziel eigenverantwortlich um und liefert ein lauffähiges Inkrement.

Nachteil des Wasserfallmodells: Die Phasen laufen streng nacheinander ab. Änderungen an den
Anforderungen sind später nur mit hohem Aufwand möglich, und Fehler in der Analyse fallen erst
am Ende auf, wenn das erste lauffähige Ergebnis vorliegt.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-lastenheft", thema: "projekt", sub: "Lastenheft & Pflichtenheft",
    titel: "Lastenheft und Pflichtenheft abgrenzen", stufe: 1,
    merksatz: "Lastenheft = WAS der Auftraggeber will. Pflichtenheft = WIE der Auftragnehmer es umsetzt.",
    bau(R, c) {
      const alle = [
        ["Die Suche muss Ergebnisse in höchstens zwei Sekunden liefern.", "Lastenheft"],
        ["Die Suche wird über einen Elasticsearch-Index mit nächtlicher Aktualisierung realisiert.", "Pflichtenheft"],
        ["Alle Beschäftigten sollen sich mit ihrem vorhandenen Firmenkonto anmelden können.", "Lastenheft"],
        ["Die Anmeldung erfolgt über SAML 2.0 gegen den vorhandenen Identity Provider.", "Pflichtenheft"],
        ["Das Portal muss auch auf Tablets bedienbar sein.", "Lastenheft"],
        ["Die Oberfläche wird als responsives Layout mit drei Breakpoints umgesetzt.", "Pflichtenheft"],
        ["Wird vom Auftraggeber erstellt.", "Lastenheft"],
        ["Wird vom Auftragnehmer erstellt und vom Auftraggeber abgenommen.", "Pflichtenheft"]
      ];
      const paare = R.waehleN(alle, 5);
      return {
        situation: `Die ${c.firma} beauftragt ein Systemhaus mit der Entwicklung eines internen Portals. ` +
          `Vor Projektbeginn werden die Anforderungen dokumentiert.`,
        prompt: "Ordnen Sie jede Aussage dem richtigen Dokument zu und erläutern Sie den Unterschied.",
        felder: [
          { typ: "zuordnung", label: "Aussage → Dokument", be: 5,
            optionen: ["Lastenheft", "Pflichtenheft"], paare },
          { typ: "text", label: "Erklären Sie den Unterschied zwischen Lastenheft und Pflichtenheft",
            be: 2.5, zeilen: 4, satzbau: true, minWorte: 12, noetig: 2,
            erwartet: [
              ["Lastenheft beschreibt was gefordert ist", "Auftraggeber", "Anforderungen des Kunden", "Gesamtheit der Forderungen"],
              ["Pflichtenheft beschreibt wie umgesetzt wird", "Auftragnehmer", "technische Umsetzung", "Realisierungsvorgaben"]
            ] },
          { typ: "text", label: "Warum ist ein sauberes Lastenheft für den Auftraggeber wichtig?",
            be: 1.5, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["Grundlage für Angebot und Abnahme", "Vertragsgrundlage", "Missverständnisse vermeiden",
              "Nachträge vermeiden", "Kosten kalkulierbar", "vergleichbare Angebote", "Abnahmekriterien"]] }
        ],
        loesung: paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nDas Lastenheft wird vom Auftraggeber erstellt und beschreibt die Gesamtheit der Forderungen —
also WAS geleistet werden soll, aus fachlicher Sicht und ohne technische Festlegung.
Das Pflichtenheft erstellt der Auftragnehmer auf dieser Grundlage: Es beschreibt, WIE die
Forderungen konkret umgesetzt werden, und wird vom Auftraggeber abgenommen.

Ein sauberes Lastenheft ist die Grundlage für vergleichbare Angebote, für die Kalkulation und
für die spätere Abnahme. Fehlt es oder ist es unklar, entstehen Missverständnisse, teure Nachträge
und Streit darüber, ob die Leistung erbracht wurde.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-psp", thema: "projekt", sub: "Projektstrukturplan",
    titel: "Projektstrukturplan aufstellen", stufe: 2,
    merksatz: "Der PSP zerlegt das Projekt in Teilprojekte und Arbeitspakete — er sagt WAS zu tun ist, nicht WANN. Das Wann steht im Terminplan.",
    bau(R, c) {
      const projekte = [
        { name: "Rollout von 60 neuen Arbeitsplätzen",
          teile: ["Planung und Beschaffung", "Vorbereitung der Geräte", "Installation vor Ort", "Übergabe und Schulung"] },
        { name: "Einführung eines Ticketsystems",
          teile: ["Anforderungsanalyse", "Systemauswahl", "Installation und Konfiguration", "Einführung und Schulung"] },
        { name: "Umzug der Serverinfrastruktur",
          teile: ["Bestandsaufnahme", "Planung des Umzugs", "Durchführung", "Test und Abnahme"] }
      ];
      const p = R.waehle(projekte);
      const paare = [
        ["Ein Element, das nicht weiter zerlegt wird und einem Verantwortlichen zugeordnet ist", "Arbeitspaket"],
        ["Eine Gruppe zusammengehöriger Arbeitspakete", "Teilprojekt"],
        ["Ein Ereignis mit der Dauer null, das den Abschluss einer Phase markiert", "Meilenstein"],
        ["Die Darstellung, welche Vorgänge in welcher Reihenfolge und Dauer ablaufen", "Netzplan bzw. Gantt-Diagramm"]
      ];

      return {
        situation: `Die ${c.firma} startet das Projekt „${p.name}“. Vor der Terminplanung soll das Projekt ` +
          `strukturiert werden.`,
        prompt: "Bearbeiten Sie die Aufgaben zum Projektstrukturplan.",
        felder: [
          { typ: "liste", label: `Nennen Sie vier Teilprojekte (Phasen) für „${p.name}“`,
            be: 4, zeilen: 5, noetig: 4, satzbau: false,
            erwartet: p.teile.map(t => [t, t.split(" ")[0]]) },
          { typ: "text", label: "Nennen Sie zu einem dieser Teilprojekte ein konkretes Arbeitspaket",
            be: 1.5, zeilen: 2, satzbau: true, minWorte: 4,
            erwartet: [["Arbeitspaket", "installieren", "beschaffen", "konfigurieren", "erstellen", "prüfen",
              "einrichten", "schulen", "dokumentieren", "aufnehmen", "auswählen", "testen", "übergeben"]] },
          { typ: "zuordnung", label: "Begriff bestimmen", be: 4,
            optionen: ["Arbeitspaket", "Teilprojekt", "Meilenstein", "Netzplan bzw. Gantt-Diagramm"],
            paare: R.mische(paare) },
          { typ: "text", label: "Wozu dient der Projektstrukturplan? Nennen Sie einen Zweck und begründen Sie",
            be: 1.5, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["Vollständigkeit sichern", "nichts vergessen", "Grundlage für Aufwandsschätzung",
              "Verantwortlichkeiten zuordnen", "Grundlage für Termin- und Kostenplanung", "Überblick",
              "Zerlegung in beherrschbare Einheiten"]] }
        ],
        loesung:
`Teilprojekte für „${p.name}“: ${p.teile.join(" · ")}
Beispiel für ein Arbeitspaket in „${p.teile[1]}“: „Standard-Image erstellen und auf zehn Geräten testen“ —
klar abgegrenzt, schätzbar und einem Verantwortlichen zuzuordnen.

Begriffe:
• Arbeitspaket — kleinste, nicht weiter zerlegte Einheit mit Verantwortlichem, Aufwand und Ergebnis.
• Teilprojekt — Bündel zusammengehöriger Arbeitspakete.
• Meilenstein — Ereignis mit der Dauer null, markiert das Ende einer Phase.
• Netzplan bzw. Gantt-Diagramm — die zeitliche Anordnung; der PSP selbst enthält keine Termine.

Zweck: Der PSP zerlegt das Projekt in beherrschbare Einheiten, sichert die Vollständigkeit
(„was nicht im PSP steht, wird nicht gemacht“) und ist die Grundlage für Aufwandsschätzung,
Terminplanung, Kostenplanung und die Zuordnung von Verantwortlichkeiten.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-risikomatrix", thema: "projekt", sub: "Risikomatrix",
    titel: "Risiken bewerten und behandeln", stufe: 2,
    merksatz: "Risikowert = Eintrittswahrscheinlichkeit × Schadenshöhe. Strategien: vermeiden, vermindern, übertragen, akzeptieren.",
    bau(R, c) {
      const risiken = R.waehleN([
        "Lieferverzug bei der Hardware", "Ausfall der Schlüsselperson im Projekt",
        "Anforderungen ändern sich während der Umsetzung", "Testumgebung steht nicht rechtzeitig bereit",
        "Migration der Altdaten schlägt fehl", "Schulungstermine kollidieren mit dem Jahresabschluss",
        "Netzwerkkapazität reicht für den Rollout nicht aus"
      ], 4);
      const zeilen = risiken.map(name => {
        const w = R.ganz(1, 5), s = R.ganz(1, 5);
        return { name, w, s, wert: w * s };
      });
      const groesstes = zeilen.reduce((m, z) => z.wert > m.wert ? z : m, zeilen[0]);

      const strategien = [
        ["Auf die riskante Eigenentwicklung wird verzichtet, es wird ein Standardprodukt gekauft.", "vermeiden"],
        ["Der Liefertermin wird vertraglich mit einer Konventionalstrafe abgesichert.", "übertragen"],
        ["Es werden zwei Mitarbeitende parallel eingearbeitet.", "vermindern"],
        ["Das Restrisiko wird bewusst hingenommen und im Projekttagebuch dokumentiert.", "akzeptieren"]
      ];

      return {
        situation: `Für ein Projekt der ${c.firma} wurde eine Risikoanalyse durchgeführt. ` +
          `Eintrittswahrscheinlichkeit und Schadenshöhe sind jeweils auf einer Skala von 1 (sehr gering) ` +
          `bis 5 (sehr hoch) bewertet.`,
        prompt: "Berechnen Sie die Risikowerte und ordnen Sie die Behandlungsstrategien zu.",
        tabellen: [{
          titel: "Risikoanalyse",
          kopf: ["Risiko", "Eintrittswahrscheinlichkeit", "Schadenshöhe"],
          zeilen: zeilen.map(z => [z.name, String(z.w), String(z.s)])
        }],
        felder: [
          { typ: "raster", label: "Risikowerte", kopf: ["Risiko", "Risikowert"],
            zeilen: zeilen.map(z => ({ zellen: [{ t: z.name }, { eingabe: true, loesung: z.wert, dez: 0, be: 0.5 }] })) },
          { typ: "auswahl", label: "Welches Risiko ist zuerst zu behandeln?", be: 1,
            optionen: risiken, loesung: groesstes.name },
          { typ: "zuordnung", label: "Maßnahme → Risikostrategie", be: 4,
            optionen: ["vermeiden", "vermindern", "übertragen", "akzeptieren"], paare: R.mische(strategien) },
          { typ: "text", label: `Nennen Sie eine konkrete Maßnahme gegen „${groesstes.name}“ und begründen Sie sie`,
            be: 2, zeilen: 3, satzbau: true, minWorte: 10,
            erwartet: [["Maßnahme", "damit", "weil", "dadurch", "reduziert", "verhindert", "früher", "Puffer",
              "Ersatz", "Alternative", "Vertrag", "Test", "Schulung", "Reserve"]] }
        ],
        loesung:
          zeilen.map(z => `${z.name}: ${z.w} × ${z.s} = ${z.wert}`).join("\n") +
`\n\nZuerst zu behandeln ist „${groesstes.name}“ mit dem höchsten Risikowert ${groesstes.wert}.

Strategien:
• vermeiden — die Ursache wird beseitigt, das Risiko kann nicht mehr eintreten.
• vermindern — Wahrscheinlichkeit oder Schadenshöhe werden gesenkt (z. B. Vertretung einarbeiten).
• übertragen — das Risiko trägt ein Dritter (Versicherung, Vertragsstrafe, Dienstleister).
• akzeptieren — das Restrisiko wird bewusst getragen und dokumentiert.

Die Risikomatrix wird regelmäßig fortgeschrieben; neue Risiken kommen hinzu, behandelte werden neu bewertet.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-tuckman", thema: "projekt", sub: "Teamphasen (Tuckman)",
    titel: "Phasen der Teamentwicklung", stufe: 1,
    merksatz: "Forming – Storming – Norming – Performing – Adjourning.",
    bau(R, c) {
      const alle = [
        ["Die Beteiligten lernen sich kennen, sind höflich und zurückhaltend; Ziele und Rollen sind noch unklar.", "Forming"],
        ["Es kommt zu Konflikten über Rollen, Zuständigkeiten und den richtigen Weg.", "Storming"],
        ["Das Team einigt sich auf Regeln und Arbeitsweisen, die Zusammenarbeit wird verbindlich.", "Norming"],
        ["Das Team arbeitet eingespielt und produktiv, Probleme werden selbstständig gelöst.", "Performing"],
        ["Das Projekt endet, das Team löst sich auf, Ergebnisse werden gesichert.", "Adjourning"]
      ];
      const paare = R.waehleN(alle, 4);
      const phase = R.waehle(["Storming", "Norming", "Forming"]);
      const rat = {
        Forming: [["Ziele klären", "Rollen festlegen", "Kick-off", "Erwartungen abstimmen", "vorstellen"]],
        Storming: [["moderieren", "Konflikte offen ansprechen", "Rollen und Zuständigkeiten klären",
          "Spielregeln vereinbaren", "vermitteln", "Konflikt nicht aussitzen"]],
        Norming: [["Regeln festhalten", "Arbeitsweise dokumentieren", "Verantwortung übertragen",
          "Vereinbarungen einhalten", "Selbstorganisation fördern"]]
      }[phase];

      return {
        situation: `Für das Projektteam der ${c.firma} beschreibt die Projektleitung die Zusammenarbeit ` +
          `mit dem Phasenmodell nach Tuckman.`,
        prompt: "Ordnen Sie die Beschreibungen den Phasen zu und leiten Sie eine Handlung ab.",
        felder: [
          { typ: "zuordnung", label: "Beschreibung → Phase", be: 4,
            optionen: ["Forming", "Storming", "Norming", "Performing", "Adjourning"], paare },
          { typ: "text", label: `Das Team befindet sich in der Phase „${phase}“. Was sollte die Projektleitung jetzt tun? Begründen Sie.`,
            be: 2.5, zeilen: 3, satzbau: true, minWorte: 10, erwartet: rat },
          { typ: "text", label: "Warum ist die Storming-Phase nicht grundsätzlich schlecht?", be: 1.5, zeilen: 3,
            satzbau: true, minWorte: 8,
            erwartet: [["Konflikte klären Rollen", "notwendig für die Entwicklung", "Positionen werden geklärt",
              "danach tragfähige Regeln", "unterdrückte Konflikte brechen später aus", "normale Phase"]] }
        ],
        loesung: paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nDie Phasen nach Tuckman: Forming (Orientierung) – Storming (Konflikt) – Norming (Regelbildung) –
Performing (Leistung) – Adjourning (Auflösung).

In der Phase „${phase}“ ist die Projektleitung gefragt: ${rat[0].slice(0, 3).join(", ")} —
damit das Team aus der aktuellen Phase in die nächste kommt und arbeitsfähig wird.

Die Storming-Phase ist kein Betriebsunfall, sondern notwendig: In ihr werden Rollen, Einfluss und
Arbeitsweise ausgehandelt. Wird der Konflikt unterdrückt statt moderiert, bricht er später und
meist ungünstiger wieder auf.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-testprotokoll", thema: "projekt", sub: "Testprotokoll & Abnahme",
    titel: "Testfälle und Testprotokoll", stufe: 2,
    merksatz: "Ein Testfall braucht: Vorbedingung, Eingabe, erwartetes Ergebnis. Das Protokoll ergänzt tatsächliches Ergebnis, Bewertung, Datum und Tester.",
    bau(R, c) {
      const gegenstand = R.waehle([
        "die Anmeldung am neuen Portal", "der Druck aus der Fachanwendung",
        "der VPN-Zugang aus dem Homeoffice", "die Übernahme der Stammdaten aus dem Altsystem"]);
      return {
        situation: `Vor der Abnahme prüft die ${c.firma}, ob ${gegenstand} wie vereinbart funktioniert. ` +
          `Die Ergebnisse werden in einem Testprotokoll festgehalten.`,
        prompt: "Bearbeiten Sie die Aufgaben zum Testen und zur Abnahme.",
        felder: [
          { typ: "liste", label: "Nennen Sie vier Angaben, die ein Testprotokoll enthalten muss",
            be: 4, zeilen: 5, noetig: 4, satzbau: false,
            erwartet: [
              ["Testfallnummer", "Bezeichnung des Testfalls", "eindeutige ID"],
              ["Vorbedingung", "Ausgangszustand", "Testumgebung", "Testdaten"],
              ["durchgeführte Schritte", "Eingabe", "Testschritte", "Vorgehen"],
              ["erwartetes Ergebnis", "Sollergebnis"],
              ["tatsächliches Ergebnis", "Istergebnis", "beobachtetes Verhalten"],
              ["Bewertung", "bestanden oder nicht bestanden", "Status", "OK/Fehler"],
              ["Datum und Uhrzeit", "Zeitpunkt der Durchführung"],
              ["Name des Testers", "Prüfer", "Durchführender"],
              ["Version des Prüfgegenstands", "Softwarestand", "Release"],
              ["Fehlerbeschreibung", "Abweichung", "Ticketnummer"]
            ] },
          { typ: "text", label: `Formulieren Sie einen Testfall für ${gegenstand}: Vorbedingung, Eingabe, erwartetes Ergebnis`,
            be: 3, zeilen: 4, satzbau: true, minWorte: 8, noetig: 3,
            erwartet: [
              ["Vorbedingung", "Voraussetzung", "Ausgangslage", "angemeldet", "vorhanden", "eingerichtet"],
              ["Eingabe", "eingeben", "aufrufen", "klicken", "auswählen", "starten", "Schritt"],
              ["erwartetes Ergebnis", "erwartet wird", "soll", "Ergebnis", "Meldung", "erscheint"]
            ] },
          { typ: "text", label: "Warum wird die Abnahme schriftlich dokumentiert?", be: 1.5, zeilen: 3,
            satzbau: true, minWorte: 8,
            erwartet: [["Nachweis der erbrachten Leistung", "Rechtssicherheit", "Beweis", "Gewährleistungsfrist beginnt",
              "Zahlung wird fällig", "Grundlage bei Streit", "nachvollziehbar", "Mängel dokumentiert"]] }
        ],
        loesung:
`Ein Testprotokoll enthält mindestens: Testfallnummer und Bezeichnung, Vorbedingung bzw. Testumgebung
und Testdaten, die durchgeführten Schritte (Eingaben), das erwartete Ergebnis, das tatsächliche
Ergebnis, die Bewertung (bestanden / nicht bestanden), Datum und Uhrzeit, den Namen des Testers
sowie die Version des Prüfgegenstands. Abweichungen werden mit Fehlerbeschreibung und Ticketnummer
festgehalten.

Beispiel-Testfall für ${gegenstand}:
• Vorbedingung: Benutzerkonto ist angelegt und freigeschaltet, Testrechner ist im Firmennetz.
• Eingabe: Benutzername und gültiges Kennwort eingeben, auf „Anmelden“ klicken.
• Erwartetes Ergebnis: Die Startseite wird innerhalb von drei Sekunden mit dem Namen des Benutzers angezeigt.

Die Abnahme wird schriftlich dokumentiert, weil mit ihr die Leistung als erbracht gilt: Die Zahlung
wird fällig, die Gewährleistungsfrist beginnt, und im Streitfall ist nachweisbar, was geprüft wurde
und welche Mängel offen geblieben sind.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-dateisystem", thema: "arbeitsplatz", sub: "Dateisysteme",
    titel: "Dateisystem auswählen", stufe: 1,
    bau(R, c) {
      const alle = [
        ["Standard-Dateisystem moderner Windows-Systeme, unterstützt Rechteverwaltung und Journaling", "NTFS"],
        ["Verbreitetes Journaling-Dateisystem unter Linux", "ext4"],
        ["Sehr kompatibel, aber Dateien dürfen höchstens 4 GB groß sein", "FAT32"],
        ["Für große Wechseldatenträger, von Windows, macOS und Linux lesbar, ohne Journaling", "exFAT"],
        ["Dateisystem von macOS mit Snapshots und Verschlüsselung", "APFS"]
      ];
      const paare = R.waehleN(alle, 4);
      const fall = R.waehle([
        { txt: "Ein USB-Stick soll Videodateien von 12 GB zwischen Windows-, macOS- und Linux-Rechnern transportieren.",
          wahl: "exFAT",
          warum: [["über 4 GB möglich", "keine 4-GB-Grenze", "große Dateien"],
                  ["von allen Systemen lesbar", "plattformübergreifend", "Windows macOS Linux"]] },
        { txt: "Auf einem Windows-Dateiserver sollen Zugriffsrechte je Abteilung vergeben und Änderungen protokolliert werden.",
          wahl: "NTFS",
          warum: [["Rechteverwaltung", "ACL", "Berechtigungen je Benutzer", "Zugriffsrechte"],
                  ["Journaling", "Protokollierung", "Ausfallsicherheit", "Verschlüsselung möglich"]] }
      ]);

      return {
        situation: `Bei der ${c.firma} ist für zwei Einsatzzwecke ein Dateisystem festzulegen. ` +
          `Konkret geht es um folgenden Fall: ${fall.txt}`,
        prompt: "Ordnen Sie die Dateisysteme zu und wählen Sie für den beschriebenen Fall das passende aus.",
        felder: [
          { typ: "zuordnung", label: "Beschreibung → Dateisystem", be: 4,
            optionen: ["NTFS", "ext4", "FAT32", "exFAT", "APFS"], paare },
          { typ: "auswahl", label: "Passendes Dateisystem für den beschriebenen Fall", be: 1,
            optionen: ["NTFS", "ext4", "FAT32", "exFAT"], loesung: fall.wahl },
          { typ: "liste", label: "Zwei Begründungen für Ihre Wahl", be: 3, zeilen: 3, noetig: 2,
            satzbau: true, minWorte: 5, erwartet: fall.warum.flat().map(x => [x]) },
          { typ: "text", label: "Was leistet ein Journaling-Dateisystem?", be: 1.5, zeilen: 3,
            satzbau: true, minWorte: 8,
            erwartet: [["protokolliert Änderungen vor dem Schreiben", "nach Absturz konsistenter Zustand",
              "schnelle Wiederherstellung", "Dateisystem bleibt konsistent", "Journal"]] }
        ],
        loesung: paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nFür den beschriebenen Fall passt ${fall.wahl}: ${fall.warum.map(x => x[0]).join("; ")}.

Ein Journaling-Dateisystem schreibt geplante Änderungen zuerst in ein Journal und führt sie dann
aus. Nach einem Absturz oder Stromausfall muss nicht die gesamte Platte geprüft werden — anhand des
Journals wird der letzte konsistente Zustand in kurzer Zeit wiederhergestellt.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.nennVorlage({
    id: "kat-domaene", thema: "arbeitsplatz", sub: "Domäne & Verzeichnisdienst",
    titel: "Domäne statt Arbeitsgruppe", stufe: 2,
    merksatz: "Arbeitsgruppe = jedes Gerät verwaltet seine eigenen Konten. Domäne = ein Verzeichnisdienst verwaltet zentral Konten, Rechte und Richtlinien.",
    n: [3],
    situation: (R, c) => `Die ${c.firma} ist auf ${c.mitarbeiter} Beschäftigte gewachsen. Bisher sind alle ` +
      `Rechner in einer Arbeitsgruppe organisiert: Benutzerkonten und Kennwörter werden auf jedem Gerät ` +
      `einzeln gepflegt. Die Geschäftsführung erwägt die Einführung einer Domäne mit Verzeichnisdienst.`,
    frage: (n, c) => `Nennen Sie ${Z[n]} Vorteile einer Domäne gegenüber der Arbeitsgruppe und erläutern Sie jeweils in einem Satz.`,
    pool: [
      ["zentrale Benutzerverwaltung", "Konten an einer Stelle", "ein Konto für alle Rechner", "Single Sign-on"],
      ["zentrale Rechtevergabe", "Gruppen und Rollen", "Berechtigungskonzept zentral", "Zugriffsrechte an einer Stelle"],
      ["Gruppenrichtlinien", "GPO", "einheitliche Einstellungen ausrollen", "Richtlinien zentral durchsetzen"],
      ["zentrale Softwareverteilung", "Software automatisch installieren", "Updates zentral verteilen"],
      ["schnelles Sperren beim Austritt", "ein Konto deaktivieren genügt", "Offboarding", "sofortiger Entzug aller Rechte"],
      ["einheitliche Passwortrichtlinie", "Kennwortrichtlinie zentral erzwingen"],
      ["Nachvollziehbarkeit", "zentrale Protokollierung", "Anmeldungen nachvollziehbar"],
      ["schnellere Einrichtung neuer Arbeitsplätze", "Anmeldung an jedem Rechner mit demselben Konto", "Roaming"]
    ],
    zusatz: (R, c) => [
      { typ: "text", label: "Nennen Sie einen Nachteil bzw. ein Risiko der Domäne", be: 1.5, zeilen: 2,
        satzbau: true, minWorte: 6,
        erwartet: [["Ausfall des Domänencontrollers", "Single Point of Failure", "Abhängigkeit vom Server",
          "höherer Einrichtungsaufwand", "Fachwissen nötig", "Lizenzkosten", "zweiter Controller nötig"]] },
      { typ: "text", label: "Welche Maßnahme sichert den Betrieb der Domäne gegen Ausfall ab?", be: 1, zeilen: 2,
        satzbau: false,
        erwartet: [["zweiter Domänencontroller", "redundanter Controller", "Replikation", "Ausfallsicherheit durch zweiten DC",
          "Backup des Verzeichnisdienstes"]] }
    ],
    loesung: (R, c, n) =>
`Vorteile einer Domäne:
• Zentrale Benutzerverwaltung — ein Konto gilt für alle Rechner, Kennwörter werden nicht mehr auf
  jedem Gerät einzeln gepflegt.
• Zentrale Rechtevergabe über Gruppen — Berechtigungen folgen der Rolle, nicht dem Gerät.
• Gruppenrichtlinien — Einstellungen und Sicherheitsvorgaben werden einheitlich durchgesetzt.
• Zentrale Softwareverteilung und Updates.
• Beim Austritt genügt das Deaktivieren eines Kontos, um sämtliche Zugänge zu sperren.
• Anmeldungen sind zentral protokolliert und damit nachvollziehbar.

Nachteil: Der Domänencontroller wird zum zentralen Ausfallpunkt — fällt er aus, ist keine Anmeldung
mehr möglich. Abhilfe: mindestens ein zweiter Domänencontroller mit Replikation, dazu regelmäßige
Sicherung des Verzeichnisdienstes.`
  });

  /* ---------------------------------------------------------------------- */
  G.nennVorlage({
    id: "kat-barrierefreiheit", thema: "arbeitsplatz", sub: "Barrierefreiheit",
    titel: "Barrierefreier IT-Arbeitsplatz", stufe: 2,
    merksatz: "Barrierefreiheit heißt: nutzbar ohne fremde Hilfe. Zwei Ebenen — der Arbeitsplatz (Hardware, Möbel) und die Software (Kontrast, Tastatur, Screenreader).",
    n: [3],
    situation: (R, c) => {
      const faelle = [
        "eine stark sehbeeinträchtigte Kollegin, die einen Screenreader nutzt",
        "einen Kollegen mit einer Rot-Grün-Sehschwäche",
        "eine Kollegin, die auf einen Rollstuhl angewiesen ist",
        "einen Kollegen, der die Maus aufgrund einer Bewegungseinschränkung nicht bedienen kann"
      ];
      return `Die ${c.firma} richtet in der Abteilung ${c.abteilung} einen Arbeitsplatz für ` +
        R.waehle(faelle) + ` ein. Der Arbeitsplatz und die eingesetzte Fachanwendung sollen barrierefrei nutzbar sein.`;
    },
    frage: (n, c) => `Nennen Sie ${Z[n]} Maßnahmen für einen barrierefreien IT-Arbeitsplatz und erläutern Sie jeweils in einem Satz, wem sie nützen.`,
    pool: [
      ["Screenreader", "Vorlesesoftware", "Sprachausgabe", "Braillezeile"],
      ["vollständige Tastaturbedienbarkeit", "ohne Maus bedienbar", "Tastaturkürzel", "sichtbarer Fokus"],
      ["ausreichender Kontrast", "Kontrastverhältnis", "Farbkontrast einhalten", "Hochkontrastmodus"],
      ["Information nicht nur über Farbe", "zusätzlich Symbol oder Text", "nicht allein farblich kodiert"],
      ["Vergrößerung", "skalierbare Schrift", "Zoom", "Bildschirmlupe", "größerer Monitor"],
      ["Alternativtexte für Bilder", "Alt-Text", "Beschriftung von Grafiken"],
      ["Untertitel und Transkripte", "Untertitel für Videos", "Gebärdensprachvideo"],
      ["höhenverstellbarer Tisch", "unterfahrbarer Schreibtisch", "Arbeitsplatz an die Person anpassen"],
      ["alternative Eingabegeräte", "Spezialtastatur", "Trackball", "Spracheingabe", "Fußschalter", "Joystick"],
      ["einfache und klare Sprache", "verständliche Beschriftung", "eindeutige Fehlermeldungen"],
      ["genügend Bewegungsfläche", "stufenloser Zugang", "breite Türen", "barrierefreier Zugang zum Raum"]
    ],
    zusatz: (R, c) => [
      { typ: "text", label: "Welche Norm bzw. Richtlinie regelt die barrierefreie Gestaltung von Webangeboten?",
        be: 1, zeilen: 1, satzbau: false,
        erwartet: [["WCAG", "Web Content Accessibility Guidelines", "BITV", "EN 301 549", "Barrierefreiheitsstärkungsgesetz", "BFSG"]] },
      { typ: "text", label: "Nennen Sie einen Vorteil, den Barrierefreiheit auch für Menschen ohne Behinderung bringt",
        be: 1.5, zeilen: 2, satzbau: true, minWorte: 8,
        erwartet: [["bessere Bedienbarkeit für alle", "auch bei Sonnenlicht lesbar", "Untertitel in lauter Umgebung",
          "hilft älteren Beschäftigten", "Tastaturbedienung ist schneller", "klarere Struktur", "bessere Usability",
          "auch mobil nutzbar"]] }
    ],
    loesung: (R, c, n) =>
`Maßnahmen am Arbeitsplatz: höhenverstellbarer, unterfahrbarer Tisch, ausreichende Bewegungsfläche,
stufenloser Zugang, alternative Eingabegeräte (Spezialtastatur, Trackball, Spracheingabe) und
ein großer, blendfreier Monitor.

Maßnahmen in der Software: vollständige Bedienbarkeit über die Tastatur mit sichtbarem Fokus,
ausreichender Farbkontrast, Informationen nie allein über Farbe vermitteln, skalierbare Schrift
und Zoom, Alternativtexte für Grafiken, Untertitel für Videos, Unterstützung von Screenreadern
und klare, verständliche Sprache.

Rechtlicher Rahmen: WCAG als internationale Richtlinie, in Deutschland umgesetzt über BITV
und EN 301 549; für viele Produkte und Dienstleistungen gilt seit 2025 das
Barrierefreiheitsstärkungsgesetz (BFSG).

Barrierefreiheit nützt allen: guter Kontrast hilft auch bei Sonnenlicht auf dem Display,
Untertitel helfen in lauter Umgebung, Tastaturbedienung ist für geübte Nutzer schneller,
und eine klare Struktur macht jede Anwendung leichter bedienbar.`
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-ergonomie", thema: "arbeitsplatz", sub: "Ergonomie & Arbeitsschutz",
    titel: "Ergonomischer Bildschirmarbeitsplatz", stufe: 1,
    bau(R, c) {
      const aussagen = R.waehleN([
        { text: "Die oberste Bildschirmzeile soll etwa auf Augenhöhe oder leicht darunter liegen.", wahr: true },
        { text: "Der Bildschirm steht am besten direkt vor einem Fenster, damit genug Licht einfällt.", wahr: false },
        { text: "Ober- und Unterarm sollen beim Tippen etwa einen rechten Winkel bilden.", wahr: true },
        { text: "Der Sehabstand zum Bildschirm sollte bei üblichen Monitoren etwa 50 bis 80 cm betragen.", wahr: true },
        { text: "Ein Arbeitsstuhl ist ergonomisch, wenn die Rückenlehne starr fixiert ist.", wahr: false },
        { text: "Die Arbeitsfläche soll mindestens 160 cm breit und 80 cm tief sein.", wahr: true },
        { text: "Bildschirmarbeit erfordert regelmäßige Unterbrechungen durch andere Tätigkeiten oder Pausen.", wahr: true },
        { text: "Die Beleuchtungsstärke am Büroarbeitsplatz sollte mindestens 500 Lux betragen.", wahr: true },
        { text: "Beschäftigte haben keinen Anspruch auf eine arbeitsmedizinische Vorsorgeuntersuchung der Augen.", wahr: false }
      ], 6);

      return {
        situation: `Die ${c.firma} richtet in der Abteilung ${c.abteilung} neue Bildschirmarbeitsplätze ein. ` +
          `Die Anforderungen ergeben sich aus dem Arbeitsschutzgesetz und der Arbeitsstättenverordnung ` +
          `(Anhang 6, Bildschirmarbeit).`,
        prompt: "Bewerten Sie die Aussagen und ergänzen Sie eigene Maßnahmen.",
        felder: [
          { typ: "aussagen", label: "Richtig oder falsch?", be: 3, aussagen },
          { typ: "liste", label: "Nennen Sie drei weitere Anforderungen an einen ergonomischen Arbeitsplatz",
            be: 3, zeilen: 4, noetig: 3, satzbau: false,
            erwartet: [
              ["höhenverstellbarer Tisch", "verstellbare Arbeitsfläche", "Sitz-Steh-Arbeitsplatz"],
              ["höhenverstellbarer Stuhl", "dynamisches Sitzen", "verstellbare Rückenlehne", "Bürodrehstuhl"],
              ["blendfreier Bildschirm", "matte Oberfläche", "Bildschirm seitlich zum Fenster", "keine Spiegelung"],
              ["ausreichende Beleuchtung", "500 Lux", "blendfreie Leuchten", "Tageslicht"],
              ["separate Tastatur und Maus", "flache Tastatur", "Handballenauflage", "getrennte Eingabegeräte"],
              ["ausreichend große Arbeitsfläche", "Beinfreiheit", "Platz für Unterlagen"],
              ["Lärmschutz", "geringer Geräuschpegel", "Raumakustik"],
              ["Raumklima", "Lüftung", "Temperatur", "Luftfeuchtigkeit"],
              ["Pausen und Tätigkeitswechsel", "Bildschirmpausen", "Mischarbeit"],
              ["Unterweisung der Beschäftigten", "Einweisung in die Einstellung", "arbeitsmedizinische Vorsorge"]
            ] },
          { typ: "text", label: "Warum liegt Ergonomie auch im Interesse des Arbeitgebers?", be: 1.5, zeilen: 3,
            satzbau: true, minWorte: 8,
            erwartet: [["weniger Krankheitstage", "geringere Ausfallzeiten", "höhere Produktivität",
              "gesetzliche Pflicht", "weniger Fehler", "Mitarbeiterbindung", "Kosten durch Ausfall"]] }
        ],
        loesung:
          aussagen.map(a => (a.wahr ? "richtig" : "falsch") + " — " + a.text).join("\n") +
`\n\nWeitere Anforderungen: höhenverstellbarer Tisch (besser: Sitz-Steh-Arbeitsplatz) und Bürodrehstuhl
mit dynamischer Rückenlehne, blendfreier Bildschirm im rechten Winkel zum Fenster, Beleuchtung von
mindestens 500 Lux, separate flache Tastatur und Maus mit Auflagefläche, ausreichende Arbeitsfläche
und Beinfreiheit, angenehmes Raumklima und Akustik sowie Tätigkeitswechsel und regelmäßige Pausen.
Dazu kommen Unterweisung und das Angebot arbeitsmedizinischer Vorsorge für die Augen.

Für den Arbeitgeber ist das nicht nur Pflicht nach ArbSchG und ArbStättV: Ergonomische Arbeitsplätze
senken Fehlzeiten und Fehler, halten die Leistungsfähigkeit hoch und binden Fachkräfte.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.vorlage({
    id: "kat-support", thema: "arbeitsplatz", sub: "Support & Ticketsystem",
    titel: "Störungsannahme und Eskalation", stufe: 2,
    merksatz: "Priorität = Auswirkung × Dringlichkeit. First Level nimmt an und löst Bekanntes, Second Level analysiert, Third Level ist Hersteller oder Spezialist.",
    bau(R, c) {
      const faelle = R.waehleN([
        ["Der zentrale Warenwirtschaftsserver ist ausgefallen, 120 Beschäftigte können nicht arbeiten.", "sehr hoch"],
        ["Ein einzelner Drucker im Lager druckt nicht, ein Ersatzdrucker steht daneben.", "niedrig"],
        ["Die Buchhaltung kann am letzten Tag des Monatsabschlusses keine Rechnungen freigeben.", "hoch"],
        ["Eine Kollegin möchte eine zusätzliche Software installiert bekommen, ohne Termindruck.", "niedrig"],
        ["Der VPN-Zugang funktioniert für alle Beschäftigten im Homeoffice nicht.", "sehr hoch"],
        ["Bei einem Mitarbeiter ist die Maus defekt, Ersatzgeräte sind im Lager vorhanden.", "niedrig"]
      ], 4);

      return {
        situation: `Der IT-Support der ${c.firma} nimmt Störungen über ein Ticketsystem an. Die Priorität ` +
          `ergibt sich aus der Auswirkung (wie viele sind betroffen?) und der Dringlichkeit ` +
          `(wie schnell muss es gelöst sein?).`,
        prompt: "Priorisieren Sie die Meldungen und beschreiben Sie den Ablauf.",
        felder: [
          { typ: "zuordnung", label: "Meldung → Priorität", be: 4,
            optionen: ["sehr hoch", "hoch", "niedrig"], paare: faelle },
          { typ: "liste", label: "Nennen Sie vier Angaben, die bei der Ticketannahme erfasst werden müssen",
            be: 4, zeilen: 5, noetig: 4, satzbau: false,
            erwartet: [
              ["Name und Erreichbarkeit des Melders", "Kontaktdaten", "Telefonnummer", "wer meldet"],
              ["Zeitpunkt der Meldung", "Datum und Uhrzeit", "wann aufgetreten"],
              ["betroffenes System", "Gerät", "Inventarnummer", "Anwendung", "Standort"],
              ["Fehlerbeschreibung", "Symptom", "genaue Beschreibung", "Fehlermeldung im Wortlaut"],
              ["Auswirkung", "wie viele betroffen", "Anzahl Betroffener"],
              ["Priorität", "Dringlichkeit", "Kategorie"],
              ["Schritte zur Reproduktion", "was wurde vorher gemacht", "seit wann"],
              ["Bearbeiter", "Zuständigkeit", "Zuweisung"]
            ] },
          { typ: "text", label: "Wann eskaliert der First Level Support ein Ticket an den Second Level? Begründen Sie.",
            be: 2, zeilen: 3, satzbau: true, minWorte: 10,
            erwartet: [["wenn die Lösung nicht bekannt ist", "Wissen oder Rechte reichen nicht",
              "vereinbarte Zeit überschritten", "SLA-Zeit läuft ab", "tiefere Analyse nötig", "kein Standardfall"]] },
          { typ: "text", label: "Wozu dient die Dokumentation gelöster Tickets in einer Wissensdatenbank?",
            be: 1.5, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["gleiche Störung schneller lösen", "Wissen bleibt erhalten", "First Level kann selbst lösen",
              "Lösungsquote steigt", "kürzere Bearbeitungszeit", "Einarbeitung neuer Kollegen", "Self-Service"]] }
        ],
        loesung:
          faelle.map(p => `• ${p[0]} → Priorität ${p[1]}`).join("\n") +
`\n\nBei der Annahme werden mindestens erfasst: Melder mit Erreichbarkeit, Zeitpunkt, betroffenes System
oder Gerät (Inventarnummer, Standort), eine genaue Fehlerbeschreibung samt Fehlermeldung im Wortlaut,
die Auswirkung (Anzahl Betroffener), die daraus abgeleitete Priorität sowie der zuständige Bearbeiter.

Eskaliert wird, wenn der First Level die Störung mit seinem Wissen, seinen Rechten oder innerhalb der
im SLA vereinbarten Zeit nicht lösen kann. Der Second Level analysiert tiefer, der Third Level ist
der Hersteller oder ein Spezialist.

Die Dokumentation in einer Wissensdatenbank sorgt dafür, dass dieselbe Störung beim nächsten Mal
sofort im First Level gelöst wird: Das verkürzt die Bearbeitungszeit, erhöht die Lösungsquote
und erleichtert die Einarbeitung neuer Kolleginnen und Kollegen.`
      };
    }
  });

  /* ---------------------------------------------------------------------- */
  G.nennVorlage({
    id: "kat-uebergabe", thema: "arbeitsplatz", sub: "Übergabe & Einweisung",
    titel: "Arbeitsplatz übergeben und einweisen", stufe: 1,
    n: [3, 4],
    situation: (R, c) => `${c.person} erhält bei der ${c.firma} einen neuen ${c.geraet} mit VPN-Zugang für ` +
      `das Homeoffice. Der Arbeitsplatz ist eingerichtet und soll nun übergeben werden.`,
    frage: (n, c) => `Nennen Sie ${Z[n]} Punkte, die bei der Übergabe und Einweisung erledigt bzw. dokumentiert werden müssen, und begründen Sie jeweils kurz.`,
    pool: [
      ["Funktionsprüfung gemeinsam mit der Nutzerin", "Abnahme durch den Nutzer", "gemeinsamer Test", "Probeanmeldung"],
      ["Übergabeprotokoll unterschreiben lassen", "Übergabe dokumentieren", "Empfang quittieren"],
      ["Inventarisierung", "Gerät im Bestand erfassen", "Seriennummer und Inventarnummer aufnehmen", "Asset Management"],
      ["Einweisung in die Bedienung", "Schulung", "Erklärung der Software", "Kurzanleitung übergeben"],
      ["Einweisung in die IT-Sicherheitsregeln", "Passwortregeln erklären", "Nutzungsrichtlinie", "Verhalten bei Verdacht"],
      ["Erstpasswort ändern lassen", "Zugangsdaten sicher übergeben", "Kennwortwechsel bei Erstanmeldung"],
      ["Datensicherung erklären", "wo Daten abzulegen sind", "Ablageort erklären", "Backup erklären"],
      ["Ansprechpartner und Supportweg nennen", "Ticketsystem erklären", "wie melde ich eine Störung"],
      ["Zubehör vollständig übergeben", "Netzteil, Tasche, Dockingstation", "Lieferumfang prüfen"],
      ["Rückgabepflichten und Nutzungsbedingungen klären", "private Nutzung regeln", "Rückgabe bei Austritt"],
      ["Dokumentation im System aktualisieren", "Konfiguration dokumentieren", "Zuordnung Gerät zu Person"]
    ],
    zusatz: (R, c) => [{
      typ: "text", label: "Warum wird die Übergabe schriftlich protokolliert?", be: 1.5, zeilen: 3,
      satzbau: true, minWorte: 8,
      erwartet: [["Nachweis über den Zustand", "Haftung geklärt", "Beweis bei Verlust oder Schaden",
        "nachvollziehbar wer welches Gerät hat", "Rückgabe belegbar", "Inventar stimmt"]]
    }],
    loesung: (R, c, n) =>
`Bei der Übergabe gehören dazu:
• Gemeinsame Funktionsprüfung — Anmeldung, Drucker, VPN und Fachanwendung werden zusammen getestet,
  damit Mängel sofort auffallen und nicht später als Störung zurückkommen.
• Einweisung in Bedienung und Sicherheitsregeln, weil ein Gerät nur so sicher ist wie sein Umgang.
• Sichere Übergabe der Zugangsdaten mit erzwungenem Kennwortwechsel bei der Erstanmeldung.
• Erklärung des Ablageorts für Daten und der Datensicherung.
• Nennung des Supportwegs (Ticketsystem, Rufnummer), damit Störungen dort landen, wo sie bearbeitet werden.
• Vollständige Übergabe des Zubehörs und Inventarisierung mit Serien- und Inventarnummer.
• Klärung von Nutzungsbedingungen und Rückgabepflichten.
• Unterschriebenes Übergabeprotokoll.

Das Protokoll ist der Nachweis darüber, wer welches Gerät in welchem Zustand mit welchem Zubehör
erhalten hat. Es klärt Haftungsfragen bei Verlust oder Beschädigung, hält das Inventar aktuell
und belegt die Rückgabe beim Austritt.`
  });

})(window.GEN);
