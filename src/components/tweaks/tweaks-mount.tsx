"use client";

import dynamic from "next/dynamic";

/**
 * Einhängepunkt des Tweaks-Panels — DERZEIT NICHT EINGEHÄNGT (28.08.2026).
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE BEDINGUNG UNTEN NICHT GENÜGT HAT
 * ---------------------------------------------------------------------------
 * Die Prüfung auf `NODE_ENV` sorgt dafür, dass das Panel in Produktion nicht
 * ANGEZEIGT wird. Sie sorgt nicht dafür, dass sein Code nicht AUSGELIEFERT
 * wird. Nachgemessen am Produktionsbuild vom 28.08.2026: ein eigener Chunk
 * von 28 KB unter /_next/static/chunks/ mit sämtlichen Reglern und
 * Beschriftungen — abrufbar für jeden, der die Datei anfragt.
 *
 * Der frühere Kommentar an dieser Stelle behauptete das Gegenteil. Er war
 * falsch: `dynamic()` hält den Code aus dem Haupt-Bundle heraus, vom Server
 * nimmt er ihn nicht. Solange irgendwo ein Verweis auf dieses Bauteil steht,
 * wird der Chunk gebaut und mit ausgeliefert.
 *
 * Deshalb ist der VERWEIS entfernt, nicht die Bedingung: In src/app/layout.tsx
 * steht kein <TweaksMount /> mehr. Damit fehlt der Chunk im Build vollständig
 * (nachgeprüft: keine Treffer mehr auf "Eckenradius" in .next/static/chunks/).
 *
 * ---------------------------------------------------------------------------
 * FÜR EINE DESIGN-SITZUNG WIEDER EINHÄNGEN
 * ---------------------------------------------------------------------------
 * In src/app/layout.tsx die zwei Zeilen zurücknehmen:
 *
 *   import { TweaksMount } from "@/components/tweaks/tweaks-mount";
 *   …
 *   <TweaksMount />
 *
 * Danach vor dem Deploy wieder entfernen. Alles unter src/components/tweaks/
 * bleibt unverändert liegen.
 */
const Panel = dynamic(
  () => import("@/components/tweaks/tweaks-panel").then((m) => m.TweaksPanel),
  { ssr: false },
);

export function TweaksMount() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Panel />;
}
