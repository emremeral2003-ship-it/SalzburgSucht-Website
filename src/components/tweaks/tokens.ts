/**
 * Alle Stellschrauben der Website an einer Stelle.
 *
 * ----------------------------------------------------------------------------
 * DER GRUNDSATZ DIESER DATEI
 * ----------------------------------------------------------------------------
 * Jeder Eintrag hier MUSS auf eine CSS-Variable zeigen, die im Stylesheet
 * tatsaechlich verwendet wird. Ein Regler, der nichts bewegt, ist schlimmer
 * als kein Regler: Man dreht daran, sieht nichts, und weiss danach nicht mehr,
 * ob das Werkzeug kaputt ist oder der eigene Blick.
 *
 * Wer hier etwas ergaenzt, ergaenzt zuerst die Variable in globals.css und
 * benutzt sie dort — und erst dann diese Liste.
 *
 * ----------------------------------------------------------------------------
 * ZWEI BAUARTEN
 * ----------------------------------------------------------------------------
 *   Werte    ersetzen eine Groesse direkt (--licht-kern: 9rem).
 *   Faktoren multiplizieren eine bestehende Zahl (--tempo: 1). Sie stehen auf
 *            1 und aendern ein ganzes System auf einmal. Ein Faktor ist immer
 *            dann richtig, wenn zwanzig Einzelwerte zusammengehoeren und
 *            getrennt verstellt nur auseinanderfallen wuerden — die vier
 *            Schatten der Seite sind das beste Beispiel.
 *
 * ----------------------------------------------------------------------------
 * WARUM NUR ABWEICHUNGEN GESCHRIEBEN WERDEN
 * ----------------------------------------------------------------------------
 * Das Panel schreibt einen Wert nur dann auf `:root`, wenn er vom Standard
 * abweicht. Zwei Gruende, beide teuer gelernt:
 *
 *   1. Weicht ein Standard hier vom @theme-Block ab, saehe die Seite in der
 *      Entwicklung anders aus als in Produktion — und niemand merkte es, weil
 *      die Abweichung ja "vom Panel" kaeme.
 *   2. Ein Inline-Stil schlaegt jede Regel im Stylesheet. Damit waere jede
 *      Medienabfrage auf ein Token wirkungslos, solange das Panel laeuft,
 *      etwa die groessere Inhaltsbreite ab 1536 px.
 */

export type GruppenId =
  | "farben"
  | "typografie"
  | "raum"
  | "tiefe"
  | "bewegung"
  | "licht"
  | "signal"
  | "nachtkarte"
  | "karten"
  | "bauteile";

export const gruppen: Array<{ id: GruppenId; label: string; text: string }> = [
  { id: "licht", label: "Hero-Licht", text: "Das Licht, das der Maus folgt — und was darunter sichtbar wird." },
  { id: "signal", label: "Hintergrund & Signal", text: "Raster, Netz, Spuren, Wellen, Beacon." },
  { id: "farben", label: "Farben", text: "Die Palette der ganzen Seite." },
  { id: "typografie", label: "Typografie", text: "Groessen, Gewicht, Zeilen, Laufweite." },
  { id: "raum", label: "Abstände & Layout", text: "Breite, Luft, Radien." },
  { id: "tiefe", label: "Tiefe & Schatten", text: "Wie stark die Seite über sich selbst hinausragt." },
  { id: "bewegung", label: "Animation", text: "Dauern, Tempo, Beschleunigung." },
  { id: "nachtkarte", label: "Salzburg-Karte", text: "Höhe und Markerfarben. Die Kartenfarben selbst stehen in den Stildateien." },
  { id: "karten", label: "Karten (hell)", text: "Die helle Detailkarte: Grundkarte, Marker, Beschriftung." },
  { id: "bauteile", label: "Bauteile", text: "Knöpfe, Eingabefelder, Pillen." },
];

