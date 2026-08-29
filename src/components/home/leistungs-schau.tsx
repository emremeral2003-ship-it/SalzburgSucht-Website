"use client";

import { useState } from "react";

import { BeitragsRahmen } from "@/components/home/beitrag-rahmen";
import { ArrowRight, leistungsIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { services } from "@/data/services";

/**
 * "Was wir für euch machen" — Liste links, Vorschau rechts.
 *
 * Vorher standen hier sieben Karten in einem Raster. Das war lesbar und
 * vollstaendig und trotzdem das Schwaechste auf der Seite: Ein Raster aus
 * Icon-plus-Text-Kaertchen sieht auf jeder zweiten Agenturseite gleich aus,
 * und es beantwortet die einzige Frage nicht, die ein Unternehmen an dieser
 * Stelle hat — **wie sieht das nachher aus?**
 *
 * Deshalb jetzt: Man faehrt eine Leistung an, und rechts steht der Beitrag,
 * der dabei herauskommt. Die Attrappe ist dieselbe wie im Formatabschnitt
 * (beitrag-rahmen.tsx), damit die Seite eine Bildsprache hat und nicht zwei.
 *
 * Vier Entscheidungen dahinter:
 *
 *   1. **Ueberfahren waehlt aus, Klicken auch.** Auf dem Desktop reicht die
 *      Maus, ohne dass man sich fuer etwas entscheiden muss. Auf dem Telefon
 *      und mit der Tastatur waehlt der Klick beziehungsweise der Fokus. Die
 *      Auswahl faellt nie von selbst zurueck — was man zuletzt angesehen hat,
 *      bleibt stehen.
 *   2. **Keine Registerkarten-Rollen.** Die Liste erscheint auf schmalen
 *      Geraeten als waagrechte Leiste und auf breiten als Spalte. Als
 *      `tablist` haette dieselbe Gruppe zwei Orientierungen und eine
 *      Pfeiltastenbedienung, die auf dem Telefon nicht zur Darstellung passt.
 *      Sieben Knoepfe mit `aria-pressed` sind ehrlicher — und mit der Tastatur
 *      in derselben Reihenfolge erreichbar, in der sie dastehen.
 *   3. **Die Vorschau ist `aria-live`, aber nicht laut.** Angesagt wird der
 *      Name der Leistung, nicht die Attrappe. Wer nicht sieht, gewinnt aus
 *      "Farbverlauf mit Symbol" nichts.
 *   4. **Keine Ergebniszahlen.** In der Vorschau stehen die Formate, in denen
 *      diese Leistung laeuft — eine Aussage ueber die Produktion. Aufrufe oder
 *      Reichweiten stuenden dort nur, wenn sie belegt waeren.
 */
export function LeistungsSchau() {
  const [aktiv, setAktiv] = useState(0);
  const leistung = services[aktiv];
  const Motiv = leistungsIcon(leistung.icon);

  function waehlen(index: number) {
    if (index === aktiv) return;
    setAktiv(index);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-12">
      {/* ------------------------------------------------------ Die Liste */}
      {/* `min-w-0` ist hier keine Kosmetik, sondern Pflicht: Ein Rasterfeld
          ist standardmaessig mindestens so breit wie sein Inhalt. Die Liste
          darunter ist als waagrechte Leiste rund 1450 px breit — ohne diese
          Klasse zieht sie die Spalte auf ihre volle Breite, die Vorschau
          daneben wird mitgezogen, und auf dem Telefon steht der halbe
          Abschnitt ausserhalb des Bildschirms. Sichtbar wird das nicht
          einmal als Scrollbalken, weil `overflow-x: hidden` am <html> den
          Ueberhang abschneidet — der Abschnitt ist dann einfach kaputt. */}
      <Reveal className="min-w-0">
        {/* Auf dem Telefon eine waagrechte Leiste, die ueber den Rand des
            Inhaltsbereichs hinausscrollt (die negativen Aussenabstaende) —
            sonst haetten sieben Zeilen dort die halbe Bildschirmhoehe
            gebraucht, bevor man die erste Vorschau sieht. */}
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {services.map((service, index) => {
            const dran = index === aktiv;
            const Icon = leistungsIcon(service.icon);

            return (
              <li key={service.slug} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={dran}
                  onClick={() => waehlen(index)}
                  onMouseEnter={() => waehlen(index)}
                  onFocus={() => waehlen(index)}
                  className={`schau-zeile relative flex min-h-11 w-full items-center gap-3 rounded-full border px-4 text-left whitespace-nowrap lg:items-start lg:gap-4 lg:rounded-2xl lg:border-transparent lg:py-4 lg:pr-5 lg:pl-6 lg:whitespace-normal ${
                    dran
                      ? "border-primary bg-primary-soft text-ink lg:bg-primary-soft"
                      : "border-line bg-page text-ink hover:border-primary/60 lg:bg-transparent lg:hover:bg-soft"
                  }`}
                >
                  {/* Markierungsbalken. Nur auf der Spaltenansicht — in der
                      waagrechten Leiste traegt der gefuellte Hintergrund
                      dieselbe Aussage. */}
                  <span
                    aria-hidden
                    className="schau-marke absolute top-4 bottom-4 left-0 hidden w-[3px] rounded-full bg-primary-dark lg:block"
                  />

                  <span
                    aria-hidden
                    className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-200 lg:size-11 lg:rounded-xl ${
                      dran ? "bg-primary text-ink" : "bg-primary-soft text-primary-deep"
                    }`}
                  >
                    <Icon className="size-4 lg:size-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-bold lg:text-[1.0625rem]">
                      {service.title}
                    </span>
                    {/* Der Beschreibungstext waere in der waagrechten Leiste
                        eine endlos lange Zeile. */}
                    <span className="mt-1 hidden text-[0.9375rem] leading-relaxed text-muted lg:block">
                      {service.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Reveal>

      {/* --------------------------------------------------- Die Vorschau */}
      <Reveal verzug={90} className="relative">
        {/* Das Echo: ein einzelner Ring, der bei jedem Wechsel der Leistung
            einmal hinter der Vorschau aufgeht. Er hat denselben Schluessel wie
            die Vorschau selbst, laeuft also genau dann, wenn sich dort etwas
            aendert — und sonst nie. Mehr passiert in diesem Abschnitt vom
            Signalsystem nicht: Die Leistungsschau ist inhaltlich schon der
            dichteste Bereich der Seite, sie braucht keinen zweiten Reiz. */}
        <span
          key={leistung.slug}
          aria-hidden
          className="signal-echo top-[-4rem] left-[calc(50%-14rem)] -z-10 hidden size-[28rem] sm:block"
        />

        <div className="rounded-card border border-line bg-page p-5 shadow-float sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">So sieht das aus</p>
            <span className="text-[0.8125rem] text-muted">Beispiel</span>
          </div>

          <div aria-live="polite" className="mt-5">
            {/* Der Schluessel erzwingt bei jedem Wechsel einen neuen Knoten —
                nur so laeuft die Einblendung erneut an, statt einmal beim
                Laden und danach nie wieder. */}
            {/* Kein zusaetzliches `sr-only`-"Vorschau: X" mehr. Der Bereich
                ist bereits `aria-live`, und der Titel steht sichtbar darin —
                die Zusatzzeile hat jeden Wechsel doppelt angesagt. */}
            <div key={leistung.slug} className="vorschau-rein">
              <div className="mx-auto max-w-[15rem] lg:max-w-none">
                <BeitragsRahmen
                  art={leistung.vorschau}
                  farbe={leistung.farbe}
                  Motiv={Motiv}
                />
              </div>

              <p className="mt-5 font-display text-[1.125rem] leading-snug font-bold text-ink">
                {leistung.title}
              </p>

              <ul className="mt-3 flex flex-wrap gap-2">
                {leistung.formate.map((format) => (
                  <li key={format} className="pill">
                    {format}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ButtonLink
            href="/kooperation"
            className="mt-6 w-full"
            event={ANALYTICS_EVENTS.serviceClick}
            eventProps={{
              service: leistung.slug,
              titel: leistung.title,
              cta_location: "leistungsschau",
            }}
            onClick={() =>
              trackEvent(ANALYTICS_EVENTS.companyCtaClick, {
                cta_location: "leistungsschau_vorschau",
              })
            }
          >
            Diese Leistung anfragen
            <ArrowRight className="cta-pfeil size-4" />
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
