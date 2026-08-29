/**
 * Der eigentliche Aufloesungshaken. Siehe scripts/alias.mjs.
 *
 * Zwei Aufgaben:
 *   1. `@/x` wird zu `<projekt>/src/x`
 *   2. fehlende Dateiendung ergaenzen — Node tut das bei ESM nicht von selbst
 */
import { existsSync } from "node:fs";
import { resolve as pfadAufloesen } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = pathToFileURL(pfadAufloesen(process.cwd(), "src") + "/").href;
const ENDUNGEN = [".ts", ".tsx", ".mts", ".js", ".json", "/index.ts", "/index.tsx"];

/** Die erste Variante, die es wirklich gibt. */
function mitEndung(url) {
  if (existsSync(fileURLToPath(url))) return url;
  for (const endung of ENDUNGEN) {
    const versuch = url + endung;
    if (existsSync(fileURLToPath(versuch))) return versuch;
  }
  return url;
}

/**
 * JSON-Importe brauchen in Node eine Attributangabe (`with { type: "json" }`).
 * Bundler verlangen sie nicht, und im Projektcode steht sie deshalb nirgends —
 * die Kartengeometrie wird schlicht als Modul importiert. Der Haken ergaenzt
 * das Attribut, statt den Projektcode fuer ein Pruefskript zu veraendern.
 */
function ergebnis(url, kontext) {
  const istJson = url.endsWith(".json");
  return {
    url,
    shortCircuit: true,
    format: istJson ? "json" : undefined,
    importAttributes: istJson ? { type: "json" } : kontext.importAttributes,
  };
}

export function resolve(spezifizierer, kontext, naechster) {
  if (spezifizierer.startsWith("@/")) {
    return ergebnis(mitEndung(new URL(spezifizierer.slice(2), SRC).href), kontext);
  }

  if (spezifizierer.startsWith(".") && kontext.parentURL) {
    return ergebnis(mitEndung(new URL(spezifizierer, kontext.parentURL).href), kontext);
  }

  return naechster(spezifizierer, kontext);
}
