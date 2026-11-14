import { Amiri, Hanken_Grotesk, Literata } from "next/font/google";

export const headFont = Literata({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-head",
  display: "swap",
});

export const bodyFont = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const arabicFont = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-ar",
  display: "swap",
});
