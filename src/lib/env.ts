/**
 * Zugriff auf Umgebungsvariablen mit klarer Fehlermeldung.
 *
 * Absicht: Wenn eine Variable fehlt, soll das Problem beim ersten Versuch
 * benannt werden ("RESEND_API_KEY fehlt") statt als undefined durch drei
 * Schichten zu wandern und irgendwo als kryptischer Netzwerkfehler zu enden.
 */

function pflicht(name: string, wert: string | undefined): string {
  if (!wert || wert.trim() === "") {
    throw new Error(
      `Umgebungsvariable ${name} fehlt. Siehe .env.example — ohne diesen Wert kann die Aktion nicht ausgeführt werden.`,
    );
  }
  return wert;
}

export const env = {
  supabaseUrl: () => pflicht("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () =>
    pflicht("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceKey: () =>
    pflicht("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  mailTo: () => pflicht("MAIL_TO", process.env.MAIL_TO),
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
};

/**
 * Ist eine Datenbank ueberhaupt hinterlegt?
 *
 * Solange nicht, laeuft die Website vollstaendig mit Seed-Daten und die
 * Formulare melden ehrlich, dass die Uebermittlung noch nicht eingerichtet
 * ist — statt einen Erfolg vorzutaeuschen, den es nicht gab.
 */
export function datenbankKonfiguriert(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Ist ein Mailversand eingerichtet?
 *
 * Zwei Wege sind moeglich — das eigene Postfach per SMTP oder Resend. Es
 * genuegt EINER davon; welcher genommen wird, entscheidet src/lib/mailer.ts.
 * `MAIL_TO` ist in beiden Faellen noetig, sonst gibt es keinen Empfaenger.
 */
export function mailKonfiguriert(): boolean {
  const transport = Boolean(process.env.SMTP_HOST?.trim() || process.env.RESEND_API_KEY?.trim());
  return transport && Boolean(process.env.MAIL_TO?.trim());
}
