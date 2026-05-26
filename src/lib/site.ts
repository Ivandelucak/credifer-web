const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.NODE_ENV === "production"
    ? "https://tienda.credifer.com.ar"
    : "http://localhost:3000");

export const siteConfig = {
  name: "Credifer",
  url: siteUrl,
  description:
    "Catálogo online de Credifer. Consultá productos, cuotas, financiación, disponibilidad y entrega.",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492216920251",
  whatsappMessage:
    "Hola Credifer, quiero consultar por productos de la tienda online.",
  navItems: [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Productos",
      href: "/productos",
    },
    {
      label: "Categorías",
      href: "/categorias",
    },
    {
      label: "Cómo comprar",
      href: "/como-comprar",
    },
    {
      label: "Contacto",
      href: "/contacto",
    },
  ],
};
