"use client";

import { useState } from "react";

type ProductGalleryImage = {
  id: number;
  url: string;
  alt: string | null;
};

type ProductGalleryProps = {
  productName: string;
  images: ProductGalleryImage[];
};

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const [selectedImageId, setSelectedImageId] = useState<number | null>(
    images[0]?.id ?? null,
  );

  const selectedImage =
    images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;

  const currentIndex = selectedImage
    ? images.findIndex((image) => image.id === selectedImage.id)
    : -1;

  function goToPreviousImage() {
    if (images.length <= 1) return;

    const previousIndex =
      currentIndex <= 0 ? images.length - 1 : currentIndex - 1;

    setSelectedImageId(images[previousIndex].id);
  }

  function goToNextImage() {
    if (images.length <= 1) return;

    const nextIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;

    setSelectedImageId(images[nextIndex].id);
  }

  if (images.length === 0 || !selectedImage) {
    return (
      <div className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(2,100,169,0.10)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-[rgba(244,196,48,0.14)] blur-3xl" />

        <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)] p-5">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[1.4rem] border border-[#D6E3EF] bg-white/72 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-[var(--brand-blue-soft)] text-5xl font-black text-[var(--brand-blue)] shadow-sm">
              {productName.charAt(0).toUpperCase()}
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Imagen a confirmar
            </p>

            <p className="mt-2 max-w-[230px] text-sm font-bold leading-6 text-[var(--text-secondary)]">
              Producto disponible para consultar precio, cuotas y
              disponibilidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(2,100,169,0.10)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-[rgba(244,196,48,0.12)] blur-3xl" />

      <div className="relative">
        <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)]">
          <div className="absolute left-4 top-4 z-10 rounded-full border border-[#C9D6E4] bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--brand-blue-dark)] shadow-sm backdrop-blur">
            Producto
          </div>

          <img
            src={selectedImage.url}
            alt={selectedImage.alt ?? productName}
            className="h-full w-full object-contain p-6 transition duration-300"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goToPreviousImage}
                aria-label="Ver imagen anterior"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D6E4] bg-white/92 text-2xl font-black text-[var(--brand-blue-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goToNextImage}
                aria-label="Ver imagen siguiente"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D6E4] bg-white/92 text-2xl font-black text-[var(--brand-blue-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
              >
                ›
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[#C9D6E4] bg-white/94 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm backdrop-blur">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-4">
            {images.map((image, index) => {
              const isSelected = image.id === selectedImage.id;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  aria-label={`Ver imagen ${index + 1} de ${productName}`}
                  className={`aspect-square overflow-hidden rounded-2xl border bg-white p-1.5 transition focus-ring ${
                    isSelected
                      ? "border-[var(--brand-blue)] shadow-[0_10px_24px_rgba(2,100,169,0.16)] ring-2 ring-[rgba(2,100,169,0.18)]"
                      : "border-[#C9D6E4] hover:border-[var(--brand-blue)] hover:shadow-sm"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt ?? productName}
                    className="h-full w-full rounded-xl object-contain"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
