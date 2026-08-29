"use client";

import { useEffect, useRef } from "react";

import { wenigerBewegung } from "@/lib/parallax";

/**
 * Weiches Licht im Hero, das der Maus mit Nachlauf folgt.
 *
 * Der Nachlauf ist der ganze Punkt. Ein Licht, das exakt am Cursor klebt,
 * liest sich wie ein Mauszeiger-Effekt aus einer Vorlagensammlung. Eines, das
 * sich mit Traegheit hinterherzieht, liest sich wie Tiefe — man merkt es
 * kaum bewusst, aber die Flaeche wirkt nicht mehr flach.
 *
 * Zur Laufzeit: Die Schleife laeuft **nur**, solange der Zeiger im Hero ist,
 * und haelt an, sobald das Licht seinen Zielpunkt erreicht hat. Steht die
 * Maus still, rechnet nichts. Auf Geraeten ohne Maus und bei reduzierter
 * Bewegung wird gar nichts erst angemeldet — das Element blendet CSS dort
 * ohnehin aus.
 */

/**
 * Anteil der Reststrecke pro Bild. Klein = traeger.
 *
 * In zwei Schritten von 0,09 auf 0,04 gesenkt. Bei 0,09 kam das Licht spuerbar
 * schnell nach und wirkte wie ein zweiter, unscharfer Cursor. Bei 0,04 braucht
 * es rund anderthalb Sekunden bis zur Ruhe — lang genug, dass man die Bewegung als
 * Eigenschaft der Flaeche liest und nicht als Reaktion auf die eigene Hand.
 *
 * Der Wert steht als `--licht-traegheit` im Stylesheet und wird von dort
 * gelesen, nicht hier festgeschrieben. Grund: Das Tweaks-Panel soll den
 * Nachlauf einstellen koennen, und es kann nur CSS-Variablen setzen. Ein
 * zweiter Weg — etwa ein Ereignis oder ein globaler Zustand — waere fuer eine
 * einzige Zahl deutlich zu viel Maschinerie.
 */
const TRAEGHEIT_STANDARD = 0.04;

function traegheitLesen(element: HTMLElement): number {
  const roh = getComputedStyle(element).getPropertyValue("--licht-traegheit");
  const wert = Number.parseFloat(roh);
  // Ein unbrauchbarer Wert wuerde die Schleife anhalten (bei 0) oder das Licht
  // ueberschiessen lassen (ueber 1). Beides faengt der Standard ab.
  return Number.isFinite(wert) && wert > 0 && wert <= 1 ? wert : TRAEGHEIT_STANDARD;
}

/**
 * @param variante "hell" ist das blaue Licht auf weissen Flaechen, "dunkel"
 * die aufhellende Fassung fuer Navy-Abschnitte. Dieselbe Mechanik, andere
 * Farbmischung — siehe `.zeigerlicht-hell` im Stylesheet.
 */
export function HeroLicht({ variante = "hell" }: { variante?: "hell" | "dunkel" }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const licht = ref.current;
    const buehne = licht?.parentElement;
    if (!licht || !buehne) return;
    if (wenigerBewegung() || !window.matchMedia("(hover: hover)").matches) return;

    // Startpunkt in der Mitte, damit das Licht beim ersten Hineinfahren nicht
    // aus der Ecke geschossen kommt.
    let x = 50;
    let y = 40;
    let zielX = 50;
    let zielY = 40;
    let rahmen = 0;

    let traegheit = TRAEGHEIT_STANDARD;

    const schritt = () => {
      x += (zielX - x) * traegheit;
      y += (zielY - y) * traegheit;
      // Geschrieben wird auf den Abschnitt, nicht auf das Licht selbst: Die
      // Konturebene des Signalsystems liest dieselben zwei Variablen, um sich
      // genau dort freizulegen, wo das Licht gerade steht. Zwei Ebenen, eine
      // Quelle — und deshalb nie zwei Schritte auseinander.
      buehne.style.setProperty("--zeiger-x", `${x.toFixed(2)}%`);
      buehne.style.setProperty("--zeiger-y", `${y.toFixed(2)}%`);

      // Nah genug am Ziel: Schleife anhalten, bis sich wieder etwas bewegt.
      if (Math.abs(zielX - x) < 0.15 && Math.abs(zielY - y) < 0.15) {
        rahmen = 0;
        return;
      }
      rahmen = requestAnimationFrame(schritt);
    };

    const wecken = () => {
      if (rahmen !== 0) return;
      // Genau hier gelesen und nirgends sonst: beim Anlaufen der Schleife.
      // In schritt() waere es eine erzwungene Stilneuberechnung sechzigmal je
      // Sekunde. Die Schleife haelt an, sobald das Licht steht, also wird der
      // Wert bei jeder neuen Bewegung frisch geholt — schnell genug, dass man
      // beim Ziehen am Regler die Aenderung sofort spuert.
      traegheit = traegheitLesen(buehne);
      rahmen = requestAnimationFrame(schritt);
    };

    const beiBewegung = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const kasten = buehne.getBoundingClientRect();
      zielX = ((e.clientX - kasten.left) / kasten.width) * 100;
      zielY = ((e.clientY - kasten.top) / kasten.height) * 100;
      wecken();
    };

    // Zwei Markierungen statt einer: Das Licht selbst blendet sich ein, und
    // der Abschnitt sagt seinen uebrigen Hintergrundebenen Bescheid, dass
    // gerade jemand mit der Maus da ist. Das Punktraster und die Konturen
    // haengen daran — sie werden unter dem Licht kraeftiger, statt dass das
    // Licht als eigener blauer Fleck darueberliegt.
    const beiEintritt = () => {
      licht.dataset.an = "ja";
      buehne.dataset.zeiger = "ja";
    };
    const beiAustritt = () => {
      delete licht.dataset.an;
      delete buehne.dataset.zeiger;
    };

    buehne.addEventListener("pointermove", beiBewegung, { passive: true });
    buehne.addEventListener("pointerenter", beiEintritt);
    buehne.addEventListener("pointerleave", beiAustritt);

    return () => {
      buehne.removeEventListener("pointermove", beiBewegung);
      buehne.removeEventListener("pointerenter", beiEintritt);
      buehne.removeEventListener("pointerleave", beiAustritt);
      if (rahmen) cancelAnimationFrame(rahmen);
      buehne.style.removeProperty("--zeiger-x");
      buehne.style.removeProperty("--zeiger-y");
      delete buehne.dataset.zeiger;
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className={`zeigerlicht${variante === "dunkel" ? " zeigerlicht-hell" : ""}`}
    />
  );
}
