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
};

export default nextConfig;
