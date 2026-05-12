import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata: Metadata = {
  title: "Ingresar al admin",
  description: "Acceso al panel administrativo de Credifer.",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[var(--background)]">
      <div className="container-page flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[#0a8bca] p-10 text-white lg:block">
            <div className="rounded-[1.5rem] bg-white p-5">
              <div className="relative h-24 w-56">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  priority
                  sizes="224px"
                  className="object-contain object-left"
                />
              </div>
            </div>

            <h1 className="mt-10 text-4xl font-black leading-tight">
              Panel administrativo Credifer
            </h1>

            <p className="mt-5 text-sm leading-7 text-white/78">
              Gestioná productos, categorías, precios, imágenes y contenido del
              catálogo online.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold">
                Catálogo conectado a MySQL
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold">
                Consulta comercial por WhatsApp
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold">
                Administración interna segura
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="lg:hidden">
              <div className="relative mb-8 h-20 w-48">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  priority
                  sizes="192px"
                  className="object-contain object-left"
                />
              </div>
            </div>

            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Acceso privado
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Ingresar al panel
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              Usá las credenciales de administrador para continuar.
            </p>

            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
