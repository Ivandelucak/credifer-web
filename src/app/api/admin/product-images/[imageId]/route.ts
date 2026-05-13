import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { getPublicFilePathFromUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    imageId: string;
  }>;
};

async function getImage(imageId: number) {
  return prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const { imageId: imageIdParam } = await context.params;
  const imageId = Number(imageIdParam);

  if (!imageId || Number.isNaN(imageId)) {
    return NextResponse.json(
      {
        error: "Imagen inválida.",
      },
      {
        status: 400,
      },
    );
  }

  const image = await getImage(imageId);

  if (!image) {
    return NextResponse.json(
      {
        error: "La imagen no existe.",
      },
      {
        status: 404,
      },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    action?: string;
  } | null;

  if (body?.action !== "set-primary") {
    return NextResponse.json(
      {
        error: "Acción inválida.",
      },
      {
        status: 400,
      },
    );
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: {
        productId: image.productId,
      },
      data: {
        isPrimary: false,
      },
    }),
    prisma.productImage.update({
      where: {
        id: image.id,
      },
      data: {
        isPrimary: true,
      },
    }),
  ]);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${image.productId}/editar`);
  revalidatePath("/productos");
  revalidatePath(`/producto/${image.product.slug}`);

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { imageId: imageIdParam } = await context.params;
  const imageId = Number(imageIdParam);

  if (!imageId || Number.isNaN(imageId)) {
    return NextResponse.json(
      {
        error: "Imagen inválida.",
      },
      {
        status: 400,
      },
    );
  }

  const image = await getImage(imageId);

  if (!image) {
    return NextResponse.json(
      {
        error: "La imagen no existe.",
      },
      {
        status: 404,
      },
    );
  }

  await prisma.productImage.delete({
    where: {
      id: image.id,
    },
  });

  if (image.provider === "cloudinary" && image.publicId) {
    await deleteCloudinaryImage(image.publicId);
  }

  if (image.provider === "local") {
    const filePath = getPublicFilePathFromUrl(image.url);

    if (filePath) {
      await fs.rm(filePath, {
        force: true,
      });
    }
  }

  const remainingImages = await prisma.productImage.findMany({
    where: {
      productId: image.productId,
    },
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    select: {
      id: true,
      isPrimary: true,
    },
  });

  const hasPrimary = remainingImages.some((item) => item.isPrimary);

  if (!hasPrimary && remainingImages[0]) {
    await prisma.productImage.update({
      where: {
        id: remainingImages[0].id,
      },
      data: {
        isPrimary: true,
      },
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${image.productId}/editar`);
  revalidatePath("/productos");
  revalidatePath(`/producto/${image.product.slug}`);

  return NextResponse.json({
    success: true,
  });
}
