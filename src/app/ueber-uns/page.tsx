import type { Metadata } from "next";

import { StatBadge } from "@/components/home/shared";
import { SocialLinks } from "@/components/layout/social-links";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Über Salzburgsucht",
  description:
    "Wie aus einem Salzburger Social-Media-Kanal eine lokale Community und Medienplattform wurde.",
  alternates: { canonical: "/ueber-uns" },
};

export default function UeberUnsPage() {
  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-12 pb-12 sm:pt-16 sm:pb-14">
          <p className="eyebrow">Über uns</p>
          <h1 className="display display-l mt-3 max-w-[18ch]">
            Angefangen hat alles im Feed.
          </h1>
          <div className="mt-7">
            <StatBadge />
          </div>
        </Container>
      </section>

      <Container className="abschnitt">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="max-w-[62ch]">
            <div className="space-y-5 text-lg leading-relaxed text-muted">
              <p>
                Salzburgsucht ist auf Instagram und TikTok entstanden — mit dem,
                was Menschen hier ohnehin ständig suchen: Wo ist es gerade gut?
                Was ist am Wochenende los? Wer stellt gerade ein?
              </p>
              <p>
                Aus einzelnen Beiträgen wurde eine Community aus Menschen, die
                in Stadt und Land Salzburg wohnen, hier einkaufen und hier
                ausgehen. Betriebe haben irgendwann von selbst angefragt, ob wir
                über sie berichten — daraus sind die ersten Kooperationen
                entstanden.
              </p>
              <p>
                Diese Website ist der nächste Schritt: ein fester Ort für
                Empfehlungen, Kooperationen und ausgewählte Stellen, statt nur
                Beiträge, die im Feed nach zwei Tagen weg sind.
              </p>
            </div>

            <div className="mt-12">
              <SectionHeader eyebrow="Wohin es geht" title="Was als Nächstes kommt" />
              <ul className="mt-6 grid gap-4">
                {[
                  {
                    titel: "Jetzt",
                    text: "Diese Seite bündelt Community, Kooperationen und einen kleinen Job-Bereich. Wir schauen, was davon tatsächlich genutzt wird.",
                  },
                  {
                    titel: "Danach",
                    text: "Was funktioniert, bauen wir aus. Was niemand nutzt, lassen wir weg — statt es größer zu machen.",
                  },
                  {
                    titel: "Langfristig",
                    text: "Ein eigenes Salzburger Jobportal ist das Ziel. Ob und wie es kommt, entscheiden die Zahlen aus dieser ersten Phase.",
                  },
                ].map((punkt) => (
                  <li key={punkt.titel} className="border-l-2 border-primary pl-5">
                    <h3 className="font-bold text-ink">{punkt.titel}</h3>
                    <p className="mt-1.5 leading-relaxed text-muted">{punkt.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="h-fit rounded-card border border-line bg-soft p-6 sm:p-8">
            <h2 className="text-lg font-bold text-ink">Dabei sein</h2>
            <p className="mt-2 leading-relaxed text-muted">
              Der schnellste Weg bleibt Social Media — dort sind wir täglich.
            </p>

            <div className="mt-6">
              <SocialLinks ort="ueber_uns" variante="breit" />
            </div>

            <div className="mt-4 grid gap-2.5">
              <ButtonLink href="/kooperation" size="lg" variant="secondary" className="w-full">
                Kooperation anfragen
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