export type Token =
  | {
      art: "farbe";
      key: string;
      css: string;
      label: string;
      hinweis?: string;
      gruppe: GruppenId;
      standard: string;
    }
  | {
      art: "zahl";
      key: string;
      css: string;
      label: string;
      hinweis?: string;
      gruppe: GruppenId;
      standard: number;
      min: number;
      max: number;
      schritt: number;
      einheit: string;
      /**
       * Wird auf `html` als echte Eigenschaft gesetzt statt als Variable.
       * Betrifft nur die Grundschriftgroesse.
       */
      amDokument?: boolean;
    }
  | {
      art: "auswahl";
      key: string;
      css: string;
      label: string;
      hinweis?: string;
      gruppe: GruppenId;
      standard: string;
      optionen: Array<{ wert: string; label: string }>;
    };

const farbe = (
  key: string,
  css: string,
  label: string,
  standard: string,
  gruppe: GruppenId = "farben",
  hinweis?: string,
): Token => ({ art: "farbe", key, css, label, standard, gruppe, hinweis });

const zahl = (
  key: string,
  css: string,
  label: string,
  standard: number,
  min: number,
  max: number,
  schritt: number,
  einheit: string,
  gruppe: GruppenId,
  hinweis?: string,
): Token => ({ art: "zahl", key, css, label, standard, min, max, schritt, einheit, gruppe, hinweis });

