import "server-only";

import { datenbankKonfiguriert } from "@/lib/env";
import { anonClient } from "@/lib/supabase";
import type { AttributionInput, CommunityInput, CooperationInput } from "@/lib/validation";

/**
 * Schreibzugriffe der beiden Formulare.
 *
 * Bewusst mit dem anon-Client: Er schreibt unter denselben RLS-Regeln wie ein
 * Besucher. Selbst wenn hier ein Fehler passiert, kann darueber nichts
 * gelesen werden — und Kooperationsanfragen enthalten Budgets.
 */

export type SpeicherErgebnis =
  | { gespeichert: true }
  | { gespeichert: false; grund: "nicht-konfiguriert" | "fehler" };

export async function saveCommunitySignup(
  daten: CommunityInput,
  attribution: AttributionInput,
): Promise<SpeicherErgebnis> {
  if (!datenbankKonfiguriert()) return { gespeichert: false, grund: "nicht-konfiguriert" };

  const { error } = await anonClient()
    .from("community_signups")
    .insert({
      first_name: daten.firstName,
      // Kleinschreibung, damit dieselbe Adresse nicht zweimal in der Liste
      // landet, nur weil jemand sie mit Grossbuchstaben getippt hat.
      email: daten.email.toLowerCase(),
      phone: daten.phone ?? null,
      interests: daten.interests,
      consent_at: new Date().toISOString(),
      utm_source: attribution.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? null,
      traffic_source: attribution.traffic_source ?? null,
    });

  if (error) {
    // Doppelte Anmeldung ist kein Fehler, den die Besucherin sehen muss.
    if (error.code === "23505") return { gespeichert: true };
    console.error("[community_signups] Insert fehlgeschlagen:", error);
    return { gespeichert: false, grund: "fehler" };
  }
  return { gespeichert: true };
}

export async function saveCooperationRequest(
  daten: CooperationInput,
  attribution: AttributionInput,
): Promise<SpeicherErgebnis> {
  if (!datenbankKonfiguriert()) return { gespeichert: false, grund: "nicht-konfiguriert" };

  const { error } = await anonClient()
    .from("cooperation_requests")
    .insert({
      company: daten.company,
      contact_name: daten.contactName,
      email: daten.email.toLowerCase(),
      phone: daten.phone ?? null,
      website: daten.website ?? null,
      social_media: daten.socialMedia ?? null,
      company_description: daten.companyDescription,
      promotion_type: daten.promotionType,
      cooperation_idea: daten.cooperationIdea,
      goals: daten.goals,
      budget_range: daten.budgetRange,
      concrete_budget: daten.concreteBudget ?? null,
      desired_period: daten.desiredPeriod ?? null,
      message: daten.message ?? null,
      consent_at: new Date().toISOString(),
      utm_source: attribution.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? null,
      traffic_source: attribution.traffic_source ?? null,
    });

  if (error) {
    console.error("[cooperation_requests] Insert fehlgeschlagen:", error);
    return { gespeichert: false, grund: "fehler" };
  }
  return { gespeichert: true };
}
