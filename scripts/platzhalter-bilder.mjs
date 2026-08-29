/**
 * Erzeugt die Platzhalter-Cover fuer die Content-Karten.
 *
 * Warum ein Skript statt fertiger Dateien im Repository: Die Bilder sind
 * Platzhalter, keine Inhalte. Sie stehen hier als Rezept, damit jederzeit
 * nachvollziehbar ist, dass sie selbst erzeugt und nicht irgendwo
 * heruntergeladen wurden — fremde Fotos ohne Lizenz waeren genau das Problem,
 * das dieses Projekt an keiner Stelle haben will.
 *
 * Bewusst abstrakt und nicht fotorealistisch: Ein erfundenes "Foto" aus
 * Salzburg waere das Tourismus-Klischee, das die Marke vermeiden soll. Diese
 * Flaechen sehen nach Gestaltung aus und geben trotzdem sofort preis, dass
 * noch kein echter Beitrag dahintersteckt.
 *
 * Aufruf:  node scripts/platzhalter-bilder.mjs
 *
 * ZU ERSETZEN: Sobald echte Reel-Cover vorliegen, kommen sie nach
 * public/images/ und in src/data/discovery.ts wird nur der Dateiname
 * getauscht. Dieses Skript kann dann weg.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const ziel = join(wurzel, "public", "images", "platzhalter");
mkdirSync(ziel, { recursive: true });

/* Markenpalette — dieselben Werte wie in globals.css. */
const F = {
  hell: "#80bdff",
  akzent: "#3a94e8",
  mittel: "#2279c9",
  tief: "#0b4f8a",
  nacht: "#082f52",
  dunkel: "#05213c",
};

const B = 1080;
const H = 1350;

/** Gemeinsame Grundlage: Verlauf plus weiche Lichtkante von oben. */
const rahmen = (inhalt, von, ueber, bis) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${H}" viewBox="0 0 ${B} ${H}">
  <defs>
    <linearGradient id="grund" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${von}"/>
      <stop offset="55%" stop-color="${ueber}"/>
      <stop offset="100%" stop-color="${bis}"/>
    </linearGradient>
    <radialGradient id="licht" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="tiefe" cx="50%" cy="100%" r="80%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${B}" height="${H}" fill="url(#grund)"/>
  ${inhalt}
  <rect width="${B}" height="${H}" fill="url(#licht)"/>
  <rect width="${B}" height="${H}" fill="url(#tiefe)"/>
</svg>`;

/* --- Gastro: konzentrische Boegen, wie eine Lupe ueber einem Ort --------- */
const gastro = rahmen(
  `
  ${[430, 330, 230, 130]
    .map(
      (r, i) =>
        `<circle cx="700" cy="470" r="${r}" fill="none" stroke="${F.hell}" stroke-opacity="${0.14 + i * 0.07}" stroke-width="${2 + i}"/>`,
    )
    .join("\n  ")}
  <circle cx="700" cy="470" r="70" fill="${F.hell}" fill-opacity="0.85"/>
  <path d="M0 980 Q 320 860 620 960 T 1080 900 L1080 1350 L0 1350Z" fill="${F.dunkel}" fill-opacity="0.45"/>
  <path d="M0 1080 Q 360 980 700 1070 T 1080 1020 L1080 1350 L0 1350Z" fill="${F.dunkel}" fill-opacity="0.55"/>
  `,
  F.akzent,
  F.tief,
  F.nacht,
);

/* --- Event: gestapelte, versetzte Flaechen wie ein Karussell ------------- */
const event = rahmen(
  `
  ${[
    { x: 120, y: 300, rot: -8, o: 0.18 },
    { x: 210, y: 380, rot: -4, o: 0.28 },
    { x: 300, y: 460, rot: 0, o: 0.42 },
  ]
    .map(
      (k) =>
        `<rect x="${k.x}" y="${k.y}" width="560" height="560" rx="48" fill="#ffffff" fill-opacity="${k.o}" transform="rotate(${k.rot} ${k.x + 280} ${k.y + 280})"/>`,
    )
    .join("\n  ")}
  <g stroke="#ffffff" stroke-opacity="0.25" stroke-width="3">
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${120 + i * 26}" x2="${300 + i * 40}" y2="${120 + i * 26}"/>`).join("\n    ")}
  </g>
  `,
  F.hell,
  F.mittel,
  F.tief,
);

/* --- Gewinnspiel: Strahlen und Streupunkte ------------------------------- */
const gewinnspiel = rahmen(
  `
  <g transform="translate(540 430)">
    ${Array.from(
      { length: 16 },
      (_, i) =>
        `<rect x="-5" y="-620" width="10" height="520" rx="5" fill="${F.hell}" fill-opacity="${i % 2 ? 0.1 : 0.2}" transform="rotate(${i * 22.5})"/>`,
    ).join("\n    ")}
  </g>
  ${Array.from({ length: 26 }, (_, i) => {
    const x = ((i * 397) % 1000) + 40;
    const y = ((i * 613) % 1150) + 100;
    const r = 5 + ((i * 7) % 16);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${F.hell}" fill-opacity="${0.12 + ((i % 4) * 0.07)}"/>`;
  }).join("\n  ")}
  <circle cx="540" cy="430" r="118" fill="#ffffff" fill-opacity="0.9"/>
  <circle cx="540" cy="430" r="118" fill="none" stroke="${F.nacht}" stroke-opacity="0.25" stroke-width="6"/>
  `,
  F.tief,
  F.nacht,
  F.dunkel,
);

const bilder = [
  { name: "gastro", svg: gastro },
  { name: "event", svg: event },
  { name: "gewinnspiel", svg: gewinnspiel },
];

for (const { name, svg } of bilder) {
  const datei = join(ziel, `${name}.png`);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(datei);
  console.log(`  ${name}.png`);
}

/* Ein kleines, sehr unscharfes Vorschaubild je Cover als data:-URI.
   Next/Image blendet es waehrend des Ladens ein — auf Mobilfunk ist das der
   Unterschied zwischen "graues Loch" und "Bild kommt gleich". */
const platzhalterDaten = {};
for (const { name, svg } of bilder) {
  const winzig = await sharp(Buffer.from(svg)).resize(12, 15).blur(1.2).png().toBuffer();
  platzhalterDaten[name] = `data:image/png;base64,${winzig.toString("base64")}`;
}

writeFileSync(
  join(wurzel, "src", "data", "platzhalter-vorschau.json"),
  JSON.stringify(platzhalterDaten, null, 2) + "\n",
  "utf8",
);

console.log("Fertig. Cover in public/images/platzhalter/, Vorschauen in src/data/.");
