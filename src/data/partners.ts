import type { Partner, PartnerBranche, PartnerStandort } from "@/types";

/**
 * Die Partnerbetriebe. EINE Quelle fuer alles.
 *
 * ----------------------------------------------------------------------------
 * WARUM NAME UND STANDORT IN DEMSELBEN EINTRAG STEHEN
 * ----------------------------------------------------------------------------
 * Sie standen einmal getrennt: die Namen hier, die Koordinaten in einer
 * zweiten Datei. Das Ergebnis war vorhersehbar — die Namensreihe zeigte
 * vierundzwanzig Betriebe, die Karte vierzehn, und niemand konnte auf einen
 * Blick sagen, welche zehn fehlten oder ob jemand beim Nachtragen die zweite
 * Datei vergessen hatte.
 *
 * Jetzt ist `standort: null` eine sichtbare Luecke in derselben Zeile, in der
 * auch der Name steht. Man kann sie nicht uebersehen, und man kann sie nicht
 * an der falschen Stelle schliessen.
 *
 * ----------------------------------------------------------------------------
 * `logo: null` IST ABSICHT
 * ----------------------------------------------------------------------------
 * Fremde Logos werden nicht aus dem Netz geladen — das waere eine
 * Markenrechtsverletzung. Sobald eine Freigabe samt Datei vorliegt, kommt sie
 * nach /public/partner/ und hier der Dateiname hinein.
 *
 * ----------------------------------------------------------------------------
 * DIE BRANCHE IST EINE REDAKTIONELLE EINORDNUNG
 * ----------------------------------------------------------------------------
 * Sie beschreibt, was der Betrieb macht, und behauptet nichts ueber Umfang
 * oder Ergebnis der Zusammenarbeit. Sie steht hier, weil eine reine
 * Namensliste als Beleg nichts zeigt — mit der Einordnung sieht man in zwei
 * Sekunden, dass die Bandbreite von der Baeckerei bis zur Kammer reicht.
 * Falsch zugeordnet? Hier korrigieren, sonst nirgends.
 *
 * ----------------------------------------------------------------------------
 * VIELE BETRIEBE HABEN KEINEN STANDORT — UND DAS BLEIBT SO, BIS JEMAND IHN HAT
 * ----------------------------------------------------------------------------
 * Es waren zehn. Fuenf davon sind inzwischen belegt: nicht ueber
 * OpenStreetMap, das sie unter diesen Namen nicht kennt, sondern ueber die
 * eigene Website des Betriebs beziehungsweise ueber den Eintrag des
 * Tourismusverbands — und danach ueber die Adresse geokodiert, nicht ueber
 * den Namen. Wo der Name in der Partnerliste von dem abweicht, unter dem der
 * Betrieb firmiert, steht das im Kommentar an der Zeile.
 *
 * Die restlichen fuenf sind mit Website, Firmenbuch und Kartendiensten nicht
 * auffindbar. Bei "Chef Döner" gibt es zwar einen Betrieb dieses Namens in
 * Oesterreich, aber in Klagenfurt — das ist nicht derselbe.
 *
 * Eine geratene Koordinate sieht auf einer Karte genauso aus wie eine
 * richtige. Wer davorsteht und niemanden vorfindet, glaubt der Seite danach
 * auch sonst nichts mehr.
 *
 * SO TRAEGT MAN EINEN NACH:
 *   1. Adresse beim Betrieb erfragen (die des Betriebs, nicht die der Zentrale)
 *   2. Koordinate holen — etwa ueber openstreetmap.org, Rechtsklick auf die
 *      Stelle, "Adresse anzeigen"
 *   3. Hier `standort` eintragen und `genauigkeit` ehrlich setzen:
 *      "punkt" nur bei der genauen Adresse, sonst "strasse" oder "viertel"
 *
 * Mehr ist nicht noetig. Karte, Ortsliste, Suche, Zaehler und Legende nehmen
 * den Eintrag von selbst auf — es gibt keine zweite Stelle, an der er
 * nachgetragen werden muesste.
 */

type Eintrag = {
  name: string;
  branche: PartnerBranche;
  standort: PartnerStandort | null;
  /** Nur die eigene Seite des Betriebs, und nur wenn sie geprueft ist. */
  website?: string;
};

/** Kurzform fuer einen belegten Standort. */
function ort(
  breite: number,
  laenge: number,
  genauigkeit: PartnerStandort["genauigkeit"],
  zusatz: string | null = null,
): PartnerStandort {
  return { breite, laenge, genauigkeit, zusatz };
}

