/**
 * Prueft die Blogbeitraege — vor allem ihre ZAHLEN.
 *
 * Aufruf: npx tsx --tsconfig tsconfig.json scripts/pruefe-blog.mts
 *
 * Der Grund fuer diese Datei steht im Kopf von src/data/blog.ts: keine
 * erfundenen Fakten. Ein Beitrag, der "39 Betriebe" schreibt, ist in dem
 * Moment falsch, in dem ein Partner dazukommt — und niemand merkt es, weil
 * der Satz weiterhin plausibel klingt. Dasselbe gilt fuer "16 davon sind
 * Gastro", "zwanzig auf der Karte" und "zwei Stellen".
 *
 * Genau das ist hier schon passiert: Der Beitrag ueber die Geldverstecke
 * sagte "36 Verstecke", nachdem Versteck 19 verortet wurde und es 37 waren.
 *
 * Deshalb liest dieses Skript die Zahlen aus den Datendateien und vergleicht
 * sie mit dem, was in den Beitraegen steht. Wer eine Zahl in einem Beitrag
 * aendert, aendert die Behauptung hier mit.
 */

import { blogPosts, getBlogPosts, getBlogPost } from "@/data/blog";
import { partners } from "@/data/partners";
import { verstecke, verstecktePunkte } from "@/data/karte/verstecke";
import { demoJobs } from "@/data/jobs";

let fehler = 0;
const ok = (b: boolean, t: string) => { console.log((b ? "✓" : "✗") + " " + t); if (!b) fehler++; };

// Blogtechnik
ok(new Set(blogPosts.map(p => p.slug)).size === blogPosts.length, "keine doppelten Slugs");
for (const p of blogPosts) {
  ok(p.beschreibung.length <= 155, `Meta-Description ≤155 (${p.slug}: ${p.beschreibung.length})`);
  ok(p.abschnitte.length > 0 && p.abschnitte.every(a => a.absaetze.length > 0), `Abschnitte gefüllt (${p.slug})`);
  ok(getBlogPost(p.slug) !== null, `auffindbar (${p.slug})`);
}
ok(getBlogPosts()[0].publishedAt >= getBlogPosts()[1].publishedAt, "neueste zuerst sortiert");

// Behauptungen der neuen Beiträge gegen die Daten
const text = (slug: string) =>
  blogPosts.find(p => p.slug === slug)!.abschnitte.flatMap(a => a.absaetze).join(" ")
  + " " + blogPosts.find(p => p.slug === slug)!.auszug
  + " " + blogPosts.find(p => p.slug === slug)!.titel;

const partnerText = text("partnernetz-salzburg");
ok(partners.length === 39 && partnerText.includes("39 Betriebe") && partnerText.includes("39 Namen"), `39 Partner (ist: ${partners.length})`);
const gastro = partners.filter(p => p.branche === "Gastro").length;
ok(gastro === 16 && partnerText.includes("16 Betriebe"), `16 Gastro (ist: ${gastro})`);
const verortet = partners.filter(p => p.standort !== null).length;
ok(verortet === 20 && partnerText.includes("Zwanzig"), `20 verortet (ist: ${verortet})`);
const zaehl = (b: string) => partners.filter(p => p.branche === b).length;
ok(zaehl("Freizeit") === 5 && zaehl("Mobility") === 5, `5 Freizeit / 5 Mobility (ist: ${zaehl("Freizeit")}/${zaehl("Mobility")})`);
ok(zaehl("Institution") === 4 && zaehl("Medien") === 3 && zaehl("Handel") === 2, "4 Institution / 3 Medien / 2 Handel");
for (const n of ["Fifty 4 Burgers", "Elixhausner Wirt", "AK Salzburg", "WIFI Salzburg"])
  ok(partners.some(p => p.name === n), `Partner existiert: ${n}`);

const jobText = text("stellen-aus-salzburg");
const echte = demoJobs.filter(j => !j.demo && j.active);
ok(echte.length === 2 && jobText.includes("zwei Stellen"), `2 aktive echte Stellen (ist: ${echte.length})`);
ok(echte.every(j => j.applicationEmail === "office@salzburgsucht.at"), "beide Bewerbungen an office@salzburgsucht.at");
ok(echte.every(j => j.employmentType === "Vollzeit"), "beide Vollzeit");
ok(echte.some(j => j.company === "icmedia") && echte.some(j => j.company === "BranIT"), "icmedia und BranIT");

// Verstecke-Zahl im alten Beitrag
const geld = text("geld-verstecken-in-salzburg");
ok(verstecke.length === 37 && verstecktePunkte.length === 37, `37 Verstecke, alle verortet (${verstecktePunkte.length}/${verstecke.length})`);
ok(geld.includes("37 Verstecke") && !geld.includes("36"), "Beitrag nennt 37, nicht mehr 36");

console.log(fehler === 0 ? "\nalles stimmt" : `\n${fehler} Abweichung(en)`);
process.exit(fehler === 0 ? 0 : 1);
