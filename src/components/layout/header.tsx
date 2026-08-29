"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Close, Instagram, Menu } from "@/components/icons";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { navigation, socialLinks } from "@/lib/site";

/**
 * Kopfzeile.
 *
 * Der wichtigste Handlungsaufruf — "Kooperation anfragen" — steht ab 640 px
 * dauerhaft in der Leiste. Darunter nicht, und das ist gerechnet und nicht
 * geschaetzt: Wortmarke (133) + Instagram (44) + Knopf (125) + Menue (46) plus
 * Abstaende ergeben 380 px, waehrend ein 375-px-Telefon nach Innenabstand 335
 * uebrig laesst. Der Knopf hat dort also nicht "wenig Platz", sondern keinen.
 *
 * Verloren geht dadurch nichts: Auf dem Telefon steht derselbe Aufruf als
 * erster Knopf im Hero — also oberhalb der Falz, bevor die Kopfzeile ueberhaupt
 * gebraucht wird — und zusaetzlich ganz oben im aufgeklappten Menue.
 *
 * (Der Kommentar stand hier einmal andersherum: "bleibt auf jeder Breite
 * sichtbar". Das war er auch — allerdings ungewollt, weil das `hidden` gegen
 * das `inline-flex` der Knopfklasse verlor und die Leiste ueber den Bildrand
 * schob. Siehe den Wrapper weiter unten.)
 */
