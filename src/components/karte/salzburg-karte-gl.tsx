"use client";

import * as maplibregl from "maplibre-gl";
// Das mitgelieferte Stylesheet. Es wird hier importiert und nicht global:
// So laedt es nur mit dem Kartenpaket und liegt nicht auf jeder Seite.
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  ANBIETER,
  EBENEN_FARBEN,
  GRUPPEN_BIS,
  GRUPPEN_RADIUS,
  RAHMEN,
  START,
  STILE,
  ZOOM,
  alsSammlung,
  type StilName,
} from "@/lib/karte-gl";
import { wenigerBewegung } from "@/lib/parallax";
import type { KartenPunkt, PunktArt } from "@/types";

/**
 * Die Salzburg-Karte.
 *
 * ---------------------------------------------------------------------------
 * WARUM VEKTORKACHELN UND NICHT MEHR DIE EIGENE SVG-KARTE
 * ---------------------------------------------------------------------------
 * Hier lag vorher eine selbstgebaute Karte: aus OpenStreetMap geholte Umrisse,
 * vereinfacht, als acht SVG-Pfade im Projekt. Sie war scharf — SVG ist immer
 * scharf — und sie kam ohne eine einzige fremde Anfrage aus. Aber sie hatte
 * eine Grenze, die sich nicht verschieben liess:
 *
 *   Keine Strassennamen. Keine Stadtteilnamen ausser dreissig von Hand
 *   gesetzten. Und vor allem: beim Hineinzoomen kam nichts dazu, weil es
 *   nur einen Detailgrad gab.
 *
 * Eine Stadtkarte, auf der man keine Strasse lesen kann, ist ein Bild von
 * einer Stadt. Fuer alles Weitere haette man die Beschriftung ganz
 * Salzburgs ins Projekt legen muessen — mehrere Megabyte, von Hand gepflegt.
 *
 * Vektorkacheln loesen genau das: Die Beschriftung kommt aus den Daten, sie
 * waechst beim Zoomen mit, und gezeichnet wird sie im Browser — also scharf
 * auf jedem Bildschirm und in jeder Vergroesserung.
 *
 * DER PREIS, UND ER IST REAL: Der Browser des Besuchers fragt damit einen
 * fremden Server an. Das war zuvor bewusst vermieden. Es steht jetzt im
 * Datenschutztext, und der Anbieter (OpenFreeMap) verlangt weder Schluessel
 * noch Anmeldung und protokolliert nach eigener Angabe nicht.
 *
 * ---------------------------------------------------------------------------
 * WAS AN DIESER KARTE NICHT VON DER STANGE IST
 * ---------------------------------------------------------------------------
 * Die Stile liegen im Projekt (src/data/karte/stil-*.json) und sind aus einer
 * Vorlage umgefaerbt, nicht verlinkt. Beide haben denselben Detailgrad — der
 * dunkle ist nicht die abgespeckte Fassung des hellen. Bedienelemente,
 * Marker, Gruppen, Merkfenster und Detailfenster sind vollstaendig eigene.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE KARTE NIE NEU GEBAUT WIRD
 * ---------------------------------------------------------------------------
 * Die MapLibre-Instanz entsteht genau einmal, in einem Effekt ohne
 * Abhaengigkeiten. Filterwechsel aendern nur die Daten einer Quelle,
 * Stilwechsel nur den Stil, ein Klick in der Ortsliste nur die Kamera. Wuerde
 * die Karte an React-Zustand haengen, waere jeder Klick auf "Partner" ein
 * vollstaendiger Neuaufbau samt Kachelabruf.
 */

/** Ein Ziel, das die Karte anfliegen soll. */
export type Flugziel = {
  id: string;
  /**
   * Zaehlt bei jedem Anstoss hoch.
   *
   * Ohne ihn liesse sich derselbe Ort nicht zweimal anfliegen: Bliebe die
   * Kennung gleich, saehe React keine Aenderung, und wer nach dem
   * Herumschieben noch einmal auf denselben Listeneintrag klickt, bekaeme
   * nichts.
   */
  zaehler: number;
};

