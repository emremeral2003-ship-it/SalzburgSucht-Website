import Image from "next/image";
import type { ComponentType } from "react";

import { Instagram } from "@/components/icons";
import { Logo } from "@/components/logo";

/**
 * Der Telefonbildschirm, in dem alle Beitragsattrappen der Seite stecken.
 *
 * Vorher gab es diesen Rahmen einmal in den Formatbeispielen. Mit der
 * Leistungsschau braucht ihn eine zweite Stelle, und zwei Kopien desselben
 * Bildschirms waeren garantiert nach dem ersten Feinschliff auseinander
 * gelaufen. Deshalb steht er hier einmal.
 *
 * Vier Regeln, die sich nicht aendern duerfen:
 *
 *   1. **Keine erfundenen Zahlen.** Kein "12.400 Aufrufe" unter einer
 *      Attrappe. Eine erfundene Kennzahl auf einer Seite, die Unternehmen
 *      ueberzeugen soll, ist ein Haftungsrisiko und kein Verkaufsargument.
 *   2. **Sichtbar als Attrappe gekennzeichnet.** Wer glaubt, echte Beitraege
 *      zu sehen, faellt spaeter darauf herein.
 *   3. **Keine fremden Bilder.** Solange kein eigener, freigegebener Beitrag
 *      vorliegt, ist die Flaeche ein Farbverlauf mit einem grossen, sehr
 *      schwachen Symbol. Ein heruntergeladenes Stockfoto von Salzburg waere
 *      genau das Tourismus-Klischee, das die Marke nicht sein will. Liegt ein
 *      eigener Beitrag vor (`video`), tritt er an die Stelle der Attrappe —
 *      dann ist es kein Platzhalter mehr, sondern die Arbeit selbst.
 *   4. **Immer dasselbe Aussenmass.** Ein quadratischer Rahmen neben zwei
 *      hochkanten laesst in der Reihe eine halbe Kachel leer. Ein Feed-Post
 *      ist auf dem Telefon ohnehin ein quadratisches Bild *in* einem
 *      hochkanten Bildschirm — genau so steht er hier.
 *
 * Der ganze Rahmen ist `aria-hidden`: Es gibt nichts vorzulesen ausser
 * "salzburgsucht Attrappe". Dass es sich um Beispiele handelt, steht als Satz
 * im Fliesstext des jeweiligen Abschnitts.
 */

export type Rahmenart = "post" | "reel" | "story";

type Props = {
  art: Rahmenart;
  /** Verlauf der Flaeche. Kommt aus den Leistungsdaten, damit jede Leistung
      wiedererkennbar bleibt, ohne dass ein Bild geladen wird. */
  farbe: string;
  /** Grosses, sehr schwaches Symbol in der Flaeche — das einzige Motiv. */
  Motiv?: ComponentType<{ className?: string }>;
  /**
   * Pfad eines echten Beispielvideos ohne Endung. Ist einer gesetzt, tritt er
   * an die Stelle der Attrappe: Das Video laeuft stumm im Hintergrund, der
   * Hinweis "Attrappe" faellt weg (es ist ja keine), und der nachgemalte
   * Abspielknopf ebenso — er saesse auf einem Video, das bereits laeuft.
   */
  video?: string | null;
  /**
   * Echter Beitrag als Standbild — fuer Beitraege, die es nie als Video gab.
   * Wirkt wie `video`: keine Attrappe, kein nachgemalter Abspielknopf. Liegt
   * beides vor, gewinnt das Video.
   */
  bild?: string | null;
  className?: string;
};

/** Absenderzeile, wie sie in jedem Beitrag steht. */
function Absender({ hell = false }: { hell?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/90 text-primary-deep">
        <Instagram className="size-4" />
      </span>
      <span
        className={`text-[0.8125rem] font-semibold ${hell ? "text-white drop-shadow" : "text-white/95"}`}
      >
        salzburgsucht
      </span>
    </span>
  );
}

/**
 * Ein echter Beitrag als stummer Videoschnipsel.
 *
 * `autoPlay muted loop playsInline` ist die einzige Kombination, die Browser
 * ohne Zutun abspielen: Ton wuerde jeder von ihnen blockieren, und ohne
 * `playsInline` reisst iOS das Video in den Vollbildmodus — mitten im
 * Seitenfluss.
 *
 * In der Leistungsschau bekommt die Vorschau bei jedem Wechsel einen neuen
 * Schluessel. Der Videoknoten wird dadurch neu aufgebaut und startet von
 * vorn — genau das ist das gewuenschte "beim Ueberfahren spielt es los",
 * ganz ohne eigenen Zustand oder Klickhorcher.
 *
 * `preload="none"` und das Standbild: Ohne das laedt jeder Besuch der
 * Startseite mehrere Megabyte, auch wer nie eine Leistung anfaehrt. Bis zum
 * ersten Bild steht das Standbild da, keine schwarze Flaeche.
 */
