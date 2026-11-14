import { getCategories } from "@/lib/data";
import { shop } from "@/shop.config";
import { HeaderClient } from "./header-client";

export async function Header() {
  const categories = await getCategories();
  const root = categories.find((c) => c.slug === "knjige");
  const subcats = categories.filter((c) => c.parent_id === root?.id);
  return (
    <>
      <div className="bg-dark text-on-dark">
        <div className="container-x flex h-9 items-center justify-center gap-8 overflow-hidden text-[12.5px]">
          {shop.announcements.map((a, i) => (
            <span key={a} className={i > 0 ? "hidden md:inline" : ""}>
              {a}
            </span>
          ))}
        </div>
      </div>
      <HeaderClient subcats={subcats.map(({ name, slug }) => ({ name, slug }))} />
    </>
  );
}
