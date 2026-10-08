import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: `${SITE.name} | Loja de roupas`,
  description: SITE.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`scroll-smooth ${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}