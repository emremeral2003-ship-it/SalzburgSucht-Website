import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { Container } from "@/components/ui/layout";
import { getBlogPosts } from "@/data/blog";
import { datumLesbar } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Neueröffnungen, Aktionen und Empfehlungen aus Salzburg — der Blog der Salzburgsucht-Community.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <section className="buehne border-b border-line">
        <Container className="pt-12 pb-12 sm:pt-16 sm:pb-14">
          <p className="eyebrow">Blog</p>
          <h1 className="display display-l mt-3 max-w-[20ch]">
            Was in Salzburg gerade passiert.
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
            Neueröffnungen, Aktionen und das, was hinter unseren Kanälen
            steckt — mit mehr Platz als in einer Caption.
          </p>
        </Container>
      </section>

      <Container className="abschnitt">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col rounded-card border border-line bg-page p-6 shadow-card transition-shadow duration-200 hover:border-primary hover:shadow-card-hover"
              >
                <p className="eyebrow">{post.kategorie}</p>
                <h2 className="mt-3 text-xl font-bold leading-snug text-ink">
                  {post.titel}
                </h2>
                <p className="mt-3 leading-relaxed text-muted">{post.auszug}</p>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <time className="text-[0.875rem] text-muted" dateTime={post.publishedAt}>
                    {datumLesbar(post.publishedAt)}
                  </time>
                  <span className="inline-flex items-center gap-2 font-semibold text-primary-dark">
                    Lesen
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
