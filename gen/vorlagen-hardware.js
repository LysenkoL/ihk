/* ============================================================================
   gen/vorlagen-hardware.js — Hardware-Lücken aus Lenas Themenliste:
   CPU-Kenndaten, Arbeitsspeicher, USB-Schnittstellen, Video-Schnittstellen,
   Leistungsaufnahme & Netzteil, Identifikationstechnologien, Speichermedien,
   Betriebssysteme.
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* ======================================================= 1. CPU ====== */
  G.vorlage({
    id: "hw-cpu", thema: "hardware", sub: "CPU",
    titel: "CPU-Kenndaten lesen und vergleichen", stufe: 2,
    merksatz: "Takt allein sagt wenig. Was zählt: Kerne × Threads (wie viel gleichzeitig), Takt " +
      "(wie schnell einer davon), Cache (wie oft der langsame RAM überhaupt gefragt werden muss) " +
      "und TDP (wie viel Wärme und Strom). Für viele kleine Aufgaben helfen Kerne, für eine " +
      "einzelne schwere Aufgabe hilft Takt.",
    bau(R, c) {
      const a = { name: "CPU A", kerne: R.waehle([4, 6]), takt: R.stufe(3.2, 4.2, 0.1), turbo: 0, cache: R.waehle([8, 12]), tdp: R.waehle([65, 80]) };
      const b = { name: "CPU B", kerne: R.waehle([8, 12, 16]), takt: R.stufe(2.1, 2.9, 0.1), turbo: 0, cache: R.waehle([16, 24, 32]), tdp: R.waehle([95, 125]) };
      a.turbo = r(a.takt + R.stufe(0.3, 0.8, 0.1), 1);
      b.turbo = r(b.takt + R.stufe(0.4, 1.0, 0.1), 1);
      a.threads = a.kerne * 2; b.threads = b.kerne * 2;

      const einsatz = R.waehle([
        { text: "CAD-Arbeitsplätze in der Konstruktion — die verwendete Software rechnet Modelle über viele Kerne parallel", wahl: "CPU B", warum: ["die Software nutzt viele Kerne gleichzeitig", "mehr Kerne bringen bei paralleler Berechnung mehr als hoher Takt"] },
        { text: "Sachbearbeitung mit einer älteren Fachanwendung, die nur einen Kern nutzt", wahl: "CPU A", warum: ["die Anwendung läuft auf einem einzigen Kern", "bei Single-Thread-Last zählt der Takt, nicht die Kernzahl"] },
        { text: "Ein Virtualisierungsserver, auf dem mehrere virtuelle Maschinen gleichzeitig laufen sollen", wahl: "CPU B", warum: ["jede virtuelle Maschine braucht eigene Rechenkerne", "viele Kerne lassen sich auf die VMs aufteilen"] }
      ]);
      const stundenTag = R.waehle([8, 9, 10]);
      const tage = R.waehle([220, 230, 250]);
      const strompreis = R.stufe(0.25, 0.42, 0.01);
      const plaetze = R.stufe(10, 40, 5);
      const mehrWatt = b.tdp - a.tdp;
      const mehrKwh = r(mehrWatt / 1000 * stundenTag * tage * plaetze, 1);
      const mehrEuro = r(mehrKwh * strompreis, 2);

      return {
        situation:
`Die ${c.firma} vergleicht zwei Prozessoren für ${plaetze} neue Arbeitsplätze:

    Merkmal              CPU A            CPU B
    Kerne / Threads      ${a.kerne} / ${a.threads}${a.kerne < 10 ? "  " : " "}           ${b.kerne} / ${b.threads}
    Grundtakt            ${f.kurz(a.takt)} GHz          ${f.kurz(b.takt)} GHz
    Turbotakt            ${f.kurz(a.turbo)} GHz          ${f.kurz(b.turbo)} GHz
    L3-Cache             ${a.cache} MB            ${b.cache} MB
    TDP                  ${a.tdp} W             ${b.tdp} W

Einsatzzweck: ${einsatz.text}.
Die Rechner laufen ${stundenTag} Stunden an ${tage} Arbeitstagen, der Strompreis liegt bei ${f.kurz(strompreis)} €/kWh.`,
        prompt: "Empfehlen Sie eine CPU, begründen Sie und rechnen Sie die Stromkosten aus.",
        felder: [
          { typ: "auswahl", label: "Welche CPU empfehlen Sie für diesen Einsatz?", be: 1,
            optionen: ["CPU A", "CPU B"], loesung: einsatz.wahl },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: true, minWorte: 8,
            label: "Begründen Sie Ihre Empfehlung mit zwei Argumenten",
            erwartet: einsatz.warum.map(x => [x]) },
          { typ: "zahl", label: `Mehrverbrauch aller ${plaetze} Rechner pro Jahr, wenn die CPU dauerhaft mit ihrer TDP läuft`,
            einheit: "kWh", be: 3, dez: 1, loesung: mehrKwh },
          { typ: "zahl", label: "Mehrkosten für Strom pro Jahr", einheit: "€", be: 2, dez: 2, loesung: mehrEuro },
          { typ: "raster", label: "Wofür steht das Merkmal?",
            kopf: ["Merkmal", "Bedeutung in einem Halbsatz"],
            zeilen: [
              { zellen: [{ t: "Thread" }, { eingabe: true, text: ["ein Rechenstrang, den ein Kern parallel abarbeiten kann", "logischer Kern", "gleichzeitig bearbeiteter Befehlsstrang"], be: 1 }] },
              { zellen: [{ t: "L3-Cache" }, { eingabe: true, text: ["schneller Zwischenspeicher in der CPU", "Puffer zwischen Kern und Arbeitsspeicher", "beschleunigt wiederholte Zugriffe"], be: 1 }] },
              { zellen: [{ t: "TDP" }, { eingabe: true, text: ["Abwärme, die die Kühlung abführen muss", "thermische Verlustleistung", "Wärmeleistung, Richtwert für Kühlung und Stromaufnahme"], be: 1 }] },
              { zellen: [{ t: "Turbotakt" }, { eingabe: true, text: ["kurzzeitig erhöhter Takt bei Bedarf", "Maximaltakt für kurze Lastspitzen"], be: 1 }] }
            ] }
        ],
        loesung:
`Empfehlung: ${einsatz.wahl}

Begründung:
` + einsatz.warum.map(x => "  • " + x).join("\n") +

`\n\nStromkosten:
  Mehrverbrauch je Rechner: ${b.tdp} W − ${a.tdp} W = ${mehrWatt} W = ${f.kurz(mehrWatt / 1000)} kW
  Betriebsstunden im Jahr:  ${stundenTag} h × ${tage} Tage = ${stundenTag * tage} h
  je Rechner:               ${f.kurz(mehrWatt / 1000)} kW × ${stundenTag * tage} h = ${f.kurz(r(mehrWatt / 1000 * stundenTag * tage, 2))} kWh
  alle ${plaetze} Rechner:  × ${plaetze} = ${f.kurz(mehrKwh)} kWh
  Kosten:                   ${f.kurz(mehrKwh)} kWh × ${f.kurz(strompreis)} €/kWh = ${f.eur(mehrEuro)}

Achtung: die TDP ist die Abwärme unter Volllast, nicht der Durchschnittsverbrauch.
Im Büroalltag liegt der reale Verbrauch deutlich darunter — die Rechnung liefert
also die Obergrenze, und genau so ist die Aufgabe zu verstehen.

Merkmale:
  Thread     ein Befehlsstrang, den ein Kern parallel abarbeiten kann (SMT/HT)
  L3-Cache   schneller Zwischenspeicher in der CPU; erspart Wege zum langsamen RAM
  TDP        thermische Verlustleistung — Richtwert für Kühlung und Netzteil
  Turbotakt  kurzzeitig erhöhter Takt, solange Temperatur und Strom es zulassen`
      };
    }
  });

  /* ============================================= 2. Arbeitsspeicher ==== */
  G.vorlage({
    id: "hw-ram", thema: "hardware", sub: "Arbeitsspeicher (RAM)",
    titel: "Arbeitsspeicher bestücken und berechnen", stufe: 2,
    merksatz: "Dual Channel heißt: Module PAARWEISE und gleich groß bestücken, sonst arbeitet der " +
      "Speicher nur mit halber Anbindung. Und: mehr RAM macht nichts schneller, solange genug da " +
      "ist — es verhindert nur das Auslagern auf die Platte.",
    bau(R, c) {
      const slots = R.waehle([2, 4]);
      const modul = R.waehle([8, 16, 32]);
      const belegt = slots === 4 ? R.waehle([2, 4]) : 2;
      const gesamt = modul * belegt;
      const maxProModul = R.waehle([32, 64]);
      const maxGesamt = slots * maxProModul;
      const takt = R.waehle([3200, 4800, 5600, 6000]);
      const anwendung = R.waehle([
        { name: "Bildbearbeitung mit großen Dateien", bedarf: 32 },
        { name: "Virtualisierung mit drei virtuellen Maschinen", bedarf: 64 },
        { name: "Office, Browser und Fachanwendung", bedarf: 16 },
        { name: "CAD-Konstruktion", bedarf: 32 }
      ]);
      const reicht = gesamt >= anwendung.bedarf;

      return {
        situation:
`Ein Arbeitsplatzrechner der ${c.firma} hat ein Mainboard mit ${slots} Speicherbänken. Aktuell
sind ${belegt} Module zu je ${modul} GB (DDR5-${takt}) verbaut. Je Bank sind maximal ${maxProModul} GB möglich.

Der Rechner soll künftig für „${anwendung.name}“ eingesetzt werden. Der Hersteller
der Software empfiehlt mindestens ${anwendung.bedarf} GB Arbeitsspeicher.`,
        prompt: "Berechnen Sie die Ausbaustufen und beurteilen Sie die Bestückung.",
        felder: [
          { typ: "zahl", label: "Wie viel Arbeitsspeicher ist aktuell verbaut?", einheit: "GB", be: 1, dez: 0, loesung: gesamt },
          { typ: "zahl", label: "Wie viel Arbeitsspeicher könnte das Mainboard maximal aufnehmen?", einheit: "GB", be: 2, dez: 0, loesung: maxGesamt },
          { typ: "auswahl", be: 1, label: "Reicht die aktuelle Ausstattung für die Anwendung?",
            optionen: ["Ja, die Empfehlung ist erfüllt.", "Nein, es muss aufgerüstet werden."],
            loesung: reicht ? "Ja, die Empfehlung ist erfüllt." : "Nein, es muss aufgerüstet werden." },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Was ist beim Nachrüsten zu beachten, damit Dual Channel erhalten bleibt?",
            erwartet: [
              ["Module paarweise und in gleicher Größe einsetzen", "immer zwei gleiche Module", "identische Kapazität je Kanal"],
              ["gleiche Taktrate und Bauform verwenden", "gleicher Speichertyp und Takt", "auf die richtigen Bänke laut Handbuch stecken"]
            ] },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Was passiert, wenn der Arbeitsspeicher für die geöffneten Programme nicht reicht?",
            erwartet: [
              ["das System lagert auf die Festplatte oder SSD aus", "Auslagerungsdatei wird benutzt", "Swapping"],
              ["dadurch wird der Rechner spürbar langsam", "deutliche Verzögerungen", "die SSD ist um ein Vielfaches langsamer als RAM"]
            ] }
        ],
        loesung:
`Aktuell verbaut:   ${belegt} × ${modul} GB = ${gesamt} GB
Maximaler Ausbau:  ${slots} Bänke × ${maxProModul} GB = ${maxGesamt} GB

Bedarf laut Hersteller: ${anwendung.bedarf} GB
${reicht
  ? `→ ${gesamt} GB ≥ ${anwendung.bedarf} GB, die Ausstattung reicht.`
  : `→ ${gesamt} GB < ${anwendung.bedarf} GB, es fehlen ${anwendung.bedarf - gesamt} GB. Aufrüsten nötig.`}

Dual Channel:
  Der Speichercontroller spricht zwei Kanäle gleichzeitig an — das verdoppelt die
  Bandbreite. Dafür müssen die Module PAARWEISE, gleich groß, mit gleichem Takt
  und in den im Handbuch angegebenen Bänken stecken (oft die gleichfarbigen).
  Ein einzelnes großes Modul ist deshalb langsamer als zwei halb so große.

Zu wenig RAM:
  Reicht der Arbeitsspeicher nicht, verschiebt das Betriebssystem selten
  gebrauchte Speicherseiten in die Auslagerungsdatei auf SSD oder Festplatte.
  Der Rechner stürzt nicht ab, wird aber deutlich langsamer, weil ein
  Massenspeicher um Größenordnungen langsamer antwortet als RAM. Typisches
  Symptom: alles ruckelt, sobald mehrere Programme offen sind.`
      };
    }
  });

  /* ============================================ 3. USB-Schnittstellen == */
  const USB = [
    { name: "USB 2.0", mbit: 480, jahr: "2000" },
    { name: "USB 3.2 Gen 1 (5 Gbit/s)", mbit: 5000, jahr: "2008" },
    { name: "USB 3.2 Gen 2 (10 Gbit/s)", mbit: 10000, jahr: "2013" },
    { name: "USB 3.2 Gen 2x2 (20 Gbit/s)", mbit: 20000, jahr: "2017" },
    { name: "USB4 (40 Gbit/s)", mbit: 40000, jahr: "2019" }
  ];

  G.vorlage({
    id: "hw-usb", thema: "hardware", sub: "USB-Schnittstellen",
    titel: "USB-Standards vergleichen und Übertragungszeit berechnen", stufe: 2,
    merksatz: "Brutto-Angaben sind in Bit pro Sekunde, Dateigrößen in Byte. Erst durch 8 teilen! " +
      "Und immer die LANGSAMSTE Stelle der Kette bestimmt das Tempo: schneller Anschluss plus " +
      "langsame Festplatte bleibt langsam.",
    bau(R, c) {
      const std = R.waehle(USB.slice(0, 4));
      const groesseGB = R.stufe(4, 120, 4);
      const wirk = R.waehle([0.6, 0.7, 0.75, 0.8]);
      const bruttoMB = std.mbit / 8;                       // MB/s theoretisch
      const nettoMB = r(bruttoMB * wirk, 1);
      const sekunden = r(groesseGB * 1000 / nettoMB, 1);
      const minuten = r(sekunden / 60, 1);
      const platteMB = R.waehle([120, 180, 250, 540]);
      const engpass = Math.min(nettoMB, platteMB);

      return {
        situation:
`Aus der Abteilung ${c.abteilung} der ${c.firma} sollen ${f.kurz(groesseGB)} GB Projektdaten auf eine
externe Festplatte kopiert werden. Der Anschluss ist ${std.name}. Erfahrungsgemäß
werden etwa ${Math.round(wirk * 100)} % der theoretischen Übertragungsrate erreicht.`,
        prompt: "Berechnen Sie die Übertragungsdauer und beurteilen Sie die Anschlüsse.",
        felder: [
          { typ: "zahl", label: "Theoretische Übertragungsrate in Megabyte pro Sekunde", einheit: "MB/s", be: 2, dez: 1, loesung: bruttoMB },
          { typ: "zahl", label: `Praktisch erreichte Rate bei ${Math.round(wirk * 100)} %`, einheit: "MB/s", be: 1, dez: 1, loesung: nettoMB },
          { typ: "zahl", label: "Dauer der Übertragung", einheit: "Sekunden", be: 2, dez: 1, loesung: sekunden, tolRel: 0.02 },
          { typ: "zahl", label: "Dauer in Minuten", einheit: "Minuten", be: 1, dez: 1, loesung: minuten, tolRel: 0.02 },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: `Die externe Festplatte schafft selbst nur ${platteMB} MB/s. Wie wirkt sich das aus?`,
            erwartet: [
              [engpass === platteMB
                ? "die Festplatte bremst, nicht der Anschluss"
                : "der Anschluss bleibt der Engpass, die Platte ist schneller",
               "das langsamste Glied bestimmt die Geschwindigkeit", "es zählt der Engpass in der Kette"],
              ["die tatsächliche Rate liegt bei etwa " + f.kurz(engpass) + " MB/s", "es bleibt beim kleineren Wert", "die Übertragung dauert entsprechend länger"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum ist es sicherheitstechnisch heikel, Daten per USB-Stick mitzunehmen?",
            erwartet: [
              ["Sticks gehen leicht verloren oder werden gestohlen", "unverschlüsselte Daten geraten nach außen", "Verlust personenbezogener Daten"],
              ["Sticks können Schadsoftware ins Netz tragen", "Infektionsweg für Malware", "unbekannte Sticks nicht anstecken"]
            ] }
        ],
        loesung:
`${std.name} = ${f.kurz(std.mbit)} Mbit/s brutto.

Umrechnung in Megabyte pro Sekunde — Bit durch 8:
  ${f.kurz(std.mbit)} Mbit/s ÷ 8 = ${f.kurz(bruttoMB)} MB/s

Praktisch bei ${Math.round(wirk * 100)} % Wirkungsgrad (Protokoll-Overhead, Verwaltung):
  ${f.kurz(bruttoMB)} MB/s × ${f.kurz(wirk)} = ${f.kurz(nettoMB)} MB/s

Dauer:
  ${f.kurz(groesseGB)} GB = ${f.kurz(groesseGB * 1000)} MB
  ${f.kurz(groesseGB * 1000)} MB ÷ ${f.kurz(nettoMB)} MB/s = ${f.kurz(sekunden)} s ≈ ${f.kurz(minuten)} min

USB-Standards im Überblick:
` + USB.map(u => "  " + u.name.padEnd(30) + f.kurz(u.mbit).padStart(6) + " Mbit/s  = " + f.kurz(u.mbit / 8) + " MB/s").join("\n") +

`\n\nEngpass: die Festplatte schafft ${platteMB} MB/s, der Anschluss ${f.kurz(nettoMB)} MB/s.
Es zählt der kleinere Wert — real also rund ${f.kurz(engpass)} MB/s. ${engpass === platteMB
  ? "Ein schnellerer Anschluss würde hier gar nichts bringen, die Platte ist der Flaschenhals."
  : "Hier bremst der Anschluss; eine schnellere Schnittstelle würde etwas bringen."}

Sicherheit: USB-Sticks sind klein, gehen verloren und tragen Schadsoftware in
beide Richtungen. Deshalb: Wechselmedien nur verschlüsselt, nur freigegebene
Geräte, gefundene Sticks niemals anstecken — und für Datentransport besser die
Firmenfreigabe oder ein gesichertes Portal nutzen.`
      };
    }
  });

  /* ========================================= 4. Video-Schnittstellen === */
  G.vorlage({
    id: "hw-video", thema: "hardware", sub: "Video-Schnittstellen",
    titel: "Video-Schnittstellen auswählen", stufe: 2,
    merksatz: "VGA ist analog und heute überholt. DVI ist digital, aber ohne Ton. HDMI überträgt " +
      "Bild und Ton. DisplayPort kann zusätzlich mehrere Monitore in Reihe (Daisy Chain) und ist " +
      "am Arbeitsplatz die erste Wahl. USB-C mit DP-Alt-Mode überträgt Bild, Daten und Strom über " +
      "ein einziges Kabel.",
    bau(R, c) {
      const paare = R.mische([
        ["analoge Übertragung, maximal für ältere Beamer geeignet", "VGA"],
        ["digital, überträgt nur Bild, kein Ton", "DVI"],
        ["überträgt Bild und Ton, im Consumer-Bereich verbreitet", "HDMI"],
        ["kann mehrere Monitore hintereinanderschalten (Daisy Chain)", "DisplayPort"],
        ["überträgt Bild, Daten und Ladestrom über ein Kabel", "USB-C (DP-Alt-Mode)"]
      ]);
      const monitore = R.waehle([2, 3]);
      const aufl = R.waehle([
        { name: "Full HD", x: 1920, y: 1080 },
        { name: "WQHD", x: 2560, y: 1440 },
        { name: "4K UHD", x: 3840, y: 2160 }
      ]);
      const hz = R.waehle([60, 75, 144]);
      const bitProPixel = R.waehle([24, 30]);
      const roh = aufl.x * aufl.y * hz * bitProPixel;      // Bit/s
      const gbit = r(roh / 1e9, 2);

      return {
        situation:
`Für die Arbeitsplätze in der Abteilung ${c.abteilung} der ${c.firma} sollen je ${monitore} Monitore
mit ${aufl.name} (${aufl.x} × ${aufl.y}) bei ${hz} Hz betrieben werden. Die Notebooks haben
einen HDMI-Anschluss und zwei USB-C-Anschlüsse mit DisplayPort-Alt-Mode.`,
        prompt: "Ordnen Sie die Schnittstellen zu, rechnen Sie die Datenrate aus und geben Sie eine Empfehlung.",
        felder: [
          { typ: "zuordnung", label: "Eigenschaft → Schnittstelle", be: 5,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "zahl", label: `Unkomprimierte Datenrate für EINEN Monitor (${aufl.x} × ${aufl.y}, ${hz} Hz, ${bitProPixel} Bit Farbtiefe)`,
            einheit: "Gbit/s", be: 3, dez: 2, loesung: gbit, tolRel: 0.02 },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: `Welche Anschlussvariante empfehlen Sie für ${monitore} Monitore und warum?`,
            erwartet: [
              ["Dockingstation oder USB-C mit DisplayPort", "USB-C-Dock", "DisplayPort über USB-C"],
              ["ein Kabel für Bild, Daten und Strom", "Monitore lassen sich in Reihe schalten", "nur ein Kabel beim Andocken, Arbeitsplatz bleibt aufgeräumt"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum wird VGA an neuen Arbeitsplätzen nicht mehr eingesetzt?",
            erwartet: [
              ["analoges Signal, Qualitätsverlust bei hohen Auflösungen", "unscharfes Bild, störanfällig", "keine digitale Übertragung"],
              ["überträgt keinen Ton und wird von neuen Geräten nicht mehr unterstützt", "kein Ton", "an modernen Notebooks nicht mehr vorhanden"]
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(24) + p[0]).join("\n") +

`\n\nDatenrate für einen Monitor:
  Pixel je Bild:  ${aufl.x} × ${aufl.y} = ${f.kurz(aufl.x * aufl.y)} Pixel
  Bit je Bild:    ${f.kurz(aufl.x * aufl.y)} × ${bitProPixel} Bit = ${f.kurz(aufl.x * aufl.y * bitProPixel)} Bit
  je Sekunde:     × ${hz} Hz = ${f.kurz(roh)} Bit/s
                  = ${f.kurz(gbit)} Gbit/s

Bei ${monitore} Monitoren also rund ${f.kurz(r(gbit * monitore, 2))} Gbit/s — deshalb reicht ein
älterer Anschluss schnell nicht mehr aus. (In der Praxis liegt der Wert dank
Komprimierung darunter, aber die Rechnung zeigt die Größenordnung.)

Empfehlung: Dockingstation mit USB-C / DisplayPort.
  • ein Kabel zum Notebook für Bild, Netzwerk, Peripherie und Ladestrom
  • DisplayPort kann mehrere Monitore versorgen, auch in Reihe geschaltet
  • Anschließen und Loslegen — wichtig bei wechselnden Arbeitsplätzen (Desk Sharing)

VGA fällt aus, weil das Signal analog ist: Es wird digital erzeugt, für die
Leitung in ein analoges Signal gewandelt und im Monitor zurückgewandelt. Bei
hohen Auflösungen wird das Bild dadurch unscharf. Außerdem überträgt VGA keinen
Ton, und neue Notebooks haben den Anschluss gar nicht mehr.`
      };
    }
  });

  /* ======================================= 5. Leistungsaufnahme ======== */
  G.vorlage({
    id: "hw-leistung", thema: "hardware", sub: "Leistungsaufnahme",
    titel: "Netzteil auslegen und Stromkosten berechnen", stufe: 3,
    merksatz: "Erst alle Verbraucher addieren, dann eine Reserve von rund 30 % dazu — ein Netzteil " +
      "arbeitet im mittleren Lastbereich am wirkungsvollsten und hat dann noch Luft für Lastspitzen. " +
      "Der Wirkungsgrad sagt, wie viel aus der Steckdose tatsächlich beim Rechner ankommt.",
    bau(R, c) {
      const teile = [
        { name: "CPU", w: R.waehle([65, 95, 125]) },
        { name: "Grafikkarte", w: R.waehle([75, 150, 220]) },
        { name: "Mainboard", w: R.waehle([25, 35]) },
        { name: "Arbeitsspeicher (4 Module)", w: R.waehle([12, 16, 20]) },
        { name: "SSD und Festplatte", w: R.waehle([10, 14, 18]) },
        { name: "Lüfter und sonstiges", w: R.waehle([12, 18, 25]) }
      ];
      const summe = teile.reduce((s, t) => s + t.w, 0);
      const reserve = R.waehle([25, 30, 40]);
      const noetig = r(summe * (1 + reserve / 100), 0);
      const netzteile = [400, 450, 550, 650, 750, 850];
      const gewaehlt = netzteile.find(n => n >= noetig) || 850;
      const wirkungsgrad = R.waehle([0.82, 0.87, 0.90, 0.92]);
      const ausSteckdose = r(summe / wirkungsgrad, 1);
      const verlust = r(ausSteckdose - summe, 1);
      const std = R.waehle([2000, 2200, 2400]);
      const preis = R.stufe(0.25, 0.42, 0.01);
      const jahresKosten = r(ausSteckdose / 1000 * std * preis, 2);

      return {
        situation:
`Für einen Konstruktionsarbeitsplatz der ${c.firma} wird ein Rechner zusammengestellt:

` + teile.map(t => "    " + t.name.padEnd(30) + String(t.w).padStart(4) + " W").join("\n") + `

Das Netzteil soll eine Reserve von ${reserve} % haben und hat einen Wirkungsgrad von ${Math.round(wirkungsgrad * 100)} %.
Der Rechner läuft ${f.kurz(std)} Stunden im Jahr, der Strompreis beträgt ${f.kurz(preis)} €/kWh.

Erhältliche Netzteile: ` + netzteile.join(" W · ") + " W",
        prompt: "Legen Sie das Netzteil aus und berechnen Sie die Stromkosten.",
        felder: [
          { typ: "zahl", label: "Summe der Leistungsaufnahme aller Komponenten", einheit: "W", be: 1, dez: 0, loesung: summe },
          { typ: "zahl", label: `Benötigte Leistung inklusive ${reserve} % Reserve`, einheit: "W", be: 2, dez: 0, loesung: noetig, tolAbs: 2 },
          { typ: "auswahl", label: "Welches Netzteil wählen Sie?", be: 1,
            optionen: netzteile.map(n => n + " W"), loesung: gewaehlt + " W" },
          { typ: "zahl", label: `Aufnahme aus der Steckdose bei ${Math.round(wirkungsgrad * 100)} % Wirkungsgrad`, einheit: "W", be: 2, dez: 1, loesung: ausSteckdose },
          { typ: "zahl", label: "Stromkosten pro Jahr", einheit: "€", be: 2, dez: 2, loesung: jahresKosten, tolRel: 0.01 },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Warum wählt man das Netzteil nicht einfach so groß wie möglich?",
            erwartet: [
              ["ein stark überdimensioniertes Netzteil arbeitet im unteren Lastbereich ineffizient", "schlechter Wirkungsgrad bei geringer Auslastung", "beste Effizienz bei etwa halber Last"],
              ["höhere Anschaffungskosten ohne Nutzen", "teurer ohne Vorteil", "unnötige Kosten"]
            ] }
        ],
        loesung:
`Summe der Verbraucher:
` + teile.map(t => "  " + t.name.padEnd(30) + String(t.w).padStart(4) + " W").join("\n") +
`\n  ` + "".padEnd(30) + "─────\n  " + "Summe".padEnd(30) + String(summe).padStart(4) + " W" +

`\n\nMit ${reserve} % Reserve:
  ${summe} W × ${f.kurz(1 + reserve / 100)} = ${f.kurz(noetig)} W
  → nächstgrößeres erhältliches Netzteil: ${gewaehlt} W

Aufnahme aus der Steckdose:
  Der Wirkungsgrad sagt, wie viel von der aufgenommenen Leistung beim Rechner
  ankommt. Also wird GETEILT, nicht multipliziert:
  ${summe} W ÷ ${f.kurz(wirkungsgrad)} = ${f.kurz(ausSteckdose)} W
  Verlustleistung (wird zu Wärme): ${f.kurz(verlust)} W

Stromkosten im Jahr:
  ${f.kurz(ausSteckdose)} W = ${f.kurz(r(ausSteckdose / 1000, 4))} kW
  ${f.kurz(r(ausSteckdose / 1000, 4))} kW × ${f.kurz(std)} h = ${f.kurz(r(ausSteckdose / 1000 * std, 1))} kWh
  ${f.kurz(r(ausSteckdose / 1000 * std, 1))} kWh × ${f.kurz(preis)} €/kWh = ${f.eur(jahresKosten)}

Warum nicht einfach das größte Netzteil?
  Der Wirkungsgrad ist am besten bei rund 50 % Auslastung. Ein 1000-W-Netzteil,
  das dauerhaft 150 W liefert, läuft im ungünstigen Bereich, verbraucht mehr und
  kostet in der Anschaffung mehr — ohne jeden Vorteil. Faustregel: Summe der
  Verbraucher plus etwa 30 % Reserve.`
      };
    }
  });

  /* ================================= 6. Identifikationstechnologien ==== */
  G.vorlage({
    id: "hw-identifikation", thema: "hardware", sub: "Identifikationstechnologien",
    titel: "Barcode, QR-Code, RFID und NFC auswählen", stufe: 2,
    merksatz: "Barcode und QR-Code brauchen SICHTKONTAKT und werden einzeln gescannt. RFID braucht " +
      "keinen Sichtkontakt und kann viele Etiketten gleichzeitig erfassen — dafür ist es teurer. " +
      "NFC ist RFID auf wenige Zentimeter, für Bezahlen und Ausweise.",
    bau(R, c) {
      const paare = R.mische([
        ["auf jeder Produktverpackung im Handel, sehr günstig, nur Ziffernfolge", "Barcode (EAN)"],
        ["speichert auch Links und Texte, mit dem Smartphone lesbar, fehlerkorrigierend", "QR-Code"],
        ["erfasst einen ganzen Palettenaufbau ohne Sichtkontakt in einem Durchgang", "RFID"],
        ["Reichweite wenige Zentimeter, für Zutrittsausweise und bargeldloses Zahlen", "NFC"],
        ["erfasst Menschen an einem Drehkreuz anhand eines körperlichen Merkmals", "Biometrie"]
      ]);
      const fall = R.waehle([
        { text: "Inventur im Lager: rund " + R.ganz(3000, 12000) + " Artikel sollen künftig deutlich schneller erfasst werden, auch in geschlossenen Kartons", wahl: "RFID",
          warum: ["kein Sichtkontakt nötig, auch durch Verpackungen lesbar", "mehrere Etiketten werden gleichzeitig erfasst, das spart Zeit bei der Inventur"] },
        { text: "Ausleihe von Notebooks: Beschäftigte sollen sich am Schrank mit ihrem vorhandenen Firmenausweis anmelden", wahl: "NFC",
          warum: ["der Firmenausweis arbeitet bereits mit dieser Technik", "kurze Reichweite verhindert versehentliche Buchungen"] },
        { text: "Wartungsanleitungen: an jeder Maschine soll ein Aufkleber angebracht werden, über den die Beschäftigten mit dem Diensthandy die Dokumentation aufrufen", wahl: "QR-Code",
          warum: ["ein Aufkleber kostet praktisch nichts und kann eine Internetadresse speichern", "jedes Diensthandy kann ihn ohne Zusatzgerät lesen"] }
      ]);
      return {
        situation: `Die ${c.firma} prüft Identifikationstechnologien.\n\nAnwendungsfall: ${fall.text}.`,
        prompt: "Ordnen Sie die Techniken zu und sprechen Sie eine begründete Empfehlung aus.",
        felder: [
          { typ: "zuordnung", label: "Einsatz → Technik", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "auswahl", label: "Welche Technik empfehlen Sie für den Anwendungsfall?", be: 1,
            optionen: ["Barcode (EAN)", "QR-Code", "RFID", "NFC"], loesung: fall.wahl },
          { typ: "liste", be: 2, zeilen: 3, noetig: 2, satzbau: true, minWorte: 8,
            label: "Begründen Sie Ihre Empfehlung mit zwei Argumenten",
            erwartet: fall.warum.map(x => [x]) },
          { typ: "raster", label: "Barcode und RFID gegenüberstellen",
            kopf: ["Merkmal", "Barcode", "RFID"],
            zeilen: [
              { zellen: [{ t: "Sichtkontakt nötig?" }, { eingabe: true, text: ["ja", "ja, muss sichtbar sein"], be: 0.5 }, { eingabe: true, text: ["nein", "nein, auch verdeckt lesbar"], be: 0.5 }] },
              { zellen: [{ t: "Mehrere gleichzeitig?" }, { eingabe: true, text: ["nein, einzeln", "nein"], be: 0.5 }, { eingabe: true, text: ["ja, Pulkerfassung", "ja, viele auf einmal"], be: 0.5 }] },
              { zellen: [{ t: "Kosten je Etikett" }, { eingabe: true, text: ["sehr gering, nur Druckkosten", "praktisch null", "sehr günstig"], be: 0.5 }, { eingabe: true, text: ["deutlich höher, Chip im Etikett", "teurer wegen des Transponders"], be: 0.5 }] },
              { zellen: [{ t: "Daten änderbar?" }, { eingabe: true, text: ["nein, fest gedruckt", "nein"], be: 0.5 }, { eingabe: true, text: ["ja, beschreibbar", "ja, je nach Typ beschreibbar"], be: 0.5 }] }
            ] }
        ],
        loesung:
`Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(18) + p[0]).join("\n") +

`\n\nEmpfehlung: ${fall.wahl}
` + fall.warum.map(x => "  • " + x).join("\n") +

`\n\nBarcode gegen RFID:
  Sichtkontakt        Barcode: ja            RFID: nein
  gleichzeitig lesen  Barcode: nein          RFID: ja (Pulkerfassung)
  Kosten je Etikett   Barcode: sehr gering   RFID: deutlich höher
  Daten änderbar      Barcode: nein          RFID: ja (beschreibbare Typen)

Faustregel für die Prüfung:
  wenige Artikel, kleines Budget, Sichtkontakt möglich  → Barcode oder QR-Code
  große Mengen, Zeitdruck, verdeckte Ware               → RFID
  Ausweis, Bezahlen, wenige Zentimeter                  → NFC

Datenschutz bei RFID und NFC nicht vergessen: Etiketten an Personalausweisen oder
an mitgenommener Ware lassen sich auch außerhalb des Betriebs auslesen. Deshalb
Etiketten am Ausgang deaktivieren und die Speicherung auf das Nötige beschränken.`
      };
    }
  });

  /* ============================================== 7. Speichermedien ==== */
  G.vorlage({
    id: "hw-speichermedien", thema: "hardware", sub: "Speichermedien",
    titel: "Speichermedien auswählen und vergleichen", stufe: 2,
    merksatz: "SSD = schnell, leise, stoßfest, teurer je GB. HDD = billig je GB, mechanisch, für " +
      "große Archive. Band (LTO) = am billigsten je GB und offline lagerbar, aber nur nacheinander " +
      "lesbar — deshalb Sicherung, nicht Arbeitsspeicher.",
    bau(R, c) {
      const paare = R.mische([
        ["Betriebssystem und Anwendungen auf dem Arbeitsplatz", "NVMe-SSD"],
        ["großes Bildarchiv, auf das selten zugegriffen wird", "HDD"],
        ["wöchentliche Vollsicherung, die außer Haus gelagert wird", "LTO-Band"],
        ["gemeinsamer Dateizugriff mehrerer Abteilungen im Netz", "NAS"],
        ["kurzfristiger Datentransport zu einem Kunden ohne Netzzugang", "verschlüsselter USB-Datenträger"]
      ]);
      const kapaGB = R.stufe(500, 4000, 500);
      const preisSSD = r(kapaGB * R.stufe(0.06, 0.12, 0.005), 2);
      const preisHDD = r(kapaGB * R.stufe(0.02, 0.04, 0.002), 2);
      const jeGbSSD = r(preisSSD / kapaGB, 3);
      const jeGbHDD = r(preisHDD / kapaGB, 3);

      return {
        situation:
`Die ${c.firma} beschafft neue Speicher. Für ${f.kurz(kapaGB)} GB kostet
eine SSD ${f.eur(preisSSD)} und eine Festplatte ${f.eur(preisHDD)}.`,
        prompt: "Rechnen Sie den Preis je Gigabyte aus und ordnen Sie die Medien den Einsatzzwecken zu.",
        felder: [
          { typ: "zahl", label: "Preis je Gigabyte bei der SSD", einheit: "€/GB", be: 1, dez: 3, loesung: jeGbSSD },
          { typ: "zahl", label: "Preis je Gigabyte bei der Festplatte", einheit: "€/GB", be: 1, dez: 3, loesung: jeGbHDD },
          { typ: "zahl", label: "Um welchen Faktor ist die SSD je Gigabyte teurer?", einheit: "-fach", be: 2, dez: 1, loesung: r(jeGbSSD / jeGbHDD, 1), tolAbs: 0.15 },
          { typ: "zuordnung", label: "Einsatzzweck → Medium", be: 5, optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "liste", be: 3, zeilen: 4, noetig: 3, satzbau: true, minWorte: 7,
            label: "Nennen Sie drei Vorteile der SSD gegenüber der Festplatte",
            erwartet: [
              ["deutlich kürzere Zugriffszeit", "viel schneller", "keine Suchzeit durch bewegte Teile"],
              ["keine beweglichen Teile, unempfindlich gegen Stöße", "robuster im mobilen Einsatz", "stoßfest"],
              ["geringerer Stromverbrauch", "spart Energie, längere Akkulaufzeit"],
              ["arbeitet lautlos", "kein Betriebsgeräusch"],
              ["leichter und kompakter", "geringeres Gewicht"]
            ] }
        ],
        loesung:
`Preis je Gigabyte:
  SSD:          ${f.eur(preisSSD)} ÷ ${f.kurz(kapaGB)} GB = ${f.kurz(jeGbSSD)} €/GB
  Festplatte:   ${f.eur(preisHDD)} ÷ ${f.kurz(kapaGB)} GB = ${f.kurz(jeGbHDD)} €/GB
  Faktor:       ${f.kurz(jeGbSSD)} ÷ ${f.kurz(jeGbHDD)} = ${f.kurz(r(jeGbSSD / jeGbHDD, 1))}-fach teurer

Zuordnung:
` + paare.map(p => "  " + p[1].padEnd(30) + p[0]).join("\n") +

`\n\nVorteile der SSD:
  • Zugriffszeit im Bereich von Mikrosekunden statt Millisekunden
  • keine beweglichen Teile → stoßfest, ideal für Notebooks
  • geringerer Stromverbrauch → längere Akkulaufzeit
  • lautlos, kein Anlaufgeräusch, kaum Abwärme
  • leichter und kleiner

Wo die Festplatte trotzdem gewinnt: bei sehr großen Datenmengen, auf die selten
zugegriffen wird. Für ein Archiv zählt der Preis je Gigabyte, nicht die
Zugriffszeit. Und für die ausgelagerte Sicherung bleibt das Band die günstigste
Variante — es liegt stromlos im Schrank und ist für Ransomware unerreichbar.`
      };
    }
  });

  /* ============================================== 8. Betriebssysteme == */
  G.vorlage({
    id: "hw-betriebssysteme", thema: "hardware", sub: "Betriebssysteme",
    titel: "Aufgaben des Betriebssystems und Lizenzmodelle", stufe: 2,
    merksatz: "Das Betriebssystem verwaltet die Betriebsmittel: Prozessor, Arbeitsspeicher, " +
      "Massenspeicher, Geräte und Benutzer. Es steht zwischen der Anwendung und der Hardware — " +
      "kein Programm spricht die Hardware direkt an.",
    bau(R, c) {
      const paare = R.mische([
        ["teilt den Programmen Rechenzeit auf dem Prozessor zu", "Prozessverwaltung"],
        ["weist jedem Programm Bereiche im Arbeitsspeicher zu und schottet sie ab", "Speicherverwaltung"],
        ["verwaltet Ordner, Dateien und Zugriffsrechte auf dem Datenträger", "Dateiverwaltung"],
        ["spricht Drucker, Netzwerkkarte und Bildschirm über Treiber an", "Geräteverwaltung"],
        ["trennt Benutzerkonten und prüft die Anmeldung", "Benutzerverwaltung"]
      ]);
      const aussagen = R.mische([
        { t: "Anwendungsprogramme greifen direkt auf die Hardware zu.", wahr: false },
        { t: "Für jeden im Betrieb eingesetzten Rechner wird eine gültige Lizenz benötigt.", wahr: true },
        { t: "Freie Software wie Linux darf ohne Lizenzkosten eingesetzt werden, Support kostet aber trotzdem.", wahr: true },
        { t: "Eine OEM-Lizenz ist fest an den Rechner gebunden, mit dem sie geliefert wurde.", wahr: true },
        { t: "Eine Volumenlizenz lohnt sich schon ab zwei Rechnern immer.", wahr: false }
      ]).slice(0, 4);
      return {
        situation:
`Die ${c.firma} rollt in der Abteilung ${c.abteilung} neue Arbeitsplätze aus und muss dabei auch
die Betriebssystemlizenzen klären.`,
        prompt: "Beantworten Sie die Fragen zu Aufgaben und Lizenzierung des Betriebssystems.",
        felder: [
          { typ: "zuordnung", label: "Aufgabe → Bereich des Betriebssystems", be: 5,
            optionen: R.mische(paare.map(p => p[1])), paare },
          { typ: "aussagen", label: "Richtig oder falsch?", aussagen },
          { typ: "text", be: 2, zeilen: 4, satzbau: true, minWorte: 10,
            label: "Warum dürfen Anwendungen nicht direkt auf die Hardware zugreifen?",
            erwartet: [
              ["das Betriebssystem verhindert, dass Programme sich gegenseitig stören", "Speicherschutz, ein Absturz reißt nicht alles mit", "Trennung der Prozesse"],
              ["Anwendungen müssen nicht für jede Hardware einzeln geschrieben werden", "der Treiber übernimmt die Anpassung", "einheitliche Schnittstelle für alle Geräte"]
            ] },
          { typ: "text", be: 2, zeilen: 3, satzbau: true, minWorte: 9,
            label: "Ein alter Rechner mit OEM-Lizenz wird ausgemustert. Darf die Lizenz auf den neuen Rechner übertragen werden?",
            erwartet: [
              ["nein, eine OEM-Lizenz ist an die Hardware gebunden", "nein, sie bleibt beim ursprünglichen Gerät"],
              ["für den neuen Rechner ist eine eigene Lizenz nötig", "es muss neu lizenziert werden"]
            ] }
        ],
        loesung:
`Aufgaben des Betriebssystems (Betriebsmittelverwaltung):
` + paare.map(p => "  " + p[1].padEnd(22) + p[0]).join("\n") +

`\n\nAussagen:
` + aussagen.map(a => "  " + (a.wahr ? "richtig  " : "falsch   ") + a.t).join("\n") +

`\n\nWarum kein direkter Hardwarezugriff?
  1. Schutz: das Betriebssystem weist jedem Prozess einen eigenen Speicherbereich
     zu. Ein abstürzendes Programm reißt dadurch nicht das ganze System mit, und
     kein Programm kann in den Daten eines anderen lesen.
  2. Abstraktion: die Anwendung sagt „drucke“, der Treiber übersetzt das für das
     konkrete Modell. Sonst müsste jedes Programm für jeden Drucker eigens
     angepasst werden.

Lizenzarten:
  OEM       fest an den gelieferten Rechner gebunden, nicht übertragbar
  Retail    einzeln gekauft, in der Regel auf ein anderes Gerät übertragbar
  Volumen   ab einer Mindestmenge, zentral verwaltbar, günstiger je Platz
  Miete     laufende Gebühr, Updates enthalten, endet mit der Kündigung
  frei      keine Lizenzkosten (z. B. Linux), Support und Einführung kosten trotzdem

Die ausgemusterte OEM-Lizenz bleibt beim alten Gerät und darf NICHT mitgenommen
werden. Für den neuen Rechner ist eine eigene Lizenz zu beschaffen — meist ist
sie beim Kauf bereits dabei.`
      };
    }
  });

})(window.GEN);
