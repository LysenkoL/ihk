/* ============================================================================
   gen/vorlagen-tabellen.js — die vier fehlenden Tabellentypen
   ----------------------------------------------------------------------------
   Tabellen sind mit rund 23,5 BE je Prüfung die dickste Kategorie. Hier die
   vier Formate, die in den echten Prüfungen vorkommen und bisher fehlten:
     1. IP-Konfigurationstabelle ausfüllen
     2. Backup-Wochenplan (Voll / Differenziell / Inkrementell)
     3. Fehleranalyse: Symptom → Ursache → Maßnahme
     4. Berechtigungsmatrix (Rolle × Ressource, Prinzip der geringsten Rechte)
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* Hilfen für IPv4 -------------------------------------------------------- */
  const zuZahl = a => a.split(".").reduce((s, o) => s * 256 + (+o), 0);
  const zuIp = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255].join(".");
  const maskeVon = p => zuIp(p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0);
  const netzVon = (ip, p) => zuIp((zuZahl(ip) & (p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0)) >>> 0);
  const bcVon = (ip, p) => zuIp((zuZahl(ip) | (p === 32 ? 0 : (~(0xFFFFFFFF << (32 - p))) >>> 0)) >>> 0);

  /* ==================================================== 1. IP-Tabelle == */
  G.vorlage({
    id: "tab-ipkonfig", thema: "netzwerk", sub: "IP-Konfigurationstabelle",
    titel: "IP-Konfigurationstabelle ausfüllen", stufe: 2,
    merksatz: "Netzadresse = IP UND Maske (alle Hostbits 0). Broadcast = alle Hostbits 1. " +
      "Nutzbare Hosts = 2^(32−Präfix) − 2. Das Gateway ist immer die erste oder letzte nutzbare Adresse — " +
      "nie die Netz- und nie die Broadcastadresse.",
    bau(R, c) {
      const praefix = R.waehle([24, 25, 26, 27, 28]);
      const dritte = R.ganz(1, 250);
      const block = Math.pow(2, 32 - praefix);
      const netzNr = R.ganz(0, Math.floor(256 / block) - 1) * block;
      const netz = "192.168." + dritte + "." + netzNr;
      const hostOffset = R.ganz(2, Math.max(2, block - 3));
      const ip = "192.168." + dritte + "." + (netzNr + hostOffset);

      const maske = maskeVon(praefix);
      const netzAdr = netzVon(ip, praefix);
      const broadcast = bcVon(ip, praefix);
      const ersteHost = zuIp(zuZahl(netzAdr) + 1);
      const letzteHost = zuIp(zuZahl(broadcast) - 1);
      const hosts = block - 2;
      const gatewayErste = R.muenze();
      const gateway = gatewayErste ? ersteHost : letzteHost;
      const dns = R.waehle(["9.9.9.9", "1.1.1.1", "8.8.8.8", zuIp(zuZahl(netzAdr) + 2)]);

      return {
        situation:
`Ein neuer Arbeitsplatzrechner in der Abteilung ${c.abteilung} der ${c.firma} soll eine feste IP-Adresse bekommen.
Vorgegeben ist:

    IP-Adresse des Rechners:  ${ip} /${praefix}
    Gateway:                  ${gatewayErste ? "die erste" : "die letzte"} nutzbare Adresse des Netzes
    DNS-Server:               ${dns}`,
        prompt: "Füllen Sie die IP-Konfigurationstabelle vollständig aus. Notieren Sie alle Adressen in Dezimalschreibweise.",
        felder: [
          { typ: "raster", label: "IP-Konfiguration",
            kopf: ["Feld", "Wert"],
            zeilen: [
              { zellen: [{ t: "IP-Adresse" }, { eingabe: true, text: [ip], be: 0.5 }] },
              { zellen: [{ t: "Subnetzmaske (dezimal)" }, { eingabe: true, text: [maske], be: 1 }] },
              { zellen: [{ t: "Netzadresse" }, { eingabe: true, text: [netzAdr], be: 1 }] },
              { zellen: [{ t: "Broadcastadresse" }, { eingabe: true, text: [broadcast], be: 1 }] },
              { zellen: [{ t: "erste nutzbare Hostadresse" }, { eingabe: true, text: [ersteHost], be: 0.5 }] },
              { zellen: [{ t: "letzte nutzbare Hostadresse" }, { eingabe: true, text: [letzteHost], be: 0.5 }] },
              { zellen: [{ t: "Standardgateway" }, { eingabe: true, text: [gateway], be: 1 }] },
              { zellen: [{ t: "DNS-Server" }, { eingabe: true, text: [dns], be: 0.5 }] }
            ] },
          { typ: "zahl", label: "Wie viele Geräte können in diesem Netz gleichzeitig adressiert werden?",
            einheit: "Geräte", be: 1, dez: 0, loesung: hosts },
          { typ: "text", be: 1, zeilen: 3, satzbau: true, minWorte: 8,
            label: "Warum darf die Netzadresse nicht als Hostadresse vergeben werden?",
            erwartet: [["Netzadresse bezeichnet das Netz selbst", "kennzeichnet das gesamte Netz", "adressiert das Netz, nicht ein Gerät", "reserviert für das Netz"]] }
        ],
        loesung:
`Präfix /${praefix} → ${32 - praefix} Hostbits.

Subnetzmaske:   /${praefix} = ${maske}
Netzadresse:    ${ip} UND ${maske} = ${netzAdr}   (alle Hostbits auf 0)
Broadcast:      ${broadcast}                       (alle Hostbits auf 1)
erste Hostadr.: ${ersteHost}      (Netzadresse + 1)
letzte Hostadr.:${letzteHost}     (Broadcast − 1)
Gateway:        ${gateway}        (${gatewayErste ? "erste" : "letzte"} nutzbare Adresse laut Vorgabe)
DNS:            ${dns}

Nutzbare Hosts: 2^${32 - praefix} − 2 = ${block} − 2 = ${hosts}

Die Netzadresse steht für das Netz als Ganzes, die Broadcastadresse spricht alle
Geräte darin gleichzeitig an. Beide sind deshalb reserviert und werden von der
Hostanzahl abgezogen.

Typischer Fehler: die „−2" vergessen oder Gateway auf die Netzadresse setzen.`
      };
    }
  });

  /* ================================================ 2. Backup-Wochenplan */
  G.vorlage({
    id: "tab-backupplan", thema: "daten", sub: "Backup-Wochenplan",
    titel: "Backup-Wochenplan aufstellen und Rücksicherung planen", stufe: 3,
    merksatz: "Differenziell sichert immer alles seit der letzten VOLLsicherung — zum Zurückholen " +
      "braucht man Voll + das letzte differenzielle Band (2 Bänder). Inkrementell sichert nur die " +
      "Änderungen seit der letzten Sicherung irgendeiner Art — zum Zurückholen braucht man Voll + " +
      "ALLE inkrementellen Bänder danach.",
    bau(R, c) {
      const art = R.waehle(["differenziell", "inkrementell"]);
      const vollTag = R.waehle(["Freitag", "Samstag", "Sonntag"]);
      const vollGB = R.stufe(200, 900, 20);
      const taeglichGB = R.stufe(8, 40, 2);
      const bandGB = R.waehle([400, 800, 1200, 1600]);
      const aufbewahrung = R.waehle([4, 6, 8, 12]);
      const tage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
      const crashTag = R.waehle(["Mittwoch", "Donnerstag", "Freitag"]);
      const crashIdx = tage.indexOf(crashTag);

      /* Datenmenge je Wochentag */
      const menge = tage.map((t, i) =>
        art === "differenziell" ? r(taeglichGB * (i + 1), 1) : taeglichGB);
      const wocheSumme = r(vollGB + menge.reduce((s, x) => s + x, 0), 1);
      const baenderZumZurueck = art === "differenziell" ? 2 : crashIdx + 2;

      return {
        situation:
`Die ${c.firma} sichert die Daten des Dateiservers auf Bandlaufwerken (LTO, ${bandGB} GB je Band).
Vorgaben der Geschäftsführung:

• Vollsicherung: jeden ${vollTag} in der Nacht, Datenmenge rund ${f.kurz(vollGB)} GB
• Montag bis Freitag: ${art}e Sicherung
• Täglich ändern sich rund ${f.kurz(taeglichGB)} GB Daten
• Die Bänder werden ${aufbewahrung} Wochen aufbewahrt`,
        prompt: `Füllen Sie den Wochenplan aus und beantworten Sie die Fragen zur Rücksicherung.`,
        felder: [
          { typ: "raster", label: "Zu sicherndes Datenvolumen je Tag (in GB)",
            kopf: ["Tag", "Sicherungsart", "Datenmenge in GB"],
            zeilen: tage.map((t, i) => ({
              zellen: [
                { t },
                { t: art === "differenziell" ? "differenziell" : "inkrementell" },
                { eingabe: true, loesung: menge[i], dez: 1, be: 0.5 }
              ]
            })) },
          { typ: "zahl", label: "Datenmenge einer kompletten Woche (Voll + alle Tagessicherungen)",
            einheit: "GB", be: 2, dez: 1, loesung: wocheSumme },
          { typ: "zahl", label: `Am ${crashTag} fällt der Server aus. Wie viele Bänder braucht man mindestens für die vollständige Rücksicherung?`,
            einheit: "Bänder", be: 2, dez: 0, loesung: baenderZumZurueck },
          { typ: "auswahl", be: 1,
            label: "Welche Aussage trifft auf die gewählte Sicherungsart zu?",
            optionen: art === "differenziell"
              ? ["Die Sicherung dauert jeden Tag gleich lang, das Zurückholen ist aufwendig.",
                 "Die Sicherung wird zum Wochenende hin länger, das Zurückholen bleibt einfach.",
                 "Es wird jeden Tag der komplette Datenbestand gesichert."]
              : ["Die Sicherung wird zum Wochenende hin länger, das Zurückholen bleibt einfach.",
                 "Die Sicherung dauert jeden Tag etwa gleich lang, das Zurückholen ist aufwendiger.",
                 "Es wird jeden Tag der komplette Datenbestand gesichert."],
            loesung: art === "differenziell"
              ? "Die Sicherung wird zum Wochenende hin länger, das Zurückholen bleibt einfach."
              : "Die Sicherung dauert jeden Tag etwa gleich lang, das Zurückholen ist aufwendiger." },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 7,
            label: "Nennen und begründen Sie drei organisatorische Regeln für die Bänder",
            erwartet: [
              ["Bänder an einem anderen Ort lagern", "räumlich getrennt aufbewahren", "Auslagerung in einen anderen Brandabschnitt", "externer Lagerort"],
              ["Rücksicherung regelmäßig testen", "Restore testen", "Wiederherstellung überprüfen"],
              ["Bänder beschriften und protokollieren", "Sicherungsprotokoll führen", "dokumentieren welches Band wann"],
              ["Bänder verschlüsseln", "Verschlüsselung der Sicherung"],
              ["Zugriff auf die Bänder beschränken", "verschlossener Schrank", "Zutritt begrenzen"],
              ["Bänder nach festgelegter Anzahl Durchläufe austauschen", "Medien altern, rechtzeitig ersetzen"]
            ] }
        ],
        loesung:
`Sicherungsart: ${art}

Datenmenge je Tag:
` + tage.map((t, i) => `  ${t.padEnd(12)} ${f.kurz(menge[i])} GB` +
        (art === "differenziell" ? `   (${i + 1} × ${f.kurz(taeglichGB)} GB seit der Vollsicherung)` : `   (nur die Änderungen seit gestern)`)).join("\n") +

`\n\nWoche gesamt: ${f.kurz(vollGB)} GB (Voll) + ${f.kurz(r(menge.reduce((s, x) => s + x, 0), 1))} GB (Tage) = ${f.kurz(wocheSumme)} GB

Rücksicherung nach dem Ausfall am ${crashTag}:
` + (art === "differenziell"
  ? `  Vollsicherung vom ${vollTag} + differenzielle Sicherung vom ${crashTag} = 2 Bänder.
  Die differenzielle Sicherung enthält bereits alle Änderungen seit der Vollsicherung.`
  : `  Vollsicherung vom ${vollTag} + alle inkrementellen Sicherungen von Montag bis ${crashTag}
  = 1 + ${crashIdx + 1} = ${baenderZumZurueck} Bänder.
  Jedes inkrementelle Band enthält nur die Änderungen eines einzigen Tages —
  fehlt ein Band, ist die Kette unterbrochen.`) +

`\n\nMerke: differenziell = viel Platz, schnelles Zurückholen.
       inkrementell = wenig Platz, langsames und fehleranfälliges Zurückholen.

Aufbewahrung: ${aufbewahrung} Wochen — dafür werden entsprechend viele Bandsätze gebraucht.`
      };
    }
  });

  /* ============================================= 3. Fehleranalyse-Tabelle */
  const FEHLER = [
    { symptom: "Der Rechner startet, der Monitor bleibt schwarz, die Betriebs-LED des Monitors blinkt.",
      ursache: ["kein Signal am Monitor", "Kabel nicht richtig gesteckt", "falscher Eingang am Monitor gewählt", "Videokabel defekt"],
      massnahme: ["Videokabel prüfen und fest einstecken", "richtigen Eingang am Monitor wählen", "Kabel gegen ein bekannt gutes tauschen"] },
    { symptom: "Ein Arbeitsplatz hat die IP-Adresse 169.254.14.207.",
      ursache: ["kein DHCP-Server erreichbar", "APIPA-Adresse, DHCP hat nicht geantwortet", "Netzwerkkabel oder Switchport ohne Verbindung"],
      massnahme: ["DHCP-Server und Netzwerkverbindung prüfen", "ipconfig /renew ausführen", "Switchport und Kabel kontrollieren"] },
    { symptom: "Der Benutzer kann sich anmelden, kommt aber nicht auf das Abteilungslaufwerk.",
      ursache: ["fehlende Berechtigung auf der Freigabe", "Benutzer ist nicht in der richtigen Gruppe", "Laufwerk nicht verbunden"],
      massnahme: ["Benutzer der zuständigen Gruppe zuordnen", "Berechtigungen auf der Freigabe prüfen", "Netzlaufwerk neu verbinden"] },
    { symptom: "Der Drucker im Flur druckt nichts, in der Warteschlange stapeln sich die Aufträge.",
      ursache: ["Druckerwarteschlange hängt", "Drucker offline oder Papierstau", "Druckdienst gestoppt"],
      massnahme: ["Warteschlange leeren und Druckdienst neu starten", "Drucker auf Papierstau und Status prüfen", "Drucker neu verbinden"] },
    { symptom: "Das Notebook verbindet sich mit dem WLAN, hat aber keinen Internetzugang.",
      ursache: ["falsches oder fehlendes Standardgateway", "DNS-Server nicht erreichbar", "Gerät hängt im Gastnetz ohne Freigabe"],
      massnahme: ["Gateway und DNS in der IP-Konfiguration prüfen", "mit ping und nslookup eingrenzen", "richtiges WLAN-Netz verbinden"] },
    { symptom: "Der Rechner wird im Laufe des Tages spürbar langsam, der Lüfter läuft dauerhaft laut.",
      ursache: ["Überhitzung durch verstaubten Lüfter", "CPU drosselt wegen zu hoher Temperatur", "Prozess mit dauerhafter Volllast"],
      massnahme: ["Lüfter und Kühlkörper reinigen", "Temperaturen und Auslastung im Task-Manager prüfen", "Prozess mit Dauerlast beenden"] },
    { symptom: "Nach dem Einspielen eines Updates startet eine Fachanwendung nicht mehr.",
      ursache: ["Update ist nicht mit der Anwendung verträglich", "benötigte Bibliothek wurde ersetzt", "Konfiguration wurde überschrieben"],
      massnahme: ["Update zurücknehmen (Deinstallation oder Wiederherstellungspunkt)", "Hersteller nach Kompatibilität fragen", "Konfiguration aus der Sicherung zurückholen"] },
    { symptom: "Eine Datei auf dem Server lässt sich öffnen, aber nicht speichern.",
      ursache: ["nur lesender Zugriff auf die Freigabe", "Datei ist von einem anderen Benutzer geöffnet", "Schreibschutz auf der Datei gesetzt"],
      massnahme: ["Schreibrecht auf der Freigabe vergeben", "prüfen wer die Datei geöffnet hat", "Schreibschutz entfernen"] },
    { symptom: "Der Server ist per IP-Adresse erreichbar, über seinen Namen aber nicht.",
      ursache: ["Namensauflösung gestört", "falscher oder nicht erreichbarer DNS-Server", "veralteter Eintrag im DNS-Cache"],
      massnahme: ["DNS-Server in der Konfiguration korrigieren", "ipconfig /flushdns ausführen", "DNS-Eintrag des Servers prüfen"] },
    { symptom: "Beim Öffnen einer E-Mail erscheint eine Warnung, dass ein Makro ausgeführt werden soll.",
      ursache: ["Verdacht auf Schadsoftware im Anhang", "Phishing-Mail mit Makro-Dokument", "Makros sind nicht gesperrt"],
      massnahme: ["Anhang nicht öffnen und den IT-Support informieren", "Mail melden und löschen", "Makros per Richtlinie sperren"] }
  ];

  G.vorlage({
    id: "tab-fehleranalyse", thema: "arbeitsplatz", sub: "Fehleranalyse & Störungsbearbeitung",
    titel: "Fehleranalyse: Symptom → Ursache → Maßnahme", stufe: 2,
    merksatz: "Erst beobachten, dann eingrenzen, dann handeln. Die Ursache ist NICHT die Wiederholung " +
      "des Symptoms (»der Drucker druckt nicht« ist keine Ursache), sondern das, was dahintersteckt. " +
      "Die Maßnahme muss zur Ursache passen und ein Verb enthalten.",
    bau(R, c) {
      const n = R.waehle([3, 4]);
      const faelle = R.waehleN(FEHLER, n);
      return {
        situation:
`Im Support der ${c.firma} sind heute Vormittag folgende Störungsmeldungen aus der Abteilung ${c.abteilung} eingegangen.
Sie arbeiten die Tickets nach dem Schema Symptom → mögliche Ursache → Maßnahme ab.`,
        prompt: "Ergänzen Sie zu jedem Symptom eine plausible Ursache und die passende erste Maßnahme.",
        felder: [
          { typ: "raster", label: "Störungsbearbeitung",
            kopf: ["Symptom", "Mögliche Ursache", "Maßnahme"],
            zeilen: faelle.map(x => ({
              zellen: [
                { t: x.symptom },
                { eingabe: true, text: x.ursache, be: 1 },
                { eingabe: true, text: x.massnahme, be: 1 }
              ]
            })) },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum wird jede Störung im Ticketsystem dokumentiert, auch wenn sie in zwei Minuten gelöst ist?",
            erwartet: [
              ["Wiederholungsfälle schneller lösen", "Wissensdatenbank für ähnliche Fälle", "beim nächsten Mal nachschlagen"],
              ["Häufungen erkennen", "wiederkehrende Fehler auswerten", "Statistik über Störungen", "Ursache im System erkennen"]
            ] }
        ],
        loesung:
`Vorgehen: Symptom sauber beschreiben → Ursache eingrenzen (was ist anders als bei
funktionierenden Geräten?) → gezielte Maßnahme → Ergebnis prüfen → dokumentieren.

` + faelle.map((x, i) =>
`${i + 1}. ${x.symptom}
   Ursache:   ${x.ursache[0]}
              (auch richtig: ${x.ursache.slice(1).join("; ") || "—"})
   Maßnahme:  ${x.massnahme[0]}
              (auch richtig: ${x.massnahme.slice(1).join("; ") || "—"})`).join("\n\n") +

`\n\nDokumentation im Ticketsystem: gleiche Fehler tauchen wieder auf — die Lösung
steht dann schon da. Außerdem zeigt die Auswertung, ob sich Störungen an einem
Gerät, einem Standort oder nach einem Update häufen. Das ist die Grundlage für
eine dauerhafte Abstellmaßnahme statt immer neuer Einzelreparaturen.`
      };
    }
  });

  /* ============================================ 4. Berechtigungsmatrix == */
  G.vorlage({
    id: "tab-berechtigungsmatrix", thema: "itsicherheit", sub: "Berechtigungsmatrix",
    titel: "Berechtigungsmatrix erstellen (Prinzip der geringsten Rechte)", stufe: 3,
    merksatz: "Prinzip der geringsten Rechte: jede Rolle bekommt genau so viel, wie sie zum Arbeiten " +
      "braucht — nicht mehr. Rechte werden an GRUPPEN vergeben, nie an einzelne Personen. " +
      "L = Lesen, S = Schreiben (Lesen+Ändern), V = Vollzugriff (auch Rechte vergeben), − = kein Zugriff.",
    bau(R, c) {
      const ordner = [
        { name: "Personalakten", chef: "V", pers: "S", buch: "L", vert: "-", azubi: "-" },
        { name: "Lohnbuchhaltung", chef: "V", pers: "S", buch: "S", vert: "-", azubi: "-" },
        { name: "Angebote & Kunden", chef: "V", pers: "-", buch: "L", vert: "S", azubi: "L" },
        { name: "Ausbildungsunterlagen", chef: "V", pers: "S", buch: "-", vert: "L", azubi: "L" },
        { name: "Öffentlich (Formulare, Vorlagen)", chef: "V", pers: "L", buch: "L", vert: "L", azubi: "L" },
        { name: "IT-Dokumentation & Passwörter", chef: "V", pers: "-", buch: "-", vert: "-", azubi: "-" }
      ];
      const gewaehlt = R.waehleN(ordner, R.waehle([4, 5]));
      const rollen = [
        { key: "chef", label: "Geschäftsführung" },
        { key: "pers", label: "Personalabteilung" },
        { key: "buch", label: "Buchhaltung" },
        { key: "vert", label: "Vertrieb" },
        { key: "azubi", label: "Auszubildende" }
      ];
      const gRollen = R.waehleN(rollen, R.waehle([3, 4])).sort((a, b) =>
        rollen.findIndex(x => x.key === a.key) - rollen.findIndex(x => x.key === b.key));

      const wort = { "V": ["V", "Vollzugriff"], "S": ["S", "Schreiben", "Lesen und Schreiben", "Ändern"], "L": ["L", "Lesen", "nur Lesen"], "-": ["-", "—", "kein Zugriff", "keine", "nichts"] };

      return {
        situation:
`Die ${c.firma} strukturiert die Dateiablage auf dem neuen Server neu. Es gibt folgende Rollen:

` + gRollen.map(x => "  • " + x.label).join("\n") + `

Es gilt das Prinzip der geringsten Rechte. Die Geschäftsführung hat immer Vollzugriff,
Auszubildende dürfen niemals personenbezogene Daten von Beschäftigten sehen, und die
IT-Dokumentation ist ausschließlich für die IT und die Geschäftsführung.

Kürzel:  V = Vollzugriff · S = Schreiben (Lesen + Ändern) · L = nur Lesen · − = kein Zugriff`,
        prompt: "Füllen Sie die Berechtigungsmatrix aus. Tragen Sie in jedes Feld genau ein Kürzel ein.",
        felder: [
          { typ: "raster", label: "Berechtigungsmatrix",
            kopf: ["Ordner / Freigabe"].concat(gRollen.map(x => x.label)),
            zeilen: gewaehlt.map(o => ({
              zellen: [{ t: o.name }].concat(gRollen.map(x => ({ eingabe: true, text: wort[o[x.key]], be: 0.5 })))
            })) },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum werden Rechte an Gruppen und nicht an einzelne Benutzerkonten vergeben?",
            erwartet: [
              ["bei Wechsel oder Neueinstellung nur die Gruppe ändern", "weniger Pflegeaufwand", "neue Person erbt automatisch die Rechte der Gruppe"],
              ["weniger Fehler, Rechte bleiben nachvollziehbar", "übersichtlich und prüfbar", "einheitliche Rechte je Rolle"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Eine Mitarbeiterin wechselt vom Vertrieb in die Buchhaltung. Was ist mit ihren Rechten zu tun und warum?",
            erwartet: [
              ["aus der alten Gruppe entfernen", "alte Rechte entziehen", "Mitgliedschaft im Vertrieb beenden"],
              ["in die neue Gruppe aufnehmen", "Buchhaltungsgruppe zuweisen"],
              ["sonst sammeln sich Rechte an", "Rechteanhäufung vermeiden", "sonst hat sie mehr Rechte als nötig"]
            ], noetig: 3 }
        ],
        loesung:
`Berechtigungsmatrix:

` + gewaehlt.map(o => "  " + o.name.padEnd(34) + gRollen.map(x => o[x.key]).join("   ")).join("\n") +
`\n  ` + " ".repeat(34) + gRollen.map(x => x.label.slice(0, 3)).join("   ") +

`\n\nBegründung der wichtigsten Felder:
• Personalakten und Lohnbuchhaltung enthalten personenbezogene Daten (Art. 9 DSGVO
  teilweise sogar besondere Kategorien) — Vertrieb und Auszubildende: kein Zugriff.
• Die Buchhaltung braucht die Lohndaten zum Buchen (S), die Personalakten selbst
  aber nur lesend (L).
• Die IT-Dokumentation mit Zugangsdaten geht niemanden außerhalb der IT und der
  Geschäftsführung etwas an.
• „Öffentlich" ist für alle lesbar, damit Formulare und Vorlagen nicht mehrfach
  herumliegen — schreiben darf dort nur, wer sie pflegt.

Rechte an Gruppen statt an Personen: bei einer Neueinstellung wird nur die
Gruppenmitgliedschaft gesetzt, alle Rechte kommen automatisch mit. Bei einem
Abteilungswechsel muss die alte Mitgliedschaft ENTZOGEN werden — sonst sammelt
eine Person über die Jahre immer mehr Rechte an (Rechteanhäufung), und am Ende
kommt jemand aus der Buchhaltung noch an die Vertriebsdaten.

Typischer Fehler: überall Vollzugriff eintragen, weil „dann funktioniert alles".
Das ist genau das Gegenteil des Prinzips der geringsten Rechte.`
      };
    }
  });

})(window.GEN);
