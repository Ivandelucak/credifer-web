//src/components/admin/ProductImagesManager.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProductImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
};

type ProductImagesManagerProps = {
  productId: number;
  productName: string;
  images: ProductImage[];
};

const MAX_SIZE_MB = 6;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateFiles(files: File[]) {
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `El archivo "${file.name}" no es válido. Usá JPG, PNG o WEBP.`;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `El archivo "${file.name}" supera ${MAX_SIZE_MB}MB.`;
    }
  }

  return null;
}

export function ProductImagesManager({
  productId,
  productName,
  images,
}: ProductImagesManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [workingImageId, setWorkingImageId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);
  const [previewImage, setPreviewImage] = useState<ProductImage | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const validationError = validateFiles(files);

      if (validationError) {
        setMessage({
          type: "error",
          text: validationError,
        });
        return;
      }

      const formData = new FormData();

      for (const file of files) {
        formData.append("images", file);
      }

      setIsUploading(true);
      setMessage(null);

      try {
        const response = await fetch(
          `/api/admin/products/${productId}/images`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(data?.error ?? "No se pudieron subir las imágenes.");
        }

        setMessage({
          type: "success",
          text: "Imágenes cargadas correctamente.",
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        router.refresh();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "No se pudieron subir las imágenes.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [productId, router],
  );

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      const items = Array.from(event.clipboardData?.items ?? []);
      const imageFiles = items
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));

      if (imageFiles.length === 0) return;

      event.preventDefault();
      uploadFiles(imageFiles);
    }

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [uploadFiles]);

  async function handleSetPrimary(imageId: number) {
    setWorkingImageId(imageId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/product-images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set-primary",
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo marcar como principal.");
      }

      setMessage({
        type: "success",
        text: "Imagen principal actualizada.",
      });

      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo marcar como principal.",
      });
    } finally {
      setWorkingImageId(null);
    }
  }

  async function handleDeleteImage(imageId: number) {
    setWorkingImageId(imageId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/product-images/${imageId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo eliminar la imagen.");
      }

      setMessage({
        type: "success",
        text: "Imagen eliminada correctamente.",
      });

      setImageToDelete(null);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la imagen.",
      });
    } finally {
      setWorkingImageId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Imágenes del producto
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Podés subir archivos, arrastrar imágenes o pegar una captura con{" "}
            <strong>Ctrl + V</strong>. Formatos permitidos: JPG, PNG y WEBP.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex justify-center rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-70 focus-ring"
        >
          {isUploading ? "Subiendo..." : "Subir imagen"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          uploadFiles(files);
        }}
      />

      <div
        ref={dropZoneRef}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();

          if (event.currentTarget === event.target) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          const files = Array.from(event.dataTransfer.files ?? []).filter(
            (file) => file.type.startsWith("image/"),
          );

          uploadFiles(files);
        }}
        className={`mt-5 rounded-3xl border border-dashed p-6 text-center transition ${
          isDragging
            ? "border-[var(--brand-blue)] bg-[var(--brand-blue-soft)]"
            : "border-[var(--border-strong)] bg-[var(--surface-muted)]"
        }`}
      >
        <p className="text-sm font-black text-[var(--text-primary)]">
          Arrastrá imágenes acá
        </p>

        <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
          También podés copiar una imagen o captura y pegarla con Ctrl + V,
          siempre que no estés escribiendo en un campo de texto.
        </p>
      </div>

      {message ? (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => {
            const isWorking = workingImageId === image.id;

            return (
              <article
                key={image.id}
                className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-[var(--surface-muted)]">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(image)}
                    className="group h-full w-full focus-ring"
                    aria-label={`Ver imagen de ${productName}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt ?? productName}
                      className="h-full w-full object-contain p-4 transition duration-200 group-hover:scale-[1.035]"
                    />

                    <span className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/70 px-3 py-2 text-center text-xs font-black text-white opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100">
                      Ver imagen
                    </span>
                  </button>

                  {image.isPrimary ? (
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--brand-blue)] px-3 py-1 text-xs font-black text-white">
                      Principal
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={image.isPrimary || isWorking}
                    className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
                  >
                    {image.isPrimary ? "Ya es principal" : "Marcar principal"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageToDelete(image)}
                    disabled={isWorking}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-white p-6 text-center">
          <p className="text-sm font-black text-[var(--text-primary)]">
            Este producto todavía no tiene imágenes.
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
            Mientras no tenga imagen, la tienda mostrará un placeholder
            automático.
          </p>
        </div>
      )}

      {previewImage ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#8FA2B8] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.32)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EAF4FB_100%)] px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  Vista previa
                </p>

                <h3 className="mt-1 line-clamp-1 text-xl font-black text-[var(--text-primary)]">
                  {productName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="tap-feedback inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#8FA2B8] bg-white text-xl font-black text-[var(--brand-blue-dark)] transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                aria-label="Cerrar vista previa"
              >
                ×
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#F8FBFE] p-4 sm:p-6">
              <img
                src={previewImage.url}
                alt={previewImage.alt ?? productName}
                className="max-h-[72vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}

      {imageToDelete ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#8FA2B8] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
            <div className="border-b border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EAF4FB_100%)] px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-red)]">
                Confirmar eliminación
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
                Eliminar imagen
              </h3>
            </div>

            <div className="p-6">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Vas a eliminar esta imagen del producto{" "}
                <span className="font-black text-[var(--text-primary)]">
                  {productName}
                </span>
                . Esta acción no elimina el producto ni modifica sus datos.
              </p>

              <div className="mt-5 rounded-[1.25rem] border border-[#D6E3EF] bg-[#F8FBFE] p-3">
                <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl border border-[#B7CADA] bg-white">
                  <img
                    src={imageToDelete.url}
                    alt={imageToDelete.alt ?? productName}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setImageToDelete(null)}
                  disabled={workingImageId === imageToDelete.id}
                  className="tap-feedback inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#8FA2B8] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteImage(imageToDelete.id)}
                  disabled={workingImageId === imageToDelete.id}
                  className="tap-feedback inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--brand-red)] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(216,33,40,0.18)] transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 focus-ring"
                >
                  {workingImageId === imageToDelete.id
                    ? "Eliminando..."
                    : "Eliminar imagen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
