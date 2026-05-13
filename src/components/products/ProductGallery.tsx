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

  if (images.length === 0 || !selectedImage) {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-[var(--surface-muted)]">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-blue-soft)] to-white p-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-6xl font-black text-[var(--brand-blue)] shadow-sm">
              {productName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = images.findIndex(
    (image) => image.id === selectedImage.id,
  );

  function goToPreviousImage() {
    const previousIndex =
      currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImageId(images[previousIndex].id);
  }

  function goToNextImage() {
    const nextIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
    setSelectedImageId(images[nextIndex].id);
  }

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[var(--surface-muted)]">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt ?? productName}
          className="h-full w-full object-contain p-6"
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goToPreviousImage}
              aria-label="Ver imagen anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goToNextImage}
              aria-label="Ver imagen siguiente"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm">
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
                className={`aspect-square overflow-hidden rounded-2xl border bg-white transition focus-ring ${
                  isSelected
                    ? "border-[var(--brand-blue)] ring-2 ring-[rgba(2,100,169,0.18)]"
                    : "border-[var(--border)] hover:border-[var(--brand-blue)]"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? productName}
                  className="h-full w-full object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
