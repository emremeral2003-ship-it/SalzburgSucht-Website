"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { anmelden } from "@/lib/parallax";

/**
 * Hintergrundelemente, die den weissen Flaechen Tiefe geben.
 *
 * Die Leitplanke fuer alles hier: **Nichts davon darf man bewusst
 * wahrnehmen.** Wer den Hintergrund bemerkt, sieht nicht mehr den Inhalt.
 * Deshalb sind die Deckkraftwerte niedrig, die Wege kurz und die Bewegung
 * an das Scrollen gekoppelt statt an einen Dauerlauf — was steht, bewegt
 * sich nicht.
 *
 * Alle Bausteine sind `aria-hidden` und ohne Zeigerereignisse: Sie sind
 * Dekor, kein Inhalt. Bei reduzierter Bewegung bleiben sie sichtbar, aber
 * still — das Bild soll dann ruhig sein, nicht leer.
 */

/**
 * Bewegt seinen Inhalt beim Scrollen langsamer als die Seite.
 *
 * `staerke` ist der Anteil, um den das Element zuruecksteht: 0,08 ist eine
 * Ahnung, 0,25 deutlich sichtbar. Ueber 0,3 wird daraus der billige
 * Parallax-Effekt, den man aus Baukastenseiten kennt.
 */
export function Schwebend({
  children,
  staerke = 0.12,
  waagrecht = 0,
  className = "",
}: {
  children: ReactNode;
  staerke?: number;
  waagrecht?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return anmelden(ref.current, staerke, waagrecht);
  }, [staerke, waagrecht]);

  return (
    <div ref={ref} aria-hidden className={`parallax pointer-events-none ${className}`}>
      {children}
    </div>
  );
}

/**
 * Sehr grosses Wort als Konturschrift im Hintergrund.
 *
 * Das ist das eine Element, das der Seite den Agenturcharakter gibt, ohne
 * etwas zu behaupten. Es steht nur in Umriss und bei zwei bis vier Prozent
 * Deckkraft — auf einem kalibrierten Bildschirm eine Ahnung, auf einem
 * schlechten unsichtbar. Genau so ist es gemeint: Wer es sieht, findet es
 * schoen; wer es nicht sieht, vermisst nichts.
 *
 * Auf Telefonen faellt es weg (`hidden md:block`). Dort ist der Platz zu
 * knapp, das Wort wuerde hinter dem Text kleben statt hinter der Flaeche zu
 * liegen — und jedes gesparte Element ist gesparte Rechenzeit.
 */
export function RiesenWort({
  text,
  className = "",
  staerke = 0.025,
  drift = 0.02,
}: {
  text: string;
  className?: string;
  staerke?: number;
  /** Waagrechte Wanderung beim Scrollen. Sehr klein halten. */
  drift?: number;
}) {
  return (
    <Schwebend
      staerke={staerke}
      waagrecht={drift}
      className={`riesenwort absolute -z-10 select-none ${className}`}
    >
      <span className="block whitespace-nowrap">{text}</span>
    </Schwebend>
  );
}

/**
 * Dekorative Farbwolke mit optionaler Scrollbewegung.
 *
 * Loest den bisherigen `Orb` ab: gleiche Optik, aber sie kann jetzt
 * zuruecktreten, wenn die Seite scrollt.
 */
export function Wolke({
  className,
  farbe = "rgba(128, 189, 255, 0.55)",
  staerke = 0.1,
}: {
  className: string;
  farbe?: string;
  staerke?: number;
}) {
  return (
    <Schwebend staerke={staerke} className={`absolute -z-10 ${className}`}>
      <span className="orb-inner block size-full rounded-full" style={{ background: farbe }} />
    </Schwebend>
  );
}
