import geometrie from "@/data/karte/salzburg-geometrie.json";
import type { KartenOrt, KartenPunkt } from "@/types";

/**
 * Die Rechenseite der beiden Salzburg-Karten.
 *
 * Beide Karten — Verstecke und Partner — benutzen dieselbe Grundlage, dieselbe
 * Projektion und dieselbe Zoomlogik. Der Unterschied zwischen ihnen ist
 * ausschliesslich Inhalt und Farbe. Waeren es zwei Implementierungen, waere
 * spaetestens beim dritten Feineinstellen eine davon anders, und niemand
 * wuesste warum.
 */

export type Rahmen = { sued: number; west: number; nord: number; ost: number };

/** Ein Ausschnitt in Kartenkoordinaten: linke obere Ecke plus Breite. */
export type Ausschnitt = { x: number; y: number; w: number };

export const KARTE = {
  breite: geometrie.breite,
  hoehe: geometrie.hoehe,
  rahmen: geometrie.rahmen as Rahmen,
  ebenen: geometrie.ebenen as Record<string, string>,
};

/* --- Projektion ---------------------------------------------------------- */

const linksOben = welt(KARTE.rahmen.nord, KARTE.rahmen.west);
const rechtsUnten = welt(KARTE.rahmen.sued, KARTE.rahmen.ost);
const spanneX = rechtsUnten.x - linksOben.x;
const spanneY = rechtsUnten.y - linksOben.y;

/**
 * Web-Mercator, normiert auf 0..1.
 *
 * Dieselbe Formel steht in scripts/karten-geometrie.mjs, das die Pfade erzeugt
 * hat. Sie muss dort und hier identisch sein, sonst liegen die Marker neben
 * den Strassen — das ist die einzige Stelle, an der diese beiden Dateien
 * voneinander abhaengen.
 */
function welt(breite: number, laenge: number) {
  const b = (breite * Math.PI) / 180;
  return {
    x: (laenge + 180) / 360,
    y: (1 - Math.log(Math.tan(b) + 1 / Math.cos(b)) / Math.PI) / 2,
  };
}

/** WGS84 in das lokale Koordinatensystem der Karte. */
export function projizieren(breite: number, laenge: number) {
  const p = welt(breite, laenge);
  return {
    x: ((p.x - linksOben.x) / spanneX) * KARTE.breite,
    y: ((p.y - linksOben.y) / spanneY) * KARTE.hoehe,
  };
}

/* --- Ausschnitte --------------------------------------------------------- */

export function klemmen(wert: number, min: number, max: number) {
  return Math.min(max, Math.max(min, wert));
}

/**
 * Kleinster Ausschnitt, der alle uebergebenen Orte enthaelt.
 *
 * `luft` ist der Rand als Anteil der Ausdehnung — ohne ihn kleben die
 * aeussersten Marker am Bildrand und werden halb abgeschnitten, weil ein
 * Marker breiter ist als der Punkt, auf dem er sitzt.
 */
export function ausschnittUm(orte: KartenOrt[], luft = 0.16): Ausschnitt {
  const punkte = orte
    .filter((o) => o.breite !== null && o.laenge !== null)
    .map((o) => projizieren(o.breite as number, o.laenge as number));

  if (punkte.length === 0) return { x: 0, y: 0, w: KARTE.breite };

  const minX = Math.min(...punkte.map((p) => p.x));
  const maxX = Math.max(...punkte.map((p) => p.x));
  const minY = Math.min(...punkte.map((p) => p.y));
  const maxY = Math.max(...punkte.map((p) => p.y));

  // Auch die Hoehe muss in die Breite eingerechnet werden: Der sichtbare
  // Ausschnitt richtet sich nach dem Seitenverhaeltnis des Behaelters, und ein
  // hoher schmaler Punktehaufen braucht deshalb mehr Breite, als er selbst hat.
  const breite = Math.max(maxX - minX, (maxY - minY) * 0.7, 60);
  return {
    x: (minX + maxX) / 2 - (breite * (1 + luft)) / 2,
    y: (minY + maxY) / 2,
    w: breite * (1 + luft),
  };
}

