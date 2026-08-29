/**
 * Kontrastberechnung nach WCAG 2.1.
 *
 * Der Grund, warum das Panel überhaupt rechnet statt nur Farben zu setzen:
 * Das Markenblau #80bdff erreicht auf Weiß nur 2:1. Wer hier an den Reglern
 * dreht, soll sofort sehen, wenn eine Kombination unlesbar wird — und nicht
 * erst, wenn sich jemand beschwert.
 */

function kanal(wert: number): number {
  const v = wert / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function leuchtdichte(hex: string): number {
  const bereinigt = hex.replace("#", "").trim();
  const voll =
    bereinigt.length === 3
      ? bereinigt
          .split("")
          .map((z) => z + z)
          .join("")
      : bereinigt;

  const r = parseInt(voll.slice(0, 2), 16);
  const g = parseInt(voll.slice(2, 4), 16);
  const b = parseInt(voll.slice(4, 6), 16);

  if ([r, g, b].some(Number.isNaN)) return 0;

  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

export function kontrast(vordergrund: string, hintergrund: string): number {
  const a = leuchtdichte(vordergrund);
  const b = leuchtdichte(hintergrund);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export type Pruefung = {
  label: string;
  wert: number;
  soll: number;
  bestanden: boolean;
};

/** Die Kombinationen, die auf dieser Website tatsächlich vorkommen. */
export function pruefungen(farben: Record<string, string>): Pruefung[] {
  const weiss = "#ffffff";

  const paare: Array<[string, string, string, number]> = [
    ["Fließtext auf Weiß", farben.ink, weiss, 4.5],
    ["Sekundärtext auf Weiß", farben.muted, weiss, 4.5],
    ["Links auf Weiß", farben.primaryDark, weiss, 4.5],
    ["Weiß auf Aktionsblau", weiss, farben.primaryDark, 4.5],
    ["Weiß auf gedrücktem Aktionsblau", weiss, farben.primaryDeep, 4.5],
    ["Fließtext auf heller Fläche", farben.ink, farben.soft, 4.5],
    ["Text auf Markenblau", farben.ink, farben.primary, 4.5],
    ["Aktionsblau auf hellem Markenblau", farben.primaryDark, farben.primarySoft, 4.5],
    ["Markenblau auf dunklem Abschnitt", farben.primary, farben.dark, 4.5],
    ["Weiß auf dunklem Abschnitt", weiss, farben.dark, 4.5],
    // WCAG 1.4.11: Ränder, die ein Bedienelement überhaupt erst erkennbar
    // machen — Eingabefelder, sekundäre Schaltflächen — brauchen 3:1.
    // Reine Trennlinien (--color-line) sind davon ausgenommen.
    ["Ränder von Bedienelementen", farben.lineStrong, weiss, 3],
  ];

  return paare.map(([label, vg, hg, soll]) => {
    const wert = kontrast(vg, hg);
    return { label, wert, soll, bestanden: wert >= soll };
  });
}
