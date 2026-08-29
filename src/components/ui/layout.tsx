import type { ElementType, ReactNode } from "react";

/** Horizontale Begrenzung des Inhalts. Breite ist ein Designtoken. */
export function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[var(--width-container)] px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * Kopf eines Abschnitts.
 *
 * `eyebrow` ordnet ein, die Ueberschrift behauptet, der Text erklaert. Diese
 * drei Ebenen wiederholen sich auf der ganzen Seite — daher eine Komponente
 * und keine dreimal abgetippte Struktur.
 */
export function SectionHeader({
  eyebrow,
  title,
  text,
  zentriert = false,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  zentriert?: boolean;
  className?: string;
}) {
  return (
    <div className={`${zentriert ? "mx-auto max-w-[52ch] text-center" : "max-w-[52ch]"} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="display display-m mt-3 text-ink">{title}</h2>
      {text ? (
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{text}</p>
      ) : null}
    </div>
  );
}

/** Karte mit Rand und weichem Schatten — die Grundform der ganzen Seite. */
export function Card({
  children,
  className = "",
  interaktiv = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  interaktiv?: boolean;
  as?: ElementType;
}) {
  return (
    <Tag
      className={`rounded-card border border-line bg-page shadow-card ${
        interaktiv
          ? "transition-[border-color,box-shadow,transform] duration-300 ease-sanft hover:-translate-y-1 hover:border-primary/60 hover:shadow-card-hover"
          : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
