"use client";

import { Instagram, TikTok } from "@/components/icons";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { socialLinks } from "@/lib/site";

type Ort = string;

/**
 * Social-Links.
 *
 * Beide Klicks werden getrennt gezaehlt und tragen ihren Ort mit. Ohne
 * `cta_location` waere spaeter nicht unterscheidbar, ob der Fussbereich oder
 * der Abschnitt auf der Startseite die Leute zu Instagram bringt.
 */
export function SocialLinks({
  ort,
  variante = "rund",
}: {
  ort: Ort;
  /**
   * `rund` ist fuer dunkle Flaechen gedacht (Fussbereich), `rund-hell` fuer
   * helle. Zwei getrennte Varianten statt einer mit Farbklassen von aussen:
   * Wird eine Farbe ueberschrieben, bleiben beide Klassen im Markup stehen
   * und die Reihenfolge im Stylesheet entscheidet — so entsteht Weiss auf
   * Weiss.
   */
  variante?: "rund" | "rund-hell" | "breit";
}) {
  const kanaele = [
    {
      name: "Instagram",
      href: socialLinks.instagram,
      Icon: Instagram,
      event: ANALYTICS_EVENTS.instagramClick,
    },
    {
      name: "TikTok",
      href: socialLinks.tiktok,
      Icon: TikTok,
      event: ANALYTICS_EVENTS.tiktokClick,
    },
  ];

  if (variante === "breit") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        {kanaele.map(({ name, href, Icon, event }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => trackEvent(event, { cta_location: ort })}
            className="inline-flex min-h-13 flex-1 items-center justify-center gap-2.5 rounded-full border border-line-strong bg-page px-6 text-base font-semibold text-primary-dark transition-colors duration-200 hover:border-primary-dark hover:bg-primary-soft"
          >
            <Icon className="size-5" />
            {name === "Instagram" ? "Auf Instagram folgen" : "Auf TikTok folgen"}
          </a>
        ))}
      </div>
    );
  }

  const rund =
    variante === "rund-hell"
      ? "border-line-strong text-primary-dark hover:border-primary-dark hover:bg-primary-soft"
      : "border-white/25 text-white hover:border-white/60 hover:bg-white/10";

  return (
    <div className="flex gap-2">
      {kanaele.map(({ name, href, Icon, event }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Salzburgsucht auf ${name}`}
          onClick={() => trackEvent(event, { cta_location: ort })}
          className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors duration-200 ${rund}`}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}
