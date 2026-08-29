import type { Metadata } from "next";

import { CooperationForm } from "@/components/forms/cooperation-form";
import { Container } from "@/components/ui/layout";
import { StatBadge } from "@/components/home/shared";

export const metadata: Metadata = {
  title: "Kooperation anfragen",
  description:
    "Erzählt uns eure Idee, euer Ziel und euren Budgetrahmen — wir melden uns mit einem konkreten Vorschlag.",
  alternates: { canonical: "/kooperation" },
};

export default function KooperationPage() {
  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-12 pb-12 sm:pt-16 sm:pb-14">
          <p className="eyebrow">Für Unternehmen</p>
          <h1 className="display display-l mt-3 max-w-[20ch]">
            Kooperation anfragen
          </h1>
          <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-muted">
            Je konkreter eure Angaben, desto konkreter unsere Rückmeldung. Der
            Budgetrahmen hilft uns, gleich einen realistischen Vorschlag zu
            machen — er ist keine Zusage.
          </p>
          <div className="mt-7">
            <StatBadge />
          </div>
        </Container>
      </section>

      <Container className="abschnitt">
        <div className="max-w-[46rem]">
          <CooperationForm />
        </div>
      </Container>
    </>
  );
}
