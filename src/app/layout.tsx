//src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { CartProvider } from "@/components/cart/CartProvider";
import { Suspense } from "react";
import { NavigationMemory } from "@/components/layout/NavigationMemory";
import { AppShell } from "@/components/layout/AppShell";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>
        <Suspense fallback={null}>
          <NavigationMemory />
        </Suspense>

        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
