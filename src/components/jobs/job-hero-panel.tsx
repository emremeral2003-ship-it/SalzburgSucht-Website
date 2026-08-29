"use client";

import { useEffect, useRef, useState } from "react";

import { JobDrawer } from "@/components/jobs/job-drawer";
import { ArrowRight, Clock, Pin } from "@/components/icons";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { FirmenLogo } from "@/components/jobs/firmen-logo";
import type { Job } from "@/types";

/**
 * Das Job-Fenster im Hero.
 *
 * Die ganze Gestaltungsabsicht in einem Satz: Jobs sollen sichtbar, aber
 * nicht dominant sein. Deshalb sitzen sie als kompaktes, schwebendes Fenster
 * neben der Headline statt als eigener Abschnitt — und es sind hoechstens
 * drei. Wer die Seite oeffnet, soll eine lokale Marke sehen, und erst als
 * dritten Gedanken: "Ah, die zeigen auch ein paar Jobs."
 *
 * Die drei Stellen liegen als leicht ueberlappender Stapel uebereinander. Der
 * Effekt ist bewusst klein gehalten: Beruehrt man eine Karte, tritt sie aus
 * dem Stapel heraus und die anderen weichen minimal zurueck. Das macht das
 * Fenster interessant genug, um darauf zu klicken — ohne dass es aussieht wie
 * ein Stellenportal, das sich in den Hero gedraengt hat.
 *
 * Ueberlappt wird nur der untere Rand einer Karte, nie ihr Inhalt. Sonst
 * waere die Verspieltheit auf Kosten der Lesbarkeit gegangen.
 *
 * Auf dem Smartphone wird daraus kein zusammengequetschtes Seitenfenster,
 * sondern eine Karte unter dem Hero — mit demselben Drawer dahinter, der
 * dort von unten hereinfaehrt.
 */
