// src/app/api/admin/product-import/preview/route.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  parseProductImportWorkbook,
  summarizeImportRows,
} from "@/lib/admin/product-excel-import";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSession();

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

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json(
      {
        error: "No se recibió ningún archivo.",
      },
      {
        status: 400,
      },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { rows, invalidRows } = parseProductImportWorkbook(buffer);

    const idsToCheck = rows
      .filter((row) => row.accion !== "CREAR_NUEVO" && row.productId)
      .map((row) => row.productId as number);

    const existingProducts = await prisma.product.findMany({
      where: {
        id: {
          in: idsToCheck,
        },
      },
      select: {
        id: true,
      },
    });

    const existingIds = new Set(existingProducts.map((product) => product.id));

    const missingIds = rows
      .filter(
        (row) =>
          row.accion !== "CREAR_NUEVO" &&
          row.productId &&
          !existingIds.has(row.productId),
      )
      .map(
        (row) => `Fila ${row.rowNumber}: no existe product_id ${row.productId}`,
      );

    const summary = summarizeImportRows(rows, [...invalidRows, ...missingIds]);

    return NextResponse.json({
      summary,
      rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo procesar el Excel.",
      },
      {
        status: 500,
      },
    );
  }
}