type Eigenschaften = {
  punkte: KartenPunkt[];
  /** Welche Ebenen sichtbar sind. */
  sichtbar: PunktArt[];
  aktiv: string | null;
  waehlen: (id: string | null) => void;
  /** Was gerade in der Ortsliste unter dem Zeiger liegt. */
  schwebend?: string | null;
  /** Meldet zurueck, was auf der KARTE unter dem Zeiger liegt. */
  schweben?: (id: string | null) => void;
  flugziel?: Flugziel | null;
  stil: StilName;
  beschriftung: string;
  /** Schwebt oben links in der Karte. */
  kopf?: ReactNode;
  /** Schwebt oben rechts, neben den Zoomknoepfen. */
  werkzeug?: ReactNode;
  /** Schwebt unten in der Karte. */
  fuss?: ReactNode;
  /** Steht rechts neben der Karte, in derselben Huelle. */
  liste?: ReactNode;
  /** Auf dem Telefon ueber der Karte statt daneben. */
  schub?: ReactNode;
};

const ARTEN: PunktArt[] = ["partner", "versteck"];

/** Die Nachsaetze aller Ebenen je Art, in Zeichenreihenfolge. */
const EBENEN = ["gruppe", "gruppe-zahl", "schwebe", "punkt", "aktiv", "aktiv-kern", "name"];

/**
 * Kennung, die auf keinen Punkt passt.
 *
 * Kartenfilter kennen kein "zeige nichts" — sie vergleichen. Diese Zeichenkette
 * kann keine echte Kennung sein (die bestehen aus Kleinbuchstaben und
 * Bindestrichen), und damit ist der Filter leer, ohne dass die Ebene ab- und
 * wieder angeschaltet werden muss.
 */
const NICHTS = "::keiner::";

/** Dauer des Auftritts beim ersten Erscheinen. */
const AUFTRITT = 1100;

/** Wie viele Namen in einem Gruppenfenster stehen, bevor "+n weitere" kommt. */
const NAMEN_IM_FENSTER = 5;

/**
 * Was im Merkfenster steht.
 *
 * Ein einzelner Marker und eine Gruppe fuellen dieselbe Form: eine
 * Ueberschrift, darunter Zeilen. Beim Marker ist die Ueberschrift der Name und
 * darunter stehen Branche und Strasse; bei der Gruppe ist die Ueberschrift die
 * Anzahl und darunter stehen die Namen. Dieselbe Form ist Absicht — zwei
 * verschieden gebaute Fenster an derselben Stelle waeren zwei Dinge zu lernen.
 */
type Merkfenster = {
  x: number;
  y: number;
  art: PunktArt;
  titel: string;
  zeilen: string[];
  /** Wie viele Namen nicht mehr hineingepasst haben. */
  rest: number;
  /** Gruppen bekommen eine andere Ueberschrift als einzelne Punkte. */
  gruppe: boolean;
};

