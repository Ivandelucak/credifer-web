import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";

const EXCEL_PATH = path.join(
  process.cwd(),
  "data",
  "import",
  "credifer_productos.xlsx",
);

type ExcelRow = Record<string, unknown>;

type NormalizedProduct = {
  code: string | null;
  name: string;
  slug: string;
  categoryName: string | null;
  subcategoryName: string | null;
  brandName: string | null;
  price: string | null;
  descriptionShort: string | null;
  descriptionLong: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isOffer: boolean;
};

const headerAliases = {
  code: ["codigo", "código", "code", "sku", "id_producto", "id producto"],
  name: ["nombre", "producto", "name", "titulo", "título"],
  slug: ["slug", "url", "link"],
  category: ["categoria", "categoría", "category", "rubro"],
  subcategory: ["subcategoria", "subcategoría", "subcategory", "subrubro"],
  brand: ["marca", "brand"],
  price: [
    "precio_contado",
    "precio contado",
    "precio",
    "costo",
    "costó",
    "valor",
  ],
  descriptionShort: [
    "descripcion_corta",
    "descripción corta",
    "descripcion corta",
    "description_short",
    "descripcion",
    "descripción",
  ],
  descriptionLong: [
    "descripcion_larga",
    "descripción larga",
    "descripcion larga",
    "description_long",
    "detalle",
  ],
  active: ["activo", "active", "isactive", "visible", "publicado"],
  featured: ["destacado", "featured", "isfeatured"],
  offer: ["oferta", "offer", "isoffer", "promocion", "promoción"],
};

function normalizeHeader(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");
}

function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();

  if (!text) return null;

  return text.replace(/\s+/g, " ");
}

function normalizeName(value: unknown): string | null {
  const text = normalizeText(value);

  if (!text) return null;

  return text
    .toLowerCase()
    .split(" ")
    .map((part) => {
      if (part.length <= 2 && /^[a-z0-9]+$/i.test(part)) {
        return part.toUpperCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function slugify(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 120);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (value === null || value === undefined || value === "") return fallback;

  const text = String(value).trim().toLowerCase();

  if (
    ["si", "sí", "s", "yes", "y", "true", "1", "activo", "visible"].includes(
      text,
    )
  ) {
    return true;
  }

  if (["no", "n", "false", "0", "inactivo", "oculto"].includes(text)) {
    return false;
  }

  return fallback;
}

function parsePrice(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(2);
  }

  let text = String(value).trim().replace(/\$/g, "").replace(/\s/g, "");

  if (!text) return null;

  const hasComma = text.includes(",");
  const hasDot = text.includes(".");

  if (hasComma && hasDot) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    text = text.replace(",", ".");
  }

  const number = Number(text);

  if (!Number.isFinite(number)) return null;

  return number.toFixed(2);
}

function buildRowWithNormalizedHeaders(row: ExcelRow): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeHeader(key)] = value;
  }

  return normalized;
}

function pickValue(row: Record<string, unknown>, aliases: string[]): unknown {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);

    if (Object.prototype.hasOwnProperty.call(row, key)) {
      return row[key];
    }
  }

  return null;
}

async function ensureUniqueSlug(
  baseSlug: string,
  existingProductId?: number,
): Promise<string> {
  let slug = baseSlug || "producto";
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === existingProductId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureUniqueCategorySlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || "categoria";
  let suffix = 2;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureUniqueSubcategorySlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || "subcategoria";
  let suffix = 2;

  while (true) {
    const existing = await prisma.subcategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureUniqueBrandSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || "marca";
  let suffix = 2;

  while (true) {
    const existing = await prisma.brand.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function findOrCreateCategory(name: string | null) {
  const safeName = name?.trim() || "Sin categoría";
  const baseSlug = slugify(safeName);

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: safeName }, { slug: baseSlug }],
    },
  });

  if (existing) return existing;

  const slug = await ensureUniqueCategorySlug(baseSlug);

  return prisma.category.create({
    data: {
      name: safeName,
      slug,
      isActive: true,
    },
  });
}

async function findOrCreateSubcategory(
  name: string | null,
  categoryId: number | null,
) {
  if (!name) return null;

  const safeName = name.trim();
  const baseSlug = slugify(safeName);

  const existing = await prisma.subcategory.findFirst({
    where: {
      OR: [{ name: safeName }, { slug: baseSlug }],
    },
  });

  if (existing) return existing;

  const slug = await ensureUniqueSubcategorySlug(baseSlug);

  return prisma.subcategory.create({
    data: {
      name: safeName,
      slug,
      categoryId,
      isActive: true,
    },
  });
}

