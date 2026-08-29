import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Zwei Clients, zwei Rechtelagen — die Trennung ist Absicht.
 *
 * `anonClient` schreibt unter denselben RLS-Regeln wie ein Besucher. Selbst
 * wenn hier ein Fehler passiert, kann darueber nichts gelesen werden.
 *
 * `serviceClient` umgeht RLS vollstaendig und gehoert ausschliesslich in den
 * Admin-Bereich und in Vorgaenge, die per Definition serverseitig sind
 * (Double-Opt-In-Bestaetigung, Datei-Upload). Er darf niemals in eine
 * Client-Komponente gelangen; `server-only` oben erzwingt das beim Build.
 */

export function anonClient() {
  return createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    auth: { persistSession: false },
  });
}

export function serviceClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
