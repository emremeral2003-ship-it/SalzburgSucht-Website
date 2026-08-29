"use client";

import { useEffect, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { CONSENT_EVENT, getConsent, resetConsent, setConsent } from "@/lib/analytics";

/**
 * Einwilligungsbanner.
 *
 * Kein Dark Pattern: "Ablehnen" ist dieselbe Groesse, derselbe Ort und
 * derselbe Aufwand wie "Zustimmen". Es gibt keine vorausgewaehlte Zustimmung
 * und kein Weiterscrollen, das als Ja gewertet wird.
 *
 * Ohne Entscheidung laeuft keine Messung. Das kostet Daten — aber eine
 * unterstellte Einwilligung waere keine.
 */
export function CookieConsent() {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const pruefen = () => setSichtbar(getConsent() === "unset");
    pruefen();
    window.addEventListener(CONSENT_EVENT, pruefen);
    return () => window.removeEventListener(CONSENT_EVENT, pruefen);
  }, []);

  if (!sichtbar) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-titel"
      // Vorher ein Balken ueber die volle Breite. Der hat beim ersten Besuch
      // den unteren Bildrand verschluckt — auf einem Telefon war das ein
      // Drittel der Seite, und der erste Eindruck der Marke war eine
      // Rechtsbelehrung.
      //
      // Jetzt: auf dem Telefon ein Blatt, das am unteren Rand sitzt, ab
      // Tablet eine kompakte Karte unten links. Links, weil rechts unten auf
      // vielen Seiten Chat- und Hilfeschaltflaechen sitzen.
      // Der untere Innenabstand nimmt auf dem Telefon die Systemleiste mit
      // auf. Ohne das liegt der Ablehnen-Knopf auf einem iPhone unter dem
      // Strich fuer die Gestensteuerung — treffbar, aber unangenehm, und
      // genau bei dem Knopf, den niemand versehentlich verfehlen soll.
      className="consent-rein fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-auto sm:bottom-6 sm:left-6 sm:max-w-[23rem] sm:p-0"
    >
      <div className="rounded-card border border-line bg-page/95 p-5 shadow-float backdrop-blur-md">
        <h2 id="consent-titel" className="text-[0.9375rem] font-bold text-ink">
          Dürfen wir messen, was hier funktioniert?
        </h2>
        {/* Kuerzer als vorher. Die vollstaendige Erklaerung steht in der
            Datenschutzerklaerung — hier braucht es die Entscheidung, nicht
            den Rechtstext. Was rechtlich noetig ist, bleibt drin: was
            passiert, dass es ohne Zustimmung nicht passiert, und wo mehr
            dazu steht. */}
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">
          Technisch Notwendiges läuft immer. Zusätzlich würden wir anonym
          zählen, welche Bereiche genutzt werden. Ohne dein Ja passiert das
          nicht.{" "}
          <a href="/datenschutz" className="font-medium text-primary-dark underline">
            Mehr dazu
          </a>
        </p>

        {/* Kein Dark Pattern: Beide Knoepfe sind gleich gross und gleich
            erreichbar. Unterschiedlich ist nur die Fuellung, und die folgt
            der Gestaltung der ganzen Seite, nicht dem Wunschergebnis. */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => setConsent("denied")}>
            Ablehnen
          </Button>
          <Button onClick={() => setConsent("granted")}>Zustimmen</Button>
        </div>
      </div>
    </div>
  );
}

/** Fusszeilen-Link, mit dem die Entscheidung jederzeit widerrufbar ist. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={resetConsent}
      className="inline-flex min-h-9 items-center text-left text-[0.9375rem] text-white/80 transition-colors duration-200 hover:text-white"
    >
      Cookie-Einstellungen
    </button>
  );
}

/** Wird auf der Datenschutzseite verwendet. */
export function CookieSettingsLink() {
  return (
    <ButtonLink href="#" variant="secondary" onClick={resetConsent}>
      Einwilligung ändern
    </ButtonLink>
  );
}
