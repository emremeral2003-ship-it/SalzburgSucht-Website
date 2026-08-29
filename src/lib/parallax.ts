/**
 * Ein einziger Scroll-Takt fuer die ganze Seite.
 *
 * Der Grund fuer dieses Modul steht in seiner Struktur: Es gibt **eine**
 * Registrierung, **einen** Scroll-Zuhoerer und **ein** requestAnimationFrame
 * — egal wie viele Elemente sich bewegen. Wuerde jede Komponente ihre eigene
 * Schleife starten, haette eine Seite mit acht Hintergrundformen acht
 * Schleifen, die sich gegenseitig aus dem Bildtakt draengen. Auf einem
 * Mittelklasse-Telefon ist das der Unterschied zwischen "lebendig" und
 * "ruckelt beim Scrollen".
 *
 * Es gibt zwei Arten von Eintraegen, und beide schreiben ausschliesslich
 * CSS-Variablen:
 *
 *   versatz       verschiebt ein Element langsamer als die Seite (Parallax)
 *   fortschritt   uebersetzt die Lage im Bild in eine Zahl von 0 bis 1
 *
 * Der zweite Fall traegt das Salzburg-Signal: Ein SVG-Pfad mit
 * `pathLength="1"` zeichnet sich ueber `stroke-dashoffset: calc(1 - var(...))`
 * genau so weit, wie man gescrollt hat. Ohne eine einzige Messung im
 * JavaScript und ohne eine Animationsbibliothek.
 *
 * Bewegt wird ausschliesslich ueber `transform` beziehungsweise ueber
 * Eigenschaften, die kein Layout ausloesen. `top` oder `margin` zu animieren
 * wuerde bei jedem Bild ein neues Layout erzwingen.
 */

type Eintrag =
  | {
      art: "versatz";
      /** Wie stark das Element zuruecksteht. 0 = klebt am Inhalt, 0.3 = deutlich. */
      staerke: number;
      /** Zusaetzliche waagrechte Drift, fuer die grossen Hintergrundwoerter. */
      waagrecht: number;
    }
  | {
      art: "fortschritt";
      /** Ab welchem Rohfortschritt der Wert zu laufen beginnt. */
      von: number;
      /** Ab welchem Rohfortschritt er bei 1 steht. */
      bis: number;
      /** Zuletzt geschriebener Wert — verhindert ueberfluessige Stilschreibvorgaenge. */
      zuletzt: number;
    };

const eintraege = new Map<HTMLElement, Eintrag>();
let laeuft = false;
let geplant = false;

export function wenigerBewegung(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const klemmen = (wert: number) => (wert < 0 ? 0 : wert > 1 ? 1 : wert);

function zeichnen() {
  geplant = false;
  const hoehe = window.innerHeight;

  for (const [element, eintrag] of eintraege) {
    const kasten = element.getBoundingClientRect();

    // Was weit ausserhalb des Bildes liegt, wird nicht berechnet. Das spart
    // bei einer langen Seite den Grossteil der Arbeit pro Bild.
    if (kasten.bottom < -hoehe || kasten.top > hoehe * 2) continue;

    if (eintrag.art === "versatz") {
      // Abstand der Elementmitte von der Bildschirmmitte. Negatives Vorzeichen,
      // damit das Element dem Inhalt hinterherhinkt statt vorauszueilen.
      const mitte = kasten.top + kasten.height / 2 - hoehe / 2;
      const y = -mitte * eintrag.staerke;

      element.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
      if (eintrag.waagrecht !== 0) {
        element.style.setProperty("--parallax-x", `${(-mitte * eintrag.waagrecht).toFixed(1)}px`);
      }
      continue;
    }

    // Rohfortschritt: 0, sobald die Oberkante den unteren Bildrand beruehrt,
    // 1, sobald die Unterkante oben hinausgelaufen ist. Der Nenner enthaelt
    // die Elementhoehe, damit ein langer Abschnitt nicht schneller fertig ist
    // als ein kurzer.
    const roh = (hoehe - kasten.top) / (hoehe + kasten.height);
    const wert = klemmen((roh - eintrag.von) / (eintrag.bis - eintrag.von));

    // Auf drei Nachkommastellen gerundet. Feiner koennte niemand sehen, und
    // jede Aenderung kostet einen Stilschreibvorgang.
    const gerundet = Math.round(wert * 1000) / 1000;
    if (gerundet === eintrag.zuletzt) continue;
    eintrag.zuletzt = gerundet;
    element.style.setProperty("--sig-fortschritt", String(gerundet));
  }
}

function anstossen() {
  if (geplant) return;
  geplant = true;
  requestAnimationFrame(zeichnen);
}

function starten() {
  if (laeuft) return;
  laeuft = true;
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", anstossen, { passive: true });
  anstossen();
}

function stoppen() {
  if (!laeuft) return;
  laeuft = false;
  window.removeEventListener("scroll", anstossen);
  window.removeEventListener("resize", anstossen);
}

function abmelden(element: HTMLElement, ...variablen: string[]) {
  eintraege.delete(element);
  for (const name of variablen) element.style.removeProperty(name);
  if (eintraege.size === 0) stoppen();
}

/**
 * Meldet ein Element zur Bewegung an und liefert die Abmeldung zurueck.
 *
 * Bei reduzierter Bewegung passiert nichts — kein Zuhoerer, keine Schleife.
 * Das Element bleibt dann schlicht stehen, was genau richtig ist.
 */
export function anmelden(element: HTMLElement, staerke: number, waagrecht = 0): () => void {
  if (wenigerBewegung()) return () => {};

  eintraege.set(element, { art: "versatz", staerke, waagrecht });
  starten();
  anstossen();

  return () => abmelden(element, "--parallax-y", "--parallax-x");
}

/**
 * Meldet ein Element fuer `--sig-fortschritt` an: 0 beim Eintritt von unten,
 * 1, wenn es den Bildschirm nach oben verlaesst.
 *
 * `von` und `bis` schneiden aus diesem Weg das Stueck heraus, in dem sich
 * tatsaechlich etwas veraendern soll. Die Voreinstellung laesst einen Pfad
 * fertig gezeichnet sein, wenn der Abschnitt zu rund zwei Dritteln
 * durchlaufen ist — der Rest der Strecke gehoert dem Inhalt.
 *
 * Bei reduzierter Bewegung wird der Wert einmal auf 1 gesetzt. Das ist
 * wichtig: Ein Pfad, der bei 0 stehen bleibt, waere unsichtbar. Bewegung
 * abschalten heisst, das Ergebnis zu zeigen — nicht, es wegzulassen.
 */
export function anmeldenFortschritt(
  element: HTMLElement,
  { von = 0.12, bis = 0.62 }: { von?: number; bis?: number } = {},
): () => void {
  if (wenigerBewegung()) {
    element.style.setProperty("--sig-fortschritt", "1");
    return () => element.style.removeProperty("--sig-fortschritt");
  }

  eintraege.set(element, { art: "fortschritt", von, bis, zuletzt: -1 });
  starten();
  anstossen();

  return () => abmelden(element, "--sig-fortschritt");
}
