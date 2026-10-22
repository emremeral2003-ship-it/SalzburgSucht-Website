/**
 * Inhalte der Content-Reihe.
 *
 * Hier stand frueher auch die Suchwand ("Salzburg sucht ___"). Sie ist raus:
 * Das Wortspiel hat nichts belegt, und an ihrer Stelle steht jetzt die
 * Salzburg-Karte, die dasselbe sagt und es zeigt.
 */


/**
 * ============================================================================
 * DEMODATEN — diese Beiträge existieren so nicht.
 * ============================================================================
 *
 * Platzhalter fuer die Reihe "Gerade in Salzburg". Sobald echte Beitraege
 * verlinkt werden, kommen hier Titel, Kategorie, Cover und die Instagram-URL
 * hinein und `demo` faellt weg. Bewusst OHNE Reichweiten- oder Aufrufzahlen:
 * eine erfundene Zahl auf einer Seite, die Unternehmen ueberzeugen soll, ist
 * ein Haftungsrisiko und kein Marketing.
 *
 * ----------------------------------------------------------------------------
 * SO TAUSCHT MAN EIN COVER
 * ----------------------------------------------------------------------------
 *   1. Datei nach public/images/ legen, z. B. post-altstadt.jpg
 *   2. Hier eintragen:  bild: "/images/post-altstadt.jpg"
 *   3. `alt` in eigenen Worten beschreiben (was ist zu sehen, nicht "Bild")
 *   4. `vorschau` und `demo` entfernen
 *
 * Ein kurzes Reel statt eines Standbilds:
 *   video: "/images/post-altstadt.mp4"   (bleibt stumm, startet erst beim
 *                                         Darueberfahren, nie auf Mobil)
 * Das Cover unter `bild` bleibt dabei Pflicht — es ist das Standbild, das
 * vor dem Abspielen und auf Telefonen zu sehen ist.
 *
 * Seit 28.08.2026 tragen alle drei Karten echte Fotos. Die frueher hier
 * verwendeten abstrakten Platzhalter (public/images/platzhalter/, erzeugt von
 * scripts/platzhalter-bilder.mjs) werden nicht mehr eingebunden; das Skript
 * bleibt liegen, falls wieder einmal eine Karte ohne Bild auskommen muss.
 * ============================================================================
 */
export type ContentKarte = {
  id: string;
  kategorie: string;
  titel: string;
  text: string;
  /** Cover. Immer gesetzt — es traegt die Karte. */
  bild: string;
  /** Beschreibung des Covers fuer Screenreader und fehlgeschlagene Ladevorgaenge. */
  alt: string;
  /** Optionales Reel. Laeuft stumm, nur beim Darueberfahren, nie auf Mobil. */
  video: string | null;
  /**
   * Unscharfes Miniaturbild als Ladezustand — nur fuer die erzeugten
   * Platzhalter gedacht. Bei echten Fotos bleibt es weg: Next.js liefert
   * diese ohnehin in der passenden Groesse aus.
   */
  vorschau?: string;
  /**
   * Rabattcode einer Aktion, hervorgehoben unter dem Text.
   *
   * Eigenes Feld und nicht im Fliesstext: Ein Code, den man im Laden nennen
   * muss, ist das Einzige auf der Karte, das man sich merken soll — im Satz
   * mitlaufend wird er ueberlesen. `undefined` bei allen Karten ohne Aktion.
   */
  code?: string;
  /** Instagram-Permalink des Beitrags. `null`, solange keiner hinterlegt ist. */
  url: string | null;
  demo: boolean;
};

