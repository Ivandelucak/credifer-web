// src/app/api/admin/product-import/apply/route.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  applyProductImportRows,
  type ProductImportRow,
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

  try {
    const body = (await request.json()) as {
      rows?: ProductImportRow[];
    };

    if (!body.rows || !Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json(
        {
          error: "No hay filas para aplicar.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await applyProductImportRows(prisma, body.rows);

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error("Error applying product import:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo aplicar la importación.",
      },
      {
        status: 500,
      },
    );
  }
}
