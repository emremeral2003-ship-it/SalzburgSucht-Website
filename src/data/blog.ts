/**
 * Blogbeitraege der Website.
 *
 * Bewusst als Datei statt CMS: Eine Handvoll Beitraege braucht keine
 * Datenbank, und jeder neue Beitrag ist ein Eintrag hier plus automatisch
 * eine Seite unter /blog/[slug]. Wenn der Blog waechst, ist der Wechsel auf
 * Supabase dieselbe Bewegung wie bei den Jobs (Repository-Schicht, Seiten
 * bleiben unveraendert).
 *
 * INHALTLICHE REGEL wie ueberall auf der Seite: keine erfundenen Fakten.
 * Jeder Beitrag stuetzt sich auf Belegtes — die Karte, die Kanaele, die
 * Ankuendigungen von Emre. Was nicht feststeht (Eroeffnungstag
 * Linzergasse), steht auch so im Text.
 *
 * scripts/pruefe-blog.mts vergleicht die Zahlen in den Texten mit den
 * Datendateien. Wer eine Zahl aendert, aendert die Behauptung dort mit.
 *
 * ----------------------------------------------------------------------------
 * VORRAT: BEITRAEGE MIT DATUM IN DER ZUKUNFT
 * ----------------------------------------------------------------------------
 * `publishedAt` ist kein Vermerk, sondern ein Schalter. Ein Beitrag, dessen
 * Datum noch nicht erreicht ist, existiert fuer die Website nicht: Er fehlt
 * in der Uebersicht, in "Weiterlesen", in der Sitemap, und seine eigene
 * Adresse liefert 404. Am Stichtag erscheint er von selbst.
 *
 * Damit das ohne neuen Deploy funktioniert, stehen die Blogseiten auf
 * `revalidate` (siehe src/app/blog/page.tsx). Sie bauen sich stuendlich neu;
 * spaetestens eine Stunde nach Mitternacht ist ein faelliger Beitrag da.
 *
 * WARUM UEBERHAUPT: Sonst muesste jemand am Erscheinungstag am Rechner
 * sitzen und pushen. Beitraege im Vorrat lassen sich stattdessen in Ruhe
 * schreiben, gemeinsam durchsehen und dann liegen lassen.
 *
 * EIN DATUM VERSCHIEBEN oder einen Beitrag zurueckziehen heisst: hier die
 * Zeile `publishedAt` aendern und pushen. Mehr ist es nicht.
 *
 * VORSICHT: Ein Beitrag im Vorrat ist trotzdem im Quelltext des Repositories
 * lesbar. Fuer Geplantes, das niemand vorher wissen darf — ein Versteck, ein
 * Eroeffnungstermin unter Verschluss — ist das hier der falsche Ort.
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
  /**
   * Erscheinungstag als `JJJJ-MM-TT`.
   *
   * Liegt er in der Zukunft, ist der Beitrag noch nicht veroeffentlicht —
   * siehe den Kopf dieser Datei.
   */
  publishedAt: string;
  /** Anreisser fuer die Uebersichtsseite. */
  auszug: string;
  abschnitte: BlogAbschnitt[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "zwei-matcha-um-zwei-euro-bei-naya",
    titel: "Zwei Matcha um 2 € bei Naya — am 2. Oktober",
    beschreibung:
      "Am 2. Oktober gibt es bei Naya zwei Matcha um zwei Euro. Was zu der Aktion bekannt ist und wo du die Details erfährst.",
    kategorie: "Gastro",
    publishedAt: "2026-09-16",
    auszug:
      "Einer für dich, einer zum Mitbringen: Am 2. Oktober gibt es bei Naya zwei Matcha um zwei Euro.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Am 2. Oktober gibt es bei Naya zwei Matcha um zwei Euro. Einen für dich, einen zum Mitbringen — mehr ist die Aktion nicht, und mehr muss sie auch nicht sein.",
        ],
      },
      {
        titel: "Warum wir das zeigen",
        absaetze: [
          "Naya gehört zu den Betrieben, mit denen wir zusammenarbeiten. Matcha ist dort kein Nebenprodukt, sondern das, wofür Leute hingehen — und ein Preis, bei dem man jemanden mitnimmt, passt zu einem Getränk, das ohnehin selten allein getrunken wird.",
          "Solche Aktionen kündigen wir an, weil sie genau das tun, was wir gut finden: Sie bringen Leute an einem bestimmten Tag an einen bestimmten Ort, statt nur Reichweite zu erzeugen.",
        ],
      },
      {
        titel: "Was noch offen ist",
        absaetze: [
          "Uhrzeit und Bedingungen geben wir bekannt, sobald sie feststehen. Wir schreiben hier bewusst nichts dazu, was wir nicht sicher wissen — nichts ist ärgerlicher, als wegen einer Uhrzeit hinzufahren, die sich jemand ausgedacht hat.",
          "Den aktuellen Stand gibt es wie immer zuerst auf unserem Instagram-Kanal. Dort steht auch, falls sich am Termin noch etwas ändert.",
        ],
      },
    ],
  },
  {
    slug: "was-nicht-auf-die-seite-kommt",
    titel: "Was bei uns nicht auf die Seite kommt",
    beschreibung:
      "Keine erfundenen Zahlen, keine Reichweitenversprechen, keine Stellen, die es nicht gibt: die Regeln, nach denen diese Website gebaut ist.",
    kategorie: "Hinter den Kulissen",
    publishedAt: "2026-09-29",
    auszug:
      "Über das, was fehlt, redet selten jemand. Dabei sagt es mehr über eine Seite aus als alles, was draufsteht.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Die meisten Seiten erzählen, was sie alles können. Wir schreiben hier einmal auf, was auf salzburgsucht.at bewusst nicht steht — weil man daran besser erkennt, worauf man sich verlassen kann.",
        ],
      },
      {
        titel: "Keine Zahl, die wir nicht belegen können",
        absaetze: [
          "Auf der Seite steht genau eine Reichweitenzahl, und die ist von uns bestätigt. Alles andere — TikTok-Zahlen, Aufrufe, Interaktionsraten — fehlt, solange wir es nicht sauber belegen können. Eine erfundene Zahl auf einer Seite, die Unternehmen überzeugen soll, ist kein Marketing, sondern ein Risiko.",
          "Dasselbe gilt für Termine. Beim neuen Standort von Salz & Zucker steht bis heute kein Eröffnungstag, weil wir keinen haben. Lieber eine Lücke als ein Datum, an dem jemand vor einer verschlossenen Tür steht.",
        ],
      },
      {
        titel: "Keine Marker, die Genauigkeit vortäuschen",
        absaetze: [
          "Auf der Karte mit unseren Verstecken kennen wir bei manchen Orten nur den Stadtteil, nicht die Adresse. Man könnte alle Punkte gleich zeichnen, niemandem wäre es aufgefallen. Stattdessen steht an jedem Punkt, wie genau er ist.",
        ],
      },
      {
        titel: "Keine Stellen, die es nicht gibt",
        absaetze: [
          "Im Job-Bereich standen anfangs Beispielinserate, damit wir das Layout bauen konnten. Die sind abgeschaltet, sobald echte Stellen da waren, und sie tauchen auch in Suchmaschinen nicht auf. Niemand soll sich auf eine Stelle bewerben, die als Platzhalter entstanden ist.",
        ],
      },
      {
        titel: "Kein Versprechen, das wir nicht halten können",
        absaetze: [
          "Betrieben sagen wir nicht zu, wie viele Menschen ein Beitrag erreicht. Wir können sagen, was wir produzieren und wie groß unsere Community ist. Was ein einzelner Beitrag tut, hängt an zu vielem, worauf niemand Einfluss hat.",
          "Das klingt nach Zurückhaltung und ist in Wahrheit Eigennutz: Eine Zusage, die man nicht hält, ist der kürzeste Weg zu einer Zusammenarbeit, die nur einmal stattfindet.",
        ],
      },
    ],
  },
  {
    slug: "warum-salzburgsucht",
    titel: "Warum Salzburgsucht?",
    beschreibung:
      "Warum es Salzburgsucht gibt: weil Salzburg mehr ist als drei Gassen, weil gute Tipps im Feed verschwinden und weil kleine Betriebe gesehen werden sollen.",
    kategorie: "Community",
    publishedAt: "2026-09-11",
    auszug:
      "Nicht, weil es noch einen Kanal gebraucht hätte. Sondern weil die Fragen, die hier jeder stellt, eine Antwort verdienen, die bleibt.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Salzburgsucht gibt es schon lange, bevor es diese Website gab. Trotzdem fragen uns Leute immer wieder dasselbe: Warum macht ihr das eigentlich? Hier die ehrliche Antwort — in vier Teilen.",
        ],
      },
      {
        titel: "Weil jeder dieselben Fragen stellt",
        absaetze: [
          "Wo ist es gerade gut? Was ist am Wochenende los? Wer hat neu aufgesperrt, wer stellt gerade ein? Das sind keine besonderen Fragen. Es sind die Fragen, die in Salzburg jeden Tag in Gruppenchats, in der Mittagspause und an der Bar gestellt werden.",
          "Genau dort hat Salzburgsucht angefangen: auf Instagram und TikTok, mit Antworten auf diese Fragen. Inzwischen folgen uns mehr als 18.000 Menschen — nicht, weil wir laut sind, sondern weil die Fragen nicht weniger werden.",
        ],
      },
      {
        titel: "Weil Salzburg mehr ist als die Postkarte",
        absaetze: [
          "Die Festung, der Dom, die Getreidegasse — das kennt jeder, auch wer noch nie hier war. Aber wer hier wohnt, lebt in Lehen, in Itzling, in Maxglan, in Gnigl, in Hallein. Dort sperren die Lokale auf, von denen niemand im Reiseführer liest, und dort passiert das meiste von dem, was eine Stadt ausmacht.",
          "Deshalb verstecken wir unser Geld auch nicht nur in der Altstadt. Die Karte auf unserer Startseite zeigt es: Die Verstecke liegen über die ganze Stadt und bis ins Umland verteilt. Wer eins sucht, steht plötzlich an einer Ecke, an der er sonst nur vorbeifährt — und das ist der eigentliche Punkt.",
        ],
      },
      {
        titel: "Weil kleine Betriebe gesehen werden sollen",
        absaetze: [
          "Eine neue Bäckerei, ein Burgerlokal, ein Barbershop: Solche Betriebe haben selten ein Werbebudget, aber oft genau das, was Leute suchen. Irgendwann haben sie von selbst angefragt, ob wir sie zeigen — und daraus ist über die Zeit ein Netz aus Partnern geworden, das von der Gastronomie bis zu Salzburger Institutionen reicht.",
          "Wir zeigen sie so, wie unser Feed aussieht, nicht wie eine Anzeige. Das ist kein Stil, sondern der Grund, warum es funktioniert: Eine Empfehlung wirkt nur, solange sie sich wie eine anfühlt.",
        ],
      },
      {
        titel: "Weil ein Feed vergisst",
        absaetze: [
          "Ein Beitrag auf Instagram ist nach zwei Tagen weg. Die gute Adresse, die Stelle, die gerade frei ist, der Ort, an dem schon einmal etwas versteckt war — all das verdient einen festen Platz. Deshalb gibt es jetzt diese Website: als Archiv und Schaufenster zu dem, was auf unseren Kanälen passiert.",
          "Am Ende ist die Antwort auf „Warum Salzburgsucht?\u201c ganz einfach: Weil wir hier leben, weil wir wissen wollen, was los ist — und weil es offensichtlich vielen anderen genauso geht.",
        ],
      },
    ],
  },
  {
    slug: "keine-messung-auf-dieser-seite",
    titel: "Diese Website misst dich nicht",
    beschreibung:
      "Kein Analysedienst, keine Werbe-Cookies, keine Datenbank. Was Salzburgsucht auf der Website über dich erfährt — und was nicht.",
    kategorie: "Hinter den Kulissen",
    publishedAt: "2026-09-11",
    auszug:
      "Kein Google Analytics, kein Pixel, keine Datenbank. Was hier tatsächlich passiert, wenn du die Seite aufmachst.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Auf den meisten Websites lädt beim Öffnen ein halbes Dutzend Dienste mit, die niemand bestellt hat. Bei uns ist das anders, und weil das inzwischen erklärungsbedürftig ist, hier einmal in Ruhe: Was passiert, wenn du salzburgsucht.at aufmachst?",
        ],
      },
      {
        titel: "Kein Analysedienst",
        absaetze: [
          "Es ist kein Google Analytics eingebunden, kein Meta-Pixel, kein TikTok-Pixel. Auch nicht abgeschaltet oder auf Zustimmung wartend — es ist schlicht keines da. In unserer Datenschutzerklärung steht deshalb der Satz, dass aktuell nichts geladen und nichts gemessen wird, und dass ein Dienst dort namentlich stünde, sobald sich das ändert.",
          "Das heißt auch: Wir wissen nicht, wie viele Leute diesen Beitrag hier lesen. Ehrlich gesagt fehlt uns das manchmal. Es ist trotzdem die richtige Reihenfolge — erst entscheiden, was man wirklich braucht, dann einbauen.",
        ],
      },
      {
        titel: "Keine Datenbank",
        absaetze: [
          "Hinter der Seite steht keine Datenbank. Die Verstecke, die Partnerbetriebe, die Stellen und diese Beiträge liegen als Dateien im Projekt. Es gibt nichts, worin Besucherdaten landen könnten, weil es gar nichts gibt, worin etwas landet.",
          "Die einzige Ausnahme ist die Kooperationsanfrage: Wenn du das Formular ausfüllst, wird daraus eine E-Mail an unser Postfach. Sie geht über den Mailserver unseres Hosters — kein Drittanbieter, kein Umweg, keine Kopie irgendwo.",
        ],
      },
      {
        titel: "Und die Karte?",
        absaetze: [
          "Die Salzburg-Karte auf der Startseite lädt ihre Kacheln von OpenFreeMap. Das ist ein fremder Server, und dabei sieht dessen Betreiber deine IP-Adresse — anders kann er die Daten nicht ausliefern. Deshalb steht die Karte in der Datenschutzerklärung mit eigenem Absatz.",
          "Damit diese Anfrage nicht bei jedem Besuch losgeht, lädt die Karte erst, wenn du weit genug nach unten gescrollt hast. Wer nie so weit kommt, löst sie auch nie aus.",
        ],
      },
      {
        titel: "Warum wir das erzählen",
        absaetze: [
          "Weil eine Datenschutzerklärung etwas ist, das man liest, wenn es schon zu spät ist. Die Entscheidungen dahinter kann man auch einfach hinschreiben.",
          "Und weil es beim nächsten Mal nachprüfbar sein soll: Wenn hier irgendwann doch gemessen wird, steht es in der Datenschutzerklärung — und dieser Beitrag wäre dann veraltet. Sag uns Bescheid, wenn er es ist.",
        ],
      },
    ],
  },
  {
    slug: "wie-die-salzburg-karte-funktioniert",
    titel: "Wie die Salzburg-Karte funktioniert — und warum sie manchmal ungenau ist",
    beschreibung:
      "37 Verstecke auf einer Karte, aber nicht alle metergenau. Warum wir die Ungenauigkeit dazuschreiben, statt sie zu verstecken.",
    kategorie: "Hinter den Kulissen",
    publishedAt: "2026-09-18",
    auszug:
      "Ein Marker sieht immer metergenau aus. Bei acht von 37 ist er es nicht — und die Karte sagt das dazu.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Auf unserer Startseite steht eine Karte mit 37 Punkten. Jeder Punkt ist ein Ort, an dem bei einer unserer Aktionen schon einmal etwas versteckt war. Was auf den ersten Blick wie eine simple Punktesammlung aussieht, hatte beim Bauen ein Problem, über das wir länger nachgedacht haben als über alles andere daran.",
        ],
      },
      {
        titel: "Ein Marker lügt von Natur aus",
        absaetze: [
          "Ein Punkt auf einer Karte behauptet immer dasselbe: genau hier. Bei siebzehn unserer Verstecke stimmt das auch — da kennen wir die Adresse. Bei sieben kennen wir nur die Straße. Bei acht nur den Stadtteil, und bei fünf nur die Gemeinde.",
          "Man könnte die Punkte trotzdem alle gleich zeichnen. Niemand würde es merken. Genau deshalb machen wir es nicht: Die Karte zeigt zu jedem Punkt die Genauigkeitsstufe, und wer auf einen Marker im Stadtteil Maxglan klickt, liest dort ausdrücklich, dass es die Mitte des Stadtteils ist und keine Adresse.",
        ],
      },
      {
        titel: "Woher die Koordinaten kommen",
        absaetze: [
          "Nicht aus dem Kopf. Jede Koordinate stammt aus OpenStreetMap und wurde einzeln nachgesehen, bevor sie in die Datei kam. Eine geratene Koordinate sieht auf einer Karte nämlich exakt so aus wie eine richtige — das ist das ganze Problem an geratenen Koordinaten.",
          "Drei Ortsnamen aus unserer ursprünglichen Liste gab es in Salzburg gar nicht. Aus der „Blindergasse\u201c wurde die Bindergasse in Maxglan, aus der „Schlossbrücke\u201c die Staatsbrücke, und die „Bergbräuhofstraße\u201c heißt in Wirklichkeit Bergerbräuhofstraße und liegt in Schallmoos, ein Stück nördlich hinter dem Porsche-Standort. Der letzte Punkt hat deshalb monatelang ganz ohne Marker in der Liste gestanden, bis der Name geklärt war.",
        ],
      },
      {
        titel: "Was die Karte bewusst nicht zeigt",
        absaetze: [
          "Ein laufendes Versteck steht dort nie. Die Karte ist ein Archiv, kein Hinweisgeber — sonst wäre das Suchen vorbei, bevor es angefangen hat.",
          "Dreißig der 37 Punkte liegen in der Stadt, sieben im Umland: Hallein, Oberalm, Puch, Bergheim, Viehhausen, Kleßheim und Wals-Siezenheim. An drei Orten war mehr als einmal etwas versteckt — Altstadt, Maxglan und Hauptbahnhof.",
        ],
      },
    ],
  },
  {
    slug: "salzburg-ist-groesser-als-die-getreidegasse",
    titel: "Salzburg ist größer als die Getreidegasse",
    beschreibung:
      "Unsere Verstecke verteilen sich über Lehen, Itzling, Gnigl, Taxham und das Umland. Ein Blick auf die Stadt jenseits der Postkartenansicht.",
    kategorie: "Community",
    publishedAt: "2026-09-25",
    auszug:
      "30 Verstecke in der Stadt, sieben im Umland — und die wenigsten davon dort, wo die Reisebusse halten.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Wenn Salzburg im Fernsehen vorkommt, sieht man drei Dinge: die Festung, den Dom und die Getreidegasse. Das ist nicht falsch, aber es ist ungefähr so vollständig wie eine Beschreibung von Wien, die beim Stephansdom aufhört.",
        ],
      },
      {
        titel: "Wo wir tatsächlich waren",
        absaetze: [
          "Unsere Verstecke sind über die ganze Stadt verteilt: Lehen, Itzling, Maxglan, Taxham, Liefering, Gnigl, Schallmoos, Nonntal, Aigen, die Elisabeth-Vorstadt, Mülln. Dazu Orte, die auf keiner Postkarte vorkommen und trotzdem jeder kennt, der hier wohnt — der Hauptbahnhof, das Europark, das LKH, der Überfuhrsteg.",
          "Sieben Verstecke lagen außerhalb der Stadt: in Hallein, Oberalm, Puch, Bergheim, Viehhausen, Kleßheim und Wals-Siezenheim. Salzburg hört an der Stadtgrenze nicht auf, und ein guter Teil unserer Community wohnt dort.",
        ],
      },
      {
        titel: "Warum das kein Zufall ist",
        absaetze: [
          "Es wäre einfacher, immer in die Altstadt zu gehen. Dort ist immer jemand, dort findet sich alles schnell, und die Bilder sehen gut aus. Nur bringt das niemanden irgendwohin, wo er nicht ohnehin schon war.",
          "Ein Versteck in Gnigl heißt, dass jemand in Gnigl aus der Tür geht und um die Ecke schaut. Manchmal steht er dabei zum ersten Mal seit Jahren bewusst an einer Straße, an der er sonst nur vorbeifährt. Das ist der eigentliche Punkt an der Sache — das Geld ist nur der Anlass.",
        ],
      },
      {
        titel: "Wo als Nächstes?",
        absaetze: [
          "Verraten wir nicht. Aber wer sich die Karte auf unserer Startseite ansieht, erkennt schnell, welche Ecken der Stadt bei uns noch fehlen. Vorschläge nehmen wir gerne — am besten als Nachricht auf Instagram.",
        ],
      },
    ],
  },
  {
    slug: "so-laeuft-eine-zusammenarbeit",
    titel: "Was passiert, wenn ihr uns schreibt",
    beschreibung:
      "Von der ersten Nachricht bis zum fertigen Beitrag: wie eine Zusammenarbeit mit Salzburgsucht abläuft und was wir dafür brauchen.",
    kategorie: "Hinter den Kulissen",
    publishedAt: "2026-10-02",
    auszug:
      "Kein Verkaufsgespräch, kein Paket mit drei Häkchen. Was nach der ersten Nachricht tatsächlich passiert.",
    abschnitte: [
      {
        titel: null,
        absaetze: [
          "Wir bekommen regelmäßig Nachrichten von Betrieben, die mit uns arbeiten wollen und nicht wissen, wie so etwas abläuft. Deshalb einmal der ganze Weg, von der ersten Nachricht bis zu dem Moment, in dem etwas online geht.",
        ],
      },
      {
        titel: "Erst die Frage, dann das Angebot",
        absaetze: [
          "Der erste Schritt ist eine Nachricht — über das Kooperationsformular auf der Website oder auf Instagram. Was wir darin brauchen, ist nicht der gewünschte Beitragstyp, sondern das Ziel: Neueröffnung? Eine Stelle, die seit Monaten offen ist? Ein Mittagsgeschäft, das nicht anläuft? Danach richtet sich alles Weitere.",
          "Preise stehen bewusst nicht auf der Website. Sie hängen an Umfang, Format und Zeitraum, und eine Zahl ohne diese drei Angaben wäre geraten. Nach dem ersten Gespräch bekommt ihr eine konkrete.",
        ],
      },
      {
        titel: "Was wir anbieten",
        absaetze: [
          "Drei Dinge machen wir dauerhaft: Social-Media-Promotion mit Posts und Story-Kampagnen auf unseren Kanälen, Reels und Videos, die wir selbst drehen und schneiden, und individuelle Kampagnen, wenn nichts davon passt.",
          "Dazu kommen vier Anlassfälle: Events ankündigen und am Tag selbst begleiten, Gastronomie und Locations so zeigen, dass Leute hingehen, Recruiting für offene Stellen — bei Menschen, die schon hier leben — und Gewinnspiele, die die Community tatsächlich bewegen.",
        ],
      },
      {
        titel: "Wie das Ergebnis aussieht",
        absaetze: [
          "Wie unser Feed. Das ist keine Stilfrage, sondern der Grund, warum es funktioniert: Ein Beitrag, der aussieht wie eine Anzeige, wird wie eine Anzeige weggescrollt. Deshalb drehen und schneiden wir selbst, statt fertiges Material zu übernehmen.",
          "Was wir nicht machen: Reichweitenzahlen versprechen. Wir können sagen, welche Formate wir produzieren und wie viele Menschen unseren Kanälen folgen. Was ein einzelner Beitrag erreicht, hängt an zu vielem, worauf niemand Einfluss hat — und eine Zusage, die man nicht halten kann, ist der schnellste Weg zu einer Zusammenarbeit, die nur einmal stattfindet.",
        ],
      },
    ],
  },
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

