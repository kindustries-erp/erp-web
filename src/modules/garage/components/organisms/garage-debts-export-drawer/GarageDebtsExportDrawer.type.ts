import type { GarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";

export interface GarageDebtsExportDrawerProps {
  open: boolean;
  onClose: () => void;
  branchId?: string;
  /** Bảng đang mở drawer; thiếu thì chỉ xuất theo kỳ. */
  context?: GarageDebtsExportContext;
}
