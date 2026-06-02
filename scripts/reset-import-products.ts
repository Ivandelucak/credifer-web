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

function asNullableText(value: unknown) {
  const text = asText(value);

  return text ? text : null;
}

function asBoolean(value: unknown) {
  const text = asText(value).toUpperCase();

  return text === "SI" || text === "SÍ" || text === "TRUE" || text === "1";
}

function asPrice(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalized = String(value)
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
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

function normalizeBrandName(value: string) {
  const brand = value.trim();

  if (!brand || brand.toLowerCase() === "sin marca") {
    return null;
  }

  return brand;
}

function splitImages(value: unknown) {
  const text = asText(value);

  if (!text) return [];

  return text
    .split(/[;,|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRequired(row: ExcelRow, key: string, rowNumber: number) {
  const value = asText(row[key]);

  if (!value) {
    throw new Error(`Fila ${rowNumber}: falta el campo obligatorio "${key}".`);
  }

  return value;
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
    throw new Error("La hoja Listos_Importar no tiene productos.");
  }

  const normalizedRows = rows.map((row, index) => {
    const rowNumber = index + 2;

    const name = getRequired(row, "nombre", rowNumber);
    const slugFromExcel = asText(row.slug);
    const categoryName = getRequired(row, "categoria", rowNumber);
    const subcategoryName = asText(row.subcategoria);
    const brandName = normalizeBrandName(asText(row.marca));
    const price = asPrice(row.precio_contado);

    return {
      rowNumber,
      code: asNullableText(row.codigo_importacion),
      name,
      slug: slugFromExcel || slugify(name),
      categoryName,
      categorySlug: slugify(categoryName),
      subcategoryName: subcategoryName || null,
      subcategorySlug: subcategoryName ? slugify(subcategoryName) : null,
      brandName,
      brandSlug: brandName ? slugify(brandName) : null,
      price,
      descriptionShort: asNullableText(row.descripcion_corta),
      descriptionLong: asNullableText(row.descripcion_larga),
      isActive: asBoolean(row.activo),
      isFeatured: asBoolean(row.destacado),
      isOffer: false,
      metaTitle: name,
      metaDescription: asNullableText(row.descripcion_corta),
      mainImage: asNullableText(row.imagen_principal),
      extraImages: splitImages(row.imagenes_extra),
      requiresReview: asBoolean(row.requiere_revision),
      reviewReason: asNullableText(row.motivo_revision),
    };
  });

  const duplicatedSlugs = normalizedRows
    .map((row) => row.slug)
    .filter((slug, index, array) => array.indexOf(slug) !== index);

  if (duplicatedSlugs.length > 0) {
    throw new Error(
      `Hay slugs duplicados en el Excel: ${[...new Set(duplicatedSlugs)].join(
        ", ",
      )}`,
    );
  }

  const categories = new Map<string, string>();
  const subcategories = new Map<
    string,
    {
      name: string;
      slug: string;
      categorySlug: string;
    }
  >();
  const brands = new Map<string, string>();

  for (const row of normalizedRows) {
    categories.set(row.categorySlug, row.categoryName);

    if (row.subcategoryName && row.subcategorySlug) {
      subcategories.set(row.subcategorySlug, {
        name: row.subcategoryName,
        slug: row.subcategorySlug,
        categorySlug: row.categorySlug,
      });
    }

    if (row.brandName && row.brandSlug) {
      brands.set(row.brandSlug, row.brandName);
    }
  }

  console.log("Productos a importar:", normalizedRows.length);
  console.log("Categorías detectadas:", categories.size);
  console.log("Subcategorías detectadas:", subcategories.size);
  console.log("Marcas detectadas:", brands.size);
  console.log(
    "Productos con revisión pendiente:",
    normalizedRows.filter((row) => row.requiresReview).length,
  );

  if (!applyChanges) {
    console.log("");
    console.log("DRY RUN OK. No se modificó la base de datos.");
    console.log("Para aplicar cambios:");
    console.log("npm run catalog:reset-import -- --apply");
    return;
  }

  console.log("");
  console.log("Aplicando reset de catálogo...");

  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  console.log("Productos e imágenes anteriores eliminados.");

  const categoryBySlug = new Map<string, number>();

  let categoryPosition = 0;

  for (const [slug, name] of categories.entries()) {
    const category = await prisma.category.upsert({
      where: {
        slug,
      },
      update: {
        name,
        isActive: true,
      },
      create: {
        name,
        slug,
        description: null,
        position: categoryPosition,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    categoryBySlug.set(slug, category.id);
    categoryPosition += 1;
  }

  await prisma.category.updateMany({
    where: {
      slug: {
        notIn: [...categories.keys()],
      },
    },
    data: {
      isActive: false,
    },
  });

  const subcategoryBySlug = new Map<string, number>();

  let subcategoryPosition = 0;

  for (const subcategoryData of subcategories.values()) {
    const categoryId = categoryBySlug.get(subcategoryData.categorySlug);

    if (!categoryId) {
      throw new Error(
        `No se encontró categoría para subcategoría ${subcategoryData.name}`,
      );
    }

    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        slug: subcategoryData.slug,
      },
      select: {
        id: true,
      },
    });

    const subcategory = existingSubcategory
      ? await prisma.subcategory.update({
          where: {
            id: existingSubcategory.id,
          },
          data: {
            name: subcategoryData.name,
            slug: subcategoryData.slug,
            categoryId,
            isActive: true,
          },
          select: {
            id: true,
          },
        })
      : await prisma.subcategory.create({
          data: {
            name: subcategoryData.name,
            slug: subcategoryData.slug,
            description: null,
            position: subcategoryPosition,
            categoryId,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

    subcategoryBySlug.set(subcategoryData.slug, subcategory.id);
    subcategoryPosition += 1;
  }

  await prisma.subcategory.updateMany({
    where: {
      slug: {
        notIn: [...subcategories.keys()],
      },
    },
    data: {
      isActive: false,
    },
  });

  const brandBySlug = new Map<string, number>();

  for (const [slug, name] of brands.entries()) {
    const brand = await prisma.brand.upsert({
      where: {
        slug,
      },
      update: {
        name,
      },
      create: {
        name,
        slug,
      },
      select: {
        id: true,
      },
    });

    brandBySlug.set(slug, brand.id);
  }

  let createdProducts = 0;
  let createdImages = 0;

  for (const row of normalizedRows) {
    const categoryId = categoryBySlug.get(row.categorySlug);
    const subcategoryId = row.subcategorySlug
      ? (subcategoryBySlug.get(row.subcategorySlug) ?? null)
      : null;
    const brandId = row.brandSlug
      ? (brandBySlug.get(row.brandSlug) ?? null)
      : null;

    if (!categoryId) {
      throw new Error(`Fila ${row.rowNumber}: categoría inexistente.`);
    }

    const product = await prisma.product.create({
      data: {
        code: row.code,
        name: row.name,
        slug: row.slug,
        price: row.price,
        descriptionShort: row.descriptionShort,
        descriptionLong: row.descriptionLong,
        categoryId,
        subcategoryId,
        brandId,
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        isOffer: row.isOffer,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    createdProducts += 1;

    const images = [
      ...(row.mainImage ? [row.mainImage] : []),
      ...row.extraImages,
    ];

    for (const [index, imageUrl] of images.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: row.name,
          position: index,
        },
      });

      createdImages += 1;
    }
  }

  console.log("");
  console.log("Importación finalizada.");
  console.log("Productos creados:", createdProducts);
  console.log("Imágenes creadas:", createdImages);
  console.log("Categorías activas:", categories.size);
  console.log("Subcategorías activas:", subcategories.size);
  console.log("Marcas procesadas:", brands.size);
}

main().catch((error) => {
  console.error("");
  console.error("Error importando catálogo:");
  console.error(error);
  process.exit(1);
});
