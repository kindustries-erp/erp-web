export function fmtAmt(val: string | null | undefined) {
  if (val == null) return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  return (
    n.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " đ"
  );
}

export function formatVatRateDisplay(
  vatRate: any,
  vatPercentage?: any,
): string {
  if (vatRate != null && vatRate !== "") {
    if (typeof vatRate === "string") {
      const trimmed = vatRate.trim();
      if (trimmed.endsWith("%") || isNaN(Number(trimmed))) {
        return trimmed || "—";
      }
      const num = Number(trimmed);
      if (num <= 1 && num > 0) {
        return `${Math.round(num * 100)}%`;
      }
      return `${num}%`;
    }
    if (typeof vatRate === "number") {
      if (vatRate <= 1 && vatRate > 0) {
        return `${Math.round(vatRate * 100)}%`;
      }
      return `${vatRate}%`;
    }
  }
  if (vatPercentage != null && vatPercentage !== "") {
    const num = Number(vatPercentage);
    if (!isNaN(num)) {
      return `${num}%`;
    }
    return String(vatPercentage);
  }
  return "—";
}

export function getCompVatAmount(item: any): number {
  if (item.vatAmount != null && item.vatAmount !== "") {
    const amt = Number(item.vatAmount);
    if (!isNaN(amt)) return amt;
  }
  const preVat = Number(item.preVatAmount) || 0;
  let rate = 0;
  if (item.vatRate != null && item.vatRate !== "") {
    const r = Number(item.vatRate);
    if (!isNaN(r)) {
      rate = r > 1 ? r / 100 : r;
    }
  } else if (item.vatPercentage != null && item.vatPercentage !== "") {
    const r = Number(item.vatPercentage);
    if (!isNaN(r)) {
      rate = r / 100;
    }
  }
  return preVat * rate;
}

export function getCompTotalAmount(item: any): number {
  if (item.totalAmount != null && item.totalAmount !== "") {
    const amt = Number(item.totalAmount);
    if (!isNaN(amt)) return amt;
  }
  const preVat = Number(item.preVatAmount) || 0;
  return preVat + getCompVatAmount(item);
}
