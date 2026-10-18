import {
  V2_BLANK_VALUE,
  V2_COMPOSITE_SEPARATOR,
  V2_PAGE_SIZE_OPTIONS,
} from "@/v2/shared/types/v2-table";

const LARGE_SCREEN_HEIGHT = 900;
const DEFAULT_LOCALE = "vi-VN";

export const getDefaultPageSize = (viewportHeight?: number): number => {
  const height =
    viewportHeight ??
    (typeof window !== "undefined" ? window.innerHeight : undefined);
  return height !== undefined && height >= LARGE_SCREEN_HEIGHT ? 50 : 20;
};

export const normalizePageSize = (pageSize: number): number =>
  (V2_PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
    ? pageSize
    : getDefaultPageSize();

export const formatCompositeFilterValue = (
  value: string,
  blankLabel?: string,
): string => {
  if (value === V2_BLANK_VALUE) return blankLabel ?? value;
  const index = value.indexOf(V2_COMPOSITE_SEPARATOR);
  if (index < 0) return value;
  const primary = value.slice(0, index).trim();
  const secondary = value
    .slice(index + V2_COMPOSITE_SEPARATOR.length)
    .split(V2_COMPOSITE_SEPARATOR)
    .join(" ")
    .trim();
  if (primary && secondary) return `${primary} (${secondary})`;
  return secondary ? `(${secondary})` : primary;
};

export const formatNumber = (
  value: number,
  locale: string = DEFAULT_LOCALE,
): string => value.toLocaleString(locale);

export const formatAmount = (
  value: number,
  locale: string = DEFAULT_LOCALE,
): string => `${formatNumber(value, locale)} đ`;

const toFiniteNumber = (value: string): number | null => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatNumberOptionLabel = (value: string): string => {
  const parsed = toFiniteNumber(value);
  return parsed === null ? value : formatNumber(parsed);
};

export const formatAmountOptionLabel = (value: string): string => {
  const parsed = toFiniteNumber(value);
  return parsed === null ? value : formatAmount(parsed);
};
