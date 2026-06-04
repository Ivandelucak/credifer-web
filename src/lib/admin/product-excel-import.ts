// src/lib/admin/product-excel-import.ts
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";

export type ProductImportAction = "ACTUALIZAR" | "CREAR_NUEVO" | "DESACTIVAR";

export type ProductImportRow = {
  rowNumber: number;
  accion: ProductImportAction;
  productId: number | null;
  codigoActual: string | null;
  slugActual: string | null;
  slugFinal: string;
  nombreActual: string | null;
  nombreFinal: string;
  precioActual: number | null;
  precioFinal: number | null;
  actualizarNombre: boolean;
  actualizarSlug: boolean;
  categoriaFinal: string | null;
  categoriaSlugFinal: string | null;
  subcategoriaFinal: string | null;
  subcategoriaSlugFinal: string | null;
  marcaFinal: string | null;
  marcaSlugFinal: string | null;
  imagenesActuales: number;
};

export type ProductImportSummary = {
  totalRows: number;
  updateRows: number;
  createRows: number;
  deactivateRows: number;
  rowsWithImages: number;
  rowsWithoutProductId: number;
  invalidRows: string[];
};

const REQUIRED_COLUMNS = [
  "accion",
  "product_id",
  "slug_final",
  "nombre_final",
  "precio_final",
  "actualizar_nombre",
  "actualizar_slug",
  "categoria_final",
  "categoria_slug_final",
  "subcategoria_final",
  "subcategoria_slug_final",
  "marca_final",
  "marca_slug_final",
  "imagenes_actuales",
];

function cleanString(value: unknown) {
  const text = String(value ?? "").trim();

  if (!text || text.toLowerCase() === "nan" || text === "-") {
    return null;
  }

  return text;
}

function cleanRequiredString(value: unknown) {
  return cleanString(value) ?? "";
}

function cleanNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value)
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function cleanInteger(value: unknown) {
  const numberValue = cleanNumber(value);

  if (numberValue === null) return null;

  return Math.trunc(numberValue);
}

function cleanBoolean(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .toUpperCase();

  return text === "SI" || text === "SÍ" || text === "TRUE" || text === "1";
}

function normalizeAction(value: unknown): ProductImportAction | null {
  const text = String(value ?? "")
    .trim()
    .toUpperCase();

  if (text === "ACTUALIZAR") return "ACTUALIZAR";
  if (text === "CREAR_NUEVO") return "CREAR_NUEVO";
  if (text === "DESACTIVAR") return "DESACTIVAR";

  return null;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseProductImportWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("El archivo no tiene hojas.");
  }

  const sheet = workbook.Sheets[sheetName];

  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  const headers = Object.keys(records[0] ?? {});
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `Faltan columnas obligatorias: ${missingColumns.join(", ")}`,
    );
  }

  const invalidRows: string[] = [];

  const rows = records
    .map((record, index): ProductImportRow | null => {
      const rowNumber = index + 2;
      const accion = normalizeAction(record.accion);
      const nombreFinal = cleanRequiredString(record.nombre_final);
      const slugFinal = cleanString(record.slug_final) ?? slugify(nombreFinal);
      const precioFinal = cleanNumber(record.precio_final);

      if (!accion) {
        invalidRows.push(`Fila ${rowNumber}: acción inválida.`);
        return null;
      }

      if (!nombreFinal) {
        invalidRows.push(`Fila ${rowNumber}: falta nombre_final.`);
        return null;
      }

      if (!slugFinal) {
        invalidRows.push(`Fila ${rowNumber}: falta slug_final.`);
        return null;
      }

      if (accion !== "DESACTIVAR" && precioFinal === null) {
        invalidRows.push(`Fila ${rowNumber}: falta precio_final.`);
        return null;
      }

      const productId = cleanInteger(record.product_id);

      if (
        (accion === "ACTUALIZAR" || accion === "DESACTIVAR") &&
        productId === null
      ) {
        invalidRows.push(`Fila ${rowNumber}: ${accion} requiere product_id.`);
        return null;
      }

      return {
        rowNumber,
        accion,
        productId,
        codigoActual: cleanString(record.codigo_actual),
        slugActual: cleanString(record.slug_actual),
        slugFinal,
        nombreActual: cleanString(record.nombre_actual),
        nombreFinal,
        precioActual: cleanNumber(record.precio_actual),
        precioFinal,
        actualizarNombre: cleanBoolean(record.actualizar_nombre),
        actualizarSlug: cleanBoolean(record.actualizar_slug),
        categoriaFinal: cleanString(record.categoria_final),
        categoriaSlugFinal: cleanString(record.categoria_slug_final),
        subcategoriaFinal: cleanString(record.subcategoria_final),
        subcategoriaSlugFinal: cleanString(record.subcategoria_slug_final),
        marcaFinal: cleanString(record.marca_final),
        marcaSlugFinal: cleanString(record.marca_slug_final),
        imagenesActuales: cleanInteger(record.imagenes_actuales) ?? 0,
      };
    })
    .filter((row): row is ProductImportRow => Boolean(row));

  return {
    rows,
    invalidRows,
  };
}

