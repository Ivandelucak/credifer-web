import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Nuevo producto
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
        Crear producto
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        En el próximo paso vamos a implementar el formulario completo para crear
        productos, asignar categoría, precio, descripción e imágenes.
      </p>

      <Link
        href="/admin/productos"
        className="mt-8 inline-flex rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
      >
        Volver a productos
      </Link>
    </div>
  );
}
