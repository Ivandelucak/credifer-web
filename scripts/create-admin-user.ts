import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

function getArgValue(name: string) {
  const arg = process.argv.find((item) => item.startsWith(`--${name}=`));

  if (!arg) return null;

  return arg.split("=").slice(1).join("=").trim();
}

async function main() {
  const name = getArgValue("name") ?? "Administrador Credifer";
  const email = getArgValue("email")?.toLowerCase();
  const password = getArgValue("password");

  if (!email || !password) {
    throw new Error(
      'Uso: npm run admin:create -- --email=admin@credifer.com --password="TuPassword" --name="Administrador Credifer"',
    );
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: {
      email,
    },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      isActive: true,
    },
  });

  console.log("Usuario administrador creado/actualizado correctamente.");
  console.log(`ID: ${admin.id}`);
  console.log(`Nombre: ${admin.name}`);
  console.log(`Email: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Error creando usuario administrador:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
