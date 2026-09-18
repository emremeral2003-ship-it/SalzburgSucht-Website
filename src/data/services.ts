import type { Service } from "@/types";

/**
 * Was Unternehmen bei Salzburgsucht buchen koennen.
 *
 * Die Reihenfolge ist die Darstellung: Die drei Kernleistungen (`featured`)
 * stehen zuerst, die vier Anlassfaelle danach. Damit ist auf einen Blick
 * lesbar, was Salzburgsucht dauerhaft macht — und was man punktuell dazubucht.
 *
 * ----------------------------------------------------------------------------
 * Zu `vorschau`, `farbe` und `formate`
 * ----------------------------------------------------------------------------
 * Die Leistungsschau auf der Startseite zeigt zu jeder Leistung eine
 * Beitragsattrappe. Diese drei Felder steuern sie:
 *
 *   vorschau   Das Format, in dem diese Leistung ueblicherweise laeuft.
 *   farbe      Verlauf der Flaeche. Bewusst je Leistung anders, damit der
 *              Wechsel in der Vorschau sichtbar ist — es gibt keine Bilder,
 *              die den Unterschied tragen koennten.
 *   formate    Welche Formate typischerweise dazugehoeren. Das ist eine
 *              Aussage ueber die Produktion, keine ueber ein Ergebnis —
 *              deshalb steht sie hier und keine Reichweitenzahl.
 *
 * Sobald echte freigegebene Beitraege vorliegen, ersetzt ein Cover die
 * Verlaufsflaeche und `farbe` faellt weg.
 */
export const services: Service[] = [
  {
    slug: "social-media",
    title: "Social Media Promotion",
    description:
      "Posts, Reels und Story-Kampagnen auf unseren Kanälen — dort, wo Salzburg ohnehin täglich hinschaut.",
    icon: "megafon",
    featured: true,
    vorschau: "post",
    farbe: "linear-gradient(150deg, #3a94e8 0%, #0b4f8a 100%)",
    formate: ["Feed-Post", "Story"],
    video: "/videos/leistungen/social-media",
    bild: null,
  },
  {
    slug: "reels",
    title: "Reels & Video",
    description:
      "Wir drehen, schneiden und veröffentlichen. Content, der aussieht wie unser Feed, nicht wie Werbung.",
    icon: "film",
    featured: true,
    vorschau: "reel",
    farbe: "linear-gradient(150deg, #80bdff 0%, #2279c9 55%, #082f52 100%)",
    formate: ["Reel"],
    video: "/videos/leistungen/reels",
    bild: null,
  },
  {
    slug: "individuell",
    title: "Individuelle Kampagnen",
    description:
      "Keine Standardpakete. Ihr sagt uns das Ziel, wir entwickeln den Weg dorthin und setzen ihn um.",
    icon: "funke",
    featured: true,
    vorschau: "reel",
    farbe: "linear-gradient(150deg, #1e71bf 0%, #082f52 55%, #041a30 100%)",
    formate: ["Reel", "Feed-Post", "Story"],
    video: "/videos/leistungen/individuell",
    bild: null,
  },
  {
    slug: "events",
    title: "Events",
    description:
      "Ankündigen, Vorfreude aufbauen und am Tag selbst noch einmal Reichweite erzeugen.",
    icon: "kalender",
    featured: false,
    vorschau: "story",
    farbe: "linear-gradient(150deg, #2279c9 0%, #082f52 100%)",
    formate: ["Story", "Reel"],
    video: "/videos/leistungen/events",
    bild: null,
  },
  {
    slug: "gastronomie",
    title: "Gastronomie & Locations",
    description:
      "Restaurants, Cafés, Bars und Geschäfte so zeigen, dass Leute hingehen wollen.",
    icon: "besteck",
    featured: false,
    vorschau: "reel",
    farbe: "linear-gradient(150deg, #80bdff 0%, #1e71bf 100%)",
    formate: ["Reel", "Feed-Post"],
    video: "/videos/leistungen/gastronomie",
    bild: null,
  },
  {
    slug: "recruiting",
    title: "Recruiting",
    description: "Offene Stellen bewerben — bei Menschen, die schon in Salzburg leben.",
    icon: "personen",
    featured: false,
    vorschau: "post",
    farbe: "linear-gradient(150deg, #0b4f8a 0%, #3a94e8 100%)",
    formate: ["Feed-Post", "Story"],
    video: null,
    bild: null,
  },
  {
    slug: "gewinnspiele",
    title: "Gewinnspiele",
    description: "Aktionen, die die Community bewegen: Kommentare, Shares und neue Follower.",
    icon: "geschenk",
    featured: false,
    vorschau: "post",
    farbe: "linear-gradient(150deg, #3a94e8 0%, #80bdff 45%, #0b4f8a 100%)",
    formate: ["Feed-Post", "Story"],
    video: null,
    bild: "/images/leistungen/gewinnspiele.jpg",
  },
];

/** Themen, die die Community auf Salzburgsucht findet. */
export const themen = [
  { title: "Restaurants & Cafés", text: "Wo es gerade gut ist — vom Frühstück bis spät." },
  { title: "Events", text: "Konzerte, Märkte, Feste und alles dazwischen." },
  { title: "Gewinnspiele", text: "Regelmäßige Aktionen mit lokalen Betrieben." },
  { title: "Lokale Angebote", text: "Aktionen von Betrieben aus Stadt und Land Salzburg." },
  { title: "Freizeit", text: "Ausflüge, Baden, Berge, Schlechtwetter-Pläne." },
  { title: "Jobs", text: "Ausgewählte offene Stellen unserer Partnerbetriebe." },
];
