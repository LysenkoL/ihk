/* ============================================================================
   gen/vorlagen-fachthemen.js — die restlichen Lücken aus Lenas Themenliste:
   Datenbanken (Normalisierung, Relationenmodell, SQL lesen),
   Softwareentwicklung (Programmiersprachen, Webtechnologien),
   Wirtschaftlichkeit (Marktformen, Darlehen, Kostenrechnung),
   Speicherung (JBOD, Dateiformate, Datenkonvertierung),
   Projektmanagement (SMART, Stakeholder, Projektphasen, Anforderungen,
   Make-or-Buy), Recht (Arbeitsrecht, Vertragsarten).
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* ============================================ 1. Normalisierung ====== */
  const NORM_FAELLE = [
    {
      thema: "Bestellungen",
      kopf: ["BestellNr", "Datum", "KundenNr", "Kundenname", "Kundenort", "Artikel"],
      zeilen: [
        ["1001", "03.02.", "K-17", "Meier GmbH", "Halle", "Maus, Tastatur, Monitor"],
        ["1002", "04.02.", "K-23", "Sauer KG", "Erfurt", "Notebook, Dockingstation"],
        ["1003", "05.02.", "K-17", "Meier GmbH", "Halle", "Headset"]
      ],
      verstoss1: "In der Spalte Artikel stehen mehrere Werte in einer Zelle.",
      verstoss3: "Kundenname und Kundenort hängen von der KundenNr ab, nicht von der BestellNr.",
      tabellen: [
        "Kunde(KundenNr, Kundenname, Kundenort)",
        "Bestellung(BestellNr, Datum, KundenNr→Kunde)",
        "Bestellposition(BestellNr→Bestellung, ArtikelNr→Artikel, Menge)",
        "Artikel(ArtikelNr, Bezeichnung)"
      ]
    },
    {
      thema: "Schulungen",
      kopf: ["SchulungNr", "Titel", "DozentNr", "Dozentname", "Dozenttelefon", "Teilnehmer"],
      zeilen: [
        ["S-01", "IT-Sicherheit", "D-4", "Frau Ott", "0341-2211", "Lena, Timo, Kai"],
        ["S-02", "Datenschutz", "D-7", "Herr Bode", "0341-2244", "Timo, Sara"],
        ["S-03", "Netzwerke", "D-4", "Frau Ott", "0341-2211", "Kai"]
      ],
      verstoss1: "In der Spalte Teilnehmer stehen mehrere Namen in einer Zelle.",
      verstoss3: "Dozentname und Dozenttelefon hängen von der DozentNr ab, nicht von der SchulungNr.",
      tabellen: [
        "Dozent(DozentNr, Dozentname, Dozenttelefon)",
        "Schulung(SchulungNr, Titel, DozentNr→Dozent)",
        "Teilnahme(SchulungNr→Schulung, PersonalNr→Person)",
        "Person(PersonalNr, Name)"
      ]
    },
    {
      thema: "Gerätezuordnung",
      kopf: ["GeräteNr", "Gerätetyp", "RaumNr", "Raumbezeichnung", "Etage", "Software"],
      zeilen: [
        ["G-110", "Notebook", "2.14", "Konstruktion", "2", "CAD, Office"],
        ["G-111", "Monitor", "2.14", "Konstruktion", "2", "—"],
        ["G-205", "Notebook", "1.03", "Empfang", "1", "Office, Kassensystem"]
      ],
      verstoss1: "In der Spalte Software stehen mehrere Programme in einer Zelle.",
      verstoss3: "Raumbezeichnung und Etage hängen von der RaumNr ab, nicht von der GeräteNr.",
      tabellen: [
        "Raum(RaumNr, Raumbezeichnung, Etage)",
        "Gerät(GeräteNr, Gerätetyp, RaumNr→Raum)",
        "Installation(GeräteNr→Gerät, SoftwareNr→Software)",
        "Software(SoftwareNr, Bezeichnung)"
      ]
    }
  ];

  G.vorlage({
    id: "db-normalisierung", thema: "datenbank", sub: "Relationale Modellierung & Normalisierung",
    titel: "Normalisierung bis zur 3. Normalform", stufe: 3,
    merksatz: "1. NF: keine Mehrfachwerte in einer Zelle. 2. NF: jedes Nicht-Schlüsselfeld hängt " +
      "vom GANZEN Schlüssel ab (nur bei zusammengesetzten Schlüsseln ein Thema). 3. NF: kein " +
      "Nicht-Schlüsselfeld hängt von einem anderen Nicht-Schlüsselfeld ab. Merksatz aus der " +
      "Prüfung: alles hängt vom Schlüssel ab, vom ganzen Schlüssel und von nichts als dem Schlüssel.",
    bau(R, c) {
      const fall = R.waehle(NORM_FAELLE);
      return {
        situation:
`Die ${c.firma} verwaltet ${fall.thema} bisher in einer einzigen Tabelle:`,
        prompt: "Prüfen Sie die Tabelle auf die Normalformen und überführen Sie sie in die 3. Normalform.",
        tabellen: [{ titel: "Ausgangstabelle", kopf: fall.kopf, zeilen: fall.zeilen }],
        felder: [
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            label: "Gegen welche Bedingung der 1. Normalform verstößt die Tabelle? Nennen Sie die betroffene Spalte.",
            erwartet: [[fall.verstoss1, "mehrere Werte in einer Zelle", "nicht atomar", "Mehrfachwerte in einem Feld"]] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            label: "Welcher Verstoß gegen die 3. Normalform liegt vor?",
            erwartet: [[fall.verstoss3, "transitive Abhängigkeit", "Nicht-Schlüsselfeld hängt von einem anderen Nicht-Schlüsselfeld ab"]] },
          { typ: "liste", be: 4, zeilen: 5, noetig: 4, satzbau: false,
            label: "Schreiben Sie die Tabellen der 3. Normalform auf — je Zeile eine Tabelle mit Primärschlüssel und Fremdschlüsseln",
            erwartet: fall.tabellen.map(t => [t, t.split("(")[0]]) },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Welche zwei Probleme vermeidet die Normalisierung? Nennen Sie sie mit Fachbegriff.",
            erwartet: [
              ["Redundanz, dieselben Daten stehen mehrfach", "doppelte Speicherung derselben Angaben"],
              ["Anomalien beim Ändern, Einfügen oder Löschen", "Änderungsanomalie", "Löschanomalie", "Inkonsistenz durch halb geänderte Daten"]
            ] }
        ],
        loesung:
`Die drei Normalformen:
  1. NF  Alle Werte sind atomar — eine Zelle, ein Wert.
  2. NF  1. NF erfüllt UND jedes Nicht-Schlüsselfeld hängt vom vollständigen
         Schlüssel ab (nur bei zusammengesetzten Schlüsseln überhaupt ein Thema).
  3. NF  2. NF erfüllt UND kein Nicht-Schlüsselfeld hängt von einem anderen
         Nicht-Schlüsselfeld ab (keine transitiven Abhängigkeiten).

Verstoß gegen die 1. NF:
  ${fall.verstoss1}
  → die Spalte wird in eine eigene Zeile je Wert aufgelöst.

Verstoß gegen die 3. NF:
  ${fall.verstoss3}
  → diese Angaben wandern in eine eigene Tabelle, verbunden über einen Fremdschlüssel.

Ergebnis in 3. Normalform:
` + fall.tabellen.map(t => "  " + t).join("\n") +
`\n  (unterstrichen = Primärschlüssel, → = Fremdschlüssel auf die genannte Tabelle)

Wozu der Aufwand?
  • Redundanz: „${fall.kopf[3]}“ steht in der Ausgangstabelle bei jeder Zeile
    erneut. Das kostet Platz und lädt zu Tippfehlern ein.
  • Anomalien:
      Änderungsanomalie – zieht der Kunde um, muss man ALLE Zeilen ändern;
                          vergisst man eine, widersprechen sich die Daten.
      Einfügeanomalie   – ein neuer Kunde ohne Bestellung ließe sich gar nicht
                          erfassen.
      Löschanomalie     – wird die letzte Bestellung gelöscht, verschwinden auch
                          die Kundendaten.

Merksatz für die Prüfung: „Alles hängt vom Schlüssel ab, vom ganzen Schlüssel und
von nichts als dem Schlüssel.“`
      };
    }
  });

  /* ============================================ 2. SQL lesen =========== */
  G.vorlage({
    id: "db-sql-lesen", thema: "datenbank", sub: "SQL",
    titel: "SQL-Abfragen lesen und ergänzen", stufe: 2,
    merksatz: "Reihenfolge merken: SELECT (welche Spalten) – FROM (welche Tabelle) – WHERE " +
      "(welche Zeilen) – GROUP BY (zusammenfassen) – ORDER BY (sortieren). WHERE filtert " +
      "EINZELNE Zeilen, HAVING filtert GRUPPEN.",
    bau(R, c) {
      const grenze = R.stufe(500, 3000, 100);
      const abteilung = R.waehle(["Vertrieb", "Buchhaltung", "Konstruktion", "Einkauf"]);
      const jahr = R.waehle([2023, 2024, 2025]);
      const paare = R.mische([
        ["gibt an, welche Spalten ausgegeben werden", "SELECT"],
        ["gibt die Tabelle an, aus der gelesen wird", "FROM"],
        ["filtert einzelne Zeilen vor dem Gruppieren", "WHERE"],
        ["fasst Zeilen zu Gruppen zusammen", "GROUP BY"],
        ["sortiert das Ergebnis", "ORDER BY"],
        ["filtert fertige Gruppen", "HAVING"]
      ]).slice(0, 5);

      return {
        situation:
`In der Datenbank der ${c.firma} gibt es die Tabellen

    Geraet(GeraeteNr, Bezeichnung, Preis, Kaufjahr, AbteilungNr)
    Abteilung(AbteilungNr, Name)

Für die Inventur wird folgende Abfrage benutzt:

    SELECT Bezeichnung, Preis
    FROM   Geraet
    WHERE  Preis > ${f.kurz(grenze)}
    ORDER  BY Preis DESC;`,
        prompt: "Beantworten Sie die Fragen zur Abfrage.",
        felder: [
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Was gibt diese Abfrage aus? Beschreiben Sie das Ergebnis in einem Satz.",
            erwartet: [
              ["Bezeichnung und Preis aller Geräte, die teurer sind als " + f.kurz(grenze),
               "alle Geräte über " + f.kurz(grenze) + " Euro mit Bezeichnung und Preis"],
              ["absteigend nach Preis sortiert", "das teuerste zuerst", "nach Preis abwärts sortiert"]
            ] },
          { typ: "zuordnung", label: "Schlüsselwort → Aufgabe", be: 5,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "text", be: 3, zeilen: 4, satzbau: false,
            label: `Ergänzen Sie die Abfrage so, dass nur Geräte aus dem Kaufjahr ${jahr} ausgegeben werden. Schreiben Sie die geänderte WHERE-Zeile.`,
            erwartet: [["WHERE Preis > " + grenze + " AND Kaufjahr = " + jahr, "AND Kaufjahr = " + jahr, "Kaufjahr = " + jahr + " AND"]] },
          { typ: "text", be: 3, zeilen: 4, satzbau: false,
            label: `Schreiben Sie eine Abfrage, die den Gesamtwert der Geräte je Abteilung ausgibt (Name der Abteilung und Summe der Preise).`,
            erwartet: [
              ["SELECT Name, SUM(Preis)", "SUM(Preis)", "Summe über Preis"],
              ["FROM Geraet JOIN Abteilung", "Verknüpfung der beiden Tabellen über AbteilungNr", "JOIN"],
              ["GROUP BY Name", "GROUP BY", "gruppiert nach Abteilung"]
            ], noetig: 3 },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Worin unterscheiden sich WHERE und HAVING?",
            erwartet: [
              ["WHERE filtert einzelne Zeilen vor dem Gruppieren", "WHERE wirkt auf Zeilen"],
              ["HAVING filtert die fertigen Gruppen nach dem Gruppieren", "HAVING wirkt auf Gruppen und kann Aggregatfunktionen prüfen"]
            ] }
        ],
        loesung:
`Die Abfrage gibt Bezeichnung und Preis aller Geräte aus, deren Preis über
${f.kurz(grenze)} liegt, sortiert nach Preis absteigend (DESC = teuerstes zuerst).

Schlüsselwörter:
` + paare.map(p => "  " + p[1].padEnd(10) + p[0]).join("\n") +

`\n\nEinschränkung auf das Kaufjahr ${jahr}:

    WHERE Preis > ${f.kurz(grenze)} AND Kaufjahr = ${jahr}

Gesamtwert je Abteilung:

    SELECT   a.Name, SUM(g.Preis) AS Gesamtwert
    FROM     Geraet g
    JOIN     Abteilung a ON g.AbteilungNr = a.AbteilungNr
    GROUP BY a.Name
    ORDER BY Gesamtwert DESC;

WHERE gegen HAVING:
  WHERE  wirkt VOR dem Gruppieren auf einzelne Zeilen.
         Beispiel: WHERE Kaufjahr = ${jahr}
  HAVING wirkt NACH dem Gruppieren auf die fertigen Gruppen und darf
         Aggregatfunktionen prüfen.
         Beispiel: HAVING SUM(g.Preis) > 10000

Ausführungsreihenfolge zum Merken:
  FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`
      };
    }
  });

  /* ======================================= 3. Programmiersprachen ====== */
  G.vorlage({
    id: "sw-programmiersprachen", thema: "software", sub: "Programmiersprachen",
    titel: "Programmiersprachen einordnen", stufe: 2,
    merksatz: "Compiler übersetzt EINMAL komplett vorab — schnell zur Laufzeit, aber je Plattform " +
      "neu übersetzen. Interpreter übersetzt ZEILENWEISE beim Ausführen — plattformunabhängig und " +
      "schnell zu testen, aber langsamer. Java geht den Mittelweg über Bytecode und die JVM.",
    bau(R, c) {
      const paare = R.mische([
        ["wird vor der Ausführung vollständig in Maschinencode übersetzt", "Compiler"],
        ["wird beim Ausführen Zeile für Zeile übersetzt", "Interpreter"],
        ["wird in Bytecode übersetzt und von einer virtuellen Maschine ausgeführt", "Java / JVM"],
        ["beschreibt die Struktur einer Webseite, ist keine Programmiersprache", "HTML"],
        ["läuft im Browser und macht die Seite interaktiv", "JavaScript"]
      ]);
      const aussagen = R.mische([
        { t: "Kompilierte Programme laufen zur Laufzeit in der Regel schneller als interpretierte.", wahr: true },
        { t: "Ein interpretiertes Programm muss für jedes Betriebssystem neu übersetzt werden.", wahr: false },
        { t: "Syntaxfehler fallen beim Kompilieren schon vor der Ausführung auf.", wahr: true },
        { t: "HTML ist eine objektorientierte Programmiersprache.", wahr: false },
        { t: "Bei objektorientierter Programmierung werden Daten und die dazugehörigen Funktionen zusammengefasst.", wahr: true }
      ]).slice(0, 5);
      const projekt = R.waehle([
        { text: "ein kleines Auswertungsskript, das die IT gelegentlich per Hand startet", wahl: "eine interpretierte Sprache wie Python", warum: ["schnell geschrieben und ohne Übersetzungsschritt sofort lauffähig", "läuft ohne Anpassung auf verschiedenen Betriebssystemen"] },
        { text: "eine Steuerungssoftware, die dauerhaft mit knapper Rechenzeit auskommen muss", wahl: "eine kompilierte Sprache wie C oder C++", warum: ["kompilierter Maschinencode läuft deutlich schneller", "der Ressourcenbedarf ist genau kalkulierbar"] },
        { text: "eine Fachanwendung, die auf Windows-Arbeitsplätzen und auf einem Linux-Server laufen soll", wahl: "Java", warum: ["der Bytecode läuft auf jeder Plattform mit passender Laufzeitumgebung", "einmal entwickeln statt für jedes System getrennt"] }
      ]);
      return {
        situation: `In der Anwendungsentwicklung der ${c.firma} steht ein neues Vorhaben an: ${projekt.text}.`,
        prompt: "Ordnen Sie die Begriffe zu und begründen Sie eine Sprachwahl.",
        felder: [
          { typ: "zuordnung", label: "Beschreibung → Begriff", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "text", be: 1, zeilen: 2, satzbau: false,
            label: "Welche Art von Sprache empfehlen Sie für dieses Vorhaben?",
            erwartet: [[projekt.wahl, projekt.wahl.split(" wie ")[0]]] },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: true, minWorte: 8,
            label: "Begründen Sie die Wahl mit zwei Argumenten",
            erwartet: projekt.warum.map(x => [x]) }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(18) + p[0]).join("\n") +

`\n\nCompiler gegen Interpreter:
  Compiler      übersetzt das ganze Programm EINMAL vorab in Maschinencode.
                + schnell zur Laufzeit, Fehler fallen schon beim Übersetzen auf
                − je Zielsystem neu übersetzen, längerer Weg bis zum Test
  Interpreter   übersetzt beim Ausführen Zeile für Zeile.
                + sofort testbar, läuft ohne Anpassung auf mehreren Systemen
                − langsamer, Fehler zeigen sich erst beim Ausführen
  Java          Mittelweg: Quelltext → Bytecode → JVM. Einmal übersetzt, überall
                lauffähig, wo eine Laufzeitumgebung vorhanden ist.

Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nEmpfehlung: ${projekt.wahl}
` + projekt.warum.map(x => "  • " + x).join("\n") +

`\n\nAchtung bei der Prüfungsfrage „Ist HTML eine Programmiersprache?“ — nein.
HTML ist eine AUSZEICHNUNGSSPRACHE: sie beschreibt Struktur, enthält aber keine
Logik, keine Schleifen und keine Verzweigungen.`
      };
    }
  });

  /* ============================================ 4. Webtechnologien ===== */
  G.vorlage({
    id: "sw-webtechnologien", thema: "software", sub: "Webtechnologien",
    titel: "Webtechnologien und Client-Server-Aufteilung", stufe: 2,
    merksatz: "HTML = Struktur, CSS = Aussehen, JavaScript = Verhalten. Was im BROWSER läuft, kann " +
      "jeder verändern — deshalb muss jede Prüfung, auf die es ankommt, auf dem SERVER wiederholt " +
      "werden.",
    bau(R, c) {
      const paare = R.mische([
        ["legt Überschriften, Absätze und Formularfelder fest", "HTML"],
        ["bestimmt Farben, Abstände und das Verhalten auf kleinen Bildschirmen", "CSS"],
        ["prüft eine Eingabe schon beim Tippen, ohne die Seite neu zu laden", "JavaScript"],
        ["läuft auf dem Server und holt die Daten aus der Datenbank", "serverseitige Sprache (z. B. PHP, Java)"],
        ["überträgt die Seite verschlüsselt zwischen Browser und Server", "HTTPS"]
      ]);
      const aussagen = R.mische([
        { t: "Eine Prüfung der Eingaben nur im Browser reicht für die Sicherheit aus.", wahr: false },
        { t: "CSS lässt sich für Bildschirm, Druck und kleine Displays getrennt festlegen.", wahr: true },
        { t: "Der Browser lädt HTML, CSS und JavaScript vom Server und führt sie lokal aus.", wahr: true },
        { t: "Barrierefreiheit betrifft nur blinde Menschen.", wahr: false },
        { t: "Alternativtexte für Bilder helfen Screenreadern und bei nicht geladenen Bildern.", wahr: true }
      ]).slice(0, 4);
      return {
        situation:
`Die ${c.firma} lässt ein Kundenportal entwickeln. Kundinnen und Kunden sollen dort Rechnungen
einsehen und Adressänderungen melden können. Das Portal soll auch auf dem Handy nutzbar und
barrierefrei sein.`,
        prompt: "Ordnen Sie die Technologien zu und beurteilen Sie die Aussagen.",
        felder: [
          { typ: "zuordnung", label: "Aufgabe → Technologie", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "text", be: 3, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum müssen Eingaben zusätzlich auf dem Server geprüft werden, obwohl JavaScript das schon im Browser tut?",
            erwartet: [
              ["der Browser-Code lässt sich abschalten oder verändern", "JavaScript kann deaktiviert werden", "die Prüfung im Browser ist manipulierbar"],
              ["Anfragen können auch ohne Browser direkt an den Server geschickt werden", "Umgehung der Oberfläche möglich"],
              ["die Prüfung im Browser dient nur dem Komfort, die Sicherheit entsteht auf dem Server", "nur der Server kann die Prüfung verlässlich durchsetzen"]
            ], noetig: 3 },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 7,
            label: "Nennen Sie drei Maßnahmen für ein barrierefreies Portal",
            erwartet: [
              ["Alternativtexte für Bilder", "Alt-Attribut hinterlegen", "Bilder beschriften"],
              ["ausreichender Kontrast zwischen Text und Hintergrund", "kontrastreiche Farben"],
              ["vollständige Bedienbarkeit mit der Tastatur", "ohne Maus benutzbar", "sinnvolle Tabulatorreihenfolge"],
              ["Schrift lässt sich vergrößern ohne Verlust von Inhalten", "skalierbare Schriftgrößen", "keine festen Pixelgrößen"],
              ["klare und einfache Sprache", "verständliche Beschriftungen"],
              ["Formularfelder eindeutig beschriften", "Label mit dem Feld verknüpfen"],
              ["Untertitel oder Transkript für Videos", "Alternative für Ton und Video"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(38) + p[0]).join("\n") +

`\n\nAufteilung Client und Server:
  Client (Browser)  HTML, CSS, JavaScript — Darstellung und Komfort
  Server            Geschäftslogik, Datenbankzugriff, verbindliche Prüfungen
  dazwischen        HTTPS — verschlüsselte Übertragung

Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nWarum die Serverprüfung unverzichtbar ist:
  Alles, was im Browser läuft, gehört dem Benutzer. JavaScript lässt sich
  abschalten, der Quelltext lässt sich in den Entwicklerwerkzeugen ändern, und
  eine Anfrage kann ohne Browser direkt an den Server geschickt werden. Die
  Prüfung im Browser ist reiner Komfort (sofortige Rückmeldung, weniger
  Serveranfragen). Verbindlich ist nur, was der Server prüft.

Barrierefreiheit (BITV / WCAG):
  • Alternativtexte für Bilder
  • ausreichender Kontrast
  • vollständige Tastaturbedienung
  • skalierbare Schrift ohne Informationsverlust
  • eindeutig beschriftete Formularfelder
  • Untertitel oder Transkript bei Video und Audio
Barrierefreiheit hilft nicht nur blinden Menschen, sondern auch bei
Sehschwäche, motorischen Einschränkungen, in lauter Umgebung und auf dem
kleinen Handydisplay.`
      };
    }
  });

  /* ================================================ 5. Marktformen ===== */
  G.vorlage({
    id: "wirt-marktformen", thema: "kalkulation", sub: "Marktformen",
    titel: "Marktformen bestimmen", stufe: 2,
    merksatz: "Zeile = Anbieter, Spalte = Nachfrager. Einer/Wenige/Viele. Poly = viele, Oligo = " +
      "wenige, Mono = einer. Für die Prüfung reicht meist: viele/viele = Polypol, wenige/viele = " +
      "Angebotsoligopol, einer/viele = Angebotsmonopol.",
    bau(R, c) {
      const faelle = R.waehleN([
        { t: "Im Ort gibt es sechs Bäckereien, die an alle Einwohner verkaufen.", a: "Polypol" },
        { t: "Drei Hersteller teilen sich den deutschen Markt für Mobilfunknetze, Kunden gibt es Millionen.", a: "Angebotsoligopol" },
        { t: "Nur ein Unternehmen darf im Ort das Trinkwassernetz betreiben.", a: "Angebotsmonopol" },
        { t: "Viele kleine Zulieferer beliefern die drei großen Autohersteller im Land.", a: "Nachfrageoligopol" },
        { t: "Zahlreiche Landwirte verkaufen ihre gesamte Ernte an eine einzige Molkerei.", a: "Nachfragemonopol" },
        { t: "Viele Onlinehändler bieten dasselbe Zubehör an, gekauft wird von sehr vielen Privatpersonen.", a: "Polypol" }
      ], R.waehle([4, 5]));
      const optionen = ["Polypol", "Angebotsoligopol", "Angebotsmonopol", "Nachfrageoligopol", "Nachfragemonopol"];
      const paare = faelle.map(x => [x.t, x.a]);

      return {
        situation:
`Im Rahmen der Marktbeobachtung ordnet die ${c.firma} verschiedene Situationen den Marktformen zu.`,
        prompt: "Bestimmen Sie zu jeder Situation die Marktform und beantworten Sie die Folgefragen.",
        felder: [
          { typ: "zuordnung", label: "Situation → Marktform", be: faelle.length, optionen, paare: R.mische(paare) },
          { typ: "raster", label: "Marktformenschema ergänzen",
            kopf: ["Anbieter ↓ / Nachfrager →", "viele", "wenige", "einer"],
            zeilen: [
              { zellen: [{ t: "viele" }, { eingabe: true, text: ["Polypol"], be: 1 }, { eingabe: true, text: ["Nachfrageoligopol", "Angebotspolypol/Nachfrageoligopol"], be: 1 }, { eingabe: true, text: ["Nachfragemonopol"], be: 1 }] },
              { zellen: [{ t: "wenige" }, { eingabe: true, text: ["Angebotsoligopol"], be: 1 }, { eingabe: true, text: ["zweiseitiges Oligopol", "bilaterales Oligopol"], be: 1 }, { eingabe: true, text: ["beschränktes Nachfragemonopol"], be: 1 }] },
              { zellen: [{ t: "einer" }, { eingabe: true, text: ["Angebotsmonopol"], be: 1 }, { eingabe: true, text: ["beschränktes Angebotsmonopol"], be: 1 }, { eingabe: true, text: ["zweiseitiges Monopol", "bilaterales Monopol"], be: 1 }] }
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Wie wirkt sich ein Angebotsmonopol auf Preis und Auswahl aus?",
            erwartet: [
              ["der Anbieter kann den Preis weitgehend selbst setzen", "keine Konkurrenz begrenzt den Preis", "Preise liegen tendenziell höher"],
              ["die Kundschaft hat keine Ausweichmöglichkeit", "keine Auswahl", "wenig Anreiz zu Verbesserungen"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(20) + p[0]).join("\n") +

`\n\nMarktformenschema (Anbieter senkrecht, Nachfrager waagerecht):

                    viele Nachfrager      wenige                einer
  viele Anbieter    Polypol               Nachfrageoligopol     Nachfragemonopol
  wenige Anbieter   Angebotsoligopol      zweiseitiges Oligopol beschr. Nachfragemonopol
  ein Anbieter      Angebotsmonopol       beschr. Angebotsmon.  zweiseitiges Monopol

Eselsbrücke: Poly = viele, Oligo = wenige, Mono = einer.
Der erste Wortteil („Angebots…“ / „Nachfrage…“) sagt, auf WELCHER Seite die
Knappheit sitzt: Angebotsmonopol = EIN Anbieter.

Wirkung eines Angebotsmonopols:
  Ohne Konkurrenz bestimmt der Anbieter den Preis weitgehend selbst und muss sich
  wenig um Qualität oder Service bemühen — die Kundschaft kann ja nicht
  ausweichen. Genau deshalb werden natürliche Monopole wie Wasser- und Stromnetze
  staatlich reguliert.`
      };
    }
  });

  /* ============================================ 6. Darlehen ============ */
  G.vorlage({
    id: "wirt-darlehen", thema: "kalkulation", sub: "Darlehensberechnung",
    titel: "Darlehen für eine IT-Investition berechnen", stufe: 3,
    merksatz: "Annuitätendarlehen: die RATE bleibt gleich, aber innerhalb der Rate wächst die " +
      "Tilgung und schrumpft der Zins. Zins wird immer auf die RESTSCHULD gerechnet, nie auf die " +
      "ursprüngliche Summe.",
    bau(R, c) {
      const summe = R.stufe(20000, 90000, 5000);
      const zins = R.stufe(3.5, 7.5, 0.25);
      const jahre = R.waehle([3, 4, 5]);
      const tilgungJ = r(summe / jahre, 2);

      /* Ratendarlehen (gleiche Tilgung) — das rechnet die IHK meist */
      const zeilen = [];
      let rest = summe, zinsSumme = 0;
      for (let i = 1; i <= jahre; i++) {
        const z = r(rest * zins / 100, 2);
        zinsSumme = r(zinsSumme + z, 2);
        const rate = r(tilgungJ + z, 2);
        zeilen.push({ jahr: i, anfang: rest, zins: z, tilgung: tilgungJ, rate, ende: r(rest - tilgungJ, 2) });
        rest = r(rest - tilgungJ, 2);
      }
      const gesamt = r(summe + zinsSumme, 2);

      return {
        situation:
`Die ${c.firma} finanziert eine IT-Investition von ${f.eur(summe)} über ein Ratendarlehen
(gleichbleibende Tilgung) mit ${f.kurz(jahre)} Jahren Laufzeit und ${f.kurz(zins)} % Zinsen pro Jahr.
Die Zinsen werden jeweils auf die Restschuld zu Jahresbeginn berechnet.`,
        prompt: "Erstellen Sie den Tilgungsplan und berechnen Sie die Gesamtkosten.",
        felder: [
          { typ: "zahl", label: "Jährliche Tilgung", einheit: "€", be: 1, dez: 2, loesung: tilgungJ },
          { typ: "raster", label: "Tilgungsplan",
            kopf: ["Jahr", "Restschuld zu Beginn (€)", "Zinsen (€)", "Tilgung (€)", "Rate (€)"],
            zeilen: zeilen.map(z => ({
              zellen: [
                { t: String(z.jahr) },
                { eingabe: true, loesung: z.anfang, dez: 2, be: 0.5 },
                { eingabe: true, loesung: z.zins, dez: 2, be: 1 },
                { eingabe: true, loesung: z.tilgung, dez: 2, be: 0.5 },
                { eingabe: true, loesung: z.rate, dez: 2, be: 0.5 }
              ]
            })) },
          { typ: "zahl", label: "Summe aller Zinsen über die Laufzeit", einheit: "€", be: 2, dez: 2, loesung: zinsSumme },
          { typ: "zahl", label: "Gesamtkosten des Darlehens (Tilgung + Zinsen)", einheit: "€", be: 1, dez: 2, loesung: gesamt },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum sinkt die jährliche Rate, obwohl die Tilgung gleich bleibt?",
            erwartet: [
              ["die Zinsen werden auf die Restschuld berechnet", "Zins auf die verbleibende Schuld"],
              ["die Restschuld wird jedes Jahr kleiner, also fällt der Zinsanteil", "mit sinkender Restschuld sinkt der Zins"]
            ] }
        ],
        loesung:
`Jährliche Tilgung: ${f.eur(summe)} ÷ ${jahre} = ${f.eur(tilgungJ)}

Tilgungsplan (Zinsen immer auf die Restschuld zu Jahresbeginn):

  Jahr  Restschuld       Zinsen        Tilgung       Rate
` + zeilen.map(z =>
  "  " + String(z.jahr).padEnd(6) +
  f.eur(z.anfang).padStart(14) + f.eur(z.zins).padStart(13) +
  f.eur(z.tilgung).padStart(14) + f.eur(z.rate).padStart(13)).join("\n") +

`\n\nRechenweg für Jahr 1:
  Zinsen  = ${f.eur(summe)} × ${f.kurz(zins)} % = ${f.eur(zeilen[0].zins)}
  Rate    = Tilgung + Zinsen = ${f.eur(tilgungJ)} + ${f.eur(zeilen[0].zins)} = ${f.eur(zeilen[0].rate)}
  Restschuld am Jahresende = ${f.eur(summe)} − ${f.eur(tilgungJ)} = ${f.eur(zeilen[0].ende)}

Zinsen gesamt:  ${f.eur(zinsSumme)}
Gesamtkosten:   ${f.eur(summe)} + ${f.eur(zinsSumme)} = ${f.eur(gesamt)}

Warum die Rate sinkt: die Tilgung ist fest, aber der Zins wird jedes Jahr neu auf
die kleiner gewordene RESTSCHULD gerechnet. Weniger Schuld = weniger Zins = kleinere
Rate.

Unterschied zum Annuitätendarlehen: dort bleibt die RATE gleich. Innerhalb der
Rate wächst dann die Tilgung von Jahr zu Jahr, während der Zinsanteil schrumpft.
Typischer Prüfungsfehler: Zinsen auf die ursprüngliche Darlehenssumme statt auf
die Restschuld rechnen.`
      };
    }
  });

  /* ==================================== 7. Kostenrechnung / DB ========= */
  G.vorlage({
    id: "wirt-kostenrechnung", thema: "kalkulation", sub: "Kostenrechnung",
    titel: "Fixe und variable Kosten, Deckungsbeitrag", stufe: 3,
    merksatz: "Fixkosten fallen an, egal wie viel produziert wird (Miete, Gehalt, Lizenz). " +
      "Variable Kosten hängen an der Menge (Material, Strom je Stück). Deckungsbeitrag = Preis " +
      "minus variable Stückkosten — das ist der Teil, der die Fixkosten deckt. Gewinnschwelle = " +
      "Fixkosten ÷ Deckungsbeitrag.",
    bau(R, c) {
      const produkt = R.waehle(["Serviceverträge", "Schulungsplätze", "Wartungspauschalen", "IT-Arbeitsplatzpakete"]);
      const preis = R.stufe(40, 180, 5);
      const varStk = r(preis * R.stufe(0.30, 0.60, 0.05), 2);
      const fix = R.stufe(4000, 28000, 500);
      const menge = R.stufe(200, 900, 50);

      const db = r(preis - varStk, 2);
      const dbGesamt = r(db * menge, 2);
      const gewinn = r(dbGesamt - fix, 2);
      const schwelle = Math.ceil(fix / db);
      const kostenGesamt = r(fix + varStk * menge, 2);
      const stueckkosten = r(kostenGesamt / menge, 2);

      const zuordnung = R.mische([
        ["Miete für die Schulungsräume", "Fixkosten"],
        ["Verbrauchsmaterial je Teilnehmer", "variable Kosten"],
        ["Gehalt der fest angestellten Trainerin", "Fixkosten"],
        ["Lizenzgebühr je verkauftem Vertrag", "variable Kosten"],
        ["Versicherung der Betriebsausstattung", "Fixkosten"]
      ]);

      return {
        situation:
`Die ${c.firma} verkauft ${produkt}. Für das kommende Jahr liegen folgende Zahlen vor:

    Verkaufspreis je Stück            ${f.eur(preis)}
    variable Kosten je Stück          ${f.eur(varStk)}
    Fixkosten im Jahr                 ${f.eur(fix)}
    geplante Absatzmenge              ${f.kurz(menge)} Stück`,
        prompt: "Berechnen Sie Deckungsbeitrag, Gewinn und Gewinnschwelle.",
        felder: [
          { typ: "zuordnung", label: "Kostenart zuordnen", be: 5,
            optionen: ["Fixkosten", "variable Kosten"], paare: zuordnung },
          { typ: "zahl", label: "Deckungsbeitrag je Stück", einheit: "€", be: 2, dez: 2, loesung: db },
          { typ: "zahl", label: "Deckungsbeitrag insgesamt bei geplanter Menge", einheit: "€", be: 1, dez: 2, loesung: dbGesamt },
          { typ: "zahl", label: "Gewinn oder Verlust im Jahr", einheit: "€", be: 2, dez: 2, loesung: gewinn },
          { typ: "zahl", label: "Gewinnschwelle (Break-even) in Stück", einheit: "Stück", be: 3, dez: 0, loesung: schwelle, tolAbs: 1 },
          { typ: "zahl", label: "Selbstkosten je Stück bei geplanter Menge", einheit: "€", be: 2, dez: 2, loesung: stueckkosten },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum sinken die Stückkosten, wenn mehr verkauft wird?",
            erwartet: [
              ["die Fixkosten verteilen sich auf mehr Stück", "Fixkostendegression", "Fixkostenanteil je Stück wird kleiner"],
              ["die variablen Kosten je Stück bleiben dagegen gleich", "nur der Fixkostenanteil sinkt"]
            ] }
        ],
        loesung:
`Kostenarten:
` + zuordnung.map(z => "  " + z[1].padEnd(18) + z[0]).join("\n") +

`\n\nDeckungsbeitrag je Stück:
  Preis − variable Stückkosten = ${f.eur(preis)} − ${f.eur(varStk)} = ${f.eur(db)}

Deckungsbeitrag gesamt:
  ${f.eur(db)} × ${f.kurz(menge)} Stück = ${f.eur(dbGesamt)}

Gewinn:
  Deckungsbeitrag gesamt − Fixkosten = ${f.eur(dbGesamt)} − ${f.eur(fix)} = ${f.eur(gewinn)}
  ${gewinn >= 0 ? "→ Das Vorhaben ist mit der geplanten Menge im Gewinn." : "→ VERLUST. Die Menge reicht nicht, um die Fixkosten zu decken."}

Gewinnschwelle (Break-even):
  Fixkosten ÷ Deckungsbeitrag je Stück = ${f.eur(fix)} ÷ ${f.eur(db)} = ${f.kurz(r(fix / db, 2))}
  → aufgerundet ${f.kurz(schwelle)} Stück
  Ab dem ${f.kurz(schwelle)}. Stück sind die Fixkosten gedeckt, jedes weitere Stück bringt
  ${f.eur(db)} Gewinn. (Immer AUFRUNDEN — ein halbes Stück verkauft niemand.)

Selbstkosten je Stück bei ${f.kurz(menge)} Stück:
  Gesamtkosten = ${f.eur(fix)} + ${f.eur(varStk)} × ${f.kurz(menge)} = ${f.eur(kostenGesamt)}
  ${f.eur(kostenGesamt)} ÷ ${f.kurz(menge)} = ${f.eur(stueckkosten)}

Fixkostendegression: die Fixkosten bleiben in der Summe gleich, verteilen sich
aber auf mehr Stück. Der Fixkostenanteil je Stück sinkt also, während die
variablen Kosten je Stück konstant bleiben. Deshalb wird jedes zusätzlich
verkaufte Stück rechnerisch günstiger.`
      };
    }
  });

  /* ================================== 8. JBOD, RAID, Speichersysteme === */
  G.vorlage({
    id: "sp-jbod", thema: "daten", sub: "JBOD & Speichersysteme",
    titel: "JBOD, RAID und Speicherkonzepte unterscheiden", stufe: 2,
    merksatz: "JBOD hängt Platten nur hintereinander — mehr Platz, aber KEINE Sicherheit und keine " +
      "Geschwindigkeit. RAID 0 verteilt (schnell, unsicher), RAID 1 spiegelt (sicher, halber Platz), " +
      "RAID 5 verteilt mit Parität (ein Ausfall verkraftbar). Und: kein RAID ersetzt ein Backup.",
    bau(R, c) {
      const platten = R.waehle([3, 4, 5, 6]);
      const groesse = R.waehle([2, 4, 6, 8]);
      const roh = platten * groesse;
      const r0 = roh, r1 = groesse * Math.floor(platten / 2), r5 = (platten - 1) * groesse, r6 = (platten - 2) * groesse;
      const paare = R.mische([
        ["Platten werden nur aneinandergehängt, keinerlei Ausfallsicherheit", "JBOD"],
        ["Daten werden auf alle Platten verteilt, hohe Geschwindigkeit, kein Schutz", "RAID 0"],
        ["Daten werden gespiegelt, eine Platte darf ausfallen, halbe Nettokapazität", "RAID 1"],
        ["Daten plus Paritätsinformation auf allen Platten, eine Platte darf ausfallen", "RAID 5"],
        ["doppelte Parität, zwei Platten dürfen gleichzeitig ausfallen", "RAID 6"]
      ]);
      return {
        situation:
`Für den neuen Dateiserver der ${c.firma} stehen ${platten} Festplatten zu je ${groesse} TB zur Verfügung.
Auf dem Server liegen die laufenden Projektdaten aller Abteilungen.`,
        prompt: "Vergleichen Sie die Speicherkonzepte und geben Sie eine begründete Empfehlung.",
        felder: [
          { typ: "zuordnung", label: "Beschreibung → Konzept", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "raster", label: `Nutzbare Kapazität bei ${platten} × ${groesse} TB`,
            kopf: ["Konzept", "Nutzbare Kapazität in TB", "Ausfall wie vieler Platten verkraftbar?"],
            zeilen: [
              { zellen: [{ t: "JBOD" }, { eingabe: true, loesung: roh, dez: 0, be: 0.5 }, { eingabe: true, text: ["0", "keine", "gar keine"], be: 0.5 }] },
              { zellen: [{ t: "RAID 0" }, { eingabe: true, loesung: r0, dez: 0, be: 0.5 }, { eingabe: true, text: ["0", "keine", "gar keine"], be: 0.5 }] },
              { zellen: [{ t: "RAID 1" }, { eingabe: true, loesung: r1, dez: 0, be: 1 }, { eingabe: true, text: ["1", "eine"], be: 0.5 }] },
              { zellen: [{ t: "RAID 5" }, { eingabe: true, loesung: r5, dez: 0, be: 1 }, { eingabe: true, text: ["1", "eine"], be: 0.5 }] },
              { zellen: [{ t: "RAID 6" }, { eingabe: true, loesung: r6, dez: 0, be: 1 }, { eingabe: true, text: ["2", "zwei"], be: 0.5 }] }
            ] },
          { typ: "auswahl", be: 1, label: "Welches Konzept empfehlen Sie für den Dateiserver?",
            optionen: ["JBOD", "RAID 0", "RAID 1", "RAID 5", "RAID 6"], loesung: platten >= 4 ? "RAID 5" : "RAID 1" },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: true, minWorte: 8,
            label: "Begründen Sie Ihre Empfehlung",
            erwartet: [
              ["eine Platte darf ausfallen, ohne dass Daten verloren gehen", "Ausfallsicherheit bei laufendem Betrieb", "Server läuft beim Plattentausch weiter"],
              ["gutes Verhältnis von nutzbarem Platz zu Sicherheit", "weniger Kapazitätsverlust als bei Spiegelung", "vertretbarer Kapazitätsverlust"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum ersetzt ein RAID keine Datensicherung?",
            erwartet: [
              ["RAID schützt nur vor dem Ausfall einer Platte", "schützt nur gegen Hardwareausfall"],
              ["gegen versehentliches Löschen, Schadsoftware, Brand oder Diebstahl hilft es nicht", "gelöschte Daten sind sofort auf allen Platten weg", "Ransomware verschlüsselt das RAID mit"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(10) + p[0]).join("\n") +

`\n\nNutzbare Kapazität bei ${platten} Platten × ${groesse} TB (roh ${roh} TB):

  Konzept   nutzbar        Ausfall verkraftbar   Formel
  JBOD      ${String(roh).padStart(3)} TB         0                     n × Größe
  RAID 0    ${String(r0).padStart(3)} TB         0                     n × Größe
  RAID 1    ${String(r1).padStart(3)} TB         1                     Größe × (n ÷ 2)
  RAID 5    ${String(r5).padStart(3)} TB         1                     (n − 1) × Größe
  RAID 6    ${String(r6).padStart(3)} TB         2                     (n − 2) × Größe

Empfehlung: ${platten >= 4 ? "RAID 5" : "RAID 1"}
  • eine Platte darf ausfallen, der Server läuft weiter (Hot Swap)
  • ${platten >= 4
      ? `${r5} von ${roh} TB bleiben nutzbar — deutlich mehr als bei der Spiegelung (${r1} TB)`
      : "bei nur " + platten + " Platten ist die Spiegelung die sinnvolle Wahl"}

Warum RAID kein Backup ist:
  Ein RAID schützt ausschließlich vor dem AUSFALL einer Platte. Es schützt nicht vor
    • versehentlichem Löschen — weg ist sofort auf allen Platten weg
    • Ransomware — verschlüsselt wird der gesamte Verbund
    • Brand, Wasser, Diebstahl — der ganze Server ist betroffen
    • Fehlern in der Anwendung, die falsche Daten schreibt
  Deshalb zusätzlich: regelmäßige Sicherung, davon mindestens eine Kopie außer
  Haus und eine offline (3-2-1-Regel: 3 Kopien, 2 Medien, 1 außer Haus).`
      };
    }
  });

  /* ================================= 9. Dateiformate & Konvertierung === */
  G.vorlage({
    id: "sp-dateiformate", thema: "daten", sub: "Dateiformate & Datenkonvertierung",
    titel: "Dateiformate einordnen und Daten konvertieren", stufe: 2,
    merksatz: "Verlustbehaftet (JPG, MP3, MP4) wirft Information weg und wird bei jedem Speichern " +
      "schlechter — gut für Fotos, schlecht für Archiv und Logos. Verlustfrei (PNG, FLAC, ZIP) " +
      "behält alles. Für den Datenaustausch zwischen Systemen: CSV einfach, XML streng prüfbar, " +
      "JSON kompakt und für Schnittstellen üblich.",
    bau(R, c) {
      const paare = R.mische([
        ["Foto für die Website, kleine Datei wichtiger als letzte Schärfe", "JPG"],
        ["Firmenlogo mit transparentem Hintergrund", "PNG"],
        ["Rechnung, die überall gleich aussehen und unverändert bleiben soll", "PDF"],
        ["Tabellendaten für den Import in ein anderes System, einfachstes Format", "CSV"],
        ["Datenaustausch mit strenger Strukturprüfung über ein Schema", "XML"],
        ["Antwort einer Web-Schnittstelle, kompakt und verschachtelt", "JSON"]
      ]).slice(0, 5);
      const zeilen = R.waehle([
        [["PersNr", "Name", "Abteilung"], ["4711", "Meier, Ada", "Vertrieb"], ["4712", "Sauer, Jan", "Einkauf"]],
        [["ArtNr", "Bezeichnung", "Bestand"], ["A-100", "Maus, kabellos", "42"], ["A-101", "Tastatur", "17"]],
        [["RaumNr", "Bezeichnung", "Plätze"], ["2.14", "Schulung, groß", "18"], ["1.03", "Besprechung", "6"]]
      ]);
      const kopf = zeilen[0], d1 = zeilen[1];

      return {
        situation:
`Die ${c.firma} tauscht Daten mit einem Dienstleister aus. Ein Auszug soll als CSV übergeben werden:

    ${kopf.join(";")}
    ${zeilen[1].map(x => x.includes(",") ? '"' + x + '"' : x).join(";")}
    ${zeilen[2].map(x => x.includes(",") ? '"' + x + '"' : x).join(";")}`,
        prompt: "Ordnen Sie die Formate zu und beantworten Sie die Fragen zur Konvertierung.",
        felder: [
          { typ: "zuordnung", label: "Einsatzzweck → Dateiformat", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: `Im Feld „${d1[1]}“ kommt selbst ein Komma vor. Warum ist das in einer CSV-Datei ein Problem und wie löst man es?`,
            erwartet: [
              ["das Trennzeichen käme mitten im Wert vor und die Spalten verrutschen", "der Wert würde fälschlich getrennt", "Feldtrenner im Inhalt"],
              ["den Wert in Anführungszeichen setzen oder ein anderes Trennzeichen wählen", "Semikolon statt Komma verwenden", "Quoting"]
            ] },
          { typ: "text", be: 3, zeilen: 5, satzbau: false,
            label: "Schreiben Sie die erste Datenzeile als JSON-Objekt",
            erwartet: [
              ['"' + kopf[0] + '": "' + d1[0] + '"', kopf[0] + " " + d1[0]],
              ['"' + kopf[1] + '"', kopf[1] + " " + d1[1].split(",")[0]],
              ['"' + kopf[2] + '": "' + d1[2] + '"', kopf[2] + " " + d1[2]]
            ], noetig: 3 },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 7,
            label: "Worauf ist beim Datenaustausch mit einem externen Dienstleister zu achten?",
            erwartet: [
              ["Zeichensatz vereinbaren, damit Umlaute nicht kaputtgehen", "UTF-8 festlegen", "Kodierung abstimmen"],
              ["Trennzeichen und Feldreihenfolge schriftlich vereinbaren", "Datensatzbeschreibung übergeben", "Struktur dokumentieren"],
              ["Datum- und Zahlenformat festlegen", "Dezimaltrennzeichen abstimmen", "einheitliches Datumsformat"],
              ["Auftragsverarbeitungsvertrag abschließen", "AV-Vertrag nach Art. 28 DSGVO", "Datenschutzvereinbarung"],
              ["Übertragung verschlüsseln", "sicherer Übertragungsweg", "kein unverschlüsselter Mailversand"],
              ["nur die wirklich benötigten Felder übergeben", "Datenminimierung"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(8) + p[0]).join("\n") +

`\n\nKomma im Wert:
  Steht im Inhalt dasselbe Zeichen wie der Feldtrenner, verrutschen beim Einlesen
  alle folgenden Spalten — aus drei Feldern werden vier. Lösungen:
    • den Wert in Anführungszeichen setzen: "${d1[1]}"
    • ein anderes Trennzeichen verwenden (im deutschsprachigen Raum meist Semikolon)

Dieselbe Zeile als JSON:

    {
      "${kopf[0]}": "${d1[0]}",
      "${kopf[1]}": "${d1[1]}",
      "${kopf[2]}": "${d1[2]}"
    }

Und als XML:

    <Datensatz>
      <${kopf[0]}>${d1[0]}</${kopf[0]}>
      <${kopf[1]}>${d1[1]}</${kopf[1]}>
      <${kopf[2]}>${d1[2]}</${kopf[2]}>
    </Datensatz>

Formate im Vergleich:
  CSV   sehr einfach, jedes Programm kann es — aber keine Typen, keine
        Verschachtelung, Trennzeichen- und Kodierungsprobleme
  XML   streng prüfbar über XSD-Schema, selbstbeschreibend — dafür sehr geschwätzig
  JSON  kompakt, verschachtelbar, Standard bei Web-Schnittstellen

Beim Austausch mit Externen unbedingt klären:
  • Zeichensatz (UTF-8), sonst werden Umlaute zu Fragezeichen
  • Trennzeichen, Feldreihenfolge, Datums- und Zahlenformat
  • Auftragsverarbeitungsvertrag nach Art. 28 DSGVO
  • verschlüsselter Übertragungsweg, keine offene E-Mail
  • Datenminimierung — nur die Felder, die der Dienstleister braucht`
      };
    }
  });

  /* ============================================ 10. SMART-Ziele ======== */
  G.vorlage({
    id: "pm-smart", thema: "projekt", sub: "SMART-Kriterien",
    titel: "Projektziele nach SMART prüfen und umformulieren", stufe: 2,
    merksatz: "S pezifisch – M essbar – A ttraktiv/Akzeptiert – R ealistisch – T erminiert. " +
      "Ein Ziel wie „die IT soll besser werden“ scheitert an S, M und T. Ein gutes Ziel enthält " +
      "IMMER eine Zahl und ein Datum.",
    bau(R, c) {
      const schlecht = R.waehle([
        { z: "Die Arbeitsplätze sollen bald moderner werden.", fehlt: ["spezifisch", "messbar", "terminiert"],
          gut: "Bis zum 30.06. werden alle 24 Arbeitsplätze der Abteilung " },
        { z: "Wir wollen die Störungen im Netzwerk deutlich reduzieren.", fehlt: ["messbar", "terminiert"],
          gut: "Bis zum 31.12. sinkt die Zahl der Netzwerkstörungen von 40 auf höchstens 15 pro Monat" },
        { z: "Das neue System soll benutzerfreundlicher sein.", fehlt: ["spezifisch", "messbar", "terminiert"],
          gut: "Bis zum 01.09. bearbeiten die Beschäftigten einen Standardvorgang in höchstens 3 Minuten" },
        { z: "Alle Beschäftigten sollen irgendwann geschult werden.", fehlt: ["messbar", "terminiert", "realistisch"],
          gut: "Bis zum 31.10. haben alle 60 Beschäftigten die Schulung IT-Sicherheit abgeschlossen" }
      ]);
      const zahl = R.stufe(12, 60, 4);
      const monat = R.waehle(["31.03.", "30.06.", "30.09.", "31.12."]);

      return {
        situation:
`Für ein IT-Projekt der ${c.firma} wurde folgendes Ziel formuliert:

    „${schlecht.z}“

Die Projektleitung bemängelt, dass dieses Ziel nicht SMART ist.`,
        prompt: "Prüfen Sie das Ziel und formulieren Sie es neu.",
        felder: [
          { typ: "raster", label: "Wofür stehen die fünf Buchstaben?",
            kopf: ["Buchstabe", "Bedeutung"],
            zeilen: [
              { zellen: [{ t: "S" }, { eingabe: true, text: ["spezifisch", "eindeutig und konkret formuliert"], be: 0.5 }] },
              { zellen: [{ t: "M" }, { eingabe: true, text: ["messbar", "überprüfbar an einer Zahl"], be: 0.5 }] },
              { zellen: [{ t: "A" }, { eingabe: true, text: ["attraktiv", "akzeptiert", "angemessen", "von den Beteiligten mitgetragen"], be: 0.5 }] },
              { zellen: [{ t: "R" }, { eingabe: true, text: ["realistisch", "mit den vorhandenen Mitteln erreichbar"], be: 0.5 }] },
              { zellen: [{ t: "T" }, { eingabe: true, text: ["terminiert", "mit festem Endtermin"], be: 0.5 }] }
            ] },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: false,
            label: "Welche Kriterien erfüllt das Ziel NICHT?",
            erwartet: schlecht.fehlt.map(x => [x]) },
          { typ: "text", be: 3, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Formulieren Sie das Ziel SMART — mit Zahl und Termin",
            erwartet: [
              ["bis zum " + monat, "Termin genannt", "bis zum 31.", "bis zum 30."],
              ["eine konkrete Zahl oder Kennzahl", String(zahl), "Anzahl genannt", "Prozentwert genannt"],
              ["konkret benannter Gegenstand des Ziels", "eindeutig beschriebenes Ergebnis"]
            ], noetig: 3 },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum ist ein messbares Ziel für die Projektabnahme wichtig?",
            erwartet: [
              ["nur so lässt sich am Ende eindeutig feststellen, ob es erreicht wurde", "Abnahme wird überprüfbar", "objektiv nachweisbar"],
              ["Streit zwischen Auftraggeber und Auftragnehmer wird vermieden", "keine Auslegungssache", "klare Grundlage für die Abnahme"]
            ] }
        ],
        loesung:
`SMART:
  S  spezifisch   — eindeutig, konkret, kein „irgendwie besser“
  M  messbar      — an einer Zahl überprüfbar
  A  attraktiv    — von den Beteiligten akzeptiert und mitgetragen
  R  realistisch  — mit den vorhandenen Mitteln und in der Zeit machbar
  T  terminiert   — mit festem Endtermin

Das Ziel „${schlecht.z}“ verstößt gegen: ${schlecht.fehlt.join(", ")}.
  „${schlecht.z.includes("bald") ? "bald" : schlecht.z.includes("irgendwann") ? "irgendwann" : "deutlich"}“ ist kein Termin und keine Zahl.

SMART formuliert, zum Beispiel:

    „${schlecht.gut}${schlecht.gut.endsWith("Abteilung ") ? c.abteilung + " auf Notebooks mit Dockingstation umgestellt" : ""}.“

Warum die Messbarkeit zählt: bei der Abnahme muss objektiv feststellbar sein, ob
das Ziel erreicht wurde. Ohne Zahl und Termin streiten Auftraggeber und
Auftragnehmer darüber, ob „benutzerfreundlich“ nun erreicht ist oder nicht — und
das Projekt lässt sich nicht sauber abschließen.`
      };
    }
  });

  /* ========================================= 11. Stakeholderanalyse ==== */
  G.vorlage({
    id: "pm-stakeholder", thema: "projekt", sub: "Stakeholder Management",
    titel: "Stakeholderanalyse durchführen", stufe: 2,
    merksatz: "Zwei Achsen: EINFLUSS (kann die Person das Projekt aufhalten?) und INTERESSE " +
      "(betrifft es sie überhaupt?). Hoher Einfluss + hohes Interesse = eng einbinden. Hoher " +
      "Einfluss + wenig Interesse = zufriedenstellen. Wenig Einfluss + hohes Interesse = informieren. " +
      "Beides gering = beobachten.",
    bau(R, c) {
      const leute = R.waehleN([
        { name: "Geschäftsführung", e: "hoch", i: "hoch", m: "eng einbinden — entscheidet über Budget und Freigaben" },
        { name: "Betriebsrat", e: "hoch", i: "hoch", m: "früh beteiligen — Mitbestimmung bei technischer Überwachung" },
        { name: "Beschäftigte der Fachabteilung", e: "gering", i: "hoch", m: "regelmäßig informieren und schulen" },
        { name: "IT-Dienstleister", e: "hoch", i: "hoch", m: "eng einbinden — liefert und betreibt die Lösung" },
        { name: "Datenschutzbeauftragter", e: "hoch", i: "gering", m: "zufriedenstellen — rechtzeitig einbinden, sonst blockiert er die Freigabe" },
        { name: "Kundinnen und Kunden", e: "gering", i: "hoch", m: "über Änderungen informieren" },
        { name: "Reinigungsdienst", e: "gering", i: "gering", m: "nur beobachten, kein Aufwand nötig" }
      ], R.waehle([4, 5]));

      return {
        situation:
`Die ${c.firma} führt in der Abteilung ${c.abteilung} eine neue Fachanwendung ein. Vor dem Start
wird eine Stakeholderanalyse erstellt.`,
        prompt: "Ordnen Sie die Beteiligten ein und leiten Sie die passende Strategie ab.",
        felder: [
          { typ: "raster", label: "Stakeholderanalyse",
            kopf: ["Beteiligte", "Einfluss (hoch/gering)", "Interesse (hoch/gering)", "Strategie"],
            zeilen: leute.map(l => ({
              zellen: [
                { t: l.name },
                { eingabe: true, text: [l.e], be: 0.5 },
                { eingabe: true, text: [l.i], be: 0.5 },
                { eingabe: true, text: [l.m].concat(l.m.split(" — ")), be: 1 }
              ]
            })) },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum wird der Betriebsrat bei der Einführung einer neuen Anwendung früh beteiligt?",
            erwartet: [
              ["die Anwendung könnte Verhalten und Leistung der Beschäftigten überwachen", "technische Einrichtung zur Leistungskontrolle"],
              ["dabei hat der Betriebsrat ein Mitbestimmungsrecht", "Mitbestimmung nach dem Betriebsverfassungsgesetz", "ohne Zustimmung darf sie nicht eingeführt werden"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Was passiert, wenn ein einflussreicher Stakeholder erst spät eingebunden wird?",
            erwartet: [
              ["er kann das Projekt kurz vor dem Abschluss noch stoppen", "späte Blockade", "Freigabe wird verweigert"],
              ["Änderungen werden am Ende teuer, weil schon viel gebaut wurde", "Nacharbeit kostet Zeit und Geld", "Verzögerung und Mehrkosten"]
            ] }
        ],
        loesung:
`Stakeholderanalyse:

  Beteiligte                        Einfluss  Interesse  Strategie
` + leute.map(l => "  " + l.name.padEnd(34) + l.e.padEnd(10) + l.i.padEnd(11) + l.m.split(" — ")[0]).join("\n") +

`\n\nDie vier Felder der Matrix:
  Einfluss hoch  / Interesse hoch    → eng einbinden, aktiv managen
  Einfluss hoch  / Interesse gering  → zufriedenstellen, rechtzeitig fragen
  Einfluss gering/ Interesse hoch    → informieren, mitnehmen
  Einfluss gering/ Interesse gering  → beobachten, kein Aufwand

Begründungen:
` + leute.map(l => "  • " + l.name + ": " + l.m).join("\n") +

`\n\nBetriebsrat: eine Anwendung, die Bearbeitungszeiten, Anmeldungen oder
Bearbeitungsmengen aufzeichnet, ist eine „technische Einrichtung, die geeignet
ist, Verhalten oder Leistung der Beschäftigten zu überwachen“ (§ 87 Abs. 1 Nr. 6
BetrVG). Der Betriebsrat hat dabei ein echtes Mitbestimmungsrecht — ohne ihn
darf die Anwendung nicht eingeführt werden.

Späte Einbindung ist der teuerste Fehler im Projektmanagement: je später eine
Anforderung kommt, desto mehr fertige Arbeit muss dafür wieder aufgemacht werden.
Ein Einspruch kurz vor der Abnahme kann ein ganzes Projekt stoppen.`
      };
    }
  });

  /* ============================================ 12. Anforderungen ====== */
  G.vorlage({
    id: "pm-anforderungen", thema: "projekt", sub: "Anforderungsmanagement",
    titel: "Funktionale und nicht-funktionale Anforderungen trennen", stufe: 2,
    merksatz: "Funktional = WAS das System tun soll („kann Rechnungen als PDF exportieren“). " +
      "Nicht-funktional = WIE GUT („in unter 2 Sekunden“, „auch auf dem Handy“, „nach DSGVO“). " +
      "Prüfungstrick: steht eine Zahl oder ein Qualitätswort darin, ist es meist nicht-funktional.",
    bau(R, c) {
      const paare = R.mische([
        ["Das System exportiert Rechnungen als PDF.", "funktional"],
        ["Die Suche liefert das Ergebnis in weniger als zwei Sekunden.", "nicht-funktional"],
        ["Benutzer melden sich mit Benutzername und Passwort an.", "funktional"],
        ["Die Oberfläche ist auch auf einem Tablet bedienbar.", "nicht-funktional"],
        ["Das System erstellt monatlich eine Auswertung je Abteilung.", "funktional"],
        ["Das System ist zu 99,5 % im Jahr verfügbar.", "nicht-funktional"]
      ]).slice(0, R.waehle([5, 6]));

      return {
        situation:
`Für die neue Fachanwendung der ${c.firma} hat die Abteilung ${c.abteilung} Anforderungen
gesammelt. Sie sollen diese für das Pflichtenheft sortieren.`,
        prompt: "Ordnen Sie die Anforderungen zu und beantworten Sie die Fragen.",
        felder: [
          { typ: "zuordnung", label: "Anforderung → Art", be: paare.length,
            optionen: ["funktional", "nicht-funktional"], paare },
          { typ: "raster", label: "Lastenheft und Pflichtenheft gegenüberstellen",
            kopf: ["Frage", "Lastenheft", "Pflichtenheft"],
            zeilen: [
              { zellen: [{ t: "Wer schreibt es?" }, { eingabe: true, text: ["der Auftraggeber", "der Kunde"], be: 1 }, { eingabe: true, text: ["der Auftragnehmer", "der Lieferant", "der Dienstleister"], be: 1 }] },
              { zellen: [{ t: "Was steht drin?" }, { eingabe: true, text: ["was gefordert wird", "die Anforderungen, das WAS", "Gesamtheit der Forderungen"], be: 1 }, { eingabe: true, text: ["wie es umgesetzt wird", "die Umsetzung, das WIE", "Realisierungsvorschlag"], be: 1 }] }
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum müssen nicht-funktionale Anforderungen mit einer Zahl versehen werden?",
            erwartet: [
              ["sonst ist bei der Abnahme nicht prüfbar, ob sie erfüllt sind", "nur mit Zahl messbar", "objektiv überprüfbar"],
              ["„schnell“ versteht jeder anders", "unklare Begriffe führen zu Streit", "Auslegungssache ohne Kennzahl"]
            ] },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: false,
            label: "Nennen Sie drei typische Bereiche nicht-funktionaler Anforderungen",
            erwartet: [
              ["Leistung", "Antwortzeit", "Performance", "Geschwindigkeit"],
              ["Verfügbarkeit", "Ausfallsicherheit"],
              ["Sicherheit", "Datenschutz", "Zugriffsschutz"],
              ["Benutzbarkeit", "Bedienbarkeit", "Usability", "Barrierefreiheit"],
              ["Wartbarkeit", "Erweiterbarkeit", "Pflegbarkeit"],
              ["Kompatibilität", "unterstützte Browser oder Betriebssysteme", "Portabilität"],
              ["Skalierbarkeit", "gleichzeitige Benutzer"]
            ] }
        ],
        loesung:
`Einordnung:
` + paare.map(p => "  " + p[1].padEnd(18) + p[0]).join("\n") +

`\n\nDer Unterschied in einem Satz:
  funktional       WAS das System können muss — eine Funktion, ein Ergebnis
  nicht-funktional WIE GUT es das können muss — Qualität, Rahmenbedingungen

Erkennungshilfe für die Prüfung: enthält der Satz eine Zahl, eine Zeitangabe,
einen Prozentwert oder ein Qualitätswort („schnell“, „sicher“, „bedienbar“),
ist es fast immer eine nicht-funktionale Anforderung.

Lastenheft und Pflichtenheft:
  Lastenheft    vom AUFTRAGGEBER — was gefordert wird (das WAS)
  Pflichtenheft vom AUFTRAGNEHMER — wie er es umsetzen will (das WIE)
  Merksatz: „Der Kunde LASTET auf, der Anbieter verPFLICHTet sich.“

Warum Zahlen unverzichtbar sind: „Die Suche soll schnell sein“ ist keine
Anforderung, sondern ein Wunsch. Bei der Abnahme hält der Auftraggeber drei
Sekunden für zu langsam, der Auftragnehmer für völlig in Ordnung — und niemand
kann es entscheiden. „Ergebnis in unter 2 Sekunden bei 50 gleichzeitigen
Benutzern“ ist dagegen messbar.

Typische Bereiche: Leistung, Verfügbarkeit, Sicherheit, Benutzbarkeit,
Wartbarkeit, Kompatibilität, Skalierbarkeit.`
      };
    }
  });

  /* ============================================ 13. Make or Buy ======== */
  G.vorlage({
    id: "pm-makeorbuy", thema: "projekt", sub: "Make-or-Buy-Entscheidung",
    titel: "Make-or-Buy: selbst betreiben oder einkaufen", stufe: 3,
    merksatz: "Erst rechnen, dann argumentieren. Beim Selbstbetrieb die versteckten Posten nicht " +
      "vergessen: Personal, Strom, Raum, Wartung, Ausfallrisiko. Und dann die weichen Faktoren: " +
      "Know-how, Abhängigkeit vom Anbieter, Datenschutz.",
    bau(R, c) {
      const jahre = R.waehle([3, 4, 5]);
      const leistung = R.waehle(["den Dateiserver", "das Ticketsystem", "die Warenwirtschaft", "den Mailserver"]);

      const anschaffung = R.stufe(12000, 45000, 500);
      const wartungJ = R.stufe(1200, 4800, 100);
      const stromJ = R.stufe(400, 1600, 50);
      const personalJ = R.stufe(3000, 12000, 500);
      const makeJ = r(wartungJ + stromJ + personalJ, 2);
      const makeGesamt = r(anschaffung + makeJ * jahre, 2);

      const monat = R.stufe(280, 1400, 20);
      const einmalig = R.stufe(1500, 8000, 500);
      const buyGesamt = r(einmalig + monat * 12 * jahre, 2);

      const guenstiger = makeGesamt <= buyGesamt ? "Eigenbetrieb (Make)" : "Fremdbezug (Buy)";
      const differenz = r(Math.abs(makeGesamt - buyGesamt), 2);

      return {
        situation:
`Die ${c.firma} überlegt, ob sie ${leistung} weiter selbst betreibt oder als Dienst einkauft.
Betrachtungszeitraum: ${jahre} Jahre.

    EIGENBETRIEB (Make)
      Anschaffung Hardware und Lizenzen (einmalig)   ${f.eur(anschaffung)}
      Wartung und Support je Jahr                    ${f.eur(wartungJ)}
      Strom und Klimatisierung je Jahr               ${f.eur(stromJ)}
      anteilige Personalkosten je Jahr               ${f.eur(personalJ)}

    FREMDBEZUG (Buy)
      einmalige Einrichtung und Datenübernahme       ${f.eur(einmalig)}
      monatliche Gebühr                              ${f.eur(monat)}`,
        prompt: "Rechnen Sie beide Varianten über den Betrachtungszeitraum und entscheiden Sie begründet.",
        felder: [
          { typ: "zahl", label: "Laufende Kosten Eigenbetrieb je Jahr", einheit: "€", be: 1, dez: 2, loesung: makeJ },
          { typ: "zahl", label: `Gesamtkosten Eigenbetrieb über ${jahre} Jahre`, einheit: "€", be: 2, dez: 2, loesung: makeGesamt },
          { typ: "zahl", label: `Gesamtkosten Fremdbezug über ${jahre} Jahre`, einheit: "€", be: 2, dez: 2, loesung: buyGesamt },
          { typ: "zahl", label: "Kostenunterschied zwischen beiden Varianten", einheit: "€", be: 1, dez: 2, loesung: differenz },
          { typ: "auswahl", label: "Welche Variante ist rein rechnerisch günstiger?", be: 1,
            optionen: ["Eigenbetrieb (Make)", "Fremdbezug (Buy)"], loesung: guenstiger },
          { typ: "liste", be: 4, zeilen: 5, noetig: 4, satzbau: true, minWorte: 8,
            label: "Nennen Sie vier Gesichtspunkte, die neben den Kosten in die Entscheidung gehören",
            erwartet: [
              ["eigenes Know-how geht verloren oder muss aufgebaut werden", "Fachwissen im Haus halten", "Abhängigkeit vom eigenen Personal"],
              ["Abhängigkeit vom Anbieter", "Vendor-Lock-in", "Wechsel später schwierig"],
              ["Datenschutz und Ort der Datenverarbeitung", "wo liegen die Daten", "Auftragsverarbeitungsvertrag nötig"],
              ["Verfügbarkeit und vereinbarte Reaktionszeiten", "SLA mit dem Anbieter", "wer haftet bei Ausfall"],
              ["Personal wird für andere Aufgaben frei", "Entlastung der eigenen IT", "Kapazität im Haus"],
              ["Planbarkeit der Kosten", "feste monatliche Kosten statt Investition", "Liquidität wird geschont"],
              ["Skalierbarkeit bei wachsendem Bedarf", "flexibel erweiterbar"],
              ["Rückholbarkeit der Daten am Vertragsende", "Exit-Strategie", "Datenherausgabe geregelt"]
            ] }
        ],
        loesung:
`EIGENBETRIEB (Make):
  laufend je Jahr:  ${f.eur(wartungJ)} + ${f.eur(stromJ)} + ${f.eur(personalJ)} = ${f.eur(makeJ)}
  über ${jahre} Jahre:    ${f.eur(anschaffung)} + ${f.eur(makeJ)} × ${jahre} = ${f.eur(makeGesamt)}

FREMDBEZUG (Buy):
  laufend je Jahr:  ${f.eur(monat)} × 12 = ${f.eur(r(monat * 12, 2))}
  über ${jahre} Jahre:    ${f.eur(einmalig)} + ${f.eur(r(monat * 12, 2))} × ${jahre} = ${f.eur(buyGesamt)}

Unterschied: ${f.eur(differenz)} zugunsten von ${guenstiger}.

Nicht vergessen: beim Eigenbetrieb stecken Kosten, die man leicht übersieht —
anteilige Personalkosten, Strom, Klimatisierung, Raum, Versicherung, und das
Ausfallrisiko. Die IHK prüft genau diese Vollständigkeit.

Über die Zahlen hinaus zählen:
  • Know-how — wird eigenes Fachwissen aufgebaut oder abgegeben?
  • Abhängigkeit vom Anbieter (Vendor-Lock-in) und Rückholbarkeit der Daten
  • Datenschutz: Ort der Verarbeitung, Auftragsverarbeitungsvertrag (Art. 28 DSGVO)
  • Verfügbarkeit: welche SLA werden zugesichert, wer haftet bei Ausfall?
  • Entlastung der eigenen IT für wichtigere Aufgaben
  • Liquidität: monatliche Gebühr statt großer Investition
  • Skalierbarkeit, wenn der Bedarf wächst

Eine Empfehlung, die nur die Endsumme vergleicht, ist in der Prüfung nur die
halbe Antwort.`
      };
    }
  });

  /* ============================================ 14. Arbeitsrecht ======= */
  G.vorlage({
    id: "recht-arbeitsrecht", thema: "datenschutz", sub: "Arbeitsrecht",
    titel: "Arbeitsrecht im Ausbildungsbetrieb", stufe: 2,
    merksatz: "Bei Auszubildenden gilt zusätzlich das Berufsbildungsgesetz: Probezeit 1 bis 4 " +
      "Monate, danach kann der Betrieb nur noch aus wichtigem Grund kündigen — die Auszubildende " +
      "aber mit 4 Wochen Frist, wenn sie die Ausbildung aufgeben will.",
    bau(R, c) {
      const aussagen = R.mische([
        { t: "Die Probezeit in einem Ausbildungsverhältnis dauert mindestens einen und höchstens vier Monate.", wahr: true },
        { t: "Nach der Probezeit kann der Ausbildungsbetrieb jederzeit mit vier Wochen Frist kündigen.", wahr: false },
        { t: "Die werktägliche Arbeitszeit darf acht Stunden nicht überschreiten, in Ausnahmen bis zehn Stunden bei Ausgleich.", wahr: true },
        { t: "Ab sechs Stunden Arbeitszeit steht eine Pause von mindestens 30 Minuten zu.", wahr: true },
        { t: "Der gesetzliche Mindesturlaub beträgt bei einer Fünftagewoche 20 Werktage im Jahr.", wahr: true },
        { t: "Ein Arbeitsvertrag muss immer schriftlich geschlossen werden, sonst ist er unwirksam.", wahr: false },
        { t: "Der Betriebsrat ist vor jeder ordentlichen Kündigung anzuhören.", wahr: true }
      ]).slice(0, 6);
      const paare = R.mische([
        ["regelt Arbeitszeit, Pausen und Ruhezeiten", "Arbeitszeitgesetz"],
        ["regelt Ausbildungsvertrag, Probezeit und Ausbildungsnachweis", "Berufsbildungsgesetz"],
        ["regelt die Rechte des Betriebsrats", "Betriebsverfassungsgesetz"],
        ["regelt den Mindesturlaub", "Bundesurlaubsgesetz"],
        ["schützt vor Benachteiligung wegen Herkunft, Geschlecht oder Alter", "Allgemeines Gleichbehandlungsgesetz"]
      ]);
      return {
        situation:
`In der Personalabteilung der ${c.firma} tauchen Fragen zum Arbeits- und Ausbildungsrecht auf.`,
        prompt: "Beurteilen Sie die Aussagen und ordnen Sie die Gesetze zu.",
        felder: [
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "zuordnung", label: "Regelungsbereich → Gesetz", be: 5,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum ist die Kündigung eines Auszubildenden nach der Probezeit für den Betrieb schwierig?",
            erwartet: [
              ["nach der Probezeit ist eine Kündigung durch den Betrieb nur aus wichtigem Grund möglich", "nur fristlose Kündigung aus wichtigem Grund", "ordentliche Kündigung ist ausgeschlossen"],
              ["die Ausbildung soll geschützt und zu Ende geführt werden", "besonderer Schutz des Ausbildungsverhältnisses", "der Ausbildungserfolg steht im Vordergrund"]
            ] }
        ],
        loesung:
`Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nGesetze:
` + paare.map(p => "  " + p[1].padEnd(34) + p[0]).join("\n") +

`\n\nDie wichtigsten Zahlen für die Prüfung:
  Probezeit Ausbildung        1 bis 4 Monate
  Kündigung in der Probezeit  jederzeit, ohne Frist, ohne Grund (beide Seiten)
  Kündigung danach            Betrieb: nur aus wichtigem Grund (fristlos)
                              Auszubildende: 4 Wochen, wenn sie die Ausbildung
                              aufgeben oder in einen anderen Beruf wechseln
  Arbeitszeit                 8 Stunden werktäglich, bis 10 mit Ausgleich
                              innerhalb von 6 Monaten
  Pausen                      ab 6 Stunden: 30 Minuten, ab 9 Stunden: 45 Minuten
  Ruhezeit                    mindestens 11 Stunden zwischen zwei Schichten
  Mindesturlaub               24 Werktage bei Sechstagewoche = 20 Tage bei Fünftagewoche

Ein Arbeitsvertrag ist auch mündlich wirksam — der Arbeitgeber muss die
wesentlichen Bedingungen aber schriftlich niederlegen (Nachweisgesetz). Ein
AUSBILDUNGSvertrag dagegen ist schriftlich niederzulegen und wird bei der
zuständigen Stelle (IHK) eingetragen.

Kündigungsschutz nach der Probezeit: das Ausbildungsverhältnis ist kein
gewöhnliches Arbeitsverhältnis, sondern soll zum Abschluss führen. Deshalb kann
der Betrieb danach nur noch aus wichtigem Grund kündigen — etwa bei
wiederholtem, abgemahntem Fehlverhalten.`
      };
    }
  });

  /* ============================================ 15. Vertragsarten ====== */
  G.vorlage({
    id: "recht-vertragsarten", thema: "datenschutz", sub: "Vertragsrecht",
    titel: "Vertragsarten in der IT unterscheiden", stufe: 2,
    merksatz: "Kaufvertrag = Eigentum wechselt dauerhaft. Werkvertrag = ein ERFOLG wird geschuldet " +
      "(die Software läuft). Dienstvertrag = nur das TÄTIGWERDEN (Beratung, Support-Stunden). " +
      "Mietvertrag = Nutzung auf Zeit gegen Entgelt (Cloud, Leasing-ähnlich).",
    bau(R, c) {
      const paare = R.mische([
        ["Ein Dienstleister erstellt eine individuelle Fachanwendung, die am Ende abgenommen wird.", "Werkvertrag"],
        ["Die Firma kauft 20 Notebooks mit Übergang des Eigentums.", "Kaufvertrag"],
        ["Ein externer Berater unterstützt drei Tage pro Monat, ohne festes Ergebnis.", "Dienstvertrag"],
        ["Die Firma nutzt eine Software als Cloud-Dienst gegen monatliche Gebühr.", "Mietvertrag"],
        ["Ein Techniker repariert einen defekten Drucker — geschuldet ist der funktionierende Drucker.", "Werkvertrag"]
      ]).slice(0, 5);
      const tage = R.waehle([7, 10, 14]);
      const monate = R.waehle([12, 24]);
      return {
        situation:
`Die ${c.firma} schließt für ein IT-Vorhaben mehrere Verträge ab. Die Rechtsabteilung
möchte die Vertragsarten sauber getrennt haben.`,
        prompt: "Ordnen Sie die Sachverhalte zu und beantworten Sie die Fragen zu den Rechten.",
        felder: [
          { typ: "zuordnung", label: "Sachverhalt → Vertragsart", be: 5,
            optionen: ["Kaufvertrag", "Werkvertrag", "Dienstvertrag", "Mietvertrag"], paare },
          { typ: "text", be: 3, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Worin unterscheiden sich Werkvertrag und Dienstvertrag? Erklären Sie an einem Beispiel.",
            erwartet: [
              ["beim Werkvertrag wird ein Erfolg geschuldet", "das Ergebnis muss geliefert werden", "die fertige Leistung ist geschuldet"],
              ["beim Dienstvertrag nur das Tätigwerden", "die Arbeitsleistung an sich, ohne garantiertes Ergebnis", "es wird die Bemühung geschuldet"],
              ["Beispiel: Programmierung einer Anwendung gegen Beratung nach Stunden", "der Werkunternehmer haftet für Mängel am Ergebnis"]
            ], noetig: 3 },
          { typ: "liste", be: 4, zeilen: 5, noetig: 4, satzbau: false,
            label: "Nennen Sie die vier Rechte des Käufers bei einem Sachmangel (Gewährleistung)",
            erwartet: [
              ["Nacherfüllung", "Nachbesserung oder Ersatzlieferung", "Reparatur oder Austausch"],
              ["Rücktritt vom Vertrag", "Wandlung", "Vertrag rückgängig machen"],
              ["Minderung des Kaufpreises", "Preisnachlass"],
              ["Schadensersatz", "Ersatz vergeblicher Aufwendungen"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "In welcher Reihenfolge stehen diese Rechte dem Käufer zu?",
            erwartet: [
              ["zuerst muss Nacherfüllung verlangt werden", "die Nacherfüllung hat Vorrang", "erst Nachbesserung oder Ersatzlieferung"],
              ["erst wenn sie scheitert oder verweigert wird, folgen Rücktritt, Minderung oder Schadensersatz", "danach die übrigen Rechte", "Verkäufer bekommt zuerst die Gelegenheit nachzubessern"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(16) + p[0]).join("\n") +

`\n\nDie vier Vertragsarten in der IT:
  Kaufvertrag    § 433 BGB   Eigentum geht dauerhaft über (Hardware, Kauflizenz)
  Werkvertrag    § 631 BGB   ein ERFOLG ist geschuldet, es gibt eine Abnahme
                             (Individualsoftware, Reparatur, Installation)
  Dienstvertrag  § 611 BGB   nur das TÄTIGWERDEN ist geschuldet, kein Erfolg
                             (Beratung, Support nach Stunden, Schulung)
  Mietvertrag    § 535 BGB   Nutzung auf Zeit gegen Entgelt (Cloud, SaaS)

Der Unterschied in einem Satz: der Werkunternehmer schuldet das fertige Ergebnis
und haftet für Mängel daran, der Dienstleister schuldet nur seine sorgfältige
Arbeit. Wer eine Anwendung programmieren lässt, will sie am Ende laufen sehen —
Werkvertrag. Wer einen Berater bucht, bezahlt dessen Zeit — Dienstvertrag.

Rechte bei einem Sachmangel (§ 437 BGB), in dieser Reihenfolge:
  1. NACHERFÜLLUNG — Nachbesserung (Reparatur) oder Ersatzlieferung.
     Der Käufer darf wählen, der Verkäufer bekommt zuerst die Gelegenheit.
  2. Erst wenn die Nacherfüllung fehlschlägt, verweigert wird oder die gesetzte
     angemessene Frist verstreicht:
       • Rücktritt vom Vertrag (nicht bei unerheblichem Mangel)
       • Minderung des Kaufpreises
       • Schadensersatz bzw. Ersatz vergeblicher Aufwendungen

Fristen zum Merken:
  Gewährleistung bei neuen beweglichen Sachen  2 Jahre
  Beweislastumkehr zugunsten des Verbrauchers  in den ersten 12 Monaten
  Rügefrist unter Kaufleuten (§ 377 HGB)       unverzüglich nach Untersuchung`
      };
    }
  });

})(window.GEN);
