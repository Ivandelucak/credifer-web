// src/app/admin/(protected)/exportar/catalogo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { utils, write } from "xlsx";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ExportType = "completo" | "sin-imagen" | "sin-precio";

function getExportType(value: string | null): ExportType {
  if (value === "sin-imagen") return "sin-imagen";
  if (value === "sin-precio") return "sin-precio";
  return "completo";
}

function getExportTitle(type: ExportType) {
  if (type === "sin-imagen") return "productos_sin_imagen";
  if (type === "sin-precio") return "productos_sin_precio";
  return "catalogo_completo";
}

function getTodayForFilename() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: Date | null) {
  if (!value) return "";

  return value.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "No autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  const type = getExportType(request.nextUrl.searchParams.get("tipo"));

  const where =
    type === "sin-imagen"
      ? {
          deletedAt: null,
          images: {
            none: {},
          },
        }
      : type === "sin-precio"
        ? {
            deletedAt: null,
            price: null,
          }
        : {
            deletedAt: null,
          };

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      price: true,
      descriptionShort: true,
      descriptionLong: true,
      isActive: true,
      isFeatured: true,
      isOffer: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      subcategory: {
        select: {
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        select: {
          url: true,
          alt: true,
          isPrimary: true,
          position: true,
        },
      },
    },
  });

  const rows = products.map((product) => ({
    nombre: product.name,
    slug: product.slug,
    precio_contado: product.price ? product.price.toString() : "",
    categoria: product.category?.name ?? "",
    categoria_slug: product.category?.slug ?? "",
    subcategoria: product.subcategory?.name ?? "",
    subcategoria_slug: product.subcategory?.slug ?? "",
    marca: product.brand?.name ?? "",
    marca_slug: product.brand?.slug ?? "",
    activo: product.isActive ? "SI" : "NO",
    destacado: product.isFeatured ? "SI" : "NO",
    oferta: product.isOffer ? "SI" : "NO",
    descripcion_corta: product.descriptionShort ?? "",
    descripcion_larga: product.descriptionLong ?? "",
    cantidad_imagenes: product.images.length,
    imagen_principal: product.images[0]?.url ?? "",
    imagenes: product.images.map((image) => image.url).join(" | "),
    creado: formatDate(product.createdAt),
    actualizado: formatDate(product.updatedAt),
  }));

  const workbook = utils.book_new();
  const productsSheet = utils.json_to_sheet(rows);

  productsSheet["!cols"] = [
    { wch: 44 },
    { wch: 36 },
    { wch: 14 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 48 },
    { wch: 64 },
    { wch: 16 },
    { wch: 52 },
    { wch: 80 },
    { wch: 14 },
    { wch: 14 },
  ];

  utils.book_append_sheet(workbook, productsSheet, "Productos");

  const summarySheet = utils.json_to_sheet([
    {
      tipo_exportacion: type,
      productos_exportados: products.length,
      generado: new Date().toLocaleString("es-AR"),
      generado_por: session.email,
    },
  ]);

  summarySheet["!cols"] = [{ wch: 24 }, { wch: 22 }, { wch: 24 }, { wch: 32 }];

  utils.book_append_sheet(workbook, summarySheet, "Resumen");

  const buffer = write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  }) as Buffer;

  const fileName = `credifer_${getExportTitle(type)}_${getTodayForFilename()}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
