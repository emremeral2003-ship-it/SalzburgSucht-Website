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

import { blogPosts, getAlleBlogPosts, getBlogPosts, getBlogPost } from "@/data/blog";
import { partners } from "@/data/partners";
import { verstecke, verstecktePunkte } from "@/data/karte/verstecke";
import { demoJobs } from "@/data/jobs";
import { services } from "@/data/services";
import { contentKarten } from "@/data/discovery";
import { readFileSync } from "node:fs";
import { stats } from "@/lib/site";

let fehler = 0;
const ok = (b: boolean, t: string) => { console.log((b ? "\u2713" : "\u2717") + " " + t); if (!b) fehler++; };

const heute = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Vienna" }).format(new Date());
const erschienen = getBlogPosts();
const vorrat = blogPosts.filter((p) => p.publishedAt > heute);

console.log(`Stichtag ${heute}: ${erschienen.length} erschienen, ${vorrat.length} im Vorrat\n`);

/* --- Technik ------------------------------------------------------------ */
ok(new Set(blogPosts.map((p) => p.slug)).size === blogPosts.length, "keine doppelten Slugs");
for (const p of blogPosts) {
  ok(p.beschreibung.length <= 155, `Meta-Description \u2264155 (${p.slug}: ${p.beschreibung.length})`);
  ok(/^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt), `Datum als JJJJ-MM-TT (${p.slug})`);
  ok(p.abschnitte.length > 0 && p.abschnitte.every((a) => a.absaetze.length > 0), `Abschnitte gefuellt (${p.slug})`);
}
ok(getAlleBlogPosts().length === blogPosts.length, "getAlleBlogPosts zeigt auch den Vorrat");

/* --- Der Vorrat darf nirgends durchscheinen ----------------------------- */
for (const p of vorrat) {
  ok(getBlogPost(p.slug) === null, `Vorrat liefert 404 (${p.slug})`);
  ok(!erschienen.some((e) => e.slug === p.slug), `Vorrat nicht in der Uebersicht (${p.slug})`);
}
for (const p of erschienen) ok(getBlogPost(p.slug) !== null, `erschienen und erreichbar (${p.slug})`);
ok(
  erschienen.every((p, i) => i === 0 || erschienen[i - 1].publishedAt >= p.publishedAt),
  "neueste zuerst sortiert",
);

/* --- Behauptungen gegen die Daten --------------------------------------- */
const text = (slug: string) => {
  const p = blogPosts.find((x) => x.slug === slug)!;
  return [p.titel, p.auszug, ...p.abschnitte.flatMap((a) => [a.titel ?? "", ...a.absaetze])].join(" ");
};

const partnerText = text("partnernetz-salzburg");
const zaehl = (b: string) => partners.filter((p) => p.branche === b).length;
ok(partners.length === 39 && partnerText.includes("39 Betriebe") && partnerText.includes("39 Namen"), `39 Partner (ist: ${partners.length})`);
ok(zaehl("Gastro") === 16 && partnerText.includes("16 Betriebe"), `16 Gastro (ist: ${zaehl("Gastro")})`);
ok(partners.filter((p) => p.standort !== null).length === 20 && partnerText.includes("Zwanzig"), "20 verortet");
ok(zaehl("Freizeit") === 5 && zaehl("Mobility") === 5, "5 Freizeit / 5 Mobility");
ok(zaehl("Institution") === 4 && zaehl("Medien") === 3 && zaehl("Handel") === 2, "4 Institution / 3 Medien / 2 Handel");
for (const n of ["Fifty 4 Burgers", "Elixhausner Wirt", "AK Salzburg", "WIFI Salzburg"])
  ok(partners.some((p) => p.name === n), `Partner existiert: ${n}`);

const jobText = text("stellen-aus-salzburg");
const echte = demoJobs.filter((j) => !j.demo && j.active);
ok(echte.length === 3 && jobText.includes("drei Stellen"), `3 aktive echte Stellen (ist: ${echte.length})`);
ok(echte.every((j) => j.applicationEmail === "office@salzburgsucht.at"), "beide Bewerbungen an office@salzburgsucht.at");
ok(echte.every((j) => j.employmentType && j.location), "jede echte Stelle hat Anstellungsart und Ort");
ok(echte.some((j) => j.company === "icmedia") && echte.some((j) => j.company === "BranIT"), "icmedia und BranIT genannt");

const geldText = text("geld-verstecken-in-salzburg");
ok(verstecke.length === 37 && verstecktePunkte.length === 37, `37 Verstecke, alle verortet (${verstecktePunkte.length}/${verstecke.length})`);
ok(geldText.includes("37 Verstecke") && !geldText.includes("36"), "Beitrag nennt 37, nicht mehr 36");

