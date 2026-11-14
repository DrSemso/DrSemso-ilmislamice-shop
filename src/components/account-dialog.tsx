"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// "Moj račun" panel modelled on the reference: explains code-based login and that no account is needed to order.
export function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(540px,calc(100%-32px))] rounded-2xl bg-paper p-0 text-ink backdrop:bg-black/50"
    >
      <div className="p-7 sm:p-8">
        <div className="flex items-start justify-between">
          <p className="text-[15px] font-semibold">Moj račun</p>
          <button onClick={onClose} aria-label="Zatvori" className="-mr-2 -mt-2 grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>
        <h2 className="mt-4 font-serif text-[34px] font-bold leading-[1.1]">Vaše narudžbe na jednom mjestu.</h2>
        <p className="mt-4 text-[15.5px] text-ink/80">Prijavite se e-mail adresom koju ste koristili pri naručivanju.</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-ink/80">
          <li>Unesite svoju e-mail adresu.</li>
          <li>Potvrdite prijavu kodom koji dobijete e-mailom.</li>
        </ol>
        <Link href="/nalog" onClick={onClose} className="btn btn-dark mt-6 w-full py-3.5 text-[15px]">
          Otvorite prijavu →
        </Link>
        <p className="mt-3 text-[13px] text-muted">Nije potrebna lozinka.</p>
        <div className="mt-6 rounded-xl bg-surface p-5">
          <p className="font-semibold">Želite samo naručiti knjigu?</p>
          <p className="mt-2 text-[15px] text-ink/80">Možete naručiti i bez prijave.</p>
          <Link href="/knjige" onClick={onClose} className="mt-3 inline-block text-[15px] link">
            Razgledajte knjige →
          </Link>
        </div>
      </div>
    </dialog>
  );
}