export function SalzburgKarteGl({
  punkte,
  sichtbar,
  aktiv,
  waehlen,
  schwebend = null,
  schweben,
  flugziel = null,
  stil,
  beschriftung,
  kopf,
  werkzeug,
  fuss,
  liste,
  schub,
}: Eigenschaften) {
  const feldRef = useRef<HTMLDivElement>(null);
  const seiteRef = useRef<HTMLDivElement>(null);
  const karteRef = useRef<maplibregl.Map | null>(null);
  const [bereit, setBereit] = useState(false);
  const [vollbild, setVollbild] = useState(false);
  const [merk, setMerk] = useState<Merkfenster | null>(null);

  /** Was die Maus auf der Karte gerade beruehrt. Getrennt von `schwebend`,
      das aus der Ortsliste kommt — sonst schriebe eines das andere um. */
  const [mausAuf, setMausAuf] = useState<string | null>(null);

  /* Die Kartenereignisse werden genau einmal gebunden und muessen trotzdem
     den jeweils aktuellen Zustand sehen. Dafuer stehen die Werte in Refs,
     die nach jedem Rendern nachgezogen werden — nicht WAEHREND des Renderns:
     Ein Rendervorgang muss wiederholbar sein, und ein Seiteneffekt darin ist
     genau das nicht. */
  const aktivRef = useRef(aktiv);
  const waehlenRef = useRef(waehlen);
  const schwebenRef = useRef(schweben);

  /**
   * Nachschlagewerk von der Kennung auf den vollstaendigen Punkt.
   *
   * Die Kartenquelle traegt nur Kennung, Name und Art — mehr braucht sie zum
   * Zeichnen nicht. Das Merkfenster braucht aber Branche, Strasse und Nummer,
   * und die holt es sich hier, statt sie in jedes einzelne Kartenmerkmal zu
   * kopieren.
   */
  const nachschlag = useMemo(() => {
    const m = new Map<string, KartenPunkt>();
    for (const p of punkte) m.set(p.id, p);
    return m;
  }, [punkte]);
  const nachschlagRef = useRef(nachschlag);

  useEffect(() => {
    aktivRef.current = aktiv;
    waehlenRef.current = waehlen;
    schwebenRef.current = schweben;
    nachschlagRef.current = nachschlag;
  });

  /* --- Ebenen anlegen ---------------------------------------------------- */

  /**
   * Quellen und Ebenen auf die Karte legen.
   *
   * Wird zweimal gebraucht: beim ersten Aufbau und nach jedem Stilwechsel.
   * `setStyle` ersetzt den kompletten Stil und damit auch alles, was wir
   * hinzugefuegt haben — die Marker muessen danach neu dazu. Das ist kein
   * Umweg, sondern wie MapLibre arbeitet.
   */
  const ebenenAnlegen = useCallback((karte: maplibregl.Map, daten: KartenPunkt[]) => {
    for (const art of ARTEN) {
      const farbe = EBENEN_FARBEN[art];
      const quelle = `punkte-${art}`;

      if (!karte.getSource(quelle)) {
        karte.addSource(quelle, {
          type: "geojson",
          data: alsSammlung(daten.filter((p) => p.art === art)),
          cluster: true,
          clusterRadius: GRUPPEN_RADIUS,
          clusterMaxZoom: GRUPPEN_BIS,
          promoteId: "id",
        });
      }

      /* Gruppen: gefuellter Kreis mit Ring. Die Groesse waechst mit der
         Anzahl, aber nur in drei Stufen — ein stufenloses Wachstum macht aus
         zwei benachbarten Gruppen mit 4 und 5 Punkten zwei fast gleich grosse
         Kreise, und dann ist die Groesse keine Information mehr. */
      if (!karte.getLayer(`${art}-gruppe`)) {
        karte.addLayer({
          id: `${art}-gruppe`,
          type: "circle",
          source: quelle,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": farbe.grund,
            "circle-opacity": 0.9,
            "circle-radius": ["step", ["get", "point_count"], 15, 5, 19, 12, 23],
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.55)",
          },
        });
      }

      if (!karte.getLayer(`${art}-gruppe-zahl`)) {
        karte.addLayer({
          id: `${art}-gruppe-zahl`,
          type: "symbol",
          source: quelle,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-allow-overlap": true,
          },
          paint: { "text-color": farbe.text },
        });
      }

      /* Der Schein unter dem beruehrten Punkt — beruehrt vom Zeiger auf der
         Karte ODER vom Zeiger auf der Zeile daneben. Eine eigene Ebene UNTER
         dem Marker und keine Vergroesserung des Markers selbst: Der Punkt darf
         sich nicht bewegen, sonst rutscht er unter dem Zeiger weg. */
      if (!karte.getLayer(`${art}-schwebe`)) {
        karte.addLayer({
          id: `${art}-schwebe`,
          type: "circle",
          source: quelle,
          filter: ["==", ["get", "id"], NICHTS],
          paint: {
            "circle-color": farbe.grund,
            "circle-opacity": 0.26,
            "circle-radius": 18,
            "circle-stroke-width": 2,
            "circle-stroke-color": farbe.hell,
            "circle-stroke-opacity": 0.7,
          },
        });
      }

      /* Einzelne Punkte. Der Radius waechst mit dem Zoom: In der Uebersicht
         waeren grosse Marker ein Fleckenteppich, nah dran waeren kleine nicht
         zu treffen. */
      if (!karte.getLayer(`${art}-punkt`)) {
        karte.addLayer({
          id: `${art}-punkt`,
          type: "circle",
          source: quelle,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": farbe.grund,
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 14, 7, 17, 10],
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.5)",
            "circle-opacity": 1,
            "circle-stroke-opacity": 1,
          },
        });
      }

      /* Der ausgewaehlte Punkt: groesser, heller Ring, weisser Kern. Eine
         eigene Ebene mit Filter statt einer Zustandsfarbe — so liegt er
         garantiert ueber allen anderen. */
      if (!karte.getLayer(`${art}-aktiv`)) {
        karte.addLayer({
          id: `${art}-aktiv`,
          type: "circle",
          source: quelle,
          filter: ["==", ["get", "id"], NICHTS],
          paint: {
            "circle-color": farbe.grund,
            "circle-radius": 13,
            "circle-stroke-width": 3,
            "circle-stroke-color": farbe.hell,
          },
        });
      }

      if (!karte.getLayer(`${art}-aktiv-kern`)) {
        karte.addLayer({
          id: `${art}-aktiv-kern`,
          type: "circle",
          source: quelle,
          filter: ["==", ["get", "id"], NICHTS],
          paint: { "circle-color": "#ffffff", "circle-radius": 4 },
        });
      }

      /* Der Name unter dem Marker — fuer den ausgewaehlten und den beruehrten
         Punkt. Als Kartenbeschriftung und nicht als HTML-Kaestchen: So ist er
         beim Verschieben nie versetzt und wird mit derselben Schaerfe
         gezeichnet wie die Strassennamen daneben. */
      if (!karte.getLayer(`${art}-name`)) {
        karte.addLayer({
          id: `${art}-name`,
          type: "symbol",
          source: quelle,
          filter: ["==", ["get", "id"], NICHTS],
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "rgba(4,24,44,0.9)",
            "text-halo-width": 1.6,
          },
        });
      }
    }
  }, []);

  /**
   * Sichtbarkeit, Auswahl und Hervorhebung auf die Ebenen schreiben.
   *
   * Steht als eigene Funktion da, weil es zweimal gebraucht wird: bei jeder
   * Aenderung — und noch einmal nach einem Stilwechsel, denn danach sind die
   * Ebenen frisch angelegt und tragen wieder ihre Ausgangsfilter. Ohne den
   * zweiten Aufruf verliert man mit dem Umschalten auf "Farbig" genau das,
   * was man gerade ausgewaehlt hatte.
   */
  const zustandSchreiben = useCallback(
    (karte: maplibregl.Map, wahl: string | null, beruehrt: string | null, an: PunktArt[]) => {
      for (const art of ARTEN) {
        const sichtbarkeit = an.includes(art) ? "visible" : "none";
        for (const nachsatz of EBENEN) {
          const ebene = `${art}-${nachsatz}`;
          if (karte.getLayer(ebene)) karte.setLayoutProperty(ebene, "visibility", sichtbarkeit);
        }
        for (const nachsatz of ["aktiv", "aktiv-kern"]) {
          const ebene = `${art}-${nachsatz}`;
          if (karte.getLayer(ebene)) karte.setFilter(ebene, ["==", ["get", "id"], wahl ?? NICHTS]);
        }
        if (karte.getLayer(`${art}-schwebe`)) {
          karte.setFilter(`${art}-schwebe`, ["==", ["get", "id"], beruehrt ?? NICHTS]);
        }
        /* Der ausgewaehlte Punkt traegt seinen Namen dauerhaft; sonst muesste
           man ihn anfahren, um zu sehen, was man gerade ausgewaehlt hat. */
        if (karte.getLayer(`${art}-name`)) {
          karte.setFilter(`${art}-name`, ["==", ["get", "id"], beruehrt ?? wahl ?? NICHTS]);
        }
      }
    },
    [],
  );

  /* --- Auftritt ----------------------------------------------------------- */

  /**
   * Die Marker treten versetzt ein.
   *
   * Umgesetzt als Kartenausdruck: Jeder Punkt bringt seinen Platz in der Reihe
   * als `takt` mit, und die Deckkraft ergibt sich aus dem Abstand zwischen
   * einem laufenden Fortschritt und diesem Wert. Je Bild sind das zwei
   * Aufrufe statt fuenfzig Zeitgeber.
   */
  const auftrittSpielen = useCallback((karte: maplibregl.Map) => {
    if (wenigerBewegung()) return;

    const start = performance.now();
    const schritt = (jetzt: number) => {
      const t = Math.min((jetzt - start) / AUFTRITT, 1);
      // Der Fortschritt laeuft von -0.2 bis 1.2, damit auch der erste und der
      // letzte Marker eine vollstaendige Blende bekommen.
      const front = -0.2 + t * 1.4;

      for (const art of ARTEN) {
        const ebene = `${art}-punkt`;
        if (!karte.getLayer(ebene)) continue;
        const blende: maplibregl.ExpressionSpecification = [
          "interpolate",
          ["linear"],
          ["-", front, ["get", "takt"]],
          0,
          0,
          0.22,
          1,
        ];
        karte.setPaintProperty(ebene, "circle-opacity", blende);
        karte.setPaintProperty(ebene, "circle-stroke-opacity", blende);
      }

      if (t < 1) requestAnimationFrame(schritt);
      else
        for (const art of ARTEN) {
          const ebene = `${art}-punkt`;
          if (!karte.getLayer(ebene)) continue;
          karte.setPaintProperty(ebene, "circle-opacity", 1);
          karte.setPaintProperty(ebene, "circle-stroke-opacity", 1);
        }
    };
    requestAnimationFrame(schritt);
  }, []);

  /* --- Aufbau, genau einmal ---------------------------------------------- */

  useEffect(() => {
    const feld = feldRef.current;
    if (!feld || karteRef.current) return;

    const karte = new maplibregl.Map({
      container: feld,
      style: STILE[stil],
      center: [START.laenge, START.breite],
      zoom: START.zoom,
      minZoom: ZOOM.min,
      maxZoom: ZOOM.max,
      maxBounds: RAHMEN,
      // Eine gedrehte oder gekippte Stadtkarte hilft niemandem beim
      // Zurechtfinden und macht jede Beschriftung schwerer lesbar.
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: false,
    });

    karteRef.current = karte;
    karte.touchZoomRotate.disableRotation();
    // Mausrad zoomt direkt, ohne Zusatztaste. Das war ausdruecklich gewuenscht
    // und ist auf einer Karte, die nicht die ganze Seite fuellt, vertretbar:
    // Wer daneben scrollt, scrollt die Seite.
    karte.scrollZoom.enable();

    karte.addControl(
      new maplibregl.AttributionControl({
        compact: false,
        customAttribution: `<a href="${ANBIETER.url}" target="_blank" rel="noreferrer noopener">${ANBIETER.name}</a>`,
      }),
      "bottom-right",
    );

    /* MapLibre meldet Fehler ueber ein Ereignis und wirft sie nicht. Ohne
       Horcher bleibt eine Karte, die ihre Kacheln nicht bekommt, einfach leer
       — und man sucht die Ursache im eigenen Code statt im Netz. */
    karte.on("error", (e) => {
      console.error("[Karte]", e.error?.message ?? e.error ?? e);
    });

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __karte?: unknown }).__karte = karte;
    }

    karte.on("load", () => {
      ebenenAnlegen(karte, punkte);
      setBereit(true);
      auftrittSpielen(karte);
    });

    return () => {
      karte.remove();
      karteRef.current = null;
    };
    // Absichtlich ohne Abhaengigkeiten: Die Karte wird einmal gebaut. Alles
    // Weitere laeuft ueber die Effekte darunter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- Daten -------------------------------------------------------------- */

  useEffect(() => {
    const karte = karteRef.current;
    if (!karte || !bereit) return;
    for (const art of ARTEN) {
      const quelle = karte.getSource(`punkte-${art}`) as maplibregl.GeoJSONSource | undefined;
      quelle?.setData(alsSammlung(punkte.filter((p) => p.art === art)));
    }
  }, [punkte, bereit]);

  /* --- Sichtbarkeit, Auswahl, Hervorhebung -------------------------------- */

  /**
   * Ein Zaehler, der nach jedem abgeschlossenen Stilwechsel hochlaeuft.
   *
   * Er ist der Grund, warum die Auswahl den Wechsel von Dunkel auf Farbig
   * ueberlebt: Der Effekt darunter haengt an ihm und schreibt den Zustand
   * danach noch einmal auf die frisch angelegten Ebenen.
   */
  const [stilRunde, setStilRunde] = useState(0);

  useEffect(() => {
    const karte = karteRef.current;
    if (!karte || !bereit) return;
    zustandSchreiben(karte, aktiv, mausAuf ?? schwebend, sichtbar);
  }, [aktiv, mausAuf, schwebend, sichtbar, bereit, stilRunde, zustandSchreiben]);

  /* --- Stilwechsel -------------------------------------------------------- */

  useEffect(() => {
    const karte = karteRef.current;
    if (!karte || !bereit) return;

    /* `setStyle` behaelt die Kamera, wirft aber alle eigenen Ebenen weg. Sie
       kommen danach neu dazu; Auswahl, Filter und Ausschnitt ueberleben den
       Wechsel, weil sie nicht im Stil stehen, sondern in React. */
    karte.setStyle(STILE[stil]);
    const wieder = () => {
      ebenenAnlegen(karte, punkte);
      setStilRunde((n) => n + 1);
      karte.off("styledata", wieder);
    };
    karte.on("styledata", wieder);
    return () => {
      karte.off("styledata", wieder);
    };
    // punkte bewusst nicht in den Abhaengigkeiten: Ein Datenwechsel darf
    // keinen Stilwechsel ausloesen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stil, bereit, ebenenAnlegen]);

  /* --- Anfliegen ---------------------------------------------------------- */

  /**
   * Ein Klick in der Ortsliste fliegt die Karte dorthin.
   *
   * Zwei Feinheiten, die den Unterschied zwischen "springt" und "bewegt sich"
   * ausmachen:
   *
   *   - Nie herauszoomen. Wer schon nah dran ist und den Nachbarort anklickt,
   *     will nicht erst wieder die halbe Stadt sehen.
   *   - Mindestens ueber die Gruppierungsgrenze hinein, sonst fliegt die
   *     Karte auf einen Ort, an dem statt des Markers eine Gruppe steht — und
   *     der hervorgehobene Punkt ist gar nicht zu sehen.
   */
  const flugId = flugziel?.id;
  const flugZaehler = flugziel?.zaehler;

  useEffect(() => {
    const karte = karteRef.current;
    if (!karte || !bereit || !flugId) return;
    const punkt = nachschlagRef.current.get(flugId);
    if (!punkt || punkt.breite === null || punkt.laenge === null) return;

    setMerk(null);
    karte.flyTo({
      center: [punkt.laenge, punkt.breite],
      zoom: Math.max(karte.getZoom(), GRUPPEN_BIS + 1),
      duration: 800,
      essential: true,
    });
  }, [flugId, flugZaehler, bereit]);

  /* --- Zeigen und Klicken ------------------------------------------------- */

  useEffect(() => {
    const karte = karteRef.current;
    if (!karte || !bereit) return;

    const punktEbenen = ARTEN.map((a) => `${a}-punkt`);
    const gruppenEbenen = ARTEN.map((a) => `${a}-gruppe`);
    const alle = [...punktEbenen, ...gruppenEbenen];

    /* Die Namen in einer Gruppe kommen ueber eine Abfrage, die ein Versprechen
       zurueckgibt. Bis sie beantwortet ist, kann der Zeiger laengst woanders
       sein — deshalb merkt sich der Lauf, welche Gruppe er gefragt hat, und
       verwirft jede Antwort, die zur falschen gehoert. */
    let gefragteGruppe: number | null = null;

    const gruppeZeigen = (gruppe: MapGeoJSONFeature, x: number, y: number) => {
      const kennung = gruppe.properties?.cluster_id as number | undefined;
      if (kennung === undefined) return;
      const anzahl = Number(gruppe.properties?.point_count ?? 0);
      const art: PunktArt = gruppe.layer.id.startsWith("partner") ? "partner" : "versteck";

      if (gefragteGruppe === kennung) {
        // Dieselbe Gruppe, nur ein paar Bildpunkte weiter: nachfuehren statt
        // neu abfragen. Sonst laeuft bei jeder Mausbewegung eine Abfrage.
        setMerk((alt) => (alt && alt.gruppe ? { ...alt, x, y } : alt));
        return;
      }
      gefragteGruppe = kennung;

      const quelle = karte.getSource(gruppe.layer.source as string) as maplibregl.GeoJSONSource;
      void quelle
        .getClusterLeaves(kennung, NAMEN_IM_FENSTER, 0)
        .then((blaetter: GeoJSON.Feature[]) => {
          if (gefragteGruppe !== kennung) return;
          const namen = blaetter.map((b) => String(b.properties?.name ?? "")).filter(Boolean);
          setMerk({
            x,
            y,
            art,
            titel: `${anzahl} ${mehrzahl(art, anzahl)}`,
            zeilen: namen,
            rest: Math.max(0, anzahl - namen.length),
            gruppe: true,
          });
        })
        .catch(() => {
          // Lieber kein Fenster als ein leeres.
          if (gefragteGruppe === kennung) setMerk(null);
        });
    };

    const punktZeigen = (treffer: MapGeoJSONFeature, x: number, y: number) => {
      gefragteGruppe = null;
      const punkt = nachschlagRef.current.get(String(treffer.properties?.id ?? ""));
      if (!punkt) return;
      setMerk({ x, y, art: punkt.art, titel: punkt.name, zeilen: unterzeilen(punkt), rest: 0, gruppe: false });
    };

    const bewegen = (e: maplibregl.MapMouseEvent) => {
      const treffer = karte.queryRenderedFeatures(e.point, { layers: alle });
      karte.getCanvas().style.cursor = treffer.length ? "pointer" : "";

      const punkt = treffer.find((t: MapGeoJSONFeature) => punktEbenen.includes(t.layer.id));
      if (punkt) {
        const id = String(punkt.properties?.id ?? "");
        setMausAuf(id);
        schwebenRef.current?.(id);
        punktZeigen(punkt, e.point.x, e.point.y);
        return;
      }

      setMausAuf(null);
      schwebenRef.current?.(null);

      const gruppe = treffer.find((t: MapGeoJSONFeature) => gruppenEbenen.includes(t.layer.id));
      if (gruppe) {
        gruppeZeigen(gruppe, e.point.x, e.point.y);
        return;
      }

      gefragteGruppe = null;
      setMerk(null);
    };

    const verlassen = () => {
      karte.getCanvas().style.cursor = "";
      gefragteGruppe = null;
      setMausAuf(null);
      schwebenRef.current?.(null);
      setMerk(null);
    };

    const klicken = (e: maplibregl.MapMouseEvent) => {
      const treffer = karte.queryRenderedFeatures(e.point, { layers: alle });
      if (treffer.length === 0) {
        waehlenRef.current(null);
        return;
      }

      const gruppe = treffer.find((t: MapGeoJSONFeature) => gruppenEbenen.includes(t.layer.id));
      if (gruppe) {
        /* Auf die Gruppe zoomen, bis sie auseinanderfaellt. Welchen der
           sieben Orte man meint, weiss sie ja nicht — das ist die einzige
           Handlung, die eine Gruppe anbieten darf. Was drinsteckt, hat das
           Merkfenster vorher gesagt. */
        setMerk(null);
        gruppeOeffnen(karte, gruppe);
        return;
      }

      const punkt = treffer.find((t: MapGeoJSONFeature) => punktEbenen.includes(t.layer.id));
      if (!punkt) return;
      const id = String(punkt.properties?.id);
      waehlenRef.current(aktivRef.current === id ? null : id);
    };

    karte.on("mousemove", bewegen);
    karte.on("mouseout", verlassen);
    karte.on("click", klicken);
    // Waehrend die Karte laeuft, staende das Fenster an einer Stelle, an der
    // nichts mehr ist.
    karte.on("movestart", verlassen);
    return () => {
      karte.off("mousemove", bewegen);
      karte.off("mouseout", verlassen);
      karte.off("click", klicken);
      karte.off("movestart", verlassen);
    };
  }, [bereit]);

  /* --- Knoepfe ------------------------------------------------------------ */

  const stufen = (faktor: number) => {
    const karte = karteRef.current;
    if (!karte) return;
    karte.easeTo({ zoom: karte.getZoom() + faktor, duration: 420 });
  };

  const zurueck = () => {
    waehlen(null);
    karteRef.current?.easeTo({
      center: [START.laenge, START.breite],
      zoom: START.zoom,
      duration: 700,
    });
  };

  const vollbildSchalten = () => {
    const huelle = seiteRef.current?.closest(".karte-huelle");
    if (!huelle) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else (huelle as HTMLElement).requestFullscreen?.();
  };

  useEffect(() => {
    const merken = () => {
      setVollbild(Boolean(document.fullscreenElement));
      // Die Flaeche aendert sich; ohne das bleibt die Karte in der alten
      // Groesse stehen und ist an drei Seiten abgeschnitten.
      requestAnimationFrame(() => karteRef.current?.resize());
    };
    document.addEventListener("fullscreenchange", merken);
    return () => document.removeEventListener("fullscreenchange", merken);
  }, []);

  /* Die Karte teilt sich die Breite mit der Ortsliste. Klappt die auf dem
     Telefon auf oder zu, aendert sich die Flaeche — und MapLibre bemerkt das
     von sich aus nur bei einer Fensteraenderung. */
  useEffect(() => {
    const feld = feldRef.current;
    if (!feld || !bereit || typeof ResizeObserver === "undefined") return;
    const beobachter = new ResizeObserver(() => karteRef.current?.resize());
    beobachter.observe(feld);
    return () => beobachter.disconnect();
  }, [bereit]);

  return (
    <div
      className="karte-huelle"
      data-ton="gl"
      data-stil={stil}
      data-vollbild={vollbild ? "ja" : undefined}
      data-mit-liste={liste ? "ja" : undefined}
    >
      <div className="karte-flur">
        <div className="karte-seite" ref={seiteRef}>
          <div
            ref={feldRef}
            className="karte-feld karte-feld-gl"
            role="application"
            aria-label={beschriftung}
            aria-roledescription="Karte"
          />

          {kopf ? <div className="karte-kopf">{kopf}</div> : null}

          <div className="karte-werkzeug">
            {werkzeug}
            <div className="karte-knoepfe">
              <button
                type="button"
                onClick={() => stufen(1)}
                aria-label="Näher heranzoomen"
                title="Näher heran"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => stufen(-1)}
                aria-label="Weiter herauszoomen"
                title="Weiter heraus"
              >
                −
              </button>
              <button
                type="button"
                onClick={zurueck}
                aria-label="Zurück auf die Stadt Salzburg"
                title="Stadt"
              >
                <span aria-hidden>◎</span>
              </button>
              <button
                type="button"
                onClick={vollbildSchalten}
                aria-label={vollbild ? "Vollbild verlassen" : "Karte im Vollbild öffnen"}
                title={vollbild ? "Vollbild verlassen" : "Vollbild"}
              >
                <span aria-hidden>{vollbild ? "▢" : "⛶"}</span>
              </button>
            </div>
          </div>

          {merk ? <MerkFenster fenster={merk} /> : null}

          {fuss ? <div className="karte-fuss">{fuss}</div> : null}

          {schub}

          {!bereit ? <div className="karte-laedt" aria-hidden /> : null}
        </div>

        {liste}
      </div>
    </div>
  );
}

