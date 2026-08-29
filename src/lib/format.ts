/** Kleine Formathelfer, die an mehreren Stellen gebraucht werden. */

/** Initialen eines Firmennamens fuer den Logo-Platzhalter. */
export function initialen(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((wort) => wort[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Veroeffentlichungsdatum als Text.
 *
 * "Heute" und "vor 3 Tagen" sind fuer eine Stellenanzeige aussagekraeftiger
 * als ein Datum — die Frage dahinter ist immer, ob die Stelle noch aktuell ist.
 */
export function datumLesbar(iso: string, jetzt = new Date()): string {
  const datum = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(datum.getTime())) return iso;

  const tage = Math.floor(
    (Date.UTC(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()) -
      Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate())) /
      86_400_000,
  );

  if (tage <= 0) return "Heute";
  if (tage === 1) return "Gestern";
  if (tage < 7) return `vor ${tage} Tagen`;
  if (tage < 14) return "vor einer Woche";
  if (tage < 31) return `vor ${Math.floor(tage / 7)} Wochen`;
  return datum.toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" });
}
