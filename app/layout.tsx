import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emily Campo — Executive Assistant",
  description: "Executive Ops Board — Virtual Assistant portfolio demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
