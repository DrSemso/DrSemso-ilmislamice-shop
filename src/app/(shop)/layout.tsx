import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";
import { isDemo } from "@/lib/env";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {isDemo && (
        <div className="bg-accent px-4 py-1.5 text-center text-[12px] font-medium text-accent-ink">
          Demo režim: prikazan je primjer kataloga dok se ne poveže baza.
        </div>
      )}
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
