import type { MetadataRoute } from "next";

import { getBlogPosts } from "@/data/blog";
import { getJobs } from "@/lib/db/jobs";
import { site } from "@/lib/site";

/**
 * Sitemap.
 *
 * Beispielinserate bleiben draussen: Eine Suchmaschine soll niemanden auf eine
 * Stelle schicken, die es nicht gibt.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seiten: Array<{ pfad: string; prioritaet: number }> = [
    { pfad: "", prioritaet: 1 },
    { pfad: "/community", prioritaet: 0.9 },
    { pfad: "/unternehmen", prioritaet: 0.9 },
    { pfad: "/kooperation", prioritaet: 0.8 },
    { pfad: "/jobs", prioritaet: 0.8 },
    { pfad: "/blog", prioritaet: 0.7 },
    /* Die Rechtstexte gehoeren in die Sitemap, seit sie vollstaendig sind —
       niedrige Prioritaet, aber auffindbar. */
    { pfad: "/impressum", prioritaet: 0.3 },
    { pfad: "/datenschutz", prioritaet: 0.3 },
    { pfad: "/agb", prioritaet: 0.3 },
    { pfad: "/partner", prioritaet: 0.5 },
    { pfad: "/ueber-uns", prioritaet: 0.5 },
  ];

  const jobs = (await getJobs()).filter((job) => !job.demo);

  return [
    ...seiten.map((seite) => ({
      url: `${site.url}${seite.pfad}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: seite.prioritaet,
    })),
    ...jobs.map((job) => ({
      url: `${site.url}/jobs/${job.slug}`,
      lastModified: new Date(job.publishedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...getBlogPosts().map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
