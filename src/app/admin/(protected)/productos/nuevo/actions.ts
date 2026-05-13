"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type ProductCreateFormState = {
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
    cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
  } else if (hasDot) {
    const parts = cleanValue.split(".");
    const lastPart = parts[parts.length - 1];

    if (lastPart.length === 3 && parts.length > 1) {
      cleanValue = cleanValue.replace(/\./g, "");
    }
  }

  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return "INVALID_PRICE";
  }

  if (numberValue > 9999999999.99) {
    return "PRICE_TOO_HIGH";
  }

  return numberValue.toFixed(2);
}

async function createUniqueSlug(baseSlug: string) {
  let slug = baseSlug || "producto";
  let suffix = 2;

  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureUniqueCode(code: string | null) {
  if (!code) return true;

  const existingProduct = await prisma.product.findUnique({
    where: {
      code,
    },
    select: {
      id: true,
    },
  });

  return !existingProduct;
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

export async function createProduct(
  _previousState: ProductCreateFormState,
  formData: FormData,
): Promise<ProductCreateFormState> {
  await requireAdmin();

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
      error: "El nombre del producto es obligatorio.",
    };
  }

  const baseSlug = slugify(requestedSlug || name);

  if (!baseSlug) {
    return {
      error: "No se pudo generar una URL válida para el producto.",
    };
  }

  const parsedPrice = parsePrice(priceInput);

  if (parsedPrice === "INVALID_PRICE") {
    return {
      error: "El precio ingresado no es válido.",
    };
  }

  if (parsedPrice === "PRICE_TOO_HIGH") {
    return {
      error: "El precio ingresado es demasiado alto.",
    };
  }

  const codeIsAvailable = await ensureUniqueCode(code);

  if (!codeIsAvailable) {
    return {
      error: "Ya existe otro producto con ese código.",
    };
  }

  const categoryIsValid = await validateCategory(categoryId);

  if (!categoryIsValid) {
    return {
      error: "La categoría seleccionada no existe.",
    };
  }

  const subcategoryIsValid = await validateSubcategory(subcategoryId);

  if (!subcategoryIsValid) {
    return {
      error: "La subcategoría seleccionada no existe.",
    };
  }

  const brandIsValid = await validateBrand(brandId);

  if (!brandIsValid) {
    return {
      error: "La marca seleccionada no existe.",
    };
  }

  const slug = await createUniqueSlug(baseSlug);

  const product = await prisma.product.create({
    data: {
      name,
      code,
      slug,
      price: parsedPrice,
      descriptionShort:
        descriptionShort ||
        `${name}. Producto disponible en Credifer para consultar financiación por WhatsApp.`,
      descriptionLong:
        descriptionLong ||
        `${name}. Producto disponible en Credifer. El precio publicado corresponde a precio contado; cuotas, promociones y condiciones se coordinan por WhatsApp.`,
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
    select: {
      id: true,
    },
  });

  redirect(`/admin/productos/${product.id}/editar`);
}
