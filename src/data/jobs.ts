import type { Job } from "@/types";

/**
 * ============================================================================
 * STELLENDATEN — echte Inserate oben, deaktivierte Demodaten darunter.
 * ============================================================================
 *
 * Die Eintraege mit `demo: false` sind echte Positionen (Stand 27.08.2026),
 * deren Texte noch Entwuerfe sind. Die Eintraege mit `demo: true` waren
 * Seed-Daten fuer Layout und Ablauf; sie stehen auf `active: false` und
 * erscheinen nirgends mehr — geloescht werden koennen sie, sobald die echten
 * Texte final sind.
 *
 * Bewusst KEINE echten Unternehmen mit erfundenen Stellen kombiniert — das
 * waere geschaeftsschaedigend fuer die genannten Betriebe.
 *
 * ZU ERSETZEN: Sobald echte Inserate vorliegen, kommen sie aus der Tabelle
 * `jobs` in Supabase. Die Repository-Schicht in src/lib/db/jobs.ts liest
 * bereits von dort und faellt nur auf diese Datei zurueck, solange keine
 * Datenbank konfiguriert ist.
 * ============================================================================
 */
export const demoJobs: Job[] = [
  /**
   * ==========================================================================
   * ECHTE STELLEN — TEXTE SIND ENTWÜRFE.
   * ==========================================================================
   * Beide Positionen existieren laut Emre (27.08.2026). Endgültiger
   * Ausschreibungstext und Logos kommen noch von ihm — bis dahin stehen hier
   * sorgfältige Entwürfe ohne erfundene Detailzusagen.
   *
   * VOR LIVEGANG ZU KLÄREN:
   *   - BranIT: Aufgaben stammen aus dem Beratungsteil von branit.at
   *     (Roadmaps, Audits, Workshops, Migrationen, Modern Workplace) — die
   *     konkrete Stelle ist daraus abgeleitet und von BranIT zu bestaetigen
   *   - Anstellungsart und Standort beider Stellen sind angenommen
   *   - Logos liegen unter public/images/jobs/ und sind eingetragen
   * ==========================================================================
   */
  {
    id: "icmedia-foto-video-1",
    slug: "foto-videograf-icmedia",
    company: "icmedia",
    title: "Foto- und Videograf (m/w/d)",
    location: "Salzburg",
    employmentType: "Vollzeit",
    shortDescription:
      "Reels, Shootings und Kampagnen für lokale Betriebe — von der Idee bis zum fertigen Schnitt.",
    description:
      "icmedia betreut Salzburger Betriebe auf Social Media — von der Bäckerei bis zur Bar. Du übernimmst Foto- und Videoproduktionen von Anfang bis Ende: Shootings vor Ort, Reels und TikToks drehen, schneiden und gemeinsam mit dem Team veröffentlichungsfertig machen. Du arbeitest direkt mit den Kunden und siehst jede Woche, wie dein Material performt.",
    responsibilities: [
      "Foto- und Video-Shootings bei Kunden vor Ort durchführen",
      "Reels und TikToks drehen und schneiden",
      "Bildbearbeitung und Farbkorrektur",
      "Content-Formate gemeinsam mit dem Team weiterentwickeln",
    ],
    requirements: [
      "Sicherer Umgang mit Kamera und Schnittsoftware",
      "Gespür für Social-Media-Formate (Reels, TikTok)",
      "Eigenständige, verlässliche Arbeitsweise",
      "Führerschein B von Vorteil — die Kunden sitzen in Stadt und Land Salzburg",
    ],
    benefits: [
      "Abwechslungsreiche Kunden statt immer derselben Marke",
      "Direkter Einfluss auf Formate und Bildsprache",
      "Flexible Zeiteinteilung",
    ],
    logo: "/images/jobs/icmedia.png",
    applicationType: "email",
    applicationUrl: null,
    applicationEmail: "office@salzburgsucht.at",
    publishedAt: "2026-08-27",
    active: true,
    featured: true,
    demo: false,
  },
  {
    /**
     * Fifty 4 Burgers (Emre, 17.09.2026). Logo aus der Kundenablage.
     *
     * OFFEN, weil vom Betrieb zu bestaetigen: Aufgaben, Stundenausmass,
     * Eintrittstermin und Entlohnung. Der Text bleibt deshalb bewusst
     * allgemein — lieber knapp als mit Zusagen, die der Betrieb nicht
     * gegeben hat. Der Ort stammt aus dem Partnereintrag (Linzer Gasse).
     */
    id: "fifty4-mitarbeiter-1",
    slug: "mitarbeiter-fifty4burgers",
    company: "Fifty 4 Burgers",
    title: "Mitarbeiter:in Service & Küche (m/w/d)",
    location: "Salzburg — Linzer Gasse",
    employmentType: "Voll- oder Teilzeit",
    shortDescription:
      "Voll- oder Teilzeit im Burgerlokal in der Linzer Gasse — Service, Theke und Küche im Team.",
    description:
      "Fifty 4 Burgers ist ein Burgerlokal mitten in Salzburg, in der Linzer Gasse. Gesucht werden Mitarbeiter:innen für Service und Küche — in Vollzeit oder Teilzeit, je nachdem, was zu dir passt. Du arbeitest im Team an der Theke, im Service und in der Zubereitung. Erfahrung in der Gastronomie ist willkommen, aber keine Bedingung: Eingeschult wird vor Ort.",
    responsibilities: [
      "Gäste an Theke und im Lokal betreuen",
      "Bestellungen aufnehmen und ausgeben",
      "In der Zubereitung mitarbeiten",
      "Sauberkeit und Ordnung im Arbeitsbereich",
    ],
    requirements: [
      "Verlässlichkeit und Freude am Umgang mit Gästen",
      "Bereitschaft zu Abend- und Wochenenddiensten",
      "Gute Deutschkenntnisse",
      "Gastronomieerfahrung von Vorteil, aber nicht Bedingung",
    ],
    benefits: [
      "Voll- oder Teilzeit — das Stundenausmaß wird gemeinsam festgelegt",
      "Einschulung im Betrieb",
      "Lokal mitten in der Stadt, gut erreichbar",
    ],
    logo: "/images/jobs/fifty4burgers.png",
    applicationType: "email",
    applicationUrl: null,
    applicationEmail: "office@salzburgsucht.at",
    publishedAt: "2026-09-17",
    active: true,
    featured: false,
    demo: false,
  },
  {
    id: "branit-it-consultant-1",
    slug: "it-consultant-branit",
    company: "BranIT",
    title: "IT-Consultant (m/w/d)",
    location: "Salzburg — Remote und vor Ort",
    employmentType: "Vollzeit",
    shortDescription:
      "Kunden beraten und ihre IT planbar machen: Audits, Roadmaps, Migrationen und Workshops.",
    description:
      "BranIT berät Unternehmen in ganz Österreich und macht ihre IT planbar — über Standards, Automatisierung und saubere Dokumentation statt gewachsener Einzellösungen. Du analysierst bestehende Umgebungen, entwickelst daraus Roadmaps und begleitest ihre Umsetzung: von der Migration in die Hybrid Cloud über den Modern Workplace mit Microsoft 365 bis zu Sicherheitsmaßnahmen. Du bist die Ansprechperson beim Kunden — remote und vor Ort.",
    responsibilities: [
      "Bestehende IT-Umgebungen analysieren und Audits durchführen",
      "Roadmaps und Maßnahmenpläne entwickeln und mit dem Kunden abstimmen",
      "Migrationen und Projekte fachlich begleiten (Hybrid Cloud, Microsoft 365)",
      "Workshops halten und Ergebnisse nachvollziehbar dokumentieren",
    ],
    requirements: [
      "Fundierte IT-Erfahrung, etwa aus Administration, Projektarbeit oder Beratung",
      "Kenntnisse in Microsoft 365, Azure, Netzwerk oder IT-Security",
      "Sicheres Auftreten und die Fähigkeit, Technik verständlich zu erklären",
      "Sehr gute Deutschkenntnisse und Führerschein B für Kundeneinsätze",
    ],
    benefits: [
      "Abwechslung durch viele verschiedene Kundenumgebungen",
      "Gestaltungsspielraum statt reiner Abarbeitung",
      "Remote-Anteil und flexible Einteilung",
      "Weiterbildung und Zertifizierungen",
    ],
    logo: "/images/jobs/branit.png",
    applicationType: "email",
    applicationUrl: null,
    applicationEmail: "office@salzburgsucht.at",
    publishedAt: "2026-08-28",
    active: true,
    featured: true,
    demo: false,
  },
  {
    id: "demo-1",
    slug: "demo-social-media-manager",
    company: "Demo Unternehmen Salzburg",
    title: "Social Media Manager (m/w/d)",
    location: "Salzburg Stadt",
    employmentType: "Vollzeit",
    shortDescription:
      "Content-Planung, Reels und Community-Betreuung für einen lokalen Betrieb.",
    description:
      "Du übernimmst die Social-Media-Kanäle eines Salzburger Betriebs und entwickelst sie eigenständig weiter. Von der Idee über den Dreh bis zur Auswertung liegt alles in deiner Hand — mit einem Team, das mitdenkt.",
    responsibilities: [
      "Redaktionsplan für Instagram und TikTok erstellen",
      "Reels und Stories eigenständig produzieren",
      "Community-Fragen beantworten",
      "Ergebnisse monatlich auswerten",
    ],
    requirements: [
      "Erfahrung mit Instagram und TikTok",
      "Sicheres Gefühl für Bild und Schnitt",
      "Eigenständige Arbeitsweise",
      "Sehr gute Deutschkenntnisse",
    ],
    benefits: ["Gleitzeit", "Homeoffice möglich", "Eigenes Equipment", "Weiterbildungsbudget"],
    logo: null,
    applicationType: "email",
    applicationUrl: null,
    applicationEmail: "demo@example.org",
    publishedAt: "2026-08-17",
    active: false,
    featured: false,
    demo: true,
  },
  {
    id: "demo-2",
    slug: "demo-servicekraft",
    company: "Demo Gastronomie Salzburg",
    title: "Servicekraft (m/w/d)",
    location: "Salzburg Altstadt",
    employmentType: "Teilzeit",
    shortDescription:
      "Service im Restaurantbetrieb, Frühdienst oder Abenddienst im Wechsel.",
    description:
      "Du sorgst dafür, dass sich Gäste wohlfühlen: Bestellungen aufnehmen, servieren, abkassieren und den Überblick behalten, wenn es voll wird. Ein eingespieltes Team, faire Dienstplanung, kein Teildienst.",
    responsibilities: [
      "Gäste begrüßen und beraten",
      "Bestellungen aufnehmen und servieren",
      "Kassa und Abrechnung",
      "Mise en place für den eigenen Bereich",
    ],
    requirements: [
      "Freude am Umgang mit Menschen",
      "Erste Erfahrung im Service von Vorteil",
      "Verlässlichkeit",
      "Gute Deutschkenntnisse",
    ],
    benefits: ["Trinkgeld", "Kein Teildienst", "Verpflegung", "Fixe Dienstplanung"],
    logo: null,
    applicationType: "email",
    applicationUrl: null,
    applicationEmail: "demo@example.org",
    publishedAt: "2026-08-15",
    active: false,
    featured: false,
    demo: true,
  },
  {
    id: "demo-3",
    slug: "demo-verkauf-beratung",
    company: "Demo Fachhandel Salzburg",
    title: "Verkauf & Beratung (m/w/d)",
    location: "Wals-Siezenheim",
    employmentType: "Geringfügig",
    shortDescription: "Kundenberatung im Verkaufsraum, Warenpflege und Kassa.",
    description:
      "Du berätst Kundinnen und Kunden im Verkaufsraum, hältst die Fläche in Ordnung und übernimmst die Kassa. Eingeschult wirst du in Ruhe — Vorkenntnisse sind willkommen, aber keine Bedingung.",
    responsibilities: [
      "Kundinnen und Kunden beraten",
      "Ware annehmen und einräumen",
      "Kassatätigkeit",
      "Verkaufsfläche pflegen",
    ],
    requirements: [
      "Freundliches Auftreten",
      "Zuverlässigkeit",
      "Bereitschaft für Samstagsdienste",
      "Gute Deutschkenntnisse",
    ],
    benefits: ["Mitarbeiterrabatt", "Fixe Wochentage", "Einschulung", "Gutes Team"],
    logo: null,
    applicationType: "email",
    applicationUrl: null,
    applicationEmail: "demo@example.org",
    publishedAt: "2026-08-12",
    active: false,
    featured: false,
    demo: true,
  },
];
