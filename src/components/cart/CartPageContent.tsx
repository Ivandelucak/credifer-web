"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatCurrency } from "@/lib/formatters";
import { siteConfig } from "@/lib/site";

function parsePrice(price: string | null): number {
  if (!price) return 0;

  const value = Number(price);

  return Number.isFinite(value) ? value : 0;
}

function getProductUrl(slug: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/producto/${slug}`;
  }

  return `${siteConfig.url}/producto/${slug}`;
}

export function CartPageContent() {
  const {
    items,
    isHydrated,
    itemsCount,
    totalAmount,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
  } = useCart();

  const whatsappUrl = useMemo(() => {
    const lines = [
      "Hola Credifer, quiero consultar por estos productos:",
      "",
      ...items.flatMap((item, index) => {
        const unitPrice = parsePrice(item.price);
        const subtotal = unitPrice * item.quantity;

        return [
          `${index + 1}) ${item.name}`,
          item.brandName ? `Marca: ${item.brandName}` : null,
          item.categoryName ? `Categoría: ${item.categoryName}` : null,
          `Cantidad: ${item.quantity}`,
          `Precio contado unitario: ${formatCurrency(item.price)}`,
          `Subtotal contado: ${formatCurrency(subtotal)}`,
          `Link: ${getProductUrl(item.slug)}`,
          "",
        ].filter(Boolean) as string[];
      }),
      `Total contado estimado: ${formatCurrency(totalAmount)}`,
      "",
      "Quisiera saber opciones de cuotas, disponibilidad y entrega.",
    ];

    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
      lines.join("\n"),
    )}`;
  }, [items, totalAmount]);

  if (!isHydrated) {
    return (
      <section className="container-page py-10 lg:py-14">
        <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Carrito
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Cargando carrito...
          </h1>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="container-page py-10 lg:py-14">
        <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 text-center shadow-sm lg:p-12">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Consulta
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Tu carrito está vacío
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            Agregá productos al carrito para generar una consulta ordenada por
            WhatsApp con cantidades, precios y links.
          </p>

          <Link
            href="/productos"
            className="mt-8 inline-flex rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
          >
            Ver productos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="mb-8 rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Consulta
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
              Carrito
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Revisá los productos seleccionados y enviá la consulta por
              WhatsApp para coordinar cuotas, disponibilidad y entrega.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-black text-[var(--text-secondary)] transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
          >
            Vaciar carrito
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => {
            const unitPrice = parsePrice(item.price);
            const subtotal = unitPrice * item.quantity;

            return (
              <article
                key={item.id}
                className="grid gap-4 rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr] sm:p-5"
              >
                <Link
                  href={`/producto/${item.slug}`}
                  className="aspect-square overflow-hidden rounded-2xl bg-[var(--surface-muted)] focus-ring"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-blue-soft)] to-white">
                      <span className="text-4xl font-black text-[var(--brand-blue)]">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>

                <div className="min-w-0">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <Link
                        href={`/producto/${item.slug}`}
                        className="focus-ring rounded-xl"
                      >
                        <h2 className="text-lg font-black leading-6 text-[var(--text-primary)] transition hover:text-[var(--brand-blue)]">
                          {item.name}
                        </h2>
                      </Link>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.categoryName ? (
                          <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-blue-dark)]">
                            {item.categoryName}
                          </span>
                        ) : null}

                        {item.brandName ? (
                          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                            {item.brandName}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="self-start rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-black text-[var(--text-muted)] transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        Precio contado
                      </p>
                      <p className="mt-1 text-2xl font-black text-[var(--brand-blue-dark)]">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center rounded-full border border-[var(--border)] bg-white">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-l-full text-lg font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue-soft)] focus-ring"
                          aria-label={`Restar unidad de ${item.name}`}
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(item.id, Number(event.target.value))
                          }
                          className="h-10 w-14 border-x border-[var(--border)] text-center text-sm font-black text-[var(--text-primary)] outline-none"
                          aria-label={`Cantidad de ${item.name}`}
                        />

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-r-full text-lg font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue-soft)] focus-ring"
                          aria-label={`Sumar unidad de ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Subtotal
                        </p>
                        <p className="mt-1 text-lg font-black text-[var(--text-primary)]">
                          {formatCurrency(subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Resumen
          </p>

          <h2 className="mt-3 text-2xl font-black text-[var(--text-primary)]">
            Consulta por WhatsApp
          </h2>

          <div className="mt-6 space-y-4 border-y border-[var(--border)] py-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-[var(--text-secondary)]">
                Productos
              </span>
              <span className="text-sm font-black text-[var(--text-primary)]">
                {itemsCount}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-[var(--text-secondary)]">
                Total contado estimado
              </span>
              <span className="text-xl font-black text-[var(--brand-blue-dark)]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
            El total es orientativo según los precios contado publicados. La
            financiación, cuotas, promociones, disponibilidad y entrega se
            confirman con el vendedor.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--whatsapp-dark)] focus-ring"
          >
            Enviar consulta por WhatsApp
          </a>

          <Link
            href="/productos"
            className="mt-3 inline-flex w-full justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Seguir agregando productos
          </Link>
        </aside>
      </div>
    </section>
  );
}
