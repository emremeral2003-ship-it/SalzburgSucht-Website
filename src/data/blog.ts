/**
 * Blogbeitraege der Website.
 *
 * Bewusst als Datei statt CMS: Drei Beitraege brauchen keine Datenbank, und
 * jeder neue Beitrag ist ein Eintrag hier plus automatisch eine Seite unter
 * /blog/[slug]. Wenn der Blog waechst, ist der Wechsel auf Supabase dieselbe
 * Bewegung wie bei den Jobs (Repository-Schicht, Seiten bleiben unveraendert).
 *
 * INHALTLICHE REGEL wie ueberall auf der Seite: keine erfundenen Fakten.
 * Jeder Beitrag stuetzt sich auf Belegtes — die Karte, die Kanaele, die
 * Ankuendigungen von Emre. Was nicht feststeht (Datum der Naya-Aktion,
 * Eroeffnungstag Linzergasse), steht auch so im Text.
 */

export type BlogAbschnitt = {
  /** Zwischenueberschrift. `null` fuer den Einstiegsabsatz. */
  titel: string | null;
  absaetze: string[];
};

export type BlogPost = {
  slug: string;
  titel: string;
  /** Max. 155 Zeichen — geht in die Meta-Description. */
  beschreibung: string;
  kategorie: "Community" | "Gastro" | "Hinter den Kulissen";
  publishedAt: string;
  /** Anreisser fuer die Uebersichtsseite. */
  auszug: string;
  abschnitte: BlogAbschnitt[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "geld-verstecken-in-salzburg",
    titel: "Wir verstecken Geld in Salzburg — so funktioniert das",
    beschreibung:
      "Salzburgsucht versteckt immer wieder Geld in der Stadt. Wie die Aktion abläuft, wo schon Verstecke waren und wie du beim nächsten dabei bist.",
    kategorie: "Community",
    publishedAt: "2026-08-27",
    auszug:
      "36 Verstecke stehen inzwischen auf unserer Karte — vom Kai bis nach Gnigl. Was dahintersteckt und wie du beim nächsten dabei bist.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Irgendwo in Salzburg klebt gerade vielleicht ein Kuvert unter einer Parkbank. Wir verstecken immer wieder Geld in der Stadt — und wer es findet, behält es. So einfach ist die Aktion, und genau deshalb funktioniert sie.",
        ],
      },
      {
        titel: "Wie ein Versteck abläuft",
        absaetze: [
          "Angekündigt wird jedes Versteck auf unserem Instagram-Kanal. Dort kommen auch die Hinweise — wer uns folgt, erfährt zuerst, wann und wo es wieder losgeht. Mehr braucht es nicht: kein Formular, keine Anmeldung, keine Teilnahmebedingungen mit Sternchen.",
          "Gefunden wird schneller, als man denkt. Die Community ist inzwischen groß genug, dass ein Versteck selten lange liegen bleibt — manche sind innerhalb einer Stunde weg.",
        ],
      },
      {
        titel: "36 Verstecke und eine Karte",
        absaetze: [
          "Jedes vergangene Versteck steht auf der Salzburg-Karte auf unserer Startseite — inzwischen 36 Stück, von der Altstadt über Mülln bis nach Gnigl und Aigen. Die Karte zeigt bewusst nur, was schon vorbei ist: Ein aktives Versteck wird dort nie markiert, sonst wäre es keines.",
          "Wer die Karte durchgeht, sieht auch, dass wir nicht nur die Getreidegasse kennen. Die Verstecke verteilen sich über die ganze Stadt, und genau das ist der Punkt: Salzburg ist mehr als die drei Gassen, die jeder Tourist fotografiert.",
        ],
      },
      {
        titel: "Warum wir das machen",
        absaetze: [
          "Salzburgsucht ist als Community-Kanal entstanden, und eine Community lebt davon, dass etwas passiert — nicht nur im Feed, sondern in der Stadt. Die Geldverstecke bringen Leute an Orte, an denen sie sonst nie stehen bleiben würden. Das ist der ganze Trick.",
          "Wann das nächste Versteck kommt? Das verraten wir dort, wo alles bei uns anfängt: auf Instagram.",
        ],
      },
    ],
  },
  {
    slug: "salz-und-zucker-linzergasse",
    titel: "Salz & Zucker sperrt in der Linzergasse 2 auf",
    beschreibung:
      "Die Salzburger Bäckerei Salz & Zucker eröffnet demnächst einen neuen Standort in der Linzergasse 2 — frisch und handgemacht, mitten in der Stadt.",
    kategorie: "Gastro",
    publishedAt: "2026-08-27",
    auszug:
      "Die Bäckerei, die seit einem Jahr täglich frisch backt, kommt in die Linzergasse. Was wir schon wissen — und was noch offen ist.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Die Linzergasse bekommt eine Bäckerei: Salz & Zucker eröffnet demnächst in der Linzergasse 2 einen neuen Standort — auf der rechten Altstadtseite, ein paar Schritte von der Staatsbrücke.",
        ],
      },
      {
        titel: "Wer dahintersteht",
        absaetze: [
          "Salz & Zucker backt seit über einem Jahr täglich frisch und von Hand — herzhaft und süß, wie es im Namen steckt. Im Sommer hat die Bäckerei ihr einjähriges Bestehen gefeiert, und wer den Kanal @szbaeckerei verfolgt, weiß: Die Torten dort sind der heimliche Star.",
        ],
      },
      {
        titel: "Was noch offen ist",
        absaetze: [
          "Das genaue Eröffnungsdatum steht noch nicht fest — sobald es fixiert ist, erfährst du es auf unseren Kanälen. Auch Öffnungszeiten und Sortiment des neuen Standorts geben wir weiter, sobald sie feststehen.",
          "Bis dahin gilt: Augen offen halten, wenn du über die Staatsbrücke gehst. Und wer nicht warten will, findet Salz & Zucker schon jetzt auf Instagram.",
        ],
      },
    ],
  },
  {
    slug: "was-ist-salzburgsucht",
    titel: "Was Salzburgsucht ist — und was hier gerade entsteht",
    beschreibung:
      "Aus einem Salzburger Instagram-Kanal mit 18.000+ Followern wird eine Plattform: Empfehlungen, Aktionen, Kooperationen und Jobs aus der Region.",
    kategorie: "Hinter den Kulissen",
    publishedAt: "2026-08-27",
    auszug:
      "Angefangen hat alles im Feed. Warum es jetzt eine Website gibt, was hier steht und was als Nächstes kommt.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Salzburgsucht ist auf Instagram und TikTok entstanden — mit dem, was Menschen hier ohnehin ständig suchen: Wo ist es gerade gut? Was ist am Wochenende los? Wer stellt gerade ein? Inzwischen folgen dem Kanal mehr als 18.000 Menschen, und aus einzelnen Beiträgen ist eine der größten Salzburg-Communities auf Social Media geworden.",
        ],
      },
      {
        titel: "Warum eine Website?",
        absaetze: [
          "Ein Beitrag im Feed ist nach zwei Tagen weg. Vieles von dem, was wir machen, verdient aber einen festen Ort: die Karte mit allen bisherigen Geldverstecken, die Betriebe, mit denen wir arbeiten, ausgewählte Stellen aus der Region — und jetzt auch diesen Blog.",
          "Die Website ersetzt den Feed nicht. Sie ist das Archiv und das Schaufenster dazu: Was auf Instagram passiert, bleibt hier auffindbar.",
        ],
      },
      {
        titel: "Was hier steht",
        absaetze: [
          "Auf der Startseite findest du die Salzburg-Karte mit jedem vergangenen Versteck, aktuelle Ankündigungen aus Gastro und Community sowie einen kleinen Job-Bereich mit ausgewählten Stellen von Betrieben aus der Region — bewusst kuratiert statt Masse.",
          "Für Unternehmen gibt es eine eigene Seite: Wer mit uns arbeiten will — von einem einzelnen Reel bis zur laufenden Zusammenarbeit — findet dort die Formate und den direkten Draht.",
        ],
      },
      {
        titel: "Was als Nächstes kommt",
        absaetze: [
          "Wir bauen die Plattform Schritt für Schritt aus und schauen dabei genau hin, was tatsächlich genutzt wird. Im Blog erscheinen ab jetzt regelmäßig Beiträge: Neueröffnungen, Aktionen, Empfehlungen — das, was unsere Community ohnehin von uns kennt, nur mit mehr Platz als in einer Caption.",
          "Wenn du nichts verpassen willst: Auf Instagram sind wir täglich. Hier im Blog immer dann, wenn es etwas zu erzählen gibt.",
        ],
      },
    ],
  },
];

export function getBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogPost(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}
