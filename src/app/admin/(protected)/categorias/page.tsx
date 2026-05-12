export default function AdminCategoriesPage() {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Categorías
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
        Gestión de categorías
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        En el próximo paso vamos a permitir crear, editar, ordenar y ocultar
        categorías del catálogo.
      </p>
    </div>
  );
}
