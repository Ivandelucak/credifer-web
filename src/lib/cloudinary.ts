import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Faltan variables de Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET.",
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

export function configureCloudinary() {
  const config = getCloudinaryConfig();

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function getCloudinaryProductFolder(productId: number) {
  const baseFolder = process.env.CLOUDINARY_FOLDER ?? "credifer/products";

  return `${baseFolder}/${productId}`;
}

export async function uploadBufferToCloudinary({
  buffer,
  productId,
  fileName,
}: {
  buffer: Buffer;
  productId: number;
  fileName?: string;
}) {
  const client = configureCloudinary();
  const folder = getCloudinaryProductFolder(productId);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: Boolean(fileName),
        filename_override: fileName,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary no devolvió resultado de subida."));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryImage(publicId: string) {
  const client = configureCloudinary();

  return client.uploader.destroy(publicId, {
    resource_type: "image",
  });
}
