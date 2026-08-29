"use client";

import { useEffect, useId, useMemo, useRef } from "react";

import { abschnitte, listeBilden, type Ansicht } from "@/lib/karte-liste";
import type { KartenPunkt } from "@/types";

/**
 * Die Ortsliste neben der Karte.
 *
 * ---------------------------------------------------------------------------
 * SIE IST DIE LEGENDE
 * ---------------------------------------------------------------------------
 * Eine klassische Kartenlegende erklaert Farben. Diese hier erklaert Farben
 * UND ist das Inhaltsverzeichnis: Wer "VoglBike" liest, klickt darauf und ist
 * dort. Deshalb steht unten in der Karte nur noch die Farberklaerung mit den
 * Zahlen — zwei Zeilen — und nicht mehr.
 *
 * ---------------------------------------------------------------------------
 * WARUM ORTE OHNE KOORDINATE TROTZDEM DRINSTEHEN
 * ---------------------------------------------------------------------------
 * Fuenf Partnerbetriebe und ein Versteck haben keinen hinterlegten Standort.
 * Sie stehen am Ende der Liste, abgesetzt, mit dem Vermerk "ohne hinterlegten
 * Standort", und sie sind nicht anklickbar — es gibt nichts anzufliegen.
 *
 * Der bequeme Weg waere, sie wegzulassen: Dann stimmte die Liste mit der
 * Karte ueberein und niemand faende die Luecke. Genau das ist der Grund,
 * warum sie drinbleiben. Wer "Producito" sucht, soll lesen, dass es den
 * Partner gibt und nur die Adresse fehlt, statt zu glauben, es gebe ihn
 * nicht.
 *
 * ---------------------------------------------------------------------------
 * TASTATUR
 * ---------------------------------------------------------------------------
 * Die Eintraege sind Knoepfe, keine Listenelemente mit Klickhorcher. Damit
 * sind Tabulator, Eingabetaste und Leertaste ohne eine Zeile Code richtig,
 * und der Fokusrahmen kommt aus dem Stylesheet der Seite.
 */

type Eigenschaften = {
  punkte: KartenPunkt[];
  ansicht: Ansicht;
  suche: string;
  suchen: (wert: string) => void;
  aktiv: string | null;
  waehlen: (id: string) => void;
  schwebend: string | null;
  schweben: (id: string | null) => void;
  /** Auf dem Telefon: der Knopf, der die Liste wieder zuklappt. */
  schliessen?: () => void;
};

