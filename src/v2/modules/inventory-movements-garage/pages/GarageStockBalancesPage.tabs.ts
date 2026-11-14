import {
  AlertTriangle,
  LayoutGrid,
  PackageCheck,
  PackageX,
  type LucideIcon,
} from "lucide-react";
import type { StockTab } from "@/v2/core/inventory-movements";
import type { V2StatusChipTone } from "@/v2/shared/components/molecules/v2-tab-bar";

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
