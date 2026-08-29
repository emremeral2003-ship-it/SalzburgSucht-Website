import Image from "next/image";

import logoDatei from "../../public/brand/salzburgsucht.png";

/**
 * Die Wortmarke.
 *
 * Bis 28.08.2026 stand hier ein Nachbau aus Text und einer selbst gezeichneten
 * SVG-Lupe, weil keine Datei vorlag. Der Nachbau war an mehreren Stellen
 * falsch — unter anderem die Kontur im Lupenglas. Jetzt liegt die echte Datei
 * vor und wird verwendet.
 *
 * ZUR GROESSE: Die Hoehe kommt weiter ueber `className` als Schriftgroesse
 * herein (z. B. `text-[1.0625rem]`), damit die Aufrufstellen unveraendert
 * bleiben. Aus ihr wird die Bildhoehe abgeleitet, die Breite folgt dem
 * Seitenverhaeltnis der Datei.
 *
 * ZUM KONTRAST: Das Markenblau erreicht auf Weiss nur rund 2:1. Als Bildmarke
 * ist das zulaessig — sie traegt keine Information, die sonst verloren ginge,
 * denn der Name steht im `alt`-Text und im Seitentitel. Deshalb steht hier
 * bewusst KEINE Aufhellung oder Umfaerbung: Ein eingefaerbtes Logo waere
 * nicht mehr das Logo.
 *
 * OFFEN: Eine Vektordatei (SVG) waere der bessere Weg — sie bliebe auf jedem
 * Bildschirm scharf und waere ein Bruchteil so gross. Bis dahin genuegt das
 * PNG; Next.js liefert es in der jeweils benoetigten Groesse aus.
 */
export function Logo({
  className = "",
  tone = "hell",
}: {
  className?: string;
  /**
   * Bleibt erhalten, damit die Aufrufstellen unveraendert funktionieren.
   * Die Datei ist auf hellem wie dunklem Grund dieselbe — das Markenblau
   * steht auf beidem.
   */
  tone?: "hell" | "dunkel";
}) {
  void tone;

  return (
    <span className={`inline-flex leading-none ${className}`} role="img" aria-label="Salzburgsucht">
      <Image
        src={logoDatei}
        alt=""
        aria-hidden
        priority
        // 2,6 × der Schriftgroesse: Das entspricht der Hoehe, die der
        // frueherer Nachbau an denselben Aufrufstellen eingenommen hat.
        className="h-[2.6em] w-auto"
        sizes="(max-width: 640px) 160px, 220px"
      />
    </span>
  );
}
