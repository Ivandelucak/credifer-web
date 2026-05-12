import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";

export const metadata: Metadata = {
  title: {
    default: "Credifer | Catálogo online",
    template: "%s | Credifer",
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: "Credifer | Catálogo online",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "Credifer",
    locale: "es_AR",
    type: "website",
  },
  icons: {
    icon: "/brand/logo-square.png",
    apple: "/brand/icon-512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
