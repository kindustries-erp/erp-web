import type { GarageOpexTableQuery } from "@/modules/garage/export/garageExportScopes";

export interface GarageOpexExportDrawerProps {
  open: boolean;
  onClose: () => void;
  query?: GarageOpexTableQuery;
  filterCount?: number;
  initialCostGroup?: string;
}
