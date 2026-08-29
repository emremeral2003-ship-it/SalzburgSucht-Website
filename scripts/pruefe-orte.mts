/**
 * Prueft, dass die Ortsliste und die Karte denselben Bestand zeigen.
 *
 * Der Anlass ist ein Fehler, der zweimal passiert ist: Die Partnerreihe zeigte
 * vierundzwanzig Betriebe, die Karte vierzehn, und niemand hat es gemerkt,
 * weil beide Zahlen fuer sich richtig aussahen. Solche Fehler faellt man nicht
 * durch Hinsehen — man faellt sie durch Zaehlen.
 *
 * Geprueft wird deshalb nicht "sieht gut aus", sondern:
 *
 *   1. Jeder Partner aus der Namensliste steht in der Ortsliste. Alle
 *      vierundzwanzig, namentlich abgehakt.
 *   2. Jedes Versteck steht in der Ortsliste.
 *   3. Jeder Eintrag mit Koordinate bekommt auch einen Marker — die Karte
 *      laesst keinen weg.
 *   4. Keine doppelte Kennung. Daran ist die Karte schon einmal gescheitert:
 *      Arbeiterkammer und JumpDome stehen in beiden Bestaenden.
 *   5. Die Suche findet, was sie finden soll — auch ohne Umlaute und ueber
 *      Strasse, Stadtteil und Branche.
 *   6. Die Zahlen sind gezaehlt und nicht geschrieben.
 *
 * Aufruf:
 *   node --experimental-strip-types --import ./scripts/alias.mjs scripts/pruefe-orte.mts
 */
import { kartenPunkte, kartenZahlen, verortetePunkte } from "@/data/karte/karten-punkte";
import { partnerAnzahl, partnerMitStandort, partners } from "@/data/partners";
import { verstecke } from "@/data/karte/verstecke";
import { alsSammlung } from "@/lib/karte-gl";
import { listeBilden } from "@/lib/karte-liste";

let fehler = 0;

function pruefe(bedingung: boolean, text: string) {
  console.log(`${bedingung ? "✓" : "✗"} ${text}`);
  if (!bedingung) fehler++;
}

/* --- 1. Alle Partner, namentlich ---------------------------------------- */

const partnerListe = listeBilden(kartenPunkte, "partner", "");
const beideListe = listeBilden(kartenPunkte, "beide", "");

console.log("Die vierundzwanzig Partner, einzeln:\n");
let fehlend = 0;
for (const p of partners) {
  const inListe = partnerListe.some((e) => e.name === p.name);
  const aufKarte = verortetePunkte.some((e) => e.art === "partner" && e.name === p.name);
  if (!inListe) fehlend++;
  console.log(
    `  ${inListe ? "✓" : "✗"} Liste  ${aufKarte ? "✓" : "·"} Karte   ${p.name}${
      aufKarte ? "" : "   (kein hinterlegter Standort)"
    }`,
  );
}
console.log("");
pruefe(fehlend === 0, `alle ${partnerAnzahl} Partner stehen in der Ortsliste`);
pruefe(
  partnerListe.length === partnerAnzahl,
  `die Ortsliste zeigt genau ${partnerAnzahl} Partner (gezeigt: ${partnerListe.length})`,
);

/* --- 2. Alle Verstecke --------------------------------------------------- */

const versteckListe = listeBilden(kartenPunkte, "versteck", "");
const fehlendeVerstecke = verstecke.filter((v) => !versteckListe.some((e) => e.name === v.name));
pruefe(
  fehlendeVerstecke.length === 0,
  `alle ${verstecke.length} Verstecke stehen in der Ortsliste${
    fehlendeVerstecke.length ? `: es fehlen ${fehlendeVerstecke.map((v) => v.name).join(", ")}` : ""
  }`,
);
pruefe(
  beideListe.length === partnerAnzahl + verstecke.length,
  `unter "Beide" stehen alle ${partnerAnzahl + verstecke.length} Eintraege (gezeigt: ${beideListe.length})`,
);

/* --- 3. Jeder Eintrag mit Koordinate wird ein Marker --------------------- */

const marker = [
  ...alsSammlung(kartenPunkte.filter((p) => p.art === "versteck")).features,
  ...alsSammlung(kartenPunkte.filter((p) => p.art === "partner")).features,
];
pruefe(
  marker.length === verortetePunkte.length,
  `jeder verortete Eintrag wird ein Marker (${marker.length} von ${verortetePunkte.length})`,
);

const ohneMarker = verortetePunkte.filter((p) => !marker.some((m) => m.properties.id === p.id));
pruefe(ohneMarker.length === 0, `kein verorteter Eintrag geht verloren`);

/* --- 4. Keine doppelten Kennungen ---------------------------------------- */

const kennungen = kartenPunkte.map((p) => p.id);
const doppelt = kennungen.filter((k, i) => kennungen.indexOf(k) !== i);
pruefe(doppelt.length === 0, `keine doppelte Kennung${doppelt.length ? `: ${doppelt.join(", ")}` : ""}`);

/* --- 5. Die Suche -------------------------------------------------------- */

const proben: Array<[string, string]> = [
  ["VoglBike", "VoglBike"],
  ["vogl", "VoglBike"],
  ["Mirabell", "Mirabellplatz"],
  ["WIFI", "WIFI"],
  ["Gastro", "Café Mozart"],
  ["Getreidegasse", "Café Mozart"],
  ["Itzling", "Techno-Z"],
  // Ohne Umlaut: Auf einer Seite mit Baeckerei, Moewen und Cafés ist das kein
  // Randfall, sondern die Haelfte der Namen.
  ["Backerei", "Salz & Zucker Bäckerei"],
  ["cafe", "Café Mozart"],
  ["Producito", "Producito"],
  ["12", "Viehhausen"],
];

for (const [begriff, erwartet] of proben) {
  const treffer = listeBilden(kartenPunkte, "beide", begriff);
  pruefe(
    treffer.some((t) => t.name === erwartet),
    `Suche "${begriff}" findet "${erwartet}" (${treffer.length} Treffer)`,
  );
}

pruefe(
  listeBilden(kartenPunkte, "beide", "zzzzz").length === 0,
  "eine Suche ohne Treffer liefert nichts statt alles",
);

/* --- 6. Die Zahlen ------------------------------------------------------- */

pruefe(
  kartenZahlen.partner.gesamt === partnerAnzahl &&
    kartenZahlen.partner.verortet === partnerMitStandort.length,
  `Partnerzahlen stimmen mit der Quelle ueberein (${kartenZahlen.partner.verortet} von ${kartenZahlen.partner.gesamt})`,
);
pruefe(
  kartenZahlen.versteck.gesamt === verstecke.length &&
    kartenZahlen.versteck.verortet === verstecke.filter((v) => v.breite !== null).length,
  `Versteckzahlen stimmen mit der Quelle ueberein (${kartenZahlen.versteck.verortet} von ${kartenZahlen.versteck.gesamt})`,
);

console.log(
  fehler === 0
    ? "\nListe und Karte zeigen denselben Bestand."
    : `\n${fehler} Punkte offen.`,
);
process.exit(fehler === 0 ? 0 : 1);
