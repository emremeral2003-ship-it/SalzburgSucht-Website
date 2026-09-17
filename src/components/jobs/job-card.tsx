"use client";

import Link from "next/link";

import { Clock, Pin } from "@/components/icons";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { FirmenLogo } from "@/components/jobs/firmen-logo";
import { bewerbungsZiel } from "@/components/jobs/job-detail-client";
import { Extern, Mail } from "@/components/icons";
import { datumLesbar } from "@/lib/format";
import type { Job } from "@/types";

/**
 * Job-Eintrag.
 *
 * Die ganze Karte ist anklickbar, der Titel traegt den Link. Dadurch bleibt
 * genau ein Tabstopp pro Stelle statt drei ineinandergeschachtelter Ziele.
 */
export function JobCard({ job, ort }: { job: Job; ort: string }) {
  const weg = bewerbungsZiel(job);

  return (
    <article className="group relative flex gap-4 rounded-card border border-line bg-page p-5 shadow-card transition-[border-color,box-shadow,transform] duration-300 ease-sanft hover:-translate-y-1 hover:border-primary/60 hover:shadow-card-hover sm:gap-5 sm:p-6">
      <FirmenLogo
        job={job}
        className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-soft text-sm font-bold text-primary-dark sm:size-14"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
          <h3 className="text-[1.0625rem] leading-snug font-bold text-ink sm:text-[1.125rem]">
            <Link
              href={`/jobs/${job.slug}`}
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.jobClick, {
                  job_id: job.id,
                  job_title: job.title,
                  company: job.company,
                  cta_location: ort,
                })
              }
              className="before:absolute before:inset-0 before:content-[''] group-hover:text-primary-dark"
            >
              {job.title}
            </Link>
          </h3>

          {job.demo ? (
            <span className="relative rounded-full border border-line-strong bg-soft px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.08em] text-muted uppercase">
              Beispiel
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[0.9375rem] font-medium text-primary-dark">{job.company}</p>

        <p className="mt-2.5 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted">
          {job.shortDescription}
        </p>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <li className="inline-flex items-center gap-1.5">
            <Pin className="size-4 shrink-0 text-primary-dark" />
            {job.location}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Clock className="size-4 shrink-0 text-primary-dark" />
            {job.employmentType}
          </li>
          <li className="num ml-auto text-muted">{datumLesbar(job.publishedAt)}</li>
        </ul>

        {/* Bewerben direkt aus der Liste.

            Der Knopf braucht `relative`, sonst liegt er unter der
            Flaeche, mit der der Titel die ganze Karte anklickbar macht
            (`before:inset-0`) — er waere sichtbar, aber nicht treffbar, und
            jeder Klick landete auf der Detailseite.

            `stopPropagation` ist nicht noetig, weil die Kartenflaeche ein
            Geschwister-Element ist und kein Elternteil des Knopfs. */}
        {weg ? (
          <div className="relative mt-4">
            <a
              href={weg.ziel}
              target={weg.extern ? "_blank" : undefined}
              rel={weg.extern ? "noreferrer noopener" : undefined}
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.jobApplyClick, {
                  job_id: job.id,
                  job_title: job.title,
                  company: job.company,
                  cta_location: ort,
                })
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-soft px-4 py-2 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-primary hover:text-primary-dark"
            >
              Jetzt bewerben
              {weg.extern ? <Extern className="size-4" /> : <Mail className="size-4" />}
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}
