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

const consultationSteps = [
  {
    label: "Revisá",
    text: "Confirmá productos y cantidades.",
  },
  {
    label: "Enviá",
    text: "Mandá la consulta por WhatsApp.",
  },
  {
    label: "Coordiná",
    text: "Credifer confirma cuotas y entrega.",
  },
];

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
      <section className="bg-[var(--catalog-bg)]">
        <div className="container-page py-10 lg:py-14">
          <div className="rounded-[2rem] border border-[#B7CADA] bg-white p-8 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Carrito
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Cargando carrito...
            </h1>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-[var(--catalog-bg)]">
        <div className="container-page py-10 lg:py-14">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_45%,#FFF7D8_100%)] p-8 text-center shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

            <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Consulta Credifer
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
                Tu carrito está vacío
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                Agregá productos al carrito para generar una consulta ordenada
                por WhatsApp con cantidades, precios y links.
              </p>

              <Link
                href="/productos"
                className="tap-feedback mt-8 inline-flex rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Ver productos
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--catalog-bg)]">
      <div className="container-page py-8 lg:py-12">
        <div className="relative mb-7 overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_45%,#FFF7D8_78%,#EAF8EF_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Consulta Credifer
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[var(--text-primary)] lg:text-5xl">
                Revisá tu carrito.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                Ordená los productos seleccionados y enviá la consulta por
                WhatsApp para coordinar cuotas, disponibilidad y entrega.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {consultationSteps.map((step) => (
                <div
                  key={step.label}
                  className="rounded-2xl border border-[#C9D6E4] bg-white/86 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                    {step.label}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-5 text-[var(--text-secondary)]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-[#B7CADA] bg-white/86 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  Productos seleccionados
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                  {itemsCount} producto{itemsCount === 1 ? "" : "s"} en tu
                  consulta.
                </p>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="tap-feedback inline-flex min-h-11 justify-center rounded-2xl border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--text-secondary)] transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
              >
                Vaciar carrito
              </button>
            </div>

            {items.map((item) => {
              const unitPrice = parsePrice(item.price);
              const subtotal = unitPrice * item.quantity;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
                >
                  <div className="grid gap-4 p-4 sm:grid-cols-[128px_1fr] sm:p-5">
                    <Link
                      href={`/producto/${item.slug}`}
                      className="aspect-square overflow-hidden rounded-[1.5rem] border border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)] focus-ring"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--brand-blue-soft)] to-white p-4 text-center">
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[var(--brand-blue)] shadow-sm">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--brand-blue)]">
                            Imagen
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                              <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)]">
                                {item.categoryName}
                              </span>
                            ) : null}

                            {item.brandName ? (
                              <span className="rounded-full bg-[var(--catalog-surface-soft)] px-3 py-1 text-xs font-black text-[var(--text-secondary)] shadow-sm">
                                {item.brandName}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="tap-feedback self-start rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--text-muted)] transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                        <div className="rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Precio contado
                          </p>
                          <p className="mt-1 text-2xl font-black text-[var(--brand-blue-dark)]">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Cantidad
                          </p>

                          <div className="flex w-fit items-center rounded-full border border-[#C9D6E4] bg-white shadow-sm">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              className="tap-feedback flex h-11 w-11 items-center justify-center rounded-l-full text-lg font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue-soft)] focus-ring"
                              aria-label={`Restar unidad de ${item.name}`}
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, Number(event.target.value)),
                                )
                              }
                              className="h-11 w-14 border-x border-[#C9D6E4] text-center text-sm font-black text-[var(--text-primary)] outline-none"
                              aria-label={`Cantidad de ${item.name}`}
                            />

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              className="tap-feedback flex h-11 w-11 items-center justify-center rounded-r-full text-lg font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue-soft)] focus-ring"
                              aria-label={`Sumar unidad de ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-left md:min-w-[150px] md:text-right">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Subtotal
                          </p>
                          <p className="mt-1 text-xl font-black text-[var(--text-primary)]">
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

          <aside className="h-fit rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:sticky lg:top-28 lg:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Resumen
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.02em] text-[var(--text-primary)]">
              Consulta por WhatsApp
            </h2>

            <div className="mt-5 rounded-[1.5rem] border border-[#C9D6E4] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-[var(--text-secondary)]">
                  Productos
                </span>
                <span className="text-sm font-black text-[var(--text-primary)]">
                  {itemsCount}
                </span>
              </div>

              <div className="mt-4 border-t border-[#C9D6E4] pt-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Total contado estimado
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-[var(--brand-blue-dark)]">
                  {formatCurrency(totalAmount)}
                </p>
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
              className="tap-feedback mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-slate-950 shadow-[0_14px_30px_rgba(37,211,102,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 32 32"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M16.04 3.2A12.74 12.74 0 0 0 5.18 22.6L3.6 28.8l6.35-1.52A12.8 12.8 0 1 0 16.04 3.2Zm0 2.33a10.46 10.46 0 1 1-5.32 19.47l-.38-.22-3.77.9.94-3.66-.25-.39A10.46 10.46 0 0 1 16.04 5.53Zm-4.12 4.78c-.23 0-.6.08-.92.43-.31.34-1.2 1.17-1.2 2.84s1.23 3.3 1.4 3.52c.17.23 2.38 3.82 5.87 5.2 2.9 1.14 3.5.92 4.13.86.64-.06 2.05-.84 2.34-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4-.34-.17-2.05-1-2.37-1.12-.31-.12-.54-.17-.77.17-.23.35-.88 1.12-1.08 1.35-.2.23-.4.26-.75.09-.35-.17-1.45-.53-2.76-1.7-1.02-.9-1.71-2.02-1.91-2.36-.2-.35-.02-.54.15-.7.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.9-1.08-2.6-.28-.68-.57-.58-.78-.6h-.65Z" />
              </svg>
              Enviar consulta
            </a>

            <Link
              href="/productos"
              className="tap-feedback mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Seguir agregando productos
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
