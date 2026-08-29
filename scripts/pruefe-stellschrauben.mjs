/**
 * Prueft, ob jeder Regler im Tweaks-Panel tatsaechlich etwas bewegt.
 *
 * Das ist die eine Zusicherung, die das Panel geben muss. Ein Regler ohne
 * Wirkung ist schlimmer als kein Regler: Man dreht daran, sieht nichts, und
 * weiss danach nicht mehr, ob das Werkzeug kaputt ist oder der eigene Blick.
 * Und weil so etwas beim Umbauen entsteht — eine Regel wird umgeschrieben,
 * die Variable bleibt in der Liste stehen — muss es eine Pruefung geben und
 * keine Sorgfalt.
 *
 * Zwei Dinge werden geprueft:
 *
 *   1. Wird die Variable irgendwo verwendet? "Verwendet" heisst entweder
 *      `var(--x)` im Stylesheet oder im Code — ODER eine Tailwind-Klasse, die
 *      aus ihr erzeugt wird. Der zweite Fall ist der, den man beim ersten
 *      Anlauf uebersieht: `--color-dark` steht in keinem einzigen `var()`,
 *      wird aber ueber `bg-dark` an zwoelf Stellen benutzt.
 *
 *   2. Stimmt der Standardwert in der Registry mit dem @theme-Block ueberein?
 *      Laufen die beiden auseinander, sieht die Seite in der Entwicklung
 *      anders aus als in Produktion — und niemand merkt es, weil die
 *      Abweichung ja "vom Panel" kommt. Genau so lief die Inhaltsbreite
 *      einmal monatelang auf 75rem statt 78rem.
 *
 * Aufruf:  node scripts/pruefe-stellschrauben.mjs
 * Endet mit Code 1, wenn etwas nicht stimmt — damit taugt es fuer die CI.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/* --- Quellen einlesen ---------------------------------------------------- */

function alleDateien(ordner, treffer = []) {
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) alleDateien(pfad, treffer);
    else if (/\.(tsx?|css)$/.test(name)) treffer.push(pfad);
  }
  return treffer;
}

const css = readFileSync("src/app/globals.css", "utf8");
const registry = readFileSync("src/components/tweaks/tokens.ts", "utf8");

// Die Registry selbst zaehlt nicht als Verwendung — dort steht der Name ja
// per Definition drin.
const quellen = alleDateien("src")
  .filter((p) => !p.endsWith("tokens.ts"))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

/* --- Welche Namen stehen in der Registry? -------------------------------- */

const namen = [...new Set([...registry.matchAll(/"(--[a-z0-9-]+)"/g)].map((m) => m[1]))];

/**
 * Tailwind erzeugt aus einem @theme-Eintrag Utility-Klassen. Aus
 * `--color-dark` wird `bg-dark`, `text-dark`, `border-dark` und so weiter;
 * aus `--radius-card` wird `rounded-card`. Diese Klassen sind eine
 * Verwendung, auch wenn im ganzen Projekt kein `var(--color-dark)` steht.
 */
function utilityMuster(variable) {
  const paare = [
    ["--color-", "(bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|accent|caret|divide|shadow|placeholder)"],
    ["--radius-", "rounded"],
    ["--width-", "(w|max-w|min-w)"],
    ["--space-", "(p|m|gap|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)"],
    ["--font-", "font"],
    ["--shadow-", "shadow"],
    ["--ease-", "ease"],
  ];
  for (const [praefix, klassen] of paare) {
    if (variable.startsWith(praefix)) {
      const rest = variable.slice(praefix.length);
      return new RegExp(`\\b${klassen}-${rest}\\b`);
    }
  }
  return null;
}

/* --- 1. Wirkung ---------------------------------------------------------- */

const ohneWirkung = [];
for (const variable of namen) {
  const alsVariable = new RegExp(`var\\(\\s*${variable}\\b`);
  if (alsVariable.test(css) || alsVariable.test(quellen)) continue;

  // Ein Wert kann auch aus JavaScript gelesen werden statt in CSS eingesetzt.
  // Der Nachlauf des Zeigerlichts ist so ein Fall: Er ist eine Zahl fuer eine
  // Rechenschleife und steht trotzdem im Stylesheet, damit das Panel ihn
  // stellen kann.
  if (new RegExp(`getPropertyValue\\(\\s*["'\`]${variable}["'\`]`).test(quellen)) continue;

  const muster = utilityMuster(variable);
  if (muster && (muster.test(quellen) || muster.test(css))) continue;

  const definiert = new RegExp(`^\\s*${variable}:`, "m").test(css);
  ohneWirkung.push({ variable, definiert });
}

/* --- 2. Standardwerte ---------------------------------------------------- */

const abweichend = [];
for (const [, variable, standard] of registry.matchAll(
  /"(--[a-z0-9-]+)",\s*"[^"]*",\s*(-?[\d.]+),/g,
)) {
  const treffer = css.match(new RegExp(`^\\s*${variable}:\\s*([^;]+);`, "m"));
  if (!treffer) continue;
  const imStylesheet = treffer[1].trim();
  const zahl = Number.parseFloat(imStylesheet);
  if (Number.isFinite(zahl) && Math.abs(zahl - Number.parseFloat(standard)) > 1e-9) {
    abweichend.push(`${variable}: Registry ${standard}, Stylesheet ${imStylesheet}`);
  }
}

/* --- Bericht ------------------------------------------------------------- */

console.log(`${namen.length} Stellschrauben in der Registry.\n`);

if (ohneWirkung.length === 0) {
  console.log("✓ Jede zeigt auf eine Variable, die tatsächlich verwendet wird.");
} else {
  console.log(`✗ ${ohneWirkung.length} ohne Wirkung:`);
  for (const e of ohneWirkung) {
    console.log(
      `    ${e.variable} — ${e.definiert ? "definiert, aber nirgends benutzt" : "nicht einmal definiert"}`,
    );
  }
}

if (abweichend.length === 0) {
  console.log("✓ Alle Standardwerte stimmen mit dem @theme-Block überein.");
} else {
  console.log(`✗ ${abweichend.length} Standardwerte weichen ab:`);
  for (const a of abweichend) console.log(`    ${a}`);
}

process.exit(ohneWirkung.length + abweichend.length === 0 ? 0 : 1);
