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

/**
 * Ultra-compact currency for dense table cells.
 * Examples: 25tr | 200tr | 1,2tỷ | 500k
 * Always show the full value in a <Tooltip> alongside this.
 */
export function shortMoney(value: unknown) {
  const n = Number(value || 0);
  if (n === 0) return "0";
  if (Math.abs(n) >= 1_000_000_000) {
    return (
      (n / 1_000_000_000).toLocaleString("vi-VN", {
        maximumFractionDigits: 1,
      }) + "tỷ"
    );
  }
  if (Math.abs(n) >= 1_000_000) {
    return (
      (n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) +
      "tr"
    );
  }
  if (Math.abs(n) >= 1_000) {
    return (
      (n / 1_000).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "k"
    );
  }
  return n.toLocaleString("vi-VN");
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

export function readVietnameseCurrency(num: number): string {
  if (!num || num <= 0 || isNaN(num)) return "";
  const digits = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readThreeDigits(n: number, isHighest: boolean): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    let res = "";

    if (hundred > 0 || !isHighest) {
      res += digits[hundred] + " trăm ";
    }

    if (ten > 1) {
      res += digits[ten] + " mươi ";
      if (one === 1) res += "mốt ";
      else if (one === 5) res += "lăm ";
      else if (one > 0) res += digits[one] + " ";
    } else if (ten === 1) {
      res += "mười ";
      if (one === 5) res += "lăm ";
      else if (one > 0) res += digits[one] + " ";
    } else if (ten === 0 && one > 0) {
      if (hundred > 0 || !isHighest) res += "lẻ ";
      res += digits[one] + " ";
    }

    return res.trim();
  }

  const s = Math.floor(num).toString();
  const groups: number[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    groups.push(parseInt(s.substring(Math.max(0, i - 3), i), 10));
  }

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const isHighest = i === groups.length - 1;
      const groupText = readThreeDigits(g, isHighest);
      result += groupText + " " + units[i] + " ";
    }
  }

  result = result.trim() + " đồng";
  return result.charAt(0).toUpperCase() + result.slice(1);
}
