import type { TabItem } from "@/shared/components/PageLayout";
import type { VehicleStockType } from "@/pages/hooks/useVinfastPartsStockStore";

export type { VehicleStockType };

export interface VinfastPartsStockRow {
  sku: string;
  name?: string;
  uom?: string;
  qtyIn?: number;
  qtyOut?: number;
  qtyBalance?: number;
  vehicleType?: string;
  [key: string]: any;
}

export interface VinfastPartsStockTableProps {
  vehicleType: VehicleStockType;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (nextTab: string) => void;
}
