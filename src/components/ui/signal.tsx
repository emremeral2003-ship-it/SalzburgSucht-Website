"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { anmelden, anmeldenFortschritt, wenigerBewegung } from "@/lib/parallax";

/**
 * ===========================================================================
 * SALZBURG SIGNAL
 * ===========================================================================
 *
 * Die eigene visuelle Sprache der Marke. Sie kommt nicht aus einer
 * Effektsammlung, sondern aus dem Namen: **suchen, finden, senden**. Ein
 * Signal geht raus, etwas antwortet, irgendwo in Salzburg passiert gerade
 * etwas.
 *
 * Das System besteht aus vier Bausteinen, die immer dieselben bleiben:
 *
 *   Kontur    sehr feine Linien — Topografie und Stadtraster ineinander.
 *             Kein Stadtplan, keine Alpen, keine Silhouette. Abstrakt.
 *   Radar     konzentrische Ringe um einen Punkt. Das Motiv aus dem Logo.
 *   Spur      eine Linie, die sich beim Scrollen selbst zeichnet.
 *   Punkt     der Beacon: ein kleiner heller Punkt, der auftaucht, einmal
 *             sendet und wieder ruhig wird.
 *
 * Die wichtigste Regel steht nicht im Code, sondern in der Verteilung: **Nicht
 * jeder Abschnitt bekommt alles.** Der Ablauf-Abschnitt bekommt fast nichts,
 * weil er der Ruhepunkt der Seite ist. Wenn ueberall etwas leuchtet, ist
 * nirgends mehr etwas besonders.
 *
 * Die zweite Regel: Deckkraft zwischen 0,02 und 0,06 auf hellen Flaechen.
 * Wer den Hintergrund bewusst wahrnimmt, sieht nicht mehr den Inhalt.
 *
 * Alles hier ist `aria-hidden` und ohne Zeigerereignisse. Es ist Dekor, kein
 * Inhalt — und es verliert jede Bewegung, wenn jemand weniger Bewegung
 * eingestellt hat: die Formen bleiben, das Laufen hoert auf.
 */

/* ==========================================================================
   Flaechen — die stehenden Hintergrundformen
   ========================================================================== */

/**
 * Abstrakte Konturen: Hoehenlinien, die sich mit einem lockeren Stadtraster
 * kreuzen.
 *
 * Die Knoten sitzen rechnerisch auf den Schnittpunkten der geraden Linien
 * beziehungsweise auf einem Kurvenendpunkt — nicht "ungefaehr dort". Bei vier
 * Prozent Deckkraft sieht das niemand nach, aber ein Punkt neben seiner Linie
 * ist der Unterschied zwischen gezeichnet und hingeworfen.
 *
 * `slice` statt `none`: Der erste Entwurf hat die Zeichnung auf die
 * Containerbreite gezerrt. Fuer Linien ist das gleichgueltig, fuer die Knoten
 * nicht — aus jedem Kreis wurde eine Ellipse, und das Radarmotiv der Marke
 * besteht aus Kreisen. `slice` fuellt die Flaeche genauso vollstaendig,
 * beschneidet dafuer den Ueberstand. Beschnitten sieht man nicht, verzerrt
 * schon.
 */