/** "3 Verstecke", "1 Partner". */
function mehrzahl(art: PunktArt, anzahl: number): string {
  if (art === "partner") return "Partner";
  return anzahl === 1 ? "Versteck" : "Verstecke";
}

/**
 * Was unter dem Namen im Merkfenster steht.
 *
 * Nur belegte Felder. Eine Zeile "Datum: —" ist keine Information, sondern
 * eine Erinnerung daran, dass etwas fehlt, und die gehoert nicht auf eine
 * Karte, sondern in die Datendatei.
 */
function unterzeilen(punkt: KartenPunkt): string[] {
  if (punkt.art === "partner") {
    return [punkt.branche ?? "Partner", punkt.zusatz ?? ""].filter(Boolean);
  }
  return [
    punkt.nr !== undefined ? `Versteck #${punkt.nr}` : "Versteck",
    punkt.zusatz ?? "",
    punkt.datum
      ? new Date(punkt.datum).toLocaleDateString("de-AT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "",
  ].filter(Boolean);
}

/**
 * Das Merkfenster am Zeiger.
 *
 * Es nimmt keine Zeigerereignisse an — sonst laege es zwischen Zeiger und
 * Marker: Der Marker verlore die Beruehrung, das Fenster verschwaende, der
 * Marker bekaeme sie zurueck, und das Ganze flackerte im Bildtakt.
 */
function MerkFenster({ fenster }: { fenster: Merkfenster }) {
  return (
    <div
      className="karte-merk"
      data-art={fenster.art}
      data-gruppe={fenster.gruppe ? "ja" : undefined}
      style={{ left: `${fenster.x}px`, top: `${fenster.y}px` }}
      aria-hidden
    >
      <p className="karte-merk-titel">{fenster.titel}</p>
      {fenster.zeilen.map((zeile) => (
        <p key={zeile} className="karte-merk-zeile">
          {zeile}
        </p>
      ))}
      {fenster.rest > 0 ? <p className="karte-merk-rest">+{fenster.rest} weitere</p> : null}
    </div>
  );
}

/**
 * Auf eine Gruppe zoomen, bis sie auseinanderfaellt.
 *
 * MapLibre kann zu einer Gruppe die Zoomstufe nennen, ab der sie sich
 * aufloest. Die zu benutzen ist besser als "zoome zwei Stufen hinein": Bei
 * zwei Punkten, die einen Meter auseinanderliegen, reichen zwei Stufen nicht,
 * und bei zweien am Stadtrand sind sie zu viel.
 */
function gruppeOeffnen(karte: maplibregl.Map, gruppe: MapGeoJSONFeature) {
  const quelle = karte.getSource(gruppe.layer.source as string) as maplibregl.GeoJSONSource;
  const kennung = gruppe.properties?.cluster_id;
  if (kennung === undefined) return;

  void quelle.getClusterExpansionZoom(kennung).then((zoom: number) => {
    const mitte = (gruppe.geometry as GeoJSON.Point).coordinates as [number, number];
    karte.easeTo({ center: mitte, zoom: Math.min(zoom + 0.4, ZOOM.max), duration: 600 });
  });
}
