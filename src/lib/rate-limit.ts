import "server-only";

/**
 * Einfaches Fenster-Limit pro IP.
 *
 * Ehrliche Einschränkung: Der Zähler liegt im Arbeitsspeicher der jeweiligen
 * Serverinstanz. Bei mehreren Instanzen zählt jede für sich, und nach einem
 * Neustart ist der Stand weg. Als alleiniger Schutz wäre das zu wenig — hier
 * ist es die zweite von drei Hürden neben dem Honeypot und der Validierung,
 * und es hält genau die simplen Massen-Skripte ab, die ein Formular in Serie
 * abschicken. Wird das Volumen real, gehört ein geteilter Zähler her.
 */

type Eintrag = { anzahl: number; bis: number };

const speicher = new Map<string, Eintrag>();

export function limitPruefen(
  schluessel: string,
  { maximum = 5, fensterMs = 10 * 60_000 } = {},
): { erlaubt: boolean; wartenSek: number } {
  const jetzt = Date.now();
  const vorhanden = speicher.get(schluessel);

  if (!vorhanden || vorhanden.bis < jetzt) {
    speicher.set(schluessel, { anzahl: 1, bis: jetzt + fensterMs });
    aufraeumen(jetzt);
    return { erlaubt: true, wartenSek: 0 };
  }

  if (vorhanden.anzahl >= maximum) {
    return { erlaubt: false, wartenSek: Math.ceil((vorhanden.bis - jetzt) / 1000) };
  }

  vorhanden.anzahl += 1;
  return { erlaubt: true, wartenSek: 0 };
}

/** Verhindert, dass die Map über die Laufzeit unbegrenzt wächst. */
function aufraeumen(jetzt: number) {
  if (speicher.size < 500) return;
  for (const [schluessel, eintrag] of speicher) {
    if (eintrag.bis < jetzt) speicher.delete(schluessel);
  }
}

/** Beste verfügbare Absender-IP hinter Proxy oder CDN. */
export function ipAus(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? headers.get("x-nf-client-connection-ip") ?? "unbekannt";
}
