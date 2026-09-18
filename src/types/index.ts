/** Gemeinsame Datentypen der Website. */

export type ApplicationType = "url" | "email";

/**
 * "Voll- oder Teilzeit" ist bewusst ein eigener Wert und nicht zwei Inserate:
 * Betriebe schreiben eine Stelle oft so aus, und wer sie auf "Vollzeit"
 * verkuerzt, verliert genau die Bewerber, die Teilzeit suchen. Der Filter in
 * src/app/jobs/page.tsx zeigt solche Stellen deshalb unter BEIDEN Reitern.
 */
export type EmploymentType =
  | "Vollzeit"
  | "Teilzeit"
  | "Voll- oder Teilzeit"
  | "Geringfügig"
  | "Praktikum";

export type Job = {
  id: string;
  slug: string;
  company: string;
  title: string;
  location: string;
  employmentType: EmploymentType;
  shortDescription: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  /** Pfad zu einer Logodatei. `null`, solange keine Freigabe vorliegt. */
  logo: string | null;
  applicationType: ApplicationType;
  applicationUrl: string | null;
  applicationEmail: string | null;
  publishedAt: string;
  active: boolean;
  featured: boolean;
  /** Kennzeichnet Seed-Daten. Wird auf der Karte sichtbar ausgewiesen. */
  demo: boolean;
};

/**
 * Grobe Branche eines Partnerbetriebs.
 *
 * Rein redaktionelle Einordnung fuer die Darstellung — sie sagt, was der
 * Betrieb macht, und behauptet nichts ueber die Zusammenarbeit. Ohne sie ist
 * die Partnerreihe eine Namensliste; mit ihr sieht man auf einen Blick, dass
 * die Bandbreite von der Baeckerei bis zur Institution reicht.
 */
export type PartnerBranche =
  | "Gastro"
  | "Institution"
  | "Mobility"
  | "Lifestyle"
  | "Freizeit"
  | "Handel"
  | "Fitness"
  | "Medien"
  | "IT"
  | "Events";

/**
 * Wo ein Partnerbetrieb sitzt.
 *
 * `null` am Partner statt eines Standorts mit lauter Nullwerten: Ein Betrieb
 * hat einen Standort oder er hat keinen, und diese Unterscheidung soll man
 * nicht aus vier Feldern zusammensetzen müssen.
 */
export type PartnerStandort = {
  breite: number;
  laenge: number;
  genauigkeit: Exclude<OrtGenauigkeit, "offen">;
  /** Straße oder Ortsteil, wenn er die Angabe schärft. */
  zusatz: string | null;
};

export type Partner = {
  id: string;
  name: string;
  branche: PartnerBranche;
  /** `null`, solange kein belegter Standort vorliegt. Nie geraten. */
  standort: PartnerStandort | null;
  /** Freigegebene Logodatei unter /public/partner/. Bis dahin `null`. */
  logo: string | null;
  website: string | null;
  instagram: string | null;
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  /**
   * Kernleistung statt Anlassfall. Steuert nur die Darstellung: Kernleistungen
   * stehen zuerst, Anlassfaelle danach.
   */
  featured: boolean;
  /** Format der Beitragsattrappe in der Leistungsschau. */
  vorschau: "post" | "reel" | "story";
  /** Verlauf der Vorschauflaeche — ersetzt ein Cover, solange keines vorliegt. */
  farbe: string;
  /** Formate, die typischerweise dazugehoeren. Aussage ueber Produktion, nicht ueber Ergebnis. */
  formate: string[];
  /**
   * Echter Beitrag als stummer Videoschnipsel, ohne Endung:
   * "/videos/leistungen/gastronomie" laedt .mp4 und .jpg als Standbild.
   *
   * `null` heisst: fuer diese Leistung liegt noch kein freigegebenes Beispiel
   * vor — dann bleibt die Farbflaeche mit dem Hinweis "Attrappe" stehen. Ein
   * fremdes Video ersatzweise einzusetzen waere schlimmer als eine leere
   * Flaeche.
   */
  video: string | null;
  /**
   * Echter Beitrag als Standbild (voller Pfad mit Endung), wenn kein Video
   * vorliegt — etwa bei einem Feed-Post, den es nie als Video gab.
   *
   * Liegt beides vor, gewinnt `video`. `null` heisst wie dort: noch kein
   * freigegebenes Beispiel, also bleibt die Attrappe stehen.
   */
  bild: string | null;
};

/* ---------------------------------------------------------------------------
   Karten
--------------------------------------------------------------------------- */

