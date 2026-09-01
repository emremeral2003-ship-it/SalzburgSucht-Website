/**
 * Sucht die Koordinaten der Verstecke und der Partnerbetriebe.
 *
 * Warum ein Skript und keine von Hand eingetippte Liste: Koordinaten aus dem
 * Gedaechtnis sind erfunden. Sie sehen aus wie Daten, sind aber geraten, und
 * auf einer Karte faellt das erst auf, wenn jemand den Ort kennt. Hier fragt
 * stattdessen Nominatim, der Suchdienst von OpenStreetMap.
 *
 * Was dieses Skript NICHT tut: die fertige Datendatei schreiben. Es legt einen
 * Vorschlag unter scripts/ausgabe/orte-vorschlag.json ab. Der wird von Hand
 * durchgesehen — Nominatim liefert bei Namen wie "Naya" oder "KOI" gelegentlich
 * einen Treffer auf einem anderen Kontinent, und ein Treffer ist kein Beweis.
 * Erst danach wandert das Ergebnis nach src/data/karte/.
 *
 * Aufruf:  node scripts/karten-orte.mjs
 *
 * Nutzungsbedingungen von Nominatim, die hier eingehalten werden:
 *   - hoechstens eine Anfrage pro Sekunde
 *   - erkennbare Kennung im User-Agent
 *   - keine Massenabfrage zur Laufzeit; das hier laeuft einmal
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const ausgabeOrdner = join(wurzel, "scripts", "ausgabe");
const zielDatei = join(ausgabeOrdner, "orte-vorschlag.json");
const lagerDatei = join(wurzel, "node_modules", ".cache", "karten-nominatim.json");

/**
 * Der Ausschnitt, in dem ein Treffer liegen MUSS.
 *
 * Alles ausserhalb wird verworfen, nicht uebernommen. Das ist die wichtigste
 * Zeile im Skript: Ohne sie landet "Porsche" in Stuttgart und "KOI" in Japan,
 * und beides sieht in der Ausgabedatei voellig unauffaellig aus.
 */
const RAHMEN = { sued: 47.655, west: 12.925, nord: 47.895, ost: 13.175 };

