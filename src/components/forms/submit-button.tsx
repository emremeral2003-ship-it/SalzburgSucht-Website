"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

/**
 * Absendeknopf mit Ladezustand.
 *
 * `useFormStatus` liest den Zustand des umgebenden Formulars — deshalb muss
 * das eine eigene Komponente sein und kann nicht im Formular selbst stehen.
 */
export function SubmitButton({ children, laufend }: { children: ReactNode; laufend: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {laufend}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
