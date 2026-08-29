import "server-only";

import { demoJobs } from "@/data/jobs";
import { datenbankKonfiguriert } from "@/lib/env";
import { anonClient } from "@/lib/supabase";
import type { Job } from "@/types";

/**
 * Repository fuer Stellenanzeigen.
 *
 * Die Seiten kennen ausschliesslich diese Funktionen — kein Supabase-Aufruf
 * steht in einer Komponente. Dadurch ist der Wechsel von Seed-Daten auf die
 * Datenbank (und spaeter auf ein CMS) eine Aenderung an dieser einen Datei.
 *
 * Solange keine Datenbank hinterlegt ist, kommen die als Beispiel markierten
 * Seed-Daten zurueck. Das haelt die Seite in der Entwicklung vollstaendig
 * benutzbar, ohne irgendwo echte Inserate vorzutaeuschen.
 */

type JobZeile = {
  id: string;
  slug: string;
  company: string;
  title: string;
  location: string;
  employment_type: string;
  short_description: string;
  description: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  benefits: string[] | null;
  logo: string | null;
  application_type: string;
  application_url: string | null;
  application_email: string | null;
  published_at: string;
  active: boolean;
  featured: boolean;
};

function ausZeile(zeile: JobZeile): Job {
  return {
    id: zeile.id,
    slug: zeile.slug,
    company: zeile.company,
    title: zeile.title,
    location: zeile.location,
    employmentType: zeile.employment_type as Job["employmentType"],
    shortDescription: zeile.short_description,
    description: zeile.description,
    responsibilities: zeile.responsibilities ?? [],
    requirements: zeile.requirements ?? [],
    benefits: zeile.benefits ?? [],
    logo: zeile.logo,
    applicationType: zeile.application_type as Job["applicationType"],
    applicationUrl: zeile.application_url,
    applicationEmail: zeile.application_email,
    publishedAt: zeile.published_at,
    active: zeile.active,
    featured: zeile.featured,
    demo: false,
  };
}

async function ausDatenbank(): Promise<Job[] | null> {
  if (!datenbankKonfiguriert()) return null;
  try {
    const { data, error } = await anonClient()
      .from("jobs")
      .select("*")
      .eq("active", true)
      .order("published_at", { ascending: false });

    if (error) throw error;
    return (data as JobZeile[]).map(ausZeile);
  } catch (fehler) {
    // Ein Datenbankausfall darf die Seite nicht weiss lassen. Er wird
    // protokolliert, und die Seite zeigt so lange die Seed-Daten.
    console.error("[jobs] Abfrage fehlgeschlagen, nutze Seed-Daten:", fehler);
    return null;
  }
}

export async function getJobs(): Promise<Job[]> {
  const ausDb = await ausDatenbank();
  return (ausDb ?? demoJobs).filter((job) => job.active);
}

/** Die Auswahl fuer die Startseite — hoechstens drei. */
export async function getFeaturedJobs(anzahl = 3): Promise<Job[]> {
  const alle = await getJobs();
  const bevorzugt = alle.filter((job) => job.featured);
  return [...bevorzugt, ...alle.filter((job) => !job.featured)].slice(0, anzahl);
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const alle = await getJobs();
  return alle.find((job) => job.slug === slug) ?? null;
}

export async function getJobSlugs(): Promise<string[]> {
  return (await getJobs()).map((job) => job.slug);
}
