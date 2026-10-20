export interface V2NumberFormatOptions {
  decimals: number;
  allowNegative: boolean;
}

const DECIMAL_SEPARATOR = ",";

/** Giữ lại ký tự hợp lệ: chữ số, một dấu thập phân (`,`) và dấu trừ ở đầu. Dấu `.` (phân cách nghìn) bị bỏ */
export const sanitizeNumberText = (
  text: string,
  { decimals, allowNegative }: V2NumberFormatOptions,
): string => {
  const negative = allowNegative && text.trimStart().startsWith("-");
  let body = text.replace(/[^0-9,]/g, "");
  if (decimals <= 0) {
    body = body.replace(/,/g, "");
  } else {
    const [whole = "", ...rest] = body.split(DECIMAL_SEPARATOR);
    body = rest.length
      ? `${whole}${DECIMAL_SEPARATOR}${rest.join("").slice(0, decimals)}`
      : whole;
  }
  return `${negative ? "-" : ""}${body}`;
};

/** Chuỗi đã làm sạch thành số; `null` nếu rỗng hoặc chưa thành số */
export const parseNumberText = (
  text: string,
  options: V2NumberFormatOptions,
): number | null => {
  const clean = sanitizeNumberText(text, options);
  if (clean === "" || clean === "-" || clean === DECIMAL_SEPARATOR) return null;
  const value = Number(clean.replace(DECIMAL_SEPARATOR, "."));
  return Number.isFinite(value) ? value : null;
};

export const formatNumberValue = (
  value: number | null,
  decimals: number,
  locale: string,
): string =>
  value === null
    ? ""
    : new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.max(0, decimals),
      }).format(value);

/** Chuỗi dùng khi đang gõ: không có dấu phân cách nghìn, thập phân là `,` */
export const toEditableText = (value: number | null): string =>
  value === null ? "" : String(value).replace(".", DECIMAL_SEPARATOR);

export const clampNumber = (
  value: number,
  min?: number,
  max?: number,
): number => {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
};
