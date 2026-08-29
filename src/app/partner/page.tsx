import type { Metadata } from "next";

import { PartnerGrid } from "@/components/home/shared";
import { KarteSpaeter } from "@/components/karte/karte-spaeter";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/layout";
import { partners } from "@/data/partners";

export const metadata: Metadata = {
  title: "Partner",
  description:
    "Betriebe und Institutionen aus Stadt und Land Salzburg, mit denen Salzburgsucht bereits zusammengearbeitet hat.",
  alternates: { canonical: "/partner" },
};

export default function PartnerPage() {
  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-12 pb-12 sm:pt-16 sm:pb-14">
          <p className="eyebrow">Partner</p>
          <h1 className="display display-l mt-3 max-w-[18ch]">
            Mit wem wir schon gearbeitet haben
          </h1>
          <p className="num mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
            {partners.length} Betriebe und Institutionen aus Stadt und Land
            Salzburg — von der Bäckerei bis zur Interessenvertretung.
          </p>
        </Container>
      </section>

      {/* Die Karte steht VOR der Namensliste, nicht danach.

          Eine Liste von vierundzwanzig Namen beantwortet die Frage "mit wem?".
          Die Karte beantwortet "wo?" — und das ist bei einer Marke, deren
          ganzes Versprechen "aus Salzburg, fuer Salzburg" lautet, die
          wichtigere der beiden Antworten. Wer zuerst sieht, dass die Punkte
          ueber die ganze Stadt und ins Umland reichen, liest die Namensliste
          danach anders. */}
      <Container className="abschnitt pb-0">
        <div className="mx-auto max-w-[56ch] text-center">
          <p className="eyebrow">Auf der Karte</p>
          <h2 className="display display-m mt-3 text-ink">Wo wir schon gearbeitet haben</h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">
            Von der Altstadt bis nach Elixhausen. Ein Betrieb in der Liste
            springt auf der Karte an — und umgekehrt.
          </p>
        </div>

        <div className="mt-10">
          <KarteSpaeter art="partner" />
        </div>
      </Container>

      <Container className="abschnitt">
        <PartnerGrid />

        {/*
          Logos statt Namen erst nach schriftlicher Freigabe. Fremde Logos aus
          dem Netz zu ziehen ist eine Markenrechtsverletzung — und faellt genau
          bei den Unternehmen auf, die man als Referenz nennen will.
        */}
        <p className="mt-10 max-w-[62ch] rounded-card border border-dashed border-line-strong bg-soft px-5 py-4 text-sm leading-relaxed text-muted">
          <strong className="font-semibold text-ink">Hinweis zur Darstellung:</strong>{" "}
          Hier stehen vorerst nur Namen. Logos werden ergänzt, sobald die
          jeweilige Freigabe vorliegt — ungefragt verwendete Logos wären
          rechtlich heikel und gegenüber den Betrieben unfair.
        </p>
      </Container>

      <section className="border-t border-line bg-soft">
        <Container className="abschnitt">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
            <SectionHeader
              title="Ihr wollt dazugehören?"
              text="Erzählt uns, was ihr vorhabt — wir melden uns mit einer ehrlichen Einschätzung."
            />
            <div className="lg:justify-self-end">
              <ButtonLink href="/kooperation" size="lg">
                Kooperation anfragen
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
