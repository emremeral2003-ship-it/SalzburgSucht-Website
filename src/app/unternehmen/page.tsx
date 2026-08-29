import type { Metadata } from "next";

import { AblaufZeitstrahl } from "@/components/home/ablauf-zeitstrahl";
import { FormatMockups } from "@/components/home/format-mockups";
import { PartnerGrid, ServiceCards, StatBadge } from "@/components/home/shared";
import { ButtonLink } from "@/components/ui/button";
import { Card, Container, SectionHeader } from "@/components/ui/layout";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export const metadata: Metadata = {
  title: "Werbung & Kooperationen in Salzburg",
  description:
    "Social-Media-Werbung, Content-Kooperationen, Event-Promotion und Recruiting über Salzburgsucht — mit einer gewachsenen lokalen Community.",
  alternates: { canonical: "/unternehmen" },
};

const leistungen = [
  "Social-Media-Werbung",
  "Content-Kooperation",
  "Event-Promotion",
  "Gastronomie- & Location-Marketing",
  "Gewinnspiele",
  "Recruiting",
  "Job-Inserate",
  "Individuelle Kampagnen",
];

export default function UnternehmenPage() {
  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-14 pb-16 sm:pt-18 sm:pb-20">
          <StatBadge />
          <h1 className="display display-l mt-7 max-w-[18ch]">
            Salzburg erreichen – dort, wo Salzburg hinschaut.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">
            Salzburgsucht verbindet eine gewachsene lokale Community mit
            Reichweite auf Instagram und TikTok. Für Unternehmen heißt das:
            Empfehlungen, Content, Events und Recruiting aus einer Hand — ohne
            Streuverlust.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/kooperation"
              size="lg"
              event={ANALYTICS_EVENTS.companyCtaClick}
              eventProps={{ cta_location: "unternehmen_hero" }}
            >
              Kooperation anfragen
            </ButtonLink>
            <ButtonLink href="#leistungen" size="lg" variant="secondary">
              Leistungen ansehen
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Leistungen */}
      <Container className="abschnitt" as="section" >
        <div id="leistungen" className="scroll-mt-24">
          <SectionHeader
            eyebrow="Leistungen"
            title="Was wir für euch machen"
            text="Von einem einzelnen Reel bis zur laufenden Zusammenarbeit über mehrere Monate."
          />
        </div>

        <div className="mt-10">
          <ServiceCards />
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          <h3 className="font-bold text-ink">Konkret buchbar</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {leistungen.map((leistung) => (
              <li key={leistung} className="pill">
                {leistung}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
            {/*
              Preise stehen bewusst nicht auf der Seite. Sie haengen an Umfang,
              Format und Zeitraum — eine Liste waere entweder falsch oder so
              breit, dass sie nichts sagt. Der Budgetrahmen im Formular ersetzt
              sie und liefert gleichzeitig die Daten, um die es in diesem Test
              geht.
            */}
            Preise hängen an Umfang, Format und Zeitraum. Gebt im Formular euren
            Budgetrahmen an — wir melden uns mit einem konkreten Vorschlag, der
            dazu passt.
          </p>
        </Card>
      </Container>

      {/* ---------------------------------------------------------- Formate */}
      <section className="buehne-klein border-y border-line">
        <Container className="abschnitt">
          <SectionHeader
            eyebrow="Formate"
            title="So sieht das nachher aus"
            text="Die drei Formate, die wir am häufigsten einsetzen. Meist kombiniert: Ein Reel für die Reichweite, eine Story für den Link, ein Post, der im Profil bleibt."
          />

          <div className="mt-10">
            <FormatMockups />
          </div>

          <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-muted">
            Die Ansichten sind Attrappen und zeigen den Aufbau, keine echten
            Beiträge. Reichweiten unterscheiden sich je Format, Thema und
            Zeitpunkt — belastbare Zahlen bekommt ihr nach jeder Kooperation
            für eure eigene Kampagne, nicht als Werbeversprechen vorab.
          </p>
        </Container>
      </section>

      {/* ------------------------------------------------ Warum (dunkel) */}
      <section className="bg-dark text-white">
        <Container className="abschnitt">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow text-primary">Warum Salzburgsucht</p>
              <h2 className="display display-m mt-3 max-w-[20ch]">
                Eine Community, die tatsächlich hier ist.
              </h2>
              <p className="mt-5 max-w-[52ch] leading-relaxed text-white/75">
                Unsere Follower kommen aus Stadt und Land Salzburg. Wer hier
                wirbt, erreicht Menschen, die morgen an eurem Geschäft
                vorbeigehen können — nicht irgendwen im deutschsprachigen Raum.
              </p>
              <div className="mt-8">
                <StatBadge tone="dunkel" />
              </div>
            </div>

            <ul className="grid gap-5">
              {[
                {
                  titel: "Content, der nicht nach Werbung aussieht",
                  text: "Wir produzieren im Stil unserer Kanäle. Das ist der Grund, warum es funktioniert.",
                },
                {
                  titel: "Auswertung nach jeder Kooperation",
                  text: "Reichweite, Interaktionen und Klicks bekommt ihr schriftlich.",
                },
                {
                  titel: "Ehrliche Einschätzung vorab",
                  text: "Wenn eure Idee zu unserer Community nicht passt, sagen wir das vor der Rechnung.",
                },
                {
                  titel: "Ein Ansprechpartner",
                  text: "Keine Agenturkette, keine Weiterleitung. Ihr redet mit den Leuten, die es umsetzen.",
                },
              ].map((punkt) => (
                <li key={punkt.titel} className="border-l-2 border-primary pl-5">
                  <h3 className="font-bold">{punkt.titel}</h3>
                  <p className="mt-1.5 leading-relaxed text-white/70">{punkt.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Ablauf */}
      <Container className="abschnitt" as="section">
        <SectionHeader
          eyebrow="So läuft es ab"
          title="Kooperation in vier Schritten"
          text="Vom ersten Formular bis zum fertigen Content vergehen in der Regel ein bis zwei Wochen."
        />
        <div className="mt-10">
          <AblaufZeitstrahl />
        </div>
      </Container>

      {/* --------------------------------------------------------- Partner */}
      <section className="border-y border-line bg-soft">
        <Container className="abschnitt">
          <SectionHeader
            eyebrow="Referenzen"
            title="Betriebe, mit denen wir gearbeitet haben"
            text="Eine Auswahl bisheriger Zusammenarbeiten aus Stadt und Land Salzburg."
          />
          <div className="mt-8">
            <PartnerGrid />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Schluss-CTA */}
      <Container className="abschnitt" as="section">
        <div className="rounded-card border border-line bg-page p-8 shadow-card sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="display display-m max-w-[22ch]">
                Erzählt uns, was ihr vorhabt.
              </h2>
              <p className="mt-4 max-w-[54ch] leading-relaxed text-muted">
                Fünf Minuten Formular: Idee, Ziel, Zeitraum, Budgetrahmen. Wir
                antworten in der Regel innerhalb von zwei Werktagen.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <ButtonLink
                href="/kooperation"
                size="lg"
                event={ANALYTICS_EVENTS.companyCtaClick}
                eventProps={{ cta_location: "unternehmen_footer_cta" }}
              >
                Kooperation anfragen
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
