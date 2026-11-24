import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";

export type GarageKanbanLaneKey =
  | "INTAKE"
  | "QUOTATION"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** Trạng thái vụ việc v2 (enum backend `CaseStatus`); cột Kanban ánh xạ 1-1 qua `GARAGE_LANE_STATUS`. */
export type GarageCaseStatus =
  | "INTAKE"
  | "QUOTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** Công đoạn sửa chữa (`progress_stage`), hiện thành badge trên thẻ xe đang làm. */
export const GARAGE_CASE_STAGES = [
  "WAITING_PARTS",
  "REPAIRING",
  "PAINTING",
  "QC",
  "READY_FOR_DELIVERY",
] as const;
export type GarageCaseStage = (typeof GARAGE_CASE_STAGES)[number];

/** Thông tin v2 của một vụ việc (từ `GET /api/v2/cases-garage/progress`), tra theo `case.id`. */
export interface GarageCaseV2Info {
  status: GarageCaseStatus;
  progressStage: GarageCaseStage | null;
  /** `status` đang bị sửa đè ở v2 so với KGara. */
  statusOverridden: boolean;
}

export type GarageCaseV2InfoMap = Readonly<Record<string, GarageCaseV2Info>>;

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
  /** Công đoạn của phiếu đang làm đầu tiên (chỉ có khi đã tải thông tin v2). */
  progressStage?: GarageCaseStage | null;
  /** Có phiếu nào trong thẻ bị sửa đè trạng thái ở v2. */
  statusOverridden?: boolean;
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