/* --- Vorratsbeitraege --------------------------------------------------- */
const karteText = text("wie-die-salzburg-karte-funktioniert");
const stufe = (g: string) => verstecke.filter((v) => v.genauigkeit === g).length;
ok(stufe("punkt") === 17 && karteText.includes("siebzehn"), `17 punktgenau (ist: ${stufe("punkt")})`);
ok(stufe("strasse") === 7 && karteText.includes("Bei sieben kennen wir nur die Stra\u00dfe"), `7 strassengenau (ist: ${stufe("strasse")})`);
ok(stufe("viertel") === 8 && karteText.includes("Bei acht nur den Stadtteil"), `8 stadtteilgenau (ist: ${stufe("viertel")})`);
ok(stufe("ort") === 5 && karteText.includes("bei f\u00fcnf nur die Gemeinde"), `5 gemeindegenau (ist: ${stufe("ort")})`);
ok(verstecke.filter((v) => v.mehrfach).length === 3, "3 Orte mit mehr als einem Versteck");
ok(verstecke.some((v) => v.name === "Bergerbr\u00e4uhofstra\u00dfe") && karteText.includes("Bergerbr\u00e4uhofstra\u00dfe"), "Bergerbraeuhofstrasse stimmt mit den Daten ueberein");

const stadtText = text("salzburg-ist-groesser-als-die-getreidegasse");
const stadt = verstecke.filter((v) => v.gebiet === "stadt").length;
const umland = verstecke.filter((v) => v.gebiet === "umland").length;
ok(stadt === 30 && stadtText.includes("30 Verstecke in der Stadt"), `30 in der Stadt (ist: ${stadt})`);
ok(umland === 7 && stadtText.includes("Sieben Verstecke lagen au\u00dferhalb"), `7 im Umland (ist: ${umland})`);

const ablaufText = text("so-laeuft-eine-zusammenarbeit");
const dauerhaft = services.filter((s) => s.featured).length;
ok(dauerhaft === 3 && ablaufText.includes("Drei Dinge machen wir dauerhaft"), `3 Kernleistungen (ist: ${dauerhaft})`);
ok(services.length - dauerhaft === 4 && ablaufText.includes("vier Anlassf\u00e4lle"), `4 Anlassfaelle (ist: ${services.length - dauerhaft})`);
ok(!/\u20ac|\bab \d/.test(ablaufText), "keine Preisangabe im Text");

/* --- "Warum Salzburgsucht?" ------------------------------------------- */
const warumText = text("warum-salzburgsucht");
ok(warumText.includes(stats.instagramFollower.wert.replace("+", "")), `Followerzahl im Text = site.ts (${stats.instagramFollower.wert})`);
for (const n of ["Sahil Barbershop", "Fifty 4 Burgers", "Salz und Zucker B\u00e4ckerei"])
  ok(partners.some((p) => p.name === n), `Beispielbetrieb ist Partner: ${n}`);
ok(!/gegr\u00fcndet|seit 20\d\d/i.test(warumText), "kein erfundenes Gruendungsdatum");

/* --- Naya-Aktion -------------------------------------------------------- */
const nayaText = text("zwei-matcha-um-zwei-euro-bei-naya");
const nayaKarte = contentKarten.find((d) => d.id === "event-naya-matcha");
ok(!!nayaKarte && nayaKarte.text.includes("2. Oktober") && nayaText.includes("2. Oktober"),
   "Ankuendigungsbeitrag und Karte nennen denselben Termin");
/* Die Karte ist seit 03.10. ein Rueckblick. Sie darf die Aktion nicht mehr
   als bevorstehend ankuendigen - genau das war vorher der Fall. */
ok(!/^Am 2\. Oktober gibt es/.test(nayaKarte!.text), "Karte kuendigt die Aktion nicht mehr als kuenftig an");
const rueckblick = text("700-matcha-bei-naya");
ok(rueckblick.includes("700") && nayaKarte!.text.includes("700"), "Rueckblick und Karte nennen dieselbe Zahl");
ok(rueckblick.includes("2. Oktober"), "Rueckblick nennt das Datum der Aktion");
ok(partners.some((p) => p.name === "Naya"), "Naya ist als Partner eingetragen");
ok(!/Rainerstra\u00dfe|Hofstallgasse/.test(nayaText), "keine Adresse im Text, solange sie ungeklaert ist");
ok(!/\d{1,2}(:|\.)\d{2}\s*Uhr/.test(nayaText), "keine erfundene Uhrzeit");

/* --- "Was nicht auf die Seite kommt" ------------------------------------ */
const regelText = text("was-nicht-auf-die-seite-kommt");
ok(Object.keys(stats).length === 1 && regelText.includes("genau eine Reichweitenzahl"),
   `genau eine belegte Kennzahl (ist: ${Object.keys(stats).length})`);
ok(demoJobs.some((j) => j.demo) && demoJobs.filter((j) => j.demo).every((j) => !j.active),
   "Demo-Inserate existieren, sind aber abgeschaltet");