/**
 * Die Startansicht: der Stadtkern.
 *
 * Fest verdrahtete Koordinaten und nicht "alle Marker einpassen" — sonst
 * bestimmt Hallein im Sueden den Ausschnitt, die Stadt wird briefmarkengross,
 * und das Erste, was man sieht, ist der ungenutzte Rand. Wer aufs Land will,
 * zoomt hinaus; der Knopf dafuer steht an der Karte.
 */
export const STADT: Ausschnitt = (() => {
  const a = projizieren(47.8275, 12.9885);
  const b = projizieren(47.7815, 13.0985);
  return { x: a.x, y: (a.y + b.y) / 2, w: b.x - a.x };
})();

/** Die Uebersicht ueber den gesamten Ausschnitt inklusive Umland. */
export const REGION: Ausschnitt = {
  x: 0,
  y: KARTE.hoehe / 2,
  w: KARTE.breite,
};

/** Wie weit man hinein- und hinauszoomen darf, als Ausschnittsbreite. */
export const ZOOM_GRENZEN = { engste: 55, weiteste: KARTE.breite };

/**
 * Zoomstufe eines Ausschnitts, bezogen auf die Uebersicht.
 *
 * 1 ist die Uebersicht, 10 waere ein Zehntel davon. Die Beschriftung haengt an
 * dieser Zahl, deshalb steht sie hier und nicht in der Komponente.
 */
export function zoomStufe(a: Ausschnitt) {
  return KARTE.breite / a.w;
}

/**
 * Sorgt dafuer, dass der Ausschnitt im Kartenfeld bleibt.
 *
 * Ohne das kann man die Karte aus dem Bild schieben und sieht nur noch weisse
 * Flaeche — der haeufigste Weg, eine sonst gute Karte unbrauchbar zu machen.
 * Ist der Ausschnitt breiter als die Karte, wird stattdessen zentriert.
 */
export function einpassen(a: Ausschnitt, seitenVerhaeltnis: number): Ausschnitt {
  const w = klemmen(a.w, ZOOM_GRENZEN.engste, ZOOM_GRENZEN.weiteste);
  const h = w / seitenVerhaeltnis;

  const x =
    w >= KARTE.breite
      ? (KARTE.breite - w) / 2
      : klemmen(a.x, 0, KARTE.breite - w);
  const y =
    h >= KARTE.hoehe
      ? KARTE.hoehe / 2
      : klemmen(a.y, h / 2, KARTE.hoehe - h / 2);

  return { x, y, w };
}

/** Lineare Mischung zweier Ausschnitte. Traegt die Flugbewegung zum Marker. */
export function mischen(von: Ausschnitt, nach: Ausschnitt, t: number): Ausschnitt {
  return {
    x: von.x + (nach.x - von.x) * t,
    y: von.y + (nach.y - von.y) * t,
    w: von.w + (nach.w - von.w) * t,
  };
}

