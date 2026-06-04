// src/components/admin/ProductExcelImportPanel.tsx
"use client";

import { useState } from "react";

type ProductImportRow = {
  rowNumber: number;
  accion: "ACTUALIZAR" | "CREAR_NUEVO" | "DESACTIVAR";
  productId: number | null;
  codigoActual: string | null;
  slugActual: string | null;
  slugFinal: string;
  nombreActual: string | null;
  nombreFinal: string;
  precioActual: number | null;
  precioFinal: number | null;
  actualizarNombre: boolean;
  actualizarSlug: boolean;
  categoriaFinal: string | null;
  categoriaSlugFinal: string | null;
  subcategoriaFinal: string | null;
  subcategoriaSlugFinal: string | null;
  marcaFinal: string | null;
  marcaSlugFinal: string | null;
  imagenesActuales: number;
};

type ProductImportSummary = {
  totalRows: number;
  updateRows: number;
  createRows: number;
  deactivateRows: number;
  rowsWithImages: number;
  rowsWithoutProductId: number;
  invalidRows: string[];
};

type PreviewResponse = {
  summary: ProductImportSummary;
  rows: ProductImportRow[];
  error?: string;
};

type ApplyResponse = {
  result: {
    updated: number;
    created: number;
    deactivated: number;
    skipped: number;
    errors: string[];
  };
  error?: string;
};

export function ProductExcelImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<ProductImportSummary | null>(null);
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [applyResult, setApplyResult] = useState<
    ApplyResponse["result"] | null
  >(null);

  async function handlePreview() {
    if (!file) {
      setMessage({
        type: "error",
        text: "Seleccioná un archivo Excel.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoadingPreview(true);
    setMessage(null);
    setApplyResult(null);

    try {
      const response = await fetch("/api/admin/product-import/preview", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as PreviewResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo procesar el archivo.");
      }

      setSummary(data.summary);
      setRows(data.rows);

      setMessage({
        type: "success",
        text: "Preview generado correctamente. Revisá el resumen antes de aplicar.",
      });
    } catch (error) {
      setSummary(null);
      setRows([]);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo procesar el archivo.",
      });
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleApply() {
    if (!summary || rows.length === 0) return;

    if (summary.invalidRows.length > 0) {
      setMessage({
        type: "error",
        text: "Hay errores en el archivo. Corregilos antes de aplicar.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Vas a aplicar la actualización:\n\n${summary.updateRows} actualizaciones\n${summary.createRows} productos nuevos\n${summary.deactivateRows} productos a desactivar\n\nNo se tocarán imágenes ni descripciones.\n\n¿Confirmás la operación?`,
    );

    if (!confirmed) return;

    setApplying(true);
    setMessage(null);
    setApplyResult(null);

    try {
      const response = await fetch("/api/admin/product-import/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows,
        }),
      });

      const data = (await response.json()) as ApplyResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo aplicar la importación.");
      }

      setApplyResult(data.result);

      setMessage({
        type: "success",
        text: "Importación aplicada correctamente.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo aplicar la importación.",
      });
    } finally {
      setApplying(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Importación
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
            Actualizar productos por Excel
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Subí el Excel final limpio. El sistema primero genera una vista
            previa y recién después permite aplicar los cambios. No se eliminan
            imágenes ni descripciones cargadas manualmente.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[#A9B8C9] bg-[#F8FBFE] p-4">
        <label className="block text-xs font-black uppercase tracking-[0.14em] text-[#596D84]">
          Archivo Excel
        </label>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setSummary(null);
              setRows([]);
              setApplyResult(null);
              setMessage(null);
            }}
            className="rounded-2xl border border-[#8FA2B8] bg-white px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--brand-blue)] file:px-4 file:py-2 file:text-sm file:font-black file:text-white focus:border-[var(--brand-blue)]"
          />

          <button
            type="button"
            onClick={handlePreview}
            disabled={loadingPreview || !file}
            className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#8FA2B8] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
          >
            {loadingPreview ? "Procesando..." : "Generar preview"}
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={
              applying ||
              !summary ||
              rows.length === 0 ||
              summary.invalidRows.length > 0
            }
            className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
          >
            {applying ? "Aplicando..." : "Aplicar actualización"}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {summary ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#A9B8C9] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
              Total
            </p>
            <p className="mt-2 text-3xl font-black text-[#0B3558]">
              {summary.totalRows}
            </p>
          </div>

          <div className="rounded-2xl border border-[#A9B8C9] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
              Actualizar
            </p>
            <p className="mt-2 text-3xl font-black text-[var(--brand-blue)]">
              {summary.updateRows}
            </p>
          </div>

          <div className="rounded-2xl border border-[#A9B8C9] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
              Crear
            </p>
            <p className="mt-2 text-3xl font-black text-[var(--brand-green)]">
              {summary.createRows}
            </p>
          </div>

          <div className="rounded-2xl border border-[#A9B8C9] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
              Desactivar
            </p>
            <p className="mt-2 text-3xl font-black text-[var(--brand-red)]">
              {summary.deactivateRows}
            </p>
          </div>

          <div className="rounded-2xl border border-[#A9B8C9] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
              Con imágenes
            </p>
            <p className="mt-2 text-3xl font-black text-[#0B3558]">
              {summary.rowsWithImages}
            </p>
          </div>
        </div>
      ) : null}

      {summary?.invalidRows.length ? (
        <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-black text-red-700">
            Hay errores para revisar
          </p>

          <ul className="mt-3 space-y-2 text-sm font-bold text-red-700">
            {summary.invalidRows.slice(0, 10).map((error) => (
              <li key={error}>• {error}</li>
            ))}
          </ul>

          {summary.invalidRows.length > 10 ? (
            <p className="mt-3 text-xs font-bold text-red-700">
              Y {summary.invalidRows.length - 10} errores más.
            </p>
          ) : null}
        </div>
      ) : null}

      {applyResult ? (
        <div className="mt-6 rounded-[1.5rem] border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-black text-green-700">
            Resultado aplicado
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <p className="text-sm font-bold text-green-700">
              Actualizados: {applyResult.updated}
            </p>
            <p className="text-sm font-bold text-green-700">
              Creados: {applyResult.created}
            </p>
            <p className="text-sm font-bold text-green-700">
              Desactivados: {applyResult.deactivated}
            </p>
            <p className="text-sm font-bold text-green-700">
              Omitidos: {applyResult.skipped}
            </p>
          </div>

          {applyResult.errors.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-black text-yellow-800">
                Observaciones
              </p>

              <ul className="mt-3 space-y-2 text-xs font-bold text-yellow-800">
                {applyResult.errors.slice(0, 12).map((error) => (
                  <li key={error}>• {error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