export const tokens: Token[] = [
  /* ===================================================================== */
  /* Hero-Licht                                                            */
  /* ===================================================================== */
  zahl("lichtKern", "--licht-kern", "Kern — Größe", 9, 2, 26, 0.5, "rem", "licht",
    "Der helle Punkt in der Mitte. Er entscheidet, ob man das Licht überhaupt bemerkt."),
  zahl("lichtKernKraft", "--licht-kern-kraft", "Kern — Stärke", 0.5, 0, 1, 0.01, "", "licht"),
  farbe("lichtFarbeKern", "--licht-farbe-kern", "Kern — Farbe", "#80bdff", "licht"),
  zahl("lichtMitte", "--licht-mitte", "Mitte — Größe", 24, 6, 60, 1, "rem", "licht",
    "Trägt die Markenfarbe. Die mittlere der drei Schichten."),
  zahl("lichtMitteKraft", "--licht-mitte-kraft", "Mitte — Stärke", 0.24, 0, 1, 0.01, "", "licht"),
  farbe("lichtFarbeMitte", "--licht-farbe-mitte", "Mitte — Farbe", "#3a94e8", "licht"),
  zahl("lichtWeite", "--licht-weite", "Außen — Größe", 44, 12, 96, 1, "rem", "licht",
    "Der weiche Auslauf. Er gibt dem Licht seinen Radius, ohne selbst sichtbar zu sein."),
  zahl("lichtWeitKraft", "--licht-weit-kraft", "Außen — Stärke", 0.14, 0, 0.6, 0.01, "", "licht"),
  farbe("lichtFarbeWeit", "--licht-farbe-weit", "Außen — Farbe", "#2279c9", "licht"),
  zahl("lichtTraegheit", "--licht-traegheit", "Nachlauf", 0.04, 0.01, 0.3, 0.005, "", "licht",
    "Anteil der Reststrecke je Bild. Klein heißt träge. Über 0,1 klebt das Licht am Cursor und wirkt wie ein zweiter Zeiger."),
  zahl("lichtEinblenden", "--licht-einblenden", "Einblendzeit", 1.1, 0, 3, 0.1, "s", "licht"),
  zahl("revealRaster", "--reveal-raster", "Enthüllung — Radius Punkte", 17, 4, 40, 1, "rem", "licht",
    "Wie weit um das Licht herum das Punktraster kräftiger wird."),
  zahl("revealRasterKraft", "--reveal-raster-kraft", "Enthüllung — Stärke Punkte", 0.55, 0, 1, 0.01, "", "licht"),
  zahl("revealKontur", "--reveal-kontur", "Enthüllung — Radius Konturen", 19, 4, 44, 1, "rem", "licht"),
  zahl("revealKonturKraft", "--reveal-kontur-kraft", "Enthüllung — Stärke Konturen", 0.42, 0, 1, 0.01, "", "licht"),

  /* ===================================================================== */
  /* Hintergrund & Signal                                                  */
  /* ===================================================================== */
  zahl("rasterKraft", "--raster-kraft", "Punktraster — Stärke", 0.14, 0, 0.6, 0.005, "", "signal",
    "Das ruhende Raster auf hellen Flächen."),
  zahl("rasterAbstand", "--raster-abstand", "Punktraster — Abstand", 26, 12, 60, 1, "px", "signal"),
  zahl("netzKraft", "--netz-kraft", "Liniennetz — Stärke", 0.09, 0, 0.5, 0.005, "", "signal",
    "Das Netz auf dunklen Flächen."),
  zahl("netzAbstand", "--netz-abstand", "Liniennetz — Abstand", 68, 24, 140, 2, "px", "signal"),
  zahl("signalKraft", "--signal-kraft", "Spuren & Flächen", 1, 0, 2.5, 0.05, "", "signal",
    "Ein Faktor über alle Signalpfade, Radare und Konturen der Seite."),
  zahl("signalPunkt", "--signal-punkt", "Beacon — Größe", 10, 4, 24, 1, "px", "signal"),
  zahl("signalPunktSchein", "--signal-punkt-schein", "Beacon — Schein", 1, 0, 2.5, 0.05, "", "signal"),
  zahl("signalWelleKraft", "--signal-welle-kraft", "Radarwellen — Stärke", 1, 0, 2.5, 0.05, "", "signal"),
  zahl("signalBlitzKraft", "--signal-blitz-kraft", "Netzaufblitzen — Stärke", 0.28, 0, 0.8, 0.01, "", "signal",
    "Der einmalige Moment im dunklen Abschnitt."),

  /* ===================================================================== */
  /* Farben                                                                */
  /* ===================================================================== */
  farbe("primary", "--color-primary", "Markenblau", "#80bdff", "farben",
    "Flächen und Akzente. Auf Weiß nicht als Textfarbe geeignet."),
  farbe("primaryDark", "--color-primary-dark", "Aktionsblau", "#1e71bf", "farben",
    "Trägt Links, Buttons und hervorgehobenen Text."),
  farbe("primaryDeep", "--color-primary-deep", "Aktionsblau, gedrückt", "#0b4f8a", "farben",
    "Hover-Zustand der primären Schaltflächen."),
  farbe("primarySoft", "--color-primary-soft", "Markenblau, hell", "#eaf5ff", "farben"),
  farbe("accent", "--color-accent", "Akzentblau", "#3a94e8", "farben"),
  farbe("ink", "--color-ink", "Textfarbe", "#082a47", "farben"),
  farbe("muted", "--color-muted", "Sekundärtext", "#5b7185", "farben"),
  farbe("page", "--color-page", "Seitenfläche", "#ffffff", "farben"),
  farbe("soft", "--color-soft", "Helle Fläche", "#f5faff", "farben"),
  farbe("dark", "--color-dark", "Dunkler Abschnitt", "#082f52", "farben"),
  farbe("darkDeep", "--color-dark-deep", "Dunkel, tiefer", "#05213c", "farben"),
  // --color-mid und --color-night stehen zwar im @theme-Block, werden aber
  // von keiner Regel und keiner Utility-Klasse verwendet. Sie hatten hier
  // einen Regler, der nichts bewegt — und ein Regler ohne Wirkung ist
  // schlimmer als keiner: Man dreht daran, sieht nichts und weiss danach
  // nicht, ob das Werkzeug kaputt ist oder der eigene Blick.
  farbe("line", "--color-line", "Linien", "#dceaf8", "farben"),
  farbe("lineStrong", "--color-line-strong", "Linien, kräftig", "#7691ab", "farben",
    "Ränder von Eingabefeldern und sekundären Schaltflächen."),

  /* ===================================================================== */
  /* Typografie                                                            */
  /* ===================================================================== */
  {
    // Der einzige Eintrag, der keine Variable setzt, sondern die Schriftgroesse
    // am <html> selbst. Alles, was in rem gerechnet ist — und das ist auf
    // dieser Seite fast alles — skaliert damit mit.
    art: "zahl",
    key: "schrift",
    css: "font-size",
    label: "Grundschriftgröße",
    hinweis: "Skaliert alle Abstände und Größen mit, die in rem gesetzt sind.",
    gruppe: "typografie",
    standard: 16,
    min: 13,
    max: 20,
    schritt: 0.5,
    einheit: "px",
    amDokument: true,
  },
  zahl("displaySkala", "--display-skala", "Überschriften — Größe", 1, 0.7, 1.4, 0.01, "", "typografie",
    "Faktor auf alle Displaygrößen. Die Verkleinerung auf schmalen Bildschirmen bleibt dabei erhalten."),
  zahl("displayGewicht", "--display-gewicht", "Überschriften — Gewicht", 700, 400, 900, 50, "", "typografie"),
  zahl("displayZeilen", "--display-zeilen", "Überschriften — Zeilenhöhe", 0.95, 0.8, 1.4, 0.01, "", "typografie"),
  zahl("displaySpur", "--display-spur", "Überschriften — Laufweite", -0.02, -0.06, 0.04, 0.002, "em", "typografie"),
  zahl("textZeilen", "--text-zeilen", "Fließtext — Zeilenhöhe", 1.65, 1.2, 2.2, 0.05, "", "typografie"),
  zahl("eyebrowGroesse", "--eyebrow-groesse", "Kleine Labels — Größe", 0.75, 0.5, 1.1, 0.0125, "rem", "typografie"),
  zahl("eyebrowSpur", "--eyebrow-spur", "Kleine Labels — Laufweite", 0.12, 0, 0.3, 0.005, "em", "typografie"),

  /* ===================================================================== */
  /* Abstände & Layout                                                     */
  /* ===================================================================== */
  // ACHTUNG: Diese Standardwerte muessen mit dem @theme-Block in globals.css
  // uebereinstimmen. Sie standen einmal auf 75 und 4, waehrend das Stylesheet
  // 78 und 4,5 sagte — und dadurch sah die Seite in der Entwicklung schmaler
  // aus als in Produktion.
  zahl("container", "--width-container", "Inhaltsbreite", 78, 56, 96, 1, "rem", "raum",
    "Ab 1536 px erhöht das Stylesheet auf 84 — sobald hier etwas verstellt ist, gilt stattdessen dieser Wert."),
  zahl("section", "--space-section", "Abschnittsabstand", 4.5, 1.5, 8, 0.25, "rem", "raum",
    "Luft zwischen den Abschnitten. Mehr wirkt ruhiger."),
  // In rem und nicht in px, obwohl px sich runder anfuehlt: Der @theme-Block
  // sagt 1.25rem. Bei px liefen beide auseinander, sobald jemand die
  // Grundschriftgroesse verstellt — der Radius bliebe stehen, waehrend die
  // Karte darunter mitwaechst.
  zahl("radius", "--radius-card", "Eckenradius", 1.25, 0, 2.5, 0.0625, "rem", "raum",
    "Karten und größere Flächen. 0 wirkt technisch, 1,25 rem freundlich."),

  /* ===================================================================== */
  /* Tiefe                                                                 */
  /* ===================================================================== */
  zahl("schattenKraft", "--schatten-kraft", "Schatten — Stärke", 1, 0, 2.5, 0.05, "", "tiefe",
    "Wirkt auf alle vier Schatten gemeinsam. Einzeln verstellt zerfällt die Tiefenstaffelung."),
  zahl("schattenWeite", "--schatten-weite", "Schatten — Weichheit", 1, 0.2, 2.5, 0.05, "", "tiefe"),
  zahl("glasBlur", "--glas-blur", "Milchglas — Unschärfe", 14, 0, 40, 1, "px", "tiefe",
    "Das Job-Fenster im Hero und die Karten-Bedienknöpfe."),

  /* ===================================================================== */
  /* Animation                                                             */
  /* ===================================================================== */
  zahl("tempo", "--tempo", "Tempo", 1, 0, 3, 0.05, "", "bewegung",
    "Faktor über alle Dauern. 0 schaltet die Bewegung aus, ohne das Ergebnis zu ändern."),
  zahl("dauerAntippen", "--basis-antippen", "Antippen", 180, 0, 600, 10, "ms", "bewegung",
    "Farbwechsel, Ränder, Zustände an Bedienelementen."),
  zahl("dauerZeigen", "--basis-zeigen", "Zeigen", 280, 0, 900, 10, "ms", "bewegung",
    "Hover an Karten und Knöpfen."),
  zahl("dauerHeben", "--basis-heben", "Heben", 420, 0, 1200, 10, "ms", "bewegung",
    "Größere Wege: Karten, Vorschauen, Wechsel."),
  zahl("dauerAuftritt", "--basis-auftritt", "Auftritt", 660, 0, 1800, 20, "ms", "bewegung",
    "Einblendungen beim Scrollen."),
  zahl("dauerSignal", "--basis-signal", "Signal", 900, 0, 3000, 20, "ms", "bewegung",
    "Hintergrundvorgänge. Bewusst die langsamste Dauer — der Hintergrund darf nie so schnell reagieren wie ein Bedienelement."),
  zahl("versatz", "--basis-versatz", "Versatz zwischen Nachbarn", 90, 0, 300, 5, "ms", "bewegung"),
  {
    art: "auswahl",
    key: "easeSanft",
    css: "--ease-sanft",
    label: "Beschleunigung",
    hinweis: "Die Kurve, nach der fast alles auf dieser Seite läuft.",
    gruppe: "bewegung",
    standard: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    optionen: [
      { wert: "cubic-bezier(0.22, 0.61, 0.36, 1)", label: "Sanft (Standard)" },
      { wert: "linear", label: "Gleichförmig" },
      { wert: "ease-out", label: "Auslaufend" },
      { wert: "cubic-bezier(0.16, 1, 0.3, 1)", label: "Sehr weich" },
      { wert: "cubic-bezier(0.34, 1.4, 0.44, 1)", label: "Mit Überschwung" },
    ],
  },

  /* ===================================================================== */
  /* Die dunkle Karte der Startseite                                       */
  /* ===================================================================== */
  /* Eigene Gruppe und nicht unter "Karten": Jene Regler stellen die helle
     Detailkarte ein, diese die dunkle Karte im Hauptabschnitt. Beide in einer
     Liste haetten zwei Saetze Kartenfarben nebeneinander gestellt, von denen
     keiner sichtbar zu einer Karte gehoert. */
  zahl("netzHoehe", "--netz-hoehe", "Höhe", 24, 14, 40, 0.5, "rem", "nachtkarte",
    "Ab 640 px das 1,25-Fache, ab 1024 px das 1,55-Fache."),
  farbe("nachtVersteck", "--color-nacht-versteck", "Verstecke — Marker", "#ff6a5c", "nachtkarte",
    "Korallrot: die Versteckfarbe #e03131, für dunklen Grund aufgehellt. Derselbe Ton, nicht ein zweiter."),
  farbe("nachtPartner", "--color-nacht-partner", "Partner — Marker", "#80bdff", "nachtkarte"),

  /* ===================================================================== */
  /* Karten                                                                */
  /* ===================================================================== */
  zahl("karteHoehe", "--karte-hoehe", "Höhe", 26, 14, 44, 1, "rem", "karten",
    "Auf Bildschirmen ab 768 px wird daraus das 1,35-Fache."),
  zahl("karteRadius", "--karte-radius", "Eckenradius", 1.25, 0, 3, 0.0625, "rem", "karten"),
  zahl("karteHelligkeit", "--karte-helligkeit", "Helligkeit", 1, 0.6, 1.4, 0.01, "", "karten"),
  zahl("karteSaettigung", "--karte-saettigung", "Farbigkeit", 1, 0, 2, 0.02, "", "karten",
    "0 macht die Grundkarte vollständig grau. Die Marker bleiben farbig."),
  zahl("karteNamen", "--karte-namen", "Ortsnamen — Sichtbarkeit", 1, 0, 1, 0.05, "", "karten",
    "0 blendet alle Ortsnamen aus."),
  zahl("karteNameSchrift", "--karte-name-schrift", "Ortsnamen — Größe", 0.6875, 0.5, 1, 0.0125, "rem", "karten"),
  zahl("karteMarker", "--karte-marker", "Marker — Größe", 1.75, 1, 3, 0.0625, "rem", "karten"),
  zahl("karteMarkerRing", "--karte-marker-ring", "Marker — weißer Ring", 0.1875, 0, 0.5, 0.0625, "rem", "karten"),
  zahl("karteMarkerSchrift", "--karte-marker-schrift", "Marker — Nummerngröße", 0.75, 0.5, 1.125, 0.0125, "rem", "karten"),
  zahl("karteStrich", "--karte-strich", "Nebenstraßen — Strichstärke", 1.3, 0.4, 4, 0.1, "", "karten",
    "In Bildschirmpunkten. Bleibt beim Zoomen gleich."),
  zahl("karteStrichHaupt", "--karte-strich-haupt", "Hauptstraßen — Strichstärke", 2.1, 0.5, 6, 0.1, "", "karten"),
  zahl("karteStrichFluss", "--karte-strich-fluss", "Salzach — Strichstärke", 3.4, 0.5, 10, 0.1, "", "karten"),
  farbe("versteck", "--color-versteck", "Verstecke — Marker", "#e03131", "karten",
    "Die einzige markenfremde Farbe der Seite. Sie steht ausschließlich für Verstecke."),
  farbe("versteckTief", "--color-versteck-tief", "Verstecke — Marker, gewählt", "#b02020", "karten"),
  farbe("karteGrund", "--color-karte-grund", "Kartenfläche", "#fbfcfe", "karten"),
  farbe("karteWald", "--color-karte-wald", "Wald", "#edf1ec", "karten"),
  farbe("kartePark", "--color-karte-park", "Parks", "#e3eee4", "karten"),
  farbe("karteWasser", "--color-karte-wasser", "Seen", "#dae9f7", "karten"),
  farbe("karteFluss", "--color-karte-fluss", "Salzach", "#a9cdec", "karten"),
  farbe("karteStrasse", "--color-karte-strasse", "Nebenstraßen", "#e6ecf3", "karten"),
  farbe("karteStrasseHaupt", "--color-karte-strasse-haupt", "Hauptstraßen", "#d2deea", "karten"),
  farbe("karteBahn", "--color-karte-bahn", "Bahn", "#c8d4e0", "karten"),
  farbe("karteGrenze", "--color-karte-grenze", "Stadtgrenze", "#b4c6d8", "karten"),
  farbe("karteName", "--color-karte-name", "Ortsnamen", "#6b8299", "karten"),

  /* ===================================================================== */
  /* Bauteile                                                              */
  /* ===================================================================== */
  zahl("knopfRadius", "--knopf-radius", "Knöpfe — Eckenradius", 999, 0, 999, 1, "px", "bauteile",
    "999 ist die runde Pillenform. Alles darunter macht daraus ein Rechteck."),
  zahl("knopfHoehe", "--knopf-hoehe", "Knöpfe — Mindesthöhe", 2.75, 2, 4, 0.0625, "rem", "bauteile",
    "Unter 2,75 rem (44 px) wird das Ziel auf einem Telefon zu klein."),
  zahl("feldRadius", "--feld-radius", "Eingabefelder — Eckenradius", 0.75, 0, 2, 0.0625, "rem", "bauteile"),
  zahl("pilleRadius", "--pille-radius", "Pillen — Eckenradius", 999, 0, 999, 1, "px", "bauteile"),
];

export type Werte = Record<string, string | number>;

export const standardWerte = (): Werte =>
  Object.fromEntries(tokens.map((t) => [t.key, t.standard]));

export function tokenNach(key: string): Token | undefined {
  return tokens.find((t) => t.key === key);
}

/** Der fertige CSS-Wert eines Tokens, inklusive Einheit. */
export function alsCss(token: Token, wert: string | number): string {
  return token.art === "zahl" ? `${wert}${token.einheit}` : String(wert);
}

/**
 * Die Farbtokens in der Reihenfolge der Liste.
 * Wird fuer die Kontrastpruefung gebraucht.
 */
export const farbTokens = tokens.filter((t) => t.art === "farbe");
