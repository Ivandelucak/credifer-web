"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

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

function getNumberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));

  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function normalizeBrandKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

async function findSimilarBrandByNormalizedName(
  name: string,
  brandId?: number,
) {
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const normalizedName = normalizeBrandKey(name);

  return (
    brands.find((brand) => {
      if (brandId && brand.id === brandId) {
        return false;
      }

      return normalizeBrandKey(brand.name) === normalizedName;
    }) ?? null
  );
}

function redirectWithMessage(
  type: "success" | "error",
  message: string,
): never {
  const params = new URLSearchParams();

  params.set(type, message);

  redirect(`/admin/marcas?${params.toString()}`);
}

async function createUniqueBrandSlug(baseSlug: string) {
  let slug = baseSlug || "marca";
  let suffix = 2;

  while (true) {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingBrand) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureBrandSlugAvailable({
  slug,
  brandId,
}: {
  slug: string;
  brandId: number;
}) {
  const existingBrand = await prisma.brand.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingBrand && existingBrand.id !== brandId) {
    return false;
  }

  return true;
}

export async function createBrand(formData: FormData) {
  await requireAdmin();

  const name = getStringValue(formData, "name");
  const requestedSlug = getStringValue(formData, "slug");

  if (!name) {
    redirectWithMessage("error", "El nombre de la marca es obligatorio.");
  }

  const baseSlug = slugify(requestedSlug || name);

  if (!baseSlug) {
    redirectWithMessage("error", "No se pudo generar una URL válida.");
  }

  const existingBrandByName = await findSimilarBrandByNormalizedName(name);

  if (existingBrandByName) {
    redirectWithMessage(
      "error",
      `Ya existe una marca similar: ${existingBrandByName.name}.`,
    );
  }

  const slug = await createUniqueBrandSlug(baseSlug);

  await prisma.brand.create({
    data: {
      name,
      slug,
    },
  });

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/nuevo");

  redirectWithMessage("success", "Marca creada correctamente.");
}

export async function updateBrand(formData: FormData) {
  await requireAdmin();

  const brandId = getNumberValue(formData, "brandId");

  if (!brandId) {
    redirectWithMessage("error", "Marca inválida.");
  }

  const currentBrand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!currentBrand) {
    redirectWithMessage("error", "La marca no existe.");
  }

  const name = getStringValue(formData, "name");
  const requestedSlug = getStringValue(formData, "slug");

  if (!name) {
    redirectWithMessage("error", "El nombre de la marca es obligatorio.");
  }

  const slug = slugify(requestedSlug || name);

  if (!slug) {
    redirectWithMessage("error", "No se pudo generar una URL válida.");
  }

  const existingBrandByName = await findSimilarBrandByNormalizedName(
    name,
    brandId,
  );

  if (existingBrandByName) {
    redirectWithMessage(
      "error",
      `Ya existe una marca similar: ${existingBrandByName.name}.`,
    );
  }

  const slugIsAvailable = await ensureBrandSlugAvailable({
    slug,
    brandId,
  });

  if (!slugIsAvailable) {
    redirectWithMessage("error", "Ya existe otra marca con ese slug.");
  }

  await prisma.brand.update({
    where: {
      id: brandId,
    },
    data: {
      name,
      slug,
    },
  });

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/productos");

  redirectWithMessage("success", "Marca actualizada correctamente.");
}
