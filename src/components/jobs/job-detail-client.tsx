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
 * BEWUSST NUR `mailto:` (Entscheidung von Emre, 28.08.2026)
 * ---------------------------------------------------------------------------
 * Hier standen zwischenzeitlich zusaetzliche Wege — Adresse kopieren, in
 * Gmail schreiben, in Outlook schreiben. Sie sind auf Wunsch wieder raus.
 *
 * Was das heisst, damit es niemanden spaeter ueberrascht: Ein `mailto:`-Link
 * oeffnet nur dann etwas, wenn auf dem Geraet ein Standard-Mailprogramm
 * eingetragen ist. Ist keines eingetragen — etwa bei jemandem, der seine Post
 * ausschliesslich im Browser liest — passiert beim Klick NICHTS. Keine
 * Fehlermeldung, kein Fenster. Ob das eingetreten ist, laesst sich im Browser
 * nicht abfragen, also laesst es sich auch nicht auffangen.
 *
 * Auf Telefonen ist praktisch immer ein Mailprogramm eingerichtet; dort
 * funktioniert der Knopf. Betroffen sind vor allem Schreibtischrechner ohne
 * eingerichtetes Mailprogramm.
 */
export function ApplyButton({
  job,
  ort = "job_detail",
}: {
  job: Job;
  /** Wo der Knopf steht — geht in die Messung. */
  ort?: string;
}) {
  const externesZiel =
    job.applicationType === "url" && job.applicationUrl
      ? job.applicationUrl
      : null;
  const mailZiel = job.applicationEmail
    ? `mailto:${job.applicationEmail}?subject=${encodeURIComponent(`Bewerbung: ${job.title}`)}`
    : null;
  const ziel = externesZiel ?? mailZiel;

  if (!ziel) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-soft px-4 py-3 text-sm leading-relaxed text-muted">
        Für diese Stelle ist noch kein Bewerbungsweg hinterlegt. Schreib uns
        über Instagram, wir stellen den Kontakt her.
      </p>
    );
  }

  return (
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
  );
}
