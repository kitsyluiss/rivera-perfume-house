import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password | Rivera Fragrance House",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
