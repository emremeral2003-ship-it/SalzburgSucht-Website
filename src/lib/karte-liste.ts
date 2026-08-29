import type { KartenPunkt, PunktArt } from "@/types";

/**
 * Suchen und Sortieren fuer die Ortsliste neben der Karte.
 *
 * Steht als eigene Datei da und nicht in der Komponente, weil es die einzige
 * Stelle mit echter Logik im ganzen Kartenbereich ist — und die einzige, die
 * sich ohne Browser pruefen laesst (scripts/pruefe-liste.mts tut genau das).
 * In einer Komponente waere sie an React gebunden und damit nur noch von Hand
 * pruefbar.
 */

/** Was der Umschalter oben in der Karte gerade zeigt. */
export type Ansicht = PunktArt | "beide";

/**
 * Alles, worin gesucht wird, als eine kleingeschriebene Zeichenkette.
 *
 * Name, Zusatz (Strasse oder Stadtteil), Branche, die Versteck-Nummer und das
 * Wort "Versteck" beziehungsweise "Partner" selbst. Wer "Gastro" eintippt,
 * soll die Lokale bekommen; wer "Mirabell" eintippt, den Platz; wer "12"
 * eintippt, das zwoelfte Versteck.
 */
function suchtext(punkt: KartenPunkt): string {
  const teile = [
    punkt.name,
    punkt.zusatz ?? "",
    punkt.branche ?? "",
    punkt.art === "versteck" ? "versteck" : "partner",
    punkt.art === "versteck" && punkt.nr !== undefined ? `#${punkt.nr} ${punkt.nr}` : "",
  ];
  return teile.join(" ").toLowerCase();
}

/**
 * Umlaute abtragen.
 *
 * Ohne das findet "Cafe" das "Café" nicht und "Salz & Zucker Backerei" die
 * "Bäckerei" nicht — auf einer Seite, deren Ortsnamen zur Haelfte Umlaute
 * enthalten, ist das kein Randfall.
 */
function schlicht(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/é/g, "e")
    // Alles Uebrige mit Akzent zerlegen und die Akzente wegwerfen.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Die Punkte, die in der Liste stehen sollen.
 *
 * Reihenfolge: erst die mit Standort, dann die ohne — und innerhalb dessen
 * alphabetisch. Die ohne Standort stehen bewusst DRIN und nicht draussen: Sie
 * sind Partner, sie gehoeren gezaehlt, und wer sie sucht, soll sehen, dass es
 * sie gibt und dass nur die Koordinate fehlt. Weglassen waere die bequeme
 * Antwort auf ein Datenproblem.
 */
export function listeBilden(
  punkte: KartenPunkt[],
  ansicht: Ansicht,
  suche: string,
): KartenPunkt[] {
  const begriff = schlicht(suche.trim());
  const arten: PunktArt[] = ansicht === "beide" ? ["versteck", "partner"] : [ansicht];

  return punkte
    .filter((p) => arten.includes(p.art))
    .filter((p) => (begriff === "" ? true : schlicht(suchtext(p)).includes(begriff)))
    .sort((a, b) => {
      const aOrt = a.breite !== null ? 0 : 1;
      const bOrt = b.breite !== null ? 0 : 1;
      if (aOrt !== bOrt) return aOrt - bOrt;
      return a.name.localeCompare(b.name, "de");
    });
}

/**
 * Die Liste in Abschnitte je Art zerlegt.
 *
 * Nur bei "Beide" gibt es zwei Abschnitte; sonst waere die Ueberschrift
 * "PARTNER" ueber einer Liste, die ohnehin nur aus Partnern besteht, reine
 * Zeilenverschwendung.
 */
export function abschnitte(
  liste: KartenPunkt[],
  ansicht: Ansicht,
): Array<{ art: PunktArt | null; titel: string | null; punkte: KartenPunkt[] }> {
  if (ansicht !== "beide") return [{ art: null, titel: null, punkte: liste }];

  const gruppen: Array<{ art: PunktArt; titel: string }> = [
    { art: "versteck", titel: "Verstecke" },
    { art: "partner", titel: "Partner" },
  ];

  return gruppen
    .map((g) => ({ ...g, punkte: liste.filter((p) => p.art === g.art) }))
    .filter((g) => g.punkte.length > 0);
}
