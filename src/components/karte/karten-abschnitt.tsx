"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { SalzburgKarte, type KartenTon } from "@/components/karte/salzburg-karte";
import type { KartenOrt } from "@/types";

/**
 * Karte und Liste, verbunden.
 *
 * Beide Kartenabschnitte — Verstecke und Partner — sind derselbe Aufbau mit
 * anderem Inhalt: links die Karte, rechts eine durchsuchbare Liste, und beide
 * Richtungen wirken aufeinander. Was sie unterscheidet, wird hier
 * hineingereicht: Farbe, Gruppierung, was in einer Zeile steht.
 *
 * Der gemeinsame Zustand liegt hier und nicht in der Karte, weil ihn beide
 * Seiten brauchen: Die Liste muss wissen, welcher Marker angeklickt wurde, und
 * die Karte, welche Zeile gerade unter dem Zeiger liegt. Zwei getrennte
 * Zustaende laufen unweigerlich auseinander.
 */

export type Gruppe = { schluessel: string; label: string };

type Eigenschaften = {
  orte: KartenOrt[];
  ton: KartenTon;
  /** Nummern auf Markern und in der Liste. Nur bei den Verstecken. */
  nummeriert?: boolean;
  /** Filterknoepfe ueber der Liste. Leer lassen, wenn es nichts zu filtern gibt. */
  gruppen?: Gruppe[];
  gruppeVon?: (ort: KartenOrt) => string;
  /** Kurzer Zusatz rechts in der Zeile, etwa die Branche. */
  merkmal?: (ort: KartenOrt) => string | null;
  /** Was vorgelesen wird, wenn der Fokus auf der Karte landet. */
  beschriftung: string;
  /** Beschriftung des Suchfelds. */
  suchLabel: string;
};

/** Nummer eines Orts, sofern er eine hat. */
function nummerVon(ort: KartenOrt): number | null {
  return "nr" in ort ? (ort as unknown as { nr: number }).nr : null;
}

/**
 * Text so vereinfachen, dass die Suche auch ohne Umlaute und Sonderzeichen
 * findet. Wer "doner" tippt, meint "Chef Döner", und wer "muellner" tippt,
 * meint "Mülln" — eine Suche, die daran scheitert, ist keine.
 */