/* --------------------------------------------------------------------------
   Die Verstecke
   --------------------------------------------------------------------------
   `suche` ist der Text, der an Nominatim geht. Er ist bewusst praeziser als
   der Anzeigename: "Kiesel" allein findet nichts, "Kieselstraße Salzburg"
   schon.

   `art` sagt, wie genau der Ort ueberhaupt gemeint ist — und das ist keine
   Kosmetik, sondern gehoert auf die Karte:
     punkt    ein konkretes Gebaeude oder ein Platz
     strasse  eine Strasse; der Marker sitzt irgendwo darauf
     viertel  ein Stadtteil oder eine Gemeinde; der Marker sitzt in der Mitte
-------------------------------------------------------------------------- */
const VERSTECKE = [
  { nr: 1, name: "Lehen", suche: "Lehen, Salzburg", art: "viertel" },
  { nr: 2, name: "Mirabellplatz", suche: "Mirabellplatz, Salzburg", art: "punkt" },
  { nr: 3, name: "Alpenstraße", suche: "Alpenstraße, Salzburg", art: "strasse", zusatz: "Nähe Universität" },
  { nr: 4, name: "Café am Kai", suche: "Café am Kai, Salzburg", art: "punkt", zusatz: "Altstadt" },
  { nr: 5, name: "Überfuhrsteg", suche: "Überfuhrsteg, Salzburg", art: "punkt" },
  { nr: 6, name: "Techno-Z", suche: "Techno-Z, Salzburg", art: "punkt", zusatz: "Studentenheim, Itzling" },
  { nr: 7, name: "Altstadt", suche: "Altstadt, Salzburg", art: "viertel", mehrfach: true },
  { nr: 8, name: "HLT Salzburg", suche: "Tourismusschulen Salzburg, Kleßheim", art: "punkt" },
  { nr: 9, name: "Kiesel", suche: "Kieselstraße, Salzburg", art: "strasse" },
  { nr: 10, name: "Bergheim", suche: "Bergheim, Salzburg-Umgebung", art: "viertel" },
  { nr: 11, name: "ZIB Salzburg", suche: "Zentrum im Berg, Salzburg", art: "punkt" },
  { nr: 12, name: "Viehhausen", suche: "Viehhausen, Wals-Siezenheim", art: "viertel" },
  { nr: 13, name: "Puch", suche: "Puch bei Hallein", art: "viertel" },
  { nr: 14, name: "Hallein", suche: "Hallein", art: "viertel" },
  { nr: 15, name: "Oberalm", suche: "Oberalm", art: "viertel" },
  { nr: 16, name: "Linzergasse", suche: "Linzer Gasse, Salzburg", art: "strasse" },
  { nr: 17, name: "Blindergasse", suche: "Blindengasse, Salzburg", art: "strasse" },
  { nr: 18, name: "Maxglan", suche: "Maxglan, Salzburg", art: "viertel", mehrfach: true },
  { nr: 19, name: "Bergerbräuhofstraße", suche: "Bergerbräuhofstraße, Salzburg", art: "strasse", zusatz: "Schallmoos" },
  { nr: 20, name: "Hauptbahnhof", suche: "Salzburg Hauptbahnhof", art: "punkt", zusatz: "Engelbert-Weiß-Weg", mehrfach: true },
  { nr: 21, name: "Arbeiterkammer", suche: "Arbeiterkammer Salzburg, Markus-Sittikus-Straße", art: "punkt" },
  { nr: 22, name: "Gnigl", suche: "Gnigl, Salzburg", art: "viertel" },
  { nr: 23, name: "JumpDome", suche: "JumpDome, Salzburg", art: "punkt" },
  { nr: 24, name: "Nonntal", suche: "Nonntal, Salzburg", art: "viertel" },
  { nr: 25, name: "LKH Salzburg", suche: "Uniklinikum Salzburg, Landeskrankenhaus", art: "punkt" },
  { nr: 26, name: "Taxham", suche: "Taxham, Salzburg", art: "viertel" },
  { nr: 27, name: "Messezentrum", suche: "Messezentrum Salzburg", art: "punkt" },
  { nr: 28, name: "Schlossbrücke", suche: "Staatsbrücke, Salzburg", art: "punkt", zusatz: "Altstadt" },
  { nr: 29, name: "Salzburg AG", suche: "Salzburg AG, Bayerhamerstraße", art: "punkt" },
  { nr: 30, name: "Musisches Gymnasium", suche: "Musisches Gymnasium Salzburg, Haunspergstraße", art: "punkt", zusatz: "Itzling" },
  { nr: 31, name: "HTL Salzburg", suche: "HTL Salzburg, Itzling", art: "punkt" },
  { nr: 32, name: "Stadtbibliothek", suche: "Stadtbibliothek Salzburg, Schumacherstraße", art: "punkt" },
  { nr: 33, name: "Europark", suche: "Europark, Salzburg", art: "punkt" },
  { nr: 34, name: "Aigen", suche: "Aigen, Salzburg", art: "viertel" },
  { nr: 35, name: "Plainstraße", suche: "Plainstraße, Salzburg", art: "strasse" },
  { nr: 36, name: "Itzling West", suche: "Itzling, Salzburg", art: "viertel" },
  { nr: 37, name: "Sterneckstraße", suche: "Sterneckstraße, Salzburg", art: "strasse" },
];

/* --------------------------------------------------------------------------
   Die Partnerbetriebe
   --------------------------------------------------------------------------
   Die Namen stammen aus src/data/partners.ts und werden dort gefuehrt. Hier
   steht nur, wonach gesucht wird.
-------------------------------------------------------------------------- */
const PARTNER = [
  { name: "Arbeiterkammer", suche: "Arbeiterkammer Salzburg, Markus-Sittikus-Straße" },
  { name: "WIFI", suche: "WIFI Salzburg, Julius-Raab-Platz" },
  { name: "Raiffeisenbank", suche: "Raiffeisenverband Salzburg, Schwarzstraße" },
  { name: "Branit", suche: "Branit, Salzburg" },
  { name: "Porsche", suche: "Porsche Salzburg, Vogelweiderstraße" },
  { name: "ICmedia", suche: "ICmedia, Salzburg" },
  { name: "Maikai", suche: "Maikai, Salzburg" },
  { name: "Ninjas", suche: "Ninjas, Salzburg" },
  { name: "Altstadt Salzburg", suche: "Altstadt, Salzburg" },
  { name: "Chef Döner", suche: "Chef Döner, Salzburg" },
  { name: "Fifty4Burgers", suche: "Fifty4Burgers, Salzburg" },
  { name: "Naya", suche: "Naya, Salzburg" },
  { name: "Sahil Barbershop", suche: "Sahil Barbershop, Salzburg" },
  { name: "Mi & More", suche: "Mi and More, Salzburg" },
  { name: "Producito", suche: "Producito, Salzburg" },
  { name: "Salz & Zucker Bäckerei", suche: "Salz und Zucker, Salzburg" },
  { name: "VoglBike", suche: "Vogl Bike, Salzburg" },
  { name: "Café Eis Möwen", suche: "Eis Möwen, Salzburg" },
  { name: "Café Mozart", suche: "Café Mozart, Salzburg" },
  { name: "Yazzon", suche: "Yazzon, Salzburg" },
  { name: "KOI", suche: "KOI, Salzburg" },
  { name: "JumpDome", suche: "JumpDome, Salzburg" },
  { name: "Wagendoktor", suche: "Wagendoktor, Salzburg" },
  { name: "Elixhausner Wirt", suche: "Elixhausner Wirt, Elixhausen" },
];

