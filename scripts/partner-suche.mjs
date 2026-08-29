/**
 * Sucht Standorte fuer Partnerbetriebe, die noch keinen haben.
 *
 * Das Ergebnis ist ein VORSCHLAG und keine Eintragung. Der Unterschied ist der
 * ganze Punkt: Ein Namenstreffer in OpenStreetMap heisst "hier gibt es etwas,
 * das aehnlich heisst" und nicht "das ist der Betrieb". Wer das verwechselt,
 * setzt einen Marker auf ein Lokal, das jemand anderem gehoert.
 *
 * Gesucht wird zweistufig:
 *
 *   1. Overpass, nach `name` im Umkreis von Salzburg. Das findet Betriebe, die
 *      in OSM erfasst sind, samt Adresse und Art.
 *   2. Nominatim, falls Overpass nichts hat. Weniger genau, dafuer toleranter
 *      bei Schreibweisen.
 *
 * Beides wird auf ein Rechteck um Salzburg begrenzt. Ohne diese Begrenzung
 * landet "Porsche" in Stuttgart und "KOI" in Japan — das ist die wichtigste
 * Zeile im Skript.
 *
 * Aufruf:  node scripts/partner-suche.mjs
 * Ausgabe: scripts/ausgabe/partner-vorschlag.json
 */
import { mkdirSync, writeFileSync } from "node:fs";

const RAHMEN = { sued: 47.68, west: 12.9, nord: 47.95, ost: 13.25 };
const OVERPASS = "https://overpass-api.de/api/interpreter";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const KENNUNG = "salzburgsucht-website/1.0 (Partnerstandorte, einmaliger Lauf)";

/**
 * Die Betriebe, die noch keinen Standort haben.
 *
 * ----------------------------------------------------------------------------
 * WARUM DIESE LISTE KUERZER GEWORDEN IST — UND NICHT DURCH DIESES SKRIPT
 * ----------------------------------------------------------------------------
 * Es waren zehn. Fuenf davon sind inzwischen eingetragen, aber keiner ueber
 * eine Namenssuche in OpenStreetMap: Dort stehen sie schlicht nicht. Gefunden
 * wurden sie ueber die eigene Seite des Betriebs beziehungsweise ueber den
 * Eintrag des Tourismusverbands — und zwar deshalb, weil sie dort anders
 * heissen als in unserer Partnerliste:
 *
 *   Yazzon      → YAZZOON, Ursulinenplatz 4
 *   Mi & More   → Mian&More Ramen Bar, Getreidegasse 36B
 *   Naya        → NAYA kitchen & bar, Hofstallgasse 2–4
 *   Wagendoktor → Der Wagendoktor e.U., Oberalm bei Hallein
 *
 * Erst die ADRESSE wurde dann geokodiert, nie der Name. Das ist der
 * entscheidende Unterschied: Eine Namenssuche liefert "etwas, das aehnlich
 * heisst", eine Adresssuche liefert die Adresse.
 *
 * Wer die restlichen fuenf sucht, faengt deshalb nicht hier an, sondern bei
 * der Frage, wie der Betrieb wirklich heisst.
 */
const GESUCHT = ["Branit", "ICmedia", "Chef Döner", "Producito", "Café Eis Möwen"];

const warten = (ms) => new Promise((r) => setTimeout(r, ms));

function imRahmen(breite, laenge) {
  return (
    breite >= RAHMEN.sued && breite <= RAHMEN.nord && laenge >= RAHMEN.west && laenge <= RAHMEN.ost
  );
}

/* --- Overpass ------------------------------------------------------------ */

async function ueberOverpass(name) {
  const kasten = `${RAHMEN.sued},${RAHMEN.west},${RAHMEN.nord},${RAHMEN.ost}`;
  // Teilstring, ohne Beachtung der Gross-/Kleinschreibung. Der Betrieb heisst
  // in OSM selten genau so wie in der Partnerliste.
  const wort = name.replace(/["\\]/g, "");
  const abfrage = `[out:json][timeout:40];
(
  node["name"~"${wort}",i](${kasten});
  way["name"~"${wort}",i](${kasten});
);
out center tags 12;`;

  const antwort = await fetch(OVERPASS, {
    method: "POST",
    body: "data=" + encodeURIComponent(abfrage),
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": KENNUNG },
  });
  if (!antwort.ok) throw new Error(`Overpass ${antwort.status}`);
  const daten = await antwort.json();

  return (daten.elements ?? [])
    .map((e) => {
      const breite = e.lat ?? e.center?.lat;
      const laenge = e.lon ?? e.center?.lon;
      if (breite === undefined || laenge === undefined) return null;
      if (!imRahmen(breite, laenge)) return null;
      const t = e.tags ?? {};
      return {
        quelle: "overpass",
        name: t.name,
        art: t.shop ?? t.amenity ?? t.office ?? t.leisure ?? t.craft ?? null,
        strasse: [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ") || null,
        ort: t["addr:city"] ?? null,
        breite: Number(breite.toFixed(5)),
        laenge: Number(laenge.toFixed(5)),
      };
    })
    .filter(Boolean);
}

/* --- Nominatim ----------------------------------------------------------- */

async function ueberNominatim(name) {
  const p = new URLSearchParams({
    q: name,
    format: "json",
    limit: "5",
    bounded: "1",
    viewbox: `${RAHMEN.west},${RAHMEN.nord},${RAHMEN.ost},${RAHMEN.sued}`,
    addressdetails: "1",
  });
  const antwort = await fetch(`${NOMINATIM}?${p}`, { headers: { "User-Agent": KENNUNG } });
  if (!antwort.ok) throw new Error(`Nominatim ${antwort.status}`);
  const daten = await antwort.json();

  return daten
    .filter((t) => imRahmen(Number(t.lat), Number(t.lon)))
    .map((t) => ({
      quelle: "nominatim",
      name: t.display_name,
      art: t.type ?? null,
      strasse: [t.address?.road, t.address?.house_number].filter(Boolean).join(" ") || null,
      ort: t.address?.city ?? t.address?.town ?? t.address?.village ?? null,
      breite: Number(Number(t.lat).toFixed(5)),
      laenge: Number(Number(t.lon).toFixed(5)),
    }));
}

/* --- Lauf ---------------------------------------------------------------- */

const ergebnis = {};

for (const name of GESUCHT) {
  process.stdout.write(`${name.padEnd(20)} `);
  let treffer = [];
  try {
    treffer = await ueberOverpass(name);
  } catch (fehler) {
    console.log(`Overpass-Fehler: ${fehler.message}`);
  }

  if (treffer.length === 0) {
    await warten(1100); // Nominatim erlaubt eine Anfrage je Sekunde.
    try {
      treffer = await ueberNominatim(name);
    } catch (fehler) {
      console.log(`Nominatim-Fehler: ${fehler.message}`);
    }
  }

  ergebnis[name] = treffer;
  console.log(
    treffer.length === 0
      ? "— nichts"
      : treffer
          .slice(0, 3)
          .map((t) => `${t.name} (${t.art ?? "?"}, ${t.strasse ?? t.ort ?? "ohne Adresse"})`)
          .join(" | "),
  );

  await warten(1600);
}

mkdirSync("scripts/ausgabe", { recursive: true });
writeFileSync("scripts/ausgabe/partner-vorschlag.json", JSON.stringify(ergebnis, null, 2), "utf8");
console.log("\nscripts/ausgabe/partner-vorschlag.json geschrieben — bitte durchsehen.");
