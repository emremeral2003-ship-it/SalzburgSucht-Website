import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "AGB",
  description:
    "Allgemeine Geschäftsbedingungen für Kooperationen mit Salzburgsucht.",
  alternates: { canonical: "/agb" },
};

/**
 * Die Geschaeftsbedingungen.
 *
 * Freigegeben vom Auftraggeber am 28.08.2026: Zahlungsziel (14 Tage netto),
 * Stornostaffel (14 Tage vor Drehbeginn bzw. Veroeffentlichungstermin
 * kostenfrei, danach 50 Prozent, ab drei Tagen 100 Prozent) und Gerichtsstand
 * Salzburg sind bestaetigt, ebenso die rechtliche Pruefung. Der frueher hier
 * stehende Entwurfshinweis ist damit hinfaellig.
 *
 * Aenderungen an diesen Zahlen sind Vertragsaenderungen, keine Textpflege —
 * sie gehoeren abgestimmt, nicht nebenbei erledigt.
 */
export default function AgbPage() {
  return (
    <Container className="abschnitt max-w-[46rem]">
      <h1 className="display display-m">Allgemeine Geschäftsbedingungen</h1>
      <p className="mt-3 text-muted">
        Für Kooperationen und Leistungen von Salzburgsucht gegenüber
        Unternehmen.
      </p>

      <div className="mt-10 space-y-8">
        <Abschnitt titel="1. Geltungsbereich">
          <p className="leading-relaxed text-muted">
            Diese Geschäftsbedingungen gelten für alle Kooperationen und
            Leistungen, die zwischen dem Betreiber von Salzburgsucht
            (nachfolgend „wir“) und Unternehmen (nachfolgend „Auftraggeber“)
            vereinbart werden — insbesondere Social-Media-Beiträge, Reels,
            Kampagnen und die Veröffentlichung von Stellenanzeigen. Abweichende
            Bedingungen des Auftraggebers gelten nur, wenn wir ihnen
            ausdrücklich schriftlich zustimmen.
          </p>
          <p className="leading-relaxed text-muted">
            Betreiber ist Eren Akyazi, Einzelunternehmen, Grolicegasse 3, 5020
            Salzburg (siehe{" "}
            <a
              href="/impressum"
              className="font-medium text-primary-dark underline"
            >
              Impressum
            </a>
            ).
          </p>
        </Abschnitt>

        <Abschnitt titel="2. Zustandekommen des Vertrags">
          <p className="leading-relaxed text-muted">
            Eine Anfrage über das Kooperationsformular dieser Website ist noch
            kein Vertrag. Ein Vertrag kommt erst zustande, wenn wir ein Angebot
            gelegt haben und der Auftraggeber es annimmt — per E-Mail oder durch
            Unterschrift.
          </p>
        </Abschnitt>

        <Abschnitt titel="3. Leistungen">
          <p className="leading-relaxed text-muted">
            Art und Umfang der Leistungen ergeben sich aus dem jeweiligen
            Angebot. Redaktionelle Gestaltung, Bildsprache und der Zeitpunkt der
            Veröffentlichung auf unseren Kanälen liegen — innerhalb des
            vereinbarten Rahmens — bei uns. Reichweiten, Interaktionen oder
            sonstige Erfolge werden nicht zugesagt.
          </p>
        </Abschnitt>

        <Abschnitt titel="4. Mitwirkung des Auftraggebers">
          <p className="leading-relaxed text-muted">
            Der Auftraggeber stellt die vereinbarten Inhalte, Informationen und
            Freigaben rechtzeitig bereit und sichert zu, dass übergebene
            Materialien (Logos, Fotos, Texte) frei von Rechten Dritter sind, die
            einer Veröffentlichung entgegenstehen.
          </p>
        </Abschnitt>

        <Abschnitt titel="5. Preise und Zahlung">
          <p className="leading-relaxed text-muted">
            Es gelten die Preise aus dem jeweiligen Angebot. Rechnungen sind
            binnen 14 Tagen ab Rechnungsdatum ohne Abzug zur Zahlung fällig.
          </p>
          <p className="leading-relaxed text-muted">
            Als Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG wird keine
            Umsatzsteuer ausgewiesen.
          </p>
          <p className="leading-relaxed text-muted">
            Bei Zahlungsverzug werden Verzugszinsen in gesetzlicher Höhe
            verrechnet; gegenüber Unternehmern gilt § 456 UGB. Kosten
            zweckentsprechender Einbringungsmaßnahmen trägt der Auftraggeber.
          </p>
        </Abschnitt>

        <Abschnitt titel="6. Stornierung">
          <p className="leading-relaxed text-muted">
            Vereinbarte Leistungen können bis 14 Tage vorher kostenfrei
            verschoben oder abgesagt werden. Maßgeblich ist bei Produktionen der
            vereinbarte Drehbeginn, sonst der vereinbarte
            Veröffentlichungstermin.
          </p>
          <p className="leading-relaxed text-muted">
            Danach werden 50 Prozent des vereinbarten Entgelts verrechnet, ab
            drei Tagen vor dem Termin das volle Entgelt. Bereits erbrachte
            Leistungen — etwa ein durchgeführter Dreh — werden in jedem Fall
            verrechnet.
          </p>
        </Abschnitt>

        <Abschnitt titel="7. Nutzungsrechte">
          <p className="leading-relaxed text-muted">
            Von uns produzierte Inhalte (Fotos, Videos, Texte) bleiben unser
            geistiges Eigentum. Der Auftraggeber erhält die im Angebot
            vereinbarten Nutzungsrechte. Wir dürfen produzierte Inhalte als
            Referenz auf unseren eigenen Kanälen zeigen, sofern nichts anderes
            vereinbart ist.
          </p>
        </Abschnitt>

        <Abschnitt titel="8. Haftung">
          <p className="leading-relaxed text-muted">
            Wir haften für Vorsatz und grobe Fahrlässigkeit. Die Haftung für
            leichte Fahrlässigkeit, entgangenen Gewinn und Folgeschäden ist —
            soweit gesetzlich zulässig — ausgeschlossen. Für die inhaltliche
            Richtigkeit der vom Auftraggeber bereitgestellten Angaben haftet der
            Auftraggeber.
          </p>
        </Abschnitt>

        <Abschnitt titel="9. Anwendbares Recht und Gerichtsstand">
          <p className="leading-relaxed text-muted">
            Es gilt österreichisches Recht unter Ausschluss der
            Verweisungsnormen und des UN-Kaufrechts.
          </p>
          {/* Bewusst auf Unternehmer beschraenkt: Gegenueber Verbrauchern ist
              eine Gerichtsstandsvereinbarung weitgehend unwirksam, fuer sie
              bleibt der gesetzliche Gerichtsstand. */}
          <p className="leading-relaxed text-muted">
            Als Gerichtsstand wird für Streitigkeiten mit Unternehmern das für
            5020 Salzburg sachlich zuständige Gericht vereinbart. Gegenüber
            Verbrauchern gilt der gesetzliche Gerichtsstand.
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
