import type { GarageTimeHorizonKey } from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface GarageTimeHorizonDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  horizon: GarageTimeHorizonKey | null;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  onOpenCustomerDetail?: (code: string, name?: string) => void;
}
