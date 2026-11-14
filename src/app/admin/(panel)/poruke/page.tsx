import { adminMessages } from "@/lib/admin-data";
import { toggleMessage } from "@/app/admin/actions";
import { date } from "@/lib/format";

export default async function Page() {
  const messages = await adminMessages();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[32px] font-bold">Poruke iz chata</h1>
      <p className="text-[14.5px] text-muted">Poruke koje su kupci ostavili u chatu uz svoj e-mail. Odgovorite im e-mailom pa označite kao riješeno.</p>
      {messages.length === 0 ? (
        <p className="border border-line bg-paper p-8 text-center text-muted">Nema poruka.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`border border-line bg-paper p-5 ${m.handled ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
                <a href={`mailto:${m.email}`} className="font-semibold link">{m.email}</a>
                <span className="text-muted">{date(m.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-[15px]">{m.message}</p>
              <form action={toggleMessage} className="mt-3">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={String(!m.handled)} />
                <button className="text-[13px] link">{m.handled ? "Vrati u neriješeno" : "Označi kao riješeno"}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
