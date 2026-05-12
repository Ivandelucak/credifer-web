import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({
      suggestions: [],
    });
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
          },
        },
        {
          code: {
            contains: query,
          },
        },
        {
          brand: {
            name: {
              contains: query,
            },
          },
        },
        {
          category: {
            name: {
              contains: query,
            },
          },
        },
      ],
    },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    take: 8,
    select: {
      id: true,
      code: true,
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
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
        select: {
          url: true,
          alt: true,
        },
      },
    },
  });

  return NextResponse.json({
    suggestions: products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      slug: product.slug,
      price: product.price ? product.price.toString() : null,
      isActive: product.isActive,
      categoryName: product.category?.name ?? null,
      brandName: product.brand?.name ?? null,
      imageUrl: product.images[0]?.url ?? null,
      imageAlt: product.images[0]?.alt ?? product.name,
    })),
  });
}
