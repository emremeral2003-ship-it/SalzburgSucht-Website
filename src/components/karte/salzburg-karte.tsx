"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { kartenNamen } from "@/data/karte/beschriftung";
import {
  KARTE,
  REGION,
  STADT,
  ZOOM_GRENZEN,
  type Ausschnitt,
  ausschnittFuer,
  ausschnittUm,
  haufenBilden,
  type MarkerOrt,
  einpassen,
  klemmen,
  mischen,
  projizieren,
  sanft,
} from "@/lib/karte";
import { wenigerBewegung } from "@/lib/parallax";


/**
 * Die Karte von Salzburg. Grundlage beider Kartenabschnitte.
 *
 * ----------------------------------------------------------------------------
 * WARUM KEIN LEAFLET UND KEIN MAPLIBRE
 * ----------------------------------------------------------------------------
 * Beides sind gute Bibliotheken, und beide braeuchten hier eine Kachelquelle.
 * Jede Kachel ist ein Aufruf aus dem Browser des Besuchers zu einem fremden
 * Server — mit IP, Referrer und allem, was dazugehoert. Auf einer Seite mit
 * Einwilligungsbanner heisst das: entweder in den Datenschutztext und hinter
 * die Einwilligung, oder gar nicht. Und Kacheln bringen ihr eigenes Aussehen
 * mit, das man nicht umfaerben kann; das Tweaks-Panel haette auf die Karte
 * keinen Zugriff.
 *
 * Stattdessen liegt die Geometrie als vereinfachte SVG-Pfade im Projekt
 * (scripts/karten-geometrie.mjs). Acht Pfade, kein Netzverkehr, jede Farbe
 * ueber CSS steuerbar, in jeder Zoomstufe scharf.
 *
 * ----------------------------------------------------------------------------
 * WARUM WAEHREND DES ZIEHENS KEIN REACT-ZUSTAND ANGEFASST WIRD
 * ----------------------------------------------------------------------------
 * Beim Ziehen und Zoomen aendert sich genau eine Sache: der sichtbare
 * Ausschnitt. Wuerde der in useState liegen, rendert React bei jeder
 * Mausbewegung die gesamte Karte samt aller Marker neu — bei 60 Bildern je
 * Sekunde. Der Ausschnitt liegt deshalb in einem Ref, und die Bewegung wird
 * direkt auf das DOM geschrieben.
 *
 * Der zweite Teil desselben Gedankens: Marker und Beschriftungen duerfen NICHT
 * mitwachsen, wenn man hineinzoomt. Statt jedem der rund siebzig Elemente je
 * Bild eine eigene Gegenskalierung zu schreiben, bekommt die Buehne die
 * Zoomstufe als CSS-Variable `--z`, und jedes Element rechnet in CSS selbst
 * `scale(calc(1 / var(--z)))`. Ein Schreibvorgang je Bild statt siebzig.
 *
 * Dieselbe Variable steuert auch, welche Ortsnamen sichtbar sind: Jeder Name
 * kennt seine Mindestzoomstufe, und die Deckkraft ergibt sich aus der
 * Differenz. In der Uebersicht stehen nur Gemeinden, beim Herangehen kommen
 * die Stadtteile dazu. Ohne das ist die Karte entweder leer oder ein
 * Buchstabenbrei.
 */

/**
 * Die drei Farbwelten der Karte.
 *
 *   verstecke  helle Karte, rote Marker      — Detailkarte
 *   partner    helle Karte, blaue Marker     — Detailkarte auf /partner
 *   netz       dunkle Karte, BEIDE Ebenen    — die grosse Karte der Startseite
 *
 * `netz` ist der einzige Ton, in dem zwei Arten von Punkten nebeneinander
 * liegen. Dort entscheidet nicht mehr der Ton ueber die Markerfarbe, sondern
 * die Art des einzelnen Punktes.
 */
export type KartenTon = "verstecke" | "partner" | "netz";

