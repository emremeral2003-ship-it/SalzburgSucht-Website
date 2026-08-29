/**
 * Holt die Kartengrundlage fuer Salzburg aus OpenStreetMap und legt sie als
 * fertige SVG-Pfade im Projekt ab.
 *
 * Warum ueberhaupt selbst rendern statt Kacheln zu laden:
 *
 *   1. Jede Kachel von Google, Mapbox oder auch nur dem OSM-Standardserver ist
 *      ein Fremdaufruf aus dem Browser des Besuchers heraus — mit IP-Adresse,
 *      Referrer und allem, was dazugehoert. Diese Seite hat einen
 *      Cookie-Banner und einen Datenschutztext, in dem das dann stehen
 *      muesste. Ohne Fremdaufruf muss es das nicht.
 *   2. Kacheln bringen ihr eigenes Aussehen mit. Die Karte soll aber wie der
 *      Rest der Seite aussehen und ueber das Tweaks-Panel steuerbar sein.
 *      Ein Bild kann man nicht umfaerben, einen Pfad schon.
 *   3. Keine zusaetzliche Abhaengigkeit, kein Schluessel, kein Kontingent.
 *
 * Was hier herauskommt, ist eine Datei: src/data/karte/salzburg-geometrie.json
 * Sie enthaelt den Kartenausschnitt und je Ebene eine Liste fertiger
 * `d`-Attribute im lokalen Koordinatensystem der Karte. Die Marker werden zur
 * Laufzeit mit derselben Formel projiziert (siehe src/lib/karte.ts), deshalb
 * liegen sie exakt auf der Geometrie.
 *
 * Aufruf:  node scripts/karten-geometrie.mjs
 *
 * Das Skript laeuft NICHT beim Bauen. Es wird von Hand aufgerufen, wenn sich
 * der Ausschnitt aendern soll — die erzeugte Datei liegt im Repository.
 *
 * Datenquelle: OpenStreetMap-Mitwirkende, ODbL. Die Nennung steht sichtbar an
 * der Karte selbst (siehe salzburg-karte.tsx) und ist Lizenzbedingung, kein
 * Hoeflichkeitshinweis.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const zielDatei = join(wurzel, "src", "data", "karte", "salzburg-geometrie.json");

/**
 * Der Ausschnitt.
 *
 * Er muss alle Marker beider Karten enthalten: im Sueden Hallein und Puch, im
 * Norden Elixhausen, im Westen Viehhausen, im Osten der Gaisberg. Deshalb ist
 * er groesser als die Stadt — die Karte startet trotzdem auf dem Stadtkern,
 * das regelt die Startansicht in der Komponente.
 */
const RAHMEN = { sued: 47.655, west: 12.925, nord: 47.895, ost: 13.175 };

/** Breite des lokalen Koordinatensystems. Die Hoehe ergibt sich aus dem Seitenverhaeltnis. */
const BREITE = 1000;

/* --- Projektion ---------------------------------------------------------- */

/**
 * Web-Mercator, normiert auf 0..1.
 *
 * Genau diese Formel steht ein zweites Mal in src/lib/karte.ts. Sie ist kurz
 * genug, dass eine gemeinsame Datei mehr Umstand als Nutzen waere — aber wenn
 * sie hier geaendert wird, muss sie dort mitgeaendert werden, sonst wandern
 * die Marker von der Geometrie weg.
 */
function welt(breite, laenge) {
  const b = (breite * Math.PI) / 180;
  return {
    x: (laenge + 180) / 360,
    y: (1 - Math.log(Math.tan(b) + 1 / Math.cos(b)) / Math.PI) / 2,
  };
}

const linksOben = welt(RAHMEN.nord, RAHMEN.west);
const rechtsUnten = welt(RAHMEN.sued, RAHMEN.ost);
const spanneX = rechtsUnten.x - linksOben.x;
const spanneY = rechtsUnten.y - linksOben.y;
const HOEHE = Math.round((BREITE * spanneY) / spanneX);

