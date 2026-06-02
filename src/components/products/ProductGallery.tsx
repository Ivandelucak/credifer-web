"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(
    images[0]?.id ?? null,
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const selectedImage =
    images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;

  const currentIndex = selectedImage
    ? images.findIndex((image) => image.id === selectedImage.id)
    : -1;

  function closeViewer() {
    setIsViewerOpen(false);
  }

  function selectImage(imageId: number) {
    setSelectedImageId(imageId);
  }

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isViewerOpen) return;

    const scrollY = window.scrollY;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowLeft") {
        goToPreviousImage();
      }

      if (event.key === "ArrowRight") {
        goToNextImage();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;

      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, currentIndex]);

  const viewer =
    mounted && isViewerOpen && selectedImage
      ? createPortal(
          <div className="fixed inset-0 z-[2147483647] bg-white">
            <div className="flex h-[100dvh] w-screen flex-col overflow-hidden">
              <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#D6E3EF] bg-white px-4 sm:px-6">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Galería del producto
                  </p>

                  <h3 className="mt-1 line-clamp-1 text-base font-black text-[var(--text-primary)] sm:text-lg">
                    {productName}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeViewer}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-xl font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                  aria-label="Cerrar galería"
                >
                  ×
                </button>
              </header>

              <div className="grid min-h-0 flex-1 bg-white lg:grid-cols-[112px_minmax(0,1fr)]">
                {images.length > 1 ? (
                  <aside className="hidden border-r border-[#D6E3EF] bg-[#F8FBFE] p-3 lg:block">
                    <div className="grid gap-3">
                      {images.map((image, index) => {
                        const isSelected = image.id === selectedImage.id;

                        return (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => selectImage(image.id)}
                            aria-label={`Ver imagen ${index + 1}`}
                            className={`aspect-square overflow-hidden rounded-2xl border bg-white p-1.5 transition focus-ring ${
                              isSelected
                                ? "border-[var(--brand-blue)] ring-2 ring-[rgba(2,100,169,0.18)]"
                                : "border-[#C9D6E4] hover:border-[var(--brand-blue)]"
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
                  </aside>
                ) : null}

                <main className="relative flex min-h-0 items-center justify-center bg-white px-4 py-4 sm:px-8 sm:py-6">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.alt ?? productName}
                    className="max-h-full max-w-full object-contain"
                  />

                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={goToPreviousImage}
                        aria-label="Imagen anterior"
                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D6E4] bg-white/95 text-3xl font-black text-[var(--brand-blue-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:text-[var(--brand-blue)] focus-ring sm:left-6 sm:h-12 sm:w-12"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={goToNextImage}
                        aria-label="Imagen siguiente"
                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D6E4] bg-white/95 text-3xl font-black text-[var(--brand-blue-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:text-[var(--brand-blue)] focus-ring sm:right-6 sm:h-12 sm:w-12"
                      >
                        ›
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[#C9D6E4] bg-white/95 px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm">
                        {currentIndex + 1} / {images.length}
                      </div>
                    </>
                  ) : null}
                </main>
              </div>

              {images.length > 1 ? (
                <footer className="shrink-0 border-t border-[#D6E3EF] bg-[#F8FBFE] p-3 lg:hidden">
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {images.map((image, index) => {
                      const isSelected = image.id === selectedImage.id;

                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => selectImage(image.id)}
                          aria-label={`Ver imagen ${index + 1}`}
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-white p-1.5 transition focus-ring ${
                            isSelected
                              ? "border-[var(--brand-blue)] ring-2 ring-[rgba(2,100,169,0.18)]"
                              : "border-[#C9D6E4]"
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
                </footer>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

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
    <>
      <div className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(2,100,169,0.10)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-[rgba(244,196,48,0.12)] blur-3xl" />

        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)]">
            <div className="absolute left-4 top-4 z-10 rounded-full border border-[#C9D6E4] bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--brand-blue-dark)] shadow-sm backdrop-blur">
              Producto
            </div>

            <button
              type="button"
              onClick={() => setIsViewerOpen(true)}
              className="group h-full w-full focus-ring"
              aria-label={`Abrir galería de ${productName}`}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt ?? productName}
                className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-[1.025]"
              />

              <span className="pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl bg-slate-950/70 px-4 py-2 text-center text-xs font-black text-white opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100">
                Ver imagen
              </span>
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  aria-label="Ver imagen anterior"
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D6E4] bg-white/92 text-2xl font-black text-[var(--brand-blue-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goToNextImage}
                  aria-label="Ver imagen siguiente"
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D6E4] bg-white/92 text-2xl font-black text-[var(--brand-blue-dark)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
                >
                  ›
                </button>

                <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#C9D6E4] bg-white/94 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm backdrop-blur">
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

      {viewer}
    </>
  );
}
