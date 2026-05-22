"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Productos",
    href: "/admin/productos",
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
  },
  {
    label: "Marcas",
    href: "/admin/marcas",
  },
  {
    label: "Importar",
    href: "/admin/importar",
  },
  {
    label: "Configuración",
    href: "/admin/configuracion",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Navegación administrativa"
    >
      {adminNavItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition focus-ring ${
              isActive
                ? "bg-[var(--brand-blue)] text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)]"
                : "border border-transparent text-[var(--text-secondary)] hover:border-[#B7CADA] hover:bg-white hover:text-[var(--brand-blue-dark)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
