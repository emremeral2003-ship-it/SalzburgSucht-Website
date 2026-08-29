/**
 * Prueft den Mailversand, ohne die Website zu starten.
 *
 *   node scripts/pruefe-mailversand.mjs            nur Verbindung und Anmeldung
 *   node scripts/pruefe-mailversand.mjs --senden   zusaetzlich eine Testmail
 *
 * Warum ein eigenes Skript: Ein Formular sagt nur "hat nicht geklappt". Hier
 * steht, WORAN es liegt — falscher Server, falsches Passwort, blockierter
 * Port. Das Passwort wird nur aus .env.local gelesen und nie ausgegeben.
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

function ausEnvDatei(pfad) {
  const werte = {};
  let text;
  try {
    text = readFileSync(pfad, "utf8");
  } catch {
    console.error(`Datei ${pfad} nicht gefunden.`);
    process.exit(1);
  }
  for (const zeile of text.split("\n")) {
    const treffer = zeile.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!treffer) continue;
    werte[treffer[1]] = treffer[2].trim().replace(/^["']|["']$/g, "");
  }
  return werte;
}

const env = ausEnvDatei(".env.local");
const port = Number(env.SMTP_PORT || 587);
const smtps = port === 465;

const fehlend = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "MAIL_TO"].filter(
  (name) => !env[name],
);
if (fehlend.length) {
  console.error("Es fehlen Werte in .env.local: " + fehlend.join(", "));
  process.exit(1);
}

console.log(`Server   ${env.SMTP_HOST}:${port} (${smtps ? "SMTPS" : "STARTTLS"})`);
console.log(`Postfach ${env.SMTP_USER}`);
console.log(`Absender ${env.MAIL_FROM}`);
console.log(`Empfaenger ${env.MAIL_TO}\n`);

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port,
  secure: smtps,
  requireTLS: !smtps,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

try {
  await transport.verify();
  console.log("Verbindung und Anmeldung: in Ordnung.");
} catch (fehler) {
  console.error("Verbindung oder Anmeldung fehlgeschlagen:");
  console.error("  " + fehler.message);
  console.error(
    "\nHaeufige Ursachen: falsches Postfach-Passwort, Tippfehler im Servernamen,\n" +
      "oder der Port ist im Netz blockiert (dann 465 statt 587 versuchen).",
  );
  process.exit(1);
}

if (!process.argv.includes("--senden")) {
  console.log("\nZum Verschicken einer Testmail: node scripts/pruefe-mailversand.mjs --senden");
  process.exit(0);
}

try {
  const info = await transport.sendMail({
    from: env.MAIL_FROM,
    to: env.MAIL_TO,
    subject: "Testmail von der Salzburgsucht-Website",
    html:
      "<p>Diese Nachricht kommt aus <code>scripts/pruefe-mailversand.mjs</code>.</p>" +
      "<p>Wenn sie im Postfach liegt, funktioniert der Versand des Kooperationsformulars.</p>",
  });
  console.log("Testmail verschickt. Kennung: " + info.messageId);
  console.log("Bitte im Postfach nachsehen — auch im Spam-Ordner.");
} catch (fehler) {
  console.error("Versand fehlgeschlagen: " + fehler.message);
  process.exit(1);
}
