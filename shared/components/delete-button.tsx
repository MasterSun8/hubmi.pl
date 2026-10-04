"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type DeleteButtonProps = {
  // Button text, e.g. "Usuń inicjatywę".
  label: string;
  // What disappears, shown in the confirmation, e.g. "inicjatywę „Klub seniora” i jej dopasowania".
  what: string;
  // DELETE endpoint, e.g. /api/solutions/<id>.
  endpoint: string;
  // Where to go once deleted (the list the item came from).
  redirectTo: string;
};

const buttonClass = "cursor-pointer border-0 bg-transparent p-0 text-caption font-medium tracking-label-sm uppercase";

// "Usuń" for admin detail pages: a native confirmation dialog, then DELETE and back to the list.
export function DeleteButton({ label, what, endpoint, redirectTo }: DeleteButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  // The native dialog gives focus trapping, Esc to close and an inert page behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function confirm() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok && response.status !== 404) throw new Error(`Delete failed: ${response.status}`);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Nie udało się usunąć. Spróbuj ponownie.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button type="button" className={`${buttonClass} text-error`} onClick={() => setOpen(true)}>
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        className="m-auto w-[min(520px,calc(100vw-40px))] border-0 bg-surface p-7.5 text-ink shadow-dialog backdrop:bg-overlay hc:border hc:border-line max-sm:p-5"
      >
        <div className="flex flex-col gap-5">
          <h2 id={titleId} className="font-heading text-title text-primary">
            Na pewno usunąć?
          </h2>
          <p>
            Usuniesz {what}. Tego nie da się cofnąć.
          </p>
          {error && (
            <p role="alert" className="text-error">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              className="cursor-pointer border-0 bg-error px-5 py-2.5 text-caption font-medium tracking-label-sm text-on-primary uppercase disabled:opacity-50"
              onClick={() => void confirm()}
              disabled={deleting}
            >
              {deleting ? "Usuwam…" : "Usuń na stałe"}
            </button>
            <button type="button" className={`${buttonClass} text-ink`} onClick={() => setOpen(false)} disabled={deleting}>
              Anuluj
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