export const contentKarten: ContentKarte[] = [
  /**
   * ==========================================================================
   * ECHTE ANKUENDIGUNGEN (Stand 27.08.2026) — Cover sind noch Platzhalter.
   * ==========================================================================
   * Die ersten beiden Karten sind statische Beitraege der Website —
   * `url: null` ist dort Absicht und kein fehlender Wert. Nur das
   * Geldverstecken laeuft ueber Instagram und traegt deshalb als einzige
   * einen Permalink samt Instagram-Zeichen. Die Baeckerei-Eroeffnung und die
   * Naya-Aktion haben mit Instagram nichts zu tun; deshalb steht die Reihe
   * auch nicht mehr unter "Aus dem Feed".
   *
   * OFFEN:
   *   - Echte Fotos statt der Platzhalter-Cover (public/images/…)
   *   - Naya-Aktion: Startdatum steht noch nicht fest ("ab September"),
   *     Konditionen bestaetigen lassen (zwei Matcha um 2 €?)
   *   - Salz & Zucker Linzergasse: Eroeffnungsdatum nachtragen, sobald fix
   * ==========================================================================
   */
  {
    /* Cover von Emre am 18.09.2026 geliefert: Fruehlingsrollen mit Sauce,
       auf 4:5 zugeschnitten wie alle Cover dieser Reihe.

       Bedingungen wortwoertlich von Emre (18.09.2026): unbefristet, ab 10 EUR
       Bestellwert, NUR bei Abholung im Laden, der Code wird dort genannt.
       Keine Lieferung - das stand in der ersten Fassung anders und war
       falsch. Wer wegen einer Bedingung hinfaehrt, die es nicht gibt, kommt
       kein zweites Mal. */
    id: "gastro-mr-wen",
    kategorie: "Gastro",
    titel: "Mr. Wen Salzburg",
    text: "Gratis Frühlingsrollen ab 10 € Bestellwert — Mr. Wen folgen, den Code beim Bestellen nennen, nur bei Abholung im Laden. In Maxglan, Mirabell, Kaigasse und Himmelreich.",
    bild: "/images/mr-wen-fruehlingsrollen.jpg",
    alt: "Frühlingsrolle mit Stäbchen über einer Schale süßsaurer Sauce, daneben weitere Rollen auf dunklem Teller",
    code: "SALZBURG SUCHT",
    video: null,
    url: null,
    demo: false,
  },
  {
    /* Novaluna, neues tuerkisches Restaurant in der Rainerstraße 27.
       Rueckblick seit 19.10.2026: Die Aktion war am 18. Oktober, die Karte
       kuendigte sie bis dahin an. Zahl und Fotos von Emre, aufgenommen am
       Eroeffnungstag. Die ganze Geschichte steht im Blog unter
       /blog/800-doener-novaluna-eroeffnung.

       Cover auf 4:5 zugeschnitten wie alle Karten dieser Reihe. */
    id: "event-novaluna-doener",
    kategorie: "Event",
    titel: "Über 800 Döner zur Eröffnung von Novaluna",
    text: "Zwei Döner für zwei Euro zur Eröffnung am 18. Oktober — über 800 Stück gingen in der Rainerstraße 27 über die Theke.",
    bild: "/images/novaluna-eroeffnung.jpg",
    alt: "Eröffnung mit rotem Band vor dem Eingang von Novaluna",
    video: null,
    url: null,
    demo: false,
  },
  {
    /* ------------------------------------------------------------------
       Die einzige Karte, die tatsaechlich nach Instagram fuehrt.

       Permalink und Cover sind gesetzt (Emre, 28.08.2026). Das Cover ist ein
       Standbild aus dem verlinkten Beitrag — automatisch abrufen liess es
       sich nicht: Instagram liefert die Seite ohne Anmeldung voellig ohne
       Metadaten aus, auch ohne og:image.

       BEWUSST KEIN INSTAGRAM-EINBETTUNGSCODE: Der laedt Skript und Bild
       von Meta-Servern, sobald die Seite aufgeht. Das waere eine
       Datenuebermittlung an Meta vor jeder Einwilligung — mit einem
       eigenen Cover und einem Link passiert genau nichts, bis jemand
       klickt.
       ------------------------------------------------------------------ */
    id: "aktion-geldversteck",
    kategorie: "Gewinnspiel",
    titel: "Wir verstecken Geld in Salzburg",
    text: "Immer wieder verstecken wir Geld irgendwo in der Stadt — wo das letzte Versteck war und wann das nächste kommt, siehst du auf unserem Instagram.",
    bild: "/images/geld-verstecken.jpg",
    alt: "Eine Hand hält eine Karte mit angeklammertem Geldschein vor eine Hecke",
    video: null,
    url: "https://www.instagram.com/p/DcjBLD8oeny/",
    demo: false,
  },
];