export function summarizeImportRows(
  rows: ProductImportRow[],
  invalidRows: string[],
): ProductImportSummary {
  return {
    totalRows: rows.length,
    updateRows: rows.filter((row) => row.accion === "ACTUALIZAR").length,
    createRows: rows.filter((row) => row.accion === "CREAR_NUEVO").length,
    deactivateRows: rows.filter((row) => row.accion === "DESACTIVAR").length,
    rowsWithImages: rows.filter((row) => row.imagenesActuales > 0).length,
    rowsWithoutProductId: rows.filter(
      (row) => row.accion !== "CREAR_NUEVO" && !row.productId,
    ).length,
    invalidRows,
  };
}

type ImportTx = Prisma.TransactionClient;

async function getOrCreateCategory(
  tx: ImportTx,
  cache: Map<string, number>,
  name: string | null,
  slug: string | null,
) {
  if (!name || !slug) return null;

  const cached = cache.get(slug);
  if (cached) return cached;

  const existing = await tx.category.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    cache.set(slug, existing.id);
    return existing.id;
  }

  const created = await tx.category.create({
    data: {
      name,
      slug,
      isActive: true,
      position: 999,
    },
    select: {
      id: true,
    },
  });

  cache.set(slug, created.id);
  return created.id;
}

async function getOrCreateSubcategory(
  tx: ImportTx,
  cache: Map<string, number>,
  name: string | null,
  slug: string | null,
  categoryId: number | null,
) {
  if (!name || !slug) return null;

  const cached = cache.get(slug);
  if (cached) return cached;

  const existing = await tx.subcategory.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    cache.set(slug, existing.id);

    if (categoryId) {
      await tx.subcategory.update({
        where: {
          id: existing.id,
        },
        data: {
          categoryId,
          isActive: true,
        },
      });
    }

    return existing.id;
  }

  const created = await tx.subcategory.create({
    data: {
      name,
      slug,
      categoryId,
      isActive: true,
      position: 999,
    },
    select: {
      id: true,
    },
  });

  cache.set(slug, created.id);
  return created.id;
}

async function getOrCreateBrand(
  tx: ImportTx,
  cache: Map<string, number>,
  name: string | null,
  slug: string | null,
) {
  if (!name || !slug) return null;

  const cached = cache.get(slug);
  if (cached) return cached;

  const existing = await tx.brand.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    cache.set(slug, existing.id);
    return existing.id;
  }

  const created = await tx.brand.create({
    data: {
      name,
      slug,
    },
    select: {
      id: true,
    },
  });

  cache.set(slug, created.id);
  return created.id;
}

