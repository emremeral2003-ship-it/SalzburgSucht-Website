import { partners } from "@/data/partners";
import type { PartnerOrt } from "@/types";

/**
 * Die Partnerbetriebe in der Form, die eine Karte braucht.
 *
 * Hier stehen KEINE Daten. Alles kommt aus src/data/partners.ts — Name,
 * Branche und Standort stehen dort in derselben Zeile. Diese Datei rechnet
 * nur um.
 *
 * Vorher war es anders herum: Die Namen dort, die Koordinaten hier. Das ergab
 * zwei Listen, die auseinanderlaufen konnten, und genau das taten sie — die
 * Namensreihe zeigte vierundzwanzig Betriebe, die Karte vierzehn, und der
 * Unterschied stand nirgends.
 *
 * Wer einen Standort nachtraegt, tut das in partners.ts. Diese Datei bekommt
 * ihn von selbst, und die Karte auch.
 */
export const partnerOrte: PartnerOrt[] = partners.map((partner) => ({
  id: partner.id,
  name: partner.name,
  branche: partner.branche,
  website: partner.website,
  breite: partner.standort?.breite ?? null,
  laenge: partner.standort?.laenge ?? null,
  genauigkeit: partner.standort?.genauigkeit ?? "offen",
  zusatz: partner.standort?.zusatz ?? null,
}));
