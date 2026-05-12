export const siteConfig = {
  name: "Credifer",
  description:
    "Catálogo online de Credifer. Elegí productos, armá tu carrito y consultá opciones de compra por WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