type Eigenschaften = {
  orte: MarkerOrt[];
  /** Farbwelt. Siehe KartenTon. */
  ton: KartenTon;
  /** Nummern auf den Markern. Nur bei den Verstecken sinnvoll. */
  nummeriert?: boolean;
  /** Ausgewaehlter Ort. Die Karte fliegt dorthin. */
  aktiv: string | null;
  waehlen: (id: string | null) => void;
  /** Ort unter dem Mauszeiger — in der Liste oder auf der Karte. */
  betont: string | null;
  betonen: (id: string | null) => void;
  /** Was vorgelesen wird. */
  beschriftung: string;
  /**
   * Dicht beieinanderliegende Marker zu einer Gruppe zusammenfassen.
   *
   * Auf der Uebersicht liegen in der Altstadt ein Dutzend Punkte auf der
   * Flaeche einer Briefmarke. Ohne Gruppierung sieht man dort einen Klumpen
   * und kann keinen einzelnen davon treffen.
   */
  gruppieren?: boolean;
  /** Marker treten beim ersten Erscheinen versetzt ein. */
  auftritt?: boolean;
  /** Schwebt oben in der Karte — der Umschalter. */
  kopf?: ReactNode;
  /** Schwebt unten in der Karte — Legende und Detailfenster. */
  fuss?: ReactNode;
};

/** Wie lange der Flug zu einem Marker dauert. */
const FLUGDAUER = 720;

