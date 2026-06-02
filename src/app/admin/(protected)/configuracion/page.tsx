// src/app/admin/(protected)/configuracion/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import {
  createAdminUser,
  toggleAdminUserActive,
  updateAdminUserPassword,
} from "@/app/admin/(protected)/configuracion/actions";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type AdminSettingsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type SettingsSection = {
  title: string;
  label: string;
  description: string;
  status: string;
  accent: string;
  href?: string;
};

const settingsSections: SettingsSection[] = [
  {
    title: "Datos comerciales",
    label: "Tienda",
    description:
      "WhatsApp principal, mensaje inicial, redes sociales y datos visibles para consultas.",
    status: "Configuración actual desde código",
    accent: "bg-[var(--brand-blue)]",
  },
  {
    title: "Usuarios administradores",
    label: "Seguridad",
    description:
      "Alta, activación, desactivación y cambio de contraseña para usuarios con acceso al panel.",
    status: "Disponible en esta sección",
    accent: "bg-[var(--brand-red)]",
  },
  {
    title: "Catálogo",
    label: "Productos",
    description:
      "Configuraciones vinculadas a productos, visibilidad, imágenes, destacados y ofertas.",
    status: "Gestionado desde secciones específicas",
    accent: "bg-[var(--brand-green)]",
  },
  {
    title: "Excel",
    label: "Exportación",
    description:
      "Descarga de información del catálogo para revisión comercial, productos sin imagen o sin precio.",
    status: "Disponible",
    accent: "bg-[var(--brand-blue)]",
    href: "/admin/importar",
  },
  {
    title: "Legal y privacidad",
    label: "Sitio público",
    description:
      "Información legal, privacidad, condiciones comerciales y revocación/arrepentimiento.",
    status: "Disponible en la tienda",
    accent: "bg-[var(--brand-green)]",
    href: "/legal",
  },
];

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const params = await searchParams;
  const session = await requireAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const [currentAdmin, adminUsers, totalAdmins, activeAdmins, inactiveAdmins] =
    await Promise.all([
      prisma.adminUser.findUnique({
        where: {
          id: session.adminId,
        },
        select: {
          id: true,
          isOwner: true,
          isActive: true,
        },
      }),
      prisma.adminUser.findMany({
        orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          isOwner: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.adminUser.count(),
      prisma.adminUser.count({
        where: {
          isActive: true,
        },
      }),
      prisma.adminUser.count({
        where: {
          isActive: false,
        },
      }),
    ]);
  if (!currentAdmin || !currentAdmin.isActive) {
    redirect("/admin/login");
  }

  const visibleAdminUsers = currentAdmin.isOwner
    ? adminUsers
    : adminUsers.filter((admin) => !admin.isOwner);

  const whatsappNumber = siteConfig.whatsappNumber;
  const whatsappMessage = siteConfig.whatsappMessage;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#8FA2B8] bg-[linear-gradient(135deg,#F8FBFE_0%,#EAF4FB_58%,#FFF7D8_100%)] p-6 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgba(2,100,169,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-[rgba(244,196,48,0.16)] blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Configuración
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)] lg:text-4xl">
            Configuración general del panel
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Centralizá los datos comerciales, usuarios administradores,
            seguridad y configuraciones generales de la tienda.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[#A9B8C9] bg-white/72 p-4 backdrop-blur">
            <p className="text-sm font-black text-[var(--brand-blue-dark)]">
              Estado actual
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              El panel utiliza un único perfil de acceso: administrador. El
              usuario principal queda protegido para evitar dejar el sistema sin
              acceso.
            </p>
          </div>
        </div>
      </section>

      {params.success ? (
        <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {params.success}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
          {params.error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-[1.75rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Usuarios admin
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
            {totalAdmins}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Activos
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-green)]">
            {activeAdmins}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Inactivos
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-red)]">
            {inactiveAdmins}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.75rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          >
            <span
              className={`block h-1.5 w-12 rounded-full ${section.accent}`}
            />

            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
              {section.label}
            </p>

            <h3 className="mt-2 text-xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
              {section.title}
            </h3>

            <p className="mt-3 min-h-[96px] text-sm leading-6 text-[var(--text-secondary)]">
              {section.description}
            </p>

            <div className="mt-5 rounded-2xl border border-[#D6E3EF] bg-[#F4F8FC] px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                {section.status}
              </p>
            </div>

            {section.href ? (
              <Link
                href={section.href}
                className="tap-feedback mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Abrir sección
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-[#A9B8C9] bg-[#E2EAF3] px-5 py-2.5 text-sm font-black text-[#596D84]"
              >
                Informativo
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-[2rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Usuarios administradores
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
            Accesos al panel
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Todos los usuarios creados tienen perfil administrador. El usuario
            principal está protegido y no puede desactivarse desde el panel.
          </p>

          <div className="mt-6 space-y-4">
            {visibleAdminUsers.map((admin) => (
              <article
                key={admin.id}
                className="rounded-[1.5rem] border border-[#A9B8C9] bg-[#F8FBFE] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black text-[#0B3558]">
                        {admin.name}
                      </h4>

                      {admin.isOwner ? (
                        <span className="rounded-full border border-[#B7CADA] bg-[var(--brand-blue-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--brand-blue-dark)]">
                          Principal
                        </span>
                      ) : null}

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
                          admin.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {admin.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="mt-2 break-all text-sm font-bold text-[var(--text-secondary)]">
                      {admin.email}
                    </p>
                  </div>

                  <form action={toggleAdminUserActive}>
                    <input type="hidden" name="adminId" value={admin.id} />

                    <button
                      type="submit"
                      disabled={admin.isOwner}
                      className={`tap-feedback inline-flex min-h-10 w-full items-center justify-center rounded-2xl px-4 py-2 text-xs font-black transition focus-ring lg:w-auto ${
                        admin.isOwner
                          ? "cursor-not-allowed border border-[#A9B8C9] bg-[#E2EAF3] text-[#596D84]"
                          : admin.isActive
                            ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {admin.isOwner
                        ? "Protegido"
                        : admin.isActive
                          ? "Desactivar"
                          : "Activar"}
                    </button>
                  </form>
                </div>

                <form
                  action={updateAdminUserPassword}
                  className="mt-4 grid gap-3 rounded-[1.25rem] border border-[#A9B8C9] bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-end"
                >
                  <input type="hidden" name="adminId" value={admin.id} />

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                      Nueva contraseña
                    </label>

                    <input
                      name="password"
                      type="password"
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="h-11 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="tap-feedback inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
                  >
                    Cambiar clave
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Nuevo administrador
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
            Crear acceso
          </h3>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            El nuevo usuario tendrá acceso administrador completo al panel.
          </p>

          <form action={createAdminUser} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                Nombre
              </label>

              <input
                name="name"
                type="text"
                required
                placeholder="Nombre del administrador"
                className="h-11 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                placeholder="admin@credifer.com.ar"
                className="h-11 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                Contraseña inicial
              </label>

              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="h-11 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />
            </div>

            <button
              type="submit"
              className="tap-feedback inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Crear administrador
            </button>
          </form>

          <div className="mt-5 rounded-[1.35rem] border border-[#A9B8C9] bg-[#FFF7D8] p-4">
            <p className="text-sm font-black text-[#6D5200]">
              No se implementan roles múltiples.
            </p>

            <p className="mt-2 text-xs leading-5 text-[#6D5200]/80">
              Todos los usuarios creados tienen perfil administrador. El usuario
              principal queda protegido por sistema.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-[2rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Perfil de acceso
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
            Un único perfil administrador
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Para este sistema alcanza con un solo tipo de usuario. No se
            implementarán roles múltiples ni permisos parciales.
          </p>

          <div className="mt-6 grid gap-3">
            <article className="rounded-[1.35rem] border border-[#A9B8C9] bg-[#F8FBFE] p-4">
              <h4 className="text-base font-black text-[#0B3558]">
                Administrador
              </h4>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Puede gestionar el catálogo completo, editar productos,
                administrar categorías, marcas, exportar información, crear
                otros administradores y modificar configuraciones del panel.
              </p>
            </article>

            <article className="rounded-[1.35rem] border border-[#A9B8C9] bg-[#F8FBFE] p-4">
              <h4 className="text-base font-black text-[#0B3558]">
                Usuario principal protegido
              </h4>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                El usuario administrador principal del sistema no podrá
                eliminarse ni desactivarse desde el panel para evitar dejar el
                sistema sin acceso.
              </p>
            </article>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Datos actuales
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
            Contacto comercial
          </h3>

          <div className="mt-5 space-y-3">
            <div className="rounded-[1.35rem] border border-[#A9B8C9] bg-[#F8FBFE] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                WhatsApp
              </p>
              <p className="mt-2 break-all text-sm font-black text-[#0B3558]">
                {whatsappNumber}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[#A9B8C9] bg-[#F8FBFE] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                Mensaje inicial
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {whatsappMessage}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#A9B8C9] bg-[#FFF7D8] p-4">
            <p className="text-sm font-black text-[#6D5200]">
              Estos datos hoy vienen desde configuración de código.
            </p>

            <p className="mt-2 text-xs leading-5 text-[#6D5200]/80">
              Más adelante pueden moverse a base de datos para editarlos desde
              el panel.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
