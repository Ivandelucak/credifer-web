export default function AdminImportPage() {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        Importación
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
        Importar productos
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        Más adelante vamos a traer el importador de Excel al panel para que no
        dependa solamente de scripts locales.
      </p>
    </div>
  );
}
