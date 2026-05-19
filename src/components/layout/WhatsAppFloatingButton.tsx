import { siteConfig } from "@/lib/site";

export function WhatsAppFloatingButton() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hola Credifer, quiero consultar por productos de la tienda online.",
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[var(--whatsapp)] text-slate-950 shadow-[0_16px_35px_rgba(37,211,102,0.38)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-3"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-6 w-6 sm:h-6 sm:w-6"
        fill="currentColor"
      >
        <path d="M16.04 3.2A12.74 12.74 0 0 0 5.18 22.6L3.6 28.8l6.35-1.52A12.8 12.8 0 1 0 16.04 3.2Zm0 2.33a10.46 10.46 0 1 1-5.32 19.47l-.38-.22-3.77.9.94-3.66-.25-.39A10.46 10.46 0 0 1 16.04 5.53Zm-4.12 4.78c-.23 0-.6.08-.92.43-.31.34-1.2 1.17-1.2 2.84s1.23 3.3 1.4 3.52c.17.23 2.38 3.82 5.87 5.2 2.9 1.14 3.5.92 4.13.86.64-.06 2.05-.84 2.34-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4-.34-.17-2.05-1-2.37-1.12-.31-.12-.54-.17-.77.17-.23.35-.88 1.12-1.08 1.35-.2.23-.4.26-.75.09-.35-.17-1.45-.53-2.76-1.7-1.02-.9-1.71-2.02-1.91-2.36-.2-.35-.02-.54.15-.7.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.9-1.08-2.6-.28-.68-.57-.58-.78-.6h-.65Z" />
      </svg>

      <span className="hidden text-sm font-black sm:inline">Consultar</span>
    </a>
  );
}
