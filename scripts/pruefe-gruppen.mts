/**
 * Prueft die Markergruppierung der Salzburg-Karte.
 *
 * Zwei Zusicherungen, und beide sind im Browser muehsam zu pruefen, weil
 * dazwischen ein Flug mit requestAnimationFrame liegt:
 *
 *   1. Eine Gruppe enthaelt nur Punkte EINER Art. Eine gemischte Gruppe
 *      muesste sich fuer eine Farbe entscheiden und waere in jedem Fall
 *      gelogen.
 *
 *   2. Ein Klick auf eine Gruppe loest sie auf. Der Klick fliegt auf den
 *      Ausschnitt um ihre Mitglieder; auf der Zoomstufe, die dabei
 *      herauskommt, muessen sie einzeln stehen. Taeten sie das nicht, waere
 *      der Knopf eine Sackgasse: Man klickt, es passiert etwas, und die
 *      Gruppe ist immer noch da.
 *
 * Ausserdem: keine doppelten Kennungen im zusammengefuehrten Bestand. Genau
 * daran ist die Karte einmal gescheitert — Arbeiterkammer und JumpDome stehen
 * in beiden Bestaenden.
 *
 * Aufruf:  node --experimental-strip-types --import ./scripts/alias.mjs scripts/pruefe-gruppen.mts
 */
import { kartenPunkte, verortetePunkte } from "@/data/karte/karten-punkte";
import { ausschnittUm, haufenBilden, zoomStufe } from "@/lib/karte";

let fehler = 0;

function pruefe(bedingung: boolean, text: string) {
  console.log(`${bedingung ? "✓" : "✗"} ${text}`);
  if (!bedingung) fehler++;
}

/* --- Kennungen ----------------------------------------------------------- */

const kennungen = kartenPunkte.map((p) => p.id);
const doppelte = [...new Set(kennungen.filter((x, i) => kennungen.indexOf(x) !== i))];
pruefe(doppelte.length === 0, `Kennungen eindeutig (${kennungen.length} Punkte)${doppelte.length ? ` — doppelt: ${doppelte.join(", ")}` : ""}`);

/* --- Gruppen ------------------------------------------------------------- */

const sortiert = [...verortetePunkte].sort((a, b) => a.id.localeCompare(b.id));

for (const stufe of [1, 2.27, 4, 8]) {
  const haufen = haufenBilden(sortiert, stufe);
  const summe = haufen.reduce((s, h) => s + h.mitglieder.length, 0);
  const gemischt = haufen.filter((h) => new Set(h.mitglieder.map((m) => m.art)).size > 1);
  const gruppen = haufen.filter((h) => h.mitglieder.length > 1);

  console.log(
    `\nZoomstufe ${stufe}: ${haufen.length} Marker, davon ${gruppen.length} Gruppen`,
  );
  pruefe(summe === sortiert.length, `  kein Punkt verloren (${summe} von ${sortiert.length})`);
  pruefe(gemischt.length === 0, "  keine Gruppe mischt Verstecke und Partner");
}

/* --- Loest ein Klick jede Gruppe auf? ------------------------------------ */

console.log("\nKlick auf eine Gruppe:");
const haufen = haufenBilden(sortiert, 2.27);
const gruppen = haufen.filter((h) => h.mitglieder.length > 1);

for (const gruppe of gruppen) {
  const ziel = ausschnittUm(gruppe.mitglieder, 0.5);
  const danach = zoomStufe(ziel);
  const neu = haufenBilden(gruppe.mitglieder, danach);
  const einzeln = neu.every((h) => h.mitglieder.length === 1);
  pruefe(
    einzeln,
    `  ${gruppe.mitglieder.map((m) => m.name).join(" + ")} → Stufe ${danach.toFixed(1)}, ${neu.length} Marker`,
  );
}

console.log(fehler === 0 ? "\nAlles in Ordnung." : `\n${fehler} Fehler.`);
process.exit(fehler === 0 ? 0 : 1);