export function OrteListe({
  punkte,
  ansicht,
  suche,
  suchen,
  aktiv,
  waehlen,
  schwebend,
  schweben,
  schliessen,
}: Eigenschaften) {
  const feldId = useId();
  const rolleRef = useRef<HTMLDivElement>(null);

  const liste = useMemo(() => listeBilden(punkte, ansicht, suche), [punkte, ansicht, suche]);
  const teile = useMemo(() => abschnitte(liste, ansicht), [liste, ansicht]);

  /**
   * Ein Klick auf einen Marker soll die zugehoerige Zeile sichtbar machen.
   *
   * Von Hand gerechnet und nicht ueber `scrollIntoView`: Dessen Standardwerte
   * scrollen bei Bedarf auch die SEITE, und dann rutscht einem die Karte unter
   * dem Zeiger weg, weil man einen Punkt darauf angeklickt hat. Hier bewegt
   * sich nur der Kasten.
   */
  useEffect(() => {
    if (!aktiv) return;
    const kasten = rolleRef.current;
    if (!kasten) return;
    const zeile = kasten.querySelector<HTMLElement>(`[data-id="${CSS.escape(aktiv)}"]`);
    if (!zeile) return;

    const oben = zeile.offsetTop;
    const unten = oben + zeile.offsetHeight;
    const sichtbarAb = kasten.scrollTop;
    const sichtbarBis = sichtbarAb + kasten.clientHeight;

    if (oben < sichtbarAb) kasten.scrollTo({ top: oben - 12, behavior: "smooth" });
    else if (unten > sichtbarBis) {
      kasten.scrollTo({ top: unten - kasten.clientHeight + 12, behavior: "smooth" });
    }
  }, [aktiv]);

  return (
    <aside className="karte-liste" aria-label="Alle eingetragenen Orte">
      <div className="karte-liste-kopf">
        <div className="karte-liste-zeile">
          <p className="karte-liste-titel">Orte</p>
          <p className="karte-liste-zahl">{liste.length}</p>
          {schliessen ? (
            <button
              type="button"
              className="karte-liste-zu"
              onClick={schliessen}
              aria-label="Ortsliste schließen"
            >
              <span aria-hidden>×</span>
            </button>
          ) : null}
        </div>

        <div className="karte-liste-suche">
          {/* Der Platzhaltertext ist die Beschriftung — bei einem einzelnen
              Feld in einem Kasten, der "Orte" ueberschrieben ist, waere eine
              zusaetzliche Zeile darueber nur Hoehe. Vorgelesen wird trotzdem
              der volle Satz, dafuer steht er noch einmal in aria-label. */}
          <input
            id={feldId}
            type="search"
            value={suche}
            onChange={(e) => suchen(e.target.value)}
            placeholder="Versteck suchen"
            aria-label="Versteck suchen"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="karte-liste-rolle" ref={rolleRef}>
        {liste.length === 0 ? (
          <p className="karte-liste-leer">
            Kein Eintrag passt zu „{suche}“.
          </p>
        ) : (
          teile.map((teil) => (
            <div className="karte-liste-teil" key={teil.titel ?? "alle"}>
              {teil.titel ? (
                <p className="karte-liste-ueber" data-art={teil.art ?? undefined}>
                  {teil.titel}
                  <span>{teil.punkte.length}</span>
                </p>
              ) : null}

              {teil.punkte.map((punkt) => (
                <Zeile
                  key={punkt.id}
                  punkt={punkt}
                  aktiv={aktiv === punkt.id}
                  schwebt={schwebend === punkt.id}
                  waehlen={waehlen}
                  schweben={schweben}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

/**
 * Eine Zeile.
 *
 * Zwei Zeilen Text und ein Farbpunkt, mehr nicht: Was ein Ort sonst noch
 * mitbringt, steht im Detailfenster in der Karte. Eine Liste, die alles zeigt,
 * ist eine Tabelle, und eine Tabelle neben einer Karte ist eine zweite Karte.
 */
function Zeile({
  punkt,
  aktiv,
  schwebt,
  waehlen,
  schweben,
}: {
  punkt: KartenPunkt;
  aktiv: boolean;
  schwebt: boolean;
  waehlen: (id: string) => void;
  schweben: (id: string | null) => void;
}) {
  const verortet = punkt.breite !== null;

  const unterzeile =
    punkt.art === "partner"
      ? [punkt.branche ?? "Partner", punkt.zusatz].filter(Boolean).join(" · ")
      : [punkt.nr !== undefined ? `Versteck #${punkt.nr}` : "Versteck", punkt.zusatz]
          .filter(Boolean)
          .join(" · ");

  return (
    <button
      type="button"
      className="karte-liste-eintrag"
      data-id={punkt.id}
      data-art={punkt.art}
      data-an={aktiv ? "ja" : undefined}
      data-schwebt={schwebt ? "ja" : undefined}
      data-offen={verortet ? undefined : "ja"}
      aria-pressed={aktiv}
      disabled={!verortet}
      onClick={() => waehlen(punkt.id)}
      onMouseEnter={() => schweben(punkt.id)}
      onMouseLeave={() => schweben(null)}
      onFocus={() => schweben(punkt.id)}
      onBlur={() => schweben(null)}
    >
      <span className="karte-liste-punkt" aria-hidden />
      <span className="karte-liste-text">
        <span className="karte-liste-name">{punkt.name}</span>
        <span className="karte-liste-unter">{unterzeile}</span>
        {verortet ? null : (
          <span className="karte-liste-fehlt">ohne hinterlegten Standort</span>
        )}
      </span>
    </button>
  );
}
