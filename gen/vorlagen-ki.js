/* ============================================================================
   gen/vorlagen-ki.js — die letzten beiden Prüfungsthemen ohne Aufgaben:
   Künstliche Intelligenz (≈2,2 BE je Prüfung) und Kommunikation (≈2,0 BE).
   Zusammen rund 4 BE in jeder echten AP1 — bisher im Generator gar nicht da.
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* ================================================= 1. KI-Grundbegriffe */
  G.vorlage({
    id: "ki-grundlagen", thema: "ki", sub: "KI-Grundbegriffe",
    titel: "Künstliche Intelligenz einordnen", stufe: 2,
    merksatz: "Überwachtes Lernen: die Trainingsdaten sind BESCHRIFTET, das System lernt eine " +
      "bekannte Zuordnung. Unüberwachtes Lernen: keine Beschriftung, das System sucht selbst " +
      "Gruppen und Auffälligkeiten. Bestärkendes Lernen: Belohnung für gute Entscheidungen.",
    bau(R, c) {
      const paare = R.mische([
        ["Aus 5.000 beschrifteten Rechnungsbildern lernt das System, Rechnungen von Lieferscheinen zu unterscheiden.", "überwachtes Lernen"],
        ["Das System gruppiert Kundendaten selbstständig, ohne dass jemand die Gruppen vorgegeben hat.", "unüberwachtes Lernen"],
        ["Ein Steuerungsprogramm bekommt für jede gute Entscheidung eine Belohnung und verbessert sich dadurch.", "bestärkendes Lernen"],
        ["Ein Sprachmodell erzeugt aus einer Eingabe neuen Text.", "generative KI"],
        ["Ein starres Programm arbeitet feste Wenn-Dann-Regeln ab, die Menschen aufgeschrieben haben.", "keine KI, regelbasiertes System"]
      ]);
      const aussagen = R.mische([
        { t: "Die Qualität der Trainingsdaten bestimmt die Qualität der Ergebnisse.", wahr: true },
        { t: "Ein KI-System liefert immer nachvollziehbare Begründungen für seine Entscheidungen.", wahr: false },
        { t: "Ein Sprachmodell kann sachlich falsche Aussagen erzeugen, die richtig klingen.", wahr: true },
        { t: "Sind die Trainingsdaten einseitig, gibt das System diese Einseitigkeit weiter.", wahr: true },
        { t: "KI-Ergebnisse müssen vor der Verwendung nicht geprüft werden.", wahr: false },
        { t: "Personenbezogene Daten dürfen ohne Weiteres in ein öffentliches KI-Werkzeug eingegeben werden.", wahr: false }
      ]).slice(0, 5);
      const anzahl = R.stufe(2000, 40000, 500);
      const falschQuote = R.waehle([3, 5, 8, 12]);
      const falsch = Math.round(anzahl * falschQuote / 100);

      return {
        situation:
`Die ${c.firma} prüft den Einsatz eines KI-Systems, das eingehende Belege automatisch einsortiert.
Der Anbieter hat das System mit ${f.kurz(anzahl)} Beispielbelegen trainiert. Bei einem Test stellt
die Abteilung ${c.abteilung} fest, dass ${f.kurz(falschQuote)} % der Belege falsch einsortiert werden.`,
        prompt: "Ordnen Sie die Begriffe zu und beurteilen Sie den Einsatz.",
        felder: [
          { typ: "zuordnung", label: "Beispiel → Verfahren", be: 5,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "zahl", label: `Wie viele der ${f.kurz(anzahl)} Belege wären bei ${f.kurz(falschQuote)} % Fehlerquote falsch einsortiert?`,
            einheit: "Belege", be: 2, dez: 0, loesung: falsch },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 8,
            label: "Nennen Sie drei Bedingungen, die vor dem Einsatz erfüllt sein müssen",
            erwartet: [
              ["die Ergebnisse werden von einem Menschen geprüft", "Vier-Augen-Prinzip", "Kontrolle durch Beschäftigte", "menschliche Endkontrolle"],
              ["die Trainingsdaten sind repräsentativ und aktuell", "gute Datenqualität", "Daten passen zum eigenen Einsatzfall"],
              ["Datenschutz ist geklärt", "keine personenbezogenen Daten ohne Rechtsgrundlage", "Auftragsverarbeitungsvertrag mit dem Anbieter"],
              ["die Beschäftigten werden geschult", "Einweisung in die Grenzen des Systems"],
              ["es gibt eine Rückfallebene bei Ausfall oder Fehlern", "manuelle Bearbeitung bleibt möglich"],
              ["der Betriebsrat wird beteiligt", "Mitbestimmung geklärt"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(32) + p[0]).join("\n") +

`\n\nFehlerhafte Belege:
  ${f.kurz(anzahl)} × ${f.kurz(falschQuote)} % = ${f.kurz(anzahl)} × ${f.kurz(falschQuote / 100)} = ${f.kurz(falsch)} Belege

Das klingt nach wenig, sind aber ${f.kurz(falsch)} Vorgänge, die jemand von Hand
finden und korrigieren muss. Deshalb gehört zu jeder Einführung die Frage:
Was kostet ein einzelner Fehler, und wer bemerkt ihn?

Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nBedingungen vor dem Einsatz:
  • Endkontrolle durch Menschen — die Verantwortung bleibt beim Betrieb
  • Trainingsdaten passend, aktuell und repräsentativ
  • Datenschutz geklärt: keine personenbezogenen Daten ohne Rechtsgrundlage,
    Auftragsverarbeitungsvertrag nach Art. 28 DSGVO mit dem Anbieter
  • Beschäftigte schulen, auch über die Grenzen des Systems
  • Rückfallebene für Ausfall und Zweifelsfälle
  • Betriebsrat beteiligen, wenn Leistung oder Verhalten messbar werden

Der wichtigste Merksatz: ein KI-System trifft keine Entscheidung, für die es
haftet. Die Verantwortung bleibt beim Unternehmen.`
      };
    }
  });

  /* ================================================== 2. Bias / Datenqualität */
  G.vorlage({
    id: "ki-bias", thema: "ki", sub: "Trainingsdaten & Verzerrung",
    titel: "Verzerrte Trainingsdaten erkennen", stufe: 3,
    merksatz: "Ein KI-System kann nur das, was in den Trainingsdaten steckt. Fehlt eine Gruppe " +
      "in den Daten, arbeitet das System bei dieser Gruppe schlechter — und niemand merkt es, " +
      "solange man nur die Gesamtquote anschaut.",
    bau(R, c) {
      const fall = R.waehle([
        { was: "die Vorauswahl von Bewerbungen", daten: "die Einstellungen der letzten 15 Jahre",
          problem: "In der Vergangenheit wurden überwiegend Männer eingestellt. Das System lernt diese Auswahl als „richtig“ und benachteiligt Frauen weiter.",
          recht: "Das verstößt gegen das Allgemeine Gleichbehandlungsgesetz (AGG)." },
        { was: "die Erkennung defekter Bauteile", daten: "Aufnahmen aus nur einer Produktionslinie",
          problem: "Bauteile der anderen Linien sehen anders aus. Das System erkennt dort Fehler schlechter, obwohl die Gesamtquote gut aussieht.",
          recht: "Fehlerhafte Ware gelangt zum Kunden — Gewährleistung und Ruf stehen im Risiko." },
        { was: "die Einstufung von Support-Tickets", daten: "Tickets aus dem deutschsprachigen Support",
          problem: "Englischsprachige Tickets werden falsch einsortiert und landen in der falschen Warteschlange.",
          recht: "Vereinbarte Reaktionszeiten (SLA) werden gerissen." }
      ]);
      const gesamt = R.stufe(85, 96, 1);
      const gruppe = R.stufe(52, 74, 1);

      return {
        situation:
`Die ${c.firma} setzt ein KI-System für ${fall.was} ein. Trainiert wurde es mit ${fall.daten}.

Bei der Auswertung zeigt sich:
    Trefferquote insgesamt                    ${f.kurz(gesamt)} %
    Trefferquote in einer einzelnen Gruppe    ${f.kurz(gruppe)} %`,
        prompt: "Beurteilen Sie den Befund und schlagen Sie Maßnahmen vor.",
        felder: [
          { typ: "zahl", label: "Um wie viele Prozentpunkte liegt die Gruppe unter dem Gesamtwert?",
            einheit: "Prozentpunkte", be: 1, dez: 0, loesung: gesamt - gruppe },
          { typ: "text", be: 3, zeilen: 5, satzbau: true, minWorte: 10,
            label: "Erklären Sie, wie es zu diesem Unterschied kommt",
            erwartet: [
              ["die Trainingsdaten bilden diese Gruppe nicht oder zu wenig ab", "Gruppe fehlt in den Trainingsdaten", "einseitige Datengrundlage"],
              ["das System lernt die Muster der Vergangenheit und schreibt sie fort", "Verzerrung aus den Altdaten wird übernommen", "Bias"],
              [fall.problem, fall.problem.split(".")[0]]
            ], noetig: 3 },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum reicht die Gesamtquote als Prüfmaßstab nicht aus?",
            erwartet: [
              ["ein guter Mittelwert kann eine schlechte Gruppe verdecken", "der Durchschnitt versteckt die Unterschiede", "Gesamtwert sagt nichts über einzelne Gruppen"],
              ["die Quote muss je Gruppe getrennt ausgewertet werden", "getrennte Auswertung nötig"]
            ] },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 8,
            label: "Nennen Sie drei Maßnahmen",
            erwartet: [
              ["Trainingsdaten um die fehlende Gruppe ergänzen", "Daten breiter erheben", "ausgewogene Datengrundlage herstellen"],
              ["Ergebnisse je Gruppe getrennt messen und regelmäßig prüfen", "laufende Kontrolle nach Gruppen", "Monitoring"],
              ["Entscheidungen durch Menschen prüfen lassen", "menschliche Endkontrolle", "kein automatischer Bescheid"],
              ["das System vorerst nur unterstützend einsetzen", "keine alleinige Entscheidung durch die KI"],
              ["Vorgehen dokumentieren und begründen können", "Nachvollziehbarkeit herstellen", "Rechenschaftspflicht"]
            ] }
        ],
        loesung:
`Unterschied: ${f.kurz(gesamt)} % − ${f.kurz(gruppe)} % = ${f.kurz(gesamt - gruppe)} Prozentpunkte.

Ursache:
  Trainiert wurde mit ${fall.daten}. ${fall.problem}
  Das System erfindet nichts — es setzt fort, was in den Daten steckt.
  Genau das ist mit „Bias“ gemeint: eine Verzerrung, die aus den Daten kommt
  und nicht aus dem Verfahren.

  ${fall.recht}

Warum die Gesamtquote täuscht:
  ${f.kurz(gesamt)} % klingt gut. Aber der Mittelwert wird von der großen Gruppe
  getragen, die im Training gut vertreten war. Die kleine Gruppe verschwindet
  darin. Deshalb muss man IMMER je Gruppe getrennt auswerten — sonst merkt man
  die Benachteiligung erst, wenn sich jemand beschwert.

Maßnahmen:
  • Trainingsdaten ergänzen, bis alle betroffenen Gruppen ausreichend vertreten sind
  • Quote je Gruppe messen, nicht nur insgesamt, und laufend überwachen
  • Endentscheidung bei Menschen belassen
  • System zunächst nur unterstützend einsetzen
  • Auswahl und Prüfung dokumentieren (Rechenschaftspflicht)`
      };
    }
  });

  /* =============================================== 3. KI und Datenschutz */
  G.vorlage({
    id: "ki-datenschutz", thema: "ki", sub: "KI und Datenschutz",
    titel: "KI-Werkzeuge datenschutzkonform einsetzen", stufe: 2,
    merksatz: "Was in ein öffentliches KI-Werkzeug eingegeben wird, verlässt den Betrieb. " +
      "Personenbezogene Daten und Betriebsgeheimnisse gehören dort nicht hinein — auch nicht " +
      "„nur zum Ausprobieren“.",
    bau(R, c) {
      const paare = R.mische([
        ["Ein Kundenanschreiben mit Name und Adresse wird zum Umformulieren eingefügt.", "nicht zulässig"],
        ["Der Entwurf einer allgemeinen Bedienungsanleitung wird sprachlich geglättet.", "zulässig"],
        ["Eine Fehlermeldung ohne Kundenbezug wird zur Erklärung eingegeben.", "zulässig"],
        ["Eine Bewerbungsunterlage wird zur Vorauswahl hochgeladen.", "nicht zulässig"],
        ["Auszüge aus dem internen Quellcode eines Kundenprojekts werden eingefügt.", "nicht zulässig"]
      ]);
      const aussagen = R.mische([
        { t: "Der Einsatz eines KI-Dienstes mit personenbezogenen Daten braucht eine Rechtsgrundlage.", wahr: true },
        { t: "Ein Auftragsverarbeitungsvertrag mit dem Anbieter kann erforderlich sein.", wahr: true },
        { t: "Eingaben in öffentliche KI-Dienste bleiben immer im Unternehmen.", wahr: false },
        { t: "Beschäftigte sollten eine schriftliche Nutzungsregelung erhalten.", wahr: true }
      ]);
      return {
        situation:
`In der ${c.firma} nutzen einzelne Beschäftigte der Abteilung ${c.abteilung} ein öffentlich
zugängliches KI-Werkzeug, um Texte zu formulieren. Eine Regelung dazu gibt es bisher nicht.
Sie sollen eine Handreichung vorbereiten.`,
        prompt: "Beurteilen Sie die Fälle und formulieren Sie Regeln.",
        felder: [
          { typ: "zuordnung", label: "Fall → Bewertung", be: 5,
            optionen: ["zulässig", "nicht zulässig"], paare },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 8,
            label: "Nennen Sie drei Regeln für die Handreichung",
            erwartet: [
              ["keine personenbezogenen Daten eingeben", "Namen, Adressen und Kundendaten bleiben draußen"],
              ["keine Betriebs- und Geschäftsgeheimnisse eingeben", "kein internes Material, kein Quellcode aus Kundenprojekten"],
              ["Ergebnisse immer selbst prüfen", "nichts ungeprüft übernehmen", "fachliche Kontrolle vor der Verwendung"],
              ["freigegebene Werkzeuge verwenden", "nur die von der IT freigegebenen Dienste"],
              ["kennzeichnen, wenn ein Text mit KI erstellt wurde", "Transparenz gegenüber Kunden"],
              ["im Zweifel Datenschutzbeauftragten fragen", "Rückfrage bei Unsicherheit"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum ist eine schriftliche Regelung besser als ein Verbot?",
            erwartet: [
              ["ein Verbot wird umgangen und dann heimlich genutzt", "Schatten-IT entsteht", "Beschäftigte nutzen es trotzdem, nur unkontrolliert"],
              ["eine Regelung gibt Sicherheit und macht den Nutzen weiter möglich", "klare Grenzen statt Unsicherheit", "der Nutzen bleibt, das Risiko wird begrenzt"]
            ] }
        ],
        loesung:
`Bewertung der Fälle:
` + paare.map(p => "  " + p[1].padEnd(16) + p[0]).join("\n") +

`\n\nDie Trennlinie ist einfach: Sobald personenbezogene Daten oder Betriebs- und
Geschäftsgeheimnisse in der Eingabe stehen, verlassen sie mit dem Absenden das
Unternehmen. Ob der Anbieter sie zum Weitertrainieren nutzt, steht in dessen
Bedingungen — und ist selten zu Gunsten des Nutzers geregelt.

Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nRegeln für die Handreichung:
  1. Keine personenbezogenen Daten eingeben — auch keine Namen in Beispielen.
  2. Keine Betriebs- und Geschäftsgeheimnisse, kein Kundenquellcode.
  3. Ergebnisse fachlich prüfen, bevor sie verwendet werden.
  4. Nur von der IT freigegebene Werkzeuge nutzen.
  5. Bei Unsicherheit den Datenschutzbeauftragten fragen.

Warum Regelung statt Verbot:
  Ein Verbot ändert nichts am Bedarf. Es sorgt nur dafür, dass die Werkzeuge
  privat und unbemerkt benutzt werden — dann ohne jede Kontrolle, oft vom
  privaten Gerät aus. Eine klare Regelung erhält den Nutzen und begrenzt das
  Risiko auf das, was der Betrieb überblicken kann.`
      };
    }
  });

  /* ============================================ 4. Kommunikation: Kunde */
  G.vorlage({
    id: "komm-kundengespraech", thema: "kommunikation", sub: "Kundengespräch",
    titel: "Störung dem Kunden erklären", stufe: 2,
    merksatz: "Zuerst zuhören und das Anliegen zusammenfassen, dann sachlich erklären, dann " +
      "einen konkreten nächsten Schritt mit Termin nennen. Fachbegriffe übersetzen — der Kunde " +
      "will wissen, wann er wieder arbeiten kann, nicht welches Protokoll klemmt.",
    bau(R, c) {
      const fall = R.waehle([
        { stoerung: "Ein Update hat die Warenwirtschaft lahmgelegt, die Wiederherstellung dauert etwa drei Stunden.",
          fachlich: "Rollback der fehlgeschlagenen Datenbankmigration",
          einfach: "Wir setzen das System auf den Stand von heute Morgen zurück." },
        { stoerung: "Der Server des Kunden ist wegen eines Festplattenausfalls ausgefallen, Ersatz kommt morgen.",
          fachlich: "Degraded RAID-5, Rebuild nach Austausch der Platte",
          einfach: "Eine Festplatte ist defekt. Die Daten sind vollständig da, das System läuft nur langsamer, bis die Ersatzplatte morgen eingebaut ist." },
        { stoerung: "Nach einer Umstellung erreichen die Mitarbeitenden des Kunden ihre Dateiablage nicht mehr.",
          fachlich: "Fehlerhafte Berechtigungsvererbung nach dem Verzeichnisumzug",
          einfach: "Beim Umzug der Ordner sind die Zugriffsrechte verloren gegangen. Wir setzen sie neu." }
      ]);
      const aussagen = R.mische([
        { t: "Das Anliegen des Kunden wird zunächst mit eigenen Worten zusammengefasst.", wahr: true },
        { t: "Fachbegriffe zeigen Kompetenz und sollten möglichst häufig verwendet werden.", wahr: false },
        { t: "Es wird ein konkreter nächster Schritt mit Zeitpunkt genannt.", wahr: true },
        { t: "Schuldzuweisungen an Kollegen klären die Lage für den Kunden.", wahr: false },
        { t: "Auch schlechte Nachrichten werden früh und von sich aus mitgeteilt.", wahr: true }
      ]).slice(0, 4);

      return {
        situation:
`Sie arbeiten im Support der ${c.firma}. Ein Kunde ruft aufgebracht an:

  „${fall.stoerung}“

Intern lautet die Ursache: ${fall.fachlich}.`,
        prompt: "Bereiten Sie das Gespräch vor.",
        felder: [
          { typ: "text", be: 3, zeilen: 4, satzbau: true, minWorte: 12,
            label: "Formulieren Sie die Erklärung für den Kunden — ohne Fachbegriffe",
            erwartet: [[fall.einfach].concat(fall.einfach.split(". ").filter(Boolean))] },
          { typ: "aussagen", label: "Gehört das zu einem guten Kundengespräch?", aussagen },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 8,
            label: "Nennen Sie drei Punkte, die in das Gespräch gehören",
            erwartet: [
              ["das Anliegen zusammenfassen und Verständnis zeigen", "aktiv zuhören und wiederholen, was verstanden wurde"],
              ["den Stand sachlich und ohne Fachbegriffe erklären", "verständlich schildern, was passiert ist"],
              ["einen konkreten nächsten Schritt mit Termin nennen", "sagen, wer wann was tut", "Zeitpunkt der Rückmeldung zusagen"],
              ["eine Zwischenlösung anbieten", "Behelf nennen, damit weitergearbeitet werden kann"],
              ["das Gespräch und die Zusagen dokumentieren", "im Ticket festhalten"],
              ["sich für die Störung entschuldigen", "Bedauern ausdrücken, ohne Schuldzuweisung"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum soll man auch schlechte Nachrichten früh von sich aus melden?",
            erwartet: [
              ["der Kunde kann sich darauf einstellen und selbst planen", "Planungssicherheit für den Kunden", "er kann eine Behelfslösung organisieren"],
              ["Vertrauen bleibt erhalten, statt dass der Kunde es selbst merkt", "wer es verschweigt, verliert die Glaubwürdigkeit"]
            ] }
        ],
        loesung:
`Erklärung ohne Fachbegriffe, zum Beispiel:

  „${fall.einfach}“

Fachlich richtig wäre „${fall.fachlich}“ — dem Kunden sagt das nichts.
Er hat genau zwei Fragen: Sind meine Daten sicher, und wann kann ich
wieder arbeiten? Beides beantwortet man zuerst.

Aufbau des Gesprächs:
  1. Zuhören und zusammenfassen: „Verstehe ich richtig, dass …?“
  2. Verständnis zeigen, ohne Schuld zuzuweisen.
  3. Sachlich erklären, was passiert ist — in Alltagssprache.
  4. Konkreter nächster Schritt MIT Zeitpunkt: „Ich rufe Sie um 14 Uhr an.“
  5. Wenn möglich, eine Zwischenlösung anbieten.
  6. Zusagen im Ticket dokumentieren — und dann auch einhalten.

Bewertung:
` + aussagen.map(a => "  " + (a.wahr ? "ja   " : "nein ") + a.t).join("\n") +

`\n\nSchlechte Nachrichten früh melden:
  Der Kunde kann sich einstellen, umplanen und selbst eine Behelfslösung
  organisieren. Erfährt er es dagegen erst, wenn nichts mehr geht, verliert er
  das Vertrauen — nicht wegen der Störung, sondern wegen des Schweigens.
  Störungen passieren; der Umgang damit entscheidet über die Kundenbeziehung.`
      };
    }
  });

  /* ======================================== 5. Kommunikation: Präsentation */
  G.vorlage({
    id: "komm-praesentation", thema: "kommunikation", sub: "Präsentation & Zielgruppe",
    titel: "Ergebnisse zielgruppengerecht präsentieren", stufe: 2,
    merksatz: "Die Zielgruppe entscheidet über den Inhalt: Geschäftsführung will Kosten, Nutzen " +
      "und Termin; die Fachabteilung will wissen, was sich an ihrer Arbeit ändert; die IT will " +
      "die technischen Einzelheiten. Dieselbe Folie für alle drei geht immer schief.",
    bau(R, c) {
      const paare = R.mische([
        ["Kosten, Nutzen, Amortisation und Termin", "Geschäftsführung"],
        ["Was ändert sich an meinem Arbeitsablauf, und ab wann?", "Fachabteilung"],
        ["Schnittstellen, Systemanforderungen, Wartungsaufwand", "IT-Abteilung"],
        ["Mitbestimmung, Auswirkungen auf Arbeitsplätze und Leistungskontrolle", "Betriebsrat"],
        ["Rechtsgrundlage, Verarbeitungsverzeichnis, Löschfristen", "Datenschutzbeauftragte"]
      ]);
      const minuten = R.waehle([5, 10, 15]);
      const folien = Math.round(minuten * 1.2);
      const aussagen = R.mische([
        { t: "Eine Folie enthält eine Kernaussage.", wahr: true },
        { t: "Der Vortragstext wird vollständig auf die Folie geschrieben und abgelesen.", wahr: false },
        { t: "Zahlen werden als Diagramm gezeigt, wenn es um die Größenordnung geht.", wahr: true },
        { t: "Am Ende steht eine klare Empfehlung oder Frage an die Zuhörenden.", wahr: true },
        { t: "Je mehr Details auf einer Folie stehen, desto überzeugender wirkt sie.", wahr: false }
      ]).slice(0, 4);

      return {
        situation:
`Sie haben in der ${c.firma} eine Beschaffungsentscheidung für neue Arbeitsplatzrechner
vorbereitet und sollen das Ergebnis in ${minuten} Minuten vorstellen.`,
        prompt: "Planen Sie die Präsentation.",
        felder: [
          { typ: "zuordnung", label: "Was interessiert wen?", be: 5,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "zahl", label: `Rechnen Sie mit rund 1 Folie je 50 Sekunden: wie viele Folien sind für ${minuten} Minuten sinnvoll?`,
            einheit: "Folien", be: 1, dez: 0, loesung: folien, tolAbs: 3 },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "liste", be: 4, zeilen: 5, noetig: 4, satzbau: false,
            label: "Nennen Sie die vier Teile eines sinnvollen Aufbaus, in der richtigen Reihenfolge",
            erwartet: [
              ["Ausgangslage und Ziel", "Anlass", "Problemstellung", "Einstieg mit dem Anlass"],
              ["Vorgehen und untersuchte Alternativen", "Lösungswege", "Vergleich der Angebote"],
              ["Ergebnis mit Zahlen", "Kosten und Nutzen", "Empfehlung mit Begründung"],
              ["nächste Schritte und Entscheidungsfrage", "Ausblick", "was wird jetzt gebraucht"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 10,
            label: "Sie präsentieren dasselbe Ergebnis der Geschäftsführung und der Fachabteilung. Was ändern Sie?",
            erwartet: [
              ["für die Geschäftsführung Kosten, Nutzen und Termin in den Vordergrund", "Zahlen und Entscheidung zuerst"],
              ["für die Fachabteilung die Auswirkungen auf die tägliche Arbeit", "was sich am Arbeitsplatz ändert und ab wann", "Schulung und Umstellung"]
            ] }
        ],
        loesung:
`Zielgruppen:
` + paare.map(p => "  " + p[1].padEnd(26) + p[0]).join("\n") +

`\n\nUmfang: rund 1 Folie je 50 Sekunden Redezeit
  ${minuten} min × 60 s = ${minuten * 60} s ÷ 50 s ≈ ${folien} Folien
  Lieber weniger Folien und dafür Ruhe beim Sprechen.

Aufbau in vier Teilen:
  1. Ausgangslage und Ziel — warum stehen wir hier?
  2. Vorgehen und geprüfte Alternativen — was wurde verglichen?
  3. Ergebnis mit Zahlen und Empfehlung — was kommt heraus?
  4. Nächste Schritte und die Frage, die entschieden werden soll.

Bewertung:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nGleiches Ergebnis, andere Zielgruppe:
  Geschäftsführung — Kosten, Nutzen, Amortisation, Termin. Die Empfehlung
  kommt nach vorne, die Technik bleibt im Anhang.
  Fachabteilung — was ändert sich am Arbeitsplatz, ab wann, wer schult, was
  passiert mit den alten Daten. Kosten interessieren hier kaum.

Merksatz für die Prüfung: der Inhalt bleibt, die Reihenfolge und die
Ausführlichkeit richten sich nach dem, was die Zuhörenden entscheiden müssen.`
      };
    }
  });

  /* ========================================== 6. Kommunikation: Konflikt */
  G.vorlage({
    id: "komm-konflikt", thema: "kommunikation", sub: "Konflikt & Feedback",
    titel: "Konflikt im Team ansprechen", stufe: 3,
    merksatz: "Ich-Botschaft statt Vorwurf: Beobachtung — Wirkung — Wunsch. „Mir ist aufgefallen, " +
      "dass … . Das führt bei mir dazu, dass … . Ich hätte gern, dass … .“ Kein „immer“, kein „nie“ " +
      "und keine Bewertung der Person.",
    bau(R, c) {
      const fall = R.waehle([
        { text: "Ein Kollege dokumentiert seine Tickets nicht, deshalb muss der Rest des Teams bei Rückfragen jedes Mal von vorn anfangen.",
          beob: "In den letzten zwei Wochen waren bei acht Tickets keine Lösungsschritte hinterlegt.",
          wirk: "Ich brauche dadurch bei jeder Rückfrage rund 20 Minuten länger.",
          wunsch: "Ich hätte gern, dass bei jedem abgeschlossenen Ticket kurz steht, was gemacht wurde." },
        { text: "Eine Kollegin verschiebt vereinbarte Übergabetermine kurzfristig, dadurch geraten Ihre eigenen Zusagen an Kunden in Gefahr.",
          beob: "Die letzten drei Übergabetermine wurden am selben Tag verschoben.",
          wirk: "Ich kann meine Zusagen gegenüber den Kunden dann nicht halten.",
          wunsch: "Ich hätte gern, dass Verschiebungen spätestens am Vortag angekündigt werden." },
        { text: "Im Team werden Absprachen mündlich getroffen und später unterschiedlich erinnert.",
          beob: "Bei den letzten beiden Projekten gab es je einen Streit darüber, was vereinbart war.",
          wirk: "Ich bin dadurch unsicher, welche Aufgabe wirklich bei mir liegt.",
          wunsch: "Ich hätte gern, dass Absprachen kurz im Ticket oder per Mail festgehalten werden." }
      ]);
      const aussagen = R.mische([
        { t: "Das Gespräch wird unter vier Augen und zeitnah geführt.", wahr: true },
        { t: "Der Vorwurf wird vor dem ganzen Team vorgetragen, damit alle es hören.", wahr: false },
        { t: "Es wird eine konkrete Beobachtung geschildert, keine Bewertung der Person.", wahr: true },
        { t: "Wörter wie „immer“ und „nie“ machen die Kritik deutlicher und damit besser.", wahr: false },
        { t: "Am Ende steht eine gemeinsame Vereinbarung.", wahr: true }
      ]).slice(0, 4);

      return {
        situation: `In Ihrem Team in der ${c.firma}: ${fall.text}\n\nSie möchten das ansprechen.`,
        prompt: "Bereiten Sie das Gespräch nach dem Schema Beobachtung – Wirkung – Wunsch vor.",
        felder: [
          { typ: "raster", label: "Ich-Botschaft aufbauen",
            kopf: ["Teil", "Ihre Formulierung"],
            zeilen: [
              { zellen: [{ t: "Beobachtung — was ist konkret passiert?" },
                         { eingabe: true, text: [fall.beob].concat(fall.beob.split(", ")), be: 1 }] },
              { zellen: [{ t: "Wirkung — was löst das bei Ihnen aus?" },
                         { eingabe: true, text: [fall.wirk].concat(fall.wirk.split(", ")), be: 1 }] },
              { zellen: [{ t: "Wunsch — was soll künftig anders sein?" },
                         { eingabe: true, text: [fall.wunsch].concat(fall.wunsch.split(", ")), be: 1 }] }
            ] },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum ist die Ich-Botschaft wirksamer als „Du dokumentierst nie richtig“?",
            erwartet: [
              ["ein Vorwurf führt zu Rechtfertigung und Abwehr", "die andere Person geht in Verteidigung", "Angriff erzeugt Gegenangriff"],
              ["die Ich-Botschaft beschreibt die eigene Wahrnehmung und ist nicht bestreitbar", "über die eigene Wirkung kann man nicht streiten", "sie bleibt bei der Sache statt bei der Person"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Was tun Sie, wenn das Gespräch trotzdem nichts ändert?",
            erwartet: [
              ["das Gespräch wiederholen und die Vereinbarung festhalten", "erneut ansprechen, diesmal schriftlich festhalten"],
              ["dann die Führungskraft einbeziehen", "Vorgesetzten hinzuziehen", "Eskalation über den nächsthöheren Schritt"]
            ] }
        ],
        loesung:
`Ich-Botschaft in drei Teilen:

  Beobachtung  ${fall.beob}
  Wirkung      ${fall.wirk}
  Wunsch       ${fall.wunsch}

Was den Unterschied macht:
  • konkrete Zahl statt „immer“ und „nie“ — darüber lässt sich nicht streiten
  • die eigene Wirkung statt einer Bewertung der Person
  • ein Wunsch für die Zukunft statt einer Anklage über die Vergangenheit

Rahmen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nWarum keine Du-Botschaft:
  „Du dokumentierst nie richtig“ ist ein Angriff auf die Person und noch dazu
  bestreitbar — die andere Seite wird sofort Gegenbeispiele suchen, statt
  zuzuhören. Eine Ich-Botschaft beschreibt die eigene Wahrnehmung; die kann
  niemand widerlegen. Damit bleibt das Gespräch bei der Sache.

Wenn sich nichts ändert:
  Zweites Gespräch führen und die Vereinbarung diesmal schriftlich festhalten
  (Mail oder Ticket). Bleibt es dabei, wird die Führungskraft einbezogen —
  sachlich, mit den dokumentierten Vorfällen, nicht als Beschwerde über die
  Person.`
      };
    }
  });

})(window.GEN);
