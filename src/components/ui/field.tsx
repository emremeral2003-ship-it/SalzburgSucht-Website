import type { ComponentProps, ReactNode } from "react";

/**
 * Formularbausteine.
 *
 * Fehler werden an dem Feld benannt, das sie verursacht hat, und ueber
 * aria-describedby mit ihm verknuepft — nicht nur gesammelt am Formularkopf.
 * Wer mit Tastatur oder Screenreader arbeitet, hoert die Meldung sonst nie.
 */

/**
 * Zustaende eines Eingabefelds: Ruhe, Darueberfahren, Fokus, Fehler.
 *
 * Hier stand vorher `focus:outline-none`. Das hat den Fokusring aus der
 * Grundschicht ueberschrieben und als einzigen Hinweis eine 1px-Rahmenfarbe
 * uebrig gelassen — in einem mehrstufigen Formular mit zehn Feldern ist das
 * mit der Tastatur nicht auffindbar. Jetzt bleibt der Ring stehen und
 * bekommt zusaetzlich einen weichen Schein nach aussen: Der Ring ist die
 * Zugaenglichkeit, der Schein die Gestaltung.
 *
 * `field-sizing` bleibt bewusst weg — ein Feld, das beim Tippen die Hoehe
 * aendert, verschiebt in einem Formular alles darunter.
 */
const control =
  "feld-eingabe w-full rounded-xl border border-line-strong bg-page px-4 py-3 text-base text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-muted hover:border-primary-dark/50 focus:border-primary-dark focus:shadow-[0_0_0_3px_rgba(128,189,255,0.35)] aria-[invalid=true]:border-red-700 aria-[invalid=true]:focus:shadow-[0_0_0_3px_rgba(185,28,28,0.2)]";

export function Field({
  label,
  name,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-primary-dark" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="ml-2 font-normal text-muted">optional</span>
        )}
      </label>

      {hint ? (
        <p id={`${name}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">{children}</div>

      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function beschreibung(name: string, hint?: string, error?: string) {
  return (
    [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(" ") ||
    undefined
  );
}

export function Input({
  name,
  error,
  hint,
  ...props
}: ComponentProps<"input"> & { name: string; error?: string; hint?: string }) {
  return (
    <input
      id={name}
      name={name}
      className={control}
      aria-invalid={error ? true : undefined}
      aria-describedby={beschreibung(name, hint, error)}
      {...props}
    />
  );
}

export function Textarea({
  name,
  error,
  hint,
  ...props
}: ComponentProps<"textarea"> & { name: string; error?: string; hint?: string }) {
  return (
    <textarea
      id={name}
      name={name}
      rows={5}
      className={`${control} resize-y leading-relaxed`}
      aria-invalid={error ? true : undefined}
      aria-describedby={beschreibung(name, hint, error)}
      {...props}
    />
  );
}

export function Select({
  name,
  error,
  children,
  ...props
}: ComponentProps<"select"> & { name: string; error?: string }) {
  return (
    <select
      id={name}
      name={name}
      className={control}
      aria-invalid={error ? true : undefined}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * Mehrfachauswahl als anklickbare Flaechen statt als Liste kleiner Kaestchen.
 *
 * Die ganze Flaeche ist das Ziel — auf einem Smartphone ist das der
 * Unterschied zwischen bedienbar und nervig. Das eigentliche Kaestchen ist
 * visuell versteckt, aber vorhanden: Es traegt Name, Wert, Tastaturbedienung
 * und Zustandsansage. Ersetzt wird nur sein Aussehen, nicht seine Funktion.
 *
 * Der Fokusring liegt deshalb ueber `has-focus-visible` auf der Flaeche —
 * ohne das waere beim Durchtabben nicht erkennbar, wo man gerade steht.
 */
export function CheckboxGroup({
  legend,
  name,
  options,
  hint,
  spalten = false,
  onSelect,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  hint?: string;
  spalten?: boolean;
  /** Wird bei jeder Aenderung gerufen — fuer die Messung, nicht fuer den Wert. */
  onSelect?: (option: string, gewaehlt: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}

      <div className={spalten ? "mt-3 grid gap-2 sm:grid-cols-2" : "mt-3 flex flex-wrap gap-2"}>
        {options.map((option) => (
          <label
            key={option}
            className="group inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line-strong bg-page px-4 py-2.5 text-[0.9375rem] text-ink transition-[border-color,background-color,transform] duration-200 ease-sanft hover:-translate-y-0.5 hover:border-primary-dark/60 has-checked:border-primary-dark has-checked:bg-primary-soft has-focus-visible:outline has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-dark"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              onChange={(e) => onSelect?.(option, e.currentTarget.checked)}
              className="peer sr-only"
            />

            {/* Ersatzkaestchen. Der Haken erscheint erst im gewaehlten
                Zustand — dafuer reicht CSS, kein State. */}
            <span
              aria-hidden
              className="grid size-5 shrink-0 place-items-center rounded-md border border-line-strong bg-page transition-colors duration-200 peer-checked:border-primary-dark peer-checked:bg-primary-dark peer-checked:[&>svg]:opacity-100"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3 text-white opacity-0 transition-opacity duration-200"
              >
                <path
                  d="M3 8.5 6.2 11.5 13 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ConsentCheckbox({ name = "consent" }: { name?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
      {/* Groesser als der Browserstandard und mit Innenabstand: Das Kaestchen
          selbst waere sonst ein 16-px-Ziel. Die ganze Beschriftung schaltet
          zwar mit, aber wer gezielt das Kaestchen antippt, soll es treffen. */}
      <input
        type="checkbox"
        name={name}
        required
        className="mt-px size-5 shrink-0 accent-[#1e71bf]"
      />
      <span>
        Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage
        gespeichert werden. Die Einwilligung ist jederzeit widerrufbar. Näheres
        in der{" "}
        <a href="/datenschutz" className="font-medium text-primary-dark underline">
          Datenschutzerklärung
        </a>
        .
      </span>
    </label>
  );
}

/**
 * Honeypot: fuer Menschen unsichtbar, fuer automatische Ausfueller verlockend.
 * Bewusst kein CAPTCHA — das kostet echte Anmeldungen, und genau die sollen
 * hier gezaehlt werden.
 */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor="website-url">Bitte leer lassen</label>
      <input id="website-url" name="website-url" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
