import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight } from "@/components/icons";
import { Container } from "@/components/ui/layout";
import { getBlogPost, getBlogPosts } from "@/data/blog";
import { datumLesbar } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * Stuendlich neu bauen.
 *
 * Ohne das waere der Beitragsvorrat wirkungslos: Die Seite wird beim Bauen
 * einmal erzeugt, und ein Beitrag, dessen Datum erst danach erreicht wird,
 * erschiene nie — bis jemand zufaellig deployt. Mit `revalidate` prueft die
 * Seite hoechstens eine Stunde spaeter noch einmal, welcher Tag ist.
 *
 * Eine Stunde ist reichlich fuer einen Blog, der nicht taeglich erscheint,
 * und billig: Es ist eine Neuberechnung pro Stunde, nur wenn jemand da ist.
 */
export const revalidate = 3600;

/**
 * Vorgebaut werden nur die erschienenen Beitraege.
 *
 * Ein Beitrag aus dem Vorrat taucht hier absichtlich nicht auf. Wird er
 * faellig, erzeugt Next ihn bei der ersten Anfrage (`dynamicParams` ist
 * standardmaessig an) und legt ihn danach in den Zwischenspeicher.
 */
export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Beitrag nicht gefunden" };

  return {
    title: post.titel,
    description: post.beschreibung,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.titel,
      description: post.beschreibung,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  /** Strukturierte Daten, analog zur Stellen-Detailseite. */
  const strukturierteDaten = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titel,
    description: post.beschreibung,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  const weitere = getBlogPosts().filter((p) => p.slug !== post.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }}
      />

      <section className="buehne border-b border-line">
        <Container className="max-w-[46rem] pt-12 pb-12 sm:pt-16 sm:pb-14">
          <p className="eyebrow">{post.kategorie}</p>
          <h1 className="display display-m mt-3">{post.titel}</h1>
          <time className="mt-5 block text-[0.9375rem] text-muted" dateTime={post.publishedAt}>
            {datumLesbar(post.publishedAt)}
          </time>
        </Container>
      </section>

      <Container className="abschnitt max-w-[46rem]">
        <div className="space-y-10">
          {post.abschnitte.map((abschnitt, index) => (
            <section key={index}>
              {abschnitt.titel ? (
                <h2 className="text-xl font-bold text-ink">{abschnitt.titel}</h2>
              ) : null}
              <div className={abschnitt.titel ? "mt-4 space-y-4" : "space-y-4"}>
                {abschnitt.absaetze.map((absatz, i) => (
                  <p
                    key={i}
                    className={
                      index === 0
                        ? "text-lg leading-relaxed text-muted"
                        : "leading-relaxed text-muted"
                    }
                  >
                    {absatz}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {weitere.length > 0 ? (
          <div className="mt-16 border-t border-line pt-10">
            <p className="eyebrow">Weiterlesen</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {weitere.slice(0, 2).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex h-full flex-col rounded-card border border-line bg-page p-5 shadow-card transition-shadow duration-200 hover:border-primary hover:shadow-card-hover"
                  >
                    <p className="eyebrow">{p.kategorie}</p>
                    <p className="mt-2 font-bold leading-snug text-ink">{p.titel}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 font-semibold text-primary-dark">
                      Lesen
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </>
  );
}
