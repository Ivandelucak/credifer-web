import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { prisma } from "@/lib/prisma";
import { ProductSoftDeleteButton } from "@/components/admin/ProductSoftDeleteButton";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
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

  return (
    <div>
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Editar producto
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              {product.name}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Modificá la información comercial del producto. Los cambios se
              reflejan en la tienda pública.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/productos"
              className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Volver
            </Link>

            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="inline-flex justify-center rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Ver público
            </Link>
            <ProductSoftDeleteButton
              productId={product.id}
              returnTo="/admin/productos"
              label="Eliminar producto"
              className="inline-flex justify-center rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:border-red-300 focus-ring"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProductImagesManager
          productId={product.id}
          productName={product.name}
          images={product.images}
        />
      </div>

      <ProductEditForm
        product={serializedProduct}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