const sz = blogPosts.find((p) => p.slug === "salz-und-zucker-linzergasse")!;
ok(sz.abschnitte.flatMap((a) => a.absaetze).join(" ").includes("Eröffnungsdatum steht noch nicht fest"),
   "Salz & Zucker hat weiterhin kein Datum");

/* --- SEO-Beitraege vom Oktober ------------------------------------------ */
const werbung = text("werbung-in-salzburg-lokale-reichweite");
ok(werbung.includes(stats.instagramFollower.wert.replace("+", "")), `Werbebeitrag nennt ${stats.instagramFollower.wert}`);
ok(werbung.includes("37 Orte") && verstecke.length === 37, "Werbebeitrag: 37 Orte auf der Karte");
ok(werbung.includes("39 Betriebe") && partners.length === 39, "Werbebeitrag: 39 Partner");

const anzeige = text("stellenanzeige-salzburg-schalten");
for (const firma of ["icmedia", "BranIT", "Fifty 4 Burgers"])
  ok(anzeige.includes(firma) && echte.some((j) => j.company === firma), `Stellenbeitrag nennt echte Firma: ${firma}`);
ok(anzeige.includes("Voll- oder Teilzeit") && echte.some((j) => j.employmentType === "Voll- oder Teilzeit"),
   "Stellenbeitrag: Anstellungsart stimmt mit dem Inserat ueberein");

const wen = text("mr-wen-salzburg");
const wenKarte = contentKarten.find((d) => d.id === "gastro-mr-wen")!;
ok(wen.includes(wenKarte.code!) && wenKarte.code === "SALZBURG SUCHT", "Mr.-Wen-Beitrag: Code wie auf der Karte");
for (const ort of ["Maxglan", "Mirabell", "Kaigasse", "Himmelreich"])
  ok(wen.includes(ort) && wenKarte.text.includes(ort), `Mr.-Wen-Beitrag: Standort ${ort} steht auch auf der Karte`);
ok(wen.includes("Abholung im Laden") && wenKarte.text.includes("Abholung im Laden"), "Mr.-Wen-Beitrag: nur Abholung, wie auf der Karte");

const umlandText = text("salzburg-umland-flachgau-tennengau");
ok(umlandText.includes("sieben im Umland") && verstecke.filter((v) => v.gebiet === "umland").length === 7,
   "Umland-Beitrag: sieben Verstecke ausserhalb der Stadt");
for (const n of ["Elixhausner Wirt", "Jumpdome Salzburg", "Chef Döner Bergheim"])
  ok(partners.some((p) => p.name === n), `Umland-Beitrag: Partner existiert (${n})`);

/* --- Beitraege vom 02.10. ----------------------------------------------- */
const fifty = text("fifty-4-burgers-linzer-gasse");
const fiftyStelle = echte.find((j) => j.company === "Fifty 4 Burgers");
ok(!!fiftyStelle, "Fifty 4 Burgers hat ein aktives Inserat");
ok(fifty.includes("Voll- oder Teilzeit") && fiftyStelle?.employmentType === "Voll- oder Teilzeit",
   "Fifty-Beitrag: Anstellungsart wie im Inserat");
ok(fifty.includes("Linzer Gasse") && partners.some((p) => p.name === "Fifty 4 Burgers"),
   "Fifty-Beitrag: Betrieb ist Partner, Ort genannt");
ok(!/Pommes|Sauce|Men\u00fc|schmeckt|beste[rn]? Burger/i.test(fifty),
   "Fifty-Beitrag behauptet nichts ueber die Speisekarte");

const gewinn = text("gewinnspiele-mit-lokalen-betrieben");
ok(partners.some((p) => p.name === "Jumpdome Salzburg"), "JumpDome ist als Partner eingetragen");
ok(gewinn.includes("zehn Tickets"), "Gewinnspiel-Beitrag nennt die Zahl aus dem Beitragsbild");
ok(services.some((x) => x.slug === "gewinnspiele" && x.bild), "Leistung 'Gewinnspiele' hat das Beispielbild, auf das der Text verweist");

/* --- Der Datenschutz-Beitrag darf der Datenschutzerklaerung nicht widersprechen */
const dsq = readFileSync("src/app/datenschutz/page.tsx", "utf8");
ok(dsq.includes("Derzeit kein Analysedienst"), "Datenschutz sagt weiterhin: kein Analysedienst");
ok(dsq.includes("openfreemap.org"), "Datenschutz nennt weiterhin OpenFreeMap");
ok(dsq.includes("Supabase"), "Datenschutz nennt Supabase als vorbereitet");
const unt = readFileSync("src/app/unternehmen/page.tsx", "utf8");
ok(unt.includes("Preise stehen bewusst nicht auf der Seite"), "Unternehmensseite hat weiterhin keine Preisliste");

console.log(fehler === 0 ? "\nalles stimmt" : `\n${fehler} Abweichung(en)`);
process.exit(fehler === 0 ? 0 : 1);