async function findOrCreateBrand(name: string | null) {
  if (!name) return null;

  const safeName = name.trim();
  const baseSlug = slugify(safeName);

  const existing = await prisma.brand.findFirst({
    where: {
      OR: [{ name: safeName }, { slug: baseSlug }],
    },
  });

  if (existing) return existing;

  const slug = await ensureUniqueBrandSlug(baseSlug);

  return prisma.brand.create({
    data: {
      name: safeName,
      slug,
    },
  });
}

function normalizeProduct(row: ExcelRow): NormalizedProduct | null {
  const normalizedRow = buildRowWithNormalizedHeaders(row);

  const name =
    normalizeText(pickValue(normalizedRow, headerAliases.name)) ??
    normalizeText(pickValue(normalizedRow, ["productos_limpios"]));

  if (!name) return null;

  const code = normalizeText(pickValue(normalizedRow, headerAliases.code));
  const excelSlug = normalizeText(pickValue(normalizedRow, headerAliases.slug));

  const categoryName = normalizeName(
    pickValue(normalizedRow, headerAliases.category),
  );
  const subcategoryName = normalizeName(
    pickValue(normalizedRow, headerAliases.subcategory),
  );
  const brandName = normalizeName(
    pickValue(normalizedRow, headerAliases.brand),
  );

  const descriptionShort = normalizeText(
    pickValue(normalizedRow, headerAliases.descriptionShort),
  );

  const descriptionLong =
    normalizeText(pickValue(normalizedRow, headerAliases.descriptionLong)) ??
    descriptionShort;

  const price = parsePrice(pickValue(normalizedRow, headerAliases.price));

  return {
    code,
    name,
    slug: slugify(excelSlug || name),
    categoryName,
    subcategoryName,
    brandName,
    price,
    descriptionShort:
      descriptionShort ??
      `${name}. Producto disponible en Credifer para consultar financiación por WhatsApp.`,
    descriptionLong:
      descriptionLong ??
      `${name}. Producto disponible en Credifer. El precio publicado corresponde a precio contado; cuotas, promociones y condiciones se coordinan por WhatsApp.`,
    isActive: parseBoolean(
      pickValue(normalizedRow, headerAliases.active),
      true,
    ),
    isFeatured: parseBoolean(
      pickValue(normalizedRow, headerAliases.featured),
      false,
    ),
    isOffer: parseBoolean(pickValue(normalizedRow, headerAliases.offer), false),
  };
}

async function importProducts() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`No se encontró el archivo Excel en: ${EXCEL_PATH}`);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName =
    workbook.SheetNames.find((name) => name === "Productos_Limpios") ??
    workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("El Excel no contiene hojas para importar.");
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
    defval: null,
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let withoutPrice = 0;

  console.log(`Leyendo hoja: ${sheetName}`);
  console.log(`Filas encontradas: ${rows.length}`);

  for (const row of rows) {
    const product = normalizeProduct(row);

    if (!product) {
      skipped += 1;
      continue;
    }

    if (!product.price) {
      withoutPrice += 1;
    }

    const existingProduct = product.code
      ? await prisma.product.findUnique({
          where: { code: product.code },
          select: { id: true, slug: true },
        })
      : await prisma.product.findUnique({
          where: { slug: product.slug },
          select: { id: true, slug: true },
        });

    const category = await findOrCreateCategory(product.categoryName);
    const subcategory = await findOrCreateSubcategory(
      product.subcategoryName,
      category?.id ?? null,
    );
    const brand = await findOrCreateBrand(product.brandName);

    const finalSlug = existingProduct
      ? existingProduct.slug
      : await ensureUniqueSlug(product.slug);

    const data = {
      code: product.code,
      name: product.name,
      slug: finalSlug,
      descriptionShort: product.descriptionShort,
      descriptionLong: product.descriptionLong,
      price: product.price,
      categoryId: category?.id ?? null,
      subcategoryId: subcategory?.id ?? null,
      brandId: brand?.id ?? null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isOffer: product.isOffer,
      metaTitle: `${product.name} | Credifer`,
      metaDescription: `Consultá por ${product.name} en Credifer. Precio contado publicado y opciones de financiación por WhatsApp.`,
    };

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data,
      });

      updated += 1;
    } else {
      await prisma.product.create({
        data,
      });

      created += 1;
    }
  }

  await prisma.siteSetting.upsert({
    where: { key: "whatsapp_number" },
    update: {
      value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492216920251",
    },
    create: {
      key: "whatsapp_number",
      value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492216920251",
    },
  });

  console.log("");
  console.log("Importación finalizada.");
  console.log(`Productos creados: ${created}`);
  console.log(`Productos actualizados: ${updated}`);
  console.log(`Filas omitidas: ${skipped}`);
  console.log(`Productos sin precio: ${withoutPrice}`);
}

importProducts()
  .catch((error) => {
    console.error("Error importando productos:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
