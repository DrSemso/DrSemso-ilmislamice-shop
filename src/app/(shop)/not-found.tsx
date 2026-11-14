import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x max-w-[640px] py-24 text-center">
      <p className="font-arabic text-[56px] leading-none text-accent">٤٠٤</p>
      <h1 className="mt-6 font-serif text-[34px] font-bold">Stranica nije pronađena</h1>
      <p className="mt-3 text-muted">Možda je knjiga uklonjena iz ponude ili je adresa pogrešno upisana.</p>
      <Link href="/knjige" className="btn btn-dark mt-8">Pogledajte knjige</Link>
    </div>
  );
}
