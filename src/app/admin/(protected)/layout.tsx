import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/login/actions";
import { getAdminSession } from "@/lib/admin-auth";

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
    label: "Importar",
    href: "/admin/importar",
  },
  {
    label: "Configuración",
    href: "/admin/configuracion",
  },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <section className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="container-page flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Credifer Admin
            </p>
            <h1 className="mt-1 text-xl font-black text-[var(--text-primary)]">
              Panel administrativo
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              {session.name}
            </p>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-black text-[var(--text-secondary)] transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-[var(--border)] bg-white">
        <nav className="container-page flex gap-2 overflow-x-auto py-3">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-black text-[var(--text-secondary)] transition hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-dark)] focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="container-page py-8">{children}</div>
    </section>
  );
}
