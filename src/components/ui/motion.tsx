"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Bewegungsbausteine — bewusst ohne Animationsbibliothek.
 *
 * Der Grossteil der Besucher kommt aus einer Instagram- oder TikTok-Story,
 * also mobil und ueber Mobilfunk. Eine Bibliothek fuer ein paar Einblendungen
 * kostet dort Ladezeit, die direkt auf die Absprungrate durchschlaegt.
 * IntersectionObserver und CSS koennen das genauso — in wenigen Kilobyte.
 */

function wenigerBewegung(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Blendet den Inhalt ein, sobald er ins Bild kommt.
 *
 * Der unsichtbare Startzustand wird erst im Browser gesetzt. Ohne
 * JavaScript — und bei abgeschalteter Bewegung — bleibt der Inhalt schlicht
 * sichtbar. Ein Abschnitt, der auf `opacity: 0` haengen bleibt, weil ein
 * Script nicht geladen hat, ist schlimmer als gar keine Animation.
 */
export function Reveal({
  children,
  verzug = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Verzoegerung in Millisekunden, fuer versetzt erscheinende Elemente. */
  verzug?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || wenigerBewegung() || !("IntersectionObserver" in window)) return;

    // Was schon im Bild steht, wird gar nicht erst versteckt. Sonst blitzt der
    // obere Seitenbereich beim Laden kurz weg und wieder herein.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    element.dataset.reveal = "aus";

    const zeigen = () => {
      element.dataset.reveal = "an";
    };

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue;
          zeigen();
          beobachter.unobserve(element);
        }
      },
      // Etwas frueher als die Kante ausloesen, damit die Bewegung beim
      // Scrollen schon laeuft, statt erst zu beginnen, wenn man hinsieht.
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    beobachter.observe(element);

    // Rettungsleine: Sollte der Beobachter aus irgendeinem Grund nie
    // ausloesen — verstecktes Fenster, exotischer Browser, ein Fehler in
    // dieser Datei — wird nach vier Sekunden trotzdem eingeblendet. Ein
    // Abschnitt, der dauerhaft auf opacity 0 haengt, ist schlimmer als jede
    // fehlende Animation.
    const notfall = window.setTimeout(zeigen, 4000);

    return () => {
      beobachter.disconnect();
      window.clearTimeout(notfall);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={verzug ? ({ "--reveal-verzug": `${verzug}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Zaehlt eine Zahl hoch, wenn sie ins Bild kommt.
 *
 * Die Zahl steht von Anfang an vollstaendig im Markup — die Animation
 * ueberschreibt sie nur kurzzeitig. Dadurch liest eine Suchmaschine und ein
 * Screenreader immer den richtigen Wert, egal ob JavaScript laeuft.
 */
export function CountUp({
  ziel,
  suffix = "",
  dauer = 1650,
  className = "",
}: {
  ziel: number;
  suffix?: string;
  dauer?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [wert, setWert] = useState<number | null>(null);
  /**
   * Wahr, sobald der Zaehler durch ist. Loest einmal einen Schein aus.
   *
   * Bewusst kein Dauerzustand mit Wiederholung: Der Moment, in dem die Zahl
   * ankommt, ist die Belohnung fuers Hinsehen. Ein Wert, der danach weiter
   * blinkt, ist eine Werbetafel.
   */
  const [fertig, setFertig] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || wenigerBewegung()) return;

    let rahmen = 0;
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0]?.isIntersecting) return;
        beobachter.disconnect();

        const start = performance.now();
        const schritt = (jetzt: number) => {
          const anteil = Math.min(1, (jetzt - start) / dauer);
          // Weich auslaufend statt linear — linear wirkt wie ein Zaehlwerk.
          // Vierte Potenz statt dritter: Der Anfang wird dadurch deutlich
          // schneller und das Ende deutlich langsamer, und genau das ist der
          // Unterschied zwischen "zaehlt hoch" und "kommt an".
          const geglaettet = 1 - Math.pow(1 - anteil, 4);
          setWert(Math.round(ziel * geglaettet));
          if (anteil < 1) {
            rahmen = requestAnimationFrame(schritt);
          } else {
            setWert(null);
            setFertig(true);
          }
        };
        rahmen = requestAnimationFrame(schritt);
      },
      { threshold: 0.5 },
    );

    beobachter.observe(element);
    return () => {
      beobachter.disconnect();
      cancelAnimationFrame(rahmen);
    };
  }, [ziel, dauer]);

  return (
    <span ref={ref} className={`${fertig ? "zahl-fertig " : ""}${className}`}>
      {/* Bewusst de-DE statt de-AT: Intl setzt fuer de-AT ein schmales
          geschuetztes Leerzeichen als Tausendertrennung ("18 000"), waehrend
          dieselbe Zahl an jeder anderen Stelle der Seite "19.700" heisst.
          Zwei Schreibweisen derselben Zahl auf einer Seite sehen nach Fehler
          aus — und diese Zahl ist das wichtigste Argument der Marke. */}
      {(wert ?? ziel).toLocaleString("de-DE")}
      {suffix}
    </span>
  );
}
