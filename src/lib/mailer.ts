import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * Der eine Weg nach draussen fuer E-Mails — zwei Transporte, eine
 * Schnittstelle.
 *
 * Uebernommen aus der icmedia-Website (~/Documents/Masterclass-cc), wo dieses
 * Muster seit August 2026 im Betrieb ist. Welcher Dienst traegt, entscheidet
 * die Umgebung, nicht der aufrufende Code:
 *
 *   SMTP   — das eigene Postfach der Domain (bei World4You). Absender und
 *            Postfach sind dieselbe Adresse, es muss nichts bei einem
 *            Drittanbieter verifiziert werden, und es kommt kein weiterer
 *            Auftragsverarbeiter in die Datenschutzerklaerung.
 *   Resend — die API-Variante, falls kein SMTP-Zugang gesetzt ist.
 *
 * Ist keines von beiden eingerichtet, scheitert der Versand laut. Eine
 * Anfrage, die still verschwindet, ist der schlimmste Fehler, den diese Seite
 * machen kann — deshalb gibt es hier keinen stillen Rueckfall auf "nichts
 * tun".
 */

export type Mail = {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
};

export type Transport = "smtp" | "resend";

/**
 * Ein Umgebungswert, von Rand-Leerzeichen befreit.
 *
 * Klingt nach Kleinigkeit, war aber ein Produktionsausfall: Beim Einfuegen
 * ins Vercel-Dashboard war SMTP_HOST ein Tabulator vorangestellt. Das
 * Formular meldete daraufhin einen Fehler, und im Protokoll stand
 *
 *   getaddrinfo EDNS '\tsmtp.world4you.com'
 *
 * Ein unsichtbares Zeichen, das man weder im Dashboard noch beim
 * Vergleichen sieht. Deshalb wird JEDER Wert hier geputzt, nicht nur der,
 * der es einmal gebraucht hat.
 */
function wert(name: string): string | undefined {
  const roh = process.env[name];
  const sauber = roh?.trim();
  return sauber ? sauber : undefined;
}

/** Welcher Transport eingerichtet ist — oder keiner. */
export function eingerichteterTransport(): Transport | null {
  if (wert("SMTP_HOST")) return "smtp";
  if (wert("RESEND_API_KEY")) return "resend";
  return null;
}

/**
 * Absender und Empfaenger.
 *
 * Bei SMTP muss der Absender dieselbe Adresse sein wie das Postfach —
 * andernfalls weist der Server ihn zurueck oder die Mail landet im Spam.
 */
export function mailAdressen() {
  const to = wert("MAIL_TO") ?? "";
  const from = wert("MAIL_FROM") || (to ? `Salzburgsucht <${to}>` : "");
  return { to, from };
}

/* Der Transporter wird einmal gebaut und wiederverwendet: Jede neue Instanz
   oeffnet eine eigene Verbindung zum Mailserver. */
let smtp: nodemailer.Transporter | null = null;

function smtpTransport() {
  if (smtp) return smtp;
  const port = Number(wert("SMTP_PORT") ?? 587);
  const smtps = port === 465;

  smtp = nodemailer.createTransport({
    host: wert("SMTP_HOST"),
    port,
    /* Zwei Arten, verschluesselt zu senden:
         465  SMTPS — die Verbindung ist von der ersten Zeile an verschluesselt.
         587  STARTTLS — im Klartext begonnen, dann auf TLS hochgestuft.
       World4You gibt fuer den Postausgang 587 (STARTTLS) vor. */
    secure: smtps,
    /* Nur bei STARTTLS relevant, und dort wichtig: Ohne diese Zeile wuerde
       nodemailer im Klartext weitersenden, falls der Server die Hochstufung
       nicht anbietet — dann gingen Zugangsdaten und Anfrage ungeschuetzt
       ueber die Leitung. Mit ihr bricht der Versand stattdessen ab. */
    requireTLS: !smtps,
    auth: {
      user: wert("SMTP_USER"),
      /* Das Passwort wird bewusst NICHT geputzt: Ein Leerzeichen am Rand
         kann Teil des Passworts sein, und ein stillschweigend geaendertes
         Passwort waere ein schlimmerer Fehler als ein abgelehnter Login. */
      pass: process.env.SMTP_PASS,
    },
  });
  return smtp;
}

/**
 * Versendet eine Nachricht. Wirft bei Fehlern — die aufrufende Stelle
 * entscheidet, ob das den Absender etwas angeht.
 */
export async function sendeMail(mail: Mail): Promise<void> {
  const { from } = mailAdressen();
  const transport = eingerichteterTransport();

  if (transport === "smtp") {
    await smtpTransport().sendMail({
      from,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
    });
    return;
  }

  if (transport === "resend") {
    const resend = new Resend(wert("RESEND_API_KEY"));
    const ergebnis = await resend.emails.send({
      from,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
    });
    if (ergebnis.error) throw new Error(ergebnis.error.message);
    return;
  }

  throw new Error(
    "Kein Mailversand eingerichtet: SMTP_HOST/SMTP_USER/SMTP_PASS oder RESEND_API_KEY setzen.",
  );
}
