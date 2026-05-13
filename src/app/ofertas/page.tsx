import { ProductCard } from "@/components/products/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      isOffer: true,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      descriptionShort: true,
      isFeatured: true,
      isOffer: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
        select: {
          url: true,
          alt: true,
        },
      },
    },
  });

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-red)]">
          Ofertas
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
          Productos en oferta
        </h1>

        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Productos marcados como oferta en el catálogo. La financiación y
          condiciones se confirman por WhatsApp.
        </p>
      </div>

      {serializedProducts.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            Todavía no hay ofertas cargadas
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Más adelante, desde el panel admin se podrán marcar productos como
            oferta.
          </p>
        </div>
      )}
    </section>
  );
}
