import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized Access | Rivera Fragrance House",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
