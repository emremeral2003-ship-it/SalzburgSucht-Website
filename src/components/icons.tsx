/**
 * Gezeichnetes Icon-Set. Eine Strichstärke (1.6), ein Kappenstil, keine
 * Emoji-Platzhalter. Alle Icons erben die Textfarbe über currentColor.
 */

type IconProps = {
  className?: string;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path {...stroke} d="M4 12h15" />
      <path {...stroke} d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function Magnifier({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle {...stroke} cx="10.5" cy="10.5" r="6.5" />
      <path {...stroke} d="m15.4 15.4 4.6 4.6" />
    </svg>
  );
}

export function Pin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path {...stroke} d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle {...stroke} cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path {...stroke} d="m4.5 12.5 4.5 4.5 10.5-10.5" />
    </svg>
  );
}

export function Instagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect {...stroke} x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle {...stroke} cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function TikTok({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path {...stroke} d="M14.4 3.5v10.9a3.9 3.9 0 1 1-3.9-3.9" />
      <path {...stroke} d="M14.4 6.2a4.7 4.7 0 0 0 4.5 3.4" />
    </svg>
  );
}

export function Info({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M12 11v5" {...stroke} />
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function Menu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
    </svg>
  );
}

export function Close({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M6 6l12 12M18 6L6 18" {...stroke} />
    </svg>
  );
}

export function Clock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M12 7.5V12l3 1.8" {...stroke} />
    </svg>
  );
}

export function Megafon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H8l6 4V4.5l-6 4H5.5A1.5 1.5 0 0 0 4 10Z" {...stroke} />
      <path d="M17.5 9a4 4 0 0 1 0 6" {...stroke} />
    </svg>
  );
}

export function Kalender({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" {...stroke} />
      <path d="M3.5 10h17M8 3.5v3M16 3.5v3" {...stroke} />
    </svg>
  );
}

export function Besteck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M7 3.5v7a2.5 2.5 0 0 0 5 0v-7M9.5 13v7.5" {...stroke} />
      <path d="M16.5 3.5C15 5 14.5 7 14.5 9.5c0 1.5.7 2.3 2 2.5v8.5" {...stroke} />
    </svg>
  );
}

export function Personen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="9" cy="8.5" r="3.2" {...stroke} />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...stroke} />
      <path d="M16 6.2a3.2 3.2 0 0 1 0 6M17.5 15c2 .6 3.2 2.3 3.2 4.5" {...stroke} />
    </svg>
  );
}

export function Geschenk({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="3.5" y="9" width="17" height="11" rx="2" {...stroke} />
      <path d="M3.5 13h17M12 9v11" {...stroke} />
      <path d="M12 9S10.5 4.5 8 4.5a2 2 0 0 0 0 4.5M12 9s1.5-4.5 4-4.5a2 2 0 0 1 0 4.5" {...stroke} />
    </svg>
  );
}

export function Funke({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7L4.5 10.9 10.1 9 12 3.5Z" {...stroke} />
      <path d="M18.5 16.5 19.3 18.7l2.2.8-2.2.8-.8 2.2" {...stroke} />
    </svg>
  );
}

export function Mail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...stroke} />
      <path d="m4 8 7.1 4.7a1.6 1.6 0 0 0 1.8 0L20 8" {...stroke} />
    </svg>
  );
}

export function Extern({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M14 4.5h5.5V10" {...stroke} />
      <path d="M19.5 4.5 11 13" {...stroke} />
      <path d="M18 14.5v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4" {...stroke} />
    </svg>
  );
}

export function Film({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect {...stroke} x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path {...stroke} d="M3 9h18M3 15h18M8 4.5v15M16 4.5v15" />
    </svg>
  );
}

/**
 * Zuordnung der Leistungs-Icons.
 *
 * Stand hier vorher zweimal — einmal in der Leistungsuebersicht, einmal in der
 * Leistungsschau. Zwei Kopien derselben Tabelle bedeuten, dass ein neues Icon
 * an einer Stelle wirkt und an der anderen zum Rueckfallsymbol wird.
 */
export const leistungsIcons = {
  megafon: Megafon,
  kalender: Kalender,
  besteck: Besteck,
  personen: Personen,
  geschenk: Geschenk,
  funke: Funke,
  film: Film,
} as const;

export function leistungsIcon(name: string) {
  return leistungsIcons[name as keyof typeof leistungsIcons] ?? Funke;
}
