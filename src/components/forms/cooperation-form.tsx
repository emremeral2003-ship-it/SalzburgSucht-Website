"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { AttributionFields } from "@/components/forms/attribution-fields";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { FormMessage, SuccessMessage } from "@/components/ui/feedback";
import {
  CheckboxGroup,
  ConsentCheckbox,
  Field,
  Honeypot,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { ArrowRight } from "@/components/icons";
import { submitCooperationRequest } from "@/app/actions";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { initialFormState } from "@/lib/form-state";
import { budgetRanges, cooperationGoals, promotionTypes } from "@/lib/site";
import { cooperationSchema, feldFehler } from "@/lib/validation";

/**
 * Kooperationsformular als mehrstufiger Ablauf.
 *
 * Achtzehn Felder auf einer Seite schrecken ab — und dieses Formular ist die
 * wichtigste Umwandlung der ganzen Website. Deshalb fuenf Schritte, von denen
 * jeder genau eine Frage stellt, und ein Fortschritt, der sichtbar macht, wie
 * kurz der Rest noch ist.
 *
 * Die eine technische Entscheidung, an der alles haengt: **Alle Felder
 * bleiben im DOM.** Inaktive Schritte werden nur ausgeblendet, nicht
 * ausgehaengt. Wuerde Schritt 1 beim Weiterklicken abgebaut, waeren seine
 * Werte beim Absenden weg — die Server Action bekommt ein FormData aus genau
 * dem, was im Formular steht. `display: none` nimmt die Felder gleichzeitig
 * aus Tabreihenfolge und Screenreader-Ausgabe; man kann also nicht versehent-
 * lich in einen unsichtbaren Schritt tabben.
 *
 * Geprueft wird pro Schritt mit demselben Zod-Schema, das auch der Server
 * benutzt: Es wird jedes Mal das ganze Formular geparst, aber nur die Fehler
 * angezeigt, die zum aktuellen Schritt gehoeren. Dadurch gibt es genau eine
 * Regelquelle statt fuenf Teilschemata, die auseinanderlaufen koennen.
 */

type SchrittName = keyof typeof cooperationSchema.shape;

const SCHRITTE: ReadonlyArray<{
  kurz: string;
  titel: string;
  frage: string;
  felder: readonly SchrittName[];
}> = [
  {
    kurz: "Unternehmen",
    titel: "Wer seid ihr?",
    frage: "Damit wir wissen, mit wem wir es zu tun haben.",
    felder: ["company", "website", "socialMedia", "companyDescription"],
  },
  {
    kurz: "Thema",
    titel: "Was möchtet ihr bewerben?",
    frage: "Mehrfachauswahl — oft ist es mehr als eine Sache.",
    felder: ["promotionType"],
  },
  {
    kurz: "Ziel",
    titel: "Was soll dabei herauskommen?",
    frage: "Ziel und Idee. Auch ein grober Gedanke reicht.",
    felder: ["cooperationIdea", "goals"],
  },
  {
    kurz: "Budget",
    titel: "Budget und Zeitraum",
    frage: "Hilft uns, gleich einen realistischen Vorschlag zu machen.",
    felder: ["budgetRange", "concreteBudget", "desiredPeriod"],
  },
  {
    kurz: "Kontakt",
    titel: "Wie erreichen wir euch?",
    frage: "Letzter Schritt. Danach seid ihr durch.",
    felder: ["contactName", "email", "phone", "message", "consent"],
  },
];

const LETZTER = SCHRITTE.length - 1;

export function CooperationForm() {
  const [zustand, action] = useActionState(submitCooperationRequest, initialFormState);
  const [schritt, setSchritt] = useState(0);
  const [besucht, setBesucht] = useState(0);
  const [lokaleFehler, setLokaleFehler] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const kopfRef = useRef<HTMLHeadingElement>(null);
  const gestartet = useRef(false);
  const gesehen = useRef(false);
  // Beim ersten Aufbau nicht in die Ueberschrift springen — der Fokus gehoert
  // dann dorthin, wo der Besucher gerade war, nicht ins Formular.
  const ersterAufbau = useRef(true);

  useEffect(() => {
    if (gesehen.current) return;
    gesehen.current = true;
    trackEvent(ANALYTICS_EVENTS.cooperationFormView);
  }, []);

  useEffect(() => {
    if (zustand.status === "ok") trackEvent(ANALYTICS_EVENTS.cooperationSubmit);
  }, [zustand.status]);

  // Meldet der Server einen Feldfehler, liegt das verursachende Feld fast
  // immer in einem Schritt, den man nicht mehr sieht. Ohne diesen Sprung
  // stuende die Fehlermeldung an einer unsichtbaren Stelle und das Formular
  // waere schlicht kaputt.
  //
  // Bewusst waehrend des Renderns statt in einem Effekt: React verarbeitet
  // diese Anpassung noch vor dem Zeichnen, sodass der falsche Schritt nie
  // sichtbar wird. In einem Effekt saehe man dagegen kurz den letzten Schritt
  // aufblitzen, bevor es zurueckspringt. Der Vergleich auf Objektgleichheit
  // reicht, weil useActionState bei jeder Antwort ein neues Objekt liefert.
  const [letzteAntwort, setLetzteAntwort] = useState(zustand);
  if (zustand !== letzteAntwort) {
    setLetzteAntwort(zustand);

    const fehler = zustand.errors;
    if (zustand.status === "error" && fehler) {
      const ziel = SCHRITTE.findIndex((s) => s.felder.some((feld) => fehler[feld]));
      if (ziel >= 0) {
        setSchritt(ziel);
        setBesucht((z) => Math.max(z, ziel));
      }
    }
  }

  // Fokus wandert bei jedem Schrittwechsel auf die neue Ueberschrift. Ohne
  // das bliebe er auf dem "Weiter"-Knopf, und wer mit Tastatur oder
  // Screenreader arbeitet, bekaeme vom Wechsel gar nichts mit.
  useEffect(() => {
    if (ersterAufbau.current) {
      ersterAufbau.current = false;
      return;
    }
    kopfRef.current?.focus();
  }, [schritt]);

  function beiErsterEingabe() {
    if (gestartet.current) return;
    gestartet.current = true;
    trackEvent(ANALYTICS_EVENTS.cooperationFormStart);
  }

  /** Liest den aktuellen Formularstand in die Form, die das Schema erwartet. */
  function werte() {
    const daten = new FormData(formRef.current!);
    return {
      company: daten.get("company"),
      contactName: daten.get("contactName"),
      email: daten.get("email"),
      phone: daten.get("phone"),
      website: daten.get("website"),
      socialMedia: daten.get("socialMedia"),
      companyDescription: daten.get("companyDescription"),
      promotionType: daten.getAll("promotionType"),
      cooperationIdea: daten.get("cooperationIdea"),
      goals: daten.getAll("goals"),
      budgetRange: daten.get("budgetRange"),
      concreteBudget: daten.get("concreteBudget"),
      desiredPeriod: daten.get("desiredPeriod"),
      message: daten.get("message"),
      consent: daten.get("consent"),
    };
  }

  /** Fehler des angegebenen Schritts — aus der Pruefung des ganzen Formulars. */
  function fehlerVon(index: number): Record<string, string> {
    const ergebnis = cooperationSchema.safeParse(werte());
    if (ergebnis.success) return {};

    const alle = feldFehler(ergebnis.error);
    const nurDieser: Record<string, string> = {};
    for (const feld of SCHRITTE[index].felder) {
      if (alle[feld]) nurDieser[feld] = alle[feld];
    }
    return nurDieser;
  }

  function weiter() {
    const fehler = fehlerVon(schritt);
    if (Object.keys(fehler).length > 0) {
      setLokaleFehler(fehler);
      return;
    }

    trackEvent(ANALYTICS_EVENTS.cooperationStepComplete, {
      schritt: schritt + 1,
      schritt_name: SCHRITTE[schritt].kurz,
      von: SCHRITTE.length,
    });

    setLokaleFehler({});
    const naechster = Math.min(schritt + 1, LETZTER);
    setSchritt(naechster);
    setBesucht((z) => Math.max(z, naechster));
  }

  function zurueck() {
    setLokaleFehler({});
    setSchritt((z) => Math.max(0, z - 1));
  }

  function springen(ziel: number) {
    // Vorwaerts nur bis zum weitesten bereits freigegebenen Schritt. Sonst
    // liesse sich die Pruefung durch Anklicken der letzten Marke umgehen.
    if (ziel > besucht) return;
    setLokaleFehler({});
    setSchritt(ziel);
  }

  if (zustand.status === "ok") {
    return (
      <SuccessMessage titel="Danke für eure Anfrage. Wir melden uns bei euch.">
        <p>
          Wir sehen uns eure Idee an und antworten in der Regel innerhalb von
          zwei Werktagen — auch dann, wenn es aus unserer Sicht nicht passt.
        </p>
      </SuccessMessage>
    );
  }

  /** Serverfehler haben Vorrang: Sie sind die verbindliche Aussage. */
  const fehler = { ...lokaleFehler, ...(zustand.errors ?? {}) };
  const aktuell = SCHRITTE[schritt];

  return (
    <form
      ref={formRef}
      action={action}
      onInput={beiErsterEingabe}
      onKeyDown={(e) => {
        // Enter in einem einzeiligen Feld soll weiterblaettern, nicht ein
        // halb ausgefuelltes Formular abschicken.
        if (e.key !== "Enter" || schritt === LETZTER) return;
        const ziel = e.target as HTMLElement;
        if (ziel.tagName === "TEXTAREA") return;
        e.preventDefault();
        weiter();
      }}
      noValidate
      className="relative"
    >
      <Honeypot />
      <AttributionFields />

      <Fortschritt aktuell={schritt} besucht={besucht} onSpringen={springen} />

      <div className="mt-8">
        <p className="eyebrow">
          Schritt {schritt + 1} von {SCHRITTE.length}
        </p>
        <h2
          ref={kopfRef}
          tabIndex={-1}
          className="display display-m mt-3 text-ink focus:outline-none"
        >
          {aktuell.titel}
        </h2>
        <p className="mt-2 text-muted">{aktuell.frage}</p>
      </div>

      {zustand.status === "error" && zustand.message ? (
        <div className="mt-6">
          <FormMessage art="fehler">{zustand.message}</FormMessage>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------------
          Alle Schritte bleiben im Markup. `hidden` als Klasse statt als
          Attribut, weil eine Tailwind-Anzeigeklasse das Attribut sonst
          ueberstimmen koennte.
      --------------------------------------------------------------------- */}
      <div className="mt-8">
        <Schritt aktiv={schritt === 0}>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Unternehmen" name="company" required error={fehler.company}>
              <Input
                name="company"
                autoComplete="organization"
                required
                error={fehler.company}
                placeholder="Name des Betriebs"
              />
            </Field>

            <Field label="Website" name="website" hint="Bitte mit https://" error={fehler.website}>
              <Input
                name="website"
                type="url"
                inputMode="url"
                placeholder="https://"
                hint="Bitte mit https://"
                error={fehler.website}
              />
            </Field>
          </div>

          <Field label="Instagram / Social Media" name="socialMedia" error={fehler.socialMedia}>
            <Input name="socialMedia" placeholder="@euerprofil" error={fehler.socialMedia} />
          </Field>

          <Field
            label="Was macht das Unternehmen?"
            name="companyDescription"
            required
            error={fehler.companyDescription}
          >
            <Textarea
              name="companyDescription"
              rows={4}
              required
              error={fehler.companyDescription}
              placeholder="Kurz und in eigenen Worten."
            />
          </Field>
        </Schritt>

        <Schritt aktiv={schritt === 1}>
          <CheckboxGroup
            legend="Bewerben möchten wir"
            name="promotionType"
            options={promotionTypes}
            hint="Mehrfachauswahl möglich."
            spalten
          />
        </Schritt>

        <Schritt aktiv={schritt === 2}>
          <CheckboxGroup
            legend="Was soll damit erreicht werden?"
            name="goals"
            options={cooperationGoals}
            hint="Mehrfachauswahl möglich."
            spalten
          />

          <Field
            label="Welche Idee habt ihr?"
            name="cooperationIdea"
            required
            hint="Auch ein grober Gedanke reicht. Den Rest entwickeln wir gemeinsam."
            error={fehler.cooperationIdea}
          >
            <Textarea
              name="cooperationIdea"
              rows={6}
              required
              hint="Auch ein grober Gedanke reicht. Den Rest entwickeln wir gemeinsam."
              error={fehler.cooperationIdea}
            />
          </Field>
        </Schritt>

        <Schritt aktiv={schritt === 3}>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Budgetrahmen" name="budgetRange" required error={fehler.budgetRange}>
              <Select
                name="budgetRange"
                required
                defaultValue=""
                error={fehler.budgetRange}
                onChange={(e) =>
                  trackEvent(ANALYTICS_EVENTS.cooperationBudgetSelect, {
                    budget: e.currentTarget.value,
                  })
                }
              >
                <option value="" disabled>
                  Bitte wählen
                </option>
                {budgetRanges.map((rahmen) => (
                  <option key={rahmen} value={rahmen}>
                    {rahmen}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Konkretes Budget" name="concreteBudget" error={fehler.concreteBudget}>
              <Input
                name="concreteBudget"
                placeholder="z. B. 1.500 €"
                error={fehler.concreteBudget}
              />
            </Field>
          </div>

          <Field
            label="Gewünschter Zeitraum"
            name="desiredPeriod"
            hint="Start, Deadline oder Anlass — was ihr habt."
            error={fehler.desiredPeriod}
          >
            <Input
              name="desiredPeriod"
              placeholder="z. B. ab Oktober, vor der Neueröffnung am 12.11."
              hint="Start, Deadline oder Anlass — was ihr habt."
              error={fehler.desiredPeriod}
            />
          </Field>

          {/*
            Datei-Upload ist im MVP bewusst nicht aktiv. Ein oeffentliches
            Upload-Feld ohne Virenpruefung ist ein Risiko, das dieser erste
            Test nicht braucht. Die Struktur dafuer steht (privater Bucket in
            der Migration), die Freischaltung ist eine spaetere Entscheidung.
          */}
          <p className="rounded-xl border border-dashed border-line-strong bg-soft px-4 py-3 text-sm leading-relaxed text-muted">
            Ihr habt ein Briefing oder Bildmaterial? Schickt es uns einfach als
            Antwort auf unsere Rückmeldung — ein Upload-Feld sparen wir uns
            vorerst.
          </p>
        </Schritt>

        <Schritt aktiv={schritt === 4}>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Ansprechperson" name="contactName" required error={fehler.contactName}>
              <Input
                name="contactName"
                autoComplete="name"
                required
                error={fehler.contactName}
              />
            </Field>

            <Field label="E-Mail" name="email" required error={fehler.email}>
              <Input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                error={fehler.email}
              />
            </Field>
          </div>

          <Field label="Telefon" name="phone" error={fehler.phone}>
            <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" error={fehler.phone} />
          </Field>

          <Field label="Zusätzliche Nachricht" name="message" error={fehler.message}>
            <Textarea name="message" rows={4} error={fehler.message} />
          </Field>

          <div>
            <ConsentCheckbox />
            {fehler.consent ? (
              <p className="mt-3 text-sm font-medium text-red-800">{fehler.consent}</p>
            ) : null}
          </div>
        </Schritt>
      </div>

      {/* ------------------------------------------------------------ Steuerung */}
      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        {schritt > 0 ? (
          <Button type="button" variant="secondary" size="lg" onClick={zurueck}>
            Zurück
          </Button>
        ) : null}

        <div className="sm:ml-auto">
          {schritt < LETZTER ? (
            <Button type="button" size="lg" onClick={weiter} className="w-full sm:w-auto">
              Weiter
              <ArrowRight className="cta-pfeil size-4" />
            </Button>
          ) : (
            <SubmitButton laufend="Wird gesendet …">Kooperation anfragen</SubmitButton>
          )}
        </div>
      </div>
    </form>
  );
}

/**
 * Ein Schritt.
 *
 * Ausgeblendet, nicht ausgehaengt — siehe Erklaerung oben. `display: none`
 * nimmt den Inhalt automatisch aus Tabreihenfolge und Barrierefreiheitsbaum,
 * deshalb braucht es hier kein zusaetzliches `inert` oder `aria-hidden`.
 */
function Schritt({ aktiv, children }: { aktiv: boolean; children: React.ReactNode }) {
  return <div className={aktiv ? "schritt-rein grid gap-6" : "hidden"}>{children}</div>;
}

/**
 * Fortschritt.
 *
 * Zwei Dinge gleichzeitig: ein Balken, der auf einen Blick zeigt, wie weit es
 * noch ist — und Marken, ueber die man zu einem frueheren Schritt
 * zurueckspringen kann. Vorwaerts springen geht nur bis dahin, wo die
 * Pruefung schon durchgelaufen ist.
 */
function Fortschritt({
  aktuell,
  besucht,
  onSpringen,
}: {
  aktuell: number;
  besucht: number;
  onSpringen: (ziel: number) => void;
}) {
  const anteil = ((aktuell + 1) / SCHRITTE.length) * 100;

  return (
    <div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={SCHRITTE.length}
        aria-valuenow={aktuell + 1}
        aria-label={`Schritt ${aktuell + 1} von ${SCHRITTE.length}`}
      >
        <div
          className="fortschritt-fuellung h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
          style={{ width: `${anteil}%` }}
        />
      </div>

      <ol className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
        {SCHRITTE.map((s, i) => {
          const erledigt = i < aktuell;
          const dran = i === aktuell;
          const erreichbar = i <= besucht;

          return (
            <li key={s.kurz}>
              <button
                type="button"
                onClick={() => onSpringen(i)}
                disabled={!erreichbar}
                aria-current={dran ? "step" : undefined}
                className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-[0.8125rem] font-medium transition-colors duration-200 ${
                  dran
                    ? "border-primary-dark bg-primary-dark text-white"
                    : erledigt
                      ? "border-primary bg-primary-soft text-primary-deep hover:bg-primary/25"
                      : "border-line bg-page text-muted"
                } ${erreichbar ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
              >
                <span aria-hidden className="num opacity-70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.kurz}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
