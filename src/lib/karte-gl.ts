import type { StyleSpecification } from "maplibre-gl";

import stilDunkel from "@/data/karte/stil-dunkel.json";
import stilFarbig from "@/data/karte/stil-farbig.json";
import type { KartenPunkt, PunktArt } from "@/types";

/**
 * Die Einstellungen der Salzburg-Karte, an einer Stelle.
 *
 * Alles, was man beim Feineinstellen anfassen will — Ausschnitt, Zoomgrenzen,
 * Farben der beiden Ebenen, Gruppierungsradius — steht hier und nicht verteilt
 * in der Komponente.
 */

/* --- Kartenanbieter ------------------------------------------------------- */

/**
 * Woher die Kacheln kommen.
 *
 * OpenFreeMap liefert Vektorkacheln aus OpenStreetMap-Daten, ohne Schluessel,
 * ohne Kontingent, ohne Nutzerverfolgung. Genau deshalb steht es hier: Ein
 * Anbieter mit Schluessel haette bedeutet, ein Geheimnis in eine Datei zu
 * legen, die im Browser landet — und die Alternative, einen eigenen
 * Kachelserver zu betreiben, ist fuer eine Seite dieser Groesse unangemessen.
 *
 * Die Adresse steht in den fertigen Stildateien (src/data/karte/stil-*.json,
 * erzeugt von scripts/karten-stile.mjs). Wer den Anbieter wechselt, aendert
 * dort die Quelle und laesst das Skript neu laufen — nicht hier.
 *
 * WICHTIG: Das ist die einzige Stelle der ganzen Seite, an der der Browser des
 * Besuchers einen fremden Server anfragt. Sie gehoert deshalb in den
 * Datenschutztext, und dort steht sie auch.
 */
export const ANBIETER = {
  name: "OpenFreeMap",
  url: "https://openfreemap.org",
  daten: "OpenStreetMap-Mitwirkende",
  datenUrl: "https://www.openstreetmap.org/copyright",
} as const;

/* --- Stile ---------------------------------------------------------------- */

export type StilName = "dunkel" | "farbig";

/* Die Stildateien sind gewoehnliches JSON; TypeScript kennt ihre Form nicht.
   Die Zusicherung hier ist die einzige Stelle, an der das behauptet wird. */
export const STILE: Record<StilName, StyleSpecification> = {
  dunkel: stilDunkel as unknown as StyleSpecification,
  farbig: stilFarbig as unknown as StyleSpecification,
};

export const STIL_SPEICHER = "salzburgsucht:karte:stil";

/* --- Ausschnitt ----------------------------------------------------------- */

/**
 * Der Startausschnitt: die Stadt, nicht das Bundesland.
 *
 * Fest gesetzt und nicht "alle Marker einpassen" — sonst bestimmt Elixhausen
 * im Norden den Ausschnitt, die Stadt wird briefmarkengross, und das Erste,
 * was man sieht, ist der ungenutzte Rand.
 */
export const START = { laenge: 13.045, breite: 47.807, zoom: 12.2 };

/**
 * Wie weit man hinaus darf und wie nah heran.
 *
 * Unten Salzburg samt Umland, oben einzelne Hausnummern. Weiter hinaus als
 * 9,8 waere sinnlos — dann liegen alle Marker in einem Klumpen in der Mitte
 * und der Rest des Bildes ist Oberoesterreich.
 */
export const ZOOM = { min: 9.8, max: 18.5 };

/**
 * Der Rahmen, aus dem man nicht herausschieben kann.
 *
 * Ohne ihn landet man mit zwei Wischbewegungen in der Nordsee und findet nicht
 * zurueck. Grosszuegig genug, dass sich die Stadt an jeder Kante frei
 * betrachten laesst.
 */
export const RAHMEN: [[number, number], [number, number]] = [
  [12.72, 47.55],
  [13.42, 48.02],
];

/* --- Die zwei Ebenen ------------------------------------------------------ */

/**
 * Farben der Marker.
 *
 * Zwei und keine dritte. Sobald es Kategorien in fuenf Toenen gibt, ist die
 * Legende laenger als die Aussage.
 *
 * Sie stehen hier als Zeichenketten und nicht als CSS-Variablen, weil
 * MapLibre auf einer WebGL-Flaeche zeichnet und keine Vererbung kennt. Die
 * Werte sind dieselben wie `--color-nacht-versteck` und `--color-primary` im
 * Stylesheet — wer sie aendert, aendert sie an beiden Stellen.
 */
export const EBENEN_FARBEN: Record<PunktArt, { grund: string; hell: string; text: string }> = {
  versteck: { grund: "#ff6a5c", hell: "#ffa79d", text: "#2a0806" },
  partner: { grund: "#80bdff", hell: "#ffffff", text: "#05213c" },
};

/** Wie eng Marker liegen muessen, um zu einer Gruppe zu werden (Bildpunkte). */
export const GRUPPEN_RADIUS = 40;

/** Ab dieser Zoomstufe wird nicht mehr gruppiert. */
export const GRUPPEN_BIS = 15;

/* --- Punkte als GeoJSON --------------------------------------------------- */

export type Sammlung = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: number;
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { id: string; name: string; art: PunktArt; takt: number };
  }>;
};

/**
 * Die Punkte einer Ebene als GeoJSON.
 *
 * `takt` ist der Platz des Punktes in der Eintrittsbewegung, 0 bis 1. Er
 * steckt in den Daten und nicht im Code, weil die Animation eine
 * Kartenausdrucksformel ist: Die Deckkraft jedes Markers ergibt sich aus dem
 * Abstand zwischen dem laufenden Fortschritt und diesem Wert. Ein
 * JavaScript-Zeitgeber je Marker waere bei fuenfzig Punkten fuenfzig
 * Zeitgeber.
 *
 * `id` als Zahl zusaetzlich zur Kennung: MapLibre braucht fuer
 * Zustandsmerkmale (`setFeatureState`) eine numerische Kennung.
 */
export function alsSammlung(punkte: KartenPunkt[]): Sammlung {
  const verortet = punkte.filter((p) => p.breite !== null && p.laenge !== null);
  return {
    type: "FeatureCollection",
    features: verortet.map((p, i) => ({
      type: "Feature",
      id: i,
      geometry: { type: "Point", coordinates: [p.laenge as number, p.breite as number] },
      properties: {
        id: p.id,
        name: p.name,
        art: p.art,
        takt: verortet.length > 1 ? i / (verortet.length - 1) : 0,
      },
    })),
  };
}
