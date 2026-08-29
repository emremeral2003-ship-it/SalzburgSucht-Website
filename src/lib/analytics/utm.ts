/**
 * Herkunft eines Besuchs festhalten.
 *
 * Die Kampagnenparameter stehen nur im ersten Seitenaufruf in der Adresse.
 * Klickt jemand danach weiter zu einem Job und dort auf "Jetzt bewerben",
 * sind sie laengst verschwunden. Deshalb werden sie einmal je Sitzung
 * abgelegt und an jedes spaetere Ereignis angehaengt.
 *
 * Erst dadurch ist die Frage beantwortbar, um die es im ganzen Projekt geht:
 * Instagram → Website → Job → Bewerbung.
 */

const SCHLUESSEL = "salzburgsucht.attribution";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  traffic_source?: string;
};

/** Leitet die Quelle aus dem Verweis ab, wenn keine UTM-Parameter da sind. */
function quelleAusReferrer(referrer: string): string | undefined {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return undefined;
    if (host.includes("instagram")) return "instagram";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("google")) return "google";
    if (host.includes("facebook")) return "facebook";
    return host;
  } catch {
    return undefined;
  }
}

/** Liest die gespeicherte Herkunft. Leer, wenn noch nichts erfasst wurde. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const roh = window.sessionStorage.getItem(SCHLUESSEL);
    return roh ? (JSON.parse(roh) as Attribution) : {};
  } catch {
    return {};
  }
}

/**
 * Erfasst die Herkunft beim ersten Aufruf der Sitzung.
 *
 * Spaetere Aufrufe ueberschreiben nichts: Der erste Kontakt ist der, der die
 * Besucherin gebracht hat. Ein interner Weiterklick darf ihn nicht loeschen.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const vorhanden = getAttribution();
  if (vorhanden.utm_source || vorhanden.traffic_source) return vorhanden;

  const params = new URLSearchParams(window.location.search);
  const neu: Attribution = {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
  };
  neu.traffic_source = neu.utm_source ?? quelleAusReferrer(document.referrer);

  try {
    window.sessionStorage.setItem(SCHLUESSEL, JSON.stringify(neu));
  } catch {
    /* Privater Modus ohne Speicher: dann eben nur fuer diesen Seitenaufruf. */
  }
  return neu;
}
