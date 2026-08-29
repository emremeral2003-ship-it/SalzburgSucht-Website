"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Laedt eine Karte erst, wenn sie in die Naehe des Bildschirms kommt.
 *
 * Die grosse Karte der Startseite bringt MapLibre mit — rund 270 kB
 * gepackt, dazu die beiden Stildateien. Die Detailkarte auf /partner bringt
 * ihre eigene Geometrie mit, rund 190 kB. Beides ist wenig fuer eine Karte
 * und viel fuer eine Seite, auf der die Karte weit unten steht: Ohne diese
 * Huelle laege es im Haupt-Bundle, und jeder Besuch bezahlte es — auch wer
 * nie so weit scrollt.
 *
 * Bei der grossen Karte kommt ein zweiter Grund dazu, und der wiegt schwerer
 * als Kilobyte: Sie holt ihre Kacheln von einem fremden Server. Solange
 * niemand bis zu ihr scrollt, geht diese Anfrage gar nicht erst hinaus.
 *
 * Zwei Stufen sorgen dafuer, dass das nicht passiert:
 *
 *   1. `dynamic(..., { ssr: false })` legt Karte und Kartendaten in ein eigenes
 *      Bundle. Ohne das behaelt der Bundler beides im Hauptpaket, selbst wenn
 *      nie etwas davon angezeigt wird.
 *   2. Der Beobachter unten laedt dieses Bundle erst, wenn der Abschnitt
 *      eine halbe Bildschirmhoehe entfernt ist. Bis dahin steht hier ein
 *      Platzhalter in exakt derselben Groesse — die Seite springt also nicht,
 *      wenn die Karte erscheint.
 *
 * Der Platzhalter ist bewusst kein Ladekringel: Ein sich drehendes Rad sagt
 * "warte", eine ruhige Flaeche sagt "hier kommt gleich etwas". Das Zweite ist
 * ehrlicher, weil hier nichts hakt.
 */

const Netz = dynamic(
  () => import("@/components/karte/netz-abschnitt").then((m) => m.NetzAbschnitt),
  { ssr: false },
);

const Partner = dynamic(
  () => import("@/components/karte/partner-karte").then((m) => m.PartnerKarte),
  { ssr: false },
);

export function KarteSpaeter({ art }: { art: "netz" | "partner" }) {
  const [sichtbar, setSichtbar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const hatBeobachter = "IntersectionObserver" in window;
    if (!hatBeobachter) {
      // Ohne Beobachter gibt es kein "wird gleich sichtbar" — dann eben
      // sofort. Der Umweg ueber das Zeitfenster ist kein Schoenheitsfehler,
      // sondern Absicht: Ein setState direkt im Effektkoerper loest eine
      // zweite Renderrunde noch vor dem ersten Bild aus. Hier ist es
      // gleichgueltig, denn dieser Zweig betrifft nur Browser, die es seit
      // Jahren nicht mehr gibt — aber die Regel gilt trotzdem, und eine
      // Ausnahme, die man einmal macht, macht man wieder.
      const zeitfenster = window.setTimeout(() => setSichtbar(true), 0);
      return () => window.clearTimeout(zeitfenster);
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0]?.isIntersecting) return;
        setSichtbar(true);
        beobachter.disconnect();
      },
      // Eine halbe Bildschirmhoehe Vorlauf: Beim ueblichen Scrolltempo ist
      // die Karte dann fertig, bevor sie zu sehen ist.
      { rootMargin: "50% 0px" },
    );
    beobachter.observe(element);
    return () => beobachter.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {sichtbar ? (
        art === "netz" ? (
          <Netz />
        ) : (
          <Partner />
        )
      ) : art === "netz" ? (
        // Der Platzhalter hat dieselbe Aufteilung wie das, was kommt: Karte
        // links, Ortsliste rechts, zusammen in genau der Hoehe des fertigen
        // Bauteils. Ein Platzhalter, der anders aussieht als das Ergebnis,
        // verursacht genau den Sprung, den er verhindern soll.
        <div className="karte-platzhalter-netz" aria-hidden>
          <div className="karte-platzhalter-feld" />
          <div className="karte-platzhalter-liste-netz" />
        </div>
      ) : (
        <div className="karten-gespann" aria-hidden>
          <div className="karte-platzhalter" />
          <div className="karte-platzhalter karte-platzhalter-liste" />
        </div>
      )}
    </div>
  );
}
