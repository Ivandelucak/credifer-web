import path from "node:path";
import { randomUUID } from "node:crypto";

export const PRODUCT_IMAGE_MAX_SIZE = 6 * 1024 * 1024;

export const ALLOWED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function isAllowedProductImageType(type: string) {
  return ALLOWED_PRODUCT_IMAGE_TYPES.includes(type);
}

export function getImageExtension(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";

  return null;
}

export function createProductImageFileName(type: string) {
  const extension = getImageExtension(type);

  if (!extension) {
    throw new Error("Tipo de imagen no permitido.");
  }

  return `${randomUUID()}.${extension}`;
}

export function getProductUploadDir(productId: number) {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    String(productId),
  );
}

export function getProductImagePublicUrl(productId: number, fileName: string) {
  return `/uploads/products/${productId}/${fileName}`;
}

export function getPublicFilePathFromUrl(url: string) {
  if (!url.startsWith("/uploads/products/")) {
    return null;
  }

  return path.join(process.cwd(), "public", url);
}
