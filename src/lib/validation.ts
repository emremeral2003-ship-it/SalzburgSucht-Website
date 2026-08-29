import { z } from "zod";

import { budgetRanges, cooperationGoals, interests, promotionTypes } from "@/lib/site";

/**
 * Schemata fuer beide Formulare.
 *
 * Dieselben Regeln laufen im Browser (schnelle Rueckmeldung) und auf dem
 * Server (verbindlich). Die Browserpruefung ist Komfort, die Serverpruefung
 * ist die Sicherheit — ein abgeschicktes Formular kann jederzeit an der
 * Oberflaeche vorbei kommen.
 */

const leerZuUndefined = (wert: unknown) =>
  typeof wert === "string" && wert.trim() === "" ? undefined : wert;

const text = (max: number) => z.string().trim().max(max);

export const communitySchema = z.object({
  firstName: text(80).min(1, "Bitte gib deinen Vornamen an."),
  email: text(160)
    .min(1, "Bitte gib deine E-Mail-Adresse an.")
    .email("Diese E-Mail-Adresse sieht nicht gültig aus."),
  phone: z.preprocess(leerZuUndefined, text(40).optional()),
  interests: z.array(z.enum(interests)).default([]),
  consent: z.literal("on", {
    message: "Ohne dein Einverständnis dürfen wir die Daten nicht speichern.",
  }),
});

export const cooperationSchema = z.object({
  company: text(120).min(1, "Bitte gebt den Namen des Unternehmens an."),
  contactName: text(120).min(1, "Bitte gebt eine Ansprechperson an."),
  email: text(160)
    .min(1, "Bitte gebt eine E-Mail-Adresse an.")
    .email("Diese E-Mail-Adresse sieht nicht gültig aus."),
  phone: z.preprocess(leerZuUndefined, text(40).optional()),
  website: z.preprocess(
    leerZuUndefined,
    text(200).url("Bitte inklusive https:// angeben.").optional(),
  ),
  socialMedia: z.preprocess(leerZuUndefined, text(200).optional()),
  companyDescription: text(1500).min(1, "Eine kurze Beschreibung hilft uns bei der Einschätzung."),
  promotionType: z.array(z.enum(promotionTypes)).default([]),
  cooperationIdea: text(2000).min(1, "Beschreibt kurz, was euch vorschwebt."),
  goals: z.array(z.enum(cooperationGoals)).default([]),
  budgetRange: z.enum(budgetRanges, { message: "Bitte wählt einen Budgetrahmen." }),
  concreteBudget: z.preprocess(leerZuUndefined, text(80).optional()),
  desiredPeriod: z.preprocess(leerZuUndefined, text(160).optional()),
  message: z.preprocess(leerZuUndefined, text(1500).optional()),
  consent: z.literal("on", {
    message: "Ohne euer Einverständnis dürfen wir die Anfrage nicht speichern.",
  }),
});

export const attributionSchema = z.object({
  utm_source: z.preprocess(leerZuUndefined, text(80).optional()),
  utm_medium: z.preprocess(leerZuUndefined, text(80).optional()),
  utm_campaign: z.preprocess(leerZuUndefined, text(120).optional()),
  traffic_source: z.preprocess(leerZuUndefined, text(80).optional()),
});

export type CommunityInput = z.infer<typeof communitySchema>;
export type CooperationInput = z.infer<typeof cooperationSchema>;
export type AttributionInput = z.infer<typeof attributionSchema>;

/** Wandelt Zod-Fehler in eine Zuordnung Feldname → erste Meldung. */
export function feldFehler(fehler: z.ZodError): Record<string, string> {
  const ergebnis: Record<string, string> = {};
  for (const problem of fehler.issues) {
    const feld = problem.path[0];
    if (typeof feld === "string" && !ergebnis[feld]) ergebnis[feld] = problem.message;
  }
  return ergebnis;
}
