import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";

export type GarageKanbanLaneKey =
  | "INTAKE"
  | "QUOTATION"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface GarageVehicleKanbanItem {
  id: string; // [Biển số xe]::[Mốc tiến độ] làm key định danh duy nhất của card
  licensePlate: string;
  customerName: string;
  customerCode?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  modelYear?: number | null;
  chassisNumber?: string | null;
  laneKey: GarageKanbanLaneKey;
  caseCount: number;
  cases: GarageCaseDetailRow[];
  totalBilled: number;
  totalPaid: number;
  totalRemaining: number;
  totalCost: number;
  totalProfit: number;
  latestDate?: string;
  latestCaseCode?: string;
  latestStatus?: string;
}

export interface GarageKanbanAccentConfig {
  /** Token CSS Variable ngữ nghĩa (ví dụ: "var(--muted-fg)") */
  token: string;
  /** Tailwind semantic class (ví dụ: "bg-muted-fg") */
  className: string;
  /** Mã hex dự phòng an toàn */
  fallbackHex: string;
}

export interface GarageKanbanLaneDefinition {
  key: GarageKanbanLaneKey;
  titleKey: string;
  defaultTitle: string;
  accentColor: string;
  accentClassName?: string;
}
