"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function getSafeReturnTo(returnTo: FormDataEntryValue | null) {
  const value = String(returnTo ?? "/admin/productos");

  if (!value.startsWith("/admin/productos")) {
    return "/admin/productos";
  }

  return value;
}

async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();

  const productId = Number(formData.get("productId"));
  const nextValue = String(formData.get("nextValue")) === "true";
  const returnTo = getSafeReturnTo(formData.get("returnTo"));

  if (!productId || Number.isNaN(productId)) {
    redirect(returnTo);
  }

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive: nextValue,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");

  redirect(returnTo);
}

export async function toggleProductFeatured(formData: FormData) {
  await requireAdmin();

  const productId = Number(formData.get("productId"));
  const nextValue = String(formData.get("nextValue")) === "true";
  const returnTo = getSafeReturnTo(formData.get("returnTo"));

  if (!productId || Number.isNaN(productId)) {
    redirect(returnTo);
  }

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isFeatured: nextValue,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");

  redirect(returnTo);
}

export async function toggleProductOffer(formData: FormData) {
  await requireAdmin();

  const productId = Number(formData.get("productId"));
  const nextValue = String(formData.get("nextValue")) === "true";
  const returnTo = getSafeReturnTo(formData.get("returnTo"));

  if (!productId || Number.isNaN(productId)) {
    redirect(returnTo);
  }

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isOffer: nextValue,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/ofertas");

  redirect(returnTo);
}
