export function money(value: unknown) {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

export function compactMoney(value: unknown) {
  const n = Number(value || 0);
  if (Math.abs(n) >= 1_000_000_000) {
    return (
      (n / 1_000_000_000).toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      }) + " Tỷ đ"
    );
  }
  if (Math.abs(n) >= 1_000_000) {
    return (
      (n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
      " Tr đ"
    );
  }
  return money(n);
}

export function normalizeDate(value?: string | null) {
  return value ? String(value).slice(0, 10) : "";
}

export function normalizeDateTime(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return String(value);
  }
}

export function normalizeDateTimeGMT7(value?: string | null) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const partMap = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
  } catch {
    return String(value);
  }
}

export function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function fmtQty(value?: number | string | null) {
  if (value == null) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

export function formatGMT7(
  value?: string | null,
  formatStr: "date" | "datetime" | "datetime-sec" = "date",
) {
  if (!value) return "—";
  try {
    let valStr = value;
    if (
      typeof valStr === "string" &&
      valStr.length > 10 &&
      !valStr.endsWith("Z") &&
      !valStr.match(/[+-]\d{2}:?\d{2}$/)
    ) {
      if (valStr.includes(" ")) valStr = valStr.replace(" ", "T");
      valStr += "Z";
    }
    const d = new Date(valStr);
    if (isNaN(d.getTime())) return value;
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: formatStr.startsWith("datetime") ? "2-digit" : undefined,
      minute: formatStr.startsWith("datetime") ? "2-digit" : undefined,
      second: formatStr === "datetime-sec" ? "2-digit" : undefined,
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const partMap = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    if (formatStr === "date") {
      return `${partMap.day}/${partMap.month}/${partMap.year}`;
    }
    if (formatStr === "datetime-sec") {
      return `${partMap.day}/${partMap.month}/${partMap.year} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
    }
    return `${partMap.day}/${partMap.month}/${partMap.year} ${partMap.hour}:${partMap.minute}`;
  } catch {
    return String(value);
  }
}

export function extractItemCodeAndName(
  code?: string | null,
  name?: string | null,
  fallbackLabel?: string | null,
) {
  let finalCode = code || "";
  let finalName = name || "";

  if (!finalCode && fallbackLabel) {
    const parts = fallbackLabel.split(" — ");
    if (parts.length > 1) {
      finalCode = parts[0];
      finalName = parts.slice(1).join(" — ");
    } else {
      finalName = fallbackLabel;
    }
  } else if (finalCode && finalName.startsWith(`${finalCode} — `)) {
    finalName = finalName.substring(finalCode.length + 3);
  } else if (finalCode && finalName.startsWith(`${finalCode}-`)) {
    finalName = finalName.substring(finalCode.length + 1).trim();
  }

  return { code: finalCode, name: finalName };
}
