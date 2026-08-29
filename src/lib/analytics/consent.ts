/**
 * Einwilligung in die Messung.
 *
 * Notwendige Technik laeuft immer. Alles, was Verhalten misst, laeuft erst
 * nach einem aktiven Ja. Ohne Entscheidung wird nicht gemessen — das ist der
 * Unterschied zwischen einer Einwilligung und einer Unterstellung.
 *
 * Kein Dark Pattern: "Ablehnen" ist genauso gross und genauso schnell
 * erreichbar wie "Zustimmen", und die Entscheidung ist jederzeit ueber den
 * Fusszeilen-Link widerrufbar.
 */

const SCHLUESSEL = "salzburgsucht.consent";

export type ConsentStatus = "granted" | "denied" | "unset";

/** Wird ausgeloest, wenn sich die Entscheidung aendert. */
export const CONSENT_EVENT = "salzburgsucht:consent";

export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return "unset";
  try {
    const wert = window.localStorage.getItem(SCHLUESSEL);
    return wert === "granted" || wert === "denied" ? wert : "unset";
  } catch {
    return "unset";
  }
}

export function setConsent(status: Exclude<ConsentStatus, "unset">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCHLUESSEL, status);
  } catch {
    /* Ohne Speicher gilt die Entscheidung nur fuer diesen Seitenaufruf. */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: status }));
}

export function resetConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SCHLUESSEL);
  } catch {
    /* siehe oben */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "unset" }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "granted";
}
