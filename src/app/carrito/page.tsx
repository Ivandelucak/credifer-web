export default function CartPage() {
  return (
    <section className="container-page py-14">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Consulta
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
        Carrito
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
        El carrito va a permitir agrupar productos y generar un mensaje
        automático para WhatsApp con el detalle completo de la consulta.
      </p>
    </section>
  );
}
