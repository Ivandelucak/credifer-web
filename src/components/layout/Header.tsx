import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Header() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage,
  )}`;

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-white/92 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 focus-ring rounded-xl"
        >
          <div className="relative h-14 w-36 sm:w-44">
            <Image
              src="/brand/logo-credifer.png"
              alt="Credifer"
              fill
              sizes="176px"
              className="object-contain object-left"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-(--text-secondary) transition hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-dark)] focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/carrito"
            className="hidden rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring sm:inline-flex"
          >
            Carrito
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--whatsapp)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--whatsapp-dark)] focus-ring"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
