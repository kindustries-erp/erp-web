export interface GarageCustomerDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  customerCode: string | null;
  customerName?: string;
  branchId?: string;
}

export interface CustomerDebtTotals {
  totalRevenue: number;
  totalPaid: number;
  totalBalance: number;
  maxAging: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  agingOver90: number;
  vehicleCount: number;
  recoveryRate: number;
  completedCount: number;
  inProgressCount: number;
  inProgressAmount: number;
}

export interface VehicleDebtStat {
  licensePlate: string;
  latestDate?: string;
  caseCount: number;
  totalRevenue: number;
  totalPaid: number;
  totalBalance: number;
  maxAgingDays: number;
}

export interface AgingDonutItem {
  label: string;
  value: number;
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
  paid: number;
  balance: number;
  count: number;
}
