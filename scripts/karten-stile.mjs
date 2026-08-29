/**
 * Erzeugt die beiden Kartenstile der Salzburg-Karte.
 *
 * ----------------------------------------------------------------------------
 * WARUM DIE STILE IM PROJEKT LIEGEN UND NICHT ZUR LAUFZEIT GEHOLT WERDEN
 * ----------------------------------------------------------------------------
 * OpenFreeMap liefert fertige Stile aus. Sie zu verlinken waere eine Zeile
 * Code — und drei Nachteile: Das Aussehen der Karte haengt dann an einer
 * fremden Datei, die sich jederzeit aendern kann; die Farben liessen sich
 * nicht an das Salzburgsucht-System binden; und es waere eine weitere Anfrage
 * vor dem ersten Bild.
 *
 * Also: einmal holen, einmal umfaerben, im Projekt ablegen. Die Kacheln kommen
 * weiter von OpenFreeMap, das Aussehen gehoert uns.
 *
 * ----------------------------------------------------------------------------
 * WARUM BEIDE STILE AUS DERSELBEN VORLAGE KOMMEN
 * ----------------------------------------------------------------------------
 * "bright" hat 119 Ebenen — Strassennamen, Stadtteile, Gewaesser, Bahn, POIs.
 * "dark" hat 47 und laesst genau das weg, was man auf einer Stadtkarte lesen
 * will. Beide Stile hier stammen deshalb aus "bright": Der dunkle ist nicht
 * die abgespeckte Fassung des farbigen, sondern dieselbe Karte in Nachtfarben.
 * Ein Dunkelmodus, der weniger zeigt, ist kein Stil, sondern ein Verlust.
 *
 * ----------------------------------------------------------------------------
 * WIE UMGEFAERBT WIRD
 * ----------------------------------------------------------------------------
 * Nicht algorithmisch invertiert — das ergibt braune Waelder und rosa Wasser.
 * Stattdessen eine Zuordnung nach Ebenengruppen (unten `NACHT` und `TAG`).
 * Jede Regel trifft ueber ein Muster auf die Ebenen-Kennung; was keine Regel
 * trifft, behaelt seine Farbe und wird am Ende aufgelistet, damit nichts
 * unbemerkt durchrutscht.
 *
 * Aufruf:  node scripts/karten-stile.mjs
 */
import { writeFileSync } from "node:fs";

const VORLAGE = "https://tiles.openfreemap.org/styles/bright";
const ZIEL_DUNKEL = "src/data/karte/stil-dunkel.json";
const ZIEL_FARBIG = "src/data/karte/stil-farbig.json";

/* --- Die Palette der Nachtkarte ------------------------------------------ */

/**
 * Die Helligkeitsreihe ist dieselbe wie bei Tag, nur umgedreht: Grund am
 * dunkelsten, darueber Flaechen, dann Strassen, und die Beschriftung ganz
 * oben. Wichtig ist die Abstufung INNERHALB der Strassen — wenn Autobahn und
 * Wohnstrasse gleich hell sind, sieht man kein Netz mehr, sondern Grafik.
 */
