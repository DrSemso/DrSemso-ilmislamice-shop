import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-data";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav email={admin.email} demo={admin.demo} />
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">
        {admin.demo && (
          <p className="mb-6 rounded-[3px] bg-accent/15 px-4 py-2.5 text-[13.5px]">
            Demo režim: prikazani su primjeri. Dodavanje i izmjene rade kad se poveže baza.
          </p>
        )}
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </div>
    </div>
  );
}
