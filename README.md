# ILM e-islamic shop

Webshop za islamske knjige: Next.js 15 (App Router) + Supabase (baza, prijava kodom, slike) + Vercel.
Plaćanje isključivo pouzećem, potvrde narudžbi e-mailom (Resend).

**Valute:** cijene se upisuju u dinarima. Posjetioci iz Srbije vide dinare, svi ostali eure (din / 120, npr. 1.800 din = 15,00 €), a u zaglavlju mogu ručno prebaciti din / €. Narudžba se naplaćuje u dinarima ako je dostava u Srbiju, a inače u eurima. Dostava u Srbiji ima fiksnu cijenu, a van Srbije je po dogovoru (prodavnica zove kupca). Kurs, dostava i matična država su u `shop.config.ts` (`currency`, `shipping`).

Bez podešenih ključeva sajt radi u **demo režimu** sa primjerom kataloga (`src/lib/demo-catalog.json`), pa se izgled može pregledati odmah.

## Šta sajt ima

| Dio | Gdje |
|---|---|
| Početna: hero sa CTA, kategorije, novi naslovi, izdvojeno, setovi, popusti, prednosti, česta pitanja | `src/app/(shop)/page.tsx` |
| Meni: Knjige (padajuće podkategorije), Setovi knjiga, Izdavači, Autori, Na popustu | `src/components/header-client.tsx` |
| Kategorija / izdavač / autor / pretraga: filter, sortiranje, stranice | `src/components/catalog.tsx` |
| Stranica proizvoda: cijena, stanje, količina, opis, dodatne informacije, sadržaj seta, srodni naslovi | `src/app/(shop)/proizvod/[slug]` |
| Korpa i narudžba (bez naloga ili sa nalogom), plaćanje pouzećem | `korpa`, `narudzba` |
| Moj račun: prijava kodom sa e-maila, lista narudžbi sa statusom, adresa za dostavu | `src/app/(shop)/nalog` |
| Chat widget: brza pitanja, odgovori iz FAQ-a i kataloga; uz `ANTHROPIC_API_KEY` odgovara AI asistent | `src/components/chat-widget.tsx`, `src/app/api/chat` |
| Admin panel `/admin`: pregled, narudžbe (status + e-mail kupcu), proizvodi sa slikama, setovi, kategorije i podkategorije, izdavači, autori, poruke iz chata | `src/app/admin` |

Sve što je specifično za ovu trgovinu (naziv, kontakt, dostava, meni, tekst na početnoj, FAQ) je u **`src/shop.config.ts`**, a boje u **`src/app/theme.css`** i fontovi u **`src/app/fonts.ts`**.

## Pokretanje lokalno

```bash
npm install
cp .env.example .env.local   # popuniti ključeve (vidi ispod), ili ostaviti prazno za demo
npm run dev                  # http://localhost:3000
```

## Podešavanje (jednom)

### 1. Supabase
1. Napravite projekat na https://supabase.com (region Frankfurt).
2. **SQL Editor** → zalijepite cijeli `supabase/migrations/0001_init.sql` → Run. To pravi tabele, pravila pristupa i bucket `products` za slike.
3. **Authentication → Sign In / Providers → Email**: ostavite uključeno. Prijava ide kodom, lozinke nisu potrebne.
4. **Authentication → Emails**: prvo **Set up SMTP** (Resend: host `smtp.resend.com`, port 465, user `resend`, lozinka = Resend API ključ), jer bez vlastitog SMTP-a šabloni se ne mogu mijenjati. Zatim u **Magic Link** i u **Confirm signup** (novi korisnici dobijaju taj) ubacite kod, npr.
   ```html
   <h2>Vaš kod za prijavu</h2>
   <p style="font-size:28px;letter-spacing:6px"><b>{{ .Token }}</b></p>
   <p>Kod važi 1 sat. Ako niste tražili prijavu, zanemarite ovaj e-mail.</p>
   ```
   Bez `{{ .Token }}` korisnik dobija samo link, a ne kod.
5. **Authentication → URL Configuration**: Site URL = javna adresa sajta.
6. **Project Settings → API**: kopirajte `URL`, `anon` i `service_role` ključ u `.env.local`.
7. (Opciono) primjer kataloga: `node --env-file=.env.local scripts/seed.mjs`.

### 2. Admin pristup
Upišite e-mail vlasnika u `ADMIN_EMAILS` (više adresa odvojiti zarezom). Vlasnik se prijavljuje na `/admin` istim kodom sa e-maila.

### 3. E-mailovi (Resend)
Na https://resend.com dodajte i verifikujte domen trgovine, napravite API ključ → `RESEND_API_KEY`, a `EMAIL_FROM` postavite na adresu sa tog domena. `OWNER_EMAIL` dobija obavijest o svakoj novoj narudžbi i poruci iz chata.

### 4. Vercel
Importujte repo na https://vercel.com, dodajte sve varijable iz `.env.example` (sa pravim vrijednostima, `NEXT_PUBLIC_SITE_URL` = javna adresa sajta) i deploy. Domen se dodaje u Vercel → Domains.

### 5. AI chat (opciono)
`ANTHROPIC_API_KEY` sa https://console.anthropic.com uključuje AI odgovore u chatu. Podrazumijevani model je `claude-opus-5-5`; za niže troškove postavite `CHAT_MODEL=claude-haiku-5-5`. Bez ključa chat odgovara iz FAQ-a i pretrage kataloga.

## Struktura

```
src/shop.config.ts        sve postavke trgovine
src/app/theme.css         boje (tokeni)
src/app/fonts.ts          fontovi (Literata, Hanken Grotesk, Amiri)
src/app/(shop)/           javni dio sajta
src/app/admin/            admin panel + server akcije
src/lib/data.ts           čitanje kataloga (Supabase ili demo)
src/lib/email.ts          e-mailovi narudžbi
supabase/migrations/      šema baze
scripts/                  demo katalog i seed
```
