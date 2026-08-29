"use client";

import { KartenAbschnitt } from "@/components/karte/karten-abschnitt";
import { partnerOrte } from "@/data/karte/partner-orte";
import { partnerBranchen } from "@/data/partners";
import type { KartenOrt, PartnerOrt } from "@/types";

/**
 * Die Partnerkarte.
 *
 * Inhaltlich das Gegenstueck zur Versteckkarte, gestalterisch bewusst nicht
 * dieselbe: Die Verstecke sind Aktionen und tragen deshalb Nummern, die
 * Partner sind Beziehungen und tragen Namen. Nummerierte Partner waeren eine
 * Rangfolge, und eine Rangfolge unter Partnern behauptet etwas, das niemand
 * behaupten will.
 *
 * Die Filter kommen aus derselben Branchenliste, die auch die Marken unter dem
 * Partnerabschnitt der Startseite sortiert — beides bleibt damit
 * zwangslaeufig gleich.
 */
export function PartnerKarte() {
  return (
    <KartenAbschnitt
      orte={partnerOrte}
      ton="partner"
      gruppen={partnerBranchen.map((b) => ({ schluessel: b, label: b }))}
      gruppeVon={(ort: KartenOrt) => (ort as PartnerOrt).branche}
      merkmal={(ort: KartenOrt) => (ort as PartnerOrt).branche}
      beschriftung="Karte von Salzburg mit den Betrieben, mit denen bereits zusammengearbeitet wurde"
      suchLabel="Betrieb suchen"
    />
  );
}
