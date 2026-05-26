//src/app/acceso/page.tsx
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PREVIEW_COOKIE_NAME = "credifer_preview_access";

type AccessPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

async function unlockPreview(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const expectedPassword = process.env.SITE_PREVIEW_PASSWORD;

  if (!expectedPassword || password !== expectedPassword) {
    redirect(`/acceso?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();

  cookieStore.set(PREVIEW_COOKIE_NAME, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/") ? next : "/");
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const hasError = params.error === "1";

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_100%)] px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
          <div className="border-b border-[#D6E3EF] bg-[var(--catalog-surface-soft)] px-6 py-6">
            <div className="relative h-16 w-40">
              <Image
                src="/brand/logo-credifer.png"
                alt="Credifer"
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Vista privada
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
              Catálogo Credifer en revisión.
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Esta versión todavía no está publicada para acceso general.
              Ingresá la clave de acceso para continuar.
            </p>
          </div>

          <form action={unlockPreview} className="px-6 py-6">
            <input type="hidden" name="next" value={next} />

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Clave de acceso
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Ingresá la clave"
              className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />

            {hasError ? (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                La clave ingresada no es correcta.
              </p>
            ) : null}

            <button
              type="submit"
              className="tap-feedback mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Ingresar al catálogo
            </button>

            <p className="mt-4 text-center text-xs font-bold text-[var(--text-muted)]">
              Acceso temporal para revisión interna.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
