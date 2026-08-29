"use client";

import Link from "next/link";

import { Instagram, leistungsIcon, Pin } from "@/components/icons";
import { CountUp, Reveal } from "@/components/ui/motion";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { partnerAnzahl, partners } from "@/data/partners";
import { services } from "@/data/services";
import { stats } from "@/lib/site";
import type { Service } from "@/types";

/**
 * Die belegte Reichweite als kompakte Marke.
 *
 * Bewusst eine einzige Zahl statt einer Reihe. Drei Kennzahlen, von denen
 * zwei erfunden sind, sind weniger wert als eine, die stimmt.
 *
 * Der Ring um das Instagram-Zeichen ist der Salzburgsucht-Puls — dasselbe
 * Motiv wie in der Suchwand. Er sitzt hier, weil das die Stelle ist, an der
 * die Marke behauptet, dass da draussen tatsaechlich etwas laeuft.
 */
export function StatBadge({ tone = "hell" }: { tone?: "hell" | "dunkel" }) {
  const dunkel = tone === "dunkel";

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 ${
        dunkel
          ? "border-white/20 bg-white/8"
          : "border-primary/50 bg-page/80 shadow-card backdrop-blur-sm"
      }`}
    >
      <span
        aria-hidden
        className="puls grid size-7 place-items-center rounded-full bg-primary text-ink"
        style={{ "--puls-farbe": dunkel ? "#80bdff" : "#3a94e8" } as React.CSSProperties}
      >
        <Instagram className="size-4" />
      </span>
      <span className={`num text-sm ${dunkel ? "text-white" : "text-ink"}`}>
        {/* Zaehlt beim ersten Sichtbarwerden von 0 hoch. Der vollstaendige
            Wert steht dabei die ganze Zeit im Markup — die Animation
            ueberschreibt ihn nur kurz. Wer kein JavaScript ausfuehrt oder
            weniger Bewegung eingestellt hat, sieht sofort 18.000+. */}
        <strong className="font-bold">
          <CountUp ziel={18000} suffix="+" />
        </strong>{" "}
        <span className={dunkel ? "text-white/70" : "text-muted"}>
          {stats.instagramFollower.label}
        </span>
      </span>
    </div>
  );
}

/**
 * Grosse Kennzahl fuer den Unternehmensbereich.
 *
 * Die Zahl steht vollstaendig im Markup; die Zaehlanimation ueberschreibt sie
 * nur kurz. Wer weniger Bewegung eingestellt hat oder kein JavaScript
 * ausfuehrt, sieht sofort den richtigen Wert.
 */
export function StatBlock({ tone = "dunkel" }: { tone?: "hell" | "dunkel" }) {
  const dunkel = tone === "dunkel";

  return (
    <div
      className={`rounded-card border p-7 sm:p-9 ${
        dunkel ? "border-white/15 bg-white/5" : "border-line bg-primary-soft"
      }`}
    >
      <p
        className={`num display text-[3rem] leading-none sm:text-[4rem] ${
          dunkel ? "text-primary" : "text-primary-dark"
        }`}
      >
        <CountUp ziel={18000} suffix="+" />
      </p>
      <p className={`mt-3 max-w-[24ch] leading-relaxed ${dunkel ? "text-white/75" : "text-muted"}`}>
        Menschen in unserer Instagram-Community — aus Stadt und Land Salzburg.
      </p>
      <p className={`mt-4 text-sm ${dunkel ? "text-white/65" : "text-muted"}`}>
        {stats.instagramFollower.hinweis}
      </p>
    </div>
  );
}

/**
 * "Salzburgsucht in Zahlen" — bewusst keine drei gleichwertigen Kaertchen.
 *
 * Es gibt genau eine belegte Zahl. Drei gleich grosse Kaesten haetten sie auf
 * ein Drittel der Aufmerksamkeit heruntergerechnet und den Abschnitt wie ein
 * Dashboard aussehen lassen. Jetzt traegt die Reichweite die ganze linke
 * Spalte in doppelter Hoehe, und rechts stehen zwei kleinere Angaben, die
 * keine Zahlen sind, aber trotzdem stimmen: der Radius und die Themen.
 *
 * Das ist die Hierarchie des Abschnitts als Layout ausgedrueckt — man liest
 * zuerst die Zahl, dann die Einordnung. In einer Dreierreihe liest man alles
 * gleichzeitig, also nichts.
 */
export function ZahlenBand() {
  const themenTags = ["Unternehmen", "Events", "Gastro", "Lifestyle", "Aktionen", "Jobs"];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2">
      <Reveal className="lg:row-span-2">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-card border border-line bg-page p-7 shadow-card sm:p-9 lg:p-10">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-primary/25 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 size-56 rounded-full bg-accent/15 blur-3xl"
          />

          <div className="relative">
            <p className="eyebrow">Community</p>
            {/* Deutlich groesser als vorher. Diese Zahl ist das Argument der
                Marke — sie darf die Flaeche fuellen, in der sie steht. */}
            <p className="num display mt-6 text-[clamp(3.75rem,2rem+8vw,7rem)] leading-[0.85] text-primary-dark">
              <CountUp ziel={18000} suffix="+" />
            </p>
            <p className="mt-5 max-w-[30ch] text-lg leading-relaxed text-muted">
              Menschen folgen Salzburgsucht auf Instagram — aus Stadt und Land.
            </p>
          </div>

          <p className="relative mt-8 inline-flex items-center gap-2 text-sm text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {stats.instagramFollower.hinweis}
          </p>
        </div>
      </Reveal>

      <Reveal verzug={90}>
        <div className="flex h-full items-start gap-5 rounded-card border border-line bg-soft p-7 sm:p-8">
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-ink"
          >
            <Pin className="size-5" />
          </span>
          <div>
            <p className="display text-[1.75rem] leading-none text-ink sm:text-[2.125rem]">
              Salzburg
            </p>
            <p className="mt-2.5 leading-relaxed text-muted">
              Stadt und Land. Kein Streuverlust nach Wien oder München.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal verzug={180}>
        <div className="h-full rounded-card border border-line bg-soft p-7 sm:p-8">
          <p className="eyebrow">Worüber wir reden</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {themenTags.map((tag) => (
              <li key={tag} className="pill">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}

/**
 * Was Unternehmen buchen koennen — die vollstaendige Uebersicht.
 *
 * Auf der Startseite steht stattdessen die Leistungsschau: Liste plus
 * Vorschau, damit man sieht, was herauskommt. Hier auf der Unternehmensseite
 * bleibt es bei Karten, weil dieser Abschnitt eine andere Aufgabe hat — er
 * ist die Referenz, nicht der Einstieg. Wer bis hierher gescrollt ist, will
 * alles nebeneinander sehen und nicht sieben Mal klicken.
 *
 * Der Groessenunterschied zwischen Kern- und Anlassleistung ist die Aussage:
 * Man sieht auf einen Blick, was Salzburgsucht dauerhaft macht und was man
 * punktuell dazubucht.
 */
export function ServiceCards({ auswahl }: { auswahl?: Service[] }) {
  const liste = auswahl ?? services;
  const gross = liste.filter((s) => s.featured);
  const klein = liste.filter((s) => !s.featured);

  const messen = (service: Service) =>
    trackEvent(ANALYTICS_EVENTS.serviceClick, {
      service: service.slug,
      titel: service.title,
      cta_location: "leistungen",
    });

  return (
    <div className="grid gap-5">
      {gross.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-3">
          {gross.map((service, index) => {
            const Icon = leistungsIcon(service.icon);
            return (
              <Reveal key={service.slug} verzug={index * 90}>
                <Link
                  href="/kooperation"
                  onClick={() => messen(service)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-page p-7 shadow-card transition-[border-color,box-shadow,transform] duration-300 ease-sanft hover:-translate-y-1.5 hover:border-primary hover:shadow-card-hover sm:p-8"
                >
                  {/* Farbwolke, die beim Darueberfahren aus der Ecke
                      aufsteigt. Traegt die Markenfarbe in die Flaeche, ohne
                      die Karte dauerhaft blau zu faerben. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <span
                    aria-hidden
                    className="relative flex size-14 items-center justify-center rounded-2xl bg-primary-soft transition-[background-color,transform] duration-300 ease-feder group-hover:-rotate-6 group-hover:bg-primary"
                  >
                    <Icon className="size-7 text-primary-deep" />
                  </span>

                  <h3 className="display relative mt-7 text-[1.375rem] leading-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="relative mt-3 leading-relaxed text-muted">{service.description}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      ) : null}

      {klein.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {klein.map((service, index) => {
            const Icon = leistungsIcon(service.icon);
            return (
              <Reveal key={service.slug} verzug={index * 90}>
                <Link
                  href="/kooperation"
                  onClick={() => messen(service)}
                  className="group flex h-full flex-col rounded-card border border-line bg-soft p-5 transition-[border-color,background-color,transform] duration-300 ease-sanft hover:-translate-y-1 hover:border-primary hover:bg-page sm:p-6"
                >
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-xl bg-page transition-colors duration-300 group-hover:bg-primary"
                  >
                    <Icon className="size-5 text-primary-deep" />
                  </span>
                  <h3 className="mt-4 font-bold text-ink">{service.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                    {service.description}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Partnerreihe als zwei langsam gegenlaeufige Baender.
 *
 * Typografisch, weil keine Logofreigabe vorliegt. Fremde Logos aus dem Netz
 * zu ziehen waere eine Markenrechtsverletzung — und faellt genau bei den
 * Unternehmen auf, die man als Referenz nennen will.
 *
 * Was den Abschnitt vom Tag-Wolken-Eindruck wegbringt, ist nicht das Band,
 * sondern die Branche unter dem Namen: Eine Liste aus 24 Woertern liest
 * niemand, aber "Chef Döner · Gastro" neben "Arbeiterkammer · Institution"
 * zeigt in zwei Sekunden die Bandbreite — und genau das ist die Aussage des
 * Abschnitts. Die Einordnung steht in src/data/partners.ts.
 *
 * Zwei Reihen statt einer, und die untere laeuft zurueck: Ein einzelnes Band
 * wirkt wie ein Nachrichtenticker, zwei gegenlaeufige wirken wie Bewegung.
 * Beide halten beim Darueberfahren und beim Fokus an — Letzteres, damit man
 * mit der Tastatur ueberhaupt etwas treffen kann.
 *
 * Die Liste steht je Reihe zweimal im Markup, damit der Umlauf ohne Sprung
 * schliesst. Die Kopie ist aria-hidden, sonst liest ein Screenreader 48 statt
 * 24 Namen.
 */
export function PartnerMarquee() {
  const kante = "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)";

  // Der erste Entwurf hatte die Kaertchen im Ruhezustand auf 70 % Deckkraft:
  // Textur im Vorbeiscrollen, Liste beim Hinsehen. Die Idee war gut, die
  // Umsetzung war unlesbar. Deckkraft wirkt auf den Text mit — #5b7185 auf
  // Weiss hat 5,1:1, bei 70 % bleiben 2,6:1 uebrig, und die Branchenzeile ist
  // 11 px klein. Ein ganzes Band unter jeder Lesbarkeitsgrenze, damit es sich
  // im Ruhezustand huebscher zurueckhaelt, ist kein Tausch, den man machen
  // sollte.
  //
  // Zurueckgenommen wirkt das Band jetzt ueber den Rahmen und die weichen
  // Kanten der Maske, nicht ueber die Schrift. Beim Darueberfahren kommt der
  // Rahmen in Markenfarbe dazu und die Karte hebt sich einen Hauch.
  const reihe = (eintraege: typeof partners, versteckt: boolean) => (
    <ul aria-hidden={versteckt || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {eintraege.map((partner) => (
        <li key={partner.name}>
          {/* Rein typografisch. Ein Kaestchen mit zwei Anfangsbuchstaben war
              der naheliegende Logoersatz und die schlechtere Loesung: Bei 24
              Betrieben kommt dieselbe Abkuerzung mehrfach vor ("SA" fuer
              Sahil und fuer Salz & Zucker), und ein doppeltes Zeichen sieht
              nicht nach Platzhalter aus, sondern nach Fehler. Der Name in der
              Ueberschriftenschrift traegt genauso gut — und behauptet nichts,
              was es noch nicht gibt. */}
          <span className="inline-flex min-h-14 flex-col justify-center rounded-2xl border border-line bg-page px-5 py-2.5 whitespace-nowrap shadow-card transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover">
            <span className="font-display text-[1.0625rem] leading-tight font-bold text-ink">
              {partner.name}
            </span>
            {/* Das dunkle Markenblau statt der gedaempften Textfarbe: Bei
                11 px in Versalien und Fettschnitt ist der Unterschied
                zwischen 5,1:1 und 8,4:1 der zwischen "lesbar" und
                "muehelos". */}
            <span className="mt-1 inline-flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-[0.09em] text-primary-deep uppercase">
              <span aria-hidden className="size-1 rounded-full bg-primary" />
              {partner.branche}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );

  const mitte = Math.ceil(partners.length / 2);
  const obere = partners.slice(0, mitte);
  const untere = partners.slice(mitte);

  return (
    <div
      className="laufband-halt relative grid gap-3 overflow-hidden"
      style={{ maskImage: kante, WebkitMaskImage: kante }}
    >
      <div
        className="laufband flex w-max"
        style={{ "--laufband-dauer": "58s" } as React.CSSProperties}
      >
        {reihe(obere, false)}
        {reihe(obere, true)}
      </div>

      <div
        className="laufband laufband-retour flex w-max"
        style={{ "--laufband-dauer": "72s" } as React.CSSProperties}
      >
        {reihe(untere, false)}
        {reihe(untere, true)}
      </div>
    </div>
  );
}

/** Die gezaehlte Anzahl der genannten Betriebe. Gezaehlt, nicht behauptet. */
export function PartnerZahl() {
  return (
    <span className="num font-bold text-primary-dark">
      <CountUp ziel={partnerAnzahl} dauer={900} />
    </span>
  );
}

/** Statische Partnerliste — fuer die Partnerseite, wo alles lesbar sein muss. */
export function PartnerGrid({ limit }: { limit?: number }) {
  const liste = limit ? partners.slice(0, limit) : partners;

  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {liste.map((partner) => {
        const inhalt = (
          <>
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display font-bold text-ink">{partner.name}</span>
              <span className="mt-1 text-[0.6875rem] font-bold tracking-[0.09em] text-muted uppercase">
                {partner.branche}
              </span>
            </span>
          </>
        );

        return (
          <li key={partner.name}>
            {partner.website ? (
              <Link
                href={partner.website}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => trackEvent(ANALYTICS_EVENTS.partnerClick, { company: partner.name })}
                className="flex min-h-14 items-start gap-3 rounded-2xl border border-line bg-page px-4 py-3 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary"
              >
                {inhalt}
              </Link>
            ) : (
              <span className="flex min-h-14 items-start gap-3 rounded-2xl border border-line bg-page px-4 py-3 shadow-card">
                {inhalt}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
