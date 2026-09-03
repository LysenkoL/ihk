/* ============================================================================
   gen/vorlagen-kalkulation.js — Wirtschaftlichkeit, Kalkulation, Beschaffung
   ========================================================================== */
"use strict";
(function (G) {
  const f = G.fmt, r = G.runde;

  /* ---------------------------------------------------------------- 1 ---- */
  G.vorlage({
    id: "kalk-bezugspreis", thema: "kalkulation", sub: "Bezugspreiskalkulation",
    titel: "Bezugspreis ermitteln", stufe: 1,
    merksatz: "Listeneinkaufspreis − Rabatt = Zieleinkaufspreis − Skonto = Bareinkaufspreis + Bezugskosten = Bezugspreis.",
    bau(R, c) {
      const menge = R.stufe(12, 90, 2);
      const liste = R.preis(480, 2400);
      const rabatt = R.waehle([5, 8, 10, 12, 15, 18, 20]);
      const skonto = R.waehle([1, 2, 2.5, 3]);
      const fracht = R.stufe(90, 640, 10);

      const ziel = r(liste * (1 - rabatt / 100), 2);
      const bar = r(ziel * (1 - skonto / 100), 2);
      const bezug = r(bar + fracht / menge, 2);
      const gesamt = r(bezug * menge, 2);

      return {
        situation: `Die ${c.firma} beschafft für die Abteilung ${c.abteilung} ${menge} ${c.geraetPl}. ` +
          `Der Lieferant nennt einen Listeneinkaufspreis von ${f.eur(liste)} je Gerät (netto). ` +
          `Auf den Listenpreis gewährt er ${f.kurz(rabatt)} % Rabatt, bei Zahlung innerhalb von 10 Tagen ` +
          `zusätzlich ${f.kurz(skonto)} % Skonto. Für Fracht und Versicherung stellt er einmalig ` +
          `${f.eur(fracht)} in Rechnung.`,
        prompt: "Berechnen Sie den Bezugspreis je Gerät. Runden Sie kaufmännisch auf zwei Nachkommastellen.",
        felder: [
          { typ: "zahl", label: "Zieleinkaufspreis je Gerät", einheit: "€", be: 1, loesung: ziel },
          { typ: "zahl", label: "Bareinkaufspreis je Gerät", einheit: "€", be: 1, loesung: bar },
          { typ: "zahl", label: "Bezugspreis je Gerät", einheit: "€", be: 2, loesung: bezug },
          { typ: "zahl", label: "Gesamter Bezugspreis der Lieferung", einheit: "€", be: 1, loesung: gesamt }
        ],
        loesung:
`Listeneinkaufspreis            ${f.eur(liste)}
− ${f.kurz(rabatt)} % Rabatt              ${f.eur(r(liste * rabatt / 100, 2))}
= Zieleinkaufspreis            ${f.eur(ziel)}
− ${f.kurz(skonto)} % Skonto              ${f.eur(r(ziel * skonto / 100, 2))}
= Bareinkaufspreis             ${f.eur(bar)}
+ Bezugskosten je Gerät (${f.eur(fracht)} ÷ ${menge})   ${f.eur(r(fracht / menge, 2))}
= Bezugspreis je Gerät         ${f.eur(bezug)}

Gesamt: ${f.eur(bezug)} × ${menge} = ${f.eur(gesamt)}`
      };
    }
  });

  /* ---------------------------------------------------------------- 2 ---- */
  G.vorlage({
    id: "kalk-angebotsvergleich", thema: "kalkulation", sub: "Angebotsvergleich",
    titel: "Drei Angebote vergleichen", stufe: 2,
    bau(R, c) {
      const menge = R.stufe(10, 60, 5);
      const namen = R.waehleN(["Nordtech GmbH", "Bytec AG", "Hansa IT-Systeme", "Vertrio Handel GmbH",
        "Kessler EDV", "Rhein-Data GmbH"], 3);
      const basis = R.preis(600, 1800);
      const anb = namen.map((n, i) => ({
        name: n,
        liste: r(basis * (1 + R.stufe(-12, 14, 1) / 100), 2),
        rabatt: R.waehle([0, 3, 5, 8, 10, 12, 15]),
        skonto: R.waehle([0, 1, 2, 2.5, 3]),
        fracht: R.waehle([0, 0, 45, 80, 120, 180, 250])
      }));
      anb.forEach(a => {
        a.ziel = r(a.liste * (1 - a.rabatt / 100), 2);
        a.bar = r(a.ziel * (1 - a.skonto / 100), 2);
        a.bezug = r(a.bar + a.fracht / menge, 2);
        a.gesamt = r(a.bezug * menge, 2);
      });
      const best = anb.reduce((m, a) => a.bezug < m.bezug ? a : m, anb[0]);
      const zweit = anb.filter(a => a !== best).reduce((m, a) => a.bezug < m.bezug ? a : m,
        anb.filter(a => a !== best)[0]);

      return {
        situation: `Die ${c.firma} will ${menge} ${c.geraetPl} beschaffen und hat drei Angebote eingeholt. ` +
          `Alle Preise verstehen sich netto je Gerät, die Frachtkosten fallen einmalig für die ` +
          `gesamte Lieferung an.`,
        prompt: "Ermitteln Sie den Bezugspreis je Gerät für jedes Angebot und entscheiden Sie, welches Angebot am günstigsten ist.",
        tabellen: [{
          titel: "Angebote",
          kopf: ["Anbieter", "Listenpreis je Gerät", "Rabatt", "Skonto", "Fracht gesamt"],
          zeilen: anb.map(a => [a.name, f.eur(a.liste), f.kurz(a.rabatt) + " %", f.kurz(a.skonto) + " %", f.eur(a.fracht)])
        }],
        felder: [
          { typ: "raster", label: "Bezugspreise je Gerät", kopf: ["Anbieter", "Bezugspreis je Gerät (€)"],
            zeilen: anb.map(a => ({ zellen: [{ t: a.name }, { eingabe: true, loesung: a.bezug, dez: 2, be: 1.5 }] })) },
          { typ: "auswahl", label: "Günstigstes Angebot", be: 1,
            optionen: anb.map(a => a.name), loesung: best.name },
          { typ: "text", label: "Begründen Sie Ihre Entscheidung mit Zahlen (1 Satz)", be: 1, zeilen: 2,
            erwartet: [["günstigster Bezugspreis", "niedrigster Bezugspreis", "billigste", "am günstigsten"]],
            hinweis: "Nenne den Bezugspreis und die Ersparnis gegenüber dem zweitbesten Angebot." }
        ],
        loesung:
          anb.map(a =>
`${a.name}: ${f.eur(a.liste)} − ${f.kurz(a.rabatt)} % = ${f.eur(a.ziel)} − ${f.kurz(a.skonto)} % = ${f.eur(a.bar)} + ${f.eur(r(a.fracht / menge, 2))} Fracht je Gerät = ${f.eur(a.bezug)}`).join("\n") +
`\n\nGünstigstes Angebot: ${best.name} mit ${f.eur(best.bezug)} je Gerät (${f.eur(best.gesamt)} gesamt). ` +
`Gegenüber ${zweit.name} spart die ${c.firma} ${f.eur(r(zweit.gesamt - best.gesamt, 2))}.`
      };
    }
  });

  /* ---------------------------------------------------------------- 3 ---- */
  G.vorlage({
    id: "kalk-nutzwertanalyse", thema: "kalkulation", sub: "Nutzwertanalyse",
    titel: "Nutzwertanalyse auswerten", stufe: 2,
    merksatz: "Teilnutzwert = Gewichtung × Punktwert. Der höchste Gesamtnutzwert gewinnt — nicht der billigste Preis.",
    bau(R, c) {
      const kriterien = R.waehleN([
        "Anschaffungskosten", "Lieferzeit", "Supportqualität", "Akkulaufzeit", "Gewicht",
        "Erweiterbarkeit", "Garantieumfang", "Energieeffizienz", "Reparaturfreundlichkeit"], 4);
      // Gewichte, Summe 100
      let g = [];
      let rest = 100;
      for (let i = 0; i < 3; i++) { const w = R.stufe(10, Math.min(40, rest - (3 - i) * 10), 5); g.push(w); rest -= w; }
      g.push(rest);
      g = R.mische(g);
      const namen = R.waehleN(["Anbieter A", "Anbieter B", "Anbieter C"], 3).sort();
      const punkte = namen.map(() => kriterien.map(() => R.ganz(2, 10)));
      const summen = punkte.map(p => p.reduce((s, x, i) => s + x * g[i], 0));
      const bestIdx = summen.indexOf(Math.max(...summen));

      return {
        situation: `Die ${c.firma} vergleicht drei Angebote für neue Arbeitsplatzrechner mit einer Nutzwertanalyse. ` +
          `Die Punktwerte reichen von 1 (sehr schlecht) bis 10 (sehr gut), die Gewichtung ist in Prozent angegeben.`,
        prompt: "Berechnen Sie die Gesamtnutzwerte (Teilnutzwert = Gewichtung × Punktwert) und geben Sie eine begründete Empfehlung ab.",
        tabellen: [{
          titel: "Bewertungsmatrix",
          kopf: ["Kriterium", "Gewichtung"].concat(namen),
          zeilen: kriterien.map((k, i) => [k, g[i] + " %"].concat(punkte.map(p => String(p[i]))))
        }],
        felder: [
          { typ: "raster", label: "Gesamtnutzwerte", kopf: ["Anbieter", "Gesamtnutzwert"],
            zeilen: namen.map((n, i) => ({ zellen: [{ t: n }, { eingabe: true, loesung: summen[i], dez: 0, be: 1 }] })) },
          { typ: "auswahl", label: "Welchen Anbieter empfehlen Sie?", be: 1, optionen: namen, loesung: namen[bestIdx] },
          { typ: "text", label: "Nennen Sie einen Nachteil der Nutzwertanalyse", be: 1, zeilen: 2,
            erwartet: [["subjektiv", "willkürlich", "Bewertung hängt von der Person ab", "Gewichtung subjektiv",
              "manipulierbar", "nicht objektiv"]] }
        ],
        loesung:
          namen.map((n, i) =>
`${n}: ` + kriterien.map((k, j) => `${g[j]} × ${punkte[i][j]}`).join(" + ") + ` = ${summen[i]}`).join("\n") +
`\n\nEmpfehlung: ${namen[bestIdx]} mit ${summen[bestIdx]} Punkten — höchster Gesamtnutzwert.
Nachteil des Verfahrens: Gewichtung und Punktvergabe sind subjektiv; wer die Gewichte setzt, bestimmt das Ergebnis mit.`
      };
    }
  });

  /* ---------------------------------------------------------------- 4 ---- */
  G.vorlage({
    id: "kalk-tco", thema: "kalkulation", sub: "TCO & Betriebskosten",
    titel: "Gesamtkosten über die Nutzungsdauer", stufe: 2,
    bau(R, c) {
      const n = R.stufe(15, 80, 5);
      const jahre = R.waehle([3, 4, 5]);
      const anschaffung = R.preis(700, 1700);
      const lizenz = R.stufe(60, 260, 10);      // je Gerät und Jahr
      const support = R.stufe(90, 340, 10);     // je Gerät und Jahr
      const watt = R.stufe(25, 95, 5);
      const stunden = R.stufe(1600, 2200, 100);
      const kwhPreis = R.stufe(0.24, 0.42, 0.01);

      const strom = r(watt / 1000 * stunden * kwhPreis, 2);
      const proGeraetJahr = r(lizenz + support + strom, 2);
      const gesamt = r(n * anschaffung + n * proGeraetJahr * jahre, 2);
      const proJahr = r(gesamt / jahre, 2);
      const proMonat = r(gesamt / (n * jahre * 12), 2);

      return {
        situation: `Die ${c.firma} rüstet ${n} Arbeitsplätze mit neuen Geräten aus und rechnet mit einer ` +
          `Nutzungsdauer von ${jahre} Jahren.\n` +
          `Anschaffung je Gerät ${f.eur(anschaffung)} · Softwarelizenzen ${f.eur(lizenz)} je Gerät und Jahr · ` +
          `Wartung und Support ${f.eur(support)} je Gerät und Jahr.\n` +
          `Jedes Gerät verbraucht ${watt} W bei ${f.zahl(stunden, 0)} Betriebsstunden im Jahr, ` +
          `der Strompreis beträgt ${f.zahl(kwhPreis, 2)} €/kWh.`,
        prompt: "Berechnen Sie die Gesamtkosten (TCO) für alle Arbeitsplätze über die gesamte Nutzungsdauer.",
        felder: [
          { typ: "zahl", label: "Stromkosten je Gerät und Jahr", einheit: "€", be: 1, loesung: strom },
          { typ: "zahl", label: "Laufende Kosten je Gerät und Jahr (gesamt)", einheit: "€", be: 1, loesung: proGeraetJahr },
          { typ: "zahl", label: `Gesamtkosten aller Geräte über ${jahre} Jahre`, einheit: "€", be: 2, loesung: gesamt },
          { typ: "zahl", label: "Durchschnittliche Kosten je Arbeitsplatz und Monat", einheit: "€", be: 1, loesung: proMonat }
        ],
        loesung:
`Strom je Gerät/Jahr: ${watt} W ÷ 1000 × ${f.zahl(stunden, 0)} h × ${f.zahl(kwhPreis, 2)} €/kWh = ${f.eur(strom)}
Laufende Kosten je Gerät/Jahr: ${f.eur(lizenz)} + ${f.eur(support)} + ${f.eur(strom)} = ${f.eur(proGeraetJahr)}
Anschaffung gesamt: ${n} × ${f.eur(anschaffung)} = ${f.eur(r(n * anschaffung, 2))}
Betrieb gesamt: ${n} × ${f.eur(proGeraetJahr)} × ${jahre} Jahre = ${f.eur(r(n * proGeraetJahr * jahre, 2))}
TCO gesamt: ${f.eur(gesamt)}  (${f.eur(proJahr)} je Jahr)
Je Arbeitsplatz und Monat: ${f.eur(gesamt)} ÷ (${n} × ${jahre} × 12) = ${f.eur(proMonat)}`
      };
    }
  });

  /* ---------------------------------------------------------------- 5 ---- */
  G.vorlage({
    id: "kalk-leasing", thema: "kalkulation", sub: "Leasing & Finanzierung",
    titel: "Leasing oder Kauf", stufe: 2,
    bau(R, c) {
      const n = R.stufe(10, 45, 5);
      const jahre = R.waehle([3, 4]);
      const monate = jahre * 12;
      const kaufpreis = R.preis(900, 2100);
      const restwertProz = R.waehle([8, 10, 12, 15]);
      const wartungKauf = R.stufe(70, 190, 10);
      const sonder = R.stufe(0, 220, 20);
      const rate = R.stufe(24, 62, 1);

      const kaufGesamt = r(n * kaufpreis + n * wartungKauf * jahre - n * kaufpreis * restwertProz / 100, 2);
      const leasingGesamt = r(n * sonder + n * rate * monate, 2);
      const diff = r(Math.abs(kaufGesamt - leasingGesamt), 2);
      const guenstiger = kaufGesamt < leasingGesamt ? "Kauf" : "Leasing";

      return {
        situation: `Für ${n} Arbeitsplätze der ${c.firma} stehen zwei Beschaffungswege zur Wahl. ` +
          `Der Betrachtungszeitraum beträgt ${jahre} Jahre.\n\n` +
          `KAUF: ${f.eur(kaufpreis)} je Gerät, Wartung ${f.eur(wartungKauf)} je Gerät und Jahr, ` +
          `Restwert nach ${jahre} Jahren ${restwertProz} % des Kaufpreises (Weiterverkauf).\n` +
          `LEASING: einmalige Sonderzahlung ${f.eur(sonder)} je Gerät, monatliche Rate ${f.eur(rate)} je Gerät, ` +
          `Wartung im Leasing enthalten, Rückgabe am Ende der Laufzeit.`,
        prompt: "Vergleichen Sie beide Varianten rechnerisch und geben Sie eine begründete Empfehlung.",
        felder: [
          { typ: "zahl", label: `Gesamtkosten Kauf über ${jahre} Jahre`, einheit: "€", be: 2, loesung: kaufGesamt },
          { typ: "zahl", label: `Gesamtkosten Leasing über ${jahre} Jahre`, einheit: "€", be: 2, loesung: leasingGesamt },
          { typ: "zahl", label: "Kostendifferenz", einheit: "€", be: 1, loesung: diff },
          { typ: "auswahl", label: "Welche Variante ist rein rechnerisch günstiger?", be: 1,
            optionen: ["Kauf", "Leasing"], loesung: guenstiger },
          { typ: "liste", label: "Nennen Sie zwei Argumente für Leasing, die nicht im Preis stecken", be: 2, zeilen: 3, noetig: 2,
            erwartet: [
              ["Liquidität", "Kapital wird geschont", "kein hoher Einmalbetrag", "Eigenkapital bleibt frei"],
              ["planbare Kosten", "feste monatliche Rate", "Kalkulationssicherheit"],
              ["immer aktuelle Technik", "regelmäßiger Austausch", "kein Werteverlust", "kein Restwertrisiko"],
              ["Wartung enthalten", "Service inklusive", "kein Entsorgungsaufwand", "Rückgabe statt Verwertung"],
              ["Leasingraten sind Betriebsausgaben", "steuerlich absetzbar", "bilanzneutral"]
            ] }
        ],
        loesung:
`KAUF
Anschaffung: ${n} × ${f.eur(kaufpreis)} = ${f.eur(r(n * kaufpreis, 2))}
Wartung:     ${n} × ${f.eur(wartungKauf)} × ${jahre} = ${f.eur(r(n * wartungKauf * jahre, 2))}
− Restwert:  ${n} × ${f.eur(kaufpreis)} × ${restwertProz} % = ${f.eur(r(n * kaufpreis * restwertProz / 100, 2))}
= ${f.eur(kaufGesamt)}

LEASING
Sonderzahlung: ${n} × ${f.eur(sonder)} = ${f.eur(r(n * sonder, 2))}
Raten:         ${n} × ${f.eur(rate)} × ${monate} Monate = ${f.eur(r(n * rate * monate, 2))}
= ${f.eur(leasingGesamt)}

Differenz ${f.eur(diff)} zugunsten von ${guenstiger}.
Nicht-monetäre Argumente für Leasing: Liquidität bleibt erhalten, feste kalkulierbare Raten,
immer aktuelle Hardware ohne Restwertrisiko, Wartung und Rückgabe sind eingeschlossen.`
      };
    }
  });

  /* ---------------------------------------------------------------- 6 ---- */
  G.vorlage({
    id: "kalk-afa", thema: "kalkulation", sub: "Abschreibung (AfA)",
    titel: "Lineare Abschreibung", stufe: 1,
    merksatz: "Lineare AfA = Anschaffungskosten ÷ Nutzungsdauer. Im Anschaffungsjahr nur pro rata temporis (Monate ÷ 12).",
    bau(R, c) {
      const ak = R.stufe(2400, 14000, 100);
      const nd = R.waehle([3, 4, 5, 6, 8]);
      const monat = R.ganz(2, 10);
      const monatsName = ["", "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
        "August", "September", "Oktober", "November", "Dezember"][monat];
      const jaehrlich = r(ak / nd, 2);
      const monateJahr1 = 12 - monat + 1;
      const afa1 = r(jaehrlich * monateJahr1 / 12, 2);
      const rbw2 = r(ak - afa1 - jaehrlich, 2);

      return {
        situation: `Die ${c.firma} schafft im ${monatsName} einen Server für ${f.eur(ak)} (netto) an. ` +
          `Die betriebsgewöhnliche Nutzungsdauer beträgt laut AfA-Tabelle ${nd} Jahre. ` +
          `Abgeschrieben wird linear, im Anschaffungsjahr zeitanteilig (pro rata temporis).`,
        prompt: "Berechnen Sie die Abschreibungsbeträge und den Restbuchwert.",
        felder: [
          { typ: "zahl", label: "Jährlicher Abschreibungsbetrag (volles Jahr)", einheit: "€", be: 1, loesung: jaehrlich },
          { typ: "zahl", label: "Abschreibung im Anschaffungsjahr", einheit: "€", be: 2, loesung: afa1 },
          { typ: "zahl", label: "Restbuchwert am Ende des zweiten Jahres", einheit: "€", be: 2, loesung: rbw2 }
        ],
        loesung:
`Jährliche AfA: ${f.eur(ak)} ÷ ${nd} Jahre = ${f.eur(jaehrlich)}
Anschaffungsjahr: ab ${monatsName} sind es ${monateJahr1} Monate → ${f.eur(jaehrlich)} × ${monateJahr1}/12 = ${f.eur(afa1)}
Restbuchwert Ende Jahr 2: ${f.eur(ak)} − ${f.eur(afa1)} − ${f.eur(jaehrlich)} = ${f.eur(rbw2)}`
      };
    }
  });

  /* ---------------------------------------------------------------- 7 ---- */
  G.vorlage({
    id: "kalk-amortisation", thema: "kalkulation", sub: "Amortisationsrechnung",
    titel: "Amortisationszeit berechnen", stufe: 2,
    bau(R, c) {
      const invest = R.stufe(9000, 68000, 500);
      const stundenWoche = R.stufe(4, 26, 1);
      const wochen = R.waehle([46, 47, 48]);
      const satz = R.stufe(28, 58, 1);
      const laufend = R.stufe(400, 3600, 100);

      const einsparungBrutto = r(stundenWoche * wochen * satz, 2);
      const einsparung = r(einsparungBrutto - laufend, 2);
      const jahre = einsparung > 0 ? r(invest / einsparung, 2) : 0;
      const monate = einsparung > 0 ? Math.ceil(invest / einsparung * 12) : 0;

      return {
        situation: `Die ${c.firma} führt in der Abteilung ${c.abteilung} eine Softwarelösung ein, die wiederkehrende ` +
          `Arbeitsschritte automatisiert. Die einmalige Investition beträgt ${f.eur(invest)}. ` +
          `Die Software spart ${stundenWoche} Arbeitsstunden pro Woche bei ${wochen} Arbeitswochen im Jahr; ` +
          `intern wird mit einem Stundensatz von ${f.eur(satz)} gerechnet. ` +
          `Für Wartung und Lizenzen fallen jährlich ${f.eur(laufend)} an.`,
        prompt: "Berechnen Sie die jährliche Netto-Einsparung und die Amortisationsdauer.",
        felder: [
          { typ: "zahl", label: "Eingesparte Personalkosten pro Jahr", einheit: "€", be: 1, loesung: einsparungBrutto },
          { typ: "zahl", label: "Netto-Einsparung pro Jahr", einheit: "€", be: 1, loesung: einsparung },
          { typ: "zahl", label: "Amortisationsdauer (aufgerundet)", einheit: "Monate", be: 2, loesung: monate, dez: 0, tolAbs: 1 },
          { typ: "text", label: "Beurteilen Sie das Ergebnis in einem Satz", be: 1, zeilen: 2,
            erwartet: [[monate <= 24 ? "wirtschaftlich" : "lange Amortisationsdauer",
                        monate <= 24 ? "lohnt sich" : "kritisch", monate <= 24 ? "rentabel" : "erst nach"]] }
        ],
        loesung:
`Eingesparte Personalkosten: ${stundenWoche} h × ${wochen} Wochen × ${f.eur(satz)} = ${f.eur(einsparungBrutto)}
− laufende Kosten: ${f.eur(laufend)}
= Netto-Einsparung ${f.eur(einsparung)} pro Jahr

Amortisation: ${f.eur(invest)} ÷ ${f.eur(einsparung)} = ${f.kurz(jahre)} Jahre ≈ ${monate} Monate.
Beurteilung: Die Investition amortisiert sich nach rund ${monate} Monaten und liegt damit ` +
`${monate <= 24 ? "innerhalb der üblichen Nutzungsdauer — sie ist wirtschaftlich."
               : "über zwei Jahren; die Wirtschaftlichkeit hängt davon ab, ob die Einsparung dauerhaft erreicht wird."}`
      };
    }
  });

  /* ---------------------------------------------------------------- 8 ---- */
  G.vorlage({
    id: "kalk-breakeven", thema: "kalkulation", sub: "Kostenvergleich & Break-even",
    titel: "Eigenbetrieb oder Cloud", stufe: 3,
    bau(R, c) {
      const nutzer = R.stufe(40, 260, 10);
      const fix = R.stufe(14000, 62000, 1000);       // Server, Raum, Strom, Admin pro Jahr
      const varEigen = R.stufe(30, 120, 5);          // je Nutzer und Jahr
      const cloudMonat = R.stufe(9, 26, 1);          // je Nutzer und Monat

      const cloudJahr = r(cloudMonat * 12, 2);
      const eigen = r(fix + varEigen * nutzer, 2);
      const cloud = r(cloudJahr * nutzer, 2);
      const guenstiger = eigen < cloud ? "Eigenbetrieb" : "Cloud";
      const kritisch = cloudJahr > varEigen ? Math.round(fix / (cloudJahr - varEigen)) : null;

      return {
        situation: `Die ${c.firma} betreibt eine Fachanwendung für ${nutzer} Mitarbeitende und prüft den Wechsel ` +
          `in die Cloud.\n\n` +
          `EIGENBETRIEB: Fixkosten ${f.eur(fix)} pro Jahr (Server, Räume, Administration), ` +
          `zusätzlich ${f.eur(varEigen)} je Nutzer und Jahr.\n` +
          `CLOUD (SaaS): ${f.eur(cloudMonat)} je Nutzer und Monat, keine Fixkosten.`,
        prompt: "Vergleichen Sie die Jahreskosten beider Varianten und bestimmen Sie die Nutzerzahl, ab der die günstigere Variante wechselt.",
        felder: [
          { typ: "zahl", label: `Jahreskosten Eigenbetrieb bei ${nutzer} Nutzern`, einheit: "€", be: 1.5, loesung: eigen },
          { typ: "zahl", label: `Jahreskosten Cloud bei ${nutzer} Nutzern`, einheit: "€", be: 1.5, loesung: cloud },
          { typ: "auswahl", label: "Welche Variante ist bei dieser Nutzerzahl günstiger?", be: 1,
            optionen: ["Eigenbetrieb", "Cloud"], loesung: guenstiger },
          kritisch ? { typ: "zahl", label: "Kritische Nutzerzahl (Break-even)", einheit: "Nutzer", be: 2, dez: 0,
            loesung: kritisch, tolAbs: 1 }
            : { typ: "text", label: "Warum gibt es hier keinen Break-even?", be: 2, zeilen: 2,
              erwartet: [["Cloud ist immer günstiger", "variable Kosten höher", "kein Schnittpunkt"]] }
        ],
        loesung:
`Eigenbetrieb: ${f.eur(fix)} + ${nutzer} × ${f.eur(varEigen)} = ${f.eur(eigen)}
Cloud: ${nutzer} × ${f.eur(cloudMonat)} × 12 = ${f.eur(cloud)}
Günstiger bei ${nutzer} Nutzern: ${guenstiger} (Differenz ${f.eur(r(Math.abs(eigen - cloud), 2))})
` + (kritisch
  ? `Break-even: ${f.eur(fix)} ÷ (${f.eur(cloudJahr)} − ${f.eur(varEigen)}) = ${kritisch} Nutzer.
Unter ${kritisch} Nutzern ist die Cloud günstiger, darüber der Eigenbetrieb.`
  : `Die variablen Kosten des Eigenbetriebs liegen über dem Cloudpreis — die Kurven schneiden sich nicht.`)
      };
    }
  });

  /* ---------------------------------------------------------------- 9 ---- */
  G.vorlage({
    id: "kalk-angebotspreis", thema: "kalkulation", sub: "Projektkosten & Angebotspreis",
    titel: "Angebotspreis kalkulieren", stufe: 2,
    bau(R, c) {
      const rollen = [
        { name: "Projektleitung", pt: R.ganz(3, 12), satz: R.stufe(85, 130, 5) },
        { name: "Systemintegration", pt: R.ganz(8, 30), satz: R.stufe(65, 95, 5) },
        { name: "Schulung", pt: R.ganz(2, 8), satz: R.stufe(55, 85, 5) }
      ];
      const stundenTag = 8;
      const reise = R.stufe(400, 2600, 50);
      const material = R.stufe(600, 5200, 100);
      const gewinn = R.waehle([8, 10, 12, 15, 20]);
      const ust = 19;

      const personal = r(rollen.reduce((s, x) => s + x.pt * stundenTag * x.satz, 0), 2);
      const selbst = r(personal + reise + material, 2);
      const netto = r(selbst * (1 + gewinn / 100), 2);
      const brutto = r(netto * (1 + ust / 100), 2);

      return {
        situation: `Die ${c.firma} erstellt ein Angebot für die Einrichtung von IT-Arbeitsplätzen bei einem Kunden. ` +
          `Ein Personentag entspricht ${stundenTag} Stunden.\n` +
          rollen.map(x => `${x.name}: ${x.pt} Personentage zu ${f.eur(x.satz)}/Stunde`).join("\n") +
          `\nReisekosten ${f.eur(reise)} · Materialkosten ${f.eur(material)} · ` +
          `Gewinnzuschlag ${gewinn} % · Umsatzsteuer ${ust} %.`,
        prompt: "Kalkulieren Sie den Angebotspreis.",
        felder: [
          { typ: "zahl", label: "Personalkosten gesamt", einheit: "€", be: 2, loesung: personal },
          { typ: "zahl", label: "Selbstkosten", einheit: "€", be: 1, loesung: selbst },
          { typ: "zahl", label: "Angebotspreis netto", einheit: "€", be: 1, loesung: netto },
          { typ: "zahl", label: "Angebotspreis brutto", einheit: "€", be: 1, loesung: brutto }
        ],
        loesung:
          rollen.map(x => `${x.name}: ${x.pt} PT × ${stundenTag} h × ${f.eur(x.satz)} = ${f.eur(r(x.pt * stundenTag * x.satz, 2))}`).join("\n") +
`\nPersonalkosten ${f.eur(personal)}
+ Reise ${f.eur(reise)} + Material ${f.eur(material)} = Selbstkosten ${f.eur(selbst)}
+ ${gewinn} % Gewinn = Angebotspreis netto ${f.eur(netto)}
+ ${ust} % USt = Angebotspreis brutto ${f.eur(brutto)}`
      };
    }
  });

  /* --------------------------------------------------------------- 10 ---- */
  G.vorlage({
    id: "kalk-verfuegbarkeit", thema: "kalkulation", sub: "Verfügbarkeit & SLA",
    titel: "Verfügbarkeit und Ausfallzeit", stufe: 2,
    merksatz: "Ein Jahr hat 8.760 Stunden = 525.600 Minuten. Ausfallzeit = Zeitraum × (100 % − Verfügbarkeit).",
    bau(R, c) {
      const stufen = [
        { p: 99, txt: "99 %" }, { p: 99.5, txt: "99,5 %" }, { p: 99.9, txt: "99,9 %" },
        { p: 99.95, txt: "99,95 %" }, { p: 99.99, txt: "99,99 %" }
      ];
      const a = R.waehle(stufen.slice(0, 3));
      const b = R.waehle(stufen.slice(2));
      const minutenJahr = 525600;
      const ausfallA = r(minutenJahr * (100 - a.p) / 100, 0);
      const ausfallB = r(minutenJahr * (100 - b.p) / 100, 0);
      const stundenA = r(ausfallA / 60, 2);
      const strafeProStunde = R.stufe(150, 900, 50);
      const ueberzogen = R.stufe(3, 22, 1);
      const strafe = r(strafeProStunde * ueberzogen, 2);

      return {
        situation: `Für das Warenwirtschaftssystem der ${c.firma} liegen zwei Service-Level-Angebote vor. ` +
          `Angebot 1 garantiert eine Verfügbarkeit von ${a.txt} pro Jahr, Angebot 2 von ${b.txt} pro Jahr. ` +
          `Bei Überschreitung der zulässigen Ausfallzeit zahlt der Dienstleister ` +
          `${f.eur(strafeProStunde)} je angefangener Stunde Vertragsstrafe. ` +
          `Im letzten Jahr wurde die zulässige Ausfallzeit um ${ueberzogen} Stunden überschritten.`,
        prompt: "Berechnen Sie die zulässigen Ausfallzeiten und die Vertragsstrafe.",
        felder: [
          { typ: "zahl", label: `Zulässige Ausfallzeit bei ${a.txt}`, einheit: "Minuten/Jahr", be: 1.5, loesung: ausfallA, dez: 0, tolRel: 0.01 },
          { typ: "zahl", label: `Zulässige Ausfallzeit bei ${b.txt}`, einheit: "Minuten/Jahr", be: 1.5, loesung: ausfallB, dez: 0, tolRel: 0.01 },
          { typ: "zahl", label: "Vertragsstrafe", einheit: "€", be: 1, loesung: strafe },
          { typ: "text", label: "Nennen Sie eine technische Maßnahme, die die Verfügbarkeit erhöht", be: 1, zeilen: 2,
            erwartet: [["Redundanz", "Cluster", "Failover", "USV", "redundante Netzteile", "Hochverfügbarkeit",
              "zweites Rechenzentrum", "Lastverteilung", "Load Balancer", "RAID", "Ersatzteil vor Ort"]] }
        ],
        loesung:
`Ein Jahr = 365 × 24 × 60 = 525.600 Minuten.
${a.txt}: 525.600 × ${f.kurz(r(100 - a.p, 4))} % = ${f.zahl(ausfallA, 0)} Minuten ≈ ${f.kurz(stundenA)} Stunden
${b.txt}: 525.600 × ${f.kurz(r(100 - b.p, 4))} % = ${f.zahl(ausfallB, 0)} Minuten
Vertragsstrafe: ${ueberzogen} h × ${f.eur(strafeProStunde)} = ${f.eur(strafe)}
Maßnahmen: Redundanz (Cluster, Failover, redundante Netzteile und Netzwerkpfade), USV,
Lastverteilung, Ersatzteilbevorratung und ein zweiter Standort.`
      };
    }
  });

  /* --------------------------------------------------------------- 11 ---- */
  G.vorlage({
    id: "kalk-stromkosten", thema: "kalkulation", sub: "Energie & Betriebskosten",
    titel: "Stromkosten alter und neuer Geräte", stufe: 1,
    bau(R, c) {
      const n = R.stufe(20, 120, 5);
      const alt = R.stufe(120, 260, 10);
      const neu = R.stufe(28, 90, 2);
      const stunden = R.stufe(1700, 2300, 50);
      const preis = R.stufe(0.25, 0.44, 0.01);

      const kwhAlt = r(alt / 1000 * stunden * n, 2);
      const kwhNeu = r(neu / 1000 * stunden * n, 2);
      const kostenAlt = r(kwhAlt * preis, 2);
      const kostenNeu = r(kwhNeu * preis, 2);
      const spar = r(kostenAlt - kostenNeu, 2);
      const co2 = r((kwhAlt - kwhNeu) * 0.38, 0);

      return {
        situation: `Die ${c.firma} tauscht ${n} alte Arbeitsplatzrechner (${alt} W Leistungsaufnahme) gegen ` +
          `neue Geräte mit ${neu} W. Die Geräte laufen ${f.zahl(stunden, 0)} Stunden im Jahr, ` +
          `der Strompreis liegt bei ${f.zahl(preis, 2)} €/kWh. Für die CO₂-Bilanz rechnet das Unternehmen ` +
          `mit 0,38 kg CO₂ je kWh.`,
        prompt: "Berechnen Sie die jährlichen Stromkosten vorher und nachher sowie die Einsparung.",
        felder: [
          { typ: "zahl", label: "Stromkosten alter Geräte pro Jahr", einheit: "€", be: 1.5, loesung: kostenAlt },
          { typ: "zahl", label: "Stromkosten neuer Geräte pro Jahr", einheit: "€", be: 1.5, loesung: kostenNeu },
          { typ: "zahl", label: "Jährliche Einsparung", einheit: "€", be: 1, loesung: spar },
          { typ: "zahl", label: "Eingespartes CO₂ pro Jahr", einheit: "kg", be: 1, loesung: co2, dez: 0, tolRel: 0.01 }
        ],
        loesung:
`Alt: ${alt} W ÷ 1000 × ${f.zahl(stunden, 0)} h × ${n} Geräte = ${f.zahl(kwhAlt, 0)} kWh → ${f.eur(kostenAlt)}
Neu: ${neu} W ÷ 1000 × ${f.zahl(stunden, 0)} h × ${n} Geräte = ${f.zahl(kwhNeu, 0)} kWh → ${f.eur(kostenNeu)}
Einsparung: ${f.eur(spar)} pro Jahr
CO₂: (${f.zahl(kwhAlt, 0)} − ${f.zahl(kwhNeu, 0)}) kWh × 0,38 kg = ${f.zahl(co2, 0)} kg`
      };
    }
  });

  /* --------------------------------------------------------------- 12 ---- */
  G.vorlage({
    id: "kalk-lizenzstaffel", thema: "kalkulation", sub: "Lizenzen & Staffelpreise",
    titel: "Staffelpreise und Abo-Vergleich", stufe: 2,
    bau(R, c) {
      const n = R.stufe(35, 190, 5);
      const s1 = R.stufe(70, 130, 5), s2 = r(s1 * 0.9, 2), s3 = r(s1 * 0.78, 2);
      const g1 = 25, g2 = 100;
      const aboMonat = R.stufe(4, 12, 0.5);
      const jahre = R.waehle([3, 4, 5]);
      const updateProz = R.waehle([18, 20, 22, 25]);

      let kauf = 0, rest = n;
      const teil1 = Math.min(rest, g1); kauf += teil1 * s1; rest -= teil1;
      const teil2 = Math.min(rest, g2 - g1); kauf += teil2 * s2; rest -= teil2;
      const teil3 = rest; kauf += teil3 * s3;
      kauf = r(kauf, 2);
      const wartung = r(kauf * updateProz / 100, 2);
      const kaufGesamt = r(kauf + wartung * (jahre - 1), 2);
      const abo = r(aboMonat * 12 * n * jahre, 2);
      const guenstiger = kaufGesamt < abo ? "Kauflizenz" : "Abonnement";

      return {
        situation: `Die ${c.firma} benötigt ${n} Lizenzen einer Fachanwendung. Der Hersteller bietet zwei Modelle an.\n\n` +
          `KAUFLIZENZ (Staffelpreis je Lizenz): 1–${g1} Lizenzen ${f.eur(s1)} · ${g1 + 1}–${g2} Lizenzen ${f.eur(s2)} · ` +
          `ab ${g2 + 1} Lizenzen ${f.eur(s3)}. Ab dem zweiten Jahr ${updateProz} % des Kaufpreises pro Jahr für Updates.\n` +
          `ABONNEMENT: ${f.eur(aboMonat)} je Lizenz und Monat, Updates enthalten.\n\n` +
          `Betrachtungszeitraum: ${jahre} Jahre.`,
        prompt: "Vergleichen Sie beide Lizenzmodelle über den Betrachtungszeitraum.",
        felder: [
          { typ: "zahl", label: "Einmaliger Kaufpreis aller Lizenzen", einheit: "€", be: 2, loesung: kauf },
          { typ: "zahl", label: `Gesamtkosten Kauflizenz über ${jahre} Jahre`, einheit: "€", be: 1.5, loesung: kaufGesamt },
          { typ: "zahl", label: `Gesamtkosten Abonnement über ${jahre} Jahre`, einheit: "€", be: 1.5, loesung: abo },
          { typ: "auswahl", label: "Günstigeres Modell", be: 1, optionen: ["Kauflizenz", "Abonnement"], loesung: guenstiger }
        ],
        loesung:
`Staffelung: ${teil1} × ${f.eur(s1)} + ${teil2} × ${f.eur(s2)}${teil3 ? " + " + teil3 + " × " + f.eur(s3) : ""} = ${f.eur(kauf)}
Updates ab Jahr 2: ${f.eur(kauf)} × ${updateProz} % = ${f.eur(wartung)} × ${jahre - 1} Jahre = ${f.eur(r(wartung * (jahre - 1), 2))}
Kauf gesamt: ${f.eur(kaufGesamt)}
Abo: ${f.eur(aboMonat)} × 12 × ${n} × ${jahre} = ${f.eur(abo)}
Günstiger: ${guenstiger} (Differenz ${f.eur(r(Math.abs(kaufGesamt - abo), 2))})`
      };
    }
  });

})(window.GEN);
