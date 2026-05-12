export default function CategoriesPage() {
  return (
    <section className="container-page py-14">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Secciones
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
        Categorías
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
        Acá vamos a listar las categorías reales del catálogo y también generar
        accesos rápidos como /parlantes, /celulares o /electrodomesticos.
      </p>
    </section>
  );
}
