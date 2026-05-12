export default function HowToBuyPage() {
  return (
    <section className="container-page py-14">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Guía de compra
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
        Cómo comprar en Credifer
      </h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            1. Elegí productos
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Navegá el catálogo, revisá el precio contado y agregá productos al
            carrito.
          </p>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            2. Enviá la consulta
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            El sistema genera un mensaje automático para WhatsApp con los
            productos seleccionados.
          </p>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            3. Coordiná cuotas
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Un vendedor confirma condiciones, financiación, requisitos y formas
            de entrega.
          </p>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            4. Confirmá la operación
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            La venta se termina de gestionar por WhatsApp de manera
            personalizada.
          </p>
        </article>
      </div>
    </section>
  );
}
