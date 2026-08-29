/**
 * Zentrale Messfunktion.
 *
 * Der ganze Sinn dieser Schicht: Im Rest des Codes steht ausschliesslich
 * `trackEvent(...)`. Welcher Dienst tatsaechlich zaehlt — Google Analytics,
 * Plausible, Matomo, Umami oder spaeter etwas anderes — entscheidet sich
 * allein hier unten. Ein Wechsel kostet dann diese eine Datei und nicht
 * dreissig Komponenten.
 */

import { ANALYTICS_EVENTS, type AnalyticsEvent, type EventProperties } from "./events";
import { hasAnalyticsConsent } from "./consent";
import { getAttribution } from "./utm";

export { ANALYTICS_EVENTS };
export type { AnalyticsEvent, EventProperties };
export * from "./consent";
export * from "./utm";

type Fenster = Window & {
  gtag?: (befehl: string, ereignis: string, daten?: Record<string, unknown>) => void;
  dataLayer?: Array<Record<string, unknown>>;
  plausible?: (ereignis: string, optionen?: { props?: Record<string, unknown> }) => void;
  _paq?: Array<unknown[]>;
  umami?: { track: (ereignis: string, daten?: Record<string, unknown>) => void };
};

/** Entfernt leere Werte, damit keine "undefined" in den Berichten landen. */
function bereinigen(daten: EventProperties): Record<string, string | number | boolean> {
  const sauber: Record<string, string | number | boolean> = {};
  for (const [schluessel, wert] of Object.entries(daten)) {
    if (wert !== undefined && wert !== null && wert !== "") sauber[schluessel] = wert;
  }
  return sauber;
}

/**
 * Uebergabe an den konfigurierten Dienst.
 *
 * Es wird bewusst nichts geworfen. Ein blockiertes Zaehlscript oder ein
 * Werbeblocker darf niemals eine Anmeldung oder eine Bewerbung verhindern —
 * die Messung ist nie wichtiger als die Handlung des Besuchers.
 */
function senden(name: AnalyticsEvent, daten: Record<string, string | number | boolean>): void {
  const w = window as Fenster;
  let zugestellt = false;

  try {
    // gtag und dataLayer schliessen einander aus: Wo gtag.js laeuft, wuerde
    // ein zusaetzlicher dataLayer-Push dasselbe Ereignis ein zweites Mal
    // melden, sobald auch ein Tag Manager im Spiel ist.
    if (typeof w.gtag === "function") {
      w.gtag("event", name, daten);
      zugestellt = true;
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: name, ...daten });
      zugestellt = true;
    }
    if (typeof w.plausible === "function") {
      w.plausible(name, { props: daten });
      zugestellt = true;
    }
    if (typeof w.umami?.track === "function") {
      w.umami.track(name, daten);
      zugestellt = true;
    }
    if (Array.isArray(w._paq)) {
      w._paq.push(["trackEvent", "Salzburgsucht", name, JSON.stringify(daten)]);
      zugestellt = true;
    }
  } catch {
    /* Ein defekter Anbieter darf die Seite nicht mitreissen. */
  }

  if (!zugestellt && process.env.NODE_ENV === "development") {
    // In der Entwicklung ist noch kein Dienst verbunden. Die Ausgabe zeigt,
    // dass die Verdrahtung stimmt, bevor ueberhaupt ein Konto existiert.
    console.debug("[analytics]", name, daten);
  }
}

/** Ein Ereignis melden. Ohne Einwilligung passiert nichts. */
export function trackEvent(name: AnalyticsEvent, properties: EventProperties = {}): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const daten = bereinigen({
    ...getAttribution(),
    page: window.location.pathname,
    ...properties,
  });

  senden(name, daten);
}

/** Seitenaufruf melden. Eigene Funktion, weil sie bei jedem Routenwechsel laeuft. */
export function trackPageView(pfad: string): void {
  trackEvent(ANALYTICS_EVENTS.pageView, { page: pfad });
}
