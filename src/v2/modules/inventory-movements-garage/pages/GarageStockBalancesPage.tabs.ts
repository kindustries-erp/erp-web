import {
  AlertTriangle,
  LayoutGrid,
  PackageCheck,
  PackageX,
  type LucideIcon,
} from "lucide-react";
import type { StockTab } from "@/v2/core/inventory-movements";

export interface GarageStockBalanceTabDef {
  tab: StockTab;
  key: string;
  label: string;
  icon: LucideIcon;
}

/** Tab tồn kho Garage: nhãn fallback tiếng Việt, khóa i18n đặt theo `key` */
export const GARAGE_STOCK_BALANCE_TABS: readonly GarageStockBalanceTabDef[] = [
  { tab: "ALL", key: "all", label: "Tất cả", icon: LayoutGrid },
  { tab: "IN_STOCK", key: "inStock", label: "Còn hàng", icon: PackageCheck },
  { tab: "OUT_OF_STOCK", key: "outOfStock", label: "Hết hàng", icon: PackageX },
  { tab: "NEGATIVE", key: "negative", label: "Tồn âm", icon: AlertTriangle },
];