function KonturZeichnung() {
  return (
    <svg viewBox="0 0 600 400" fill="none" preserveAspectRatio="xMidYMid slice" className="size-full">
      <g stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke">
        {/* Hoehenlinien */}
        <path d="M-20 300 C 80 250, 150 268, 232 214 S 380 150, 620 172" />
        <path d="M-20 336 C 90 288, 168 306, 250 250 S 396 186, 620 208" />
        <path d="M-20 372 C 100 326, 186 344, 268 286 S 412 222, 620 244" />
        {/* Stadtraster */}
        <path d="M100 -20 L 300 420" opacity="0.7" />
        <path d="M560 -20 L 380 420" opacity="0.7" />
        <path d="M-20 140 L 620 96" opacity="0.7" />
      </g>
      <g fill="currentColor">
        <circle cx="166.9" cy="127.1" r="3" />
        <circle cx="509.4" cy="103.6" r="2.2" />
        <circle cx="232" cy="214" r="2.6" />
      </g>
      <circle
        cx="166.9"
        cy="127.1"
        r="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Radar: konzentrische Ringe mit Peilstrichen. Das Logomotiv, vergroessert. */
function RadarZeichnung() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="size-full">
      <g stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <circle cx="200" cy="200" r="46" />
        <circle cx="200" cy="200" r="94" opacity="0.8" />
        <circle cx="200" cy="200" r="146" opacity="0.6" />
        <circle cx="200" cy="200" r="196" opacity="0.4" />
        {/* Peilstriche, bewusst nicht als durchgehendes Kreuz — ein Fadenkreuz
            ueber die ganze Flaeche liest sich als Zielvorrichtung. */}
        <path d="M200 4 v22 M200 374 v22 M4 200 h22 M374 200 h22" opacity="0.8" />
      </g>
      <circle cx="200" cy="200" r="4" fill="currentColor" />
    </svg>
  );
}

/**
 * Waagrechte Signalspuren mit einzelnen Knoten.
 *
 * Fuer den Partnerbereich: Die Aussage ist "lokales Netz", nicht
 * "Netzwerkdiagramm". Deshalb laufen die Spuren parallel und werden nicht
 * untereinander verbunden — sonst entsteht ein Graph, und ein Graph zieht den
 * Blick von den Namen weg, um die es dort geht.
 */
function SpurenZeichnung() {
  return (
    <svg viewBox="0 0 800 200" fill="none" preserveAspectRatio="xMidYMid slice" className="size-full">
      <g stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke">
        <path d="M-20 44 C 180 34, 420 58, 820 40" />
        <path d="M-20 104 C 220 118, 500 88, 820 108" opacity="0.75" />
        <path d="M-20 162 C 160 152, 460 176, 820 158" opacity="0.55" />
      </g>
      <g fill="currentColor">
        <circle cx="148" cy="41.4" r="2.6" />
        <circle cx="470" cy="52.7" r="2" />
        <circle cx="292" cy="107.6" r="2.4" />
        <circle cx="640" cy="97.2" r="2" />
        <circle cx="214" cy="155.6" r="2.2" />
      </g>
    </svg>
  );
}

const zeichnungen = {
  kontur: KonturZeichnung,
  radar: RadarZeichnung,
  spuren: SpurenZeichnung,
} as const;

export type SignalArt = keyof typeof zeichnungen;

/**
 * Eine Hintergrundflaeche des Signalsystems.
 *
 * `staerke` ist der Parallaxanteil. Er bleibt bewusst klein: Ueber die Hoehe
 * eines Abschnitts ergeben 0,03 rund 25 bis 35 Pixel Weg. Das ist genug, dass
 * der Hintergrund beim Scrollen atmet, und zu wenig, dass man ihn als Effekt
 * erkennt.
 */
