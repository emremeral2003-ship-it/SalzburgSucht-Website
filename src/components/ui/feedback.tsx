import type { ReactNode } from "react";

import { Check, Info } from "@/components/icons";

/** Bestaetigung nach einem erfolgreich abgeschickten Formular. */
export function SuccessMessage({
  titel,
  children,
}: {
  titel: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-card border border-primary bg-primary-soft p-6 sm:p-8"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-primary-dark">
        <Check className="size-6 text-white" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-ink">{titel}</h3>
      {children ? (
        <div className="mt-2 leading-relaxed text-ink">{children}</div>
      ) : null}
    </div>
  );
}

/** Meldung ueber dem Formular — Erfolg oder ein allgemeines Problem. */
export function FormMessage({ art, children }: { art: "ok" | "fehler"; children: ReactNode }) {
  const ok = art === "ok";
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`rounded-lg border px-4 py-3 text-[0.9375rem] leading-relaxed ${
        ok
          ? "border-primary bg-primary-soft text-ink"
          : "border-red-300 bg-red-50 text-red-900"
      }`}
    >
      {children}
    </p>
  );
}

/** Gestalteter Leerzustand statt einer leeren Flaeche. */
export function EmptyState({
  titel,
  text,
  children,
}: {
  titel: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-soft px-6 py-14 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft">
        <Info className="size-6 text-primary-dark" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-ink">{titel}</h3>
      <p className="mx-auto mt-2 max-w-[46ch] leading-relaxed text-muted">{text}</p>
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  );
}
