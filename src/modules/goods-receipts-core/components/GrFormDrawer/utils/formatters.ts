export function fmtQty(value?: string | null): string {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "0";
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
