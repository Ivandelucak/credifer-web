//src/app/api/admin/products/suggestions/route.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

  try {
    const [matchingBrands, matchingCategories, matchingSubcategories] =
      await Promise.all([
        prisma.brand.findMany({
          where: {
            name: {
              contains: query,
            },
          },
          select: {
            id: true,
          },
        }),

        prisma.category.findMany({
          where: {
            name: {
              contains: query,
            },
          },
          select: {
            id: true,
          },
        }),

        prisma.subcategory.findMany({
          where: {
            name: {
              contains: query,
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

    const matchingBrandIds = matchingBrands.map((brand) => brand.id);
    const matchingCategoryIds = matchingCategories.map(
      (category) => category.id,
    );
    const matchingSubcategoryIds = matchingSubcategories.map(
      (subcategory) => subcategory.id,
    );

    const searchConditions: Prisma.ProductWhereInput[] = [
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
        descriptionShort: {
          contains: query,
        },
      },
      ...(matchingBrandIds.length > 0
        ? [
            {
              brandId: {
                in: matchingBrandIds,
              },
            },
          ]
        : []),
      ...(matchingCategoryIds.length > 0
        ? [
            {
              categoryId: {
                in: matchingCategoryIds,
              },
            },
          ]
        : []),
      ...(matchingSubcategoryIds.length > 0
        ? [
            {
              subcategoryId: {
                in: matchingSubcategoryIds,
              },
            },
          ]
        : []),
    ];

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: searchConditions,
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
  } catch (error) {
    console.error("Error loading product suggestions:", error);

    return NextResponse.json(
      {
        error: "No se pudieron cargar las sugerencias.",
      },
      {
        status: 500,
      },
    );
  }
}
