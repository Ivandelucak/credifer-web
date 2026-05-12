export default function AdminProductsPage() {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Productos
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
        Gestión de productos
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        En el próximo paso vamos a listar productos, buscar, filtrar, editar,
        ocultar y crear nuevos productos.
      </p>
    </div>
  );
}
