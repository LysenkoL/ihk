/* ============================================================================
   gen/vorlagen-sicherheit.js — IT-Sicherheit und Netzwerk, die Lücken aus
   Lenas Themenliste: Malware, Betriebssystemhärtung, PKI & Zertifikate,
   Kryptographie & Hashfunktionen, Protokollierung, Zutrittskontrolle,
   Schutzbedarfsanalyse, VPN, ARP, DHCP, MAC- & Link-Local-Adressen.
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* ===================================================== 1. Malware ==== */
  const MALWARE = [
    ["Verschlüsselt alle Dateien und fordert Lösegeld für den Schlüssel.", "Ransomware"],
    ["Verbreitet sich selbstständig über das Netz, ohne dass jemand etwas öffnen muss.", "Wurm"],
    ["Hängt sich an eine vorhandene Datei und wird erst beim Ausführen dieser Datei aktiv.", "Virus"],
    ["Tarnt sich als nützliches Programm und öffnet im Hintergrund eine Hintertür.", "Trojaner"],
    ["Zeichnet unbemerkt Tastatureingaben auf und schickt sie nach außen.", "Spyware"],
    ["Macht den befallenen Rechner zum ferngesteuerten Teil eines größeren Verbunds für Angriffe.", "Bot"],
    ["Nistet sich so tief im System ein, dass das Betriebssystem den Schädling selbst nicht mehr anzeigt.", "Rootkit"],
    ["Blendet dauerhaft unerwünschte Werbung ein und leitet Suchanfragen um.", "Adware"]
  ];

  G.vorlage({
    id: "sic-malware", thema: "itsicherheit", sub: "Malware",
    titel: "Schadsoftware erkennen und einordnen", stufe: 2,
    merksatz: "Virus braucht eine Wirtsdatei und einen Menschen, der sie öffnet. Der Wurm braucht " +
      "beides nicht — er kriecht allein durchs Netz. Der Trojaner tarnt sich. Ransomware erpresst. " +
      "Gegen Ransomware hilft am Ende nur eine Sicherung, auf die der Schädling nicht schreiben kann.",
    bau(R, c) {
      const n = R.waehle([4, 5]);
      const paare = R.waehleN(MALWARE, n);
      const optionen = [...new Set(MALWARE.map(x => x[1]))];
      return {
        situation:
`Der IT-Support der ${c.firma} schult die Beschäftigten der Abteilung ${c.abteilung} zum Thema Schadsoftware.
Für die Schulungsunterlage werden typische Verhaltensweisen den passenden Schädlingsarten zugeordnet.`,
        prompt: "Ordnen Sie jeder Beschreibung die passende Art von Schadsoftware zu und beantworten Sie die Folgefragen.",
        felder: [
          { typ: "zuordnung", label: "Verhalten → Art der Schadsoftware", be: n,
            optionen: R.mische(optionen), paare: R.mische(paare) },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 7,
            label: "Nennen Sie drei technische Maßnahmen gegen Schadsoftware und begründen Sie jede kurz",
            erwartet: [
              ["Virenschutz mit aktuellen Signaturen", "Antivirenprogramm laufend aktualisieren", "Schutzsoftware auf allen Geräten"],
              ["Updates und Patches zeitnah einspielen", "Sicherheitslücken schließen", "Patchmanagement"],
              ["Sicherungen offline oder unveränderbar halten", "Backup vom Netz getrennt", "Offline-Backup gegen Ransomware"],
              ["E-Mail-Anhänge und Makros sperren", "Makros per Richtlinie deaktivieren", "Anhangsfilter am Mailserver"],
              ["Benutzer ohne Administratorrechte arbeiten lassen", "geringste Rechte", "kein Adminkonto im Alltag"],
              ["Netz in Segmente teilen", "Segmentierung begrenzt die Ausbreitung", "Firewall zwischen den Bereichen"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Ein Rechner ist mit Ransomware befallen. Was tun Sie zuerst und warum genau in dieser Reihenfolge?",
            erwartet: [
              ["Rechner sofort vom Netz trennen", "Netzwerkkabel ziehen, WLAN aus", "isolieren"],
              ["nicht ausschalten sondern Vorgesetzte und IT informieren", "Vorfall melden", "IT-Sicherheitsbeauftragten informieren"],
              ["damit sich die Verschlüsselung nicht auf Server und Freigaben ausbreitet", "Ausbreitung stoppen", "andere Systeme schützen"]
            ], noetig: 3 }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(12) + " ← " + p[0]).join("\n") +

`\n\nMerkmale zum Auseinanderhalten:
• Virus       – braucht eine Wirtsdatei UND einen Menschen, der sie startet
• Wurm        – verbreitet sich selbst über Netz und Lücken, ohne Zutun
• Trojaner    – tarnt sich als etwas Nützliches, öffnet eine Hintertür
• Ransomware  – verschlüsselt und erpresst
• Spyware     – späht aus (Tastatureingaben, Zugangsdaten)
• Rootkit     – versteckt sich vor dem Betriebssystem selbst
• Bot         – macht den Rechner fernsteuerbar (Botnetz)

Erste Maßnahme bei Ransomware: Netzverbindung trennen, Gerät aber NICHT ausschalten
(im Arbeitsspeicher können Spuren und manchmal sogar der Schlüssel stecken), dann
Vorgesetzte, IT-Sicherheitsbeauftragten und ggf. Datenschutzbeauftragten informieren.
Zuerst trennen, weil sich die Verschlüsselung sonst über die verbundenen Netzlaufwerke
auf den Server und damit auf die ganze Firma ausbreitet.

Kein Lösegeld zahlen: es gibt keine Garantie für den Schlüssel, und die Tat wird
damit finanziert. Meldepflicht nach Art. 33 DSGVO innerhalb von 72 Stunden prüfen,
wenn personenbezogene Daten betroffen sind.`
      };
    }
  });

  /* ============================================ 2. Betriebssystemhärtung */
  G.vorlage({
    id: "sic-haertung", thema: "itsicherheit", sub: "Betriebssystemhärtung",
    titel: "Betriebssystem härten", stufe: 2,
    merksatz: "Härten heißt: alles abschalten, was nicht gebraucht wird. Jeder laufende Dienst, jedes " +
      "installierte Programm und jedes offene Konto ist eine mögliche Eintrittstür. Was weg ist, " +
      "kann nicht angegriffen werden.",
    bau(R, c) {
      const geraet = R.waehle(["neue Notebooks", "einen neuen Dateiserver", "die Rechner im Schulungsraum", "die Kassenrechner"]);
      const aussagen = R.mische([
        { t: "Nicht benötigte Dienste werden deaktiviert.", wahr: true },
        { t: "Das Gastkonto bleibt aktiv, damit Besucher schnell arbeiten können.", wahr: false },
        { t: "Die Standardpasswörter der Hersteller werden geändert.", wahr: true },
        { t: "Alle Benutzer arbeiten dauerhaft mit Administratorrechten, damit der Support weniger Arbeit hat.", wahr: false },
        { t: "Automatische Updates werden eingerichtet.", wahr: true },
        { t: "Vorinstallierte Software ohne betrieblichen Zweck wird entfernt.", wahr: true },
        { t: "Die Festplattenverschlüsselung wird aktiviert.", wahr: true },
        { t: "Der USB-Zugang bleibt für alle offen, damit jeder Daten mitnehmen kann.", wahr: false }
      ]).slice(0, 6);
      return {
        situation:
`Die ${c.firma} nimmt ${geraet} in Betrieb. Vor der Übergabe an die Abteilung ${c.abteilung}
sollen die Systeme gehärtet werden.`,
        prompt: "Beurteilen Sie die geplanten Maßnahmen und ergänzen Sie eigene.",
        felder: [
          { typ: "aussagen", label: "Gehört die Maßnahme zur Härtung? (richtig / falsch)", aussagen },
          { typ: "liste", be: 4, zeilen: 5, noetig: 4, satzbau: true, minWorte: 7,
            label: "Nennen Sie vier weitere Härtungsmaßnahmen und begründen Sie jede",
            erwartet: [
              ["Firewall aktivieren und nur nötige Ports öffnen", "lokale Firewall einschalten", "Ports schließen"],
              ["Bildschirmsperre nach kurzer Zeit automatisch", "automatische Sperre", "Sitzung sperren"],
              ["Passwortrichtlinie durchsetzen", "Mindestlänge und Komplexität", "starke Passwörter erzwingen"],
              ["Protokollierung einschalten", "Logging aktivieren", "sicherheitsrelevante Ereignisse aufzeichnen"],
              ["Wechselmedien einschränken", "USB-Ports sperren", "Nutzung externer Datenträger begrenzen"],
              ["Software nur aus freigegebenen Quellen installieren", "Anwendungsfreigabe", "Whitelist erlaubter Programme"],
              ["Fernzugriff abschalten oder absichern", "Remotedesktop begrenzen"],
              ["BIOS/UEFI mit Passwort schützen und Secure Boot aktivieren", "Startreihenfolge sperren"],
              ["Zwei-Faktor-Authentifizierung einrichten", "zweiter Faktor bei der Anmeldung"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 10,
            label: "Warum ist „weniger installierte Software“ eine Sicherheitsmaßnahme?",
            erwartet: [
              ["jedes Programm kann Schwachstellen haben", "weniger Angriffsfläche", "Angriffsfläche wird kleiner"],
              ["weniger Software muss gepflegt und aktualisiert werden", "geringerer Patchaufwand", "weniger Updates zu verwalten"]
            ] }
        ],
        loesung:
`Härtung heißt: die Angriffsfläche verkleinern.

Bewertung der Maßnahmen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "FALSCH   ") + a.t).join("\n") +

`\n\nWeitere Maßnahmen:
• Firewall aktiv, nur die tatsächlich benötigten Ports offen
• automatische Bildschirmsperre nach wenigen Minuten
• Passwortrichtlinie (Länge, keine Wiederverwendung)
• Protokollierung sicherheitsrelevanter Ereignisse
• Wechseldatenträger einschränken
• Softwareinstallation nur aus freigegebenen Quellen
• BIOS/UEFI-Passwort, Secure Boot, feste Startreihenfolge
• Fernzugriff abschalten oder über VPN und zweiten Faktor absichern

Weniger Software = weniger Sicherheitslücken, die entdeckt werden können, und
weniger Programme, die jemand aktuell halten muss. Jedes Programm, das nicht
installiert ist, muss auch nicht gepatcht werden.`
      };
    }
  });

  /* =========================================== 3. Zertifikate & PKI ==== */
  G.vorlage({
    id: "sic-pki", thema: "itsicherheit", sub: "Digitale Zertifikate & PKI",
    titel: "Digitale Zertifikate und PKI", stufe: 3,
    merksatz: "Ein Zertifikat verbindet einen öffentlichen Schlüssel mit einem Namen — und eine " +
      "Zertifizierungsstelle bürgt mit ihrer Unterschrift dafür. Verschlüsselt wird mit dem " +
      "ÖFFENTLICHEN Schlüssel des Empfängers, entschlüsselt mit dessen PRIVATEM. Signiert wird " +
      "mit dem eigenen privaten Schlüssel, geprüft mit dem eigenen öffentlichen.",
    bau(R, c) {
      const laufzeit = R.waehle([12, 13, 24, 36]);
      const dienst = R.waehle(["das Kundenportal", "den Webshop", "das Intranet", "den Mailserver"]);
      const paare = R.mische([
        ["bestätigt die Identität des Antragstellers und stellt das Zertifikat aus", "Zertifizierungsstelle (CA)"],
        ["prüft die Angaben des Antragstellers, stellt aber selbst nichts aus", "Registrierungsstelle (RA)"],
        ["listet zurückgezogene Zertifikate auf", "Sperrliste (CRL)"],
        ["wird niemals weitergegeben und bleibt auf dem Server", "privater Schlüssel"],
        ["steckt im Zertifikat und darf jeder kennen", "öffentlicher Schlüssel"]
      ]);
      const optionen = paare.map(p => p[1]);
      return {
        situation:
`Die ${c.firma} betreibt ${dienst} unter einer eigenen Domain. Der Browser zeigt beim Aufruf die
Warnung „Die Verbindung ist nicht sicher“. Sie sollen ein TLS-Zertifikat mit ${laufzeit} Monaten
Laufzeit beschaffen und einbinden.`,
        prompt: "Beantworten Sie die Fragen zur Zertifikatsinfrastruktur.",
        felder: [
          { typ: "zuordnung", label: "Aufgabe → Bestandteil der PKI", be: 5, optionen: R.mische(optionen), paare },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3,
            label: "Welche drei Angaben stehen in einem TLS-Serverzertifikat?",
            satzbau: false,
            erwartet: [
              ["Domainname des Servers", "Common Name", "für welchen Namen es gilt", "Subject"],
              ["öffentlicher Schlüssel", "Public Key"],
              ["Gültigkeitszeitraum", "Ablaufdatum", "gültig von bis"],
              ["Aussteller", "Zertifizierungsstelle", "Issuer"],
              ["Signatur der Zertifizierungsstelle", "digitale Unterschrift der CA"],
              ["Seriennummer"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Was leistet das Zertifikat für die Kundinnen und Kunden — und was leistet es NICHT?",
            erwartet: [
              ["verschlüsselte Übertragung", "niemand kann mitlesen", "Vertraulichkeit auf dem Transportweg"],
              ["bestätigt, dass der Server wirklich zu dieser Domain gehört", "Echtheit des Servers", "Authentizität"],
              ["es sagt nichts über die Seriosität oder Sicherheit der Firma selbst aus", "keine Aussage über den Inhalt", "auch eine betrügerische Seite kann ein Zertifikat haben"]
            ], noetig: 3 },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Der private Schlüssel des Servers ist einem Angreifer in die Hände gefallen. Was ist zu tun?",
            erwartet: [
              ["Zertifikat sperren lassen", "widerrufen", "revozieren", "auf die Sperrliste setzen"],
              ["neues Schlüsselpaar erzeugen und neues Zertifikat beantragen", "neu ausstellen lassen"]
            ] }
        ],
        loesung:
`Bestandteile der PKI:
` + paare.map(p => "  " + p[1].padEnd(30) + p[0]).join("\n") +

`\n\nInhalt eines TLS-Serverzertifikats:
  • Domainname, für den es gilt (Common Name / SAN)
  • öffentlicher Schlüssel des Servers
  • Gültigkeitszeitraum (hier ${laufzeit} Monate)
  • Aussteller (CA) und deren Signatur
  • Seriennummer

Was das Zertifikat leistet:
  • Vertraulichkeit — die Übertragung ist verschlüsselt, niemand liest mit
  • Authentizität   — der Server gehört wirklich zu dieser Domain
  • Integrität      — Veränderungen unterwegs fallen auf

Was es NICHT leistet:
  Es sagt nichts darüber aus, ob die Firma seriös ist oder sorgfältig mit Daten
  umgeht. Auch eine Betrugsseite kann ein gültiges Zertifikat haben. Das Schloss
  im Browser bedeutet „verschlüsselt“, nicht „vertrauenswürdig“.

Privater Schlüssel kompromittiert:
  1. Zertifikat sofort bei der CA sperren lassen (kommt auf die CRL / OCSP)
  2. neues Schlüsselpaar erzeugen, neues Zertifikat beantragen und einspielen
  3. Vorfall dokumentieren und prüfen, wie der Schlüssel abfließen konnte`
      };
    }
  });

  /* ================================== 4. Kryptographie & Hashfunktionen  */
  G.vorlage({
    id: "sic-krypto", thema: "itsicherheit", sub: "Kryptographie & Hashfunktionen",
    titel: "Symmetrisch, asymmetrisch, Hash — auseinanderhalten und rechnen", stufe: 3,
    merksatz: "Symmetrisch = EIN Schlüssel für beides, schnell, aber der Schlüssel muss sicher zum " +
      "Partner. Asymmetrisch = Schlüsselpaar, löst das Verteilproblem, ist aber langsam. Deshalb " +
      "in der Praxis beides zusammen (Hybrid). Ein Hash ist eine Einbahnstraße: aus dem Ergebnis " +
      "kommt man nicht zurück, deshalb taugt er für Passwörter und Integritätsprüfung — nicht zum " +
      "Verschlüsseln.",
    bau(R, c) {
      const teil = R.waehle([6, 8, 10, 12, 15, 20]);
      const symm = teil * (teil - 1) / 2;
      const asym = teil * 2;
      const paare = R.mische([
        ["AES-256", "symmetrisches Verfahren"],
        ["RSA", "asymmetrisches Verfahren"],
        ["SHA-256", "Hashfunktion"],
        ["Diffie-Hellman", "Schlüsselaustausch"],
        ["MD5", "veraltete Hashfunktion, nicht mehr verwenden"]
      ]);
      const aussagen = R.mische([
        { t: "Aus einem Hashwert lässt sich die ursprüngliche Nachricht zurückrechnen.", wahr: false },
        { t: "Beim asymmetrischen Verfahren wird mit dem öffentlichen Schlüssel des Empfängers verschlüsselt.", wahr: true },
        { t: "Symmetrische Verfahren sind deutlich schneller als asymmetrische.", wahr: true },
        { t: "Eine digitale Signatur wird mit dem privaten Schlüssel des Absenders erzeugt.", wahr: true },
        { t: "Der private Schlüssel muss dem Kommunikationspartner mitgeteilt werden.", wahr: false },
        { t: "Gleiche Eingabe ergibt bei einer Hashfunktion immer denselben Hashwert.", wahr: true }
      ]).slice(0, 5);

      return {
        situation:
`${teil} Standorte der ${c.firma} sollen künftig verschlüsselt miteinander kommunizieren.
Zur Diskussion stehen ein symmetrisches und ein asymmetrisches Verfahren.`,
        prompt: "Rechnen Sie den Schlüsselbedarf aus und ordnen Sie die Verfahren zu.",
        felder: [
          { typ: "zahl", label: `Wie viele Schlüssel braucht man bei einem SYMMETRISCHEN Verfahren, damit sich alle ${teil} Standorte paarweise verschlüsselt austauschen können?`,
            einheit: "Schlüssel", be: 2, dez: 0, loesung: symm },
          { typ: "zahl", label: `Wie viele Schlüssel sind es bei einem ASYMMETRISCHEN Verfahren?`,
            einheit: "Schlüssel", be: 2, dez: 0, loesung: asym },
          { typ: "zuordnung", label: "Verfahren → Einordnung", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum werden in der Praxis beide Verfahren kombiniert (Hybridverfahren)?",
            erwartet: [
              ["asymmetrisch überträgt sicher den symmetrischen Schlüssel", "Schlüsselaustausch asymmetrisch", "Sitzungsschlüssel wird asymmetrisch übertragen"],
              ["die eigentlichen Daten werden symmetrisch verschlüsselt, weil das schnell ist", "Nutzdaten symmetrisch wegen der Geschwindigkeit"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum speichert man Passwörter als Hashwert mit Salt und nicht verschlüsselt?",
            erwartet: [
              ["ein Hash lässt sich nicht zurückrechnen", "Einwegfunktion", "auch der Betreiber kennt das Passwort nicht"],
              ["Salt verhindert vorberechnete Tabellen", "gegen Rainbow Tables", "gleiche Passwörter ergeben verschiedene Hashes"]
            ] }
        ],
        loesung:
`Schlüsselbedarf bei ${teil} Teilnehmern:

  symmetrisch:  jede Paarung braucht einen eigenen Schlüssel
                n × (n − 1) ÷ 2 = ${teil} × ${teil - 1} ÷ 2 = ${symm} Schlüssel
  asymmetrisch: jeder braucht ein Schlüsselpaar
                n × 2 = ${teil} × 2 = ${asym} Schlüssel

Genau das ist das Schlüsselverteilungsproblem: symmetrisch wächst die Zahl
quadratisch, asymmetrisch nur linear.

Einordnung:
` + paare.map(p => "  " + p[0].padEnd(16) + p[1]).join("\n") +

`\n\nAussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nHybridverfahren (so arbeitet TLS):
  1. Der symmetrische Sitzungsschlüssel wird ASYMMETRISCH sicher ausgetauscht.
  2. Die eigentlichen Nutzdaten laufen SYMMETRISCH — das ist um ein Vielfaches
     schneller und schont die Rechenleistung.
  So bekommt man den sicheren Schlüsselaustausch des einen und das Tempo des anderen.

Passwörter: ein Hash ist eine Einbahnstraße. Wer die Datenbank stiehlt, hat nur
die Hashwerte und nicht die Passwörter. Verschlüsselt gespeicherte Passwörter
könnte man dagegen mit dem passenden Schlüssel wieder lesbar machen. Das Salt
ist ein Zufallswert je Passwort — dadurch ergeben zwei gleiche Passwörter
unterschiedliche Hashes, und vorberechnete Tabellen (Rainbow Tables) nützen nichts.`
      };
    }
  });

  /* ============================================== 5. Protokollierung === */
  G.vorlage({
    id: "sic-protokollierung", thema: "itsicherheit", sub: "Protokollierung",
    titel: "Protokollierung datenschutzkonform einrichten", stufe: 3,
    merksatz: "Protokolle sollen Sicherheitsvorfälle aufklären — nicht Beschäftigte überwachen. " +
      "Deshalb: nur so viel aufzeichnen wie nötig, Löschfrist festlegen, Zugriff auf wenige Personen " +
      "beschränken und den Betriebsrat beteiligen.",
    bau(R, c) {
      const tage = R.waehle([7, 14, 30, 90]);
      const aussagen = R.mische([
        { t: "Es wird festgelegt, wie lange die Protokolle aufbewahrt und wann sie gelöscht werden.", wahr: true },
        { t: "Die Auswertung der Protokolle darf jederzeit von jeder Führungskraft vorgenommen werden.", wahr: false },
        { t: "Der Betriebsrat ist zu beteiligen, weil eine Verhaltens- und Leistungskontrolle möglich wäre.", wahr: true },
        { t: "Es wird nur protokolliert, was für Sicherheit und Betrieb wirklich gebraucht wird.", wahr: true },
        { t: "Protokolle werden dauerhaft aufbewahrt, man weiß ja nie.", wahr: false },
        { t: "Der Zugriff auf die Protokolle wird selbst wieder protokolliert.", wahr: true }
      ]).slice(0, 5);
      return {
        situation:
`Nach einem Sicherheitsvorfall führt die ${c.firma} eine zentrale Protokollierung ein. Aufgezeichnet
werden Anmeldeversuche, Zugriffe auf die Dateifreigaben und Änderungen an Berechtigungen.
Die Aufbewahrungsfrist soll ${tage} Tage betragen.`,
        prompt: "Beurteilen Sie das Vorhaben aus Sicht von IT-Sicherheit und Datenschutz.",
        felder: [
          { typ: "aussagen", label: "Ist die Regelung so zulässig bzw. sinnvoll?", aussagen },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 7,
            label: "Wozu dienen Protokolle im Sicherheitsbetrieb? Nennen Sie drei Zwecke",
            erwartet: [
              ["Sicherheitsvorfälle nachträglich aufklären", "Angriff rekonstruieren", "Nachvollziehbarkeit wer wann was"],
              ["Angriffe frühzeitig erkennen", "auffällige Anmeldeversuche bemerken", "Alarmierung bei Auffälligkeiten"],
              ["Nachweis gegenüber Prüfern und Behörden", "Rechenschaftspflicht erfüllen", "Revision und Audit"],
              ["Fehler im Betrieb finden", "Störungsursachen eingrenzen"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum ist Protokollierung datenschutzrechtlich heikel und wie begegnet man dem?",
            erwartet: [
              ["Protokolle enthalten personenbezogene Daten", "man sieht wer wann was gemacht hat", "Verhaltenskontrolle möglich"],
              ["Zweckbindung, Datenminimierung und Löschfristen festlegen", "nur nötige Daten und begrenzte Speicherdauer", "Vier-Augen-Prinzip beim Zugriff"]
            ] }
        ],
        loesung:
`Bewertung:
` + aussagen.map(a => "  " + (a.wahr ? "zulässig / sinnvoll   " : "NICHT zulässig        ") + a.t).join("\n") +

`\n\nZwecke der Protokollierung:
  • Vorfälle aufklären — wer hat wann worauf zugegriffen
  • Angriffe früh erkennen (z. B. viele fehlgeschlagene Anmeldungen)
  • Nachweis gegenüber Prüfern (Rechenschaftspflicht, Art. 5 Abs. 2 DSGVO)
  • Störungsursachen im Betrieb eingrenzen

Datenschutz: Protokolle sind personenbezogene Daten — man sieht, wer wann was
getan hat. Damit wäre eine Verhaltens- und Leistungskontrolle technisch möglich,
und genau deshalb hat der Betriebsrat nach § 87 Abs. 1 Nr. 6 BetrVG mitzubestimmen.

Absicherung:
  • Zweckbindung schriftlich festlegen (Sicherheit, nicht Leistungskontrolle)
  • Datenminimierung — nur die wirklich nötigen Felder
  • Löschfrist ${tage} Tage, automatisch durchgesetzt
  • Zugriff nur für wenige benannte Personen, möglichst im Vier-Augen-Prinzip
  • Zugriffe auf die Protokolle selbst wieder protokollieren
  • Betriebsvereinbarung abschließen`
      };
    }
  });

  /* ============================================== 6. Zutrittskontrolle = */
  G.vorlage({
    id: "sic-zutritt", thema: "itsicherheit", sub: "Zutrittskontrolle",
    titel: "Zutritt, Zugang, Zugriff — Zonenkonzept", stufe: 2,
    merksatz: "ZuTRITT = die Tür (körperlich ins Gebäude). ZuGANG = das System (Anmeldung am Rechner). " +
      "ZuGRIFF = die Daten (welche Datei darf ich öffnen). Die IHK fragt genau nach diesen drei Wörtern.",
    bau(R, c) {
      const paare = R.mische([
        ["Vereinzelungsanlage am Haupteingang", "Zutritt"],
        ["Chipkarte für die Tür zum Serverraum", "Zutritt"],
        ["Anmeldung am Rechner mit Benutzername, Passwort und zweitem Faktor", "Zugang"],
        ["Bildschirmsperre beim Verlassen des Arbeitsplatzes", "Zugang"],
        ["Leseberechtigung auf dem Ordner der Buchhaltung", "Zugriff"],
        ["Rollenkonzept in der Fachanwendung", "Zugriff"]
      ]).slice(0, 5);
      return {
        situation:
`Die ${c.firma} bezieht ein neues Gebäude. Neben den Büroräumen gibt es einen Serverraum, ein
Archiv mit Personalunterlagen und einen offenen Besucherbereich mit Empfang.`,
        prompt: "Ordnen Sie die Maßnahmen den drei Ebenen zu und entwerfen Sie ein Zonenkonzept.",
        felder: [
          { typ: "zuordnung", label: "Maßnahme → Ebene", be: 5, optionen: ["Zutritt", "Zugang", "Zugriff"], paare },
          { typ: "raster", label: "Zonenkonzept",
            kopf: ["Bereich", "Wer darf hinein?", "Technische Sicherung"],
            zeilen: [
              { zellen: [{ t: "Empfang / Besucherbereich" },
                         { eingabe: true, text: ["alle Besucher", "jeder, angemeldet am Empfang", "Öffentlichkeit"], be: 0.5 },
                         { eingabe: true, text: ["Empfangspersonal, Besucherausweis", "Anmeldung und Begleitung", "Videoüberwachung des Eingangs"], be: 0.5 }] },
              { zellen: [{ t: "Büroräume" },
                         { eingabe: true, text: ["Beschäftigte", "Mitarbeiter der Firma", "Personal mit Ausweis"], be: 0.5 },
                         { eingabe: true, text: ["Chipkarte oder Transponder", "elektronisches Schließsystem", "Kartenleser an der Tür"], be: 0.5 }] },
              { zellen: [{ t: "Archiv mit Personalunterlagen" },
                         { eingabe: true, text: ["nur Personalabteilung", "Personalabteilung und Geschäftsführung", "benannter Personenkreis"], be: 0.5 },
                         { eingabe: true, text: ["abschließbarer Schrank und Türprotokollierung", "Chipkarte mit Protokoll", "Schlüsselvergabe dokumentiert"], be: 0.5 }] },
              { zellen: [{ t: "Serverraum" },
                         { eingabe: true, text: ["nur die IT", "IT-Administration", "benannte Administratoren"], be: 0.5 },
                         { eingabe: true, text: ["Zutrittsprotokollierung und Vier-Augen-Prinzip", "Chipkarte plus PIN, Protokoll", "getrennter Schließkreis mit Aufzeichnung"], be: 0.5 }] }
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum reicht eine gute Firewall allein nicht aus?",
            erwartet: [
              ["wer körperlich am Gerät steht, umgeht jede Netzsicherung", "physischer Zugriff hebelt technische Maßnahmen aus", "Server kann direkt gestartet oder Platte ausgebaut werden"],
              ["technische und organisatorische Maßnahmen greifen ineinander", "Sicherheit braucht mehrere Schichten", "TOM umfassen auch bauliche Maßnahmen"]
            ] }
        ],
        loesung:
`Die drei Ebenen (BSI und DSGVO fragen genau danach):
  Zutritt – körperlich in den Raum       → Türen, Chipkarten, Vereinzelung
  Zugang  – an das System anmelden       → Benutzerkonto, Passwort, 2. Faktor
  Zugriff – auf die Daten                → Berechtigungen, Rollenkonzept

Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(9) + p[0]).join("\n") +

`\n\nZonenkonzept — von außen nach innen immer strenger:
  Empfang    alle Besucher       Anmeldung, Besucherausweis, Begleitung
  Büro       Beschäftigte        elektronisches Schließsystem (Chipkarte)
  Archiv     Personalabteilung   abschließbar, Zutritt dokumentiert
  Serverraum nur die IT          Chipkarte + PIN, Protokollierung, ggf. Vier-Augen

Eine Firewall schützt den Weg über das Netz. Wer aber vor dem Server steht, kann
ihn von einem USB-Stick starten, die Festplatte ausbauen oder einfach das Kabel
ziehen. Deshalb verlangen die technisch-organisatorischen Maßnahmen nach Art. 32
DSGVO ausdrücklich auch die Zutrittskontrolle.`
      };
    }
  });

  /* ============================================ 7. Schutzbedarfsanalyse  */
  G.vorlage({
    id: "sic-schutzbedarf", thema: "itsicherheit", sub: "Schutzbedarfsanalyse",
    titel: "Schutzbedarf feststellen (normal / hoch / sehr hoch)", stufe: 3,
    merksatz: "Der Schutzbedarf ergibt sich aus dem SCHADEN, wenn etwas passiert — nicht aus der " +
      "Wahrscheinlichkeit. Und es gilt das Maximumprinzip: der höchste Einzelwert bestimmt den " +
      "Schutzbedarf des ganzen Systems.",
    bau(R, c) {
      const verfahren = R.waehleN([
        { name: "Lohnabrechnung", v: "hoch", i: "hoch", vf: "normal", grund: "besondere personenbezogene Daten, Fehler wirken sich direkt auf Gehälter aus" },
        { name: "Kundenwebshop", v: "hoch", i: "hoch", vf: "hoch", grund: "Zahlungsdaten und Umsatzausfall bei Stillstand" },
        { name: "Intranet mit Speiseplan", v: "normal", i: "normal", vf: "normal", grund: "keine schützenswerten Inhalte" },
        { name: "Patientendaten", v: "sehr hoch", i: "sehr hoch", vf: "hoch", grund: "Gesundheitsdaten nach Art. 9 DSGVO" },
        { name: "Konstruktionszeichnungen", v: "sehr hoch", i: "hoch", vf: "normal", grund: "Betriebsgeheimnis, Wettbewerbsvorteil" },
        { name: "Zeiterfassung", v: "hoch", i: "hoch", vf: "normal", grund: "Verhaltens- und Leistungsdaten der Beschäftigten" },
        { name: "Öffentliche Firmenwebsite", v: "normal", i: "hoch", vf: "normal", grund: "Inhalte sind öffentlich, aber eine Verfälschung schadet dem Ruf" }
      ], R.waehle([3, 4]));
      const stufen = ["normal", "hoch", "sehr hoch"];
      const rang = { "normal": 0, "hoch": 1, "sehr hoch": 2 };

      return {
        situation:
`Die ${c.firma} erstellt nach BSI-Grundschutz eine Schutzbedarfsfeststellung. Für jedes Verfahren
wird der Schutzbedarf in den drei Grundwerten Vertraulichkeit, Integrität und Verfügbarkeit
festgelegt: normal, hoch oder sehr hoch.`,
        prompt: "Füllen Sie die Tabelle aus. Achten Sie darauf, dass jede Einstufung zum möglichen Schaden passt.",
        felder: [
          { typ: "raster", label: "Schutzbedarfsfeststellung",
            kopf: ["Verfahren", "Vertraulichkeit", "Integrität", "Verfügbarkeit"],
            zeilen: verfahren.map(v => ({
              zellen: [{ t: v.name },
                       { eingabe: true, text: [v.v], be: 1 },
                       { eingabe: true, text: [v.i], be: 1 },
                       { eingabe: true, text: [v.vf], be: 1 }]
            })) },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: `Begründen Sie Ihre Einstufung für „${verfahren[0].name}“`,
            erwartet: [[verfahren[0].grund].concat(verfahren[0].grund.split(", "))] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Was besagt das Maximumprinzip und warum gilt es?",
            erwartet: [
              ["der höchste Schutzbedarf aller Daten bestimmt den des Gesamtsystems", "das Maximum zählt", "die höchste Einzelanforderung gibt den Ausschlag"],
              ["sonst wäre das schutzbedürftigste Element ungeschützt", "eine Kette ist so stark wie ihr schwächstes Glied", "sonst bliebe die kritischste Anwendung ungeschützt"]
            ] }
        ],
        loesung:
`Die drei Grundwerte:
  Vertraulichkeit – nur Befugte sehen die Daten
  Integrität      – die Daten sind richtig und unverfälscht
  Verfügbarkeit   – die Daten sind da, wenn man sie braucht

Schutzbedarf:
` + verfahren.map(v =>
  "  " + v.name.padEnd(28) + v.v.padEnd(11) + v.i.padEnd(11) + v.vf + "\n" +
  "      Begründung: " + v.grund).join("\n") +

`\n\nDer Schutzbedarf richtet sich nach dem SCHADEN, den ein Verlust anrichtet —
nicht danach, wie wahrscheinlich der Vorfall ist (das ist die Risikoanalyse).

Maximumprinzip: laufen auf einem Server mehrere Verfahren, so gilt für den Server
der höchste dort vorkommende Schutzbedarf. Sonst wäre das schutzbedürftigste
Verfahren auf einem zu schwach geschützten System — die Kette reißt am
schwächsten Glied.`
      };
    }
  });

  /* ===================================================== 8. VPN ======== */
  G.vorlage({
    id: "netz-vpn", thema: "netzwerk", sub: "VPN",
    titel: "VPN auswählen und begründen", stufe: 2,
    merksatz: "Site-to-Site verbindet zwei NETZE dauerhaft (Standort ↔ Zentrale), End-to-Site " +
      "verbindet ein GERÄT mit dem Firmennetz (Homeoffice). Der VPN-Tunnel verschlüsselt die " +
      "Daten auf dem Weg durch das öffentliche Internet.",
    bau(R, c) {
      const fall = R.waehle([
        { text: `${R.ganz(8, 25)} Beschäftigte arbeiten an zwei Tagen pro Woche vom Homeoffice aus und brauchen Zugriff auf das Warenwirtschaftssystem.`, art: "End-to-Site-VPN", warum: ["einzelne Geräte werden mit dem Firmennetz verbunden", "jeder Rechner baut selbst einen Tunnel auf"] },
        { text: `Eine neue Niederlassung mit ${R.ganz(6, 20)} Arbeitsplätzen soll dauerhaft auf die Server der Zentrale zugreifen.`, art: "Site-to-Site-VPN", warum: ["zwei komplette Netze werden verbunden", "die Router bauen den Tunnel auf, die Geräte merken nichts davon"] },
        { text: `Ein Außendienstmitarbeiter greift aus wechselnden Hotels und über öffentliche WLANs auf das CRM zu.`, art: "End-to-Site-VPN", warum: ["ein einzelnes Gerät von wechselnden Orten aus", "schützt vor Mitlesen im offenen WLAN"] }
      ]);
      const aussagen = R.mische([
        { t: "Ein VPN verschlüsselt die Verbindung durch das öffentliche Internet.", wahr: true },
        { t: "Ein VPN macht ein Virenschutzprogramm überflüssig.", wahr: false },
        { t: "Der VPN-Zugang sollte mit einem zweiten Faktor abgesichert werden.", wahr: true },
        { t: "Über ein VPN wirkt das Gerät so, als stünde es im Firmennetz.", wahr: true },
        { t: "Ein VPN erhöht immer die Übertragungsgeschwindigkeit.", wahr: false }
      ]).slice(0, 4);
      return {
        situation: `Ausgangslage bei der ${c.firma}:\n\n${fall.text}`,
        prompt: "Empfehlen Sie eine VPN-Variante und begründen Sie Ihre Wahl.",
        felder: [
          { typ: "auswahl", label: "Welche VPN-Variante empfehlen Sie?", be: 1,
            optionen: ["Site-to-Site-VPN", "End-to-Site-VPN"], loesung: fall.art },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: true, minWorte: 8,
            label: "Begründen Sie Ihre Wahl mit zwei Argumenten",
            erwartet: fall.warum.map(x => [x]) },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: true, minWorte: 8,
            label: "Nennen Sie zwei Sicherheitsanforderungen an den VPN-Zugang",
            erwartet: [
              ["Zwei-Faktor-Authentifizierung", "zweiter Faktor beim Anmelden", "Token oder App zusätzlich zum Passwort"],
              ["nur geprüfte Firmengeräte zulassen", "Gerätezertifikat", "keine privaten Rechner"],
              ["aktuelle Verschlüsselung verwenden", "starke Verschlüsselung, veraltete Protokolle abschalten", "IPsec oder WireGuard statt veralteter Verfahren"],
              ["Zugriff auf die benötigten Systeme beschränken", "nicht das ganze Netz freigeben", "geringste Rechte auch im VPN"],
              ["Verbindungen protokollieren", "Zugriffe nachvollziehbar aufzeichnen"]
            ] }
        ],
        loesung:
`Empfehlung: ${fall.art}

Begründung:
` + fall.warum.map(x => "  • " + x).join("\n") +

`\n\nUnterschied auf einen Blick:
  Site-to-Site  Router ↔ Router. Verbindet zwei ganze Netze dauerhaft.
                Die Arbeitsplätze merken davon nichts.
  End-to-Site   Gerät ↔ Firmennetz. Der einzelne Rechner baut den Tunnel auf.
                Typisch für Homeoffice und Außendienst.

Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nSicherheitsanforderungen:
  • Zwei-Faktor-Authentifizierung — ein gestohlenes Passwort reicht dann nicht
  • nur verwaltete Firmengeräte (Gerätezertifikat), keine privaten Rechner
  • aktuelle Verfahren (IPsec, WireGuard); veraltete Protokolle abschalten
  • Zugriff auf die wirklich benötigten Systeme begrenzen
  • Verbindungen protokollieren

Wichtig: das VPN schützt den WEG. Ist das Gerät am anderen Ende verseucht,
transportiert der Tunnel die Schadsoftware zuverlässig verschlüsselt ins
Firmennetz. Virenschutz und Gerätehärtung bleiben also nötig.`
      };
    }
  });

  /* ================================================= 9. ARP & MAC ====== */
  G.vorlage({
    id: "netz-arp", thema: "netzwerk", sub: "ARP & MAC-Adressen",
    titel: "ARP und MAC-Adressen", stufe: 2,
    merksatz: "ARP übersetzt eine IP-Adresse in die MAC-Adresse — es fragt per Broadcast „Wer hat " +
      "diese IP?“ und bekommt die Antwort direkt zurück. Die MAC-Adresse ist fest in der " +
      "Netzwerkkarte (Schicht 2), die IP wird vergeben (Schicht 3).",
    bau(R, c) {
      const hex = () => R.waehle("0123456789ABCDEF".split("")) + R.waehle("0123456789ABCDEF".split(""));
      const mac = [hex(), hex(), hex(), hex(), hex(), hex()].join(":");
      const ip = "192.168." + R.ganz(1, 50) + "." + R.ganz(10, 200);
      const aussagen = R.mische([
        { t: "Die ARP-Anfrage wird als Broadcast an alle Geräte im Netz geschickt.", wahr: true },
        { t: "Die ARP-Antwort kommt als Broadcast zurück.", wahr: false },
        { t: "Die MAC-Adresse ist 48 Bit lang.", wahr: true },
        { t: "ARP arbeitet über Netzgrenzen hinweg, also auch durch Router.", wahr: false },
        { t: "Ermittelte Zuordnungen werden im ARP-Cache zwischengespeichert.", wahr: true },
        { t: "Die ersten drei Bytes der MAC-Adresse kennzeichnen den Hersteller.", wahr: true }
      ]).slice(0, 5);
      return {
        situation:
`Ein Arbeitsplatzrechner der ${c.firma} mit der IP-Adresse ${ip} soll Daten an einen Server im
selben Subnetz schicken. Die MAC-Adresse des Servers ist dem Rechner noch nicht bekannt.
Der Befehl arp -a liefert unter anderem den Eintrag:

    ${ip}        ${mac}       dynamisch`,
        prompt: "Erklären Sie die Adressauflösung und beurteilen Sie die Aussagen.",
        felder: [
          { typ: "text", be: 3, zeilen: 5, satzbau: true, minWorte: 10,
            label: "Beschreiben Sie in drei Schritten, wie der Rechner an die MAC-Adresse des Servers kommt",
            erwartet: [
              ["der Rechner schickt eine ARP-Anfrage als Broadcast ins Netz", "ARP-Request an alle", "Wer hat diese IP-Adresse"],
              ["nur das Gerät mit dieser IP antwortet mit seiner MAC-Adresse", "der Server antwortet direkt", "ARP-Reply als Unicast"],
              ["die Zuordnung wird im ARP-Cache gespeichert", "Eintrag wird zwischengespeichert", "danach fragt er nicht jedes Mal neu"]
            ], noetig: 3 },
          { typ: "raster", label: "MAC-Adresse und IP-Adresse gegenüberstellen",
            kopf: ["Merkmal", "MAC-Adresse", "IP-Adresse"],
            zeilen: [
              { zellen: [{ t: "Länge" }, { eingabe: true, text: ["48 Bit", "6 Byte"], be: 0.5 }, { eingabe: true, text: ["32 Bit", "4 Byte", "128 Bit bei IPv6"], be: 0.5 }] },
              { zellen: [{ t: "OSI-Schicht" }, { eingabe: true, text: ["Schicht 2", "Sicherungsschicht", "Data Link"], be: 0.5 }, { eingabe: true, text: ["Schicht 3", "Vermittlungsschicht", "Network"], be: 0.5 }] },
              { zellen: [{ t: "Vergabe" }, { eingabe: true, text: ["vom Hersteller fest vergeben", "in der Netzwerkkarte gebrannt", "weltweit eindeutig vom Hersteller"], be: 0.5 }, { eingabe: true, text: ["vom Netzbetreiber oder DHCP vergeben", "wird konfiguriert", "änderbar"], be: 0.5 }] },
              { zellen: [{ t: "Reichweite" }, { eingabe: true, text: ["nur im lokalen Netz", "endet am Router", "innerhalb der Broadcast-Domäne"], be: 0.5 }, { eingabe: true, text: ["über Netzgrenzen hinweg routbar", "weltweit routbar", "auch über Router hinweg"], be: 0.5 }] }
            ] },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Was ist ARP-Spoofing und was richtet es an?",
            erwartet: [
              ["ein Angreifer antwortet mit seiner eigenen MAC-Adresse auf ARP-Anfragen", "falsche ARP-Antworten einschleusen", "gibt sich als Gateway aus"],
              ["dadurch läuft der Verkehr über den Angreifer und kann mitgelesen werden", "Man-in-the-Middle", "Daten werden abgefangen oder verändert"]
            ] }
        ],
        loesung:
`Ablauf der Adressauflösung:
  1. Der Rechner kennt die IP-Adresse, aber nicht die MAC. Er schickt eine
     ARP-Anfrage als BROADCAST an alle Geräte im Netz: „Wer hat ${ip}?“
  2. Nur das Gerät mit dieser IP antwortet — und zwar als UNICAST direkt an den
     Fragesteller: „Ich, meine MAC ist ${mac}.“
  3. Der Rechner speichert die Zuordnung im ARP-Cache (sichtbar mit arp -a) und
     fragt beim nächsten Mal nicht erneut.

MAC gegen IP:
  Länge       48 Bit (6 Byte)              32 Bit (IPv4) bzw. 128 Bit (IPv6)
  Schicht     2 — Sicherungsschicht        3 — Vermittlungsschicht
  Vergabe     fest vom Hersteller          konfiguriert oder per DHCP
  Reichweite  nur im lokalen Netz          über Router hinweg routbar

Aussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nARP-Spoofing: ARP prüft nicht, ob eine Antwort echt ist. Ein Angreifer im
selben Netz antwortet einfach mit der eigenen MAC-Adresse und behauptet, er sei
das Gateway. Danach läuft der gesamte Verkehr über ihn — er kann mitlesen und
verändern (Man-in-the-Middle). Gegenmaßnahmen: Netzsegmentierung, Dynamic ARP
Inspection auf den Switches, durchgehende Verschlüsselung (TLS, VPN).`
      };
    }
  });

  /* ==================================================== 10. DHCP ======= */
  G.vorlage({
    id: "netz-dhcp", thema: "netzwerk", sub: "DHCP",
    titel: "DHCP einrichten und Bereich berechnen", stufe: 2,
    merksatz: "DHCP läuft in vier Schritten: Discover – Offer – Request – Acknowledge (DORA). " +
      "Geräte, die immer erreichbar sein müssen (Server, Drucker), bekommen eine feste Adresse " +
      "oder eine Reservierung — der Rest holt sich seine Adresse automatisch.",
    bau(R, c) {
      const dritte = R.ganz(1, 60);
      const netz = "192.168." + dritte + ".0/24";
      const feste = R.ganz(6, 20);
      const von = feste + 10;
      const bis = R.waehle([200, 220, 240, 250]);
      const anzahl = bis - von + 1;
      const geraete = R.ganz(40, Math.min(180, anzahl + 30));
      const leaseStd = R.waehle([8, 12, 24, 48]);
      const paare = R.mische([
        ["Der Client sucht per Broadcast einen DHCP-Server.", "DHCP-Discover"],
        ["Der Server bietet eine freie Adresse an.", "DHCP-Offer"],
        ["Der Client nimmt genau ein Angebot an.", "DHCP-Request"],
        ["Der Server bestätigt die Vergabe verbindlich.", "DHCP-Acknowledge"]
      ]);
      return {
        situation:
`Im Netz ${netz} der ${c.firma} sollen die Arbeitsplätze ihre Adressen automatisch beziehen.
Vorgaben:

• ${feste} Geräte (Server, Drucker, Switches) haben feste Adressen ab .1
• Der DHCP-Bereich soll von .${von} bis .${bis} laufen
• Aktuell sind rund ${geraete} Geräte im Netz unterwegs
• Die Lease-Dauer beträgt ${leaseStd} Stunden`,
        prompt: "Berechnen Sie den Adressbereich und beantworten Sie die Fragen zum Betrieb.",
        felder: [
          { typ: "zahl", label: "Wie viele Adressen umfasst der DHCP-Bereich?",
            einheit: "Adressen", be: 2, dez: 0, loesung: anzahl },
          { typ: "zuordnung", label: "Ablauf → DHCP-Nachricht", be: 4,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "auswahl", be: 1,
            label: `Reicht der Bereich für ${geraete} Geräte?`,
            optionen: ["Ja, der Bereich reicht aus.", "Nein, der Bereich ist zu klein."],
            loesung: anzahl >= geraete ? "Ja, der Bereich reicht aus." : "Nein, der Bereich ist zu klein." },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3,
            label: "Welche drei Angaben verteilt der DHCP-Server außer der IP-Adresse noch?",
            satzbau: false,
            erwartet: [
              ["Subnetzmaske"],
              ["Standardgateway", "Default Gateway", "Router"],
              ["DNS-Server", "Nameserver"],
              ["Lease-Dauer", "Gültigkeitsdauer der Adresse"],
              ["Domänenname", "DNS-Suffix"],
              ["Zeitserver", "NTP-Server"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum bekommt der Netzwerkdrucker eine Reservierung statt einer beliebigen DHCP-Adresse?",
            erwartet: [
              ["er muss immer unter derselben Adresse erreichbar sein", "die Adresse darf sich nicht ändern", "Clients und Warteschlangen zeigen auf eine feste Adresse"],
              ["die Reservierung wird trotzdem zentral verwaltet", "zentrale Verwaltung bleibt erhalten", "einfacher zu pflegen als eine handeingetragene feste Adresse"]
            ] }
        ],
        loesung:
`DHCP-Bereich .${von} bis .${bis}:
  ${bis} − ${von} + 1 = ${anzahl} Adressen
  (Die „+1“ nicht vergessen — beide Randadressen zählen mit.)

Bedarf: ${geraete} Geräte → ${anzahl >= geraete
  ? `${anzahl} ≥ ${geraete}, der Bereich reicht aus. Reserve: ${anzahl - geraete} Adressen.`
  : `${anzahl} < ${geraete}, der Bereich ist ZU KLEIN. Es fehlen ${geraete - anzahl} Adressen —
  Bereich vergrößern oder das Netz in ein größeres Präfix legen.`}

DORA — der Ablauf in vier Schritten:
` + paare.map(p => "  " + p[1].padEnd(18) + p[0]).join("\n") +

`\n\nDer DHCP-Server verteilt außer der IP-Adresse:
  • Subnetzmaske
  • Standardgateway
  • DNS-Server
  • Lease-Dauer (hier ${leaseStd} Stunden)
  • optional Domänenname, Zeitserver

Reservierung für den Drucker: die Warteschlangen auf den Arbeitsplätzen zeigen
auf eine bestimmte Adresse. Ändert sie sich, druckt niemand mehr. Eine
Reservierung im DHCP verbindet die MAC-Adresse fest mit einer IP — die Adresse
bleibt gleich, wird aber weiter zentral verwaltet. Das ist pflegeleichter als
eine am Gerät eingetippte feste Adresse, die niemand dokumentiert.`
      };
    }
  });

  /* ======================== 11. MAC → Link-Local (EUI-64) ============== */
  G.vorlage({
    id: "netz-linklocal", thema: "netzwerk", sub: "MAC- & Link-Local-Adressen",
    titel: "Link-Local-Adresse aus der MAC-Adresse bilden (EUI-64)", stufe: 3,
    merksatz: "EUI-64 in drei Schritten: MAC in der Mitte teilen und FF:FE einschieben, dann das " +
      "siebte Bit von links (Universal/Local) umdrehen, dann fe80:: davorsetzen. Das umgedrehte Bit " +
      "ändert die zweite Hex-Ziffer: 0↔2, 4↔6, 8↔A, C↔E.",
    bau(R, c) {
      const hexZ = "0123456789abcdef".split("");
      const b0erste = R.waehle(hexZ);
      const b0zweite = R.waehle(["0", "4", "8", "c"]);          // U/L-Bit = 0
      const rest = [];
      for (let i = 0; i < 5; i++) rest.push(R.waehle(hexZ) + R.waehle(hexZ));
      const macTeile = [b0erste + b0zweite].concat(rest);
      const mac = macTeile.join(":").toUpperCase();

      const umdreh = { "0": "2", "4": "6", "8": "a", "c": "e" };
      const b0neu = b0erste + umdreh[b0zweite];
      const eui = [b0neu + macTeile[1], macTeile[2] + "ff", "fe" + macTeile[3], macTeile[4] + macTeile[5]];
      const linkLocal = "fe80::" + eui.join(":");

      return {
        situation:
`Ein Arbeitsplatzrechner der ${c.firma} hat die MAC-Adresse

    ${mac}

Das Betriebssystem bildet daraus nach dem Verfahren EUI-64 automatisch eine
Link-Local-Adresse.`,
        prompt: "Bilden Sie die Link-Local-Adresse Schritt für Schritt und beantworten Sie die Fragen.",
        felder: [
          { typ: "raster", label: "Die drei Schritte",
            kopf: ["Schritt", "Ergebnis"],
            zeilen: [
              { zellen: [{ t: "1. In der Mitte teilen und ff:fe einschieben" },
                         { eingabe: true, text: [macTeile.slice(0, 3).join("") + "fffe" + macTeile.slice(3).join(""),
                                                 (b0erste + b0zweite + macTeile[1]) + ":" + macTeile[2] + "ff:fe" + macTeile[3] + ":" + macTeile[4] + macTeile[5]], be: 1 }] },
              { zellen: [{ t: "2. Siebtes Bit umdrehen — neues erstes Byte" },
                         { eingabe: true, text: [b0neu], be: 1 }] },
              { zellen: [{ t: "3. Präfix davorsetzen — fertige Link-Local-Adresse" },
                         { eingabe: true, text: [linkLocal], be: 2 }] }
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Wofür wird eine Link-Local-Adresse gebraucht und wie weit reicht sie?",
            erwartet: [
              ["für die Kommunikation im selben Netzsegment", "nur im lokalen Link gültig", "innerhalb der Broadcast-Domäne"],
              ["wird nicht geroutet, kein Router leitet sie weiter", "endet am Router", "nicht ins Internet routbar"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Welches Datenschutzproblem hat EUI-64 und wie löst man es?",
            erwartet: [
              ["die MAC-Adresse steckt in der IPv6-Adresse und macht das Gerät wiedererkennbar", "Gerät ist über Netze hinweg verfolgbar", "eindeutige Kennung des Geräts wird sichtbar"],
              ["Privacy Extensions verwenden", "zufällig erzeugte Interface-ID", "temporäre Adressen aktivieren"]
            ] }
        ],
        loesung:
`MAC-Adresse:  ${mac}

Schritt 1 — in der Mitte teilen und ff:fe einschieben:
    ${macTeile.slice(0, 3).join(":")}  |  ${macTeile.slice(3).join(":")}
    → ${macTeile.slice(0, 3).join("")}fffe${macTeile.slice(3).join("")}

Schritt 2 — siebtes Bit von links umdrehen (Universal/Local-Bit):
    erstes Byte ${b0erste}${b0zweite} → ${b0neu}
    (die zweite Hex-Ziffer wechselt: 0↔2, 4↔6, 8↔a, c↔e)

Schritt 3 — Präfix fe80:: davorsetzen:
    ${linkLocal}

Wozu Link-Local?
  Jede IPv6-fähige Schnittstelle bildet sich diese Adresse selbst, ganz ohne
  DHCP und ohne Router. Damit funktionieren Nachbarschaftserkennung (NDP) und
  Router-Suche schon vor jeder Konfiguration. Sie gilt NUR im eigenen
  Netzsegment — kein Router leitet fe80::/10 weiter.

Datenschutz: über EUI-64 steckt die weltweit eindeutige MAC-Adresse in jeder
IPv6-Adresse des Geräts. Damit wäre ein Notebook auch in einem fremden Netz
wiedererkennbar. Lösung: Privacy Extensions (RFC 4941) — das Betriebssystem
erzeugt zusätzlich zufällige, regelmäßig wechselnde Interface-IDs und benutzt
diese für ausgehende Verbindungen.`
      };
    }
  });

})(window.GEN);
