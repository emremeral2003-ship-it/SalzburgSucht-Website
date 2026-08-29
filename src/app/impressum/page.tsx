import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Offenlegung nach § 5 ECG und § 25 MedienG.",
  alternates: { canonical: "/impressum" },
};

/**
 * Offenlegung nach § 5 ECG und § 25 MedienG.
 *
 * Vollstaendig und vom Auftraggeber am 28.08.2026 freigegeben, rechtliche
 * Pruefung nach seiner Angabe erfolgt.
 *
 * Medieninhaber ist Eren Akyazi — ausdruecklich NICHT IC Media. In den
 * Unterlagen liegen zwar vollstaendige Firmendaten von IC Media
 * (Goethestraße 21, ATU82417305, Inhaber Emre Meral), sie gehoeren aber zu
 * einer anderen Organisation. Wer hier kuenftig etwas aendert, sollte das
 * wissen: Ein falscher Medieninhaber richtet die medienrechtliche Haftung auf
 * die falsche Person.
 *
 * Firmenbuchnummer und UID stehen bewusst nirgends: Ein Einzelunternehmen
 * ohne Firmenbucheintrag hat keine Firmenbuchnummer, und ein Kleinunternehmer
 * nach § 6 Abs. 1 Z 27 UStG in aller Regel keine UID.
 */
export default function ImpressumPage() {
  return (
    <Container className="abschnitt max-w-[46rem]">
      <h1 className="display display-m">Impressum</h1>
      <p className="mt-3 text-muted">
        Offenlegung nach § 5 ECG und § 25 MedienG.
      </p>

      <div className="mt-10 space-y-8">
        <Abschnitt titel="Medieninhaber und Diensteanbieter">
          <p className="font-semibold text-ink">Eren Akyazi</p>
          <p className="text-muted">Einzelunternehmen</p>
          {/* Kleinunternehmer nach § 6 Abs. 1 Z 27 UStG: keine Umsatzsteuer
              ausgewiesen, damit in aller Regel auch keine UID-Nummer. Ein
              Einzelunternehmen ohne Firmenbucheintragung fuehrt zudem keine
              Firmenbuchnummer — beide Zeilen entfallen deshalb, statt leer
              dazustehen. */}
          <p className="text-muted">
            Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG — es wird keine
            Umsatzsteuer ausgewiesen.
          </p>
        </Abschnitt>

        <Abschnitt titel="Anschrift">
          <p className="text-muted">Grolicegasse 3</p>
          <p className="text-muted">5020 Salzburg</p>
          <p className="text-muted">Österreich</p>
        </Abschnitt>

        <Abschnitt titel="Kontakt">
          <p className="text-muted">
            E-Mail:{" "}
            <a
              href="mailto:office@salzburgsucht.at"
              className="font-medium text-primary-dark underline"
            >
              office@salzburgsucht.at
            </a>
          </p>
          <p className="text-muted">
            Telefon:{" "}
            <a
              href="tel:+436644182630"
              className="font-medium text-primary-dark underline"
            >
              +43 664 4182630
            </a>
          </p>
        </Abschnitt>

        <Abschnitt titel="Unternehmensgegenstand">
          <p className="leading-relaxed text-muted">
            Betrieb einer regionalen Community- und Medienplattform für Stadt
            und Land Salzburg sowie Social-Media-Marketing für Unternehmen:
            redaktionelle Beiträge über Gastronomie, Events und lokale Angebote,
            Kooperationen mit Betrieben und die Veröffentlichung ausgewählter
            Stellenanzeigen.
          </p>
        </Abschnitt>

        <Abschnitt titel="Gewerbeaufsicht und Kammerzugehörigkeit">
          {/* Die Behoerde ergibt sich aus dem Sitz: 5020 ist die Stadt
              Salzburg, zustaendig ist damit das Magistrat und nicht eine
              Bezirkshauptmannschaft. */}
          <p className="text-muted">
            Gewerbebehörde: Magistrat der Stadt Salzburg
          </p>
          <p className="text-muted">
            Kammerzugehörigkeit: Wirtschaftskammer Salzburg
          </p>
          <p className="text-muted">
            Gewerbewortlaut: Werbeagentur (freies Gewerbe)
          </p>
          <p className="text-muted">
            Fachgruppe: Werbung und Marktkommunikation
          </p>
          <p className="leading-relaxed text-muted">
            Anwendbare Rechtsvorschriften: Gewerbeordnung, abrufbar unter{" "}
            <a
              href="https://www.ris.bka.gv.at"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary-dark underline"
            >
              ris.bka.gv.at
            </a>
            .
          </p>
        </Abschnitt>

        <Abschnitt titel="Blattlinie nach § 25 MedienG">
          <p className="leading-relaxed text-muted">
            Salzburgsucht informiert über lokale Angebote, Gastronomie, Events,
            Aktionen und ausgewählte offene Stellen in Stadt und Land Salzburg.
            Die Website richtet sich an Menschen, die hier leben, und an
            Betriebe aus der Region. Die Berichterstattung erfolgt eigenständig
            und ohne parteipolitische Bindung; entgeltliche Kooperationen werden
            als solche gekennzeichnet.
          </p>
        </Abschnitt>

        <Abschnitt titel="Online-Streitbeilegung">
          <p className="leading-relaxed text-muted">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary-dark underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            . Wir sind weder verpflichtet noch bereit, an einem
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </Abschnitt>
      </div>
    </Container>
  );
}

function Abschnitt({
  titel,
  children,
}: {
  titel: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink">{titel}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}
