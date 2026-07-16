import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rivera Perfume House",
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
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" className="dark">
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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar isLoggedIn={!!session} />
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
