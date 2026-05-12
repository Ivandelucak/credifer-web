export default function ProductsPage() {
  return (
    <section className="container-page py-14">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Catálogo
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">
        Productos
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
        En el próximo paso vamos a conectar esta sección con la base de datos y
        mostrar los productos importados desde el Excel.
      </p>
    </section>
  );
}