/* --- Abfrage ------------------------------------------------------------- */

const lager = existsSync(lagerDatei) ? JSON.parse(readFileSync(lagerDatei, "utf8")) : {};

async function suchen(text) {
  if (text in lager) return lager[text];

  const adresse = new URL("https://nominatim.openstreetmap.org/search");
  adresse.searchParams.set("q", text);
  adresse.searchParams.set("format", "jsonv2");
  adresse.searchParams.set("limit", "5");
  adresse.searchParams.set("countrycodes", "at,de");
  // Vorfilter auf den Ausschnitt. `bounded=1` verwirft alles ausserhalb schon
  // beim Dienst, statt uns eine lange Liste zu schicken, die wir dann selbst
  // wegwerfen.
  adresse.searchParams.set(
    "viewbox",
    `${RAHMEN.west},${RAHMEN.nord},${RAHMEN.ost},${RAHMEN.sued}`,
  );
  adresse.searchParams.set("bounded", "1");

  const antwort = await fetch(adresse, {
    headers: {
      "user-agent": "salzburgsucht-kartenbau/1.0 (einmalige Verortung, Kontakt ueber salzburgsucht.at)",
      "accept-language": "de",
    },
  });

  if (!antwort.ok) {
    throw new Error(`Nominatim antwortete mit ${antwort.status} ${antwort.statusText}`);
  }

  const treffer = await antwort.json();
  lager[text] = treffer;

  mkdirSync(dirname(lagerDatei), { recursive: true });
  writeFileSync(lagerDatei, JSON.stringify(lager), "utf8");

  // Eine Anfrage pro Sekunde. Das ist die Bedingung, unter der der Dienst
  // ueberhaupt offen ist.
  await new Promise((f) => setTimeout(f, 1100));
  return treffer;
}

function imRahmen(t) {
  const b = Number(t.lat);
  const l = Number(t.lon);
  return b >= RAHMEN.sued && b <= RAHMEN.nord && l >= RAHMEN.west && l <= RAHMEN.ost;
}

async function verorten(eintraege, beschriftung) {
  const ergebnis = [];
  console.log(`\n=== ${beschriftung} ===`);

  for (const eintrag of eintraege) {
    const treffer = (await suchen(eintrag.suche)).filter(imRahmen);
    const beste = treffer[0];

    if (!beste) {
      console.log(`  ✗ ${eintrag.name.padEnd(26)} kein Treffer im Ausschnitt`);
      ergebnis.push({ ...eintrag, breite: null, laenge: null, quelle: null });
      continue;
    }

    console.log(
      `  ✓ ${eintrag.name.padEnd(26)} ${Number(beste.lat).toFixed(5)}, ${Number(beste.lon).toFixed(5)}  ${beste.display_name.slice(0, 60)}`,
    );
    ergebnis.push({
      ...eintrag,
      breite: Number(Number(beste.lat).toFixed(5)),
      laenge: Number(Number(beste.lon).toFixed(5)),
      // Beides landet in der Vorschlagsdatei, damit beim Durchsehen sichtbar
      // ist, WORAUF der Treffer eigentlich zeigt.
      quelle: { typ: beste.type, klasse: beste.category, name: beste.display_name },
      weitere: treffer.slice(1, 3).map((t) => t.display_name),
    });
  }
  return ergebnis;
}

const verstecke = await verorten(VERSTECKE, "Verstecke");
const partner = await verorten(PARTNER, "Partner");

mkdirSync(ausgabeOrdner, { recursive: true });
writeFileSync(
  zielDatei,
  JSON.stringify({ verstecke, partner }, null, 2) + "\n",
  "utf8",
);

const offen = [...verstecke, ...partner].filter((e) => e.breite === null);
console.log(`\nGeschrieben: ${zielDatei}`);
console.log(`${verstecke.length + partner.length} Eintraege, davon ${offen.length} ohne Treffer:`);
for (const e of offen) console.log(`  - ${e.name}`);
