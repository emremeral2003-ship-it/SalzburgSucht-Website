"use client";

import { useEffect, useRef } from "react";

import { Extern, Mail } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { Job } from "@/types";

/**
 * Meldet den Aufruf einer Jobdetailseite.
 *
 * Eigene Komponente, weil die Seite selbst auf dem Server gerendert wird und
 * dort kein Ereignis ausgeloest werden kann. Der Ref verhindert eine zweite
 * Meldung, wenn React die Komponente in der Entwicklung doppelt einhaengt.
 */
export function JobViewTracker({ job }: { job: Job }) {
  const gemeldet = useRef(false);

  useEffect(() => {
    if (gemeldet.current) return;
    gemeldet.current = true;
    trackEvent(ANALYTICS_EVENTS.jobView, {
      job_id: job.id,
      job_title: job.title,
      company: job.company,
    });
  }, [job.id, job.title, job.company]);

  return null;
}

/**
 * Bewerbungsknopf.
 *
 * Der Bewerbungsweg haengt am Inserat: externe Adresse oder E-Mail. Fehlt
 * beides, wird kein toter Knopf angezeigt, sondern ein ehrlicher Hinweis —
 * ein Button, der nirgendwohin fuehrt, kostet Vertrauen.
 *
 * ---------------------------------------------------------------------------
 * `mailto:` MIT SICHTBARER ADRESSE DARUNTER
 * ---------------------------------------------------------------------------
 * Der Knopf bleibt ein `mailto:`-Link (Entscheidung von Emre, 28.08.2026);
 * die zusaetzlichen Knoepfe von damals — kopieren, Gmail, Outlook — sind
 * weiterhin draussen.
 *
 * Das Problem daran ist real und war der Grund fuer "Jetzt bewerben geht
 * nicht": Ein `mailto:`-Link oeffnet nur dann etwas, wenn auf dem Geraet ein
 * Standard-Mailprogramm eingetragen ist. Ist keines eingetragen — etwa bei
 * jemandem, der seine Post ausschliesslich im Browser liest — passiert beim
 * Klick NICHTS. Keine Fehlermeldung, kein Fenster. Ob das eingetreten ist,
 * laesst sich im Browser nicht abfragen, also auch nicht auffangen.
 *
 * Deshalb steht die Adresse jetzt als Text unter dem Knopf. Das ist keine
 * zweite Schaltflaeche, sondern eine Zeile: Wer den Knopf drueckt und nichts
 * passiert, sieht sofort, wohin die Bewerbung gehen soll, und kann die
 * Adresse markieren. Ohne sie ist die Sackgasse still — und eine stille
 * Sackgasse auf einer Bewerbungsseite kostet genau die Bewerbung.
 */
/**
 * Wohin "Jetzt bewerben" fuehrt — eine externe Bewerbungsseite oder ein
 * vorbereiteter Mailentwurf.
 *
 * Steht hier und nicht in der Komponente, weil derselbe Weg an zwei Stellen
 * gebraucht wird: auf der Detailseite und auf den Karten in der Stellenliste.
 * Zwei Kopien derselben Adressbildung waeren genau die Art Doppelung, bei der
 * spaeter eine Seite den Betreff aendert und die andere nicht.
 */
export function bewerbungsZiel(job: Job): { ziel: string; extern: boolean } | null {
  if (job.applicationType === "url" && job.applicationUrl) {
    return { ziel: job.applicationUrl, extern: true };
  }
  if (job.applicationEmail) {
    const betreff = encodeURIComponent(`Bewerbung: ${job.title}`);
    return { ziel: `mailto:${job.applicationEmail}?subject=${betreff}`, extern: false };
  }
  return null;
}

export function ApplyButton({
  job,
  ort = "job_detail",
}: {
  job: Job;
  /** Wo der Knopf steht — geht in die Messung. */
  ort?: string;
}) {
  const weg = bewerbungsZiel(job);
  const ziel = weg?.ziel ?? null;
  const externesZiel = weg?.extern ? weg.ziel : null;

  if (!ziel) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-soft px-4 py-3 text-sm leading-relaxed text-muted">
        Für diese Stelle ist noch kein Bewerbungsweg hinterlegt. Schreib uns
        über Instagram, wir stellen den Kontakt her.
      </p>
    );
  }

  return (
    <>
      <ButtonLink
        href={ziel}
        size="lg"
        className="gruppe-cta w-full"
        event={ANALYTICS_EVENTS.jobApplyClick}
        eventProps={{
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          cta_location: ort,
        }}
      >
        Jetzt bewerben
        {externesZiel ? (
          <Extern className="cta-pfeil size-4" />
        ) : (
          <Mail className="cta-pfeil size-4" />
        )}
      </ButtonLink>

      {!externesZiel && job.applicationEmail ? (
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">
          Öffnet sich kein Mailprogramm? Schreib direkt an{" "}
          <span className="font-semibold break-all text-ink select-all">
            {job.applicationEmail}
          </span>
        </p>
      ) : null}
    </>
  );
}
