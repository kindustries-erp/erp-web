import {
  AlertTriangle,
  Coins,
  LayoutGrid,
  Package,
  PackageCheck,
  PackageX,
  type LucideIcon,
} from "lucide-react";
import type { StockTab } from "@/v2/core/inventory-movements";
import type {
  V2StatusChipTone,
  V2TabMetric,
} from "@/v2/shared/components/molecules/v2-tab-bar";

export interface GarageStockBalanceTabDef {
  tab: StockTab;
  key: string;
  label: string;
  icon: LucideIcon;
  tone: V2StatusChipTone;
}

/** Tab tồn kho Garage: nhãn fallback tiếng Việt, khóa i18n đặt theo `key`, `tone` là chấm màu của chip */
export const GARAGE_STOCK_BALANCE_TABS: readonly GarageStockBalanceTabDef[] = [
  {
    tab: "ALL",
    key: "all",
    label: "Tất cả",
    icon: LayoutGrid,
    tone: "neutral",
  },
  {
    tab: "IN_STOCK",
    key: "inStock",
    label: "Còn hàng",
    icon: PackageCheck,
    tone: "success",
  },
  {
    tab: "OUT_OF_STOCK",
    key: "outOfStock",
    label: "Hết hàng",
    icon: PackageX,
    tone: "muted",
  },
  {
    tab: "NEGATIVE",
    key: "negative",
    label: "Tồn âm",
    icon: AlertTriangle,
    tone: "warning",
  },
];

const numberFormatter = new Intl.NumberFormat("vi-VN");

/** Format giá trị tiền tinh gọn cho card tab (tránh tràn cắt ba chấm) */
export function formatCompactCurrency(val: number): string {
  if (val >= 1_000_000_000) {
    const b = (val / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `${b} tỷ ₫`;
  }
  if (val >= 1_000_000) {
    const m = (val / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `${m}M ₫`;
  }
  return `${numberFormatter.format(val)} ₫`;
}

/** Tạo mảng metrics kèm micro-icon và tooltip cho tab tồn kho */
export function buildGarageStockTabMetrics(
  tab: StockTab,
  totalQty?: number,
  totalValue?: number,
): V2TabMetric[] | undefined {
  if (totalQty === undefined) return undefined;
  if (tab === "ALL" || tab === "IN_STOCK") {
    const qtyStr = numberFormatter.format(totalQty);
    const metrics: V2TabMetric[] = [
      {
        value: qtyStr,
        icon: Package,
        tooltip: `Tổng tồn kho: ${qtyStr} sản phẩm`,
      },
    ];
    if (totalValue !== undefined && totalValue > 0) {
      metrics.push({
        value: formatCompactCurrency(totalValue),
        icon: Coins,
        tooltip: `Tổng giá trị tồn: ${numberFormatter.format(totalValue)} ₫`,
      });
    }
    return metrics;
  }
  if (tab === "OUT_OF_STOCK" || tab === "NEGATIVE") {
    return [
      {
        value: "0",
        icon: Package,
        tooltip: `Tổng tồn kho: 0 sản phẩm`,
      },
      {
        value: "0 ₫",
        icon: Coins,
        tooltip: `Tổng giá trị tồn: 0 ₫`,
      },
    ];
  }
  return undefined;
}