export function SalzburgKarte({
  orte,
  ton,
  nummeriert = false,
  aktiv,
  waehlen,
  betont,
  betonen,
  beschriftung,
  gruppieren = false,
  auftritt = false,
  kopf,
  fuss,
}: Eigenschaften) {
  const feldRef = useRef<HTMLDivElement>(null);
  const buehneRef = useRef<HTMLDivElement>(null);

  const ansicht = useRef<Ausschnitt>(STADT);
  const flug = useRef<number | null>(null);

  /**
   * Die Zoomstufe, gerundet auf halbe Oktaven — und nur dafuer da, die
   * Gruppierung neu zu rechnen.
   *
   * Der Ausschnitt selbst bleibt im Ref und wird waehrend des Ziehens direkt
   * aufs DOM geschrieben; daran aendert sich nichts. Dieser Zustand hier
   * springt nur, wenn sich die Stufe wirklich um einen Schritt aendert — beim
   * Ziehen also nie und beim Zoomen ein paar Mal. Ein Zustand, der jeden Wert
   * mitschreibt, waere genau der Fehler, den der Rest der Datei vermeidet.
   */
  const [zoomStufe, setZoomStufe] = useState(1);
  const letzteStufe = useRef(0);

  /** Seitenverhaeltnis des sichtbaren Felds. Bestimmt die Hoehe des Ausschnitts. */
  const verhaeltnis = useCallback(() => {
    const feld = feldRef.current;
    if (!feld) return 1.4;
    const kasten = feld.getBoundingClientRect();
    return kasten.height > 0 ? kasten.width / kasten.height : 1.4;
  }, []);

  /**
   * Den aktuellen Ausschnitt auf das DOM schreiben.
   *
   * Die einzige Stelle, die die Buehne bewegt. Alles andere — Ziehen, Zoomen,
   * Fliegen, Groessenaenderung des Fensters — aendert nur `ansicht.current`
   * und ruft das hier auf.
   */
  const anwenden = useCallback(() => {
    const feld = feldRef.current;
    const buehne = buehneRef.current;
    if (!feld || !buehne) return;

    const kasten = feld.getBoundingClientRect();
    if (kasten.width === 0) return;

    const a = einpassen(ansicht.current, kasten.width / kasten.height);
    ansicht.current = a;

    const z = kasten.width / a.w;
    const sichtHoehe = kasten.height / z;

    buehne.style.transform = `translate3d(${-a.x * z}px, ${-(a.y - sichtHoehe / 2) * z}px, 0) scale(${z})`;

    // Zwei Zahlen, zwei Aufgaben — sie werden gern verwechselt:
    //
    //   --px  Wie viele Kartenkoordinaten ein Bildschirmpunkt gerade misst.
    //         Das ist der Kehrwert der Skalierung oben. Alles, was NICHT
    //         mitwachsen soll — Marker, Ortsnamen, Strassenbreiten — rechnet
    //         damit zurueck: `scale(var(--px))` hebt die Skalierung der
    //         Buehne exakt auf, in jeder Zoomstufe und bei jeder Feldbreite.
    //
    //   --z   Zoomstufe im Verhaeltnis zur Uebersicht. 1 heisst "ganzer
    //         Ausschnitt im Bild". Daran haengt, was ueberhaupt sichtbar ist:
    //         Stadtteilnamen erst ab 1,7, Nebenstrassen ab 1,4.
    //
    // --px haengt von der Feldbreite ab, --z nicht. Deshalb sind es zwei.
    const stufe = KARTE.breite / a.w;
    buehne.style.setProperty("--px", String(a.w / kasten.width));
    buehne.style.setProperty("--z", String(stufe));

    // Dieselbe Zoomstufe, aber gewichtet nach der Breite des Felds — und nur
    // fuer die Ortsnamen.
    //
    // Der Grund: Wie viele Namen nebeneinander lesbar sind, haengt nicht am
    // Zoom, sondern am Platz. Auf einem Telefon ist die Karte halb so breit
    // wie am Schreibtisch und zeigte bei gleicher Stufe trotzdem dieselben
    // sechsundzwanzig Namen — doppelt so dicht, also Buchstabensalat.
    //
    // Die Wurzel statt eines geraden Verhaeltnisses, weil Beschriftung in
    // zwei Richtungen Platz braucht: Halbe Breite heisst nicht halb so viele
    // Namen, sondern rund siebzig Prozent. 700 ist die Breite, bei der die
    // Abstufung in beschriftung.ts eingestellt wurde — dort aendert sich
    // nichts.
    const dichte = klemmen(Math.sqrt(kasten.width / 700), 0.55, 1.15);
    buehne.style.setProperty("--z-namen", String(stufe * dichte));

    // Halbe Oktaven: 1 → 0, 1,41 → 1, 2 → 2. Feiner braucht die Gruppierung
    // nicht zu sein, und jeder Schritt kostet ein Rendern.
    const schritt = Math.round(Math.log2(stufe) * 2);
    if (schritt !== letzteStufe.current) {
      letzteStufe.current = schritt;
      setZoomStufe(Math.pow(2, schritt / 2));
    }
  }, []);

  /**
   * Zu einem Ausschnitt fliegen.
   *
   * Bei abgeschalteter Bewegung wird gesprungen. Das ist kein Verzicht auf die
   * Funktion, sondern ihr Ergebnis ohne die Bewegung — der Ort ist danach
   * genauso zu sehen.
   */
  const fliegen = useCallback(
    (nach: Ausschnitt) => {
      if (flug.current) cancelAnimationFrame(flug.current);

      const ziel = einpassen(nach, verhaeltnis());
      if (wenigerBewegung()) {
        ansicht.current = ziel;
        anwenden();
        return;
      }

      const von = ansicht.current;
      const start = performance.now();

      const schritt = (jetzt: number) => {
        const t = klemmen((jetzt - start) / FLUGDAUER, 0, 1);
        ansicht.current = mischen(von, ziel, sanft(t));
        anwenden();
        if (t < 1) flug.current = requestAnimationFrame(schritt);
        else flug.current = null;
      };
      flug.current = requestAnimationFrame(schritt);
    },
    [anwenden, verhaeltnis],
  );

  /* --- Erste Darstellung und Groessenaenderungen ------------------------- */

  useEffect(() => {
    anwenden();
    const feld = feldRef.current;
    if (!feld || !("ResizeObserver" in window)) return;

    const beobachter = new ResizeObserver(() => anwenden());
    beobachter.observe(feld);
    return () => beobachter.disconnect();
  }, [anwenden]);

  useEffect(() => {
    return () => {
      if (flug.current) cancelAnimationFrame(flug.current);
    };
  }, []);

  /* --- Flug zum ausgewaehlten Ort ---------------------------------------- */

  useEffect(() => {
    if (!aktiv) return;
    const ort = orte.find((o) => o.id === aktiv);
    if (!ort) return;
    const ziel = ausschnittFuer(ort);
    if (ziel) fliegen(ziel);
  }, [aktiv, orte, fliegen]);

  /* --- Ziehen ------------------------------------------------------------ */

  /**
   * Beim Ziehen steht `touch-action: pan-y` am Feld (siehe globals.css).
   *
   * Damit behaelt der Browser das senkrechte Wischen fuer sich und die Seite
   * scrollt auf dem Telefon immer weiter. Eine Karte, die den Finger
   * einfaengt und die Seite blockiert, ist der haeufigste Grund, warum Karten
   * auf Telefonen aergerlich sind. Der Preis ist, dass man auf dem Telefon
   * nicht senkrecht schieben kann — dafuer gibt es die Liste und die Knoepfe,
   * und beide fuehren schneller zum Ziel als jedes Wischen.
   */
  useEffect(() => {
    const feld = feldRef.current;
    if (!feld) return;

    let zeiger: number | null = null;
    let letzteX = 0;
    let letzteY = 0;
    let gezogen = false;

    const runter = (e: PointerEvent) => {
      if (e.button !== 0) return;
      zeiger = e.pointerId;
      letzteX = e.clientX;
      letzteY = e.clientY;
      gezogen = false;
      if (flug.current) {
        cancelAnimationFrame(flug.current);
        flug.current = null;
      }
    };

    const bewegen = (e: PointerEvent) => {
      if (zeiger !== e.pointerId) return;
      const dx = e.clientX - letzteX;
      const dy = e.clientY - letzteY;
      if (!gezogen && Math.hypot(dx, dy) < 4) return;

      if (!gezogen) {
        gezogen = true;
        feld.setPointerCapture(e.pointerId);
        feld.dataset.zieht = "ja";
      }

      const kasten = feld.getBoundingClientRect();
      const z = kasten.width / ansicht.current.w;
      ansicht.current = {
        ...ansicht.current,
        x: ansicht.current.x - dx / z,
        y: ansicht.current.y - dy / z,
      };
      anwenden();

      letzteX = e.clientX;
      letzteY = e.clientY;
    };

    const hoch = (e: PointerEvent) => {
      if (zeiger !== e.pointerId) return;
      if (gezogen && feld.hasPointerCapture(e.pointerId)) {
        feld.releasePointerCapture(e.pointerId);
      }
      zeiger = null;
      delete feld.dataset.zieht;
    };

    feld.addEventListener("pointerdown", runter);
    feld.addEventListener("pointermove", bewegen);
    feld.addEventListener("pointerup", hoch);
    feld.addEventListener("pointercancel", hoch);
    return () => {
      feld.removeEventListener("pointerdown", runter);
      feld.removeEventListener("pointermove", bewegen);
      feld.removeEventListener("pointerup", hoch);
      feld.removeEventListener("pointercancel", hoch);
    };
  }, [anwenden]);

  /* --- Rad --------------------------------------------------------------- */

  /**
   * Zoomen nur mit gedrueckter Strg- oder Cmd-Taste.
   *
   * Eine Karte, die beim normalen Scrollen zoomt, faengt die Seite ein: Man
   * will an ihr vorbei nach unten und bleibt stattdessen darin haengen. Das
   * ist dieselbe Regel, die eingebettete Karten seit Jahren verwenden, und sie
   * ist richtig. Ohne Zusatztaste scrollt die Seite wie ueberall sonst.
   */
  useEffect(() => {
    const feld = feldRef.current;
    if (!feld) return;

    const rad = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const kasten = feld.getBoundingClientRect();
      const a = ansicht.current;
      const z = kasten.width / a.w;
      const sichtHoehe = kasten.height / z;

      // Der Punkt unter dem Zeiger soll unter dem Zeiger bleiben. Ohne das
      // wandert beim Zoomen alles zur Mitte und man verliert die Stelle,
      // die man sich gerade ansieht.
      const zeigerX = a.x + (e.clientX - kasten.left) / z;
      const zeigerY = a.y - sichtHoehe / 2 + (e.clientY - kasten.top) / z;

      const faktor = Math.exp(e.deltaY * 0.0016);
      const neueBreite = klemmen(
        a.w * faktor,
        ZOOM_GRENZEN.engste,
        ZOOM_GRENZEN.weiteste,
      );
      const anteil = neueBreite / a.w;

      ansicht.current = {
        x: zeigerX - (zeigerX - a.x) * anteil,
        y: zeigerY - (zeigerY - a.y) * anteil,
        w: neueBreite,
      };
      anwenden();
    };

    feld.addEventListener("wheel", rad, { passive: false });
    return () => feld.removeEventListener("wheel", rad);
  }, [anwenden]);

  /* --- Knoepfe ----------------------------------------------------------- */

  const stufen = useCallback(
    (faktor: number) => {
      const a = ansicht.current;
      fliegen({ ...a, w: a.w * faktor });
    },
    [fliegen],
  );

  const punkte = useMemo(
    () =>
      orte
        .filter((o) => o.breite !== null && o.laenge !== null)
        // Feste Reihenfolge, damit die gierige Gruppierung bei gleicher
        // Zoomstufe immer dasselbe Ergebnis liefert.
        .sort((a, b) => a.id.localeCompare(b.id)),
    [orte],
  );

  const haufen = useMemo(
    () =>
      gruppieren
        ? haufenBilden(punkte, zoomStufe)
        : punkte.map((ort) => {
            const p = projizieren(ort.breite as number, ort.laenge as number);
            return { id: ort.id, x: p.x, y: p.y, mitglieder: [ort] };
          }),
    [punkte, zoomStufe, gruppieren],
  );

  return (
    <div className="karte-huelle" data-ton={ton} data-auftritt={auftritt ? "ja" : undefined}>
      <div
        ref={feldRef}
        className="karte-feld"
        role="application"
        aria-label={beschriftung}
        aria-roledescription="Karte"
      >
        <div ref={buehneRef} className="karte-buehne">
          <svg
            className="karte-grund"
            viewBox={`0 0 ${KARTE.breite} ${KARTE.hoehe}`}
            width={KARTE.breite}
            height={KARTE.hoehe}
            aria-hidden
            focusable="false"
          >
            {/* Reihenfolge ist Bildaufbau: Flaechen unten, Linien darueber,
                die Stadtgrenze zuletzt, damit sie ueber allem liegt. */}
            <path className="karte-gruen" d={KARTE.ebenen.gruen} fillRule="evenodd" />
            <path className="karte-park" d={KARTE.ebenen.parks} fillRule="evenodd" />
            <path className="karte-seen" d={KARTE.ebenen.seen} fillRule="evenodd" />
            <path className="karte-strasse-neben" d={KARTE.ebenen.nebenstrassen} />
            <path className="karte-strasse-haupt" d={KARTE.ebenen.hauptstrassen} />
            <path className="karte-bahn" d={KARTE.ebenen.bahn} />
            <path className="karte-fluss" d={KARTE.ebenen.wasser} />
            <path className="karte-grenze" d={KARTE.ebenen.grenze} />
          </svg>

          {/* Ortsnamen. Bewusst HTML und kein SVG-Text: So bleiben sie in der
              Schrift der Seite, skalieren nicht mit und lassen sich ueber
              dieselben Tokens gestalten wie alles andere. */}
          {kartenNamen.map((name) => {
            const p = projizieren(name.breite, name.laenge);
            return (
              <span
                key={name.text}
                className="karte-name"
                data-rang={name.rang}
                aria-hidden
                style={
                  {
                    "--x": `${p.x}px`,
                    "--y": `${p.y}px`,
                    "--ab": name.ab,
                  } as React.CSSProperties
                }
              >
                {name.text}
              </span>
            );
          })}

          {haufen.map((gruppe, index) => {
            const einzeln = gruppe.mitglieder.length === 1;
            const ort = gruppe.mitglieder[0];
            const art = ort.art;

            /* --- Eine Gruppe --------------------------------------------- */
            if (!einzeln) {
              const namen = gruppe.mitglieder.map((m) => m.name).join(", ");
              return (
                <button
                  key={gruppe.id}
                  type="button"
                  className="karte-marker karte-gruppe"
                  data-art={art}
                  style={
                    {
                      "--x": `${gruppe.x}px`,
                      "--y": `${gruppe.y}px`,
                      "--i": index,
                    } as React.CSSProperties
                  }
                  // Auf die Gruppe zoomen, bis sie auseinanderfaellt. Das ist
                  // die einzige Handlung, die eine Gruppe anbieten darf —
                  // welchen der sieben Orte man meint, weiss sie ja nicht.
                  onClick={() => {
                    waehlen(null);
                    fliegen(ausschnittUm(gruppe.mitglieder, 0.5));
                  }}
                >
                  <span className="karte-marker-punkt">{gruppe.mitglieder.length}</span>
                  <span className="sr-only">
                    {gruppe.mitglieder.length} Orte dicht beieinander: {namen} — näher
                    heranzoomen
                  </span>
                </button>
              );
            }

            /* --- Ein einzelner Ort --------------------------------------- */
            return (
              <button
                key={gruppe.id}
                type="button"
                className="karte-marker"
                data-art={art}
                data-aktiv={aktiv === ort.id ? "ja" : undefined}
                data-betont={betont === ort.id ? "ja" : undefined}
                data-genauigkeit={ort.genauigkeit}
                data-mehrfach={ort.mehrfach ? "ja" : undefined}
                style={
                  {
                    "--x": `${gruppe.x}px`,
                    "--y": `${gruppe.y}px`,
                    "--i": index,
                    // Gebundener Versatz fuer den Puls: 0 bis knapp 1, und
                    // zwar in sieben Stufen. Eine unbegrenzt wachsende
                    // Verzoegerung waere dasselbe wie kein Puls — der letzte
                    // Marker faengt dann irgendwann in der naechsten Minute an.
                    "--takt": ((index % 7) / 7).toFixed(3),
                  } as React.CSSProperties
                }
                onClick={() => waehlen(aktiv === ort.id ? null : ort.id)}
                onPointerEnter={() => betonen(ort.id)}
                onPointerLeave={() => betonen(null)}
                onFocus={() => betonen(ort.id)}
                onBlur={() => betonen(null)}
              >
                <span className="karte-marker-punkt">
                  {nummeriert && ort.nr !== undefined ? ort.nr : null}
                </span>
                <span className="karte-marker-name">{ort.name}</span>
                <span className="sr-only">
                  {ort.name}
                  {ort.zusatz ? `, ${ort.zusatz}` : ""} — auf der Karte zeigen
                </span>
              </button>
            );
          })}
        </div>

        {/* Zwei Ringe, die einmal ueber die Karte laufen, wenn sie erscheint.
            Sie kommen aus dem Salzburg-Signal und sagen hier dasselbe wie
            ueberall sonst: Hier wird gesucht. Nach gut anderthalb Sekunden ist
            Ruhe, und sie kommen nicht wieder. */}
        {auftritt ? (
          <>
            <span className="karte-ring" aria-hidden />
            <span className="karte-ring karte-ring-zwei" aria-hidden />
          </>
        ) : null}

        {kopf ? <div className="karte-kopf">{kopf}</div> : null}
        {fuss ? <div className="karte-fuss">{fuss}</div> : null}

        <div className="karte-knoepfe">
          <button
            type="button"
            onClick={() => stufen(0.62)}
            aria-label="Näher heranzoomen"
            title="Näher heran"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => stufen(1.62)}
            aria-label="Weiter herauszoomen"
            title="Weiter heraus"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              waehlen(null);
              fliegen(STADT);
            }}
            aria-label="Zurück auf die Stadt Salzburg"
            title="Stadt"
          >
            <span aria-hidden>◎</span>
          </button>
          <button
            type="button"
            onClick={() => {
              waehlen(null);
              fliegen(REGION);
            }}
            aria-label="Ganzes Gebiet mit dem Umland zeigen"
            title="Umland"
          >
            <span aria-hidden>▣</span>
          </button>
        </div>

        {/* Lizenzbedingung der ODbL, kein Hoeflichkeitshinweis: Wer die Daten
            benutzt, nennt die Quelle sichtbar. */}
        <p className="karte-quelle">
          Kartengrundlage:{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">
            OpenStreetMap
          </a>
          -Mitwirkende
        </p>

        <p className="karte-hinweis" aria-hidden>
          Ziehen zum Verschieben · Strg + Rad zum Zoomen
        </p>
      </div>
    </div>
  );
}