const liste: Eintrag[] = [
  /* ==========================================================================
     QUELLE: Salzburgsucht_Kunden_CRM.xlsx, Blatt "Kunden CRM", Stand 28.08.2026
     ==========================================================================
     Uebernommen sind ALLE 37 Zeilen mit Status "Bestandskunde". Dazu kommen
     zwei Betriebe, die nicht in der Liste stehen, aber von Emre bestaetigt
     sind: Naya und Rookies at Work. Interessenten
     und abgelehnte Anfragen stehen bewusst nicht hier — die Partnerreihe ist
     ein Beleg fuer bestehende Zusammenarbeit, keine Verkaufspipeline.

     SCHREIBWEISE: Grundsaetzlich gilt der Name aus der Excel. Angepasst wurde
     die Gross-/Kleinschreibung (aus "chef Döner bergheim" wird "Chef Döner
     Bergheim") sowie vier eindeutig abgeschnittene oder vertippte Namen.
     Sieben strittige Namen hat Emre am 28.08.2026 selbst festgelegt:
     Naya · Fifty 4 Burgers · Eisl Eis by Cafemozart · Productio ·
     Ninjas Jetzt · BranIT · icmedia. Diese Schreibweisen sind gesetzt.

     STANDORTE: Aus der bisherigen Liste uebernommen, wo der Betrieb derselbe
     ist. Neu dazugekommene Betriebe haben `standort: null`, bis eine Adresse
     vorliegt. Es wird weiterhin keine Koordinate geraten.
     ========================================================================== */

  // ---------------------------------------------------------- mit Standort
  {
    name: "AK Salzburg",
    branche: "Institution",
    standort: ort(47.80832, 13.04233, "strasse", "Markus-Sittikus-Straße"),
  },
  { name: "WIFI Salzburg", branche: "Institution", standort: ort(47.80907, 13.04503, "punkt", "Julius-Raab-Platz") },
  {
    name: "Raiffeisen Salzburg",
    branche: "Institution",
    // Sechs Bankstellen im Suchraum. Der Marker sitzt auf der Zentrale des
    // Raiffeisenverbands in der Schwarzstraße 13 und sagt das auch.
    standort: ort(47.80293, 13.0422, "punkt", "Zentrale Schwarzstraße"),
    website: "https://www.raiffeisen.at/sbg/de/",
  },
  // Der Partner ist die Altstadt als Ganzes, nicht ein Haus darin.
  { name: "Altstadt Salzburg", branche: "Institution", standort: ort(47.79976, 13.04682, "viertel") },
  { name: "Porsche Holding Careers", branche: "Mobility", standort: ort(47.81617, 13.05278, "punkt", "Vogelweiderstraße") },
  { name: "Ninjas Jetzt", branche: "Freizeit", standort: ort(47.81282, 13.05614, "punkt", "Röcklbrunnstraße") },
  { name: "Jumpdome Salzburg", branche: "Freizeit", standort: ort(47.7967, 13.0066, "punkt", "Wals-Siezenheim") },
  { name: "Fifty 4 Burgers", branche: "Gastro", standort: ort(47.80392, 13.04774, "punkt", "Linzer Gasse") },
  // Excel: "Salz und Zucker Bäckere" — offensichtlich abgeschnitten, ergaenzt.
  {
    name: "Salz und Zucker Bäckerei",
    branche: "Gastro",
    standort: ort(47.81155, 13.04193, "punkt", "Elisabethstraße"),
  },
  { name: "Cafe Mozart Salzburg", branche: "Gastro", standort: ort(47.80008, 13.04263, "punkt", "Getreidegasse") },
  { name: "KOI Salzburg", branche: "Gastro", standort: ort(47.81194, 13.04427, "punkt", "Rainerstraße") },
  {
    name: "Yazzoon",
    branche: "Gastro",
    standort: ort(47.80249, 13.03808, "punkt", "Ursulinenplatz"),
    website: "https://www.yazzoon.com/",
  },
  // Excel: "Mian and more Salzburg". Firmiert als "Mian&More Ramen Bar",
  // Getreidegasse 36B.
  {
    name: "Mian and More Salzburg",
    branche: "Gastro",
    standort: ort(47.80051, 13.04164, "punkt", "Getreidegasse"),
    website: "https://www.mian-more.at/",
  },
  // Excel: "Elixhausert Wirt" — der Betrieb heisst "Elixhausner Wirt".
  { name: "Elixhausner Wirt", branche: "Gastro", standort: ort(47.86749, 13.06706, "ort", "Elixhausen") },
  { name: "Sahil Barbershop", branche: "Lifestyle", standort: ort(47.80517, 13.02269, "punkt", "Maxglan") },
  { name: "Voglbike", branche: "Mobility", standort: ort(47.81842, 13.04436, "punkt", "Elisabethstraße") },
  {
    name: "Wagendoktor",
    branche: "Mobility",
    standort: ort(47.69977, 13.10836, "punkt", "Oberalm, Wiestalstraße"),
    website: "https://wagendoktor.at/",
  },
  // ZU PRUEFEN: Stand bisher als "Maikai" mit dieser Adresse in der Gastro.
  // Die Excel fuehrt "Mai kai fitness" unter Fitness. Falls das zwei
  // verschiedene Betriebe sind, gehoert der Standort hier weg.
  { name: "Mai Kai Fitness", branche: "Fitness", standort: ort(47.83454, 13.02803, "punkt", "Oberndorfer Straße") },
  // Nachgetragen am 29.08.2026 auf Emres Hinweis. Steht nicht in der
  // CRM-Liste. Die Koordinate ist die geokodierte Hausnummer aus der
  // eigenen Website (Wilhelmsederstraße 13, Schallmoos) — nicht geraten.
  {
    name: "Rookies at Work",
    branche: "Medien",
    standort: ort(47.81021, 13.05674, "punkt", "Wilhelmsederstraße"),
    website: "https://www.rookiesatwork.at/",
  },
  // Nicht in der CRM-Liste, aber von Emre am 28.08.2026 als Partner
  // bestaetigt.
  // ZU PRUEFEN bleibt der Standort: Der Marker sitzt auf der NAYA kitchen &
  // bar in der Hofstallgasse, das Kundenprofil nennt die Rainerstraße 24
  // (@na_ya.at).
  {
    name: "Naya",
    branche: "Gastro",
    standort: ort(47.79868, 13.04195, "punkt", "Hofstallgasse"),
    website: "https://www.naya-kitchen.at/",
  },

  // -------------------------------------------------- noch ohne Standort
  { name: "Fit Smart Food", branche: "Gastro", standort: null },
  { name: "Mozart Car Clean", branche: "Mobility", standort: null },
  { name: "Rechenwirt", branche: "Gastro", standort: null },
  { name: "Smashez", branche: "Gastro", standort: null },
  { name: "Alpzgelato", branche: "Gastro", standort: null },
  { name: "Mr Wen Salzburg", branche: "Gastro", standort: null },
  { name: "Das Urstein", branche: "Gastro", standort: null },
  // Excel: "Eis eis", von Emre am 28.08.2026 aufgeloest: "Eisl Eis by
  // Cafemozart". Eigener Eintrag neben "Cafe Mozart Salzburg" — dasselbe
  // Haus, aber ein eigener Betrieb.
  { name: "Eisl Eis by Cafemozart", branche: "Gastro", standort: null },
  { name: "Chef Döner Bergheim", branche: "Gastro", standort: null },
  { name: "Animix", branche: "Freizeit", standort: null },
  { name: "Jumparena Salzburg", branche: "Freizeit", standort: null },
  { name: "Feiernabend", branche: "Freizeit", standort: null },
  { name: "LRS Rentals", branche: "Mobility", standort: null },
  { name: "Altstadt Schaufenster", branche: "Handel", standort: null },
  // "Productio" ist richtig — von Emre am 28.08.2026 bestaetigt.
  { name: "Productio", branche: "Handel", standort: null },
  { name: "Level UP", branche: "Medien", standort: null },
  { name: "icmedia", branche: "Medien", standort: null, website: "https://ic-media.at/" },
  { name: "BranIT", branche: "IT", standort: null, website: "https://branit.at/" },
  // Excel: "Messenzentrum" — gemeint ist das Messezentrum Salzburg.
  { name: "Messezentrum Salzburg", branche: "Events", standort: null },
];

/** Kennung aus dem Namen. Stabil, solange der Name gleich bleibt. */
export function partnerKennung(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const partners: Partner[] = liste.map((eintrag) => ({
  id: partnerKennung(eintrag.name),
  name: eintrag.name,
  branche: eintrag.branche,
  standort: eintrag.standort,
  logo: null,
  website: eintrag.website ?? null,
  instagram: null,
}));

/** Anzahl der genannten Betriebe. Gezaehlt, nicht behauptet. */
export const partnerAnzahl = partners.length;

/** Die Betriebe, die einen Marker bekommen — gezaehlt, nie fest eingetragen. */
export const partnerMitStandort = partners.filter((p) => p.standort !== null);

/** Vorkommende Branchen in der Reihenfolge ihrer Haeufigkeit. */
export const partnerBranchen: PartnerBranche[] = [
  ...new Set(partners.map((p) => p.branche)),
].sort(
  (a, b) =>
    partners.filter((p) => p.branche === b).length -
    partners.filter((p) => p.branche === a).length,
);