export function SignalFeld({
  art,
  className,
  staerke = 0.03,
  deckkraft = 0.045,
  ton = "dunkelblau",
  reagiert = false,
}: {
  art: SignalArt;
  className: string;
  staerke?: number;
  deckkraft?: number;
  ton?: "dunkelblau" | "hell";
  /**
   * Enthuellungsebene: Deckkraft und Maske kommen dann vollstaendig aus dem
   * Stylesheet (`.signal-reagiert`), damit der Abschnitt sie ueber sein
   * `data-zeiger` ein- und ausblenden kann. Eine Deckkraft im Stilattribut
   * wuerde jede Regel dazu schlagen — Inline gewinnt gegen Klassen.
   */
  reagiert?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Zeichnung = zeichnungen[art];

  useEffect(() => {
    if (!ref.current) return;
    return anmelden(ref.current, staerke);
  }, [staerke]);

  return (
    <div
      ref={ref}
      aria-hidden
      /* Die Deckkraft laeuft ueber --signal-kraft, damit sich die Staerke
         der gesamten Signalebene an einer Stelle regeln laesst statt an
         achtzehn einzelnen Zahlen ueber die Seite verteilt. */
      style={
        reagiert
          ? undefined
          : ({ opacity: `calc(${deckkraft} * var(--signal-kraft, 1))` } as React.CSSProperties)
      }
      className={`parallax pointer-events-none absolute -z-10 ${
        ton === "hell" ? "text-primary" : "text-primary-deep"
      } ${className}`}
    >
      <Zeichnung />
    </div>
  );
}

/* ==========================================================================
   Die Spur — zeichnet sich beim Scrollen
   ========================================================================== */

/**
 * Ein Pfad, der sich zeichnet, waehrend man an ihm vorbeiscrollt.
 *
 * Der Trick steckt in `pathLength={1}`: Damit misst der Browser die Laenge des
 * Pfades selbst und normiert sie auf eins. Das Stylesheet kann dann
 * `stroke-dashoffset: calc(1 - var(--sig-fortschritt))` schreiben — ohne dass
 * JavaScript jemals `getTotalLength()` aufrufen und damit ein Layout erzwingen
 * muesste. Der einzige geschriebene Wert ist eine Zahl zwischen null und eins,
 * und die kommt aus dem gemeinsamen Scroll-Takt in src/lib/parallax.ts.
 *
 * Darunter liegt dieselbe Linie blass und vollstaendig. Ohne sie wirkt die
 * Spur wie ein Fehler, der langsam behoben wird — mit ihr wie ein Weg, der
 * abgefahren wird.
 */
export function SignalSpur({
  d,
  viewBox = "0 0 600 400",
  className,
  von,
  bis,
  deckkraft = 0.5,
  ton = "dunkelblau",
  mitKopf = true,
}: {
  d: string;
  viewBox?: string;
  className: string;
  von?: number;
  bis?: number;
  deckkraft?: number;
  ton?: "dunkelblau" | "hell";
  /** Laesst einen Leuchtpunkt an der Spitze der Linie mitlaufen. */
  mitKopf?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return anmeldenFortschritt(ref.current, { von, bis });
  }, [von, bis]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ opacity: `calc(${deckkraft} * var(--signal-kraft, 1))` } as React.CSSProperties}
      className={`pointer-events-none absolute -z-10 ${
        ton === "hell" ? "text-primary" : "text-primary-dark"
      } ${className}`}
    >
      <svg viewBox={viewBox} fill="none" preserveAspectRatio="none" className="size-full">
        {/* Die blasse Vollstrecke: Sie zeigt, wohin das Signal noch laeuft. */}
        <path
          d={d}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.34"
        />
        {/* Ein breiter, sehr schwacher Zwilling unter der Linie. Er ersetzt
            einen Weichzeichner: Ein `filter` muesste bei jedem Scrollschritt
            neu berechnet werden, zwei Striche kosten nichts. */}
        <path
          d={d}
          pathLength={1}
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.18"
          className="signal-spur"
        />
        <path
          d={d}
          pathLength={1}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="signal-spur"
        />

        {/* Der Kopf des Signals — der eine Punkt, der die Linie von einer
            Grafik in einen Vorgang verwandelt.

            Er ist kein eigenes Element, sondern derselbe Pfad mit einem
            Strichmuster aus genau einem Punkt: `stroke-dasharray: 0.001 1`
            bei `pathLength=1` ergibt mit runder Strichkappe einen Kreis, und
            der Strichversatz schiebt ihn an die Stelle, die dem
            Scrollfortschritt entspricht. Damit laufen Linie und Kopf
            zwangslaeufig synchron: Es ist dieselbe Zahl und derselbe Pfad. */}
        {mitKopf ? (
          <>
            <path
              d={d}
              pathLength={1}
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.22"
              className="signal-kopf"
            />
            <path
              d={d}
              pathLength={1}
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className="signal-kopf"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}

/* ==========================================================================
   Der Beacon
   ========================================================================== */

/**
 * Setzt `data-an` genau einmal, sobald das Element ins Bild kommt.
 *
 * Drei Bausteine des Signalsystems brauchen dasselbe Verhalten — Punkt, Welle
 * und Blitz —, und dreimal derselbe Beobachter waere dreimal dieselbe
 * Rettungsleine, die beim naechsten Mal an zwei Stellen nachgezogen wird.
 *
 * `sofort` statt `ja` heisst: Es gab keinen Beobachter oder es darf sich
 * nichts bewegen. Das Element steht dann einfach an seinem Platz, statt zu
 * fehlen. Bewegung abschalten heisst, das Ergebnis zu zeigen — nicht, es
 * wegzulassen.
 */
function useEinmalSichtbar<T extends HTMLElement>(schwelle = 0.15, rand = "0px") {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (wenigerBewegung() || !("IntersectionObserver" in window)) {
      element.dataset.an = "sofort";
      return;
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0]?.isIntersecting) return;
        element.dataset.an = "ja";
        beobachter.disconnect();
      },
      { threshold: schwelle, rootMargin: rand },
    );
    beobachter.observe(element);

    // Rettungsleine fuer Umgebungen, in denen der Beobachter nie meldet.
    const notfall = window.setTimeout(() => {
      if (!element.dataset.an) element.dataset.an = "sofort";
    }, 3000);

    return () => {
      beobachter.disconnect();
      window.clearTimeout(notfall);
    };
  }, [schwelle, rand]);

  return ref;
}

