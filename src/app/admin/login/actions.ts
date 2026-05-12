"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type LoginState = {
  error: string | null;
};

export async function loginAdmin(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Ingresá email y contraseña.",
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      email,
    },
  });

  if (!admin || !admin.isActive) {
    return {
      error: "Las credenciales no son correctas.",
    };
  }

  const passwordIsValid = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordIsValid) {
    return {
      error: "Las credenciales no son correctas.",
    };
  }

  await createAdminSession({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}
