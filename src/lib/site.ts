/**
 * Zentrale Konfiguration der Website.
 *
 * Was hier NICHT steht, weil es noch niemand geliefert hat: Postanschrift,
 * Firmenbuchdaten, TikTok-Followerzahl. Diese Werte werden nicht erfunden.
 */

export const site = {
  name: "Salzburgsucht",
  claim: "Salzburg entdecken. Menschen erreichen. Unternehmen sichtbar machen.",
  description:
    "Lokale Empfehlungen, Events, Jobs und Unternehmen – direkt aus einer der größten Salzburg-Communities auf Social Media.",
  region: "Salzburg",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
} as const;

/**
 * Social-Media-Links.
 *
 * Kommen aus der Umgebung, damit sie ohne Codeaenderung korrigierbar sind.
 * Die Rueckfallwerte sind die oeffentlich bekannten Profile — falls ein
 * Handle abweicht, gehoert der richtige Wert in die .env, nicht hierher.
 */
export const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/salzburgsucht/",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@salzburgsucht",
} as const;

/**
 * Belegte Kennzahlen.
 *
 * Nur die vom Auftraggeber genannte Instagram-Reichweite ist gesichert.
 * Weitere Zahlen werden erst aufgenommen, wenn sie belegt sind — eine
 * erfundene Zahl auf einer Seite, die Unternehmen ueberzeugen soll, ist ein
 * Haftungsrisiko und kein Marketing.
 */
export const stats = {
  instagramFollower: {
    wert: "18.000+",
    label: "Follower auf Instagram",
    hinweis: "Stand August 2026",
  },
} as const;

/**
 * Hauptnavigation.
 *
 * Bewusst OHNE Menuepunkt "Jobs". Jobs sind ein Nebenfeature mit drei bis vier
 * Stellen; ein eigener Menuepunkt wuerde die Seite fuer jeden Besucher zum
 * Stellenportal erklaeren, bevor er ueberhaupt gescrollt hat.
 *
 * "Entdecken" zeigt auf den Ankerpunkt der Suchwand auf der Startseite statt
 * auf eine eigene Seite. Eine zusaetzliche Unterseite fuer Inhalte, die es
 * bereits gibt, waere genau die Ueberentwicklung, die dieses MVP vermeiden
 * soll.
 */
export const navigation = [
  { href: "/#entdecken", label: "Entdecken" },
  { href: "/community", label: "Community" },
  { href: "/unternehmen", label: "Für Unternehmen" },
  { href: "/partner", label: "Partner" },
  { href: "/blog", label: "Blog" },
  { href: "/ueber-uns", label: "Über uns" },
] as const;

/** Interessensgebiete der Community-Anmeldung. */
export const interests = [
  "Jobs",
  "Restaurants & Cafés",
  "Events",
  "Gewinnspiele",
  "Freizeit",
  "Lokale Angebote",
  "Salzburg News & Empfehlungen",
] as const;

/** Was ein Unternehmen bewerben kann. */
export const promotionTypes = [
  "Unternehmen",
  "Produkt",
  "Dienstleistung",
  "Restaurant / Location",
  "Event",
  "Neueröffnung",
  "Gewinnspiel",
  "Recruiting / Mitarbeiter",
  "Job-Inserat",
  "Sonstige Aktion",
] as const;

/** Was mit einer Kooperation erreicht werden soll. */
export const cooperationGoals = [
  "Reichweite",
  "Bekanntheit",
  "Besucher",
  "Verkäufe",
  "Bewerbungen",
  "Event-Promotion",
  "Social-Media-Wachstum",
  "Sonstiges",
] as const;

export const budgetRanges = [
  "unter 500 €",
  "500–1.000 €",
  "1.000–2.500 €",
  "2.500–5.000 €",
  "über 5.000 €",
  "noch offen",
] as const;
