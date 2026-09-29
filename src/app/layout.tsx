import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/actions";
import { Toaster } from "sonner";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rivera Fragrance House",
  description: "Curated luxury fragrances",
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
    profile = session ? await getUserProfile() : null;
  } catch (error) {
    // If auth fails (e.g. on edge environments due to cookie issues), gracefully fall back to unauthenticated state.
    console.error("Auth error in layout:", error);
  }

  const role = profile?.role || 'customer';

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('rivera-preloader-seen') === 'true') {
                  document.documentElement.classList.add('preloader-seen');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 sm:cursor-none">
        <CustomCursor />
        <Navbar isLoggedIn={!!session} role={role} />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(0 0% 9%)",
              border: "1px solid hsl(0 0% 14%)",
              color: "hsl(40 25% 91%)",
              fontFamily: "var(--font-body), serif",
            },
          }}
        />
      </body>
    </html>
  );
}
