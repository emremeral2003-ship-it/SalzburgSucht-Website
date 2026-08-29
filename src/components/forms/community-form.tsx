"use client";

import { useActionState, useEffect, useRef } from "react";

import { AttributionFields } from "@/components/forms/attribution-fields";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage, SuccessMessage } from "@/components/ui/feedback";
import {
  CheckboxGroup,
  ConsentCheckbox,
  Field,
  Honeypot,
  Input,
} from "@/components/ui/field";
import { ButtonLink } from "@/components/ui/button";
import { submitCommunitySignup } from "@/app/actions";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { initialFormState } from "@/lib/form-state";
import { interests, socialLinks } from "@/lib/site";

/**
 * Community-Anmeldung.
 *
 * Gemessen werden drei Punkte: Wer sieht das Formular, wer beginnt es
 * auszufuellen, wer schickt es ab. Nur so wird sichtbar, ob Menschen
 * abbrechen — die Abbruchquote ist die aussagekraeftigere Zahl, weil sie
 * sagt, wo es hakt.
 */
export function CommunityForm() {
  const [zustand, action] = useActionState(submitCommunitySignup, initialFormState);
  const gestartet = useRef(false);
  const gesehen = useRef(false);

  useEffect(() => {
    if (gesehen.current) return;
    gesehen.current = true;
    trackEvent(ANALYTICS_EVENTS.communityFormView);
  }, []);

  useEffect(() => {
    if (zustand.status === "ok") trackEvent(ANALYTICS_EVENTS.communitySignup);
  }, [zustand.status]);

  function beiErsterEingabe() {
    if (gestartet.current) return;
    gestartet.current = true;
    trackEvent(ANALYTICS_EVENTS.communityFormStart);
  }

  if (zustand.status === "ok") {
    return (
      <SuccessMessage titel="Willkommen bei Salzburgsucht.">
        <p>
          Deine Anmeldung ist bei uns angekommen. Wir melden uns, sobald es zu
          deinen Themen etwas gibt — kein Spam, versprochen.
        </p>
        <div className="mt-5">
          <ButtonLink
            href={socialLinks.instagram}
            event={ANALYTICS_EVENTS.instagramClick}
            eventProps={{ cta_location: "community_success" }}
          >
            Bis dahin: auf Instagram folgen
          </ButtonLink>
        </div>
      </SuccessMessage>
    );
  }

  return (
    <form action={action} onInput={beiErsterEingabe} noValidate className="relative grid gap-6">
      <Honeypot />
      <AttributionFields />

      {zustand.status === "error" && zustand.message ? (
        <FormMessage art="fehler">{zustand.message}</FormMessage>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Vorname" name="firstName" required error={zustand.errors?.firstName}>
          <Input
            name="firstName"
            autoComplete="given-name"
            required
            error={zustand.errors?.firstName}
          />
        </Field>

        <Field label="E-Mail" name="email" required error={zustand.errors?.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            error={zustand.errors?.email}
          />
        </Field>
      </div>

      <Field
        label="Telefonnummer"
        name="phone"
        hint="Nur, wenn wir dich auch per WhatsApp erreichen dürfen."
        error={zustand.errors?.phone}
      >
        <Input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          hint="Nur, wenn wir dich auch per WhatsApp erreichen dürfen."
        />
      </Field>

      {/* Welche Themen gewaehlt werden, ist die inhaltlich wertvollste Zahl
          dieser Testphase: Sie sagt, worueber Salzburgsucht kuenftig berichten
          soll — und ob "Jobs" ueberhaupt jemand ankreuzt. */}
      <CheckboxGroup
        legend="Was interessiert dich?"
        name="interests"
        options={interests}
        hint="Mehrfachauswahl. Danach richtet sich, was du von uns hörst."
        onSelect={(thema, gewaehlt) =>
          trackEvent(ANALYTICS_EVENTS.communityInterestSelect, {
            interesse: thema,
            gewaehlt,
          })
        }
      />

      <ConsentCheckbox />
      {zustand.errors?.consent ? (
        <p className="-mt-3 text-sm font-medium text-red-800">{zustand.errors.consent}</p>
      ) : null}

      <div>
        <SubmitButton laufend="Wird gesendet …">Jetzt anmelden</SubmitButton>
      </div>
    </form>
  );
}
