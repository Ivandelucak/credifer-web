import path from "node:path";
import { readFile, utils } from "xlsx";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type ExcelRow = Record<string, unknown>;

const EXCEL_PATH = path.join(
  process.cwd(),
  "data",
  "credifer_productos_actualizados_limpios_v2.xlsx",
);

const SHEET_NAME = "Listos_Importar";

const applyChanges = process.argv.includes("--apply");

function asText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeBrandName(value: string) {
  const brand = value.trim();

  if (!brand || brand.toLowerCase() === "sin marca") {
    return "";
  }

  return brand;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  console.log("Archivo:", EXCEL_PATH);
  console.log("Hoja:", SHEET_NAME);
  console.log("Modo:", applyChanges ? "APLICAR CAMBIOS" : "DRY RUN");

  const workbook = readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[SHEET_NAME];

  if (!sheet) {
    throw new Error(`No existe la hoja "${SHEET_NAME}" en el Excel.`);
  }

  const rows = utils.sheet_to_json<ExcelRow>(sheet, {
    defval: null,
  });

  if (rows.length === 0) {
    throw new Error("La hoja Listos_Importar está vacía.");
  }

  const activeCategorySlugs = unique(
    rows.map((row) => slugify(asText(row.categoria))),
  );

  const activeSubcategorySlugs = unique(
    rows.map((row) => slugify(asText(row.subcategoria))),
  );

  const activeBrandSlugs = unique(
    rows.map((row) => slugify(normalizeBrandName(asText(row.marca)))),
  );

  console.log("");
  console.log("Taxonomía vigente según Excel:");
  console.log("Categorías vigentes:", activeCategorySlugs.length);
  console.log("Subcategorías vigentes:", activeSubcategorySlugs.length);
  console.log("Marcas vigentes:", activeBrandSlugs.length);

  const oldSubcategories = await prisma.subcategory.findMany({
    where: {
      slug: {
        notIn: activeSubcategorySlugs,
      },
      products: {
        none: {},
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  });

  const oldCategories = await prisma.category.findMany({
    where: {
      slug: {
        notIn: activeCategorySlugs,
      },
      products: {
        none: {},
      },
      subcategories: {
        none: {},
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  });

  const oldBrands = await prisma.brand.findMany({
    where: {
      slug: {
        notIn: activeBrandSlugs,
      },
      products: {
        none: {},
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  console.log("");
  console.log("Elementos viejos detectados para borrar:");
  console.log("Subcategorías viejas sin productos:", oldSubcategories.length);
  console.log("Categorías viejas sin productos:", oldCategories.length);
  console.log("Marcas viejas sin productos:", oldBrands.length);

  if (oldSubcategories.length > 0) {
    console.log("");
    console.log("Subcategorías a borrar:");
    oldSubcategories.slice(0, 40).forEach((item) => {
      console.log(`- ${item.name} (${item.slug})`);
    });

    if (oldSubcategories.length > 40) {
      console.log(`... y ${oldSubcategories.length - 40} más`);
    }
  }

  if (oldCategories.length > 0) {
    console.log("");
    console.log("Categorías a borrar:");
    oldCategories.slice(0, 40).forEach((item) => {
      console.log(`- ${item.name} (${item.slug})`);
    });

    if (oldCategories.length > 40) {
      console.log(`... y ${oldCategories.length - 40} más`);
    }
  }

  if (oldBrands.length > 0) {
    console.log("");
    console.log("Marcas a borrar:");
    oldBrands.slice(0, 40).forEach((item) => {
      console.log(`- ${item.name} (${item.slug})`);
    });

    if (oldBrands.length > 40) {
      console.log(`... y ${oldBrands.length - 40} más`);
    }
  }

  if (!applyChanges) {
    console.log("");
    console.log("DRY RUN OK. No se modificó la base de datos.");
    console.log("Para aplicar cambios:");
    console.log("npm run catalog:cleanup-taxonomy:apply");
    await prisma.$disconnect();
    return;
  }

  console.log("");
  console.log("Aplicando limpieza...");

  const deletedSubcategories = await prisma.subcategory.deleteMany({
    where: {
      id: {
        in: oldSubcategories.map((item) => item.id),
      },
    },
  });

  const deletedCategories = await prisma.category.deleteMany({
    where: {
      id: {
        in: oldCategories.map((item) => item.id),
      },
    },
  });

  const deletedBrands = await prisma.brand.deleteMany({
    where: {
      id: {
        in: oldBrands.map((item) => item.id),
      },
    },
  });

  console.log("");
  console.log("Limpieza finalizada.");
  console.log("Subcategorías eliminadas:", deletedSubcategories.count);
  console.log("Categorías eliminadas:", deletedCategories.count);
  console.log("Marcas eliminadas:", deletedBrands.count);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("");
  console.error("Error limpiando taxonomía:");
  console.error(error);
  process.exit(1);
});
