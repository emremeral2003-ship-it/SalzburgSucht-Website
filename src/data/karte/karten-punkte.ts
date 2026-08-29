import { partnerOrte } from "@/data/karte/partner-orte";
import { verstecke } from "@/data/karte/verstecke";
import type { KartenPunkt } from "@/types";

/**
 * Alles, was auf der Salzburg-Karte steht — beide Ebenen in einer Liste.
 *
 * Die Karte auf der Startseite ist EINE Karte mit ZWEI Ebenen und nicht zwei
 * Karten nebeneinander. Damit das auch im Code so ist, werden die beiden
 * Bestaende hier einmal zusammengefuehrt; die Karte kennt danach nur noch
 * Punkte mit einer Art.
 *
 * Die Quellen bleiben getrennt und bleiben die Wahrheit:
 *
 *   src/data/karte/verstecke.ts      37 Orte, davon 36 mit Koordinate
 *   src/data/karte/partner-orte.ts   24 Betriebe, davon 14 mit Koordinate
 *
 * Hier wird nichts ergaenzt und nichts geraten. Wer einen Standort nachtraegt,
 * traegt ihn in der Quelldatei nach; diese Datei bekommt ihn dann von selbst.
 *
 * ----------------------------------------------------------------------------
 * WAS NOCH FEHLT — UND WARUM ES LEER BLEIBT
 * ----------------------------------------------------------------------------
 * Zu den Verstecken gibt es weder Datum noch Link auf den Beitrag. Beides ist
 * im Typ vorbereitet (`datum`, `beitrag` in src/types/index.ts) und steht bei
 * keinem Eintrag. Das Detailfenster zeigt deshalb nur, was da ist.
 *
 * Ein erfundenes Datum waere in dem Moment aufgeflogen, in dem jemand die
 * Story dazu sucht und sie an dem Tag nicht findet — und dann glaubt er auch
 * den Koordinaten nicht mehr.
 *
 * SO TRAEGT MAN ES NACH: In verstecke.ts beim jeweiligen Eintrag
 * `datum: "2025-04-17"` und `beitrag: "https://…"` ergaenzen. Mehr ist nicht
 * noetig; Karte und Detailfenster zeigen die Felder automatisch an, sobald sie
 * belegt sind.
 */

/**
 * Die Kennung bekommt die Art vorangestellt — und das ist kein Schoenheitswunsch.
 *
 * Zwei Namen stehen in BEIDEN Bestaenden: die Arbeiterkammer und JumpDome.
 * Dort wurde etwas versteckt, und mit beiden wurde ausserdem
 * zusammengearbeitet. In der gemeinsamen Liste haetten die zwei Eintraege
 * dieselbe Kennung gehabt — React haelt Elemente ueber diesen Schluessel
 * auseinander, und zwei Marker mit demselben Schluessel ergeben genau das,
 * wonach es aussieht: doppelte, vertauschte, in der falschen Farbe gezeichnete
 * Punkte, die beim Umschalten stehen bleiben.
 *
 * Beide Marker bleiben erhalten und sollen es auch: Es sind zwei Aussagen
 * ueber denselben Ort, und beide stimmen.
 */
export const kartenPunkte: KartenPunkt[] = [
  ...verstecke.map(
    (ort): KartenPunkt => ({
      ...ort,
      id: `versteck-${ort.id}`,
      art: "versteck",
    }),
  ),
  ...partnerOrte.map(
    (ort): KartenPunkt => ({
      ...ort,
      id: `partner-${ort.id}`,
      art: "partner",
    }),
  ),
];

/** Nur die Punkte, die tatsaechlich einen Marker bekommen. */
export const verortetePunkte = kartenPunkte.filter((p) => p.breite !== null);

/**
 * Die Zahlen unter der Karte.
 *
 * Drei Werte je Ebene, weil sie drei verschiedene Dinge bedeuten: wie viele
 * es insgesamt gibt, wie viele davon eine Koordinate haben und damit als
 * Marker erscheinen — und die Differenz, die man nennen muss, statt sie
 * wegzulassen. "14 Partner auf der Karte" waere richtig und trotzdem
 * irrefuehrend, solange es vierundzwanzig sind.
 */
function zaehlen(art: KartenPunkt["art"]) {
  const alle = kartenPunkte.filter((p) => p.art === art);
  const verortet = alle.filter((p) => p.breite !== null);
  return { gesamt: alle.length, verortet: verortet.length };
}

export const kartenZahlen = {
  versteck: zaehlen("versteck"),
  partner: zaehlen("partner"),
};
