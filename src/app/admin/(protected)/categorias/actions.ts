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

function getPositionValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.floor(value);
}

function redirectWithMessage(
  type: "success" | "error",
  message: string,
): never {
  const params = new URLSearchParams();

  params.set(type, message);

  redirect(`/admin/categorias?${params.toString()}`);
}

async function createUniqueCategorySlug(baseSlug: string) {
  let slug = baseSlug || "categoria";
  let suffix = 2;

  while (true) {
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingCategory) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function createUniqueSubcategorySlug(baseSlug: string) {
  let slug = baseSlug || "subcategoria";
  let suffix = 2;

  while (true) {
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingSubcategory) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureCategorySlugAvailable({
  slug,
  categoryId,
}: {
  slug: string;
  categoryId: number;
}) {
  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingCategory && existingCategory.id !== categoryId) {
    return false;
  }

  return true;
}

async function ensureSubcategorySlugAvailable({
  slug,
  subcategoryId,
}: {
  slug: string;
  subcategoryId: number;
}) {
  const existingSubcategory = await prisma.subcategory.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingSubcategory && existingSubcategory.id !== subcategoryId) {
    return false;
  }

  return true;
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = getStringValue(formData, "name");
  const requestedSlug = getStringValue(formData, "slug");
  const description = getStringValue(formData, "description");
  const position = getPositionValue(formData, "position");
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    redirectWithMessage("error", "El nombre de la categoría es obligatorio.");
  }

  const baseSlug = slugify(requestedSlug || name);

  if (!baseSlug) {
    redirectWithMessage("error", "No se pudo generar una URL válida.");
  }

  const slug = await createUniqueCategorySlug(baseSlug);

  await prisma.category.create({
    data: {
      name,
      slug,
      description,
      position,
      isActive,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath(`/${slug}`);

  redirectWithMessage("success", "Categoría creada correctamente.");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();

  const categoryId = getNumberValue(formData, "categoryId");

  if (!categoryId) {
    redirectWithMessage("error", "Categoría inválida.");
  }

  const currentCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!currentCategory) {
    redirectWithMessage("error", "La categoría no existe.");
  }

  const name = getStringValue(formData, "name");
  const requestedSlug = getStringValue(formData, "slug");
  const description = getStringValue(formData, "description");
  const position = getPositionValue(formData, "position");
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    redirectWithMessage("error", "El nombre de la categoría es obligatorio.");
  }

  const slug = slugify(requestedSlug || name);

  if (!slug) {
    redirectWithMessage("error", "No se pudo generar una URL válida.");
  }

  const slugIsAvailable = await ensureCategorySlugAvailable({
    slug,
    categoryId,
  });

  if (!slugIsAvailable) {
    redirectWithMessage("error", "Ya existe otra categoría con ese slug.");
  }

  await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
      slug,
      description,
      position,
      isActive,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath(`/${currentCategory.slug}`);
  revalidatePath(`/${slug}`);

  redirectWithMessage("success", "Categoría actualizada correctamente.");
}

export async function toggleCategoryActive(formData: FormData) {
  await requireAdmin();

  const categoryId = getNumberValue(formData, "categoryId");
  const nextValue = String(formData.get("nextValue")) === "true";

  if (!categoryId) {
    redirectWithMessage("error", "Categoría inválida.");
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      slug: true,
    },
  });

  if (!category) {
    redirectWithMessage("error", "La categoría no existe.");
  }

  await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      isActive: nextValue,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath(`/${category.slug}`);

  redirectWithMessage(
    "success",
    nextValue
      ? "Categoría activada correctamente."
      : "Categoría ocultada correctamente.",
  );
}

export async function createSubcategory(formData: FormData) {
  await requireAdmin();

  const categoryId = getNumberValue(formData, "categoryId");
  const name = getStringValue(formData, "name");
  const requestedSlug = getStringValue(formData, "slug");
  const description = getStringValue(formData, "description");
  const position = getPositionValue(formData, "position");
  const isActive = formData.get("isActive") === "on";

  if (!categoryId) {
    redirectWithMessage("error", "Seleccioná una categoría válida.");
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!category) {
    redirectWithMessage("error", "La categoría no existe.");
  }

  if (!name) {
    redirectWithMessage(
      "error",
      "El nombre de la subcategoría es obligatorio.",
    );
  }

  const baseSlug = slugify(requestedSlug || name);

  if (!baseSlug) {
    redirectWithMessage("error", "No se pudo generar una URL válida.");
  }

  const slug = await createUniqueSubcategorySlug(baseSlug);

  await prisma.subcategory.create({
    data: {
      name,
      slug,
      description,
      position,
      isActive,
      categoryId,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath(`/${category.slug}`);

  redirectWithMessage("success", "Subcategoría creada correctamente.");
}

export async function updateSubcategory(formData: FormData) {
  await requireAdmin();

  const subcategoryId = getNumberValue(formData, "subcategoryId");
  const categoryId = getNumberValue(formData, "categoryId");

  if (!subcategoryId) {
    redirectWithMessage("error", "Subcategoría inválida.");
  }

  const currentSubcategory = await prisma.subcategory.findUnique({
    where: {
      id: subcategoryId,
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

  if (!currentSubcategory) {
    redirectWithMessage("error", "La subcategoría no existe.");
  }

  const name = getStringValue(formData, "name");
  const requestedSlug = getStringValue(formData, "slug");
  const description = getStringValue(formData, "description");
  const position = getPositionValue(formData, "position");
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    redirectWithMessage(
      "error",
      "El nombre de la subcategoría es obligatorio.",
    );
  }

  const slug = slugify(requestedSlug || name);

  if (!slug) {
    redirectWithMessage("error", "No se pudo generar una URL válida.");
  }

  const slugIsAvailable = await ensureSubcategorySlugAvailable({
    slug,
    subcategoryId,
  });

  if (!slugIsAvailable) {
    redirectWithMessage("error", "Ya existe otra subcategoría con ese slug.");
  }

  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
      },
    });

    if (!categoryExists) {
      redirectWithMessage("error", "La categoría seleccionada no existe.");
    }
  }

  await prisma.subcategory.update({
    where: {
      id: subcategoryId,
    },
    data: {
      name,
      slug,
      description,
      position,
      isActive,
      categoryId,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");

  if (currentSubcategory.category?.slug) {
    revalidatePath(`/${currentSubcategory.category.slug}`);
  }

  redirectWithMessage("success", "Subcategoría actualizada correctamente.");
}

export async function toggleSubcategoryActive(formData: FormData) {
  await requireAdmin();

  const subcategoryId = getNumberValue(formData, "subcategoryId");
  const nextValue = String(formData.get("nextValue")) === "true";

  if (!subcategoryId) {
    redirectWithMessage("error", "Subcategoría inválida.");
  }

  const subcategory = await prisma.subcategory.findUnique({
    where: {
      id: subcategoryId,
    },
    select: {
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!subcategory) {
    redirectWithMessage("error", "La subcategoría no existe.");
  }

  await prisma.subcategory.update({
    where: {
      id: subcategoryId,
    },
    data: {
      isActive: nextValue,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");

  if (subcategory.category?.slug) {
    revalidatePath(`/${subcategory.category.slug}`);
  }

  redirectWithMessage(
    "success",
    nextValue
      ? "Subcategoría activada correctamente."
      : "Subcategoría ocultada correctamente.",
  );
}