function projizieren(breite, laenge) {
  const p = welt(breite, laenge);
  return [
    ((p.x - linksOben.x) / spanneX) * BREITE,
    ((p.y - linksOben.y) / spanneY) * HOEHE,
  ];
}

/* --- Vereinfachung ------------------------------------------------------- */

/**
 * Douglas-Peucker.
 *
 * Ohne das ist die Datei mehrere Megabyte gross und der Browser zeichnet
 * Hunderttausende Punkte, von denen bei dieser Darstellungsgroesse keine zwei
 * unterscheidbar waeren. Die Toleranz ist in Einheiten des lokalen Systems
 * angegeben: 1 entspricht einem Tausendstel der Kartenbreite, also rund 19 m.
 */
function vereinfachen(punkte, toleranz) {
  if (punkte.length < 3) return punkte;

  let maxAbstand = 0;
  let index = 0;
  const [ax, ay] = punkte[0];
  const [bx, by] = punkte[punkte.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const laenge = Math.hypot(dx, dy);

  for (let i = 1; i < punkte.length - 1; i++) {
    const [px, py] = punkte[i];
    const abstand =
      laenge === 0
        ? Math.hypot(px - ax, py - ay)
        : Math.abs(dy * px - dx * py + bx * ay - by * ax) / laenge;
    if (abstand > maxAbstand) {
      maxAbstand = abstand;
      index = i;
    }
  }

  if (maxAbstand <= toleranz) return [punkte[0], punkte[punkte.length - 1]];

  return [
    ...vereinfachen(punkte.slice(0, index + 1), toleranz).slice(0, -1),
    ...vereinfachen(punkte.slice(index), toleranz),
  ];
}

function pfad(punkte, geschlossen) {
  if (punkte.length < 2) return null;
  const teile = punkte.map(
    ([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`,
  );
  return teile.join(" ") + (geschlossen ? " Z" : "");
}

/* --- Overpass ------------------------------------------------------------ */

const BEREICH = `${RAHMEN.sued},${RAHMEN.west},${RAHMEN.nord},${RAHMEN.ost}`;

/**
 * Zwischenlager der Rohantworten.
 *
 * Overpass ist ein Freiwilligendienst und antwortet auf zu schnelle
 * Wiederholungen mit 429. Beim Feineinstellen der Vereinfachung aendert sich
 * aber nur die Nachbearbeitung, nicht die Abfrage — es waere unhoeflich und
 * langsam, dafuer jedes Mal neu zu fragen. Der Ordner liegt unter
 * node_modules/.cache und ist damit schon ignoriert; wer wirklich frische
 * Daten will, loescht ihn.
 */
const LAGER = join(wurzel, "node_modules", ".cache", "karten-overpass");

function lagerPfad(rumpf) {
  return join(LAGER, `${createHash("sha1").update(rumpf).digest("hex").slice(0, 16)}.json`);
}

async function abfragen(rumpf) {
  const datei = lagerPfad(rumpf);
  if (existsSync(datei)) {
    process.stdout.write("(aus dem Zwischenlager) ");
    return JSON.parse(readFileSync(datei, "utf8")).elements ?? [];
  }

  const antwort = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      // Die Nutzungsbedingungen von Overpass verlangen eine erkennbare
      // Kennung. Ein anonymer Massenabruf ist der Grund, aus dem offene
      // Dienste zugemacht werden.
      "user-agent": "salzburgsucht-kartenbau/1.0 (einmaliger Aufbau der Kartengrundlage)",
    },
    body: new URLSearchParams({
      data: `[out:json][timeout:180];${rumpf}out geom;`,
    }),
  });

  if (!antwort.ok) {
    throw new Error(
      `Overpass antwortete mit ${antwort.status} ${antwort.statusText}.` +
        (antwort.status === 429
          ? " Das ist die Sperre wegen zu vieler Anfragen — ein paar Minuten warten und erneut aufrufen."
          : ""),
    );
  }
  const text = await antwort.text();
  mkdirSync(LAGER, { recursive: true });
  writeFileSync(datei, text, "utf8");
  return (JSON.parse(text).elements ?? []);
}

/**
 * Ein Overpass-Element in Pfade uebersetzen.
 *
 * `way` hat eine Geometrie, `relation` hat mehrere Teilstuecke — bei einem
 * Fluss oder einer Stadtgrenze ist das die Regel und nicht die Ausnahme.
 * Die Teilstuecke werden nicht zusammengesetzt, sondern einzeln gezeichnet:
 * Bei Linien sieht man keinen Unterschied, und bei Flaechen sind die
 * Einzelringe ohnehin das, was man zeichnen will.
 */
function ausdehnung(punkte) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of punkte) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return Math.hypot(maxX - minX, maxY - minY);
}

function zuPfaden(element, toleranz, geschlossen, mindest) {
  const ergebnis = [];
  const stuecke =
    element.type === "relation"
      ? (element.members ?? []).filter((m) => m.geometry).map((m) => m.geometry)
      : element.geometry
        ? [element.geometry]
        : [];

  for (const stueck of stuecke) {
    const punkte = stueck.map((p) => projizieren(p.lat, p.lon));
    // Alles, was kleiner ist als ein paar Bildpunkte, kostet Bytes und
    // Rechenzeit und ist bei dieser Darstellungsgroesse nie zu sehen. Das
    // betrifft vor allem Waldstuecke: OSM kennt im Ausschnitt Tausende, von
    // denen die grosse Mehrheit ein Feldrand oder eine Baumgruppe ist.
    if (ausdehnung(punkte) < mindest) continue;
    const knapp = vereinfachen(punkte, toleranz);
    // Zwei Punkte, die nach dem Vereinfachen aufeinanderliegen, ergeben eine
    // unsichtbare Flaeche und trotzdem einen Eintrag in der Datei.
    if (knapp.length < 2) continue;
    const d = pfad(knapp, geschlossen);
    if (d) ergebnis.push(d);
  }
  return ergebnis;
}

/* --- Die Ebenen ---------------------------------------------------------- */

/**
 * Die Auswahl ist eine gestalterische Entscheidung, keine Vollstaendigkeit.
 *
 * Eine Karte, die alles zeigt, was OSM kennt, ist Rauschen. Gezeigt wird nur,
 * was beim Wiedererkennen hilft: die Salzach, weil sie die Stadt teilt; die
 * Seen und der Waldrand, weil sie den Ausschnitt erden; die grossen Strassen
 * und die Bahn, weil sie das Geruest bilden, an dem man Orte einordnet; die
 * Stadtgrenze, weil "Stadt oder Umland" die haeufigste Frage an diese Karte
 * ist. Wohngebiete, Hausumrisse und Nebenstrassen fehlen bewusst.
 */
const EBENEN = [
  {
    name: "wasser",
    toleranz: 0.9,
    mindest: 2,
    geschlossen: false,
    abfrage: `(way[waterway=river](${BEREICH});relation[waterway=river](${BEREICH}););`,
  },
  {
    name: "seen",
    toleranz: 1,
    mindest: 3,
    geschlossen: true,
    abfrage: `(way[natural=water][water!=river](${BEREICH});way[landuse=reservoir](${BEREICH}););`,
  },
  {
    name: "gruen",
    toleranz: 4.5,
    // Bewusst hoch: Der Ausschnitt enthaelt Untersberg und Gaisberg, und
    // gewollt sind die grossen Waldflaechen als ruhiger Grund — nicht jede
    // einzelne Hecke.
    mindest: 22,
    geschlossen: true,
    abfrage: `(way[landuse=forest](${BEREICH});way[natural=wood](${BEREICH}););`,
  },
  {
    name: "parks",
    toleranz: 1.2,
    mindest: 4,
    geschlossen: true,
    // Getrennt vom Wald, weil Mirabellgarten, Hellbrunn und der Kapuzinerberg
    // in der Stadt Orientierungspunkte sind und kraeftiger stehen duerfen als
    // der Waldrand am Bildrand.
    abfrage: `(way[leisure=park](${BEREICH});way[leisure=garden][access!=private](${BEREICH}););`,
  },
  {
    name: "bahn",
    toleranz: 1,
    mindest: 4,
    geschlossen: false,
    abfrage: `way[railway=rail][usage~"main|branch"][!tunnel](${BEREICH});`,
  },
  {
    name: "hauptstrassen",
    toleranz: 1,
    mindest: 3,
    geschlossen: false,
    abfrage: `way[highway~"^(motorway|trunk|primary)$"](${BEREICH});`,
  },
  {
    name: "nebenstrassen",
    toleranz: 1.5,
    mindest: 5,
    geschlossen: false,
    abfrage: `way[highway~"^(secondary|tertiary)$"](${BEREICH});`,
  },
  {
    name: "grenze",
    toleranz: 0.8,
    mindest: 0,
    geschlossen: false,
    // Salzburg ist Statutarstadt und damit zugleich Bezirk — die Stadtgrenze
    // haengt an `admin_level=6` und nicht an der Gemeindeebene 8. Ohne den
    // Namensfilter kaemen Berchtesgadener Land und Salzburg-Umgebung mit, die
    // beide in den Ausschnitt ragen.
    //
    // `geschlossen: false`, obwohl eine Grenze naturgemaess geschlossen ist:
    // Sie kommt als Relation aus vielen Teilstuecken, und jedes Teilstueck
    // einzeln zu schliessen ergaebe Dreiecke quer durch die Stadt.
    abfrage: `relation[boundary=administrative][admin_level=6][name="Salzburg"](${BEREICH});`,
  },
];

/* --- Ablauf -------------------------------------------------------------- */

const ebenen = {};
let pfadeGesamt = 0;

for (const ebene of EBENEN) {
  process.stdout.write(`${ebene.name} … `);
  const elemente = await abfragen(ebene.abfrage);
  const pfade = elemente.flatMap((e) =>
    zuPfaden(e, ebene.toleranz, ebene.geschlossen, ebene.mindest),
  );
  // Alle Teilstuecke einer Ebene landen in EINEM d-Attribut. Ein Pfad darf
  // beliebig viele Teilpfade enthalten, und der Unterschied ist erheblich:
  // ein DOM-Knoten je Ebene statt mehrerer tausend.
  ebenen[ebene.name] = pfade.join(" ");
  pfadeGesamt += pfade.length;
  console.log(`${elemente.length} Objekte, ${pfade.length} Teilpfade`);

  // Overpass ist ein Freiwilligendienst. Zwischen den Abfragen warten — beim
  // Lauf aus dem Zwischenlager entfaellt das, da geht keine Anfrage raus.
  await new Promise((f) => setTimeout(f, 4000));
}

mkdirSync(dirname(zielDatei), { recursive: true });
writeFileSync(
  zielDatei,
  JSON.stringify(
    {
      _hinweis:
        "Erzeugt von scripts/karten-geometrie.mjs — nicht von Hand bearbeiten. Daten: OpenStreetMap-Mitwirkende, ODbL.",
      rahmen: RAHMEN,
      breite: BREITE,
      hoehe: HOEHE,
      ebenen,
    },
    null,
    0,
  ) + "\n",
  "utf8",
);

const groesse = (Buffer.byteLength(JSON.stringify(ebenen)) / 1024).toFixed(0);
console.log(`\nGeschrieben: ${zielDatei}`);
console.log(`${pfadeGesamt} Pfade, ${groesse} kB, Kartenfeld ${BREITE}×${HOEHE}`);
