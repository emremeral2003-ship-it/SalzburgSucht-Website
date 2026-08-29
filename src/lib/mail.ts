import "server-only";

import { mailAdressen, sendeMail } from "@/lib/mailer";
import { mailKonfiguriert } from "@/lib/env";
import type { AttributionInput, CommunityInput, CooperationInput } from "@/lib/validation";

/**
 * Mailversand.
 *
 * Welcher Dienst sie traegt, steht in src/lib/mailer.ts — SMTP ueber das
 * eigene Postfach, sonst Resend. Hier wird nur der Inhalt gebaut.
 *
 * Diese Mails sind der HAUPTWEG, nicht die Benachrichtigung nebenbei:
 * Solange keine Datenbank hinterlegt ist, ist die Mail der einzige Ort, an
 * dem eine Anfrage ankommt. Deshalb tragen sie auch die Herkunftsdaten (UTM),
 * die sonst in der Datenbank stuenden — geht die Mail verloren, ist die
 * Anfrage weg.
 *
 * Fehler werden trotzdem protokolliert und als `false` zurueckgegeben, nie
 * geworfen: Die aufrufende Aktion entscheidet, ob noch ein zweiter Weg
 * getragen hat.
 *
 * RECHTLICHER HINWEIS: Diese Mails sind Benachrichtigungen zu einer aktiv
 * ausgeloesten Anfrage und deshalb ohne Double-Opt-In zulaessig. Sobald an die
 * gesammelten Adressen ein Newsletter oder Werbung verschickt werden soll,
 * ist ein bestaetigter Double-Opt-In zwingend. Der Platz dafuer ist
 * vorbereitet (Spalte confirmed_at), die Funktion ist bewusst noch nicht
 * gebaut — sie wird gebraucht, sobald der erste Versand ansteht.
 */

function escape(wert: string): string {
  return wert.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const rahmen = (inhalt: string) => `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#15202b;line-height:1.6">
  <div style="background:#10263a;color:#80bdff;padding:16px 20px;border-radius:8px 8px 0 0;
              font-weight:700;letter-spacing:.14em;font-size:12px;text-transform:uppercase">
    Salzburgsucht
  </div>
  <div style="border:1px solid #e2edf9;border-top:0;border-radius:0 0 8px 8px;padding:22px 20px">
    ${inhalt}
  </div>
</div>`;

const zeile = (bezeichnung: string, wert?: string | null) =>
  wert
    ? `<tr>
         <td style="padding:6px 12px 6px 0;color:#617080;vertical-align:top;white-space:nowrap">${escape(bezeichnung)}</td>
         <td style="padding:6px 0"><strong>${escape(wert)}</strong></td>
       </tr>`
    : "";

/**
 * Woher der Eingang kam.
 *
 * Stand ohne Datenbank nirgends sonst — ohne diesen Block waere nach dem
 * Wechsel auf reinen Mailversand nicht mehr nachvollziehbar, welche Kampagne
 * eine Anfrage gebracht hat.
 */
function herkunft(attribution: AttributionInput): string {
  const zeilen = [
    zeile("Quelle", attribution.utm_source),
    zeile("Medium", attribution.utm_medium),
    zeile("Kampagne", attribution.utm_campaign),
    zeile("Zugang", attribution.traffic_source),
  ].join("");

  if (!zeilen) return "";

  return `<h3 style="margin:20px 0 6px;font-size:14px;color:#617080">Herkunft</h3>
          <table style="border-collapse:collapse;font-size:14px;width:100%">${zeilen}</table>`;
}

/** Benachrichtigung an die Redaktion ueber eine neue Kooperationsanfrage. */
export async function notifyCooperation(
  daten: CooperationInput,
  attribution: AttributionInput,
): Promise<boolean> {
  if (!mailKonfiguriert()) {
    console.warn("[mail] Nicht konfiguriert — Kooperationsanfrage nicht per Mail versendet.");
    return false;
  }

  const inhalt = `
    <h2 style="margin:0 0 4px;font-size:18px">Neue Kooperationsanfrage</h2>
    <p style="margin:0 0 16px;color:#617080">${escape(daten.company)}</p>
    <table style="border-collapse:collapse;font-size:14px;width:100%">
      ${zeile("Ansprechperson", daten.contactName)}
      ${zeile("E-Mail", daten.email)}
      ${zeile("Telefon", daten.phone)}
      ${zeile("Website", daten.website)}
      ${zeile("Social Media", daten.socialMedia)}
      ${zeile("Bewerben möchte", daten.promotionType.join(", "))}
      ${zeile("Ziele", daten.goals.join(", "))}
      ${zeile("Budgetrahmen", daten.budgetRange)}
      ${zeile("Konkretes Budget", daten.concreteBudget)}
      ${zeile("Zeitraum", daten.desiredPeriod)}
    </table>
    <h3 style="margin:20px 0 6px;font-size:14px;color:#617080">Was macht das Unternehmen</h3>
    <p style="margin:0;white-space:pre-wrap">${escape(daten.companyDescription)}</p>
    <h3 style="margin:20px 0 6px;font-size:14px;color:#617080">Idee für die Kooperation</h3>
    <p style="margin:0;white-space:pre-wrap">${escape(daten.cooperationIdea)}</p>
    ${
      daten.message
        ? `<h3 style="margin:20px 0 6px;font-size:14px;color:#617080">Nachricht</h3>
           <p style="margin:0;white-space:pre-wrap">${escape(daten.message)}</p>`
        : ""
    }
    ${herkunft(attribution)}`;

  try {
    await sendeMail({
      to: mailAdressen().to,
      replyTo: daten.email,
      subject: `Kooperationsanfrage: ${daten.company} (${daten.budgetRange})`,
      html: rahmen(inhalt),
    });
    return true;
  } catch (fehler) {
    console.error("[mail] Kooperationsanfrage konnte nicht versendet werden:", fehler);
    return false;
  }
}

/** Benachrichtigung an die Redaktion ueber eine neue Community-Anmeldung. */
export async function notifyCommunitySignup(
  daten: CommunityInput,
  attribution: AttributionInput,
): Promise<boolean> {
  if (!mailKonfiguriert()) {
    console.warn("[mail] Nicht konfiguriert — Community-Anmeldung nicht per Mail versendet.");
    return false;
  }

  const inhalt = `
    <h2 style="margin:0 0 12px;font-size:18px">Neue Community-Anmeldung</h2>
    <table style="border-collapse:collapse;font-size:14px;width:100%">
      ${zeile("Vorname", daten.firstName)}
      ${zeile("E-Mail", daten.email)}
      ${zeile("Telefon", daten.phone)}
      ${zeile("Interessen", daten.interests.join(", "))}
    </table>
    ${herkunft(attribution)}`;

  try {
    await sendeMail({
      to: mailAdressen().to,
      subject: `Community-Anmeldung: ${daten.firstName}`,
      html: rahmen(inhalt),
    });
    return true;
  } catch (fehler) {
    console.error("[mail] Anmeldung konnte nicht gemeldet werden:", fehler);
    return false;
  }
}
