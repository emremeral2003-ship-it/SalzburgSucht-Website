import type { Versteck } from "@/types";

/**
 * Die Orte, an denen Salzburgsucht schon etwas versteckt hat.
 *
 * ----------------------------------------------------------------------------
 * WOHER DIE KOORDINATEN KOMMEN
 * ----------------------------------------------------------------------------
 * Nicht aus dem Gedaechtnis. Sie stammen aus OpenStreetMap, abgefragt ueber
 * scripts/karten-orte.mjs. Das Skript legt seinen Vorschlag unter
 * scripts/ausgabe/ ab; von dort wurde jeder Eintrag von Hand geprueft und hier
 * eingetragen. Wer einen Ort ergaenzt, ruft das Skript erneut auf, statt zu
 * schaetzen — eine geratene Koordinate sieht auf einer Karte genauso aus wie
 * eine richtige, und das ist genau das Problem.
 *
 * ----------------------------------------------------------------------------
 * DIE SPALTE `genauigkeit`
 * ----------------------------------------------------------------------------
 * Sie ist der Grund, warum diese Karte nicht luegt. Ein Marker sieht immer
 * aus, als sei er metergenau. Bei "Maxglan" ist er das nicht — dort sitzt er
 * in der Mitte eines Stadtteils. Die Karte sagt das dazu, und `offen` bekommt
 * gar keinen Marker.
 *
 * ----------------------------------------------------------------------------
 * DREI NAMEN, DIE VON DER URSPRUNGSLISTE ABWEICHEN
 * ----------------------------------------------------------------------------
 * Sie sind hier still korrigiert, weil ein Ortsname auf einer Karte den Ort
 * benennen soll und nicht die Geschichte seiner Schreibweise:
 *
 *   #17  "Blindergasse"      -> Bindergasse in Maxglan
 *   #19  "Bergbräuhofstraße" -> Bergerbräuhofstraße in Schallmoos,
 *                               noerdlich hinter Porsche Salzburg
 *   #28  "Schlossbrücke"     -> Staatsbrücke
 *
 * Alle drei ueber Nominatim geprueft; unter den Namen der Ursprungsliste
 * findet sich in Salzburg nichts. Falls doch etwas anderes gemeint war: hier
 * korrigieren, nicht in einem Zusatz danebenschreiben.
 *
 * ----------------------------------------------------------------------------
 * EINEN ORT NACHTRAGEN
 * ----------------------------------------------------------------------------
 *   1. In scripts/karten-orte.mjs unter VERSTECKE eintragen
 *   2. node scripts/karten-orte.mjs
 *   3. Treffer in scripts/ausgabe/orte-vorschlag.json pruefen — steht dort der
 *      Ort, den man gemeint hat?
 *   4. Hier eintragen. Die Nummern laufen fortlaufend und sind das, was auf
 *      dem Marker steht.
 */
