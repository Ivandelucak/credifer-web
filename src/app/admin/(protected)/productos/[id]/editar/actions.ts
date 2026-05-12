"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type ProductEditFormState = {
  success: boolean;
  error: string | null;
};

async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

function getStringValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  return value.length > 0 ? value : null;
}

function getNullableNumber(formData: FormData, key: string) {
  const rawValue = String(formData.get(key) ?? "").trim();

  if (!rawValue) return null;

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function parsePrice(value: string | null) {
  if (!value) return null;

  let cleanValue = value.replace(/\$/g, "").replace(/\s/g, "").trim();

  if (!cleanValue) return null;

  const hasComma = cleanValue.includes(",");
  const hasDot = cleanValue.includes(".");

  if (hasComma && hasDot) {
    cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    cleanValue = cleanValue.replace(",", ".");
  }

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return "INVALID_PRICE";
  }

  return numberValue.toFixed(2);
}

async function ensureUniqueSlug({
  slug,
  productId,
}: {
  slug: string;
  productId: number;
}) {
  const existingProduct = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingProduct && existingProduct.id !== productId) {
    return false;
  }

  return true;
}

async function ensureUniqueCode({
  code,
  productId,
}: {
  code: string | null;
  productId: number;
}) {
  if (!code) return true;

  const existingProduct = await prisma.product.findUnique({
    where: {
      code,
    },
    select: {
      id: true,
    },
  });

  if (existingProduct && existingProduct.id !== productId) {
    return false;
  }

  return true;
}

async function validateCategory(categoryId: number | null) {
  if (!categoryId) return true;

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(category);
}

async function validateSubcategory(subcategoryId: number | null) {
  if (!subcategoryId) return true;

  const subcategory = await prisma.subcategory.findUnique({
    where: {
      id: subcategoryId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(subcategory);
}

async function validateBrand(brandId: number | null) {
  if (!brandId) return true;

  const brand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(brand);
}

export async function updateProduct(
  _previousState: ProductEditFormState,
  formData: FormData,
): Promise<ProductEditFormState> {
  await requireAdmin();

  const productId = Number(formData.get("productId"));

  if (!productId || Number.isNaN(productId)) {
    return {
      success: false,
      error: "Producto inválido.",
    };
  }

  const currentProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!currentProduct) {
    return {
      success: false,
      error: "El producto no existe.",
    };
  }

  const name = getStringValue(formData, "name");
  const code = getStringValue(formData, "code");
  const requestedSlug = getStringValue(formData, "slug");
  const priceInput = getStringValue(formData, "price");

  const descriptionShort = getStringValue(formData, "descriptionShort");
  const descriptionLong = getStringValue(formData, "descriptionLong");

  const categoryId = getNullableNumber(formData, "categoryId");
  const subcategoryId = getNullableNumber(formData, "subcategoryId");
  const brandId = getNullableNumber(formData, "brandId");

  const metaTitle = getStringValue(formData, "metaTitle");
  const metaDescription = getStringValue(formData, "metaDescription");

  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const isOffer = formData.get("isOffer") === "on";

  if (!name) {
    return {
      success: false,
      error: "El nombre del producto es obligatorio.",
    };
  }

  const slug = slugify(requestedSlug || name);

  if (!slug) {
    return {
      success: false,
      error: "No se pudo generar una URL válida para el producto.",
    };
  }

  const parsedPrice = parsePrice(priceInput);

  if (parsedPrice === "INVALID_PRICE") {
    return {
      success: false,
      error: "El precio ingresado no es válido.",
    };
  }

  const slugIsAvailable = await ensureUniqueSlug({
    slug,
    productId,
  });

  if (!slugIsAvailable) {
    return {
      success: false,
      error: "Ya existe otro producto con ese slug/URL.",
    };
  }

  const codeIsAvailable = await ensureUniqueCode({
    code,
    productId,
  });

  if (!codeIsAvailable) {
    return {
      success: false,
      error: "Ya existe otro producto con ese código.",
    };
  }

  const categoryIsValid = await validateCategory(categoryId);

  if (!categoryIsValid) {
    return {
      success: false,
      error: "La categoría seleccionada no existe.",
    };
  }

  const subcategoryIsValid = await validateSubcategory(subcategoryId);

  if (!subcategoryIsValid) {
    return {
      success: false,
      error: "La subcategoría seleccionada no existe.",
    };
  }

  const brandIsValid = await validateBrand(brandId);

  if (!brandIsValid) {
    return {
      success: false,
      error: "La marca seleccionada no existe.",
    };
  }

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name,
      code,
      slug,
      price: parsedPrice,
      descriptionShort,
      descriptionLong,
      categoryId,
      subcategoryId,
      brandId,
      isActive,
      isFeatured,
      isOffer,
      metaTitle: metaTitle || `${name} | Credifer`,
      metaDescription:
        metaDescription ||
        `Consultá por ${name} en Credifer. Precio contado publicado y opciones de financiación por WhatsApp.`,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  revalidatePath("/productos");
  revalidatePath("/categorias");
  revalidatePath("/ofertas");
  revalidatePath(`/producto/${currentProduct.slug}`);
  revalidatePath(`/producto/${slug}`);

  if (currentProduct.category?.slug) {
    revalidatePath(`/${currentProduct.category.slug}`);
  }

  return {
    success: true,
    error: null,
  };
}
