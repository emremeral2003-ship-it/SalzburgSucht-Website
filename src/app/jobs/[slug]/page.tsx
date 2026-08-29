import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyButton, JobViewTracker } from "@/components/jobs/job-detail-client";
import { ArrowRight, Check, Clock, Pin } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { FirmenLogo } from "@/components/jobs/firmen-logo";
import { datumLesbar } from "@/lib/format";
import { getJobBySlug, getJobSlugs } from "@/lib/db/jobs";
import { site, socialLinks } from "@/lib/site";

export async function generateStaticParams() {
  return (await getJobSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Stelle nicht gefunden" };

  return {
    title: `${job.title} bei ${job.company}`,
    description: job.shortDescription,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: `${job.title} · ${job.company}`,
      description: job.shortDescription,
      type: "article",
    },
  };
}

export default async function JobDetailPage({ params }: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  /**
   * Strukturierte Daten fuer Suchmaschinen.
   *
   * Nur fuer echte Inserate. Eine als JobPosting ausgezeichnete Beispielstelle
   * landet in der Google-Jobsuche und schickt Menschen auf eine Bewerbung, die
   * es nicht gibt — das waere kein SEO, sondern ein Schaden.
   */
  const strukturierteDaten = job.demo
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.publishedAt,
        employmentType: job.employmentType,
        hiringOrganization: { "@type": "Organization", name: job.company },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
            addressRegion: "Salzburg",
            addressCountry: "AT",
          },
        },
        url: `${site.url}/jobs/${job.slug}`,
      };

  return (
    <>
      {strukturierteDaten ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }}
        />
      ) : null}

      <JobViewTracker job={job} />

      <section className="buehne border-b border-line">
        <Container className="pt-8 pb-10 sm:pt-10 sm:pb-14">
          <nav aria-label="Brotkrumen" className="text-sm text-muted">
            <Link href="/jobs" className="hover:text-primary-dark hover:underline">
              Jobs
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink">{job.title}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <FirmenLogo
              job={job}
              className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-page text-lg font-bold text-primary-dark shadow-card"
            />

            <div className="min-w-0">
              {job.demo ? (
                <p className="mb-3 inline-flex rounded-full border border-line-strong bg-page px-3 py-1 text-[0.6875rem] font-bold tracking-[0.08em] text-muted uppercase">
                  Beispielinserat — diese Stelle existiert nicht
                </p>
              ) : null}

              <h1 className="text-[1.875rem] leading-[1.1] font-bold tracking-[-0.03em] text-balance sm:text-[2.5rem]">
                {job.title}
              </h1>
              <p className="mt-2 text-lg font-medium text-primary-dark">{job.company}</p>

              <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem] text-muted">
                <li className="inline-flex items-center gap-1.5">
                  <Pin className="size-4 text-primary-dark" />
                  {job.location}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-primary-dark" />
                  {job.employmentType}
                </li>
                <li className="num">{datumLesbar(job.publishedAt)} veröffentlicht</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_21rem] lg:gap-16">
          <div className="max-w-[68ch]">
            <p className="text-lg leading-relaxed text-ink">{job.description}</p>

            <Liste titel="Deine Aufgaben" punkte={job.responsibilities} />
            <Liste titel="Das bringst du mit" punkte={job.requirements} />
            <Liste titel="Benefits" punkte={job.benefits} />

            <section className="mt-12 rounded-card border border-line bg-soft p-6">
              <h2 className="text-lg font-bold text-ink">Das Unternehmen</h2>
              <p className="mt-2 leading-relaxed text-muted">
                {job.company} sucht über Salzburgsucht. Bei Fragen zur Stelle
                wendet euch direkt an den Betrieb — wir veröffentlichen das
                Inserat, führen aber das Bewerbungsverfahren nicht.
              </p>
            </section>
          </div>

          {/* Unterhalb von `lg` steht die Seitenleiste unter dem Text, nicht
              daneben. Ohne die Breitenbegrenzung waere sie dort so breit wie
              der Container (rund 780 px), waehrend der Fliesstext bei 68
              Zeichen (rund 620 px) endet — die rechten Kanten liefen sichtbar
              auseinander. Ab `lg` faellt die Grenze weg, dort bestimmt das
              Raster die Breite. */}
          <aside className="max-w-[68ch] lg:sticky lg:top-28 lg:max-w-none lg:self-start">
            <div className="rounded-card border border-line bg-page p-6 shadow-card">
              <h2 className="text-lg font-bold text-ink">Interesse?</h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                Bewirb dich direkt beim Betrieb. Kein Konto, kein Profil nötig.
              </p>

              <div className="mt-6 grid gap-2.5">
                <ApplyButton job={job} />
                <ButtonLink href="/jobs" variant="secondary" className="w-full">
                  Andere Stellen ansehen
                </ButtonLink>
              </div>

              <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-muted">
                Diese Stelle wird zusätzlich über unsere Instagram- und
                TikTok-Kanäle ausgespielt.
              </p>
            </div>

            <div className="mt-4 rounded-card border border-line bg-soft p-6">
              <h2 className="font-bold text-ink">Nichts dabei?</h2>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                Neue Stellen gehen zuerst über unsere Kanäle raus.
              </p>
              <div className="mt-4">
                <ButtonLink href={socialLinks.instagram} variant="ghost">
                  Auf Instagram folgen
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function Liste({ titel, punkte }: { titel: string; punkte: string[] }) {
  if (punkte.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-ink">{titel}</h2>
      <ul className="mt-4 space-y-2.5">
        {punkte.map((punkt) => (
          <li key={punkt} className="flex gap-3 leading-relaxed text-muted">
            <Check className="mt-1 size-4 shrink-0 text-primary-dark" />
            {punkt}
          </li>
        ))}
      </ul>
    </section>
  );
}
