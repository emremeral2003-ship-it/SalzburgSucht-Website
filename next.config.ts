import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Der Projektstamm, ausdrücklich gesetzt.
   *
   * Next.js errät ihn sonst, indem es nach oben nach einer Sperrdatei sucht
   * (package-lock.json, yarn.lock, …). Auf diesem Rechner liegt eine
   * verirrte package-lock.json in ~/ — dadurch hielt Next.js das
   * Benutzerverzeichnis für den Projektstamm und meldete das bei jedem
   * Start:
   *
   *   Warning: Next.js ignored package-lock.json in /Users/emremeral
   *   because it is outside the current Git repository.
   *
   * Ein falsch geratener Stamm ist nicht nur eine Meldung: Er bestimmt, was
   * Turbopack überwacht und auflöst. Hier steht er deshalb fest — er hängt
   * dann nicht mehr davon ab, welche Dateien zufällig über dem Projekt
   * liegen, weder auf diesem Rechner noch beim Bauen auf Vercel.
   */
  turbopack: {
    root: path.join(__dirname),
  },

  /**
   * Dauerhafte Umleitungen fuer Adressen, die es einmal gab.
   *
   * Ein veroeffentlichter Beitrag wurde womoeglich schon geteilt oder von
   * Google erfasst. Wer seine Adresse aendert, ohne umzuleiten, macht aus
   * jedem dieser Links eine 404-Seite — und verschenkt dazu die Bewertung,
   * die die alte Adresse bei Suchmaschinen schon hatte.
   */
  async redirects() {
    return [
      {
        /* 12.10. veroeffentlicht als "ein Doener um einen Euro", am 14.10.
           zu "zwei Doener fuer zwei Euro" korrigiert. */
        source: "/blog/ein-euro-doener-novaluna",
        destination: "/blog/zwei-doener-zwei-euro-novaluna",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
