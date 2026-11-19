import type { Metadata } from "next";
import { shop } from "@/shop.config";
import { SITE_URL } from "./env";

type SP = Record<string, string | string[] | undefined>;

/**
 * Canonical URL and title suffix for a listing page. Sorting and filters point back to the plain page,
 * so Google sees one URL per list; page 2, 3… keep their own URL and get "– strana N" in the title.
 */
export function listingMeta(path: string, title: string, sp: SP, description?: string | null): Metadata {
  const page = Math.max(1, Number(sp.strana) || 1);
  const canonical = page > 1 ? `${path}?strana=${page}` : path;
  const fullTitle = page > 1 ? `${title}, strana ${page}` : title;
  return {
    title: fullTitle,
    description: description ?? undefined,
    alternates: { canonical },
    openGraph: { title: fullTitle, url: canonical, description: description ?? undefined },
  };
}

/** Shop-wide structured data: the store itself and the site search box. */
export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BookStore",
      "@id": `${SITE_URL}/#store`,
      name: shop.name,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-badge.png`,
      description: shop.description,
      email: shop.contact.email,
      telephone: shop.contact.phone,
      address: { "@type": "PostalAddress", addressLocality: "Novi Pazar", addressCountry: "RS" },
      paymentAccepted: "Cash on delivery",
      currenciesAccepted: "RSD, EUR",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: shop.name,
      url: SITE_URL,
      inLanguage: "bs",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/pretraga?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${SITE_URL}${it.path}` } : {}),
    })),
  };
}
