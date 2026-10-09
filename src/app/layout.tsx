import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: `${SITE.name} | Loja de Roupas Exclusiva`,
  description: SITE.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`scroll-smooth ${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white min-h-screen flex flex-col">
        {/* Faixa Superior Promocional */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 text-white text-center py-2 px-4 text-xs font-black tracking-wide shadow-sm">
          🔥 ENTREGA RÁPIDA EM LUANDA | PAGAMENTO NA ENTREGA OU VIA MULTICAIXA EXPRESS
        </div>

        <Header />

        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-200/40 via-amber-100/20 to-transparent blur-3xl" />
          
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-6">
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}