/**
 * Prueft die Salzburg-Karte, soweit das ohne Browser geht.
 *
 * Der Anlass ist eine Einschraenkung, die man kennen muss: MapLibre haengt
 * seine gesamte Arbeit — Stil laden, Kacheln anfordern, zeichnen — an
 * `requestAnimationFrame`. In Umgebungen ohne Bildwiederholung (eingebettete
 * Vorschaufenster, Kopflos-Browser ohne GPU) passiert deshalb gar nichts, und
 * zwar fehlerfrei: keine Meldung, keine Anfrage, nur eine leere Flaeche. Man
 * kann dort weder bestaetigen, dass die Karte funktioniert, noch dass sie es
 * nicht tut.
 *
 * Was sich ohne Browser pruefen laesst, ist trotzdem das meiste:
 *
 *   1. Sind die beiden Stildateien gueltige MapLibre-Stile? Geprueft mit dem
 *      Validator aus dem offiziellen Stil-Spezifikationspaket — derselbe, den
 *      die Bibliothek selbst benutzt.
 *   2. Haben beide denselben Detailgrad? Ein Dunkelmodus, der weniger zeigt,
 *      ist kein Stil, sondern ein Verlust.
 *   3. Sind Strassennamen und Ortsnamen ueberhaupt enthalten, und ab welcher
 *      Zoomstufe?
 *   4. Ist der Kachelserver erreichbar, samt Schriften und Sinnbildern?
 *   5. Nennt die Kachelquelle OpenStreetMap? Das ist Lizenzbedingung.
 *
 * Aufruf:  node scripts/pruefe-karte.mjs
 */
import { readFileSync } from "node:fs";

import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";

let fehler = 0;

function pruefe(bedingung, text) {
  console.log(`${bedingung ? "✓" : "✗"} ${text}`);
  if (!bedingung) fehler++;
}

/* --- 1. Gueltigkeit ------------------------------------------------------ */

const stile = {
  dunkel: JSON.parse(readFileSync("src/data/karte/stil-dunkel.json", "utf8")),
  farbig: JSON.parse(readFileSync("src/data/karte/stil-farbig.json", "utf8")),
};

for (const [name, stil] of Object.entries(stile)) {
  const meldungen = validateStyleMin(stil);
  pruefe(
    meldungen.length === 0,
    `Stil "${name}" ist gültig${meldungen.length ? `: ${meldungen.slice(0, 3).map((m) => m.message).join(" | ")}` : ""}`,
  );
}

/* --- 2. Gleicher Detailgrad ---------------------------------------------- */

const dunkelIds = new Set(stile.dunkel.layers.map((l) => l.id));
const farbigIds = new Set(stile.farbig.layers.map((l) => l.id));
const nurFarbig = [...farbigIds].filter((id) => !dunkelIds.has(id));
const nurDunkel = [...dunkelIds].filter((id) => !farbigIds.has(id));

pruefe(
  nurFarbig.length === 0 && nurDunkel.length === 0,
  `Beide Stile zeigen dasselbe (${dunkelIds.size} Ebenen)${
    nurFarbig.length ? ` — nur farbig: ${nurFarbig.join(", ")}` : ""
  }${nurDunkel.length ? ` — nur dunkel: ${nurDunkel.join(", ")}` : ""}`,
);

/* --- 3. Beschriftung ----------------------------------------------------- */

for (const [name, stil] of Object.entries(stile)) {
  const strassen = stil.layers.filter((l) => l.id.startsWith("highway-name"));
  const orte = stil.layers.filter((l) => /^label_(city|town|village|other)/.test(l.id));
  pruefe(
    strassen.length > 0 && orte.length > 0,
    `Stil "${name}": ${strassen.length} Ebenen mit Straßennamen (ab Zoom ${Math.min(
      ...strassen.map((l) => l.minzoom ?? 0),
    )}), ${orte.length} mit Ortsnamen`,
  );

  // Ein Text ohne Hof steht auf wechselndem Grund und ist mal lesbar, mal nicht.
  const ohneHof = [...strassen, ...orte].filter((l) => !l.paint?.["text-halo-color"]);
  pruefe(ohneHof.length === 0, `Stil "${name}": jede Beschriftung hat einen Hof`);
}

/* --- 4. Der Anbieter ----------------------------------------------------- */

const quelle = stile.dunkel.sources.openmaptiles;
pruefe(Boolean(quelle?.url), `Kachelquelle: ${quelle?.url ?? "fehlt"}`);
pruefe(
  !JSON.stringify(stile).includes("ne2_shaded"),
  "keine Rasterebene mehr im Stil (die Reliefschummerung ist raus)",
);

const antwort = await fetch(quelle.url);
pruefe(antwort.ok, `TileJSON erreichbar (HTTP ${antwort.status})`);

if (antwort.ok) {
  const tilejson = await antwort.json();
  pruefe(
    /openstreetmap/i.test(tilejson.attribution ?? ""),
    `Quellenangabe nennt OpenStreetMap: ${(tilejson.attribution ?? "—").replace(/<[^>]*>/g, "")}`,
  );
  pruefe(
    (tilejson.maxzoom ?? 0) >= 14,
    `Kacheln bis Zoomstufe ${tilejson.maxzoom} (darüber wird überzoomt, das ist normal)`,
  );

  // Eine echte Kachel aus dem Salzburger Stadtgebiet.
  const [z, x, y] = [14, 8781, 5729];
  const kachel = await fetch(tilejson.tiles[0].replace("{z}", z).replace("{x}", x).replace("{y}", y));
  pruefe(kachel.ok, `Beispielkachel über Salzburg lädt (HTTP ${kachel.status})`);
}

const schrift = await fetch(
  stile.dunkel.glyphs.replace("{fontstack}", "Noto%20Sans%20Bold").replace("{range}", "0-255"),
);
pruefe(schrift.ok, `Schriftzeichen erreichbar (HTTP ${schrift.status})`);

const sinnbild = await fetch(`${stile.dunkel.sprite}.json`);
pruefe(sinnbild.ok, `Sinnbilder erreichbar (HTTP ${sinnbild.status})`);

console.log(
  fehler === 0
    ? "\nDie Karte ist so weit in Ordnung, wie sich das ohne Browser sagen lässt."
    : `\n${fehler} Punkte offen.`,
);
process.exit(fehler === 0 ? 0 : 1);