/**
 * Der Signalpunkt.
 *
 * Er ist das eine Element, das der Besucher unbewusst wiedererkennen soll:
 * heller Kern, feiner Aussenring, weicher Schein — das Radarmotiv der Marke
 * in klein. Er taucht an ausgewaehlten Stellen auf, sendet einmal einen Ring
 * aus und wird wieder ruhig. Er ist **nicht** dauerhaft in Bewegung: Ein
 * Punkt, der ohne Unterlass pulsiert, ist ein Ladeindikator.
 *
 * Er erscheint erst, wenn sein Abschnitt ins Bild kommt — und genau einmal.
 * Wer zurueckscrollt, bekommt keine zweite Vorstellung.
 */
export function SignalPunkt({
  className,
  groesse = 10,
  verzug = 0,
  ton = "hell",
  ruhig = false,
}: {
  className: string;
  /** Durchmesser in Pixeln. */
  groesse?: number;
  /** Wartezeit nach dem Sichtbarwerden, in Millisekunden. */
  verzug?: number;
  ton?: "hell" | "dunkel";
  /** Ohne ausgesendeten Ring — nur auftauchen. */
  ruhig?: boolean;
}) {
  const ref = useEinmalSichtbar<HTMLSpanElement>(0.2, "0px 0px -10% 0px");

  return (
    <span
      ref={ref}
      aria-hidden
      style={
        {
          "--punkt-groesse": `${groesse}px`,
          "--punkt-verzug": `${verzug}ms`,
        } as CSSProperties
      }
      className={`signal-punkt ${ton === "dunkel" ? "signal-punkt-dunkel" : ""} ${
        ruhig ? "" : "signal-punkt-sendet"
      } ${className}`}
    />
  );
}

/**
 * Ringe, die sich beim ersten Sichtbarwerden einmal nach aussen ausbreiten —
 * und danach nicht mehr.
 *
 * Fuer die Stellen, an denen das Signal etwas Groesseres sagen soll: das
 * Radar im Zahlenband, die Community, die waechst, der Abschluss, an dem die
 * Reise endet. Am Schluss stehen die Ringe konzentrisch und ruhig da — das
 * ist der Unterschied zu einem laufenden Radar, das nie fertig wird.
 *
 * `ringe` steuert, wie gross das Ereignis ist. Drei sind der Normalfall,
 * fuenf gehoeren genau einer Stelle auf der Seite: dem staerksten Moment beim
 * Eintritt in die dunkle Flaeche.
 */
