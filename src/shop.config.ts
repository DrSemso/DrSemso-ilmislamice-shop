// Everything shop-specific lives here: name, contact, shipping, menu, home copy, FAQ.
// A new shop built from this template starts by editing this file and src/app/theme.css.

export const shop = {
  name: "ILM e-islamic shop",
  shortName: "ILM",
  arabicMark: "العلم",
  tagline: "Islamska literatura na bosanskom jeziku",
  description:
    "Islamske knjige na bosanskom jeziku: tefsir, hadis, akaid, sira, knjige za djecu i setovi knjiga. Plaćanje pouzećem, dostava širom svijeta.",
  locale: "bs-BA",
  currency: "KM",
  contact: {
    email: "info@ilmislamice.com",
    phone: "+387 00 000 000",
    whatsapp: "38700000000", // digits only, used for wa.me links
    instagram: "https://www.instagram.com/ilmislamiceshop_knjige/",
    address: "",
  },
  shipping: {
    price: 7, // flat courier price
    freeFrom: 100, // free shipping above this subtotal; 0 disables
    countries: ["Bosna i Hercegovina", "Srbija", "Crna Gora", "Hrvatska", "Drugo"],
    deliveryTime: "2 do 5 radnih dana",
  },
  announcements: [
    "Plaćanje pouzećem, plaćate kad knjiga stigne",
    "Dostava širom svijeta",
  ],
  nav: [
    { label: "Knjige", href: "/knjige" },
    { label: "Setovi knjiga", href: "/setovi" },
    { label: "Izdavači", href: "/izdavaci" },
    { label: "Autori", href: "/autori" },
  ],
  hero: {
    eyebrow: "Islamska knjižara",
    title: "Znanje koje ostaje.",
    text: "Islamska literatura na bosanskom jeziku, od tefsira i hadisa do knjiga za djecu. Naručite online i platite pouzećem kad knjiga stigne na vašu adresu.",
    primary: { label: "Pogledajte knjige", href: "/knjige" },
    secondary: { label: "Setovi knjiga", href: "/setovi" },
  },
  advantages: [
    { title: "Plaćanje pouzećem", text: "Plaćate kuriru kad paket stigne. Bez kartica i online plaćanja." },
    { title: "Brza dostava", text: "Paket šaljemo u roku od 24 do 48 sati od potvrde narudžbe." },
    { title: "Provjereni izdavači", text: "Samo naslovi poznatih izdavača islamske literature." },
    { title: "Pomoć pri izboru", text: "Pišite nam u chatu ili na WhatsApp i preporučit ćemo knjigu." },
  ],
  faq: [
    {
      q: "Kako mogu naručiti?",
      a: "Dodajte knjige u korpu, kliknite na 'Naruči' i upišite adresu za dostavu. Nalog nije potreban. Na e-mail dobijate potvrdu narudžbe.",
    },
    {
      q: "Kako se plaća?",
      a: "Isključivo pouzećem: iznos plaćate kuriru kad vam paket stigne.",
    },
    {
      q: "Koliko traje dostava?",
      a: "Dostava traje obično 2 do 5 radnih dana od potvrde narudžbe.",
    },
    {
      q: "Koliko košta dostava?",
      a: "Dostava kurirskom službom košta 7 KM, a za narudžbe iznad 100 KM je besplatna.",
    },
    {
      q: "Da li dostavljate u moju zemlju?",
      a: "Dostavljamo u BiH, Srbiju, Crnu Goru i Hrvatsku, a za ostale zemlje nas kontaktirajte pa ćemo dogovoriti dostavu.",
    },
    {
      q: "Mogu li vratiti knjigu?",
      a: "Da, u roku od 14 dana ako knjiga nije oštećena. Javite nam se e-mailom ili na WhatsApp.",
    },
    {
      q: "Kako da pratim narudžbu?",
      a: "Prijavite se na 'Moj račun' e-mail adresom koju ste koristili pri naručivanju i vidjet ćete status svih narudžbi.",
    },
  ],
} as const;

export type Shop = typeof shop;
