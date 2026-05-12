export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Consultar precio";
  }

  const numberValue = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numberValue)) {
    return "Consultar precio";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(numberValue);
}
