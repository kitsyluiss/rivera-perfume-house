# Perfume Inventory

Luxury perfume catalog and inventory dashboard built with Next.js, Supabase, and Tailwind.

## Setup

1. Create a Supabase project.
2. Run the table and storage SQL from the build guide.
3. Add your keys to `.env.local`.
4. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Routes

- `/` public catalog
- `/admin` inventory dashboard

## Notes

- The app uses Supabase server actions for perfume CRUD.
- Auth session refresh is handled through the Next.js proxy layer.
- Fonts and theme tokens are defined in `src/app/globals.css`.