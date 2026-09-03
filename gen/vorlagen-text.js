/* ============================================================================
   gen/vorlagen-text.js — Verbalaufgaben: IT-Sicherheit, Datenschutz, Recht,
   Hardware/Software. Genau die Aufgabenart, bei der Punkte durch zu kurze
   Antworten verloren gehen: die Prüfung verlangt hier ganze Sätze.
   ========================================================================== */
"use strict";
(function (G) {
  const Z = G.ZAHLWORT, f = G.fmt, r = G.runde;

  /* ====================== IT-SICHERHEIT ================================= */

  G.nennVorlage({
    id: "sich-tom", thema: "itsicherheit", sub: "Technisch-Organisatorische Maßnahmen (TOM)",
    titel: "Technische und organisatorische Maßnahmen", stufe: 2,
    merksatz: "Technisch = Technik greift (Verschlüsselung, Firewall, Backup). Organisatorisch = Regel oder Prozess greift (Richtlinie, Schulung, Berechtigungskonzept).",
    n: [2, 3],
    situation: (R, c) => `In der Abteilung ${c.abteilung} der ${c.firma} werden personenbezogene Daten von ` +
      `Kundinnen und Kunden verarbeitet. Bei einer internen Prüfung wurde festgestellt, dass die ` +
      `technisch-organisatorischen Maßnahmen nach Art. 32 DSGVO nicht vollständig dokumentiert sind.`,
    frage: (n, c) => `Nennen Sie ${Z[n]} technische Maßnahmen zum Schutz dieser Daten und erläutern Sie jeweils in einem Satz, wovor die Maßnahme schützt.`,
    pool: [
      ["Verschlüsselung der Festplatte", "Festplattenverschlüsselung", "BitLocker", "LUKS", "Verschlüsselung der Daten"],
      ["Transportverschlüsselung", "TLS", "HTTPS", "VPN", "verschlüsselte Übertragung"],
      ["Firewall", "Paketfilter"],
      ["Zugriffsschutz durch Benutzerkonten", "Authentifizierung", "Passwortschutz", "Mehr-Faktor-Authentifizierung", "MFA", "Zwei-Faktor"],
      ["Datensicherung", "Backup", "regelmäßige Sicherung"],
      ["Virenschutz", "Antivirus", "Endpoint Protection", "Schadsoftwareerkennung"],
      ["automatische Bildschirmsperre", "Bildschirmsperre", "Sperrbildschirm"],
      ["Protokollierung", "Logging", "Nachvollziehbarkeit durch Protokolle"],
      ["Patchmanagement", "aktuelle Updates", "Sicherheitsupdates einspielen"],
      ["Pseudonymisierung", "Anonymisierung der Daten"]
    ],
    zusatz: (R, c, n) => [{
      typ: "liste", label: "Nennen Sie zusätzlich zwei ORGANISATORISCHE Maßnahmen", be: 2, zeilen: 3, noetig: 2,
      satzbau: false,
      erwartet: [
        ["Berechtigungskonzept", "Rollenkonzept", "Need-to-know", "Rechtevergabe nach Aufgabe", "Zugriffsrechte regeln"],
        ["Schulung", "Sensibilisierung", "Unterweisung der Mitarbeiter", "Awareness"],
        ["Verpflichtung auf Vertraulichkeit", "Datengeheimnis", "Verschwiegenheitserklärung"],
        ["Passwortrichtlinie", "Sicherheitsrichtlinie", "IT-Richtlinie", "Clean-Desk-Policy"],
        ["Zutrittskontrolle", "abschließbare Räume", "Besucherregelung", "Schlüsselordnung"],
        ["Löschkonzept", "Aufbewahrungsfristen", "geregelte Entsorgung", "Aktenvernichtung"],
        ["Verzeichnis von Verarbeitungstätigkeiten", "Dokumentation der Verarbeitung"],
        ["Notfallplan", "Wiederanlaufplan", "Meldeprozess für Datenpannen"]
      ]
    }],
    loesung: (R, c, n) =>
`Technische Maßnahmen (Technik greift von selbst):
• Festplattenverschlüsselung, damit die Daten bei Diebstahl des Geräts nicht lesbar sind.
• Transportverschlüsselung (TLS/VPN), damit Daten auf dem Übertragungsweg nicht mitgelesen werden können.
• Firewall und Virenschutz, damit unerlaubte Zugriffe und Schadsoftware abgewehrt werden.
• Mehr-Faktor-Authentifizierung, damit ein gestohlenes Passwort allein keinen Zugang verschafft.
• Regelmäßige Datensicherung, damit die Daten nach einem Ausfall wiederherstellbar sind.
• Protokollierung, damit Zugriffe nachvollziehbar bleiben.

Organisatorische Maßnahmen (eine Regel greift):
• Berechtigungskonzept nach dem Need-to-know-Prinzip.
• Regelmäßige Schulung und Verpflichtung der Beschäftigten auf Vertraulichkeit.
• Passwort- und Clean-Desk-Richtlinie, Zutrittsregelung, Löschkonzept mit Aufbewahrungsfristen.

Achtung in der Prüfung: Jede Nennung braucht den Zweck („…, damit / weil …“). Ein Stichwort
allein ist nur der halbe Punkt.`
  });

  G.nennVorlage({
    id: "sich-phishing", thema: "itsicherheit", sub: "Phishing & Social Engineering",
    titel: "Phishing-Mail erkennen", stufe: 1,
    n: [3],
    situation: (R, c) => `${c.person} aus der Abteilung ${c.abteilung} meldet dem IT-Support der ${c.firma} ` +
      `eine E-Mail: Angeblich schreibt die Hausbank, das Konto werde „innerhalb von 24 Stunden gesperrt“, ` +
      `wenn die Zugangsdaten nicht über den beigefügten Link bestätigt würden. Die Anrede lautet ` +
      `„Sehr geehrter Kunde“, der Absender endet auf eine unbekannte Domain.`,
    frage: (n, c) => `Nennen Sie ${Z[n]} Merkmale, an denen ${c.person} die E-Mail als Phishing erkennen kann, und erläutern Sie jeweils kurz, warum das Merkmal verdächtig ist.`,
    pool: [
      ["unpersönliche Anrede", "Sehr geehrter Kunde", "keine namentliche Anrede"],
      ["Zeitdruck", "Drohung mit Sperrung", "Dringlichkeit", "Frist von 24 Stunden", "Druck aufbauen"],
      ["Aufforderung zur Eingabe von Zugangsdaten", "Passwort wird abgefragt", "Zugangsdaten bestätigen"],
      ["gefälschte Absenderadresse", "unbekannte Domain", "Absender stimmt nicht", "abweichende Domain"],
      ["Link führt woanders hin", "Linkziel weicht ab", "verdächtiger Link", "URL prüfen"],
      ["Rechtschreibfehler", "schlechte Grammatik", "fehlerhafte Sprache"],
      ["unerwarteter Anhang", "Anhang mit Makro", "unaufgeforderter Anhang"],
      ["Bank fragt nie nach Zugangsdaten", "unübliches Vorgehen", "unplausibler Vorgang"]
    ],
    zusatz: (R, c) => [{
      typ: "liste", label: "Wie soll " + c.person + " sich konkret verhalten? (zwei Schritte)", be: 2, zeilen: 3, noetig: 2,
      satzbau: false,
      erwartet: [
        ["nicht auf den Link klicken", "keine Anhänge öffnen", "nicht antworten"],
        ["keine Daten eingeben", "Zugangsdaten nicht preisgeben"],
        ["IT-Sicherheit melden", "an den IT-Support melden", "Vorgesetzten informieren", "Meldung an Sicherheitsbeauftragten"],
        ["Absender über bekannten Weg prüfen", "Bank direkt anrufen", "Rückfrage über offizielle Nummer"],
        ["E-Mail löschen nach Meldung", "in Quarantäne verschieben", "als Spam melden"]
      ]
    }],
    loesung: (R, c) =>
`Merkmale: unpersönliche Anrede („Sehr geehrter Kunde“), künstlicher Zeitdruck mit Drohung („Sperrung
innerhalb von 24 Stunden"), Abfrage von Zugangsdaten — was eine Bank niemals per E-Mail tut —,
gefälschte Absenderdomain, ein Link, dessen tatsächliches Ziel von der angezeigten Adresse abweicht,
sowie Rechtschreib- und Grammatikfehler.

Verhalten: weder Link anklicken noch Anhänge öffnen, keine Daten eingeben, die Mail dem IT-Support
bzw. der IT-Sicherheit melden und im Zweifel bei der Bank über die offiziell bekannte Rufnummer
nachfragen. Erst nach der Meldung löschen.`
  });

  G.vorlage({
    id: "sich-schutzziele", thema: "itsicherheit", sub: "Schutzziele der Informationssicherheit",
    titel: "Schutzziele zuordnen", stufe: 1,
    merksatz: "Vertraulichkeit = nur Befugte sehen es. Integrität = unverändert und echt. Verfügbarkeit = da, wenn man es braucht.",
    bau(R, c) {
      const alle = [
        ["Ein Mitarbeiter kann die Gehaltsliste einer anderen Abteilung öffnen.", "Vertraulichkeit"],
        ["Eine Preisliste wurde beim Übertragen unbemerkt verändert.", "Integrität"],
        ["Der Fileserver ist wegen eines Festplattendefekts seit vier Stunden nicht erreichbar.", "Verfügbarkeit"],
        ["Ein Notebook mit unverschlüsselter Festplatte wird im Zug vergessen.", "Vertraulichkeit"],
        ["Nach einem Stromausfall fehlen die Buchungen der letzten Stunde.", "Verfügbarkeit"],
        ["Eine Rechnung im PDF-Format wurde nachträglich manipuliert.", "Integrität"],
        ["Ein Angreifer legt den Webshop durch eine Überlastung lahm.", "Verfügbarkeit"],
        ["Kundendaten werden versehentlich an einen falschen Verteiler gemailt.", "Vertraulichkeit"],
        ["Eine Datenbank meldet nach einem Absturz inkonsistente Datensätze.", "Integrität"]
      ];
      const paare = R.waehleN(alle, 5);
      return {
        situation: `Die ${c.firma} erfasst Sicherheitsvorfälle und ordnet jeden Vorfall dem verletzten ` +
          `Schutzziel zu.`,
        prompt: "Ordnen Sie jedem Vorfall das verletzte Schutzziel zu und erklären Sie eines davon.",
        felder: [
          { typ: "zuordnung", label: "Vorfall → verletztes Schutzziel", be: 5,
            optionen: ["Vertraulichkeit", "Integrität", "Verfügbarkeit"], paare },
          { typ: "text", label: "Erläutern Sie das Schutzziel Integrität in einem vollständigen Satz",
            be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["Daten unverändert", "nicht unbemerkt verändert", "Korrektheit", "Unversehrtheit", "Echtheit"]] }
        ],
        loesung: paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nIntegrität bedeutet, dass Daten vollständig und unverändert bleiben und jede Veränderung erkennbar
ist — damit man sich darauf verlassen kann, dass eine Information noch dem Original entspricht.
Technisch abgesichert wird sie zum Beispiel durch Prüfsummen, Hashwerte und digitale Signaturen.`
      };
    }
  });

  G.vorlage({
    id: "sich-ransomware", thema: "itsicherheit", sub: "Notfall & Schadsoftware",
    titel: "Verschlüsselungstrojaner — Sofortmaßnahmen", stufe: 2,
    bau(R, c) {
      const uhr = R.ganz(7, 17) + ":" + R.waehle(["05", "12", "20", "35", "48"]);
      return {
        situation: `Um ${uhr} Uhr meldet ${c.person} der ${c.firma}, dass sich Dateien auf dem Netzlaufwerk ` +
          `nicht mehr öffnen lassen. Auf dem Bildschirm erscheint eine Lösegeldforderung. ` +
          `Weitere Arbeitsplätze der Abteilung ${c.abteilung} melden dasselbe.`,
        prompt: "Beschreiben Sie das richtige Vorgehen.",
        felder: [
          { typ: "liste", label: "Drei Sofortmaßnahmen in der richtigen Reihenfolge", be: 3, zeilen: 4, noetig: 3,
            satzbau: false,
            erwartet: [
              ["betroffene Systeme vom Netz trennen", "Netzwerkkabel ziehen", "isolieren", "WLAN trennen"],
              ["nicht herunterfahren", "System nicht ausschalten", "eingeschaltet lassen für Analyse", "Speicherabbild sichern"],
              ["IT-Sicherheit und Geschäftsführung informieren", "Vorfall melden", "Notfallplan auslösen", "Meldekette"],
              ["Beweise sichern", "protokollieren", "Screenshot", "dokumentieren"],
              ["kein Lösegeld zahlen", "nicht zahlen"],
              ["Wiederherstellung aus dem Backup", "Backup prüfen", "aus Sicherung zurückspielen", "Neuinstallation"],
              ["Anzeige erstatten", "Datenschutzbehörde melden", "Meldung nach Art. 33 DSGVO", "72 Stunden"]
            ] },
          { typ: "auswahl", label: "Soll das Lösegeld gezahlt werden?", be: 1, optionen: ["ja", "nein"], loesung: "nein" },
          { typ: "text", label: "Begründen Sie Ihre Antwort", be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["keine Garantie", "Täter werden finanziert", "kein Anspruch auf Schlüssel",
              "erneute Erpressung", "Daten bleiben abgeflossen", "Straftat wird gefördert"]] },
          { typ: "liste", label: "Zwei vorbeugende Maßnahmen gegen Ransomware", be: 2, zeilen: 3, noetig: 2,
            satzbau: false,
            erwartet: [
              ["Offline-Backup", "Backup nach 3-2-1-Regel", "getrennte Sicherung", "unveränderbares Backup", "Air Gap"],
              ["Patchmanagement", "Updates einspielen", "aktuelle Software"],
              ["Schulung der Mitarbeiter", "Awareness", "Sensibilisierung gegen Phishing"],
              ["Rechte einschränken", "keine Administratorrechte im Alltag", "Least Privilege", "Berechtigungskonzept"],
              ["E-Mail-Filter", "Spamfilter", "Makros blockieren", "Anhänge filtern"],
              ["Netzsegmentierung", "VLAN", "Trennung der Netze"],
              ["Endpoint Protection", "Virenschutz", "EDR"]
            ] }
        ],
        loesung:
`Sofort: betroffene Systeme vom Netz trennen (Kabel ziehen, WLAN aus), damit sich die Verschlüsselung
nicht weiter ausbreitet — aber nicht herunterfahren, damit flüchtige Spuren erhalten bleiben.
Danach Notfallplan auslösen, IT-Sicherheit und Geschäftsführung informieren, alles dokumentieren,
Anzeige erstatten und die Meldepflicht nach Art. 33 DSGVO (72 Stunden) prüfen.
Wiederhergestellt wird ausschließlich aus einer geprüften, offline gehaltenen Sicherung.

Kein Lösegeld zahlen: Es gibt keine Garantie, dass ein funktionierender Schlüssel geliefert wird,
die abgeflossenen Daten bleiben trotzdem in fremder Hand, und die Zahlung finanziert die Täter
und macht das Unternehmen zum Ziel für die nächste Erpressung.

Vorbeugend: Offline- bzw. unveränderbare Backups nach der 3-2-1-Regel, konsequentes Patchmanagement,
Least-Privilege-Rechte, E-Mail-Filter mit Makro-Blockade, Netzsegmentierung und regelmäßige Schulungen.`
      };
    }
  });

  G.vorlage({
    id: "sich-passwort", thema: "itsicherheit", sub: "Authentifizierung",
    titel: "Passwortrichtlinie und MFA", stufe: 2,
    bau(R, c) {
      const laenge = R.waehle([8, 10, 12]);
      const zeichen = R.waehle([62, 72, 95]);
      const kombis = Math.pow(zeichen, laenge);
      const proSek = R.waehle([1e9, 1e10, 1e11]);
      const sek = kombis / proSek;
      const jahre = r(sek / (60 * 60 * 24 * 365), 1);

      return {
        situation: `Die ${c.firma} überarbeitet ihre Passwortrichtlinie. Ein Passwort mit ${laenge} Zeichen ` +
          `aus einem Zeichenvorrat von ${zeichen} Zeichen soll bewertet werden. ` +
          `Ein Angreifer schafft ${f.zahl(proSek, 0)} Versuche pro Sekunde (Brute Force).`,
        prompt: "Bewerten Sie die Passwortstärke und begründen Sie den Einsatz zusätzlicher Maßnahmen.",
        felder: [
          { typ: "text", label: "Anzahl möglicher Kombinationen (Formel genügt)", be: 1, zeilen: 1,
            erwartet: [[zeichen + "^" + laenge, zeichen + " hoch " + laenge, kombis.toExponential(2)]] },
          { typ: "zahl", label: "Rechnerische Dauer für das vollständige Durchprobieren", einheit: "Jahre",
            be: 2, loesung: jahre, dez: 1, tolRel: 0.05 },
          { typ: "liste", label: "Zwei Anforderungen einer guten Passwortrichtlinie (BSI-konform)",
            be: 2, zeilen: 3, noetig: 2, satzbau: false,
            erwartet: [
              ["ausreichende Länge", "mindestens 12 Zeichen", "Länge vor Komplexität"],
              ["verschiedene Zeichenarten", "Groß- und Kleinbuchstaben, Ziffern, Sonderzeichen"],
              ["kein Wiederverwenden", "für jeden Dienst ein eigenes Passwort", "keine Mehrfachnutzung"],
              ["keine Trivialpasswörter", "keine Wörterbuchwörter", "kein Bezug zur Person"],
              ["Wechsel nur bei Verdacht", "kein erzwungener regelmäßiger Wechsel", "Wechsel bei Kompromittierung"],
              ["Passwortmanager", "sichere Aufbewahrung", "nicht aufschreiben"],
              ["Sperrung nach Fehlversuchen", "Anmeldeversuche begrenzen"]
            ] },
          { typ: "text", label: "Warum reicht ein starkes Passwort allein nicht aus? Nennen Sie die zusätzliche Maßnahme und begründen Sie",
            be: 2, zeilen: 3, satzbau: true, minWorte: 10,
            erwartet: [["Mehr-Faktor-Authentifizierung", "MFA", "Zwei-Faktor", "zweiter Faktor", "2FA"],
                       ["Passwort kann abgefangen werden", "Phishing", "Datenleck", "gestohlenes Passwort allein nutzlos"]],
            noetig: 2 }
        ],
        loesung:
`Kombinationen: ${zeichen}^${laenge} ≈ ${kombis.toExponential(2)}
Dauer: ${kombis.toExponential(2)} ÷ ${f.zahl(proSek, 0)} Versuche/s ≈ ${f.zahl(r(sek, 0), 0)} s ≈ ${f.kurz(jahre)} Jahre.

Eine gute Richtlinie setzt auf Länge statt auf erzwungenen Wechsel: mindestens 12 Zeichen aus
mehreren Zeichenarten, für jeden Dienst ein eigenes Passwort, Passwortmanager statt Notizzettel,
Sperrung nach mehreren Fehlversuchen und Wechsel nur bei Verdacht auf Kompromittierung.

Ein starkes Passwort allein genügt nicht, weil es durch Phishing oder ein Datenleck beim Anbieter
in fremde Hände geraten kann. Deshalb ist Mehr-Faktor-Authentifizierung nötig: Ein gestohlenes
Passwort ist ohne den zweiten Faktor (Token, App, Hardwareschlüssel) wertlos.`
      };
    }
  });

  /* ====================== DATENSCHUTZ & RECHT =========================== */

  G.nennVorlage({
    id: "ds-betroffenenrechte", thema: "datenschutz", sub: "Betroffenenrechte DSGVO",
    titel: "Rechte betroffener Personen", stufe: 2,
    merksatz: "Auskunft (Art. 15) · Berichtigung (16) · Löschung (17) · Einschränkung (18) · Datenübertragbarkeit (20) · Widerspruch (21).",
    n: [3, 4],
    situation: (R, c) => `Eine Kundin der ${c.firma} schreibt an den Kundenservice: Sie möchte wissen, welche ` +
      `Daten über sie gespeichert sind, verlangt die Korrektur ihrer Anschrift und möchte künftig keine ` +
      `Werbung mehr erhalten.`,
    frage: (n, c) => `Nennen Sie ${Z[n]} Rechte, die betroffene Personen nach der DSGVO haben, und erläutern Sie jeweils in einem Satz, was das Recht bedeutet.`,
    pool: [
      ["Recht auf Auskunft", "Auskunftsrecht", "Art. 15"],
      ["Recht auf Berichtigung", "Berichtigung falscher Daten", "Art. 16"],
      ["Recht auf Löschung", "Recht auf Vergessenwerden", "Art. 17"],
      ["Recht auf Einschränkung der Verarbeitung", "Sperrung der Verarbeitung", "Art. 18"],
      ["Recht auf Datenübertragbarkeit", "Datenportabilität", "Art. 20"],
      ["Widerspruchsrecht", "Recht auf Widerspruch", "Art. 21", "Widerspruch gegen Direktwerbung"],
      ["Recht auf Widerruf der Einwilligung", "Einwilligung widerrufen", "Art. 7"],
      ["Recht auf Beschwerde bei der Aufsichtsbehörde", "Beschwerderecht", "Art. 77"],
      ["Recht, keiner automatisierten Entscheidung unterworfen zu werden", "Art. 22", "Profiling"]
    ],
    zusatz: (R, c) => [
      { typ: "zahl", label: "Innerhalb welcher Frist muss auf einen Auskunftsantrag geantwortet werden?",
        einheit: "Monat(e)", be: 1, dez: 0, loesung: 1, tolAbs: 0 },
      { typ: "text", label: "Was muss das Unternehmen tun, wenn die Kundin der Werbung widerspricht?",
        be: 1.5, zeilen: 2, satzbau: true, minWorte: 8,
        erwartet: [["Verarbeitung zu Werbezwecken sofort einstellen", "keine Werbung mehr senden",
          "Daten in Sperrliste", "Widerspruch dokumentieren", "Werbesperre"]] }
    ],
    loesung: (R, c, n) =>
`Betroffenenrechte nach der DSGVO:
• Auskunft (Art. 15): Die Person darf erfahren, welche Daten zu welchem Zweck verarbeitet werden.
• Berichtigung (Art. 16): Unrichtige Daten müssen korrigiert werden.
• Löschung (Art. 17): Daten sind zu löschen, wenn der Zweck entfallen ist und keine Aufbewahrungspflicht besteht.
• Einschränkung (Art. 18): Die Verarbeitung wird vorübergehend eingefroren, statt gelöscht zu werden.
• Datenübertragbarkeit (Art. 20): Herausgabe in einem gängigen, maschinenlesbaren Format.
• Widerspruch (Art. 21): Gegen Direktwerbung wirkt der Widerspruch immer und sofort.
• Beschwerde bei der Aufsichtsbehörde (Art. 77).

Frist: grundsätzlich ein Monat, verlängerbar um zwei weitere Monate bei komplexen Anträgen.
Beim Werbewiderspruch muss die Verarbeitung zu Werbezwecken unverzüglich eingestellt und der
Widerspruch dokumentiert werden (Werbesperre), damit er auch künftig beachtet wird.`
  });

  G.vorlage({
    id: "ds-anonymisierung", thema: "datenschutz", sub: "Anonymisierung & Pseudonymisierung",
    titel: "Anonymisierung oder Pseudonymisierung", stufe: 2,
    merksatz: "Pseudonymisiert = mit Zusatzwissen rückführbar, bleibt personenbezogen. Anonymisiert = nicht mehr rückführbar, DSGVO gilt nicht mehr.",
    bau(R, c) {
      const faelle = [
        ["Der Name wird durch eine laufende Nummer ersetzt; die Zuordnungstabelle liegt im Tresor.", "Pseudonymisierung"],
        ["Alle Namen, Adressen und Geburtsdaten werden gelöscht, es bleiben nur Altersgruppen übrig.", "Anonymisierung"],
        ["Die Kundennummer bleibt erhalten, der Klarname wird entfernt.", "Pseudonymisierung"],
        ["Auswertung enthält nur noch Summen je Postleitzahlgebiet mit mindestens 50 Personen.", "Anonymisierung"],
        ["Die E-Mail-Adresse wird durch einen Hashwert mit bekannter Zuordnung ersetzt.", "Pseudonymisierung"],
        ["Aus den Logdateien werden die letzten Stellen der IP-Adresse dauerhaft entfernt.", "Anonymisierung"]
      ];
      const paare = R.waehleN(faelle, 4);
      return {
        situation: `Die ${c.firma} möchte Auswertungen über das Verhalten ihrer Kundinnen und Kunden erstellen, ` +
          `ohne dabei mehr personenbezogene Daten zu verarbeiten als nötig. Die Datenschutzbeauftragte prüft ` +
          `mehrere Verfahren.`,
        prompt: "Ordnen Sie jedes Verfahren zu und erklären Sie den Unterschied.",
        felder: [
          { typ: "zuordnung", label: "Verfahren zuordnen", be: 4,
            optionen: ["Anonymisierung", "Pseudonymisierung"], paare },
          { typ: "text", label: "Erklären Sie den Unterschied zwischen beiden Verfahren in zwei Sätzen",
            be: 2.5, zeilen: 4, satzbau: true, minWorte: 12, noetig: 2,
            erwartet: [
              ["Pseudonymisierung ist mit Zusatzinformation rückführbar", "Zuordnung mit Schlüssel möglich",
                "mit Zusatzwissen wieder zuordenbar", "umkehrbar"],
              ["Anonymisierung ist nicht mehr rückführbar", "Personenbezug dauerhaft entfernt", "nicht umkehrbar"]
            ] },
          { typ: "auswahl", label: "Für welche Daten gilt die DSGVO weiterhin?", be: 1.5,
            optionen: ["nur für pseudonymisierte Daten", "nur für anonymisierte Daten", "für beide", "für keine von beiden"],
            loesung: "nur für pseudonymisierte Daten" }
        ],
        loesung: paare.map(p => `• ${p[0]} → ${p[1]}`).join("\n") +
`\n\nBei der Pseudonymisierung werden identifizierende Merkmale durch ein Kennzeichen ersetzt, die
Zuordnung bleibt aber über eine gesondert aufbewahrte Zusatzinformation möglich. Die Daten bleiben
deshalb personenbezogen und unterliegen weiterhin vollständig der DSGVO — die Pseudonymisierung ist
eine Schutzmaßnahme nach Art. 32, kein Ausstieg aus dem Datenschutzrecht.

Bei der Anonymisierung wird der Personenbezug dauerhaft und mit verhältnismäßigem Aufwand nicht mehr
herstellbar entfernt. Anonyme Daten sind keine personenbezogenen Daten mehr; die DSGVO findet auf sie
keine Anwendung.`
      };
    }
  });

  G.nennVorlage({
    id: "ds-av", thema: "datenschutz", sub: "Auftragsverarbeitung",
    titel: "Cloud-Dienst und Auftragsverarbeitung", stufe: 2,
    n: [2, 3],
    situation: (R, c) => `Die ${c.firma} will ihre Personalverwaltung zu einem Cloud-Anbieter auslagern. ` +
      `Der Anbieter speichert die Daten in einem Rechenzentrum innerhalb der EU und verarbeitet sie ` +
      `ausschließlich nach Weisung der ${c.firma}.`,
    frage: (n, c) => `Nennen Sie ${Z[n]} Punkte, die vor der Auslagerung datenschutzrechtlich geregelt oder geprüft werden müssen, und begründen Sie jeweils kurz.`,
    pool: [
      ["Vertrag zur Auftragsverarbeitung", "AV-Vertrag", "Art. 28 DSGVO", "Auftragsverarbeitungsvertrag"],
      ["technische und organisatorische Maßnahmen des Anbieters prüfen", "TOM prüfen", "Sicherheitsniveau prüfen", "Zertifizierung", "ISO 27001"],
      ["Ort der Verarbeitung", "Serverstandort", "Drittlandtransfer", "EU-Standort", "Standardvertragsklauseln"],
      ["Weisungsbindung", "Verarbeitung nur nach Weisung", "keine eigene Zweckbestimmung"],
      ["Unterauftragnehmer", "Subunternehmer regeln", "Genehmigung weiterer Auftragsverarbeiter"],
      ["Löschung und Rückgabe nach Vertragsende", "Löschkonzept", "Datenrückgabe"],
      ["Verzeichnis von Verarbeitungstätigkeiten ergänzen", "Verarbeitungsverzeichnis"],
      ["Meldewege bei Datenpannen", "Informationspflicht bei Verletzungen", "Art. 33"],
      ["Kontroll- und Auditrechte", "Nachweispflichten", "Prüfrechte"],
      ["Datenschutz-Folgenabschätzung", "DSFA", "Risikobewertung"],
      ["Betriebsrat beteiligen", "Mitbestimmung", "Betriebsvereinbarung"]
    ],
    zusatz: (R, c) => [{
      typ: "auswahl", label: "Wer bleibt gegenüber den Beschäftigten datenschutzrechtlich verantwortlich?",
      be: 1, optionen: ["der Cloud-Anbieter", "die " + c.firma, "beide zu gleichen Teilen", "die Aufsichtsbehörde"],
      loesung: "die " + c.firma
    }],
    loesung: (R, c, n) =>
`Vor der Auslagerung ist ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO zu schließen, weil der
Anbieter personenbezogene Daten weisungsgebunden für das Unternehmen verarbeitet. Zu prüfen sind
außerdem die technischen und organisatorischen Maßnahmen des Anbieters (Nachweise, Zertifizierungen),
der Verarbeitungsort — bei Drittländern braucht es zusätzlich Standardvertragsklauseln —, der Umgang
mit Unterauftragnehmern, Meldewege bei Datenpannen, Kontroll- und Auditrechte sowie Löschung und
Rückgabe nach Vertragsende. Das Verarbeitungsverzeichnis ist zu ergänzen, bei hohem Risiko ist eine
Datenschutz-Folgenabschätzung nötig, und der Betriebsrat ist zu beteiligen.

Verantwortlich im Sinne der DSGVO bleibt die ${c.firma} — die Auslagerung verlagert die Arbeit,
nicht die Verantwortung.`
  });

  G.vorlage({
    id: "recht-mangel", thema: "datenschutz", sub: "Kaufvertrag & Mängelrechte",
    titel: "Mangelhafte Lieferung", stufe: 2,
    merksatz: "Käuferrechte: Nacherfüllung (Nachbesserung oder Nachlieferung) zuerst — dann Rücktritt, Minderung oder Schadensersatz.",
    bau(R, c) {
      const faelle = [
        { txt: `Geliefert werden ${R.stufe(10, 40, 2)} Notebooks statt der bestellten ${R.stufe(42, 60, 2)} Stück.`,
          art: "Quantitätsmangel (Minderlieferung)", key: "menge" },
        { txt: `Geliefert wird ein Notebook mit 8 GB RAM statt der bestellten 16 GB.`,
          art: "Qualitätsmangel (Schlechtleistung)", key: "qualitaet" },
        { txt: `Geliefert werden Dockingstationen eines anderen Herstellers als bestellt.`,
          art: "Falschlieferung (aliud)", key: "falsch" },
        { txt: `Zwei der gelieferten Monitore weisen Transportschäden am Gehäuse auf.`,
          art: "Qualitätsmangel (Schlechtleistung)", key: "qualitaet" }
      ];
      const fall = R.waehle(faelle);
      const tage = R.ganz(2, 9);

      return {
        situation: `Die ${c.firma} hat bei einem Lieferanten Hardware bestellt. Bei der Warenannahme ` +
          `stellt ${c.person} fest: ${fall.txt} Der Mangel wird ${tage} Tage nach Lieferung entdeckt. ` +
          `Es handelt sich um einen zweiseitigen Handelskauf.`,
        prompt: "Beurteilen Sie den Fall rechtlich.",
        felder: [
          { typ: "auswahl", label: "Um welche Mangelart handelt es sich?", be: 1.5,
            optionen: ["Quantitätsmangel (Minderlieferung)", "Qualitätsmangel (Schlechtleistung)",
              "Falschlieferung (aliud)", "Rechtsmangel"], loesung: fall.art },
          { typ: "text", label: "Welche Pflicht trifft die " + c.firma + " als Käuferin sofort? Begründen Sie.",
            be: 2, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["unverzügliche Untersuchung und Rüge", "Mängelrüge", "§ 377 HGB", "unverzüglich anzeigen", "Rügepflicht"],
                       ["sonst gilt die Ware als genehmigt", "Verlust der Mängelrechte", "Ware gilt als angenommen"]],
            noetig: 2 },
          { typ: "liste", label: "Nennen Sie die Rechte der Käuferin in der richtigen Reihenfolge (drei Stufen)",
            be: 3, zeilen: 4, noetig: 3, satzbau: false,
            erwartet: [
              ["Nacherfüllung", "Nachbesserung", "Nachlieferung", "Ersatzlieferung", "Reparatur"],
              ["Rücktritt vom Vertrag", "Wandlung", "Rückgabe gegen Kaufpreis"],
              ["Minderung", "Preisnachlass", "Herabsetzung des Kaufpreises"],
              ["Schadensersatz", "Aufwendungsersatz"]
            ] },
          { typ: "text", label: "Warum darf die Käuferin nicht sofort vom Vertrag zurücktreten?",
            be: 1.5, zeilen: 3, satzbau: true, minWorte: 8,
            erwartet: [["Vorrang der Nacherfüllung", "Verkäufer hat Recht auf zweite Andienung",
              "erst Frist setzen", "angemessene Frist zur Nacherfüllung"]] }
        ],
        loesung:
`Mangelart: ${fall.art}.

Beim beiderseitigen Handelskauf muss die Käuferin die Ware nach § 377 HGB unverzüglich untersuchen
und einen erkennbaren Mangel unverzüglich rügen. Unterbleibt die Rüge, gilt die Ware als genehmigt
und die Mängelrechte gehen verloren.

Rechte der Käuferin (§ 437 BGB) in dieser Reihenfolge:
1. Nacherfüllung — Nachbesserung oder Ersatzlieferung; die Käuferin wählt.
2. Nach erfolglosem Ablauf einer angemessenen Frist: Rücktritt vom Vertrag oder Minderung des Kaufpreises.
3. Daneben Schadensersatz bzw. Ersatz vergeblicher Aufwendungen.

Ein sofortiger Rücktritt scheidet aus, weil die Nacherfüllung Vorrang hat: Dem Verkäufer steht das
Recht zur zweiten Andienung zu. Erst wenn eine gesetzte angemessene Frist fruchtlos verstreicht oder
die Nacherfüllung fehlschlägt, greifen Rücktritt und Minderung.`
      };
    }
  });

  /* ====================== HARDWARE / SOFTWARE =========================== */

  G.vorlage({
    id: "hw-geraetewahl", thema: "hardware", sub: "Arbeitsplatz & Geräteauswahl",
    titel: "Passendes Endgerät auswählen", stufe: 2,
    bau(R, c) {
      const szenarien = [
        { rolle: "Außendienstmitarbeitende, die täglich beim Kunden sind und unterwegs arbeiten",
          wahl: "Notebook", warum: ["mobil", "netzunabhängig", "Akku", "unterwegs arbeiten", "offline arbeiten"] },
        { rolle: "Sachbearbeitende im Callcenter mit festem Platz und rein serverbasierten Anwendungen",
          wahl: "Thin Client", warum: ["zentrale Verwaltung", "geringe Anschaffungskosten", "wenig Strom",
            "keine lokalen Daten", "einfacher Austausch", "lange Lebensdauer"] },
        { rolle: "Konstrukteure, die große CAD-Modelle rendern",
          wahl: "Workstation", warum: ["hohe Rechenleistung", "leistungsstarke Grafikkarte", "viel Arbeitsspeicher", "GPU"] },
        { rolle: "Lagerpersonal, das im Wareneingang Belege erfasst und quittiert",
          wahl: "Tablet mit Tastatur-Dock", warum: ["mobil im Lager", "Touchbedienung", "robust", "leicht", "Barcode"] }
      ];
      const s = R.waehle(szenarien);
      const optionen = ["Notebook", "Thin Client", "Workstation", "Tablet mit Tastatur-Dock"];

      return {
        situation: `Die ${c.firma} beschafft neue Endgeräte. Für eine Gruppe von Beschäftigten ist zu ` +
          `entscheiden: ${s.rolle}.`,
        prompt: "Wählen Sie das passende Gerät und begründen Sie Ihre Entscheidung fachlich.",
        felder: [
          { typ: "auswahl", label: "Empfohlenes Gerät", be: 1, optionen, loesung: s.wahl },
          { typ: "liste", label: "Zwei fachliche Begründungen für Ihre Wahl", be: 3, zeilen: 3, noetig: 2,
            satzbau: true, minWorte: 6, erwartet: s.warum.map(x => [x]) },
          { typ: "text", label: "Nennen Sie einen Nachteil Ihrer Wahl und wie er abgefedert wird",
            be: 2, zeilen: 3, satzbau: true, minWorte: 10,
            erwartet: [["Nachteil", "dafür", "allerdings", "jedoch", "abgefedert", "ausgeglichen",
              "Maßnahme", "kompensiert", "Risiko"]] },
          { typ: "liste", label: "Zwei Auswahlkriterien, die bei jeder Gerätebeschaffung geprüft werden",
            be: 2, zeilen: 3, noetig: 2, satzbau: false,
            erwartet: [
              ["Anschaffungskosten", "Preis", "Budget", "TCO", "Gesamtkosten"],
              ["Leistung", "CPU", "Arbeitsspeicher", "Rechenleistung", "Ausstattung"],
              ["Schnittstellen", "Anschlüsse", "Dockingfähigkeit", "USB-C", "LAN-Anschluss"],
              ["Garantie und Support", "Serviceverträge", "Vor-Ort-Service", "Reaktionszeit"],
              ["Ergonomie", "Gewicht", "Displaygröße", "Bildschirmqualität"],
              ["Energieeffizienz", "Stromverbrauch", "Nachhaltigkeit", "Reparierbarkeit"],
              ["Sicherheit", "TPM", "Verschlüsselung", "Verwaltbarkeit", "MDM"],
              ["Lieferzeit", "Verfügbarkeit"],
              ["Kompatibilität zur vorhandenen Software", "Systemanforderungen"]
            ] }
        ],
        loesung:
`Empfehlung: ${s.wahl}.
Begründung: ${f.liste(s.warum.slice(0, 3))} — die Anforderung „${s.rolle}“ verlangt genau das.

In der Prüfung zählt nicht das Gerät, sondern die Begründung: Jede Nennung braucht den Bezug zur
Aufgabenstellung („…, weil die Mitarbeitenden unterwegs ohne Netz arbeiten müssen“).

Übliche Auswahlkriterien: Anschaffungs- und Gesamtkosten (TCO), Leistung und Ausstattung,
Schnittstellen und Dockingfähigkeit, Garantie- und Serviceumfang mit Reaktionszeit, Ergonomie
und Gewicht, Energieeffizienz, Sicherheitsfunktionen und Verwaltbarkeit sowie Lieferzeit.`
      };
    }
  });

  G.nennVorlage({
    id: "sw-cloud", thema: "software", sub: "Virtualisierung & Cloud",
    titel: "SaaS, DaaS und virtuelle Desktops", stufe: 2,
    merksatz: "SaaS = fertige Anwendung aus dem Netz. DaaS = kompletter Arbeitsplatz (Desktop) aus dem Rechenzentrum.",
    n: [2, 3],
    situation: (R, c) => `Die ${c.firma} überlegt, den Arbeitsplätzen der Abteilung ${c.abteilung} statt ` +
      `lokal installierter Software virtuelle Desktops aus dem Rechenzentrum bereitzustellen (DaaS).`,
    frage: (n, c) => `Nennen Sie ${Z[n]} Vorteile virtueller Desktops für die ${c.firma} und erläutern Sie jeweils in einem Satz.`,
    pool: [
      ["zentrale Verwaltung", "zentrale Administration", "einmal pflegen statt an jedem Gerät", "zentrale Updates"],
      ["schnelle Bereitstellung neuer Arbeitsplätze", "neuer Arbeitsplatz in Minuten", "Standard-Image"],
      ["keine Daten auf dem Endgerät", "Daten bleiben im Rechenzentrum", "Datenschutz bei Verlust des Geräts"],
      ["längere Nutzungsdauer der Endgeräte", "geringere Hardwareanforderungen", "ältere Geräte weiter nutzbar", "Thin Clients möglich"],
      ["ortsunabhängiges Arbeiten", "Zugriff von überall", "Homeoffice", "gleicher Desktop überall"],
      ["zentrale Datensicherung", "Backup zentral", "einheitliche Sicherung"],
      ["schnelle Wiederherstellung", "defektes Gerät einfach tauschen", "Ausfall ohne Datenverlust"],
      ["einheitliche Sicherheitsrichtlinien", "zentrale Rechtevergabe", "einheitlicher Patchstand"],
      ["bedarfsgerechte Skalierung", "Ressourcen flexibel zuteilen"]
    ],
    zusatz: (R, c) => [{
      typ: "liste", label: "Nennen Sie zwei Nachteile bzw. Risiken", be: 2, zeilen: 3, noetig: 2, satzbau: false,
      erwartet: [
        ["Abhängigkeit vom Netzwerk", "ohne Netz kein Arbeiten", "Bandbreite nötig", "keine Offline-Nutzung"],
        ["Serverausfall legt alle lahm", "zentraler Ausfallpunkt", "Single Point of Failure", "hohe Verfügbarkeit nötig"],
        ["hohe Anfangsinvestition", "Serverinfrastruktur nötig", "Lizenzkosten"],
        ["Latenz", "spürbare Verzögerung", "Grafikleistung eingeschränkt", "ungeeignet für CAD"],
        ["Peripherie", "Probleme mit Spezialhardware", "USB-Geräte", "Drucker"],
        ["Abhängigkeit vom Anbieter", "Vendor Lock-in", "Datenschutz beim Anbieter", "Auftragsverarbeitung"]
      ]
    }],
    loesung: (R, c, n) =>
`Vorteile virtueller Desktops:
• Zentrale Verwaltung — Software, Updates und Richtlinien werden einmal im Rechenzentrum gepflegt
  statt an jedem einzelnen Gerät.
• Schnelle Bereitstellung — ein neuer Arbeitsplatz entsteht aus einem Standard-Image in Minuten.
• Sicherheit — auf dem Endgerät liegen keine Daten, ein verlorenes Gerät bedeutet keinen Datenabfluss.
• Geringere Anforderungen an die Endgeräte, dadurch längere Nutzungsdauer und Thin Clients möglich.
• Ortsunabhängiges Arbeiten mit identischem Desktop im Büro und im Homeoffice.
• Zentrale Sicherung und schneller Ersatz bei Hardwaredefekten.

Nachteile: vollständige Abhängigkeit von Netz und Serververfügbarkeit (Single Point of Failure),
spürbare Latenz bei grafikintensiven Anwendungen, Probleme mit Spezialperipherie sowie hohe
Anfangsinvestition in Server und Lizenzen.`
  });

})(window.GEN);
