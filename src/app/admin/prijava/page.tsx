import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { isDemo } from "@/lib/env";

export const metadata: Metadata = { title: "Admin prijava", robots: { index: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4">
      <div className="w-full max-w-[420px] border border-line bg-paper p-8">
        <Logo />
        <h1 className="mt-8 font-serif text-[26px] font-bold">Admin panel</h1>
        {"nema-pristupa" in sp ? (
          <p className="mt-2 rounded-[3px] bg-danger/10 p-3 text-[14px] text-danger">
            Ovaj e-mail nema administratorski pristup. Prijavite se e-mailom vlasnika trgovine.
          </p>
        ) : (
          <p className="mt-2 text-[14.5px] text-muted">Prijavite se e-mailom vlasnika. Kod stiže na e-mail.</p>
        )}
        <div className="mt-6"><LoginForm next="/admin" demo={isDemo} /></div>
        <Link href="/" className="mt-6 inline-block text-[13px] link">← Nazad na trgovinu</Link>
      </div>
    </div>
  );
}
