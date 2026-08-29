"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Check, Clock, Close, Pin } from "@/components/icons";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { ApplyButton } from "@/components/jobs/job-detail-client";
import { FirmenLogo } from "@/components/jobs/firmen-logo";
import { datumLesbar } from "@/lib/format";
import type { Job } from "@/types";

/**
 * Jobdetails als seitlich einfahrendes Fenster.
 *
 * Warum ein Drawer und keine eigene Seite: Jobs sind ein Nebenfeature. Wer
 * gerade dabei ist, die Agenturleistungen zu lesen, soll einen Job ansehen
 * koennen, ohne die Seite zu verlassen und danach den Weg zurueckzufinden.
 * Die Route /jobs/[slug] bleibt daneben bestehen — fuer geteilte Links und
 * fuer Suchmaschinen.
 *
 * Barrierefreiheit ist hier kein Beiwerk, sondern die halbe Arbeit: Der Fokus
 * wird eingefangen, Tab laeuft im Kreis, Escape schliesst, und danach landet
 * der Fokus wieder auf der Karte, von der aus geoeffnet wurde. Ohne das ist
 * ein Overlay fuer Tastaturnutzer eine Sackgasse.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS FENSTER AN <body> HAENGT
 * ---------------------------------------------------------------------------
 * Aufgerufen wird es aus dem Hero-Fenster, und dieser Abschnitt traegt
 * `isolate`. Damit ist er ein eigener Stapelkontext, und ein z-Index darin
 * gilt nur INNERHALB — gegen spaeter folgende Abschnitte der Seite verliert
 * er, egal wie hoch er ist. Genau das war zu sehen: Die Karten der Startseite
 * legten sich ueber das geoeffnete Fenster. `createPortal` haengt es an
 * <body> und damit aus jedem fremden Stapelkontext heraus.
 */
export function JobDrawer({
  job,
  onClose,
}: {
  job: Job | null;
  /** Bekommt den Grund, damit das Schliessen unterscheidbar gemessen wird. */
  onClose: (grund: "x" | "aussen" | "escape") => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const schliessenRef = useRef<HTMLButtonElement>(null);

  const beiTaste = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose("escape");
        return;
      }
      if (e.key !== "Tab") return;

      // Fokusfalle: Tab am Ende springt an den Anfang und umgekehrt.
      const ziele = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!ziele || ziele.length === 0) return;

      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];

      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!job) return;

    /* Die Sperre gehoert an <html>, nicht an <body>.
       In globals.css steht `html { overflow-x: hidden }` — damit ist <html>
       der Scrollcontainer der Seite. Eine Regel am <body> hat deshalb gar
       nichts bewirkt: Die Seite lief hinter dem geoeffneten Fenster einfach
       weiter. Beide zu setzen ist der sichere Weg, falls die Regel in
       globals.css einmal faellt. */
    const html = document.documentElement;
    const vorherHtml = html.style.overflow;
    const vorherBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", beiTaste);

    // Fokus in das Fenster holen, damit die naechste Tab-Taste dort landet
    // und nicht irgendwo hinter der Abdunklung.
    const timer = window.setTimeout(() => schliessenRef.current?.focus(), 60);

    trackEvent(ANALYTICS_EVENTS.jobDetailOpen, {
      job_id: job.id,
      job_title: job.title,
      company: job.company,
      cta_location: "hero_job_sidebar",
    });

    return () => {
      html.style.overflow = vorherHtml;
      document.body.style.overflow = vorherBody;
      document.removeEventListener("keydown", beiTaste);
      window.clearTimeout(timer);
    };
  }, [job, beiTaste]);

  /* Ohne geoeffnete Stelle gibt es nichts zu portalen — und weil `job` erst
     durch einen Klick gesetzt wird, ist an dieser Stelle immer schon der
     Browser am Werk. Ein zusaetzlicher Bereitschaftszustand waere eine
     Renderrunde ohne Gegenwert. */
  if (!job || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-60">
      <button
        type="button"
        aria-label="Jobdetails schließen"
        onClick={() => onClose("aussen")}
        className="schleier-auf absolute inset-0 h-full w-full cursor-default bg-dark-deep/55 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-drawer-titel"
        className="drawer-auf absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-[1.75rem] bg-page shadow-float sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[min(30rem,100%)] sm:rounded-t-none sm:rounded-l-[1.75rem]"
      >
        {/* Griff, der auf dem Smartphone zeigt: Das hier ist ein Blatt, das
            von unten kam — und wieder verschwinden kann. */}
        <div aria-hidden className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-line-strong/50" />
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-4 pb-5 sm:px-7 sm:pt-7">
          <div className="flex min-w-0 gap-4">
            <FirmenLogo
              job={job}
              className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-primary-soft text-sm font-bold text-primary-deep"
            />
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-semibold text-primary-dark">
                {job.company}
              </p>
              <h2
                id="job-drawer-titel"
                className="mt-0.5 text-[1.375rem] leading-tight font-bold tracking-[-0.02em] text-balance"
              >
                {job.title}
              </h2>
            </div>
          </div>

          <button
            ref={schliessenRef}
            type="button"
            onClick={() => onClose("x")}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-primary-dark hover:bg-primary-soft hover:text-primary-dark"
          >
            <Close className="size-5" />
            <span className="sr-only">Schließen</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Pin className="size-4 text-primary-dark" />
              {job.location}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-primary-dark" />
              {job.employmentType}
            </li>
            <li className="num">{datumLesbar(job.publishedAt)}</li>
          </ul>

          {job.demo ? (
            <p className="mt-4 rounded-xl border border-dashed border-line-strong bg-soft px-4 py-2.5 text-sm text-muted">
              Beispielinserat — diese Stelle existiert nicht.
            </p>
          ) : null}

          <p className="mt-5 leading-relaxed text-ink">{job.description}</p>

          <Liste titel="Deine Aufgaben" punkte={job.responsibilities} />
          <Liste titel="Das bringst du mit" punkte={job.requirements} />
          <Liste titel="Benefits" punkte={job.benefits} />
        </div>

        <div className="border-t border-line bg-soft px-5 py-4 sm:px-7 sm:py-5">
          {/* Derselbe Knopf wie auf der Detailseite. Hier stand einmal eine
              zweite Fassung — mit der Folge, dass der sichtbare Rueckfallweg
              (Adresse zum Kopieren) nur an einer der beiden Stellen
              angekommen waere. */}
          <ApplyButton job={job} ort="hero_job_sidebar" />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Liste({ titel, punkte }: { titel: string; punkte: string[] }) {
  if (punkte.length === 0) return null;

  return (
    <section className="mt-7">
      <h3 className="text-base font-bold text-ink">{titel}</h3>
      <ul className="mt-3 space-y-2">
        {punkte.map((punkt) => (
          <li
            key={punkt}
            className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-muted"
          >
            <Check className="mt-1 size-4 shrink-0 text-primary-dark" />
            {punkt}
          </li>
        ))}
      </ul>
    </section>
  );
}
