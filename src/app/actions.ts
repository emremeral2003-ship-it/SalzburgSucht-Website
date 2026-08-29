"use server";

import { headers } from "next/headers";

import { saveCommunitySignup, saveCooperationRequest } from "@/lib/db/submissions";
import { notifyCommunitySignup, notifyCooperation } from "@/lib/mail";
import { limitPruefen } from "@/lib/rate-limit";
import type { FormState } from "@/lib/form-state";
import {
  attributionSchema,
  communitySchema,
  cooperationSchema,
  feldFehler,
} from "@/lib/validation";

/**
 * Server Actions beider Formulare.
 *
 * Drei Huerden in fester Reihenfolge, von billig nach teuer:
 *   1. Honeypot — kostet nichts und faengt die simplen Ausfueller
 *   2. Rate-Limit pro IP — faengt Serienversand
 *   3. Schema-Pruefung — entscheidet ueber die Datenqualitaet
 *
 * Erst danach wird geschrieben. Alles, was hier zurueckkommt, ist fuer den
 * Besucher formuliert: Interne Fehlermeldungen, Tabellennamen oder Codes
 * gehoeren ins Log, nicht auf den Bildschirm.
 */

async function huerden(formData: FormData, schluessel: string) {
  if ((formData.get("website-url") as string | null)?.trim()) {
    // Der Honeypot war ausgefuellt. Nach aussen sieht das aus wie Erfolg —
    // ein Bot, der eine Fehlermeldung bekommt, versucht es sonst variiert
    // noch einmal.
    return { abbruch: true, zustand: { status: "ok" as const, message: "Danke!" } };
  }

  const kopf = await headers();
  const ip = kopf.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unbekannt";
  const limit = limitPruefen(`${schluessel}:${ip}`);

  if (!limit.erlaubt) {
    return {
      abbruch: true,
      zustand: {
        status: "error" as const,
        message: `Zu viele Versuche. Bitte probiere es in ${Math.ceil(limit.wartenSek / 60)} Minuten noch einmal.`,
      },
    };
  }

  return { abbruch: false, zustand: null };
}

function attributionAus(formData: FormData) {
  return attributionSchema.parse({
    utm_source: formData.get("utm_source"),
    utm_medium: formData.get("utm_medium"),
    utm_campaign: formData.get("utm_campaign"),
    traffic_source: formData.get("traffic_source"),
  });
}

export async function submitCommunitySignup(
  _vorher: FormState,
  formData: FormData,
): Promise<FormState> {
  const vorpruefung = await huerden(formData, "community");
  if (vorpruefung.abbruch) return vorpruefung.zustand!;

  const ergebnis = communitySchema.safeParse({
    firstName: formData.get("firstName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    interests: formData.getAll("interests"),
    consent: formData.get("consent"),
  });

  if (!ergebnis.success) {
    return {
      status: "error",
      message: "Bitte sieh dir die markierten Felder noch einmal an.",
      errors: feldFehler(ergebnis.error),
    };
  }

  try {
    /* ZWEI WEGE, EINER REICHT.
       Die Website laeuft ohne Datenbank: Der Eingang wird per Mail
       zugestellt, das Speichern ist optional und laeuft nur, wenn Supabase
       hinterlegt ist. Erfolg meldet das Formular, sobald EINER der beiden
       Wege getragen hat — kommt keiner durch, ist die Anmeldung wirklich
       nirgends angekommen und darf keinen Erfolg melden. */
    const [gespeichert, gemeldet] = await Promise.all([
      saveCommunitySignup(ergebnis.data, attributionAus(formData)),
      notifyCommunitySignup(ergebnis.data, attributionAus(formData)),
    ]);

    if (!gespeichert.gespeichert && !gemeldet) {
      console.error("[community] Weder gespeichert noch gemeldet.");
      return {
        status: "error",
        message:
          "Die Anmeldung konnte nicht entgegengenommen werden. Bitte melde dich vorerst über Instagram bei uns.",
      };
    }

    return { status: "ok", message: "Danke! Du bist dabei." };
  } catch (fehler) {
    console.error("[community] Unerwarteter Fehler:", fehler);
    return {
      status: "error",
      message: "Das hat leider nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.",
    };
  }
}

export async function submitCooperationRequest(
  _vorher: FormState,
  formData: FormData,
): Promise<FormState> {
  const vorpruefung = await huerden(formData, "kooperation");
  if (vorpruefung.abbruch) return vorpruefung.zustand!;

  const ergebnis = cooperationSchema.safeParse({
    company: formData.get("company"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    socialMedia: formData.get("socialMedia"),
    companyDescription: formData.get("companyDescription"),
    promotionType: formData.getAll("promotionType"),
    cooperationIdea: formData.get("cooperationIdea"),
    goals: formData.getAll("goals"),
    budgetRange: formData.get("budgetRange"),
    concreteBudget: formData.get("concreteBudget"),
    desiredPeriod: formData.get("desiredPeriod"),
    message: formData.get("message"),
    consent: formData.get("consent"),
  });

  if (!ergebnis.success) {
    return {
      status: "error",
      message: "Bitte seht euch die markierten Felder noch einmal an.",
      errors: feldFehler(ergebnis.error),
    };
  }

  try {
    /* Siehe submitCommunitySignup: Mail traegt, Datenbank ist optional. */
    const [gespeichert, gemeldet] = await Promise.all([
      saveCooperationRequest(ergebnis.data, attributionAus(formData)),
      notifyCooperation(ergebnis.data, attributionAus(formData)),
    ]);

    if (!gespeichert.gespeichert && !gemeldet) {
      console.error("[kooperation] Weder gespeichert noch gemeldet.");
      return {
        status: "error",
        message:
          "Die Anfrage konnte nicht entgegengenommen werden. Bitte meldet euch vorerst über Instagram bei uns.",
      };
    }

    return { status: "ok", message: "Danke für eure Anfrage. Wir melden uns bei euch." };
  } catch (fehler) {
    console.error("[kooperation] Unerwarteter Fehler:", fehler);
    return {
      status: "error",
      message: "Das hat leider nicht geklappt. Bitte versucht es in ein paar Minuten noch einmal.",
    };
  }
}
