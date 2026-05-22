//src/app/api/admin/products/name-matches/route.ts
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q")?.trim() ?? "";
  const excludeIdParam = searchParams.get("excludeId");
  const excludeId = excludeIdParam ? Number(excludeIdParam) : null;

  if (query.length < 3) {
    return NextResponse.json({ products: [] });
  }

  const tokens = query
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .slice(0, 5);

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(excludeId && Number.isFinite(excludeId)
      ? {
          id: {
            not: excludeId,
          },
        }
      : {}),
    OR: [
      {
        name: {
          contains: query,
        },
      },
      ...(tokens.length > 0
        ? [
            {
              AND: tokens.map((token) => ({
                name: {
                  contains: token,
                },
              })),
            },
          ]
        : []),
    ],
  };

  const products = await prisma.product.findMany({
    where,
    take: 8,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      isActive: true,
      category: {
        select: {
          name: true,
        },
      },
      brand: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price ? product.price.toString() : null,
      isActive: product.isActive,
      categoryName: product.category?.name ?? null,
      brandName: product.brand?.name ?? null,
    })),
  });
}