export function SignalWelle({
  className,
  ton = "dunkelblau",
  dauer = 2600,
  verzug = 0,
  ringe = 3,
}: {
  className: string;
  ton?: "dunkelblau" | "hell";
  dauer?: number;
  verzug?: number;
  ringe?: 3 | 5;
}) {
  const ref = useEinmalSichtbar<HTMLSpanElement>(0.12);

  return (
    <span
      ref={ref}
      aria-hidden
      style={
        {
          "--welle-dauer": `${dauer}ms`,
          "--welle-verzug": `${verzug}ms`,
        } as CSSProperties
      }
      className={`signal-welle ${ringe === 5 ? "signal-welle-weit" : ""} ${
        ton === "hell" ? "signal-welle-hell" : ""
      } ${className}`}
    >
      {Array.from({ length: ringe }, (_, i) => (
        <span key={i} className="signal-welle-ring" />
      ))}
    </span>
  );
}

/**
 * Gibt dem umgebenden Abschnitt `--sig-fortschritt`.
 *
 * Damit koennen Flaechen selbst auf das Scrollen reagieren, ohne dass dafuer
 * ein zusaetzliches Element im Markup steht: Das Raster der dunklen Flaeche
 * verschiebt sich zum Beispiel um wenige Pixel, waehrend man daran
 * vorbeilaeuft (`.netz-lauf` im Stylesheet).
 *
 * Die Komponente rendert nichts Sichtbares und meldet ihr Elternelement beim
 * gemeinsamen Scroll-Takt an — derselbe Weg, den auch das Zeigerlicht nimmt.
 * Ein eigener Beobachter pro Flaeche waere ein zweiter Takt fuer dieselbe
 * Zahl.
 */
export function SignalTakt({ von = 0, bis = 1 }: { von?: number; bis?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const eltern = ref.current?.parentElement;
    if (!eltern) return;
    return anmeldenFortschritt(eltern, { von, bis });
  }, [von, bis]);

  return <span ref={ref} aria-hidden className="hidden" />;
}

/**
 * Ein einmaliges Aufhellen einer Hintergrundflaeche.
 *
 * Gedacht fuer das Raster der dunklen Flaeche: Wenn das Signal dort ankommt,
 * werden die Linien fuer gut eine Sekunde deutlich heller und gehen dann
 * wieder zurueck. Das ist der Unterschied zwischen einem Hintergrund, der da
 * ist, und einem, der reagiert.
 *
 * Genau einmal, beim ersten Sichtbarwerden. Wer zurueckscrollt, bekommt keine
 * Wiederholung — sonst waere aus einem Ereignis eine Schleife geworden.
 */
export function SignalBlitz({
  className = "",
  verzug = 0,
}: {
  /** Optional — der Blitz deckt sonst den ganzen Abschnitt ab. */
  className?: string;
  verzug?: number;
}) {
  const ref = useEinmalSichtbar<HTMLSpanElement>(0.2);

  return (
    <span
      ref={ref}
      aria-hidden
      style={{ "--blitz-verzug": `${verzug}ms` } as CSSProperties}
      className={`signal-blitz ${className}`}
    />
  );
}

/**
 * Huelle fuer den Auftritt im Hero.
 *
 * Sie tut nichts weiter, als ihren Kindern eine gemeinsame Startzeit zu geben:
 * Alles darin blendet sich in den ersten anderthalb Sekunden nach dem Laden
 * auf, gestaffelt. Das ist der Signature Moment — kein Vorspann, kein
 * Ladebild, nur eine Flaeche, die sich einmal einschaltet.
 *
 * Sie ist ein echter Kasten und nicht `display: contents`, weil eine Huelle
 * ohne Kasten keine Deckkraft haben kann — und genau die wird hier animiert.
 * Er deckt den Abschnitt vollstaendig ab, sodass die absolut positionierten
 * Kinder dieselben Bezugskanten haben wie vorher.
 *
 * Das Zeigerlicht gehoert bewusst NICHT hier hinein: Es haengt seine
 * Zeigerereignisse an sein Elternelement, und ein Elternteil ohne
 * Zeigerereignisse bekommt keine.
 */
export function SignalStart({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden className="signal-start pointer-events-none absolute inset-0 -z-10">
      {children}
    </div>
  );
}