export const verstecke: Versteck[] = [
  { id: "lehen", nr: 1, name: "Lehen", zusatz: null, breite: 47.81348, laenge: 13.02751, genauigkeit: "viertel", mehrfach: false, gebiet: "stadt" },
  { id: "mirabellplatz", nr: 2, name: "Mirabellplatz", zusatz: null, breite: 47.80518, laenge: 13.04321, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  // Die Alpenstrasse ist ueber vier Kilometer lang. Der Marker sitzt auf dem
  // Abschnitt bei der Universitaet, weil die Ursprungsliste genau das
  // dazugesagt hat — nicht am Suedende in Hellbrunn, wohin die reine
  // Strassensuche zeigt.
  { id: "alpenstrasse", nr: 3, name: "Alpenstraße", zusatz: "Nähe Universität", breite: 47.785, laenge: 13.069, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
  { id: "cafe-am-kai", nr: 4, name: "Café am Kai", zusatz: "Mülln, am Salzachkai", breite: 47.80513, laenge: 13.03678, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "ueberfuhrsteg", nr: 5, name: "Überfuhrsteg", zusatz: null, breite: 47.78995, laenge: 13.069, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "techno-z", nr: 6, name: "Techno-Z", zusatz: "Studentenheim, Itzling", breite: 47.82321, laenge: 13.04033, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "altstadt", nr: 7, name: "Altstadt", zusatz: null, breite: 47.79976, laenge: 13.04682, genauigkeit: "viertel", mehrfach: true, gebiet: "stadt" },
  { id: "hlt", nr: 8, name: "HLT Salzburg", zusatz: "Tourismusschulen Kleßheim", breite: 47.81848, laenge: 12.99038, genauigkeit: "punkt", mehrfach: false, gebiet: "umland" },
  { id: "kiesel", nr: 9, name: "Kiesel", zusatz: "Elisabeth-Vorstadt", breite: 47.81037, laenge: 13.04214, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "bergheim", nr: 10, name: "Bergheim", zusatz: null, breite: 47.84085, laenge: 13.02216, genauigkeit: "ort", mehrfach: false, gebiet: "umland" },
  { id: "zib", nr: 11, name: "ZIB Salzburg", zusatz: "Zentrum im Berg", breite: 47.80842, laenge: 13.06454, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "viehhausen", nr: 12, name: "Viehhausen", zusatz: "Wals-Siezenheim", breite: 47.78334, laenge: 12.98755, genauigkeit: "ort", mehrfach: false, gebiet: "umland" },
  { id: "puch", nr: 13, name: "Puch", zusatz: "bei Hallein", breite: 47.71685, laenge: 13.09045, genauigkeit: "ort", mehrfach: false, gebiet: "umland" },
  { id: "hallein", nr: 14, name: "Hallein", zusatz: null, breite: 47.68215, laenge: 13.09563, genauigkeit: "ort", mehrfach: false, gebiet: "umland" },
  { id: "oberalm", nr: 15, name: "Oberalm", zusatz: null, breite: 47.70023, laenge: 13.09889, genauigkeit: "ort", mehrfach: false, gebiet: "umland" },
  { id: "linzergasse", nr: 16, name: "Linzergasse", zusatz: null, breite: 47.80318, laenge: 13.04667, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
  { id: "bindergasse", nr: 17, name: "Bindergasse", zusatz: null, breite: 47.80421, laenge: 13.02032, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
  { id: "maxglan", nr: 18, name: "Maxglan", zusatz: null, breite: 47.80419, laenge: 13.01874, genauigkeit: "viertel", mehrfach: true, gebiet: "stadt" },
  { id: "bergbraeuhofstrasse", nr: 19, name: "Bergerbräuhofstraße", zusatz: "Schallmoos", breite: 47.82009, laenge: 13.05459, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
  { id: "hauptbahnhof", nr: 20, name: "Hauptbahnhof", zusatz: "Engelbert-Weiß-Weg", breite: 47.81306, laenge: 13.04585, genauigkeit: "punkt", mehrfach: true, gebiet: "stadt" },
  { id: "arbeiterkammer", nr: 21, name: "Arbeiterkammer", zusatz: "Markus-Sittikus-Straße", breite: 47.80832, laenge: 13.04233, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
  { id: "gnigl", nr: 22, name: "Gnigl", zusatz: null, breite: 47.81202, laenge: 13.07372, genauigkeit: "viertel", mehrfach: false, gebiet: "stadt" },
  { id: "jumpdome", nr: 23, name: "JumpDome", zusatz: "Wals-Siezenheim", breite: 47.7967, laenge: 13.0066, genauigkeit: "punkt", mehrfach: false, gebiet: "umland" },
  { id: "nonntal", nr: 24, name: "Nonntal", zusatz: null, breite: 47.79139, laenge: 13.05035, genauigkeit: "viertel", mehrfach: false, gebiet: "stadt" },
  { id: "lkh", nr: 25, name: "LKH Salzburg", zusatz: "Uniklinikum", breite: 47.80624, laenge: 13.03075, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "taxham", nr: 26, name: "Taxham", zusatz: null, breite: 47.81137, laenge: 13.00584, genauigkeit: "viertel", mehrfach: false, gebiet: "stadt" },
  { id: "messezentrum", nr: 27, name: "Messezentrum", zusatz: "Liefering", breite: 47.82359, laenge: 13.02968, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  // Die Ursprungsliste sagt "Schlossbrücke". Eine Bruecke dieses Namens gibt
  // es in der Salzburger Altstadt nicht — der Treffer ist die Staatsbruecke,
  // die einzige Bruecke, die den beschriebenen Ort trifft.
  { id: "staatsbruecke", nr: 28, name: "Staatsbrücke", zusatz: null, breite: 47.80093, laenge: 13.04461, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "salzburg-ag", nr: 29, name: "Salzburg AG", zusatz: "Bayerhamerstraße", breite: 47.81152, laenge: 13.05124, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "musisches-gym", nr: 30, name: "Musisches Gymnasium", zusatz: "Haunspergstraße", breite: 47.81963, laenge: 13.03741, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "htl", nr: 31, name: "HTL Salzburg", zusatz: "Itzling", breite: 47.82196, laenge: 13.04707, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "stadtbibliothek", nr: 32, name: "Stadtbibliothek", zusatz: "Lehen", breite: 47.81293, laenge: 13.02697, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "europark", nr: 33, name: "Europark", zusatz: null, breite: 47.81561, laenge: 13.00708, genauigkeit: "punkt", mehrfach: false, gebiet: "stadt" },
  { id: "aigen", nr: 34, name: "Aigen", zusatz: null, breite: 47.79163, laenge: 13.08386, genauigkeit: "viertel", mehrfach: false, gebiet: "stadt" },
  { id: "plainstrasse", nr: 35, name: "Plainstraße", zusatz: "Itzling", breite: 47.82073, laenge: 13.03932, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
  { id: "itzling-west", nr: 36, name: "Itzling West", zusatz: null, breite: 47.8242, laenge: 13.04805, genauigkeit: "viertel", mehrfach: false, gebiet: "stadt" },
  { id: "sterneckstrasse", nr: 37, name: "Sterneckstraße", zusatz: "Schallmoos", breite: 47.80862, laenge: 13.05193, genauigkeit: "strasse", mehrfach: false, gebiet: "stadt" },
];

/** Verstecke, die tatsaechlich einen Marker bekommen. */
export const verstecktePunkte = verstecke.filter((v) => v.breite !== null);
