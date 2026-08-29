/**
 * Ortsnamen auf der Karte.
 *
 * Ohne sie ist die Karte ein huebsches Liniengebilde, auf dem niemand etwas
 * wiederfindet: Man erkennt die Salzach und sonst nichts. Mit ihnen wird sie
 * lesbar — und erst dadurch traegt sie den Charakter, der gewuenscht war, naemlich
 * den einer gedruckten Uebersichtskarte und nicht den eines Kartenausschnitts
 * aus einer beliebigen Anwendung.
 *
 * Alle Koordinaten stammen aus OpenStreetMap (Nominatim), keine ist geschaetzt.
 *
 * `ab` ist die Zoomstufe, ab der ein Name erscheint. Das ist der ganze Trick an
 * einer aufgeraeumten Karte: In der Uebersicht stehen nur die Gemeinden und die
 * beiden Berge, und je naeher man herangeht, desto mehr Stadtteile kommen dazu.
 * Alles gleichzeitig anzuzeigen waere in der Uebersicht ein Buchstabenbrei und
 * in der Nahansicht zu wenig.
 */
export type KartenName = {
  text: string;
  breite: number;
  laenge: number;
  /** Ab welcher Zoomstufe sichtbar. 1 = Uebersicht. */
  ab: number;
  /** Gewicht in der Darstellung. */
  rang: "gross" | "klein";
};

export const kartenNamen: KartenName[] = [
  /* --- Gemeinden und Landschaft: schon in der Uebersicht --- */
  { text: "Salzburg", breite: 47.8, laenge: 13.045, ab: 1, rang: "gross" },
  { text: "Hallein", breite: 47.68215, laenge: 13.09563, ab: 1, rang: "gross" },
  { text: "Bergheim", breite: 47.84085, laenge: 13.02216, ab: 1, rang: "gross" },
  { text: "Elixhausen", breite: 47.86749, laenge: 13.06706, ab: 1, rang: "gross" },
  { text: "Grödig", breite: 47.73817, laenge: 13.0395, ab: 1, rang: "gross" },
  { text: "Anif", breite: 47.74973, laenge: 13.06387, ab: 1.2, rang: "gross" },
  { text: "Oberalm", breite: 47.70023, laenge: 13.09889, ab: 1.2, rang: "gross" },
  { text: "Puch", breite: 47.71685, laenge: 13.09045, ab: 1.2, rang: "gross" },
  { text: "Wals-Siezenheim", breite: 47.7986, laenge: 12.9807, ab: 1.2, rang: "gross" },
  { text: "Freilassing", breite: 47.84097, laenge: 12.98239, ab: 1.2, rang: "gross" },
  { text: "Untersberg", breite: 47.69739, laenge: 12.99132, ab: 1, rang: "klein" },
  { text: "Gaisberg", breite: 47.79585, laenge: 13.10339, ab: 1, rang: "klein" },

  /* --- Stadtteile: erst beim Herangehen --- */
  { text: "Altstadt", breite: 47.79976, laenge: 13.04682, ab: 1.7, rang: "gross" },
  { text: "Neustadt", breite: 47.80747, laenge: 13.04393, ab: 2.4, rang: "klein" },
  { text: "Lehen", breite: 47.81348, laenge: 13.02751, ab: 1.7, rang: "klein" },
  { text: "Itzling", breite: 47.8242, laenge: 13.04805, ab: 1.7, rang: "klein" },
  { text: "Maxglan", breite: 47.80419, laenge: 13.01874, ab: 1.7, rang: "klein" },
  { text: "Gnigl", breite: 47.81202, laenge: 13.07372, ab: 1.7, rang: "klein" },
  { text: "Aigen", breite: 47.79163, laenge: 13.08386, ab: 1.7, rang: "klein" },
  { text: "Nonntal", breite: 47.79139, laenge: 13.05035, ab: 1.7, rang: "klein" },
  { text: "Taxham", breite: 47.81137, laenge: 13.00584, ab: 1.7, rang: "klein" },
  { text: "Liefering", breite: 47.82606, laenge: 13.00925, ab: 1.7, rang: "klein" },
  { text: "Schallmoos", breite: 47.81092, laenge: 13.05557, ab: 2.1, rang: "klein" },
  { text: "Elisabeth-Vorstadt", breite: 47.81514, laenge: 13.03953, ab: 2.6, rang: "klein" },
  { text: "Parsch", breite: 47.801, laenge: 13.07764, ab: 2.4, rang: "klein" },
  { text: "Riedenburg", breite: 47.79603, laenge: 13.02953, ab: 2.4, rang: "klein" },
  { text: "Hellbrunn", breite: 47.75943, laenge: 13.07015, ab: 1.7, rang: "klein" },
  { text: "Mönchsberg", breite: 47.79899, laenge: 13.03693, ab: 2.6, rang: "klein" },
  { text: "Kapuzinerberg", breite: 47.80411, laenge: 13.05759, ab: 2.6, rang: "klein" },
];