function vereinfacht(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function KartenAbschnitt({
  orte,
  ton,
  nummeriert = false,
  gruppen = [],
  gruppeVon,
  merkmal,
  beschriftung,
  suchLabel,
}: Eigenschaften) {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [betont, setBetont] = useState<string | null>(null);
  const [gruppe, setGruppe] = useState<string>("alle");
  const [suche, setSuche] = useState("");
  const listeRef = useRef<HTMLUListElement>(null);
  const suchId = useId();

  const gefiltert = useMemo(() => {
    const begriff = vereinfacht(suche.trim());
    return orte.filter((ort) => {
      if (gruppe !== "alle" && gruppeVon && gruppeVon(ort) !== gruppe) return false;
      if (!begriff) return true;
      const heuhaufen = vereinfacht(`${ort.name} ${ort.zusatz ?? ""} ${merkmal?.(ort) ?? ""}`);
      return heuhaufen.includes(begriff);
    });
  }, [orte, gruppe, gruppeVon, suche, merkmal]);

  const mitMarker = gefiltert.filter((o) => o.breite !== null);
  const ohneMarker = gefiltert.filter((o) => o.breite === null);

  /**
   * Wird auf der Karte ein Marker angeklickt, muss die Zeile dazu sichtbar
   * werden — sonst hebt die Liste unsichtbar irgendwo weiter unten etwas
   * hervor und die Verbindung zwischen beiden Haelften geht verloren.
   *
   * `block: "nearest"` ist wichtig: Es scrollt nur, wenn die Zeile wirklich
   * ausserhalb liegt, und reisst die Liste nicht bei jedem Klick herum.
   */
  useEffect(() => {
    if (!aktiv) return;
    const zeile = listeRef.current?.querySelector<HTMLElement>(`[data-id="${aktiv}"]`);
    zeile?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [aktiv]);

  const gezeigt = mitMarker.length;
  const verortet = orte.filter((o) => o.breite !== null).length;
  // Drei Zahlen, weil sie drei verschiedene Dinge bedeuten: wie viele gerade
  // durch den Filter kommen, wie viele ueberhaupt eine Koordinate haben, und
  // wie viele es insgesamt gibt. Auf der Partnerkarte ist der Unterschied
  // zwischen den letzten beiden zehn Betriebe — "14 auf der Karte" allein
  // waere richtig und trotzdem irrefuehrend.
  const gesamt = orte.length;

  return (
    <div className="karten-gespann">
      <SalzburgKarte
        orte={mitMarker}
        ton={ton}
        nummeriert={nummeriert}
        aktiv={aktiv}
        waehlen={setAktiv}
        betont={betont}
        betonen={setBetont}
        beschriftung={beschriftung}
      />

      <div className="karten-liste-feld">
        <div className="karten-werkzeug">
          <label className="sr-only" htmlFor={suchId}>
            {suchLabel}
          </label>
          <input
            id={suchId}
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder={suchLabel}
            className="karten-suche"
            autoComplete="off"
          />

          {gruppen.length > 0 ? (
            <div className="karten-filter" role="group" aria-label="Nach Kategorie filtern">
              <button
                type="button"
                data-an={gruppe === "alle" ? "ja" : undefined}
                onClick={() => setGruppe("alle")}
              >
                Alle
              </button>
              {gruppen.map((g) => (
                <button
                  key={g.schluessel}
                  type="button"
                  data-an={gruppe === g.schluessel ? "ja" : undefined}
                  onClick={() => setGruppe(g.schluessel)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          ) : null}

          {/* Wird vorgelesen, sobald sich die Trefferzahl aendert — sonst
              bemerkt niemand, der die Liste nicht sieht, dass ein Filter
              ueberhaupt etwas getan hat. */}
          <p className="karten-zaehler" aria-live="polite">
            {gezeigt === verortet
              ? verortet === gesamt
                ? `${gesamt} auf der Karte`
                : `${verortet} von ${gesamt} verortet`
              : `${gezeigt} von ${verortet} auf der Karte`}
          </p>
        </div>

        <ul className="karten-liste" ref={listeRef}>
          {mitMarker.map((ort) => {
            const nummer = nummerVon(ort);
            const zusatzMerkmal = merkmal?.(ort) ?? null;
            return (
              <li key={ort.id}>
                <button
                  type="button"
                  data-id={ort.id}
                  className="karten-zeile"
                  data-aktiv={aktiv === ort.id ? "ja" : undefined}
                  data-betont={betont === ort.id ? "ja" : undefined}
                  aria-pressed={aktiv === ort.id}
                  onClick={() => setAktiv(aktiv === ort.id ? null : ort.id)}
                  onPointerEnter={() => setBetont(ort.id)}
                  onPointerLeave={() => setBetont(null)}
                  onFocus={() => setBetont(ort.id)}
                  onBlur={() => setBetont(null)}
                >
                  {nummeriert && nummer !== null ? (
                    <span className="karten-nummer" aria-hidden>
                      {nummer}
                    </span>
                  ) : (
                    <span className="karten-tupfen" aria-hidden />
                  )}
                  <span className="karten-text">
                    <span className="karten-name">{ort.name}</span>
                    {ort.zusatz ? <span className="karten-zusatz">{ort.zusatz}</span> : null}
                  </span>
                  {zusatzMerkmal ? (
                    <span className="karten-merkmal">{zusatzMerkmal}</span>
                  ) : null}
                  {/* Der Genauigkeitsvermerk ist der Kern der Ehrlichkeit
                      dieser Karte: Ein Marker sieht immer metergenau aus. */}
                  {ort.genauigkeit !== "punkt" ? (
                    <span
                      className="karten-genauigkeit"
                      title={GENAUIGKEIT[ort.genauigkeit]}
                    >
                      {GENAUIGKEIT_KURZ[ort.genauigkeit]}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}

          {ohneMarker.length > 0 ? (
            <li className="karten-offen">
              <p className="karten-offen-titel">Ohne hinterlegten Standort</p>
              <p className="karten-offen-text">
                {ohneMarker.length === 1 ? "Dieser Eintrag steht" : "Diese Einträge stehen"} in
                der Liste, aber nicht auf der Karte. Lieber eine Lücke als ein
                Marker an einer geratenen Stelle.
              </p>
              <ul>
                {ohneMarker.map((ort) => (
                  <li key={ort.id}>
                    {ort.name}
                    {ort.zusatz ? <span> · {ort.zusatz}</span> : null}
                  </li>
                ))}
              </ul>
            </li>
          ) : null}

          {gefiltert.length === 0 ? (
            <li className="karten-leer">Nichts gefunden. Anderer Begriff?</li>
          ) : null}
        </ul>

        <p className="karten-legende">
          <span data-stufe="punkt" /> genaue Adresse
          <span data-stufe="strasse" /> Straße
          <span data-stufe="viertel" /> Stadtteil oder Ort
        </p>
      </div>
    </div>
  );
}

const GENAUIGKEIT: Record<string, string> = {
  strasse: "Die richtige Straße, aber nicht die Hausnummer",
  viertel: "Mitte des Stadtteils — keine genaue Adresse",
  ort: "Mitte der Gemeinde — keine genaue Adresse",
  offen: "Kein Standort hinterlegt",
};

const GENAUIGKEIT_KURZ: Record<string, string> = {
  strasse: "Straße",
  viertel: "Stadtteil",
  ort: "Ort",
  offen: "offen",
};
