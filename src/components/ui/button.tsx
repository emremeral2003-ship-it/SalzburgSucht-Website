"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { trackEvent, type AnalyticsEvent, type EventProperties } from "@/lib/analytics";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkGhost";
type Size = "md" | "lg";

/**
 * `gruppe-cta` steckt in der Grundklasse, damit ein Pfeil im Inhalt beim
 * Darueberfahren mitwandert, ohne dass jede Aufrufstelle daran denken muss.
 */
/**
 * Der gedrueckte Zustand ist bewusst winzig: zwei Prozent kleiner und wieder
 * auf der Grundlinie. Man sieht ihn nicht bewusst, man spuert nur, dass der
 * Knopf nachgibt. Eine deutliche Verkleinerung waere eine Animation — und
 * Animationen gehoeren nicht in den Moment, in dem jemand etwas ausloest.
 */
const base =
  "gruppe-cta inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-sanft hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:duration-75 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:active:scale-100";

const sizes: Record<Size, string> = {
  // Mindestens 44px hoch — Daumen auf einem Smartphone treffen nichts Kleineres.
  md: "min-h-11 px-5 py-3 text-[0.9375rem]",
  lg: "min-h-13 px-7 py-3.5 text-base",
};

/**
 * Warum es eigene Varianten fuer dunkle Flaechen gibt statt einzelner Klassen
 * von aussen: Wird eine Variante per className ueberschrieben, bleiben beide
 * Farbklassen im Markup stehen und die Reihenfolge im Stylesheet entscheidet.
 * Genau so entstand hier einmal weisse Schrift auf #80bdff mit 2:1.
 */
/**
 * Der Schein beim Darueberfahren liegt nur auf den beiden vollflaechigen
 * Varianten. Ein leuchtender Umriss auf einem Geisterknopf sieht aus wie ein
 * Fehler — und wuerde die Rangfolge der Handlungsaufrufe einebnen, die genau
 * der Punkt dieser Varianten ist.
 */
const variants: Record<Variant, string> = {
  // #1e71bf traegt weissen Text mit 5:1. Das Markenblau koennte das nicht.
  primary: "bg-primary-dark text-white shadow-card hover:bg-primary-deep hover:shadow-cta",
  secondary:
    "border border-line-strong bg-page/80 text-primary-dark hover:border-primary-dark hover:bg-primary-soft hover:shadow-card",
  ghost: "text-primary-dark hover:bg-primary-soft",
  // Auf dunklem Grund traegt ausschliesslich die dunkle Schrift auf dem
  // Markenblau — weiss darauf waeren 2:1.
  onDark: "bg-primary text-ink shadow-card hover:bg-white hover:shadow-cta-hell",
  onDarkGhost: "border border-white/35 text-white hover:border-white/70 hover:bg-white/10",
};

type Messung = { event?: AnalyticsEvent; eventProps?: EventProperties };

function klassen(variant: Variant, size: Size, className: string) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  event,
  eventProps,
  onClick,
  ...props
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & Messung &
  Omit<ComponentProps<"a">, "href">) {
  const extern = href.startsWith("http") || href.startsWith("mailto:");

  /**
   * Ein Sprungziel im selben Dokument ("#entdecken") bekommt einen einfachen
   * Anker statt eines <Link>.
   *
   * Grund: Steht der Hash schon in der Adresszeile, haelt der Router einen
   * weiteren Klick auf dasselbe Ziel fuer einen Wechsel zur aktuellen Seite
   * und tut nichts. Der Knopf "Salzburg entdecken" war damit nach dem ersten
   * Gebrauch tot — er sah aus wie vorher und bewegte nichts mehr.
   *
   * Ein gewoehnlicher Anker springt dagegen jedes Mal zum Ziel, auch beim
   * zehnten Klick, und das Sanftscrollen kommt aus `scroll-behavior` im
   * Stylesheet. Kein JavaScript noetig.
   */
  const ankerImDokument = href.startsWith("#");

  // Messung und eigener Klickhandler muessen beide laufen. Wuerde `onClick`
  // einfach mitgespreizt, ueberschriebe es die Messung stillschweigend.
  const beiKlick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (event) trackEvent(event, eventProps);
    onClick?.(e);
  };

  if (extern || ankerImDokument) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
        className={klassen(variant, size, className)}
        onClick={beiKlick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={klassen(variant, size, className)} onClick={beiKlick} {...props}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  event,
  eventProps,
  onClick,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size } & Messung) {
  return (
    <button
      className={klassen(variant, size, className)}
      onClick={(e) => {
        if (event) trackEvent(event, eventProps);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
