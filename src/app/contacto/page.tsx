import { siteConfig } from "@/lib/site";

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hola Credifer, quiero hacer una consulta desde la web.",
  )}`;

  return (
    <section className="container-page py-14">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Contacto
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
        Hablá con Credifer
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
        Para consultar productos, cuotas, promociones o disponibilidad, escribí
        directamente por WhatsApp.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--whatsapp-dark)] focus-ring"
      >
        Consultar por WhatsApp
      </a>
    </section>
  );
}
