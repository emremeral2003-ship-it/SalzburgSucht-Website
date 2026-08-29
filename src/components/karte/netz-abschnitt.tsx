"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { OrteListe } from "@/components/karte/orte-liste";
import { SalzburgKarteGl, type Flugziel } from "@/components/karte/salzburg-karte-gl";
import { kartenPunkte, kartenZahlen } from "@/data/karte/karten-punkte";
import { STIL_SPEICHER, type StilName } from "@/lib/karte-gl";
import { listeBilden, type Ansicht } from "@/lib/karte-liste";
import type { KartenPunkt, PunktArt } from "@/types";

/**
 * Die Salzburg-Karte der Startseite, mit Ortsliste.
 *
 * ---------------------------------------------------------------------------
 * EINE Karte, ZWEI Ebenen, EINE Liste
 * ---------------------------------------------------------------------------
 * Verstecke und Partnerbetriebe stehen auf derselben Geografie, im selben
 * Ausschnitt, unter demselben Zoom — nur in zwei Farben. Zwei Karten
 * nebeneinander haetten dieselben Daten gezeigt und trotzdem etwas anderes
 * behauptet: dass das zwei Themen sind. Es ist eines.
 *
 * Die Liste daneben ist keine zweite Darstellung, sondern die Navigation
 * dazu: Was man auf einer Karte nicht findet, weil man nicht weiss, wo man
 * suchen soll, findet man in einer Liste in zwei Sekunden. Beide zeigen
 * denselben Bestand, beide reagieren auf denselben Filter, und die Auswahl
 * gilt in beiden — es gibt nur EINEN ausgewaehlten Ort, egal wo man ihn
 * angeklickt hat.
 *
 * ---------------------------------------------------------------------------
 * DIESE DATEI HAELT DEN ZUSTAND, NICHT DIE KARTE
 * ---------------------------------------------------------------------------
 * Auswahl, Filter, Suchbegriff, Stil und Flugziel stehen hier. Die Karte
 * bekommt sie als Eigenschaften und meldet Aenderungen zurueck. Das ist der
 * Grund, warum ein Stilwechsel die Auswahl nicht verliert: Sie liegt gar
 * nicht in der Karte.
 *
 * ---------------------------------------------------------------------------
 * DIE ZAHLEN WERDEN GEZAEHLT, NIE GESCHRIEBEN
 * ---------------------------------------------------------------------------
 * Legende, Listenkopf und der Knopf auf dem Telefon nehmen ihre Werte aus
 * `kartenZahlen` beziehungsweise aus der Laenge der gefilterten Liste. Alles
 * das zaehlt seinerseits aus src/data/partners.ts und verstecke.ts. Wer
 * morgen einen Partner ergaenzt, aendert nichts an dieser Datei — und es kann
 * nicht wieder passieren, dass die Namensreihe vierundzwanzig Betriebe zeigt
 * und die Karte dreizehn.
 */

