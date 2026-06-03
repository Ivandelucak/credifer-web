//src/app/api/admin/products/suggestions/route.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductSuggestionRow = {
  id: number;
  code: string | null;
  name: string;
  slug: string;
  price: unknown;
  isActive: boolean | number;
  categoryName: string | null;
  brandName: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

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
    const products = await prisma.$queryRaw<ProductSuggestionRow[]>`
      SELECT
        p.id,
        p.code,
        p.name,
        p.slug,
        p.price,
        p.isActive,
        c.name AS categoryName,
        b.name AS brandName,
        pi.url AS imageUrl,
        pi.alt AS imageAlt
      FROM product p
      LEFT JOIN category c ON c.id = p.categoryId
      LEFT JOIN brand b ON b.id = p.brandId
      LEFT JOIN productimage pi ON pi.id = (
        SELECT pi2.id
        FROM productimage pi2
        WHERE pi2.productId = p.id
        ORDER BY pi2.isPrimary DESC, pi2.position ASC
        LIMIT 1
      )
      WHERE p.deletedAt IS NULL
        AND (
          COALESCE(p.name, '') COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', CONVERT(${query} USING utf8mb4), '%') COLLATE utf8mb4_unicode_ci
          OR COALESCE(p.code, '') COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', CONVERT(${query} USING utf8mb4), '%') COLLATE utf8mb4_unicode_ci
          OR COALESCE(p.descriptionShort, '') COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', CONVERT(${query} USING utf8mb4), '%') COLLATE utf8mb4_unicode_ci
          OR COALESCE(b.name, '') COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', CONVERT(${query} USING utf8mb4), '%') COLLATE utf8mb4_unicode_ci
          OR COALESCE(c.name, '') COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', CONVERT(${query} USING utf8mb4), '%') COLLATE utf8mb4_unicode_ci
        )
      ORDER BY p.isActive DESC, p.updatedAt DESC
      LIMIT 8
    `;

    return NextResponse.json({
      suggestions: products.map((product) => ({
        id: product.id,
        code: product.code,
        name: product.name,
        slug: product.slug,
        price: product.price ? String(product.price) : null,
        isActive: Boolean(product.isActive),
        categoryName: product.categoryName,
        brandName: product.brandName,
        imageUrl: product.imageUrl,
        imageAlt: product.imageAlt ?? product.name,
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
