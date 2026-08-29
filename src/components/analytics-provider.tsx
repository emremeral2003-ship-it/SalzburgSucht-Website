"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import {
  CONSENT_EVENT,
  captureAttribution,
  getConsent,
  trackPageView,
} from "@/lib/analytics";

/**
 * Haelt die Messung am Laufen.
 *
 * Drei Aufgaben: die Herkunft der Sitzung einmal festhalten, das Zaehlscript
 * erst nach Einwilligung laden und jeden Routenwechsel als Seitenaufruf
 * melden. Letzteres ist noetig, weil bei einer Navigation innerhalb der App
 * kein neuer Seitenaufruf im klassischen Sinn stattfindet — ohne das zaehlt
 * jeder Dienst nur die erste Seite.
 */
function Melder() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    const abfrage = searchParams.toString();
    trackPageView(abfrage ? `${pathname}?${abfrage}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Laedt das Zaehlscript — erst nach einem aktiven Ja.
 *
 * Vorher steht kein einziges Byte davon im Browser. Das ist der Unterschied
 * zwischen "nach Einwilligung messen" und "vorsorglich laden und hoffen".
 *
 * Eingebunden ist hier Google Analytics 4, weil dafuer eine Kennung in der
 * Umgebung vorgesehen ist. Ein Wechsel zu Plausible, Matomo oder Umami kostet
 * diesen Block plus nichts weiter: Die Zustellung in
 * src/lib/analytics/index.ts erkennt alle vier Dienste bereits.
 */
function Zaehlscript() {
  const [erlaubt, setErlaubt] = useState(false);
  const id = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    const pruefen = () => setErlaubt(getConsent() === "granted");
    pruefen();
    window.addEventListener(CONSENT_EVENT, pruefen);
    return () => window.removeEventListener(CONSENT_EVENT, pruefen);
  }, []);

  if (!erlaubt || !id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

export function AnalyticsProvider() {
  return (
    <>
      <Zaehlscript />
      {/* useSearchParams verlangt eine Suspense-Grenze, sonst faellt die
          gesamte Seite auf clientseitiges Rendern zurueck. */}
      <Suspense fallback={null}>
        <Melder />
      </Suspense>
    </>
  );
}
