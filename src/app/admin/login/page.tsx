import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    <section className="min-h-screen bg-[#CBD5E1]">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-[460px] overflow-hidden rounded-[2rem] border border-[#8FA2B8] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.16)]">
          <div className="border-b border-[#A9B8C9] bg-[linear-gradient(135deg,#F8FBFE_0%,#EAF4FB_100%)] px-7 py-7">
            <div className="mx-auto flex h-24 w-full max-w-[260px] items-center justify-center rounded-[1.5rem] border border-[#B7CADA] bg-white px-6 shadow-sm">
              <div className="relative h-16 w-44">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  priority
                  sizes="176px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Acceso privado
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Panel administrativo
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Ingresá con tus credenciales para gestionar el catálogo de
              Credifer.
            </p>

            <LoginForm />

            <div className="mt-6 border-t border-[#D6E3EF] pt-5 text-center">
              <Link
                href="/"
                className="rounded-md text-sm font-black text-[var(--brand-blue-dark)] transition hover:text-[var(--brand-blue)] focus-ring"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