/**
 * Der heutige Tag als `JJJJ-MM-TT`, gerechnet in Salzburger Zeit.
 *
 * Nicht `new Date().toISOString()`: Das rechnet in UTC. Ein Beitrag fuer den
 * 12. September waere damit ab 12.09. 02:00 Salzburger Zeit da — und im
 * Winter ab 01:00. Der Unterschied faellt nur an einem einzigen Tag im Jahr
 * auf, naemlich dann, wenn jemand nachts darauf schaut; aber ein Datum, das
 * je nach Jahreszeit anders kippt, ist kein Datum.
 *
 * Die Sprache `sv-SE` steht hier, weil ihr Datumsformat bereits
 * `JJJJ-MM-TT` ist — das erspart das Zusammensetzen aus Einzelteilen.
 */
function heute(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Vienna" }).format(new Date());
}

/**
 * ALLE Beitraege, auch die noch nicht erschienenen.
 *
 * Fuer Werkzeuge gedacht (scripts/pruefe-blog.mts), nicht fuer Seiten. Wer
 * das hier in einer Komponente aufruft, stellt den Vorrat ins Schaufenster.
 */
export function getAlleBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Die veroeffentlichten Beitraege, neueste zuerst. */
export function getBlogPosts(): BlogPost[] {
  const stichtag = heute();
  return getAlleBlogPosts().filter((post) => post.publishedAt <= stichtag);
}

/**
 * Ein Beitrag, sofern er erschienen ist.
 *
 * Ein Beitrag aus dem Vorrat liefert `null` und damit eine 404-Seite — er
 * ist auch dann nicht erreichbar, wenn jemand die Adresse kennt oder raet.
 */
export function getBlogPost(slug: string): BlogPost | null {
  const stichtag = heute();
  return blogPosts.find((post) => post.slug === slug && post.publishedAt <= stichtag) ?? null;
}
