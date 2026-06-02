"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function redirectWithMessage(
  type: "success" | "error",
  message: string,
): never {
  redirect(`/admin/configuracion?${type}=${encodeURIComponent(message)}`);
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createAdminUser(formData: FormData) {
  const session = await requireAdminSession();

  if (!session) {
    redirectWithMessage(
      "error",
      "No tenés permisos para realizar esta acción.",
    );
  }

  const name = normalizeText(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    redirectWithMessage("error", "Completá nombre, email y contraseña.");
  }

  if (password.length < 8) {
    redirectWithMessage(
      "error",
      "La contraseña debe tener al menos 8 caracteres.",
    );
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingAdmin) {
    redirectWithMessage("error", "Ya existe un administrador con ese email.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      isActive: true,
      isOwner: false,
    },
  });

  revalidatePath("/admin/configuracion");
  redirectWithMessage("success", "Administrador creado correctamente.");
}

export async function toggleAdminUserActive(formData: FormData) {
  const session = await requireAdminSession();

  if (!session) {
    redirectWithMessage(
      "error",
      "No tenés permisos para realizar esta acción.",
    );
  }

  const adminId = Number(formData.get("adminId"));

  if (!adminId) {
    redirectWithMessage("error", "Administrador inválido.");
  }

  const currentAdmin = await prisma.adminUser.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      isActive: true,
      isOwner: true,
    },
  });

  if (!currentAdmin || !currentAdmin.isActive) {
    redirectWithMessage("error", "Tu usuario administrador no está activo.");
  }

  const targetAdmin = await prisma.adminUser.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      isOwner: true,
    },
  });

  if (!targetAdmin) {
    redirectWithMessage("error", "No se encontró el administrador.");
  }

  if (targetAdmin.isOwner) {
    redirectWithMessage(
      "error",
      "El administrador principal no puede desactivarse.",
    );
  }

  if (targetAdmin.id === currentAdmin.id) {
    redirectWithMessage(
      "error",
      "No podés desactivar tu propio usuario mientras estás conectado.",
    );
  }

  await prisma.adminUser.update({
    where: {
      id: targetAdmin.id,
    },
    data: {
      isActive: !targetAdmin.isActive,
    },
  });

  revalidatePath("/admin/configuracion");

  redirectWithMessage(
    "success",
    targetAdmin.isActive
      ? "Administrador desactivado correctamente."
      : "Administrador activado correctamente.",
  );
}

export async function updateAdminUserPassword(formData: FormData) {
  const session = await requireAdminSession();

  if (!session) {
    redirectWithMessage(
      "error",
      "No tenés permisos para realizar esta acción.",
    );
  }

  const adminId = Number(formData.get("adminId"));
  const password = String(formData.get("password") ?? "");

  if (!adminId) {
    redirectWithMessage("error", "Administrador inválido.");
  }

  if (password.length < 8) {
    redirectWithMessage(
      "error",
      "La nueva contraseña debe tener al menos 8 caracteres.",
    );
  }

  const currentAdmin = await prisma.adminUser.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      isOwner: true,
      isActive: true,
    },
  });

  if (!currentAdmin || !currentAdmin.isActive) {
    redirectWithMessage("error", "Tu usuario administrador no está activo.");
  }

  const targetAdmin = await prisma.adminUser.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      name: true,
      isOwner: true,
      isActive: true,
    },
  });

  if (!targetAdmin) {
    redirectWithMessage("error", "No se encontró el administrador.");
  }

  const isChangingOwnPassword = currentAdmin.id === targetAdmin.id;

  if (targetAdmin.isOwner && !isChangingOwnPassword) {
    redirectWithMessage(
      "error",
      "La contraseña del administrador principal solo puede cambiarla el propio usuario principal.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.update({
    where: {
      id: targetAdmin.id,
    },
    data: {
      passwordHash,
    },
  });

  revalidatePath("/admin/configuracion");

  redirectWithMessage(
    "success",
    isChangingOwnPassword
      ? "Tu contraseña fue actualizada correctamente."
      : `Contraseña actualizada para ${targetAdmin.name}.`,
  );
}
