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
    /* Cover von Emre am 28.08.2026 ausgewaehlt: die Auslage der Baeckerei.
       Auf 4:5 zugeschnitten, Bildausschnitt leicht nach oben gezogen, damit
       die Vitrine im Bild bleibt und nicht die Tischkante. */
    id: "gastro-salz-und-zucker",
    kategorie: "Gastro",
    titel: "Salz & Zucker sperrt in der Linzergasse auf",
    text: "Die Bäckerei eröffnet demnächst ihren neuen Standort in der Linzergasse 2 — frisch und handgemacht, mitten in der Stadt.",
    bild: "/images/salz-und-zucker-auslage.jpg",
    alt: "Blech mit Schokoladencroissants in der Auslage, eine Hand greift mit der Zange danach",
    video: null,
    url: null,
    demo: false,
  },
  {
    /* Das Cover ist ein echtes Foto von Naya (aus Emres Ablage,
       ~/Downloads/Naya Posts 4_5.png) — der Matcha, um den es in der Aktion
       geht. Eine Aussenaufnahme des Lokals in der Rainerstraße 24 liegt
       weiterhin nicht vor; sie waere die Alternative, wenn der Ort wichtiger
       sein soll als das Getraenk. */
    id: "event-naya-matcha",
    kategorie: "Event",
    titel: "Zwei Matcha um 2 € bei Naya",
    text: "Ab September: zwei Matcha um zwei Euro bei Naya. Das genaue Datum geben wir auf unseren Kanälen bekannt.",
    bild: "/images/naya-matcha.jpg",
    alt: "Ein geschichteter Matcha mit Erdbeeren im hohen Glas",
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