export function NetzAbschnitt() {
  /* Fest auf Verstecke: Die Partner-Ebene ist auf Wunsch raus (27.08.2026).
     `Ansicht` und die Filterlogik in karte-liste.ts bleiben bestehen —
     kommt die Partner-Ebene zurueck, ist es diese eine Zeile plus der
     Umschalter im Kopf. */
  const ansicht: Ansicht = "versteck";
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [stil, setStil] = useState<StilName>("dunkel");
  const [suche, setSuche] = useState("");
  const [schwebend, setSchwebend] = useState<string | null>(null);
  const [flugziel, setFlugziel] = useState<Flugziel | null>(null);
  const [schubOffen, setSchubOffen] = useState(false);

  /**
   * Die zuletzt gewaehlte Kartenfassung.
   *
   * Erst nach dem ersten Bild gelesen und nicht in der Anfangsbelegung: Der
   * Server kennt keinen Speicher, und ein abweichender erster Zustand waere
   * ein Unterschied zwischen dem, was der Server schickt, und dem, was React
   * erwartet.
   */
  useEffect(() => {
    let gemerkt: string | null = null;
    try {
      gemerkt = window.localStorage.getItem(STIL_SPEICHER);
    } catch {
      // Speicher gesperrt (privates Fenster, Richtlinie). Dann eben nicht.
      return;
    }
    if (gemerkt !== "dunkel" && gemerkt !== "farbig") return;

    /* Der Umweg ueber das Zeitfenster ist Absicht und kein Schoenheitsfehler:
       Ein setState direkt im Effektkoerper loest eine zweite Renderrunde noch
       vor dem ersten Bild aus. Dasselbe Muster steckt im verzoegerten Laden
       der Karte. */
    const wahl = gemerkt;
    const zeitfenster = window.setTimeout(() => setStil(wahl), 0);
    return () => window.clearTimeout(zeitfenster);
  }, []);

  function stilWaehlen(neu: StilName) {
    setStil(neu);
    try {
      window.localStorage.setItem(STIL_SPEICHER, neu);
    } catch {
      // siehe oben
    }
  }

  const sichtbar: PunktArt[] = [ansicht];

  const punkte = useMemo(() => kartenPunkte, []);

  const gewaehlt: KartenPunkt | null = aktiv
    ? (punkte.find((p) => p.id === aktiv) ?? null)
    : null;

  /** Wie viele Eintraege die Liste unter dem aktuellen Filter zeigt. */
  const listenlaenge = useMemo(
    () => listeBilden(punkte, ansicht, suche).length,
    [punkte, ansicht, suche],
  );

  /**
   * Ein Klick in der Liste waehlt aus UND fliegt hin.
   *
   * Ein Klick auf einen Marker waehlt nur aus: Man sieht ihn ja schon, und
   * eine Karte, die bei jedem Klick losfliegt, verliert man aus den Augen.
   */
  const ausListe = useCallback((id: string) => {
    setAktiv(id);
    setFlugziel((alt) => ({ id, zaehler: (alt?.zaehler ?? 0) + 1 }));
    // Auf dem Telefon liegt die Liste ueber der Karte — sie muss weg, sonst
    // fliegt die Karte hinter einem Vorhang.
    setSchubOffen(false);
  }, []);

  const zahlen = (
    <div className="karte-legende">
      <p>
        <span data-art="versteck" aria-hidden />
        {kartenZahlen.versteck.verortet} Verstecke
      </p>
    </div>
  );

  const liste = (
    <OrteListe
      punkte={punkte}
      ansicht={ansicht}
      suche={suche}
      suchen={setSuche}
      aktiv={aktiv}
      waehlen={ausListe}
      schwebend={schwebend}
      schweben={setSchwebend}
      schliessen={() => setSchubOffen(false)}
    />
  );

  return (
    <SalzburgKarteGl
      punkte={punkte}
      sichtbar={sichtbar}
      aktiv={aktiv}
      waehlen={setAktiv}
      schwebend={schwebend}
      schweben={setSchwebend}
      flugziel={flugziel}
      stil={stil}
      beschriftung="Karte von Salzburg mit vergangenen Verstecken"
      werkzeug={
        /* Getrennt vom Filter und auf der anderen Seite: Der eine bestimmt,
           WAS zu sehen ist, der andere, WIE die Karte aussieht. Nebeneinander
           saehen sie aus wie sechs gleichwertige Knoepfe. */
        <div className="karte-stil" role="group" aria-label="Kartenfassung">
          {(["dunkel", "farbig"] as const).map((wahl) => (
            <button
              key={wahl}
              type="button"
              data-an={stil === wahl ? "ja" : undefined}
              aria-pressed={stil === wahl}
              onClick={() => stilWaehlen(wahl)}
              title={wahl === "dunkel" ? "Dunkle Karte" : "Farbige Karte"}
            >
              <span aria-hidden>{wahl === "dunkel" ? "☾" : "☀"}</span>
              <span className="karte-stil-wort">{wahl === "dunkel" ? "Dunkel" : "Farbig"}</span>
            </button>
          ))}
        </div>
      }
      fuss={
        gewaehlt ? <Detail punkt={gewaehlt} schliessen={() => setAktiv(null)} /> : zahlen
      }
      liste={
        /* Dieselbe Liste, zweimal eingehaengt — daneben auf dem Schreibtisch,
           als Schub auf dem Telefon. Zwei getrennte Fassungen waeren zwei
           Stellen, an denen dieselbe Aenderung noetig ist. */
        <div className="karte-liste-huelle" data-offen={schubOffen ? "ja" : undefined}>
          {liste}
        </div>
      }
      schub={
        <button
          type="button"
          className="karte-orte-knopf"
          onClick={() => setSchubOffen((o) => !o)}
          aria-expanded={schubOffen}
        >
          {schubOffen ? "Karte zeigen" : `Orte anzeigen (${listenlaenge})`}
        </button>
      }
    />
  );
}

/**
 * Das Detailfenster.
 *
 * Sitzt unten in der Karte, nicht daneben, und ist absichtlich schmal: Es
 * verdeckt einen Streifen und nicht die halbe Stadt. Es zeigt ausschliesslich
 * Felder, die belegt sind — keine leeren Zeilen, keine Platzhalter.
 */
function Detail({ punkt, schliessen }: { punkt: KartenPunkt; schliessen: () => void }) {
  const istVersteck = punkt.art === "versteck";

  return (
    <div className="karte-detail" role="dialog" aria-label={punkt.name}>
      <p className="karte-detail-art" data-art={punkt.art}>
        {istVersteck
          ? punkt.nr !== undefined
            ? `Versteck #${punkt.nr}`
            : "Versteck"
          : (punkt.branche ?? "Partner")}
      </p>

      <p className="karte-detail-name">{punkt.name}</p>

      {punkt.zusatz ? <p className="karte-detail-zusatz">{punkt.zusatz}</p> : null}

      {punkt.datum ? (
        <p className="karte-detail-datum">
          <time dateTime={punkt.datum}>
            {new Date(punkt.datum).toLocaleDateString("de-AT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </time>
        </p>
      ) : null}

      {/* Der Genauigkeitsvermerk ist der Kern der Ehrlichkeit dieser Karte:
          Ein Marker sieht immer metergenau aus. */}
      {punkt.genauigkeit !== "punkt" ? (
        <p className="karte-detail-genau">{GENAUIGKEIT[punkt.genauigkeit]}</p>
      ) : null}

      {punkt.beitrag ? (
        <a
          className="karte-detail-link"
          href={punkt.beitrag}
          target="_blank"
          rel="noreferrer noopener"
        >
          Beitrag ansehen <span aria-hidden>→</span>
        </a>
      ) : null}

      {punkt.website ? (
        <a
          className="karte-detail-link"
          href={punkt.website}
          target="_blank"
          rel="noreferrer noopener"
        >
          Zum Betrieb <span aria-hidden>→</span>
        </a>
      ) : null}

      <button
        type="button"
        className="karte-detail-zu"
        onClick={schliessen}
        aria-label="Detail schließen"
      >
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}

const GENAUIGKEIT: Record<string, string> = {
  strasse: "Die richtige Straße, aber nicht die Hausnummer",
  viertel: "Mitte des Stadtteils — keine genaue Adresse",
  ort: "Mitte der Gemeinde — keine genaue Adresse",
  offen: "Kein Standort hinterlegt",
};
