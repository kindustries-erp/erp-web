import type { LedgerDisplayRow } from "./fifoTransform";
import { formatMoney, formatPercent, formatQty } from "./fifoFilters";

export interface FilterOption {
  label: string;
  value: string;
}

type OptionsMap = Record<string, FilterOption[]>;

const TEXT_OPTION_KEYS = ["invoiceNo", "partnerName"] as const;

const NUMBER_OPTION_KEYS: {
  key: keyof LedgerDisplayRow;
  format: (value: number) => string;
}[] = [
  { key: "inQty", format: formatQty },
  { key: "outQty", format: formatQty },
  { key: "balanceQty", format: formatQty },
  { key: "inTotal", format: formatMoney },
  { key: "outCogs", format: formatMoney },
  { key: "balanceValue", format: formatMoney },
  { key: "outRevenue", format: formatMoney },
  { key: "outProfit", format: formatMoney },
  { key: "inUnitCost", format: formatMoney },
  { key: "outUnitCost", format: formatMoney },
  { key: "outSellPrice", format: formatMoney },
  { key: "outMargin", format: formatPercent },
];

function toOption(value: string): FilterOption {
  return { label: value, value };
}

/**
 * Lựa chọn lọc cho từng cột. Mỗi cột lấy giá trị từ các dòng còn lại sau khi
 * áp dụng mọi bộ lọc khác (`getFiltered(cột)`).
 */
export function buildOptionsMap(
  getFiltered: (colToSkip: string) => LedgerDisplayRow[],
): OptionsMap {
  const map: OptionsMap = {};

  for (const key of TEXT_OPTION_KEYS) {
    const values = new Set<string>();
    getFiltered(key).forEach((r) => {
      const v = r[key];
      if (v) values.add(v);
    });
    map[key] = Array.from(values)
      .sort((a, b) => a.localeCompare(b))
      .map(toOption);
  }

  for (const { key, format } of NUMBER_OPTION_KEYS) {
    const values = new Set<number>();
    getFiltered(key).forEach((r) => {
      const v = r[key];
      if (v != null) values.add(v as number);
    });
    map[key] = Array.from(values)
      .sort((a, b) => a - b)
      .map((v) => toOption(format(v)));
  }

  return map;
}
