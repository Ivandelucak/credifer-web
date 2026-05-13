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

  if (query.length < 2) {
    return NextResponse.json({
      suggestions: [],
    });
  }

  const brands = await prisma.brand.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
          },
        },
        {
          slug: {
            contains: query
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, ""),
          },
        },
      ],
    },
    orderBy: {
      name: "asc",
    },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    suggestions: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productsCount: brand._count.products,
    })),
  });
}
