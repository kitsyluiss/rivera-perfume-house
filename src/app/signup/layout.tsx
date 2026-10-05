import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account | Rivera Fragrance House",
  description: "Join Rivera Fragrance House to access exclusive wholesale pricing and track genuine perfume shipments across the Philippines.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
