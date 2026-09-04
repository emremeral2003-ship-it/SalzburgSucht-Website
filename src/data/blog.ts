/**
 * Blogbeitraege der Website.
 *
 * Bewusst als Datei statt CMS: Eine Handvoll Beitraege braucht keine Datenbank, und
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
  kategorie: "Community" | "Gastro" | "Jobs" | "Hinter den Kulissen";
  publishedAt: string;
  /** Anreisser fuer die Uebersichtsseite. */
  auszug: string;
  abschnitte: BlogAbschnitt[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "stellen-aus-salzburg",
    titel: "Warum bei uns nur eine Handvoll Stellen steht",
    beschreibung:
      "Salzburgsucht zeigt ausgewählte Stellen von Betrieben aus der Region statt einer endlosen Liste. Was gerade offen ist und wie die Bewerbung läuft.",
    kategorie: "Jobs",
    publishedAt: "2026-09-04",
    auszug:
      "Zwei Stellen stehen gerade auf der Seite. Warum es nicht zweihundert sind — und was passiert, wenn du dich bewirbst.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Auf Salzburgsucht gibt es einen Job-Bereich, und wer ihn aufmacht, findet dort gerade zwei Stellen. Das ist kein Anfangszustand, den wir möglichst schnell hinter uns bringen wollen — es ist der Plan.",
        ],
      },
      {
        titel: "Was gerade offen ist",
        absaetze: [
          "icmedia sucht einen Foto- und Videografen (m/w/d) in Vollzeit für Salzburg. Shootings bei Kunden vor Ort, Reels und TikToks drehen und schneiden, Bildbearbeitung und Farbkorrektur. Wer schon einmal versucht hat, ein Reel so zu bauen, dass es nicht nach Werbung aussieht, weiß, worum es bei der Stelle geht.",
          "BranIT sucht einen IT-Consultant (m/w/d) in Vollzeit, remote und vor Ort. Bestehende IT-Umgebungen analysieren, daraus Roadmaps entwickeln, Migrationen begleiten — Microsoft 365, Azure, Hybrid Cloud. Gefragt ist jemand, der Technik so erklären kann, dass sie beim Kunden ankommt.",
          "Beide Ausschreibungen stehen vollständig im Job-Bereich: Aufgaben, Anforderungen und das, was der Betrieb dafür bietet.",
        ],
      },
      {
        titel: "Warum es nicht mehr sind",
        absaetze: [
          "Eine Jobbörse, die alles aufnimmt, ist schnell voll und damit nutzlos. Man scrollt an hundert Inseraten vorbei, von denen die Hälfte seit Monaten unverändert dasteht, und weiß am Ende weniger als vorher.",
          "Wir zeigen Stellen von Betrieben, mit denen wir tatsächlich zu tun haben. Das begrenzt die Zahl ganz von selbst — und sorgt dafür, dass es eine Stelle auch wirklich gibt, wenn sie hier steht.",
        ],
      },
      {
        titel: "Wie die Bewerbung läuft",
        absaetze: [
          "Beide Stellen laufen im Moment über uns. Der Bewerbungsknopf öffnet eine E-Mail an office@salzburgsucht.at; von dort geht deine Bewerbung an den Betrieb weiter. Kein Konto, kein Formular mit vierzehn Pflichtfeldern.",
          "Wenn du eine Stelle offen hast und sie hier sehen willst, schreib uns einfach — ob sie zu dem passt, was wir zeigen, klären wir dann gemeinsam.",
        ],
      },
    ],
  },
  {
    slug: "partnernetz-salzburg",
    titel: "39 Betriebe: mit wem wir in Salzburg zusammenarbeiten",
    beschreibung:
      "Von der Bäckerei bis zum Messezentrum — ein Überblick über die Betriebe im Partnernetz von Salzburgsucht und wie so eine Zusammenarbeit aussieht.",
    kategorie: "Hinter den Kulissen",
    publishedAt: "2026-09-04",
    auszug:
      "16 davon sind Gastro, der Rest reicht von Freizeit über Mobilität bis zu Institutionen. Ein Blick auf die Liste — und darauf, was dahintersteckt.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Wer auf unserer Partnerseite nach unten scrollt, liest 39 Namen. Manche kennt in Salzburg jeder, andere sind kleine Betriebe mit ein paar hundert Followern. Beides steht bei uns nebeneinander, und das ist Absicht.",
        ],
      },
      {
        titel: "Wer dabei ist",
        absaetze: [
          "Der größte Block ist die Gastronomie: 16 Betriebe, von Fifty 4 Burgers in der Linzer Gasse über die Bäckerei Salz & Zucker bis zum Elixhausner Wirt. Dazu kommen fünf aus dem Freizeitbereich, fünf rund um Mobilität, vier Institutionen wie die AK Salzburg und das WIFI, drei Medienbetriebe, zwei aus dem Handel und je einer aus IT, Fitness, Lifestyle und Events.",
          "Zwanzig davon sind auf der Partnerkarte verortet. Bei den übrigen fehlt uns schlicht die genaue Adresse. Sie stehen trotzdem in der Liste — wer sie sucht, soll lesen, dass es sie gibt, und nicht glauben, wir hätten sie vergessen.",
        ],
      },
      {
        titel: "Was Zusammenarbeit bei uns heißt",
        absaetze: [
          "In den meisten Fällen läuft es über unsere Kanäle: ein Feed-Post, eine Story-Kampagne, ein Reel, das wir selbst drehen und schneiden. Manchmal ist es ein einzelner Beitrag zu einer Neueröffnung, manchmal eine Zusammenarbeit über mehrere Monate.",
          "Was wir nicht machen, sind Standardpakete mit drei Häkchen und einem Preis darunter. Wir fragen zuerst, was erreicht werden soll, und bauen den Weg danach — deshalb steht auf der Unternehmensseite auch keine Preisliste.",
        ],
      },
      {
        titel: "Wie man dazukommt",
        absaetze: [
          "Es gibt keine Aufnahmeprüfung und keine Warteliste. Der übliche Weg ist eine Nachricht: über das Kooperationsformular hier auf der Website oder direkt auf Instagram.",
          "Danach reden wir darüber, was für den Betrieb Sinn ergibt. Und wenn nichts davon passt, sagen wir das auch — das ist für beide Seiten billiger als eine Zusammenarbeit, die niemand gebraucht hat.",
        ],
      },
    ],
  },
  {
    slug: "geld-verstecken-in-salzburg",
    titel: "Wir verstecken Geld in Salzburg — so funktioniert das",
    beschreibung:
      "Salzburgsucht versteckt immer wieder Geld in der Stadt. Wie die Aktion abläuft, wo schon Verstecke waren und wie du beim nächsten dabei bist.",
    kategorie: "Community",
    publishedAt: "2026-08-27",
    auszug:
      "37 Verstecke stehen inzwischen auf unserer Karte — vom Kai bis nach Gnigl. Was dahintersteckt und wie du beim nächsten dabei bist.",
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
        titel: "37 Verstecke und eine Karte",
        absaetze: [
          "Jedes vergangene Versteck steht auf der Salzburg-Karte auf unserer Startseite — inzwischen 37 Stück, von der Altstadt über Mülln bis nach Gnigl und Aigen. Die Karte zeigt bewusst nur, was schon vorbei ist: Ein aktives Versteck wird dort nie markiert, sonst wäre es keines.",
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