/** Weiche Beschleunigung fuer den Flug. Entspricht --ease-sanft. */
export function sanft(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ausschnitt, der auf einen einzelnen Ort zentriert ist.
 *
 * Die Zielbreite haengt an der Genauigkeit: Auf ein Gebaeude darf man weit
 * heranfahren, auf einen Stadtteil nicht. Ein Marker mit Stadtteilgenauigkeit,
 * auf Hausnummerngroesse herangezoomt, behauptet eine Praezision, die die
 * Daten nicht haben — die Zoomstufe ist hier also eine Aussage und keine
 * Geschmacksfrage.
 */
export function ausschnittFuer(ort: KartenOrt): Ausschnitt | null {
  if (ort.breite === null || ort.laenge === null) return null;
  const p = projizieren(ort.breite, ort.laenge);
  const breite =
    ort.genauigkeit === "punkt"
      ? 90
      : ort.genauigkeit === "strasse"
        ? 130
        : 210;
  return { x: p.x - breite / 2, y: p.y, w: breite };
}

/* --- Marker zusammenfassen ----------------------------------------------- */

/**
 * Ein Ort, wie ihn die Karte braucht.
 *
 * Absichtlich weiter gefasst als jeder der drei Datentypen: Verstecke bringen
 * `nr` und `mehrfach` mit, Partner nicht, und auf der gemeinsamen Karte kommt
 * `art` dazu. Ein Typ, der alles optional kennt, ist hier richtiger als drei
 * Sonderfaelle im Rendern.
 */
export type MarkerOrt = KartenOrt & Partial<Pick<KartenPunkt, "art" | "nr" | "mehrfach">>;

/** Ein Marker auf der Karte: entweder ein Ort oder eine Gruppe von Orten. */
export type Haufen = {
  /** Stabil ueber Zoomstufen hinweg — sonst baut React bei jedem Zoom alles neu. */
  id: string;
  x: number;
  y: number;
  mitglieder: MarkerOrt[];
};

/**
 * Wie nah zwei Marker in der Uebersicht liegen duerfen, bevor sie zu einer
 * Gruppe werden — in Kartenkoordinaten bei Zoomstufe 1.
 *
 * 30 von 1000 sind auf einem gewoehnlichen Kartenfeld gut zwanzig
 * Bildschirmpunkte. Kleiner gewaehlt bleiben Klumpen stehen, groesser
 * verschwinden Orte in Gruppen, die man laengst einzeln sehen koennte.
 */
const GRUPPEN_ABSTAND = 30;

/**
 * Punkte zusammenfassen, die auf der aktuellen Zoomstufe uebereinanderliegen.
 *
 * Steht hier und nicht in der Kartenkomponente, obwohl nur sie es benutzt: Es
 * ist reine Rechnung ohne DOM, und damit laesst es sich einzeln pruefen —
 * siehe scripts/pruefe-gruppen.mts. Im Browser waere dieselbe Pruefung
 * muehsam, weil zwischen Klick und Ergebnis ein Flug liegt.
 *
 * Gruppiert wird nur INNERHALB einer Art. Eine Gruppe aus zwei Verstecken und
 * einem Partnerbetrieb muesste sich fuer eine Farbe entscheiden und waere in
 * jedem Fall gelogen — nebeneinanderliegende Gruppen in zwei Farben sagen die
 * Wahrheit und sehen ausserdem besser aus.
 *
 * Das Verfahren ist gierig und damit von der Reihenfolge abhaengig. Deshalb
 * kommt die Liste sortiert herein: Bei gleicher Zoomstufe entstehen so immer
 * dieselben Gruppen, und die Karte flackert beim Zoomen nicht.
 */
export function haufenBilden(orte: MarkerOrt[], stufe: number): Haufen[] {
  const abstand = GRUPPEN_ABSTAND / stufe;
  const offen = orte.map((ort) => ({
    ort,
    p: projizieren(ort.breite as number, ort.laenge as number),
    vergeben: false,
  }));

  const haufen: Haufen[] = [];
  for (const kern of offen) {
    if (kern.vergeben) continue;
    kern.vergeben = true;
    const mitglieder = [kern];

    for (const anderer of offen) {
      if (anderer.vergeben) continue;
      if (anderer.ort.art !== kern.ort.art) continue;
      if (Math.hypot(anderer.p.x - kern.p.x, anderer.p.y - kern.p.y) > abstand) continue;
      anderer.vergeben = true;
      mitglieder.push(anderer);
    }

    haufen.push({
      // Der Kern gibt der Gruppe ihren Namen. Damit bleibt die id gleich,
      // solange die Gruppe im Kern dieselbe ist.
      id: kern.ort.id,
      x: mitglieder.reduce((s, m) => s + m.p.x, 0) / mitglieder.length,
      y: mitglieder.reduce((s, m) => s + m.p.y, 0) / mitglieder.length,
      mitglieder: mitglieder.map((m) => m.ort),
    });
  }
  return haufen;
}
