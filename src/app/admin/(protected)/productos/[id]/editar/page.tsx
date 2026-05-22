//src/app/admin/(protected)/productos/[id]/editar/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { prisma } from "@/lib/prisma";
import { ProductSoftDeleteButton } from "@/components/admin/ProductSoftDeleteButton";
import { formatCurrency } from "@/lib/formatters";
import { BackButton } from "@/components/layout/BackButton";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const productsReturnHref = resolvedSearchParams.returnTo?.startsWith(
    "/admin/productos",
  )
    ? resolvedSearchParams.returnTo
    : "/admin/productos";
  const productId = Number(id);

  if (!productId || Number.isNaN(productId)) {
    notFound();
  }

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        price: true,
        descriptionShort: true,
        descriptionLong: true,
        categoryId: true,
        subcategoryId: true,
        brandId: true,
        isActive: true,
        isFeatured: true,
        isOffer: true,
        metaTitle: true,
        metaDescription: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
          select: {
            id: true,
            url: true,
            alt: true,
            position: true,
            isPrimary: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: [{ position: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    id: product.id,
    code: product.code,
    name: product.name,
    slug: product.slug,
    price: product.price ? product.price.toString() : null,
    descriptionShort: product.descriptionShort,
    descriptionLong: product.descriptionLong,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    brandId: product.brandId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isOffer: product.isOffer,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  };
  const priceLabel = formatCurrency(
    product.price ? product.price.toString() : null,
  );

  const productStatusLabel = product.isActive ? "Activo" : "Oculto";
  const productStatusClassName = product.isActive
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-red-200 bg-red-50 text-red-700";

  const imagesCount = product.images.length;

  return (
    <div className="space-y-7">
      <div>
        <BackButton
          fallbackHref={productsReturnHref}
          label="Volver a productos"
        />
      </div>
      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Editar producto
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-primary)] lg:text-5xl">
              {product.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base lg:leading-7">
              Actualizá la información principal del producto, sus imágenes,
              precio, organización y estado dentro de la tienda.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-black ${productStatusClassName}`}
              >
                {productStatusLabel}
              </span>

              {product.isFeatured ? (
                <span className="rounded-full border border-[#F4C430]/70 bg-[#FFF3B8] px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                  Destacado
                </span>
              ) : null}

              {product.isOffer ? (
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-[var(--brand-red)]">
                  Oferta
                </span>
              ) : null}

              <span className="rounded-full border border-[#B7CADA] bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                {priceLabel}
              </span>

              <span className="rounded-full border border-[#B7CADA] bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                {imagesCount} imagen{imagesCount === 1 ? "" : "es"}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="tap-feedback inline-flex min-h-12 min-w-[145px] items-center justify-center whitespace-nowrap rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-center text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Ver en tienda
            </Link>

            <ProductSoftDeleteButton
              productId={product.id}
              returnTo={productsReturnHref}
              productName={product.name}
              label="Eliminar"
              className="tap-feedback inline-flex min-h-12 min-w-[130px] items-center justify-center whitespace-nowrap rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-black text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 focus-ring"
            />
          </div>
        </div>
      </section>

      <ProductImagesManager
        productId={product.id}
        productName={product.name}
        images={product.images}
      />

      <ProductEditForm
        product={serializedProduct}
        categories={categories}
        brands={brands}
        returnHref={productsReturnHref}
      />
    </div>
  );
}
