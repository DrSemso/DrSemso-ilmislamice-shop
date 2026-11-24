import localFont from "next/font/local";

// All fonts are self-hosted (OFL, from github.com/google/fonts): Google Fonts now serves some families from
// extension-less URLs that next/font/google can't load, which broke builds. Latin + Latin Extended subsets only;
// Amiri keeps just the Arabic range (it's only used for the العلم mark).

export const headFont = localFont({
  src: "./fonts/Literata-var.woff2", // variable: weight 400-700 (optical size fixed at 12, as Google served it)
  weight: "400 700",
  variable: "--font-head",
  display: "swap",
});

export const bodyFont = localFont({
  src: "./fonts/HankenGrotesk-var.woff2", // variable: weight 100-900
  weight: "100 900",
  variable: "--font-body",
  display: "swap",
});

export const arabicFont = localFont({
  src: [
    { path: "./fonts/Amiri-Regular.woff2", weight: "400" },
    { path: "./fonts/Amiri-Bold.woff2", weight: "700" },
  ],
  variable: "--font-ar",
  display: "swap",
  preload: false,
});
