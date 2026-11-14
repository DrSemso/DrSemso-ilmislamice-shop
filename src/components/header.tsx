import { getCategories } from "@/lib/data";
import { shop } from "@/shop.config";
import { HeaderClient } from "./header-client";
import { CurrencySwitch } from "./currency-switch";

export async function Header() {
  const categories = await getCategories();
  const root = categories.find((c) => c.slug === "knjige");
  const subcats = categories.filter((c) => c.parent_id === root?.id);
  return (
    <>
      <div className="bg-dark text-on-dark">
        <div className="container-x relative flex h-9 items-center justify-start gap-8 md:justify-center overflow-hidden text-[12.5px]">
          {shop.announcements.map((a, i) => (
            <span key={a} className={i > 0 ? "hidden md:inline" : ""}>
              {a}
            </span>
          ))}
          <CurrencySwitch className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6 lg:right-8" />
        </div>
      </div>
      <HeaderClient subcats={subcats.map(({ name, slug }) => ({ name, slug }))} />
    </>
  );
}