function VideoFlaeche({ video, className = "" }: { video: string; className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-dark-deep ${className}`}>
      <video
        key={video}
        src={`${video}.mp4`}
        poster={`${video}.jpg`}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="size-full object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
      <span className="absolute bottom-3 left-3 opacity-90">
        <Logo tone="dunkel" className="text-[0.625rem]" />
      </span>
    </span>
  );
}

/**
 * Ein echter Beitrag als Standbild.
 *
 * Ueber `next/image` und nicht als einfaches `img`: Der Rahmen ist je nach
 * Bildschirm rund 240 bis 340 Pixel breit, die Vorlage ist 900. Ohne
 * Optimierung laedt jedes Telefon die volle Datei fuer eine Flaeche, die ein
 * Viertel davon misst.
 */
function BildFlaeche({
  bild,
  className = "",
}: {
  bild: string;
  className?: string;
}) {
  return (
    <span className={`relative block overflow-hidden bg-dark-deep ${className}`}>
      {/* `alt=""` ist Absicht und kein Versaeumnis: Der ganze Rahmen ist
          `aria-hidden`, die Aussage steht als Fliesstext daneben. */}
      <Image src={bild} alt="" fill sizes="(min-width: 1024px) 340px, 260px" className="object-cover" />
    </span>
  );
}

/** Die farbige Flaeche mit Lichtkante, Motiv und Wortmarke. */
function Flaeche({
  farbe,
  Motiv,
  className = "",
}: {
  farbe: string;
  Motiv?: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ background: farbe }}>
      <span className="absolute inset-0 bg-[radial-gradient(75%_45%_at_50%_0%,rgba(255,255,255,0.28),transparent_70%)]" />
      {Motiv ? (
        <span className="absolute inset-0 grid place-items-center">
          <Motiv className="size-[46%] text-white/22" />
        </span>
      ) : null}
      <span className="absolute bottom-3 left-3 opacity-80 mix-blend-luminosity">
        <Logo tone="dunkel" className="text-[0.625rem]" />
      </span>
    </span>
  );
}

export function BeitragsRahmen({ art, farbe, Motiv, video, bild, className = "" }: Props) {
  /** Liegt ein echter Beitrag vor — egal ob bewegt oder still? */
  const echt = !!video || !!bild;

  /* Ein echtes Video laeuft immer randlos ueber den ganzen Bildschirm, auch
     bei `art: "post"`. Der quadratische Ausschnitt ist fuer eine Farbflaeche
     gedacht; ein hochkantes Video darin waere oben und unten beschnitten,
     und genau die Bildsprache, die hier gezeigt werden soll, ginge verloren. */
  const randlos = art !== "post" || !!video;

  return (
    <div
      aria-hidden
      className={`relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-dark-deep ${className}`}
    >
      {!randlos ? (
        <div className="flex h-full flex-col">
          <div className="px-3 pt-3">
            <Absender />
          </div>

          {/* Das eigentliche Bild: quadratisch, wie im echten Feed. */}
          {bild ? (
            <BildFlaeche bild={bild} className="mt-3 aspect-square w-full" />
          ) : (
            <Flaeche farbe={farbe} Motiv={Motiv} className="mt-3 aspect-square w-full" />
          )}

          {/* Bildunterschrift als angedeutete Zeilen — Blindtext waere hier
              eine erfundene Aussage, Balken sind ehrlicher. */}
          <div className="flex flex-1 flex-col gap-2 px-3 pt-4">
            <span className="h-1.5 w-4/5 rounded-full bg-white/30" />
            <span className="h-1.5 w-3/5 rounded-full bg-white/20" />
            <span className="h-1.5 w-2/5 rounded-full bg-white/15" />
          </div>
        </div>
      ) : (
        <>
          {video ? (
            <VideoFlaeche video={video} className="absolute inset-0" />
          ) : bild ? (
            <BildFlaeche bild={bild} className="absolute inset-0" />
          ) : (
            <>
              <Flaeche farbe={farbe} Motiv={Motiv} className="absolute inset-0" />
              <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/35 to-transparent" />
            </>
          )}

          {art === "story" ? (
            <span className="absolute inset-x-3 top-3 flex gap-1">
              <span className="h-0.5 flex-1 rounded-full bg-white/85" />
              <span className="h-0.5 flex-1 rounded-full bg-white/30" />
              <span className="h-0.5 flex-1 rounded-full bg-white/30" />
            </span>
          ) : null}

          <span className={`absolute inset-x-3 ${art === "story" ? "top-7" : "top-3"}`}>
            <Absender hell />
          </span>

          {art === "reel" && !echt ? (
            <>
              <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/22 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="size-6 translate-x-0.5 fill-white">
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
              </span>
              {/* Fortschrittsbalken des Videos. */}
              <span className="absolute inset-x-3 bottom-10 h-0.5 rounded-full bg-white/25">
                <span className="block h-full w-1/3 rounded-full bg-white/90" />
              </span>
            </>
          ) : null}
        </>
      )}

      {echt ? null : (
        <span className="absolute top-3 right-3 rounded-full border border-white/40 bg-black/30 px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-sm">
          Attrappe
        </span>
      )}
    </div>
  );
}
