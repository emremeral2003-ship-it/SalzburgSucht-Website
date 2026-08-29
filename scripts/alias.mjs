/**
 * Laesst Node die Importpfade des Projekts verstehen.
 *
 * Im Projekt heisst es ueberall `@/lib/karte` und nie `../../lib/karte.ts` —
 * das ist gut so und wird von Next aufgeloest. Ein Pruefskript, das dieselben
 * Module ohne Next laufen laesst, steht damit vor zwei Problemen: Node kennt
 * das Kuerzel `@/` nicht und haengt bei ESM keine Dateiendung an.
 *
 * Beides erledigt dieser Haken. Er ist die Voraussetzung dafuer, dass sich
 * Rechenlogik aus dem Projekt einzeln pruefen laesst, statt sie im Browser
 * durch eine Komponente hindurch beobachten zu muessen.
 *
 * Aufruf:
 *   node --experimental-strip-types --import ./scripts/alias.mjs <skript>
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-haken.mjs", pathToFileURL("./scripts/"));
