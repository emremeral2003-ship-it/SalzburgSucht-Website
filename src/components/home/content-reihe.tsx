"use client";

import Image from "next/image";
import { useRef } from "react";

import { ArrowRight, Instagram } from "@/components/icons";
import { Reveal } from "@/components/ui/motion";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { wenigerBewegung } from "@/lib/parallax";
import { contentKarten, type ContentKarte } from "@/data/discovery";

/**
 * "Gerade in Salzburg" — die Reihe fuer echte Beitraege.
 *
 * Die Karten sind vollstaendig medienfaehig: Ein Cover ist Pflicht, ein
 * kurzes Reel optional. Beides wird in src/data/discovery.ts eingetragen,
 * hier aendert sich beim Tausch auf echte Inhalte nichts.
 *
 * Drei Entscheidungen, die die Umsetzung bestimmt haben:
 *
 *   1. **Ein Zeigerereignis fuer alle Karten.** Der Kippwinkel kommt aus
 *      einem einzigen `pointermove` auf der Liste, gedrosselt auf ein Bild
 *      pro Zeichenschritt. Ein Zuhoerer je Karte mit eigener Schleife waere
 *      derselbe Effekt zum dreifachen Preis.
 *   2. **Der Kippwinkel bleibt unter zwei Grad.** Darueber sieht eine Karte
 *      aus, als wuerde sie umfallen. Bei anderthalb Grad merkt man nur, dass
 *      sie auf den Zeiger reagiert.
 *   3. **Reels starten erst beim Darueberfahren** und laden vorher gar nichts
 *      (`preload="none"`). Auf Telefonen gibt es kein Darueberfahren, also
 *      laeuft dort nie ein Video — was auf Mobilfunk auch niemand will.
 *
 * Ohne hinterlegten Permalink ist die Karte kein Link. Ein Klickziel
 * anzubieten, das nirgends hinfuehrt, ist schlechter als keines.
 */

/** Maximaler Kippwinkel in Grad. Bewusst klein — siehe Erklaerung oben. */
const KIPP_MAX = 1.6;

export function ContentReihe() {
  const geplant = useRef(false);
  const anstehend = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);

  function beiBewegung(e: React.PointerEvent<HTMLUListElement>) {
    // Nur echte Maeuse. Ein Fingertipp erzeugt ebenfalls Zeigerereignisse,
    // und eine Karte, die unter dem Daumen kippt, wirkt kaputt.
    if (e.pointerType !== "mouse" || wenigerBewegung()) return;

    const karte = (e.target as HTMLElement).closest<HTMLElement>("[data-karte]");
    if (!karte) return;

    const kasten = karte.getBoundingClientRect();
    anstehend.current = {
      el: karte,
      x: (0.5 - (e.clientY - kasten.top) / kasten.height) * 2 * KIPP_MAX,
      y: ((e.clientX - kasten.left) / kasten.width - 0.5) * 2 * KIPP_MAX,
    };

    if (geplant.current) return;
    geplant.current = true;
    requestAnimationFrame(() => {
      geplant.current = false;
      const d = anstehend.current;
      if (!d) return;
      d.el.dataset.zeigt = "ja";
      d.el.style.setProperty("--kipp-x", `${d.x.toFixed(2)}deg`);
      d.el.style.setProperty("--kipp-y", `${d.y.toFixed(2)}deg`);
      d.el.style.setProperty("--heben", "-4px");
    });
  }

  function zuruecksetzen(el: HTMLElement) {
    anstehend.current = null;
    delete el.dataset.zeigt;
    el.style.removeProperty("--kipp-x");
    el.style.removeProperty("--kipp-y");
    el.style.removeProperty("--heben");
  }

  return (
    <>
      <ul
        onPointerMove={beiBewegung}
        className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {contentKarten.map((karte, index) => (
          <Reveal
            key={karte.id}
            as="li"
            verzug={index * 90}
            // Versatz statt drei gleicher Rechtecke. Die Werte sind bewusst
            // ungleichmaessig (0 / 3,5 / 1,75 rem) — gleichmaessige Stufen
            // saehen wie eine Treppe aus, ungleiche wie eine Redaktionsseite.
            // Nur ab Desktop: Auf dem Telefon stapelt sich alles ohnehin, und
            // ein Versatz waere dort nur ein krummer Abstand.
            className={VERSATZ[index % VERSATZ.length]}
          >
            <Karte karte={karte} onVerlassen={zuruecksetzen} />
          </Reveal>
        ))}
      </ul>

    </>
  );
}

/** Vertikaler Versatz der Karten ab Desktop. Siehe Kommentar an der Aufrufstelle. */
const VERSATZ = ["lg:mt-0", "lg:mt-14", "lg:mt-7"] as const;

