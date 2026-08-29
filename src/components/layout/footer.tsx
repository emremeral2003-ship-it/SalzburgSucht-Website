import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/layout/social-links";
import { CookieSettingsButton } from "@/components/consent/cookie-consent";
import { navigation, site } from "@/lib/site";

const rechtliches = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
];

/**
 * Die Jobliste steht nur hier, nicht in der Hauptnavigation.
 *
 * Absicht: Jobs sind ein Nebenfeature. In der Kopfzeile wuerden sie
 * Salzburgsucht wie eine Jobboerse aussehen lassen — im Fussbereich sind sie
 * auffindbar, ohne die Wahrnehmung der Marke zu verschieben.
 */
const weitere = [{ href: "/jobs", label: "Alle Jobs" }];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-dark text-white">
      <div className="mx-auto w-full max-w-[var(--width-container)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="text-[1.1875rem]" tone="dunkel" />
            <p className="mt-5 max-w-[38ch] leading-relaxed text-white/70">
              {site.claim}
            </p>
            <div className="mt-6">
              <SocialLinks ort="footer" />
            </div>
          </div>

          <Spalte titel="Website">
            {[...navigation, ...weitere].map((eintrag) => (
              <FussLink key={eintrag.href} href={eintrag.href}>
                {eintrag.label}
              </FussLink>
            ))}
          </Spalte>

          <Spalte titel="Rechtliches">
            {rechtliches.map((eintrag) => (
              <FussLink key={eintrag.href} href={eintrag.href}>
                {eintrag.label}
              </FussLink>
            ))}
            <li>
              <CookieSettingsButton />
            </li>
          </Spalte>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>Salzburg, Österreich</p>
        </div>
      </div>
    </footer>
  );
}

function Spalte({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold tracking-[0.12em] text-primary uppercase">{titel}</h2>
      <ul className="mt-4 space-y-1">{children}</ul>
    </div>
  );
}

function FussLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        // 44 px, nicht 36: Der Fussbereich wird fast ausschliesslich auf dem
        // Telefon bedient, und ein Daumen trifft nichts Kleineres zuverlaessig.
        // Der negative Seitenrand haelt die Beschriftungen trotz der groesseren
        // Trefferflaeche buendig an der Spaltenkante.
        className="-mx-2 inline-flex min-h-11 items-center rounded-lg px-2 text-[0.9375rem] text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}
