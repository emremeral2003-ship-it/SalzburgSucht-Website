/**
 * Gemeinsamer Rueckgabetyp aller Formular-Aktionen.
 *
 * `errors` ist feldweise, damit die Meldung an dem Feld erscheint, das sie
 * verursacht hat. `message` traegt den einen Satz ueber dem Formular.
 */
export type FormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };
