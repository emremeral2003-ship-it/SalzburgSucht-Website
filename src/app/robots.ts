import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* Die Rechtstexte waren gesperrt, solange sie Platzhalter enthielten —
         eine unfertige Offenlegung im Suchindex ist schlechter als keine.
         Seit 28.08.2026 sind Impressum, Datenschutz und AGB vollstaendig und
         freigegeben, damit faellt der Grund weg. Auffindbar sollen sie
         ohnehin sein: Ein Impressum, das niemand findet, erfuellt seinen
         Zweck nicht. */
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
