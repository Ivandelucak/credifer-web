// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { CartProvider } from "@/components/cart/CartProvider";
import { NavigationMemory } from "@/components/layout/NavigationMemory";
import { AppShell } from "@/components/layout/AppShell";

const siteName = "Credifer";
const siteUrl = siteConfig.url;
const logoUrl = `${siteUrl}/brand/logo-square.png`;
const instagramUrl = "https://www.instagram.com/cell.sur/";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: siteName,
  url: siteUrl,
  logo: logoUrl,
  image: logoUrl,
  description: siteConfig.description,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Buenos Aires, Argentina",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+${siteConfig.whatsappNumber}`,
    contactType: "customer service",
    availableLanguage: "es-AR",
  },
  sameAs: [instagramUrl],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteConfig.description,
  inLanguage: "es-AR",
  publisher: {
    "@type": "Organization",
    name: siteName,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Credifer | Catálogo online",
    template: "%s | Credifer",
  },

  description: siteConfig.description,

  applicationName: siteName,
  generator: "Next.js",

  keywords: [
    "Credifer",
    "catálogo Credifer",
    "productos Credifer",
    "cuotas",
    "financiación",
    "electrodomésticos",
    "celulares",
    "parlantes",
    "herramientas",
    "muebles",
    "La Plata",
    "Berazategui",
    "El Pato",
  ],

  authors: [
    {
      name: siteName,
      url: siteUrl,
    },
  ],

  creator: siteName,
  publisher: siteName,

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    title: "Credifer | Catálogo online",
    description: siteConfig.description,
    url: siteUrl,
    siteName,
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: "Credifer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Credifer | Catálogo online",
    description: siteConfig.description,
    images: [logoUrl],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/brand/logo-square.png",
        type: "image/png",
      },
    ],
    apple: "/brand/icon-512.png",
  },

  category: "shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0264A9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

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
