import type { Metadata } from "next";
import "./globals.css";
import { arabicFont, bodyFont, headFont } from "./fonts";
import { CartProvider } from "@/components/cart";
import { shop } from "@/shop.config";
import { SITE_URL } from "@/lib/env";
import { currencyScript } from "@/lib/currency-cookie";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${shop.name} | ${shop.tagline}`, template: `%s | ${shop.name}` },
  description: shop.description,
  openGraph: { siteName: shop.name, locale: "bs_BA", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={`${headFont.variable} ${bodyFont.variable} ${arabicFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: currencyScript }} />
      </head>
      <body className="min-h-screen bg-paper text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
