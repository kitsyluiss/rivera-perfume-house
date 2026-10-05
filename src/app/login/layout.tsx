import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Login | Rivera Fragrance House",
  description: "Sign in to your Rivera Fragrance House account to track orders and view wholesale rates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