export function JobHeroPanel({ jobs }: { jobs: Job[] }) {
  const [offenerJob, setOffenerJob] = useState<Job | null>(null);
  const [aktiv, setAktiv] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const ausloeserRef = useRef<HTMLButtonElement | null>(null);

  // Einmal melden, wenn das Fenster tatsaechlich gesehen wurde. Ohne das
  // waere spaeter nicht unterscheidbar, ob niemand auf Jobs klickt, weil sie
  // niemanden interessieren — oder weil sie niemand zu Gesicht bekommt.
  useEffect(() => {
    const element = panelRef.current;
    if (!element || jobs.length === 0) return;

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege[0]?.isIntersecting) return;
        beobachter.disconnect();

        trackEvent(ANALYTICS_EVENTS.jobSidebarView, {
          cta_location: "hero_job_deck",
          anzahl: jobs.length,
        });

        // Zusaetzlich je Stelle: Erst damit ist eine Klickrate pro Inserat
        // berechenbar statt nur eine ueber das ganze Fenster.
        for (const job of jobs) {
          trackEvent(ANALYTICS_EVENTS.jobCardView, {
            job_id: job.id,
            job_title: job.title,
            company: job.company,
            cta_location: "hero_job_deck",
          });
        }
      },
      { threshold: 0.5 },
    );

    beobachter.observe(element);
    return () => beobachter.disconnect();
  }, [jobs]);

  if (jobs.length === 0) return null;

  function oeffnen(job: Job, knopf: HTMLButtonElement) {
    ausloeserRef.current = knopf;
    trackEvent(ANALYTICS_EVENTS.jobCardClick, {
      job_id: job.id,
      job_title: job.title,
      company: job.company,
      cta_location: "hero_job_deck",
    });
    setOffenerJob(job);
  }

  function schliessen(grund: "x" | "aussen" | "escape") {
    if (offenerJob) {
      trackEvent(ANALYTICS_EVENTS.jobDetailClose, {
        job_id: offenerJob.id,
        job_title: offenerJob.title,
        grund,
        cta_location: "hero_job_deck",
      });
    }
    setOffenerJob(null);
    // Fokus zurueck auf die Karte, von der aus geoeffnet wurde — sonst
    // beginnt die Tastaturbedienung wieder ganz oben auf der Seite.
    ausloeserRef.current?.focus();
  }

  return (
    <>
      {/* Zwei Bewegungen, zwei Elemente: Aussen das einmalige Hereinfahren
          beim Laden, innen das sehr langsame Atmen. Beides auf denselben
          Knoten zu legen ginge nicht — die Einblendung haelt ihren Endzustand
          fest und wuerde das Atmen sofort ueberschreiben. */}
      <div className="ein-rechts" style={{ animationDelay: "220ms" }}>
        <aside
          ref={panelRef}
          aria-label="Aktuelle Jobs aus Salzburg"
          className="atmen glas rounded-card border border-white/70 p-5 shadow-float sm:p-6"
          style={{ "--atem-dauer": "8.5s", "--atem-verzug": "1.2s" } as React.CSSProperties}
        >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="display text-[1.0625rem] leading-tight text-ink">
              Gerade gesucht in Salzburg
            </h2>
            <p className="mt-1 text-sm text-muted">Ausgewählte Stellen unserer Partnerbetriebe</p>
          </div>
          <span
            aria-hidden
            className="num grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-ink"
          >
            {jobs.length}
          </span>
        </div>

        {/* Der Stapel. `isolate` haelt die z-Index-Reihenfolge innerhalb der
            Liste, damit eine angehobene Karte nicht ueber die Kopfzeile
            wandert. */}
        <ul className="isolate mt-5 grid" onMouseLeave={() => setAktiv(null)}>
          {jobs.map((job, index) => {
            const dran = aktiv === index;

            /* Frueher stand hier ein Stapeleffekt: jede Karte ein Stueck
               schmaler als die davor, die angefasste auf 1.025 vergroessert.
               Das ist raus.

               Zwei Gruende. Erstens ragte die vergroesserte Karte seitlich
               aus dem Fenster heraus, weil `scale` ueber die eigene Breite
               hinausgeht und der Rahmen sie nicht mitwachsen laesst.
               Zweitens sahen unterschiedlich breite Karten mit unterschied-
               lichen Einzuegen schlicht nach Fehler aus — der Effekt war fuer
               drei Demokarten gedacht und traegt bei echten Inseraten nicht.

               Geblieben ist das Anheben um wenige Pixel. Es zeigt dasselbe
               ("diese Karte ist gemeint"), ohne die Breite anzutasten. */

            return (
              <li
                key={job.id}
                className="ein-unten"
                style={{
                  marginTop: index === 0 ? 0 : "0.625rem",
                  zIndex: dran ? 20 : index,
                  animationDelay: `${360 + index * 100}ms`,
                }}
              >
                <button
                  type="button"
                  onClick={(e) => oeffnen(job, e.currentTarget)}
                  onMouseEnter={() => setAktiv(index)}
                  onFocus={() => setAktiv(index)}
                  onBlur={() => setAktiv(null)}
                  className={`deck-karte group block w-full rounded-2xl border bg-page/95 p-4 text-left ${
                    dran
                      ? "border-primary shadow-card-hover"
                      : "border-line shadow-deck hover:border-primary"
                  }`}
                  style={{ "--deck-y": dran ? "-4px" : "0px" } as React.CSSProperties}
                >
                  <span className="flex items-start gap-3">
                    <FirmenLogo
                      job={job}
                      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-soft text-xs font-bold text-primary-deep transition-colors duration-300 group-hover:bg-primary group-hover:text-ink"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] leading-snug font-bold text-ink">
                        {job.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-primary-dark">{job.company}</span>
                    </span>
                  </span>

                  <span className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Pin className="size-3.5" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {job.employmentType}
                      </span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-semibold transition-colors duration-300 ${
                        dran ? "bg-primary text-ink" : "bg-primary-soft text-primary-dark"
                      }`}
                    >
                      Ansehen
                      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-[3px]" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

          <p className="mt-5 border-t border-line pt-4 text-[0.8125rem] leading-relaxed text-muted">
            Jede Stelle läuft zusätzlich über unsere Instagram- und TikTok-Kanäle.
          </p>
        </aside>
      </div>

      <JobDrawer job={offenerJob} onClose={schliessen} />
    </>
  );
}
