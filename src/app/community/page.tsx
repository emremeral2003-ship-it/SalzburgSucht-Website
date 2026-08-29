import type { Metadata } from "next";

import { SocialLinks } from "@/components/layout/social-links";
import { StatBadge } from "@/components/home/shared";
import { Container, SectionHeader } from "@/components/ui/layout";
import { themen } from "@/data/services";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Lokaltipps, Events, Gewinnspiele und ausgewählte Jobs aus Stadt und Land Salzburg — täglich auf Instagram und TikTok.",
  alternates: { canonical: "/community" },
};

/**
 * ---------------------------------------------------------------------------
 * DIE ANMELDUNG IST VORERST RAUS (28.08.2026, Entscheidung von Emre)
 * ---------------------------------------------------------------------------
 * Hier stand ein Formular, das Vorname, E-Mail, Telefon und Interessen
 * gesammelt hat. Es ist bewusst nicht nur ausgeblendet, sondern aus der
 * Seite genommen — samt aller Knoepfe, die eine Anmeldung versprochen haben.
 * Ein Aufruf "Community beitreten", der auf eine Seite ohne Anmeldung fuehrt,
 * waere schlechter als gar keiner.
 *
 * Der Baustein selbst bleibt liegen: src/components/forms/community-form.tsx
 * und die Aktion `submitCommunitySignup` in src/app/actions.ts sind
 * unveraendert. Zurueckholen heisst: Formular hier wieder einhaengen.
 *
 * Fuer den Newsletterversand fehlt ohnehin noch der Double-Opt-In — ohne ihn
 * duerfte an gesammelte Adressen nichts verschickt werden.
 */

export default function CommunityPage() {
  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-12 pb-14 sm:pt-16 sm:pb-18">
          <StatBadge />
          <h1 className="display display-l mt-6 max-w-[18ch]">
            Mehr Salzburg für dich.
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
            Lokaltipps, Events, Gewinnspiele und ausgewählte Stellen — alles
            läuft über unsere Kanäle. Folg uns, und du bist dabei.
          </p>
        </Container>
      </section>

      <Container className="abschnitt">
        <div className="max-w-[62ch]">
          <div>
            <SectionHeader
              eyebrow="Deine Themen"
              title="Worüber wir schreiben"
            />

            <ul className="mt-8 grid gap-3">
              {themen.map((thema) => (
                <li
                  key={thema.title}
                  className="border-l-2 border-primary pl-4"
                >
                  <h3 className="font-bold text-ink">{thema.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">
                    {thema.text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-card border border-line bg-soft p-6">
              <h3 className="font-bold text-ink">So bleibst du dran</h3>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                Täglich auf Instagram und TikTok — dort läuft alles zuerst.
              </p>
              <div className="mt-5">
                <SocialLinks ort="community_page" variante="breit" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
