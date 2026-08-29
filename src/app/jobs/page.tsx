import type { Metadata } from "next";
import Link from "next/link";

import { JobCard } from "@/components/jobs/job-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { EmptyState } from "@/components/ui/feedback";
import { getJobs } from "@/lib/db/jobs";
import { socialLinks } from "@/lib/site";
import type { EmploymentType } from "@/types";

export const metadata: Metadata = {
  title: "Jobs in Salzburg",
  description:
    "Ausgewählte offene Stellen unserer Partnerbetriebe aus Stadt und Land Salzburg.",
  alternates: { canonical: "/jobs" },
};

const filter: Array<{ label: string; wert: EmploymentType | "alle" }> = [
  { label: "Alle", wert: "alle" },
  { label: "Vollzeit", wert: "Vollzeit" },
  { label: "Teilzeit", wert: "Teilzeit" },
  { label: "Geringfügig", wert: "Geringfügig" },
  { label: "Praktikum", wert: "Praktikum" },
];

/**
 * Jobliste.
 *
 * Bewusst kein Suchfeld und keine Filterleiste mit acht Kriterien: Bei einer
 * Handvoll ausgewaehlter Stellen ist eine Suche laestiger als hilfreich. Die
 * Filterung nach Anstellungsart laeuft ueber Links und damit ohne JavaScript —
 * jeder Stand ist verlinkbar und im Verlauf auffindbar.
 */
export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const { art } = await searchParams;
  const gewaehlt = typeof art === "string" ? art : "alle";

  const alle = await getJobs();
  const jobs = gewaehlt === "alle" ? alle : alle.filter((job) => job.employmentType === gewaehlt);

  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-12 pb-12 sm:pt-16 sm:pb-14">
          <p className="eyebrow">Jobs</p>
          <h1 className="display display-l mt-3 max-w-[16ch]">
            Jobs in Salzburg
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
            Ausgewählte Stellen unserer Partnerbetriebe. Jede davon läuft
            zusätzlich über unsere Kanäle — dort, wo unsere Community ohnehin ist.
          </p>
        </Container>
      </section>

      <Container className="abschnitt">
        <nav aria-label="Nach Anstellungsart filtern">
          <ul className="flex flex-wrap gap-2">
            {filter.map((eintrag) => {
              const aktiv = gewaehlt === eintrag.wert;
              return (
                <li key={eintrag.wert}>
                  <Link
                    href={eintrag.wert === "alle" ? "/jobs" : `/jobs?art=${eintrag.wert}`}
                    aria-current={aktiv ? "true" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] font-medium transition-colors duration-200 ${
                      aktiv
                        ? "border-primary-dark bg-primary-dark text-white"
                        : "border-line-strong bg-page text-ink hover:border-primary-dark hover:bg-primary-soft"
                    }`}
                  >
                    {eintrag.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="num mt-6 text-sm text-muted" aria-live="polite">
          {jobs.length === 1 ? "1 Stelle" : `${jobs.length} Stellen`}
        </p>

        <div className="mt-4 grid gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} ort="jobs_liste" />)
          ) : gewaehlt !== "alle" ? (
            <EmptyState
              titel={`Gerade keine Stelle in ${gewaehlt}`}
              text="Bei den anderen Anstellungsarten gibt es womöglich etwas Passendes."
            >
              <ButtonLink href="/jobs" variant="secondary">
                Alle Stellen ansehen
              </ButtonLink>
            </EmptyState>
          ) : (
            <EmptyState
              titel="Gerade keine offenen Stellen"
              text="Sobald ein Partnerbetrieb eine Stelle ausschreibt, steht sie hier — und geht gleichzeitig über unsere Kanäle raus."
            >
              <ButtonLink href={socialLinks.instagram}>Auf Instagram folgen</ButtonLink>
            </EmptyState>
          )}
        </div>
      </Container>

      <section className="border-t border-line bg-soft">
        <Container className="abschnitt">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="max-w-[24ch] text-[1.5rem] leading-tight font-bold tracking-[-0.02em] text-balance sm:text-[1.875rem]">
                Ihr sucht Mitarbeiter in Salzburg?
              </h2>
              <p className="mt-3 max-w-[54ch] leading-relaxed text-muted">
                Wir veröffentlichen eure Stelle hier und bewerben sie über
                unsere Kanäle — bei Menschen, die schon hier leben.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <ButtonLink href="/kooperation" size="lg">
                Stelle einreichen
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