function Karte({
  karte,
  onVerlassen,
}: {
  karte: ContentKarte;
  onVerlassen: (el: HTMLElement) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function abspielen() {
    const v = videoRef.current;
    if (!v || wenigerBewegung()) return;
    // Ein abgebrochener Abspielversuch wirft — etwa wenn der Zeiger die Karte
    // verlaesst, bevor die ersten Daten da sind. Das ist kein Fehler.
    void v.play().catch(() => {});
  }

  function anhalten() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }

  const inhalt = (
    <>
      {/* ------------------------------------------------------- Cover */}
      <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[calc(var(--radius-card)-0.35rem)] bg-soft">
        <Image
          src={karte.bild}
          alt={karte.alt}
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 92vw"
          className="medienbild object-cover"
          {...(karte.vorschau ? { placeholder: "blur" as const, blurDataURL: karte.vorschau } : {})}
        />

        {karte.video ? (
          <video
            ref={videoRef}
            src={karte.video}
            poster={karte.bild}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className="medienbild absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}

        {karte.demo ? (
          <span className="absolute top-3 left-3 rounded-full border border-white/45 bg-black/35 px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-sm">
            Beispiel
          </span>
        ) : null}

        {/* Das Instagram-Zeichen steht NUR auf Karten, die tatsaechlich dorthin
            fuehren. Es sass frueher auf allen dreien — auch auf der Baeckerei-
            Eroeffnung und der Naya-Aktion, die mit Instagram nichts zu tun
            haben. Der dunkle Verlauf gehoert dazu: Er traegt das Zeichen und
            haelt es auf jedem Cover lesbar. */}
        {karte.url ? (
          <>
            <span
              aria-hidden
              className="medien-schleier absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent opacity-100"
            />
            <span
              aria-hidden
              className="medien-knopf absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-white/92 text-primary-deep shadow-card"
            >
              <Instagram className="size-5" />
            </span>
          </>
        ) : null}
      </span>

      {/* ------------------------------------------------------- Text */}
      <span className="mt-5 block px-1 pb-1">
        <span className="medien-pille inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-[0.6875rem] font-bold tracking-[0.1em] text-primary-deep uppercase">
          {karte.kategorie}
        </span>

        <span className="medien-titel mt-3 block font-display text-[1.125rem] leading-snug font-bold text-ink">
          {karte.titel}
        </span>
        <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-muted">
          {karte.text}
        </span>

        {/* Der Rabattcode. Eigene Zeile, gestrichelter Rahmen — er soll aus
            dem Text herausstechen wie ein Gutschein und nicht wie ein
            weiteres Etikett aussehen. Farben und Rundung kommen aus
            denselben Marken-Tokens wie die Kategoriepille darueber. */}
        {karte.code ? (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary bg-primary-soft px-3 py-1.5 text-[0.8125rem] font-bold tracking-[0.06em] text-primary-deep uppercase">
            Code: {karte.code}
          </span>
        ) : null}

        {/* Die Zeile mit dem Ziel wächst erst beim Darueberfahren auf. Ohne
            Zeiger — also auf jedem Telefon — steht sie dauerhaft da; das
            regelt das Stylesheet ueber `(hover: none)`. Bei Karten ohne
            hinterlegten Permalink bleibt sie ganz weg: Ein Hinweis, der beim
            Darueberfahren erscheint und dann "hier ist nichts" sagt, ist
            schlechter als kein Hinweis. */}
        {karte.url ? (
          <span className="medien-spur mt-3">
            <span>
              <span className="flex items-center gap-1.5 pt-1 text-[0.9375rem] font-semibold text-primary-dark">
                Auf Instagram ansehen
                <ArrowRight className="cta-pfeil size-4" />
              </span>
            </span>
          </span>
        ) : null}
      </span>
    </>
  );

  // Kippen, Heben und die Bildbewegung haengen am Zeiger, nicht am Link. Eine
  // Karte ohne hinterlegten Permalink verhaelt sich deshalb genauso — sonst
  // saehen die Platzhalter tot aus, obwohl an ihnen nichts fehlt ausser der
  // URL.
  const zeigerVerhalten = {
    "data-karte": true,
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      onVerlassen(e.currentTarget);
      anhalten();
    },
    onMouseEnter: abspielen,
    onMouseLeave: anhalten,
  } as const;

  const gemeinsam =
    "gruppe-medien medienkarte group block h-full rounded-card border border-line bg-page p-3 shadow-card hover:border-primary hover:shadow-card-hover";

  if (!karte.url) {
    return (
      <div {...zeigerVerhalten} className={gemeinsam}>
        {inhalt}
      </div>
    );
  }

  return (
    <a
      href={karte.url}
      target="_blank"
      rel="noreferrer noopener"
      {...zeigerVerhalten}
      onFocus={abspielen}
      onBlur={anhalten}
      onClick={() =>
        trackEvent(ANALYTICS_EVENTS.socialCardClick, {
          titel: karte.titel,
          kategorie: karte.kategorie,
          cta_location: "home_content",
        })
      }
      className={gemeinsam}
    >
      {inhalt}
    </a>
  );
}
