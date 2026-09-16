import type { Metadata } from "next";

import { AblaufZeitstrahl } from "@/components/home/ablauf-zeitstrahl";
import { ContentReihe } from "@/components/home/content-reihe";
import { HeroLicht } from "@/components/home/hero-licht";
import { LeistungsSchau } from "@/components/home/leistungs-schau";
import {
  PartnerMarquee,
  PartnerZahl,
  StatBadge,
  ZahlenBand,
} from "@/components/home/shared";
import { KarteSpaeter } from "@/components/karte/karte-spaeter";
import { JobHeroPanel } from "@/components/jobs/job-hero-panel";
import { SocialLinks } from "@/components/layout/social-links";
import { ArrowRight, Check } from "@/components/icons";
import { RiesenWort, Wolke } from "@/components/ui/ambient";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/motion";
import {
  SignalFeld,
  SignalPunkt,
  SignalSpur,
  SignalStart,
  SignalWelle,
} from "@/components/ui/signal";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { partnerBranchen } from "@/data/partners";
import { getFeaturedJobs } from "@/lib/db/jobs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Salzburgsucht – Entdecke Salzburg",
  description: site.description,
  alternates: { canonical: "/" },
};

/**
 * Startseite.
 *
 * Die Hierarchie ist die eigentliche Gestaltungsentscheidung. Der erste
 * Eindruck soll sein: eine moderne lokale Marke mit grosser Community. Der
 * zweite, fuer Unternehmen: hier koennte ich werben. Und erst der dritte:
 * ah, die zeigen auch ein paar Jobs.
 *
 * Deshalb sitzen die Jobs als kompaktes Deck im Hero statt in einem eigenen
 * Abschnitt weiter unten — sichtbar, aber im Nebensatz. Ueber die ganze Seite
 * gerechnet liegt die Gewichtung bei rund 40 Prozent Agentur, 35 Prozent
 * Community und Entdecken, 15 Prozent Partner und Belege, 10 Prozent Jobs.
 *
 * Der Beleg zu alldem ist die Karte im dritten Abschnitt: eine Karte, zwei
 * Ebenen — wo etwas versteckt war und mit wem gearbeitet wurde. Sie steht
 * dort, wo vorher die Suchwand sass, und ersetzt zugleich die frueher eigene
 * Versteck-Karte weiter unten. Eine Karte pro Seite; zwei waeren dieselbe
 * Aussage zweimal.
 *
 * ---------------------------------------------------------------------------
 * Der Rhythmus der Flaechen
 * ---------------------------------------------------------------------------
 * Ton         Abschnitt                       Uebergang zum naechsten
 * ----------- ------------------------------- ---------------------------
 * getönt      Hero                            weiche Kante
 * weiß        Salzburgsucht in Zahlen         Schale
 * NAVY        Salzburg-Karte                  Schale
 * weiß        Gerade in Salzburg              weiche Kante
 * getönt      Leistungen                      Schale
 * weiß        Ablauf                          weiche Kante
 * off-white   Partner                         —
 * hellblau    Community                       Schale
 * NAVY        Abschluss                       Schale
 *
 * Zwei dunkle Flaechen als Anker, dazwischen Luft. Waeren es mehr, verloeren
 * sie ihre Wirkung. Zwischen zwei hellen Toenen steht nie eine Trennlinie:
 * Entweder legt sich der folgende Abschnitt mit grossen Eckradien darueber
 * (`schale`) oder der Uebergang laeuft als sehr schwacher Verlauf aus
 * (`kante-oben` / `kante-unten`).
 *
 * ---------------------------------------------------------------------------
 * Der Rhythmus des Signals
 * ---------------------------------------------------------------------------
 * Ueber diesen Flaechen liegt das Salzburg-Signal (src/components/ui/signal.tsx).
 * Es ist kein Effekt pro Abschnitt, sondern eine Reise mit einer Dramaturgie —
 * und die besteht zur Haelfte aus Stellen, an denen bewusst nichts passiert:
 *
 *   Hero              Konturen schalten sich ein, der Beacon meldet sich
 *   Zahlen            Radar oeffnet sich, die Spur laeuft weiter          ↑
 *   Salzburg-Karte    zwei Ringe laufen ueber die Stadt — lautester Moment ▲
 *   Gerade in Salzburg  eine Route laeuft hinter den Karten durch         ↓
 *   Leistungen        ein einzelner Ring hinter der Vorschau              ↓
 *   Ablauf            nichts. Ruhepunkt.                                  —
 *   Partner           waagrechte Spuren: das lokale Netz                  ↑
 *   Community         eine grosse Welle geht einmal nach aussen           ▲
 *   Abschluss         alles laeuft in einen letzten Punkt zusammen        ↓
 *
 * Wer die Spalte rechts von oben nach unten liest, sieht den ganzen Auftrag:
 * Bewegung, Ruhe, Bewegung, Ruhe, ein staerkerer Moment, Ruhe. Ohne den
 * leeren Ablauf-Abschnitt in der Mitte waere die Community-Welle nur die
 * naechste Animation statt ein Moment.
 *
 * Die Deckkraft liegt ueberall zwischen zwei und sechs Prozent. Wer den
 * Hintergrund bewusst bemerkt, sieht nicht mehr den Inhalt — im Zweifel
 * schwaecher.
 */
