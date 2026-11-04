# PROJECT_CONTEXT.md — Rivera Fragrance House

## 1. Stack & Architecture
- **Framework**: Next.js 16.2.10 (App Router), React 19.2.4
- **Runtime / Hosting**: Cloudflare OpenNext (`@opennextjs/cloudflare`, `wrangler`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), custom gold/luxury palette (`#e1b854`, `#f9d976`)
- **Animations / 3D**: Motion (`motion/react`), Three.js (`three`), React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Lenis smooth scroll
- **Database / Backend**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Google Sheets live inventory sync handler
- **Validation & State**: Zod v4, Sonner toasts

## 2. Routing Structure (`src/app`)
- `/` — Luxury 3D zero-gravity narrative landing page (`NarrativeScroll.tsx`)
- `/catalog` — Real-time searchable/filterable fragrance catalog with currency display
- `/perfumes/[slug]` — Dynamic product showcase with fragrance pyramid, batch verification, and cart actions
- `/collections` — Curated fragrance collections
- `/about` — Brand heritage and Malabon wholesale dossier
- `/atelier` — Craftsmanship, fragrance chemistry, and notes guide
- `/journal` — Fragrance reviews and customer guides
- `/cart` & `/checkout` — Cart overview, checkout flow, and `/checkout/success` thank-you confirmation
- `/login`, `/signup`, `/forgot-password`, `/reset-password` — Supabase authentication
- `/admin` — Protected inventory dashboard, sales recording, flash sale manager, and sheet sync
- `/robots.ts` & `/sitemap.ts` — Dynamic SEO crawlers and indexers
- `/not-found.tsx` — Branded 404 handler with fallback navigation

## 3. Styling Tokens & Themes
- Backgrounds: Luxury Obsidian `#000000`, Glassmorphism `bg-white/[0.03]`, `backdrop-blur-md`
- Accents: Rivera Gold `#e1b854`, gradient `from-[#f9d976] to-[#bd9135]`
- Typography: Display serif / tracking for brand headers, sans for product copy, mono for batch codes and prices
- Mobile Ergonomics: Touch targets $\ge 44\text{px}$, slide-over sheet drawer (`Navbar.tsx`), context-aware sticky bottom bar (`StickyMobileCTA.tsx`), safe-area insets (`env(safe-area-inset-top/bottom)`)

## 4. Key Data & APIs
- Product Feed: Supabase database synced with Google Sheets feed (`src/lib/sheets-feed-handler.ts`)
- Contact & Fulfillment: Direct line, Viber, WhatsApp, Messenger, Malabon Metro Manila hub (`src/lib/contact-channels.ts`)