export function Header() {
  const pathname = usePathname();
  const [offen, setOffen] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);

  // Kein Hintergrundscrollen, solange das Menue offen ist.
  useEffect(() => {
    document.body.style.overflow = offen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [offen]);

  useEffect(() => {
    if (!offen) return;
    const beiEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffen(false);
    };
    window.addEventListener("keydown", beiEscape);
    return () => window.removeEventListener("keydown", beiEscape);
  }, [offen]);

  // Am Seitenanfang schwebt die Kopfzeile ohne Rand ueber dem Farbverlauf des
  // Heros. Erst beim Scrollen bekommt sie Rand und Schatten — dann trennt sie
  // tatsaechlich etwas.
  useEffect(() => {
    const beiScroll = () => setGescrollt(window.scrollY > 8);
    beiScroll();
    window.addEventListener("scroll", beiScroll, { passive: true });
    return () => window.removeEventListener("scroll", beiScroll);
  }, []);

  // Ankerlinks auf die Startseite bekommen nie eine Aktiv-Markierung: Welcher
  // Abschnitt gerade im Bild ist, weiss die Kopfzeile nicht — und eine
  // Markierung, die dauerhaft leuchtet, waere schlicht falsch.
  const aktiv = (href: string) => {
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    /* Der Weichzeichner sitzt auf der INNEREN Leiste, nicht auf dem <header>.
       Grund: Ein `backdrop-filter` macht das Element zum Bezugsrahmen fuer
       `position: fixed` in seinem Teilbaum. Solange er am <header> hing, war
       das aufgeklappte Menue nicht am Bildschirm ausgerichtet, sondern an der
       73 Pixel hohen Leiste — sichtbar blieb davon eine Zeile ("Entdecken"),
       der Rest lag ausserhalb. Der <header> traegt jetzt nur noch Haftung und
       Stapelhoehe. */
    <header className="sticky top-0 z-40">
      <div
        className={`backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
          gescrollt || offen
            ? "border-b border-line bg-page/85 shadow-[0_1px_16px_-8px_rgba(8,42,71,0.35)]"
            : "border-b border-transparent bg-page/40"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[var(--width-container)] items-center gap-4 px-5 sm:h-18 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-lg"
            aria-label={`${"Salzburgsucht"} — zur Startseite`}
          >
            <Logo className="text-[1.0625rem]" />
          </Link>

          <nav aria-label="Hauptnavigation" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((eintrag) => (
                <li key={eintrag.href}>
                  <Link
                    href={eintrag.href}
                    aria-current={aktiv(eintrag.href) ? "page" : undefined}
                    onClick={() =>
                      trackEvent(ANALYTICS_EVENTS.navigationClick, {
                        label: eintrag.label,
                        cta_location: "header",
                      })
                    }
                    className={`group relative rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-200 hover:text-primary-dark ${
                      aktiv(eintrag.href) ? "text-primary-dark" : "text-ink"
                    }`}
                  >
                    {eintrag.label}
                    {/* Blauer Indikator statt Flaechenfuellung: Er wandert von
                      der Mitte nach aussen und liegt auf der Grundlinie. */}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-center rounded-full bg-primary transition-transform duration-300 ease-sanft ${
                        aktiv(eintrag.href)
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            {/* Instagram gehoert in die Kopfzeile, weil es der Kanal ist, aus
              dem der Traffic kommt — und der, auf dem die Marke belegbar
              gross ist. Nur Icon: Der Platz gehoert dem Haupt-CTA. */}
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.instagramClick, {
                  cta_location: "header",
                })
              }
              className="grid size-11 shrink-0 place-items-center rounded-full text-ink transition-[background-color,color] duration-200 hover:bg-primary-soft hover:text-primary-dark"
            >
              <Instagram className="size-5" />
              <span className="sr-only">
                Salzburgsucht auf Instagram (öffnet in neuem Tab)
              </span>
            </a>

            {/* Der Umweg ueber einen Wrapper ist notwendig, nicht huebsch.
              `ButtonLink` bringt `inline-flex` in seiner Grundklasse mit. Ein
              `hidden` von aussen landet damit im selben Markup wie
              `inline-flex`, und welches gewinnt, entscheidet die Reihenfolge
              im erzeugten Stylesheet — nicht die im Attribut. Hier gewann
              `inline-flex`: Der Knopf stand auf einem 375 px breiten Telefon
              in der Kopfzeile und schob sie 25 px ueber den Bildrand hinaus.
              Ein Wrapper hat diesen Streit nicht. */}
            <div className="hidden sm:block">
              <ButtonLink
                href="/kooperation"
                event={ANALYTICS_EVENTS.companyCtaClick}
                eventProps={{ cta_location: "header" }}
              >
                Kooperation anfragen
              </ButtonLink>
            </div>

            <Button
              variant="secondary"
              className="!px-3 lg:hidden"
              aria-expanded={offen}
              aria-controls="mobilmenue"
              onClick={() => setOffen((z) => !z)}
            >
              {offen ? (
                <Close className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
              <span className="sr-only">
                {offen ? "Menü schließen" : "Menü öffnen"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {offen ? (
        <div
          id="mobilmenue"
          className="menue-auf fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-page px-5 pt-4 pb-10 sm:top-18 sm:px-6 lg:hidden"
        >
          <nav aria-label="Menü">
            <ul className="flex flex-col gap-1">
              {navigation.map((eintrag) => (
                <li key={eintrag.href}>
                  <Link
                    href={eintrag.href}
                    aria-current={aktiv(eintrag.href) ? "page" : undefined}
                    onClick={() => {
                      // Schliessen beim Klick statt in einem Effekt auf den
                      // Pfad: Der Effekt liefe bei jedem Seitenwechsel, auch
                      // wenn das Menue laengst zu ist.
                      setOffen(false);
                      trackEvent(ANALYTICS_EVENTS.navigationClick, {
                        label: eintrag.label,
                        cta_location: "mobile_menu",
                      });
                    }}
                    className={`flex min-h-13 items-center rounded-xl px-4 text-lg font-semibold transition-colors duration-200 hover:bg-primary-soft ${
                      aktiv(eintrag.href)
                        ? "bg-primary-soft text-primary-dark"
                        : "text-ink"
                    }`}
                  >
                    {eintrag.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 grid gap-3">
            <ButtonLink
              href="/kooperation"
              size="lg"
              onClick={() => setOffen(false)}
              event={ANALYTICS_EVENTS.companyCtaClick}
              eventProps={{ cta_location: "mobile_menu" }}
            >
              Kooperation anfragen
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