async function getNextProductCodeNumber(tx: ImportTx) {
  const products = await tx.product.findMany({
    select: {
      code: true,
    },
  });

  const maxNumber = products.reduce((max, product) => {
    const match = product.code?.match(/^CRD-(\d+)$/);
    const value = match ? Number(match[1]) : 0;

    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  return maxNumber + 1;
}

function formatProductCode(value: number) {
  return `CRD-${String(value).padStart(4, "0")}`;
}

async function ensureUniqueProductSlug(
  tx: ImportTx,
  baseSlug: string,
  currentProductId?: number | null,
) {
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await tx.product.findFirst({
      where: {
        slug: candidate,
        ...(currentProductId
          ? {
              id: {
                not: currentProductId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existing) return candidate;

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function applyProductImportRows(
  prisma: {
    $transaction: typeof import("@/lib/prisma").prisma.$transaction;
  },
  rows: ProductImportRow[],
) {
  const result = {
    updated: 0,
    created: 0,
    deactivated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  await prisma.$transaction(
    async (tx) => {
      const categoryCache = new Map<string, number>();
      const subcategoryCache = new Map<string, number>();
      const brandCache = new Map<string, number>();

      let nextProductCodeNumber = await getNextProductCodeNumber(tx);

      for (const row of rows) {
        try {
          if (row.accion === "DESACTIVAR") {
            if (!row.productId) {
              result.skipped += 1;
              result.errors.push(
                `Fila ${row.rowNumber}: producto sin ID para desactivar.`,
              );
              continue;
            }

            await tx.product.update({
              where: {
                id: row.productId,
              },
              data: {
                isActive: false,
                deletedAt: new Date(),
              },
            });

            result.deactivated += 1;
            continue;
          }

          const categoryId = await getOrCreateCategory(
            tx,
            categoryCache,
            row.categoriaFinal,
            row.categoriaSlugFinal,
          );

          const subcategoryId = await getOrCreateSubcategory(
            tx,
            subcategoryCache,
            row.subcategoriaFinal,
            row.subcategoriaSlugFinal,
            categoryId,
          );

          const brandId = await getOrCreateBrand(
            tx,
            brandCache,
            row.marcaFinal,
            row.marcaSlugFinal,
          );

          if (row.accion === "ACTUALIZAR") {
            if (!row.productId) {
              result.skipped += 1;
              result.errors.push(
                `Fila ${row.rowNumber}: producto sin ID para actualizar.`,
              );
              continue;
            }

            const updateData: Prisma.ProductUncheckedUpdateInput = {
              price:
                row.precioFinal === null
                  ? null
                  : new Prisma.Decimal(row.precioFinal),
              isActive: true,
              deletedAt: null,
              categoryId,
              subcategoryId,
              brandId,
            };

            if (row.actualizarNombre) {
              updateData.name = row.nombreFinal;
            }

            if (row.actualizarSlug) {
              updateData.slug = await ensureUniqueProductSlug(
                tx,
                row.slugFinal,
                row.productId,
              );
            }

            await tx.product.update({
              where: {
                id: row.productId,
              },
              data: updateData,
            });

            result.updated += 1;
            continue;
          }

          if (row.accion === "CREAR_NUEVO") {
            const finalSlug = await ensureUniqueProductSlug(tx, row.slugFinal);
            const code = formatProductCode(nextProductCodeNumber);
            nextProductCodeNumber += 1;

            const createData: Prisma.ProductUncheckedCreateInput = {
              code,
              name: row.nombreFinal,
              slug: finalSlug,
              price:
                row.precioFinal === null
                  ? null
                  : new Prisma.Decimal(row.precioFinal),
              descriptionShort: `${row.nombreFinal}. Precio contado publicado en tienda. Consultá cuotas, disponibilidad y entrega.`,
              isActive: true,
              isFeatured: false,
              isOffer: false,
              deletedAt: null,
              categoryId,
              subcategoryId,
              brandId,
            };

            await tx.product.create({
              data: createData,
            });

            result.created += 1;
          }
        } catch (error) {
          result.skipped += 1;
          result.errors.push(
            `Fila ${row.rowNumber}: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`,
          );
        }
      }
    },
    {
      maxWait: 10000,
      timeout: 120000,
    },
  );

  return result;
}
