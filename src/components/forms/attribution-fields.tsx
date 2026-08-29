"use client";

import { useEffect, useRef } from "react";

import { getAttribution } from "@/lib/analytics";

/**
 * Versteckte Felder mit der Herkunft der Sitzung.
 *
 * Damit steht die Quelle nicht nur im Analytics-Dienst, sondern am Datensatz
 * selbst. Erst dadurch ist auswertbar, welcher Kanal die Anmeldungen bringt —
 * und nicht nur, welcher Kanal die Besuche bringt. Das ist ein Unterschied,
 * der ueber die Bewertung eines Kanals entscheidet.
 *
 * Die Werte werden nach dem Einhaengen direkt in die Felder geschrieben statt
 * ueber React-Zustand: sessionStorage existiert auf dem Server nicht, und ein
 * Unterschied zwischen Server- und Browserausgabe wuerde die Hydration
 * brechen. Ein DOM-Feld zu fuellen ist genau der Fall, fuer den ein Effekt da
 * ist — ein zusaetzlicher Renderdurchlauf waere hier reine Verschwendung.
 */
export function AttributionFields() {
  const gruppe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const werte = getAttribution();
    const felder = gruppe.current?.querySelectorAll<HTMLInputElement>("input[name]");
    felder?.forEach((feld) => {
      feld.value = werte[feld.name as keyof typeof werte] ?? "";
    });
  }, []);

  return (
    <div ref={gruppe} hidden>
      <input type="hidden" name="utm_source" defaultValue="" />
      <input type="hidden" name="utm_medium" defaultValue="" />
      <input type="hidden" name="utm_campaign" defaultValue="" />
      <input type="hidden" name="traffic_source" defaultValue="" />
    </div>
  );
}
