import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";

import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { site } from "@/lib/site";

import "./globals.css";

/**
 * Eine Schriftfamilie, selbst ausgeliefert.
 *
 * `display: swap` sorgt dafuer, dass Text sofort lesbar ist, statt auf die
 * Schrift zu warten — bei Besuchern, die aus einer Instagram-Story kommen und
 * ueber Mobilfunk laden, ist das der Unterschied zwischen Lesen und Zurueck.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/**
 * Zweite Familie, ausschliesslich fuer Ueberschriften.
 *
 * Der Wechsel der Schriftfamilie zwischen Ueberschrift und Fliesstext ist das,
 * was eine Seite auf den ersten Blick gestaltet aussehen laesst. Bewusst nur
 * zwei Schnitte: Jeder weitere waere Ladezeit fuer etwas, das nirgends
 * vorkommt — und der Traffic kommt ueber Mobilfunk.
 */
const displayGrotesk = Space_Grotesk({
  variable: "--font-display-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Salzburgsucht – Entdecke Salzburg",
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: site.name,
    title: "Salzburgsucht – Entdecke Salzburg",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Salzburgsucht – Entdecke Salzburg",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de-AT"
      className={`${archivo.variable} ${displayGrotesk.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-page">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary-dark focus:px-4 focus:py-2 focus:text-white"
        >
          Zum Inhalt springen
        </a>

        {/* Der Einwilligungshinweis steht bewusst VOR der Kopfzeile im
            Markup, obwohl er unten am Bildrand erscheint — er ist `fixed`,
            die Reihenfolge im Dokument bestimmt also nur die Reihenfolge beim
            Durchtabben. Am Dokumentende (wo er vorher stand) erreichte man
            "Ablehnen" erst nach der gesamten Seite inklusive Fusszeile. Eine
            Entscheidung, die man treffen muss, bevor gemessen wird, darf
            nicht hinter allem liegen, was ohne sie stattfindet. */}
        <CookieConsent />

        <Header />

        <main id="inhalt" className="flex-1">
          {children}
        </main>

        <Footer />
        <AnalyticsProvider />

        {/* Das Tweaks-Panel ist ausgehaengt — Begruendung und Rueckweg
            stehen in src/components/tweaks/tweaks-mount.tsx. */}
      </body>
    </html>
  );
}
