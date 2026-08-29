import Image from "next/image";

import { initialen } from "@/lib/format";
import type { Job } from "@/types";

/**
 * Das Logo eines inserierenden Betriebs — oder seine Initialen.
 *
 * Es gab hier vier Kopien derselben Platzhalterflaeche (Karte, Schub,
 * Hero-Fenster, Detailseite). Jede haette einzeln umgebaut werden muessen,
 * als die ersten echten Logodateien kamen — und genau so entsteht der
 * Zustand, dass drei Stellen ein Logo zeigen und die vierte weiter Initialen.
 * Jetzt gibt es eine Stelle.
 *
 * `logo: null` bleibt der Normalfall: Fremde Logos werden nicht aus dem Netz
 * geladen, sondern erst nach Freigabe unter /public/images/jobs/ abgelegt.
 * Bis dahin stehen Initialen — eine leere graue Flaeche saehe aus wie ein
 * Ladefehler.
 */
export function FirmenLogo({
  job,
  className,
  bildKlasse = "size-full object-contain p-1.5",
}: {
  job: Job;
  /** Aeussere Flaeche — Groesse, Rundung, Rahmen kommen von der Aufrufstelle. */
  className: string;
  bildKlasse?: string;
}) {
  if (!job.logo) {
    return (
      <div aria-hidden className={className}>
        {initialen(job.company)}
      </div>
    );
  }

  return (
    <div aria-hidden className={className}>
      <Image
        src={job.logo}
        alt=""
        width={128}
        height={128}
        className={bildKlasse}
        sizes="128px"
      />
    </div>
  );
}
