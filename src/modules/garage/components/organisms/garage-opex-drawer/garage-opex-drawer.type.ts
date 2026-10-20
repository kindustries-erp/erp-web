import type { GarageOpexItem } from "@/modules/garage/api/garageOpexApi";

export type CostGroupType = "OPEX" | "COGS" | "COMMISSION";

export interface GarageOpexDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  setMode: (mode: "view" | "edit") => void;
  isCreate?: boolean;
  id?: string | null;
  initialData?: GarageOpexItem | null;
  onSuccess?: () => void;
}

export interface CategoryPreset {
  key: string;
  group: CostGroupType;
  labelKey: string;
  defaultName: string;
  badge?: string;
}

export interface CostGroupOption {
  key: CostGroupType;
  labelKey: string;
  defaultLabel: string;
}