/**
 * Wie genau ein Marker den Ort trifft.
 *
 * Diese Angabe steht auf der Karte und ist keine Nebensache. Eine Karte
 * behauptet durch ihre blosse Form Genauigkeit: Ein Punkt sieht immer aus, als
 * waere er auf zehn Meter bestimmt. Bei einem Stadtteil ist er das nicht, und
 * das gehoert dazugesagt — sonst steht auf der Seite eine Praezision, die die
 * Daten nicht hergeben.
 *
 *   punkt    Ein bestimmtes Gebaeude, ein Platz, ein Betrieb. Aus OSM belegt.
 *   strasse  Die richtige Strasse, aber nicht die Hausnummer.
 *   viertel  Ein Stadtteil. Der Marker sitzt in dessen Mitte.
 *   ort      Eine Gemeinde im Umland. Der Marker sitzt in deren Mitte.
 *   offen    Nicht belegt. Bekommt bewusst KEINEN Marker, sondern steht nur
 *            in der Liste. Lieber eine Luecke als ein erfundener Punkt.
 */
export type OrtGenauigkeit = "punkt" | "strasse" | "viertel" | "ort" | "offen";

export type KartenOrt = {
  id: string;
  name: string;
  /** Praezisierung unter dem Namen. `null`, wenn der Name reicht. */
  zusatz: string | null;
  /** WGS84. `null` genau dann, wenn `genauigkeit === "offen"`. */
  breite: number | null;
  laenge: number | null;
  genauigkeit: OrtGenauigkeit;
};

/** Ein Ort, an dem schon einmal etwas versteckt wurde. */
export type Versteck = KartenOrt & {
  /** Nummer auf der Karte. Entspricht der Reihenfolge in der Liste. */
  nr: number;
  /** Dort wurde mehr als einmal etwas versteckt. */
  mehrfach: boolean;
  /**
   * Wann die Aktion lief, als ISO-Datum (2025-04-17).
   *
   * Steht bei keinem Eintrag, weil es niemand festgehalten hat — das Feld ist
   * vorbereitet und bleibt leer, bis jemand die Storys durchgeht. Ein
   * geschaetztes Datum unter einem Marker waere eine Behauptung ueber einen
   * Tag, an dem vielleicht nichts war.
   */
  datum?: string;
  /** Link auf den Beitrag zur Aktion. Ebenfalls noch nirgends erfasst. */
  beitrag?: string;
  /**
   * Stadtgemeinde Salzburg oder Umland.
   *
   * Steht als eigenes Feld da und wird nicht aus der Koordinate berechnet: Ein
   * Punkt-in-Polygon-Test gegen die Stadtgrenze waere machbar, aber bei
   * Kleßheim oder Wals-Siezenheim genau dann falsch, wenn es darauf ankommt —
   * und bei einem Eintrag ohne Koordinate gar nicht erst moeglich.
   */
  gebiet: "stadt" | "umland";
};

/** Ein Betrieb, mit dem bereits zusammengearbeitet wurde. */
export type PartnerOrt = KartenOrt & {
  branche: PartnerBranche;
  /** Freigegebene Website des Betriebs. Derzeit ueberall `null`. */
  website?: string | null;
};

/**
 * Welche Art von Punkt auf der gemeinsamen Karte steht.
 *
 * Die beiden Ebenen liegen auf derselben Karte und muessen ohne Legende
 * unterscheidbar sein — deshalb ist die Art ein eigenes Feld und keine Folge
 * daraus, aus welcher Datei ein Punkt kam. Die Farbe haengt daran, das
 * Aussehen des Markers, was im Detailfenster steht und was der Umschalter
 * ein- und ausblendet.
 */
export type PunktArt = "versteck" | "partner";

/**
 * Ein Punkt auf der gemeinsamen Salzburg-Karte.
 *
 * Zusammengefuehrt aus Verstecken und Partnerbetrieben (siehe
 * src/data/karte/karten-punkte.ts). Die Felder, die nur eine der beiden Arten
 * hat, stehen optional darin — statt zweier Typen, die die Karte dann an
 * jeder Stelle auseinanderhalten muesste.
 */
export type KartenPunkt = KartenOrt & {
  art: PunktArt;
  /** Nur Verstecke: die Nummer aus der Liste. */
  nr?: number;
  /** Nur Verstecke: dort lag mehrmals etwas. */
  mehrfach?: boolean;
  /** Nur Verstecke, sobald erfasst. */
  datum?: string;
  beitrag?: string;
  /** Nur Partner: die Branche. */
  branche?: PartnerBranche;
  website?: string | null;
};
