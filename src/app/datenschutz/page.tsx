import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CookieSettingsLink } from "@/components/consent/cookie-consent";
import { Container } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Wie Salzburgsucht mit personenbezogenen Daten umgeht.",
  alternates: { canonical: "/datenschutz" },
};

/**
 * PLATZHALTER — juristisch nicht geprueft.
 *
 * Der Text beschreibt korrekt, was die Anwendung technisch tut, und ist damit
 * eine belastbare Grundlage. Er ersetzt aber keine anwaltliche Pruefung, und
 * die Verantwortlichen-Angaben fehlen, solange die Firmendaten fehlen.
 */
export default function DatenschutzPage() {
  return (
    <Container className="abschnitt max-w-[46rem]">
      <h1 className="display display-m">Datenschutzerklärung</h1>
      <p className="mt-3 text-muted">
        Wie wir mit personenbezogenen Daten umgehen — nach DSGVO.
      </p>

      <div className="mt-10 space-y-8">
        <Abschnitt titel="Verantwortlicher">
          <p className="font-semibold text-ink">Eren Akyazi</p>
          <p className="text-muted">
            Grolicegasse 3, 5020 Salzburg, Österreich
          </p>
          <p className="text-muted">
            <a
              href="mailto:office@salzburgsucht.at"
              className="font-medium text-primary-dark underline"
            >
              office@salzburgsucht.at
            </a>
            {" · "}
            <a
              href="tel:+436644182630"
              className="font-medium text-primary-dark underline"
            >
              +43 664 4182630
            </a>
          </p>
        </Abschnitt>

        <Abschnitt titel="Community-Anmeldung">
          <p className="rounded-lg border border-dashed border-line-strong bg-soft px-3 py-2 text-[0.9375rem]">
            <span className="font-bold">Derzeit nicht in Betrieb: </span>
            Die Anmeldung ist von der Website genommen, es werden keine
            Anmeldedaten erhoben. Der Abschnitt bleibt stehen, weil die Funktion
            zurückkommen soll — vor einer Wiederinbetriebnahme gehört er
            geprüft.
          </p>
          <p>
            Wenn du dich bei der Community anmeldest, verarbeiten wir deinen
            Vornamen, deine E-Mail-Adresse, optional deine Telefonnummer und die
            von dir gewählten Interessensgebiete. Rechtsgrundlage ist deine
            Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Wir speichern zusätzlich
            den Zeitpunkt der Einwilligung, weil wir sie nachweisen können
            müssen.
          </p>
          <p>
            Du kannst deine Einwilligung jederzeit formlos widerrufen. Wir
            löschen deine Daten dann ohne Rückfrage.
          </p>
        </Abschnitt>

        <Abschnitt titel="Kooperationsanfragen">
          <p>
            Bei einer Kooperationsanfrage verarbeiten wir die von euch
            angegebenen Unternehmens- und Kontaktdaten sowie die inhaltlichen
            Angaben zur geplanten Zusammenarbeit einschließlich des
            Budgetrahmens. Rechtsgrundlage ist die Durchführung vorvertraglicher
            Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) sowie eure Einwilligung.
          </p>
          <p>
            Diese Daten sind ausschließlich für uns einsehbar. Die
            Zugriffsregeln der Datenbank erlauben anonymen Besuchern
            ausschließlich das Anlegen neuer Einträge, nie das Lesen.
          </p>
        </Abschnitt>

        <Abschnitt titel="Herkunft des Besuchs (UTM-Parameter)">
          <p>
            Wenn du über einen gekennzeichneten Link zu uns kommst — etwa aus
            einer Instagram-Story — speichern wir für die Dauer deines Besuchs
            im Speicher deines Browsers, aus welcher Quelle du kamst. Diese
            Angabe wird an eine von dir abgeschickte Anmeldung oder Anfrage
            angehängt, damit wir auswerten können, welche Kanäle funktionieren.
            Ein Personenbezug entsteht dabei nur, soweit du selbst Daten
            angibst.
          </p>
        </Abschnitt>

        <Abschnitt titel="Reichweitenmessung">
          <p>
            Wir möchten messen, welche Bereiche der Website genutzt werden.
            Diese Messung startet ausschließlich nach deiner ausdrücklichen
            Zustimmung über das Einwilligungsfenster. Ohne Zustimmung findet
            keine Messung statt, und es werden dafür keine Cookies gesetzt.
          </p>
          <p>
            Deine Entscheidung speichern wir lokal in deinem Browser. Du kannst
            sie jederzeit ändern:
          </p>
          <div className="pt-1">
            <CookieSettingsLink />
          </div>
        </Abschnitt>

        <Abschnitt titel="Auftragsverarbeiter">
          {/* Diese Liste muss den IST-Zustand abbilden, nicht den geplanten.
              Einen Dienst zu nennen, der gar nichts verarbeitet, ist genauso
              falsch wie einen zu verschweigen, der es tut. */}
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-semibold text-ink">Vercel</strong> —
              Auslieferung der Website. Dabei fallen technisch notwendige
              Server-Protokolle an.
            </li>
            {/* Der Mailversand laeuft ueber das eigene Postfach der Domain
                (SMTP). Damit ist kein zusaetzlicher Dienst beteiligt — der
                Hoster des Postfachs ist ohnehin schon einer. Wird spaeter auf
                Resend umgestellt (siehe src/lib/mailer.ts), gehoert der Dienst
                hier namentlich genannt. */}
            <li>
              <strong className="font-semibold text-ink">World4You</strong> —
              Domain und E-Mail-Postfach. Anfragen aus dem Kooperationsformular
              werden über dieses Postfach zugestellt.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Supabase — vorbereitet, derzeit nicht in Betrieb
              </strong>{" "}
              — eine Datenbank mit Serverstandort Frankfurt am Main ist
              technisch vorgesehen, aber nicht angebunden. Es werden dort
              derzeit keine Daten gespeichert.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Derzeit kein Analysedienst
              </strong>{" "}
              — es ist kein Dienst zur Reichweitenmessung eingebunden. Auch mit
              deiner Zustimmung wird aktuell nichts geladen und nichts gemessen.
              Sobald sich das ändert, steht der Dienst hier namentlich.
            </li>
          </ul>
        </Abschnitt>

        <Abschnitt titel="Kartendarstellung">
          <p>
            Auf der Startseite steht eine Karte von Salzburg. Sie wird in deinem
            Browser aus Kartendaten gezeichnet, die von{" "}
            <a
              href="https://openfreemap.org"
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-primary-dark underline underline-offset-2"
            >
              OpenFreeMap
            </a>{" "}
            geladen werden. Dabei übermittelt dein Browser an diesen Dienst
            technisch notwendige Daten — insbesondere deine IP-Adresse.
          </p>
          <p>
            OpenFreeMap ist ein kostenfreier Dienst auf Basis von
            OpenStreetMap-Daten. Er verlangt keine Anmeldung und keinen
            Zugangsschlüssel und speichert nach eigener Angabe keine
            personenbezogenen Protokolle. Rechtsgrundlage ist unser berechtigtes
            Interesse an einer verständlichen Darstellung der Orte, an denen
            unsere Aktionen stattgefunden haben (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
          <p>
            Die Karte ist die einzige Stelle dieser Website, an der dein Browser
            einen Server außerhalb unseres Hostings anfragt. Sie lädt erst, wenn
            du bis zu ihr scrollst.
          </p>
        </Abschnitt>

        <Abschnitt titel="Speicherdauer">
          <p>
            Community-Anmeldungen speichern wir, bis du deine Einwilligung
            widerrufst. Kooperationsanfragen bewahren wir so lange auf, wie es
            für die Zusammenarbeit und die gesetzlichen Aufbewahrungsfristen
            nötig ist.
          </p>
        </Abschnitt>

        <Abschnitt titel="Deine Rechte">
          <p>
            Dir stehen die Rechte auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch
            zu. Wende dich dafür an die im Impressum genannte Adresse.
          </p>
          <p>
            Du hast außerdem das Recht, dich bei der österreichischen
            Datenschutzbehörde zu beschweren:{" "}
            <a
              href="https://www.dsb.gv.at"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary-dark underline"
            >
              dsb.gv.at
            </a>
            .
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
      <div className="mt-3 space-y-3 leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}
