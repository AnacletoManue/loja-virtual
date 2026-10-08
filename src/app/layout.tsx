import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} | Loja de roupas`,
  description: SITE.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