export default async function HomePage() {
  const jobs = await getFeaturedJobs(3);

  return (
    <>
      {/* ------------------------------------------------------------- Hero */}
      <section className="buehne raster raster-licht relative isolate overflow-hidden">
        {/* Licht, das der Maus mit Nachlauf folgt. Nur Desktop, siehe CSS. Es
            steht ausserhalb der Signalhuelle, weil es seine Zeigerereignisse
            an sein Elternelement haengt — und das muss der Abschnitt sein.

            `raster-licht` gehoert dazu: Der Abschnitt traegt ein zweites,
            kraeftigeres Punktraster, das nur unter dem Licht sichtbar wird.
            Der Cursor macht damit keinen blauen Fleck, sondern legt die
            Struktur frei, die ohnehin da ist. */}
        <HeroLicht />

        {/* Der Signature Moment: Diese Ebene schaltet sich nach dem Laden
            einmal ein — Konturen, Beacon, ein ausgesendeter Ring. Nach rund
            anderthalb Sekunden ist wieder Ruhe. Kein Vorspann, kein Ladebild;
            die Flaeche geht einfach in Betrieb. */}
        <SignalStart>
          <SignalFeld
            art="kontur"
            className="inset-0"
            deckkraft={0.09}
            staerke={0.028}
          />
          {/* Dieselbe Zeichnung ein zweites Mal und viermal so kraeftig — aber
              nur dort sichtbar, wo das Zeigerlicht gerade steht, und nur
              solange die Maus im Abschnitt ist. Weil beide Ebenen dieselbe
              Zeichnung an derselben Stelle sind, gibt es keine Kante zwischen
              beleuchtet und unbeleuchtet, sondern nur mehr oder weniger
              Kontrast. Deckkraft und Maske stehen im Stylesheet, nicht hier —
              siehe `reagiert` in signal.tsx. */}
          <SignalFeld
            art="kontur"
            className="signal-reagiert inset-0"
            staerke={0.028}
            reagiert
          />

          {/* Die Spur verlaesst den Hero nach unten und wird im naechsten
              Abschnitt wieder aufgenommen. Die Seite hat damit keine Kante
              zwischen den beiden, sondern eine Fortsetzung.

              Der Punkt (342|100) im Zeichenraster ist kein beliebiger Wert:
              Dort sitzt der Beacon. Die Spur laeuft also durch ihn hindurch
              statt irgendwo an ihm vorbei. Umgerechnet auf den Abschnitt sind
              das 57 Prozent von links und 74 Prozent von oben — dieselben
              Zahlen stehen unten an der Position des Punktes. Ein Beacon, der
              neben seiner Linie schwebt, ist Dekoration; einer, der auf ihr
              sitzt, ist ein Signal. */}
          <SignalSpur
            d="M-10 26 C 120 58, 210 118, 342 100 S 520 108, 610 182"
            viewBox="0 0 600 200"
            className="inset-x-0 bottom-0 h-[52%]"
            deckkraft={0.4}
          />

          {/* Auf dem Telefon steht der Beacon oben rechts neben der
              Reichweiten-Marke, weil die Spalte darunter dort dicht ist. Zwei
              Positionen statt einer: Eine Stelle, die auf beiden Breiten
              passt, sitzt auf keiner von beiden gut. */}
          <SignalPunkt
            className="top-[6%] right-[9%] lg:hidden"
            groesse={8}
            verzug={420}
          />
          <SignalPunkt
            className="top-[74%] left-[57%] hidden lg:block"
            groesse={11}
            verzug={420}
          />

          <Wolke
            className="top-[-8rem] right-[-6rem] size-[26rem]"
            staerke={0.16}
          />
          <Wolke
            className="bottom-[-12rem] left-[-8rem] size-[22rem]"
            farbe="rgba(58, 148, 232, 0.35)"
            staerke={0.09}
          />
          <RiesenWort
            text="SALZBURG"
            className="bottom-[-2.5rem] left-[-1rem] hidden md:block"
          />
        </SignalStart>

        <Container className="pt-12 pb-20 sm:pt-16 sm:pb-28 xl:pt-20 xl:pb-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_23rem] lg:gap-16 xl:grid-cols-[1.2fr_25rem]">
            <div>
              <StatBadge />

              <h1 className="display display-xl mt-7 max-w-[13ch]">
                Salzburg entdeckt man{" "}
                <span className="relative whitespace-nowrap">
                  hier.
                  {/* Handstrich unter dem letzten Wort — traegt die
                      Markenfarbe an die betonteste Stelle der Seite. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-[0.14em] rounded-full bg-primary sm:-bottom-2"
                  />
                </span>
              </h1>

              <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-muted sm:text-xl">
                Salzburgsucht verbindet lokale Community, Unternehmen, Events,
                Gastronomie und Geschichten aus Salzburg — an einem Ort.
              </p>

              {/* Der Unternehmens-CTA ist der wichtigere von beiden und steht
                  deshalb vorne und als volle Schaltflaeche. */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/kooperation"
                  size="lg"
                  event={ANALYTICS_EVENTS.companyCtaClick}
                  eventProps={{ cta_location: "hero" }}
                >
                  Kooperation anfragen
                  <ArrowRight className="cta-pfeil size-4" />
                </ButtonLink>
                <ButtonLink
                  href="/#entdecken"
                  size="lg"
                  variant="secondary"
                  event={ANALYTICS_EVENTS.communityCtaClick}
                  eventProps={{ cta_location: "hero" }}
                >
                  Salzburg entdecken
                </ButtonLink>
              </div>
            </div>

            {/* Jobs: rechts als schwebendes Deck, auf schmalen Geraeten unter
                dem Hero. Nie dazwischen gequetscht.

                Hier stand zwischenzeitlich eine Karte. Sie ist wieder raus:
                Der Hero hat genau eine Aufgabe — sagen, was diese Marke ist —
                und eine Karte daneben beantwortet eine Frage, die an dieser
                Stelle noch niemand gestellt hat. Die Karte steht jetzt weiter
                unten, wo sie hingehoert, und ist dort das Ereignis der Seite. */}
            <JobHeroPanel jobs={jobs} />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------ Salzburgsucht in Zahlen */}
      <section className="kante-oben relative isolate overflow-hidden">
        {/* Aus den Konturen des Heros wird hier ein Radar. Es liegt bewusst
            angeschnitten am Rand: Der Abschnitt hat aussen viel freien Raum,
            und der soll grosszuegig aussehen und nicht leer — ohne dass dort
            eine weitere Karte steht, die niemand braucht.

            Es steht links, obwohl der freie Raum rechts groesser waere. Der
            Grund liegt drei Abschnitte weiter unten: Dort sitzt das zweite
            Radar hinter der Leistungsvorschau, und das muss rechts stehen.
            Zwei angeschnittene Kreise auf derselben Seite waeren aus einem
            Motiv eine Masche geworden. */}
        <SignalFeld
          art="radar"
          className="top-[3rem] left-[-15rem] size-[40rem] sm:left-[-11rem]"
          deckkraft={0.09}
          staerke={0.035}
        />
        {/* Das Ereignis dieses Abschnitts steckt nicht in einer eigenen Welle,
            sondern im Zaehler selbst: Wenn die Zahl am Ziel ankommt, gehen
            zwei Ringe aus ihr heraus (`.zahl-fertig` im Stylesheet).

            Hier stand kurzzeitig eine zusaetzliche grosse Welle. Sie ist
            wieder raus, weil ihr aeusserer Ring quer durch die Ueberschrift
            lief — nachgemessen, nicht geschaetzt. Und weil sie dasselbe zweimal
            gesagt haette: Der Abschnitt hat genau ein Ereignis, und das ist
            die Zahl. */}

        {/* Die Fortsetzung der Hero-Spur, hinueber in die Mitte des Radars. */}
        <SignalSpur
          d="M-10 6 C 110 78, 230 26, 356 104 S 520 168, 610 138"
          viewBox="0 0 600 200"
          className="inset-x-0 top-0 h-[62%]"
          deckkraft={0.42}
          von={0.05}
          bis={0.5}
        />

        <Wolke
          className="top-[6rem] right-[-10rem] size-[26rem] opacity-50"
          farbe="rgba(128, 189, 255, 0.4)"
          staerke={0.13}
        />

        <Container className="abschnitt">
          <Reveal>
            <SectionHeader
              eyebrow="Salzburgsucht in Zahlen"
              title="Eine Stadt, eine Community, ein Kanal."
              text="Salzburgsucht ist auf Instagram und TikTok gewachsen: mit Lokaltipps, Events, Aktionen und allem, was hier gerade läuft."
            />
          </Reveal>

          <div className="mt-10">
            <ZahlenBand />
          </div>
        </Container>
      </section>

      {/* ---------------------------------------- Die Salzburg-Karte */}
      {/* Hier stand die Suchwand ("Salzburg sucht ein neues Lokal"). Sie war
          ein Wortspiel und hat nichts belegt. An derselben Stelle steht jetzt
          etwas, das dasselbe sagt und es beweist: die Karte mit allem, was
          diese Marke in Salzburg bisher gemacht hat.

          Der Platz ist mit Absicht derselbe. Es ist die dritte Flaeche der
          Seite, die erste dunkle, und damit die Stelle, an der die Seite
          einmal laut werden darf. Genau dort sass vorher der lauteste Moment
          des Signals — er bleibt, nur traegt ihn jetzt die Karte.

          Bewusst ohne zusaetzliche Signalebene dahinter: Die Karte bringt
          Linien, Flaechen und Marker mit. Eine Spur oder ein Radar hinter ihr
          waeren die zweite Zeichnung im selben Bild, und beide verloeren. Die
          zwei Ringe beim Erscheinen kommen aus der Karte selbst. */}
      {/* Der Anker heisst "entdecken" und nicht "karte": Darauf zeigen die
          Hauptnavigation und der zweite Handlungsaufruf im Hero, seit die
          Suchwand hier sass. Die Karte ist der bessere Landeplatz fuer
          "Salzburg entdecken", als die Suchwand es je war. */}
      <section
        id="entdecken"
        className="buehne-nacht schale auf-dunkel relative isolate overflow-hidden text-white"
      >
        <Container className="abschnitt">
          <Reveal className="max-w-[52ch]">
            <p className="eyebrow eyebrow-hell">Salzburg-Karte</p>
            <h2 className="display display-m mt-3">
              Wo wir in Salzburg schon waren
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/70 sm:text-lg">
              Jeder Punkt ist eine Stelle, an der bei unseren Aktionen schon
              etwas versteckt war — und rechts steht jedes Versteck zum
              Nachschlagen.
            </p>
          </Reveal>

          {/* Nicht in <Reveal>: Die Karte rechnet ihren Ausschnitt aus der
              gemessenen Feldbreite. Ein Elternteil, das waehrend des
              Einblendens noch verschoben ist, waere eine Fehlerquelle ohne
              jeden Gegenwert. */}
          <div className="mt-10">
            <KarteSpaeter art="netz" />
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------- Gerade in Salzburg */}
      <section className="relative isolate overflow-hidden">
        {/* Eine Route, die hinter den Karten durchlaeuft. Sie zeichnet sich
            beim Scrollen und ist in den Luecken zwischen den Karten sichtbar —
            nie ueber einem Bild oder einem Text, weil die ganze Signalebene
            hinter dem Inhalt liegt. */}
        {/* Anders als im Hero endet die Spur hier — und zwar genau am Beacon
            (516|12 im Zeichenraster, das sind 86 Prozent von links und 9
            Prozent von oben). Das ist die Aussage des Abschnitts als Bewegung:
            gesucht, gefunden, angekommen. */}
        <SignalSpur
          d="M-10 176 C 120 150, 190 58, 318 66 S 452 96, 516 12"
          viewBox="0 0 600 200"
          className="inset-x-0 top-[4%] h-[86%]"
          deckkraft={0.4}
          von={0.08}
          bis={0.66}
        />
        {/* Am Ende der Route sendet der Knoten einmal — das Ereignis dieses
            Abschnitts. Vorher stand er still, und ein Punkt, der am Ende einer
            Linie einfach nur daliegt, erzaehlt nicht, dass dort etwas
            ankommt. */}
        <SignalPunkt
          className="top-[9%] left-[86%] hidden md:block"
          groesse={9}
        />

        <Wolke
          className="top-[-4rem] right-[-8rem] size-[28rem] opacity-60"
          farbe="rgba(58, 148, 232, 0.28)"
          staerke={0.15}
        />

        <Container className="abschnitt">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow="Aktuell"
              title="Gerade in Salzburg"
              text="Neueröffnungen, Aktionen und Termine aus Salzburg — kurz zusammengefasst."
            />
            <SocialLinks ort="home_content" variante="rund-hell" />
          </Reveal>

          <div className="mt-10">
            <ContentReihe />
          </div>
        </Container>
      </section>

      {/* --------------------------------------------- Leistungen (Agentur) */}
      <section className="buehne-klein schale relative isolate overflow-hidden">
        {/* Nur noch ein einzelner, sehr schwacher Radarkreis hinter der
            Vorschauspalte. Hier stand vorher zusaetzlich ein riesiges
            Hintergrundwort — es war das vierte auf der Seite, und damit war
            das Mittel kein Akzent mehr, sondern eine Gewohnheit. */}
        <SignalFeld
          art="radar"
          className="top-[7rem] right-[-14rem] size-[38rem] lg:right-[-9rem]"
          deckkraft={0.085}
          staerke={0.025}
        />

        <Wolke
          className="right-[-6rem] bottom-[-8rem] size-[24rem] opacity-70"
          staerke={0.11}
        />

        <Container className="abschnitt">
          <Reveal>
            <SectionHeader
              eyebrow="Für Unternehmen"
              title="Was wir für euch machen"
              text="Von einem einzelnen Reel bis zur laufenden Zusammenarbeit über mehrere Monate — alles über einen Kanal mit Gesicht."
            />
          </Reveal>

          <div className="mt-10">
            <LeistungsSchau />
          </div>

          <Reveal className="mt-12 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/kooperation"
              size="lg"
              event={ANALYTICS_EVENTS.companyCtaClick}
              eventProps={{ cta_location: "home_services" }}
            >
              Kooperation anfragen
              <ArrowRight className="cta-pfeil size-4" />
            </ButtonLink>
            <ButtonLink href="/unternehmen" size="lg" variant="secondary">
              Alle Leistungen ansehen
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------ Ablauf, 4 Schritte */}
      {/* Der Ruhepunkt der Seite. Hier gibt es kein Signal — keine Spur, kein
          Radar, keinen Beacon. Nur das grosse Wort im Hintergrund und die
          Prozesslinie, die sich beim Scrollen fuellt. Das ist Absicht: Ohne
          eine Stelle, an der nichts passiert, ist der naechste Moment, an dem
          etwas passiert, keiner mehr. */}
      <section className="kante-oben relative isolate overflow-hidden">
        <RiesenWort
          text="LOCAL."
          className="top-[3rem] right-[-3rem] hidden md:block"
        />

        <Container className="abschnitt">
          <Reveal>
            <SectionHeader
              eyebrow="So läuft es ab"
              title="Kooperation in vier Schritten"
              text="Kein langer Vorlauf, keine Agenturschleife. Ihr wisst vorher, was passiert."
            />
          </Reveal>

          <div className="mt-12">
            <AblaufZeitstrahl />
          </div>

          <Reveal className="mt-12">
            <ButtonLink
              href="/unternehmen"
              variant="ghost"
              event={ANALYTICS_EVENTS.companyCtaClick}
              eventProps={{ cta_location: "home_ablauf" }}
            >
              Mehr für Unternehmen
              <ArrowRight className="cta-pfeil size-4" />
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* ----------------------------------------------------------- Partner */}
      <section className="abschnitt relative isolate overflow-hidden bg-soft">
        {/* Waagrechte Spuren mit einzelnen Knoten — das lokale Netz als Bild.
            Bewusst parallel und ohne Querverbindungen: Sobald Linien zwischen
            den Betrieben laufen, entsteht ein Diagramm, und ein Diagramm zieht
            den Blick von den Namen weg, um die es hier geht. */}
        <SignalFeld
          art="spuren"
          className="inset-x-0 top-[30%] h-[18rem]"
          deckkraft={0.09}
          staerke={0.02}
        />

        {/* Das Ereignis dieses Abschnitts: Das Signal teilt sich in zwei
            waagrechte Spuren, die beim Scrollen nebeneinander durchlaufen.
            Zwei statt einer, weil die Aussage hier "Netz" ist und nicht
            "Weg" — und bewusst ohne Querverbindungen, sonst entstuende ein
            Diagramm, das vom Social Proof ablenkt.

            Die zweite laeuft etwas spaeter los (`von`), damit sie sich
            versetzt zeichnen. Gleichzeitig waeren es zwei Striche, versetzt
            sind es zwei Signale. */}
        <SignalSpur
          d="M-10 40 C 200 26, 420 58, 610 34"
          viewBox="0 0 600 100"
          className="inset-x-0 top-[36%] h-[9rem]"
          deckkraft={0.34}
          von={0.1}
          bis={0.58}
        />
        <SignalSpur
          d="M-10 62 C 220 78, 460 44, 610 70"
          viewBox="0 0 600 100"
          className="inset-x-0 top-[42%] h-[9rem]"
          deckkraft={0.26}
          von={0.18}
          bis={0.68}
        />

        <Container>
          <Reveal className="mx-auto max-w-[54ch] text-center">
            <p className="eyebrow">Partner</p>
            <h2 className="display display-m mt-3 text-ink">
              Betriebe, mit denen wir gearbeitet haben
            </h2>
            {/* Die Zahl ist gezaehlt, nicht behauptet — sie kommt aus der
                Laenge der Partnerliste. Genau deshalb darf sie hier stehen,
                waehrend jede Reichweiten- oder Ergebniszahl fehlt. */}
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">
              <PartnerZahl /> Betriebe und Institutionen aus Stadt und Land
              Salzburg — von der Bäckerei bis zur Kammer.
            </p>

            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {partnerBranchen.map((branche) => (
                <li key={branche} className="pill">
                  {branche}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>

        <div className="mt-12">
          <PartnerMarquee />
        </div>

        <Container className="mt-10 flex justify-center">
          <ButtonLink href="/partner" variant="ghost">
            Alle Partner ansehen
            <ArrowRight className="cta-pfeil size-4" />
          </ButtonLink>
        </Container>
      </section>

      {/* ------------------------------------------------------- Community */}
      {/* Hier sass bis 28.08.2026 das Anmeldeformular. Es ist auf Wunsch raus
          — samt dem zweispaltigen Raster, das nur dafuer da war. Der
          Abschnitt sagt jetzt dasselbe ohne Formular: Was es gibt, und wo es
          laeuft. Zum Zurueckholen siehe Kommentar in
          src/app/community/page.tsx. */}
      <section
        id="anmeldung"
        className="schale relative isolate scroll-mt-20 overflow-hidden bg-primary-soft"
      >
        {/* Die Welle. Sie geht genau einmal nach aussen, wenn der Abschnitt
            zum ersten Mal ins Bild kommt, und bleibt danach als ruhige
            konzentrische Form stehen. Die Assoziation ist die Aussage des
            Abschnitts: Da draussen waechst etwas. */}
        <SignalWelle
          className="top-[16%] left-[-7rem] size-[38rem] sm:left-[1rem] lg:size-[46rem]"
          dauer={2800}
          verzug={180}
        />

        <Wolke
          className="top-[-10rem] left-[-6rem] size-[26rem] opacity-70"
          staerke={0.12}
        />
        <Wolke
          className="right-[-8rem] bottom-[-6rem] size-[20rem] opacity-60"
          farbe="rgba(58, 148, 232, 0.3)"
          staerke={0.08}
        />

        <Container className="abschnitt">
          <div className="max-w-[58ch]">
            <Reveal>
              <SectionHeader
                eyebrow="Für die Community"
                title="Dein Salzburg. Jeden Tag."
                text="Alles, was hier steht, läuft zuerst über unsere Kanäle — Lokale, Events, Aktionen und ausgewählte Stellen."
              />

              {/* Vier Zeilen, was man davon hat. Sie standen frueher vor dem
                  Anmeldeformular; das ist raus (siehe Kommentar am
                  Abschnitt), die Zeilen tragen den Abschnitt weiterhin. */}
              <ul className="mt-8 grid gap-3">
                {[
                  "Jobs früher entdecken",
                  "Neue Lokale finden, bevor es die Runde macht",
                  "Events nicht verpassen",
                  "Gewinnspiele und Aktionen mitbekommen",
                ].map((zeile) => (
                  <li key={zeile} className="flex items-center gap-3 text-ink">
                    <span
                      aria-hidden
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-ink"
                    >
                      <Check className="size-3.5" />
                    </span>
                    {zeile}
                  </li>
                ))}
              </ul>

              {/* Hier stand einmal zusaetzlich die Reichweiten-Marke. Sie ist
                  raus: Die Zahl kam damit viermal auf einer Seite vor, und
                  an dieser Stelle war sie das schwaechste Argument. Wer sich
                  anmeldet, tut es wegen der vier Zeilen darueber — nicht,
                  weil andere es auch tun. */}
              <div className="mt-8">
                <SocialLinks ort="home_community" variante="breit" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- Abschluss-CTA */}
      <section className="buehne-nacht netz auf-dunkel schale relative isolate overflow-hidden text-white">
        {/* Dieselbe Mechanik wie im Hero, aufhellend statt einfaerbend. Damit
            schliesst die Seite mit demselben Detail, mit dem sie beginnt. */}
        <HeroLicht variante="dunkel" />

        {/* Das Ende der Reise: Die letzte Spur laeuft von links unten nach
            rechts oben und endet exakt dort, wo der Beacon steht — Endpunkt
            des Pfades und Mittelpunkt des Punktes sind dieselbe Koordinate,
            nicht zwei, die ungefaehr zusammenpassen. Von dort geht ein
            letzter, sehr langsamer Ring nach aussen. Danach ist Schluss. */}
        <SignalSpur
          d="M-10 366 C 130 322, 254 238, 372 198 S 440 160, 468 152"
          className="inset-0"
          deckkraft={0.5}
          ton="hell"
          von={0.06}
          bis={0.56}
        />
        <SignalWelle
          className="top-[38%] left-[78%] size-[32rem] -translate-x-1/2 -translate-y-1/2 lg:size-[40rem]"
          ton="hell"
          dauer={3200}
          verzug={620}
        />
        <SignalPunkt
          className="top-[38%] left-[78%]"
          groesse={12}
          ton="dunkel"
          verzug={520}
        />

        <RiesenWort
          text="DISCOVER"
          className="riesenwort-hell top-[1.5rem] left-[-2rem] hidden md:block"
        />

        <Container className="abschnitt">
          <Reveal className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
            <div>
              <p className="eyebrow eyebrow-hell">Für Unternehmen</p>
              <h2 className="display display-l mt-6 max-w-[16ch] text-white">
                Deine Marke.{" "}
                <span className="text-primary">Unsere Community.</span>
              </h2>
              {/* Die Zahl noch einmal, direkt unter dem Versprechen. Der
                  Abschluss ist die letzte Stelle, an der sich ein Unternehmen
                  entscheidet — dort soll neben der Behauptung das eine
                  belegte Argument stehen und nicht nur ein Knopf. */}
              <div className="mt-7">
                <StatBadge tone="dunkel" />
              </div>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/75">
                Du möchtest dein Unternehmen, Event, Restaurant, Produkt oder
                eine offene Stelle in Salzburg sichtbar machen? Schick uns Idee,
                Ziel und Budgetrahmen — wir melden uns mit einer ehrlichen
                Einschätzung. Auch dann, wenn es nicht passt.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <ButtonLink
                href="/kooperation"
                size="lg"
                variant="onDark"
                event={ANALYTICS_EVENTS.companyCtaClick}
                eventProps={{ cta_location: "home_footer_cta" }}
              >
                Kooperation anfragen
                <ArrowRight className="cta-pfeil size-4" />
              </ButtonLink>
              <ButtonLink href="/unternehmen" size="lg" variant="onDarkGhost">
                Mehr für Unternehmen
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
