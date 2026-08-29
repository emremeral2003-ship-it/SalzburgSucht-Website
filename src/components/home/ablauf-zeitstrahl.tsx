"use client";

import { useEffect, useRef } from "react";

/**
 * Kooperation in vier Schritten — als Zeitstrahl, der sich beim Scrollen füllt.
 *
 * Vorher waren das vier gleich grosse Karten nebeneinander. Vier Karten sind
 * das Standardbild fuer "Prozess" und sagen genau deshalb nichts: Man sieht
 * vier Kaesten, nicht eine Abfolge. Ein Strahl, der von links nach rechts
 * anlaeuft, sagt in einer Bewegung, was der Abschnitt behauptet — es geht
 * geradeaus und es sind vier Stationen, nicht vierzig.
 *
 * Vier Dinge waren bei der Umsetzung wichtiger als der Effekt:
 *
 *   1. **Kein React-Zustand.** Der Fuellstand ist eine Synchronisation
 *      zwischen Scrollposition und DOM, kein Zustand der Anwendung. Er wird
 *      deshalb als Attribut und CSS-Variable direkt gesetzt. Das erspart vier
 *      Neuzeichnungen des Teilbaums und ist genau der Fall, fuer den es
 *      Effekte gibt.
 *   2. **Der Fuellstand haengt nicht am Scrollereignis.** Jeder Schritt hat
 *      einen Beobachter, der genau einmal meldet. Die Linie kennt vier
 *      Zustaende, nicht tausend — es gibt also keinen Zeichenschritt pro
 *      gescrolltem Pixel, und auf einem alten Telefon ruckelt nichts.
 *   3. **Ohne JavaScript steht alles da.** Ohne Skript fehlt das Attribut
 *      `data-aktiv` vollstaendig; das Stylesheet zeigt dann alle Schritte
 *      normal und alle Strecken gefuellt. Ein Ablauf, der ohne Skript aus
 *      vier blassen Ueberschriften an einer leeren Linie besteht, waere
 *      schlechter als gar keine Animation. Aus demselben Grund werden
 *      Schritte, die beim Laden schon im Bild stehen, gar nicht erst
 *      zurueckgenommen — sonst blitzten sie einmal auf und wieder weg.
 *   4. **Die Achse wechselt, das Markup nicht.** Auf dem Telefon laeuft der
 *      Strahl senkrecht, ab Desktop waagrecht. Beides aus derselben Struktur,
 *      der Rest steht im Stylesheet (`.strahl-strecke`).
 */

const schritte = [
  {
    titel: "Anfrage senden",
    text: "Ihr beschreibt Ziel, Idee und Budgetrahmen. Fünf Minuten, ein Formular.",
  },
  {
    titel: "Idee & Ziel definieren",
    text: "Wir sprechen kurz darüber, was realistisch ist — und was es nicht ist.",
  },
  {
    titel: "Kampagne planen",
    text: "Format, Ablauf und Termin stehen fest, bevor irgendetwas produziert wird.",
  },
  {
    titel: "Salzburg erreichen",
    text: "Der Content geht raus. Danach bekommt ihr die Zahlen dazu.",
  },
];

export function AblaufZeitstrahl() {
  const listeRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const liste = listeRef.current;
    if (!liste) return;

    const punkte = Array.from(liste.querySelectorAll<HTMLElement>("[data-schritt]"));
    // Die Strecke mit Index i verbindet Schritt i mit Schritt i+1. Der letzte
    // Schritt hat keine, deshalb ist die Liste um eins kuerzer.
    const strecken = Array.from(liste.querySelectorAll<HTMLElement>("[data-strecke]"));
    if (punkte.length === 0) return;

    /** Alles bis einschliesslich `bis` aktivieren. Nur vorwaerts. */
    let hoechster = -1;
    const aktivieren = (bis: number) => {
      if (bis <= hoechster) return;
      for (let i = hoechster + 1; i <= bis; i++) {
        punkte[i].dataset.aktiv = "ja";
        // Die Strecke davor ist erst voll, wenn ihr Ziel erreicht ist.
        if (i > 0) strecken[i - 1]?.style.setProperty("--fortschritt", "1");
      }
      hoechster = bis;
    };

    const wenigerBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Was beim Laden schon im Bild steht, bleibt stehen. Es einmal blass zu
    // schalten und sofort wieder aufzuhellen waere ein Flackern und keine
    // Animation.
    const grenze = window.innerHeight * 0.92;
    let schonDa = -1;
    punkte.forEach((punkt, i) => {
      if (punkt.getBoundingClientRect().top < grenze) schonDa = i;
    });

    // Ausgangszustand fuer alles Uebrige.
    for (let i = schonDa + 1; i < punkte.length; i++) {
      punkte[i].dataset.aktiv = "nein";
      if (i > 0) strecken[i - 1]?.style.setProperty("--fortschritt", "0");
    }
    aktivieren(schonDa);

    // Wer weniger Bewegung eingestellt hat, bekommt den fertigen Zustand. Der
    // Zeitstrahl ist dann eine Grafik statt einer Animation — was er im Kern
    // ohnehin ist.
    if (wenigerBewegung || !("IntersectionObserver" in window)) {
      aktivieren(punkte.length - 1);
      return;
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue;
          aktivieren(Number((eintrag.target as HTMLElement).dataset.schritt));
          beobachter.unobserve(eintrag.target);
        }
      },
      // Ausloesen, sobald der Schritt im unteren Fuenftel angekommen ist —
      // dann laeuft die Linie mit dem Blick mit und nicht hinterher.
      { threshold: 0.5, rootMargin: "0px 0px -20% 0px" },
    );

    for (let i = schonDa + 1; i < punkte.length; i++) beobachter.observe(punkte[i]);

    // Rettungsleine wie beim Scroll-Reveal: Meldet der Beobachter nie — etwa
    // in einer Umgebung, die keine Bilder zeichnet —, steht nach vier
    // Sekunden trotzdem der ganze Ablauf da.
    const notfall = window.setTimeout(() => aktivieren(punkte.length - 1), 4000);

    return () => {
      beobachter.disconnect();
      window.clearTimeout(notfall);
    };
  }, []);

  return (
    <ol ref={listeRef} className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
      {schritte.map((schritt, index) => {
        const letzter = index === schritte.length - 1;

        return (
          <li
            key={schritt.titel}
            data-schritt={index}
            className="strahl-schritt relative flex gap-5 lg:block"
          >
            {/* --------------------------------------------- Die Strecke */}
            {!letzter ? (
              <span
                aria-hidden
                className="absolute top-14 -bottom-8 left-6 w-px -translate-x-1/2 bg-line lg:top-6 lg:right-[-1.5rem] lg:bottom-auto lg:left-14 lg:h-px lg:w-auto lg:translate-x-0 lg:-translate-y-1/2"
              >
                <span
                  data-strecke={index}
                  className="strahl-strecke block size-full bg-gradient-to-b from-primary to-primary-dark lg:bg-gradient-to-r"
                />
              </span>
            ) : null}

            {/* ----------------------------------------------- Der Knoten */}
            <span
              aria-hidden
              className="strahl-knoten num display relative z-10 grid size-12 shrink-0 place-items-center rounded-full border border-line bg-page text-[1.125rem] text-primary-dark shadow-card"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* ------------------------------------------------- Der Text */}
            <div className="lg:mt-6">
              <h3 className="font-display text-[1.125rem] leading-snug font-bold text-ink">
                {schritt.titel}
              </h3>
              <p className="mt-2 max-w-[34ch] leading-relaxed text-muted">{schritt.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
