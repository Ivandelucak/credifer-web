import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ProductImage } from "@prisma/client";
import { getAdminSession } from "@/lib/admin-auth";
import {
  isAllowedProductImageType,
  PRODUCT_IMAGE_MAX_SIZE,
} from "@/lib/images";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  const { productId: productIdParam } = await context.params;
  const productId = Number(productIdParam);

  if (!productId || Number.isNaN(productId)) {
    return NextResponse.json(
      {
        error: "Producto inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json(
      {
        error: "El producto no existe.",
      },
      {
        status: 404,
      },
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      {
        error: "No se recibieron imágenes.",
      },
      {
        status: 400,
      },
    );
  }

  const currentImagesCount = product.images.length;
  const createdImages: ProductImage[] = [];

  for (const file of files) {
    if (!isAllowedProductImageType(file.type)) {
      return NextResponse.json(
        {
          error: `El archivo "${file.name}" no es una imagen válida. Usá JPG, PNG o WEBP.`,
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > PRODUCT_IMAGE_MAX_SIZE) {
      return NextResponse.json(
        {
          error: `El archivo "${file.name}" supera el tamaño máximo permitido de 6MB.`,
        },
        {
          status: 400,
        },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedImage = await uploadBufferToCloudinary({
      buffer,
      productId,
      fileName: file.name,
    });

    const imagesCount = await prisma.productImage.count({
      where: {
        productId,
      },
    });

    const createdImage: ProductImage = await prisma.productImage.create({
      data: {
        productId,
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
        provider: "cloudinary",
        alt: product.name,
        position: imagesCount,
        isPrimary: currentImagesCount === 0 && createdImages.length === 0,
      },
    });

    createdImages.push(createdImage);
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  revalidatePath("/productos");
  revalidatePath(`/producto/${product.slug}`);

  return NextResponse.json({
    success: true,
    images: createdImages,
  });
}