const NACHT = [
  // Die Beschriftung steht ZUERST. Regeln greifen von oben nach unten, und
  // die erste passende gewinnt — ein allgemeines Muster wie /^waterway/ wuerde
  // sonst auch waterway_line_label treffen und ihm eine Linienfarbe geben,
  // die eine Schrift nicht kennt. Sie behielte ihren weissen Hof aus der
  // Tagesvorlage und stuende auf der Nachtkarte in einem hellen Kasten.
  // Beschriftung: heller Text, dunkler Hof. Ohne den Hof steht jeder Name
  // auf einer anderen Flaeche und ist mal lesbar, mal nicht.
  [/^label_(country|state)/, { "text-color": "#c6dcf0", "text-halo-color": "#04182c" }],
  [/^label_(city|city_capital)/, { "text-color": "#ffffff", "text-halo-color": "#04182c" }],
  [/^label_(town|village|other)/, { "text-color": "#d7e8f8", "text-halo-color": "#04182c" }],
  [/^highway-name/, { "text-color": "#a9c9e4", "text-halo-color": "#04182c" }],
  [/^highway-shield|^road_shield/, { "text-color": "#e6f1fb", "text-halo-color": "#04182c" }],
  [/^water_name|^waterway_line_label/, { "text-color": "#7fb4dc", "text-halo-color": "#04182c" }],
  [/^poi_/, { "text-color": "#9fc0dd", "text-halo-color": "#04182c" }],
  [/^airport/, { "text-color": "#c6dcf0", "text-halo-color": "#04182c" }],
  [/^road_oneway/, { "icon-color": "#5b8bb4" }],

  [/^background$/, { "background-color": "#04182c" }],

  // Flaechen
  // Anker noetig: /^water/ ohne $ trifft auch waterway-river und
  // water_name_point_label — die Salzach bekaeme dann eine Flaechenfarbe,
  // die eine Linie gar nicht kennt, und behielte ihr Tagesblau.
  [/^water(-intermittent)?$/, { "fill-color": "#0a3a5c" }],
  [/^landcover-wood/, { "fill-color": "#0b2f45" }],
  [/^(park|landcover-grass)/, { "fill-color": "#0a3040" }],
  [/^landuse-(residential|suburb)/, { "fill-color": "#071f36" }],
  [/^landuse-(commercial|industrial|railway)/, { "fill-color": "#08243c" }],
  [/^landuse-(cemetery|hospital|school)/, { "fill-color": "#092a3e" }],
  [/^landcover-(sand|glacier|ice-shelf)/, { "fill-color": "#0d3350" }],
  [/^building/, { "fill-color": "#0c2c4a", "fill-outline-color": "#123a5e" }],

  // Wasserlaeufe
  [/^waterway/, { "line-color": "#2a6f9e" }],

  // Strassen: Fassung dunkler als der Kern, sonst verschwimmen sie
  [/casing$/, { "line-color": "#04182c" }],
  [/^(highway|tunnel|bridge)-motorway$/, { "line-color": "#5b9fd8" }],
  [/^(highway|tunnel|bridge)-motorway-link$/, { "line-color": "#4d8ec4" }],
  [/^(highway|tunnel|bridge)-trunk/, { "line-color": "#4a8ec6" }],
  [/^(highway|tunnel|bridge)-primary/, { "line-color": "#4180b4" }],
  [/^(highway|tunnel|bridge)-secondary-tertiary$/, { "line-color": "#376d9c" }],
  [/^(highway|tunnel|bridge)-link$/, { "line-color": "#376d9c" }],
  [/^(highway|tunnel|bridge)-minor$/, { "line-color": "#2d5c86" }],
  [/^(highway|tunnel)-service-track/, { "line-color": "#28527a" }],
  [/^(highway|tunnel|bridge)-path$/, { "line-color": "#24496b" }],
  [/^road_pier|^road_area_pier|^highway-area/, { "line-color": "#28527a", "fill-color": "#0c2c4a" }],

  // Schiene, Seilbahn, Faehre
  [/^(railway|bridge-railway|tunnel-railway|cablecar)/, { "line-color": "#3f6d92" }],
  [/^ferry/, { "line-color": "#33628a" }],
  [/^aeroway/, { "line-color": "#2d5c86", "fill-color": "#0a2740" }],

  // Grenzen
  [/^boundary/, { "line-color": "#6d9cc4" }],

];

/**
 * Die Tagkarte bleibt weitgehend, wie sie ist — sie ist gut gemacht. Zwei
 * Eingriffe: Der Grund bekommt einen sehr leichten Blaustich, damit die Karte
 * nicht wie ein Fremdkoerper in der Seite sitzt, und die schreiendsten
 * Strassenfarben (Autobahn-Orange) werden zurueckgenommen.
 *
 * Absichtlich sparsam. Eine Tageskarte, die man vollstaendig in Markenfarben
 * taucht, ist danach als Karte schlechter lesbar — und lesbar zu sein ist ihr
 * einziger Zweck.
 */
const TAG = [
  [/^background$/, { "background-color": "#f6f9fc" }],
  [/^water$/, { "fill-color": "#cfe3f5" }],
  [/^waterway/, { "line-color": "#a9cae6" }],
  [/^landcover-wood/, { "fill-color": "#dfeadd" }],
  [/^(park|landcover-grass)/, { "fill-color": "#e4f0e2" }],
  [/^landuse-(residential|suburb)/, { "fill-color": "#f1f4f8" }],
  [/^building/, { "fill-color": "#e6e9ee", "fill-outline-color": "#dadfe6" }],
  [/^(highway|tunnel|bridge)-motorway$/, { "line-color": "#f2b98a" }],
  [/^(highway|tunnel|bridge)-motorway-link$/, { "line-color": "#f5c9a5" }],
  [/^(highway|tunnel|bridge)-trunk/, { "line-color": "#f7cfa8" }],
  [/^label_(city|city_capital)/, { "text-color": "#0b3556", "text-halo-color": "#ffffff" }],
  [/^label_(town|village|other)/, { "text-color": "#20496b", "text-halo-color": "#ffffff" }],
  [/^highway-name/, { "text-color": "#4a6c86", "text-halo-color": "#ffffff" }],
];

/* --- Umfaerben ------------------------------------------------------------ */

