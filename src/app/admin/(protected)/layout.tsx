import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/login/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/admin-auth";

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
    <section className="min-h-screen bg-[var(--catalog-bg)]">
      <header className="sticky top-0 z-50 border-b border-[#C9D6E4] bg-white/92 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#0264A9_0%,#F4C430_34%,#D82128_66%,#25D366_100%)]" />

        <div className="container-page flex min-h-[86px] flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-2xl focus-ring"
              aria-label="Ir al dashboard administrativo"
            >
              <div className="relative h-14 w-28">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  priority
                  sizes="112px"
                  className="object-contain object-left"
                />
              </div>

              <div className="border-l border-[#C9D6E4] pl-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--brand-blue)]">
                  Credifer Admin
                </p>
                <h1 className="mt-0.5 text-lg font-black leading-5 text-[var(--text-primary)]">
                  Panel administrativo
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="tap-feedback inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-4 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Ver tienda
            </Link>

            <div className="hidden h-8 w-px bg-[#C9D6E4] sm:block" />

            <div className="flex items-center gap-3 rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-4 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-blue)] text-xs font-black uppercase text-white">
                {session.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="max-w-[160px] truncate text-sm font-black text-[var(--text-primary)]">
                  {session.name}
                </p>
                <p className="text-[11px] font-bold text-[var(--text-muted)]">
                  Administrador
                </p>
              </div>
            </div>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="tap-feedback inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-4 py-2.5 text-sm font-black text-[var(--text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#E2ECF5] bg-[#F8FBFE]/92">
          <div className="container-page">
            <AdminNav />
          </div>
        </div>
      </header>

      <main className="container-page py-7 lg:py-8">{children}</main>
    </section>
  );
}