/**
 * Eine Farbangabe kann ein Wert oder ein Ausdruck sein.
 *
 * `#fff` ist einfach. `["interpolate", ..., 10, "#eee", 16, "#fff"]` ist der
 * Normalfall in echten Stilen — die Farbe haengt an der Zoomstufe. Beides
 * durch dieselbe Zuweisung zu ersetzen waere falsch: Der Verlauf ist die
 * halbe Qualitaet des Stils.
 *
 * Deshalb wird bei Ausdruecken nur der FARBTEIL getauscht und die Struktur
 * behalten. Aus einem Verlauf von Grau nach Weiss wird so ein Verlauf von
 * Dunkelblau nach Hellblau — und nicht eine flache Flaeche.
 */
function farbeSetzen(alt, neu) {
  if (typeof alt === "string" || alt === undefined) return neu;
  if (!Array.isArray(alt)) return neu;

  // Jeden Farbstring im Ausdruck ersetzen, Struktur und Stopps behalten.
  return alt.map((teil) => {
    if (typeof teil === "string" && /^#|^rgba?\(|^hsla?\(/.test(teil)) return neu;
    if (Array.isArray(teil)) return farbeSetzen(teil, neu);
    return teil;
  });
}

function anwenden(stil, regeln, name) {
  const getroffen = new Set();

  for (const ebene of stil.layers) {
    for (const [muster, farben] of regeln) {
      if (!muster.test(ebene.id)) continue;
      getroffen.add(ebene.id);

      for (const [schluessel, wert] of Object.entries(farben)) {
        const behaelter = schluessel.startsWith("icon-") || schluessel.startsWith("text-")
          ? (ebene.paint ??= {})
          : (ebene.paint ??= {});
        // Nur setzen, wenn die Ebene diese Eigenschaft ueberhaupt kennt oder
        // es eine Farbe ist, die sie sinnvollerweise haben kann.
        if (schluessel in behaelter || passt(ebene, schluessel)) {
          behaelter[schluessel] = farbeSetzen(behaelter[schluessel], wert);
        }
      }
      break; // erste passende Regel gewinnt
    }
  }

  const ohne = stil.layers.filter((l) => !getroffen.has(l.id) && l.type !== "symbol");
  console.log(`  ${name}: ${getroffen.size} von ${stil.layers.length} Ebenen umgefaerbt`);
  if (ohne.length) {
    console.log(`    ohne Regel (behalten ihre Farbe): ${ohne.map((l) => l.id).join(", ")}`);
  }
}

/** Passt die Farbeigenschaft zum Ebenentyp? */
function passt(ebene, schluessel) {
  if (ebene.type === "background") return schluessel.startsWith("background-");
  if (ebene.type === "fill") return schluessel.startsWith("fill-");
  if (ebene.type === "line") return schluessel.startsWith("line-");
  if (ebene.type === "symbol") return schluessel.startsWith("text-") || schluessel.startsWith("icon-");
  return false;
}

/* --- Lauf ---------------------------------------------------------------- */

const antwort = await fetch(VORLAGE);
if (!antwort.ok) throw new Error(`Vorlage nicht erreichbar: ${antwort.status}`);
const vorlage = await antwort.json();

console.log(`Vorlage: ${VORLAGE} — ${vorlage.layers.length} Ebenen`);

/**
 * Die Reliefschummerung faellt weg.
 *
 * Sie ist die einzige RASTER-Quelle im Stil und wird nur bis Zoomstufe 6
 * gezeichnet. Unsere Karte faengt bei 9,5 an — sie waere also nie zu sehen und
 * trotzdem eine Quelle mehr, die der Browser anfragt.
 */
function saeubern(stil) {
  const kopie = JSON.parse(JSON.stringify(stil));
  delete kopie.sources.ne2_shaded;
  kopie.layers = kopie.layers.filter((l) => l.source !== "ne2_shaded");
  delete kopie.id;
  return kopie;
}

const dunkel = saeubern(vorlage);
anwenden(dunkel, NACHT, "dunkel");
dunkel.name = "Salzburgsucht Nacht";

const farbig = saeubern(vorlage);
anwenden(farbig, TAG, "farbig");
farbig.name = "Salzburgsucht Tag";

writeFileSync(ZIEL_DUNKEL, JSON.stringify(dunkel), "utf8");
writeFileSync(ZIEL_FARBIG, JSON.stringify(farbig), "utf8");

console.log(`\n${ZIEL_DUNKEL}  ${(JSON.stringify(dunkel).length / 1024).toFixed(1)} kB`);
console.log(`${ZIEL_FARBIG}  ${(JSON.stringify(farbig).length / 1024).toFixed(1)} kB`);
