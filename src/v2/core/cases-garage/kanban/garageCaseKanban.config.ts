import React from "react";
import {
  Clock,
  FileSpreadsheet,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
  GarageCaseStage,
  GarageCaseStatus,
  GarageKanbanLaneDefinition,
  GarageKanbanLaneKey,
  GarageKanbanAccentConfig,
} from "./garageCaseKanban.type";

export interface GarageLaneVisualConfig extends GarageKanbanLaneDefinition {
  icon: React.ComponentType<{ className?: string }>;
}

export const GARAGE_KANBAN_LANE_ACCENTS: Record<
  GarageKanbanLaneKey,
  GarageKanbanAccentConfig
> = {
  INTAKE: {
    token: "var(--muted-fg)",
    className: "bg-muted-fg",
    fallbackHex: "#64748b",
  },
  QUOTATION: {
    token: "var(--warn-fg)",
    className: "bg-warning",
    fallbackHex: "#eab308",
  },
  IN_PROGRESS: {
    token: "var(--amber-500, #f59e0b)",
    className: "bg-amber-500",
    fallbackHex: "#f59e0b",
  },
  COMPLETED: {
    token: "var(--approve-fg)",
    className: "bg-success",
    fallbackHex: "#10b981",
  },
  CANCELLED: {
    token: "var(--destructive)",
    className: "bg-destructive",
    fallbackHex: "#ef4444",
  },
} as const;

/** Công đoạn → key locale và nhãn mặc định (badge trên thẻ xe đang làm). */
export const GARAGE_STAGE_LABELS: Record<
  GarageCaseStage,
  { key: string; defaultLabel: string }
> = {
  WAITING_PARTS: {
    key: "v2.garageCases.kanban.stageWaitingParts",
    defaultLabel: "Chờ phụ tùng",
  },
  REPAIRING: {
    key: "v2.garageCases.kanban.stageRepairing",
    defaultLabel: "Đang sửa",
  },
  PAINTING: {
    key: "v2.garageCases.kanban.stagePainting",
    defaultLabel: "Sơn",
  },
  QC: {
    key: "v2.garageCases.kanban.stageQc",
    defaultLabel: "Kiểm tra chất lượng",
  },
  READY_FOR_DELIVERY: {
    key: "v2.garageCases.kanban.stageReadyForDelivery",
    defaultLabel: "Sẵn sàng giao",
  },
};

/** Cột Kanban → `status` v2 gửi lên `PATCH :id/status`. */
export const GARAGE_LANE_STATUS: Record<GarageKanbanLaneKey, GarageCaseStatus> =
  {
    INTAKE: "INTAKE",
    QUOTATION: "QUOTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };

const STATUS_LANE: Record<GarageCaseStatus, GarageKanbanLaneKey> = {
  INTAKE: "INTAKE",
  QUOTED: "QUOTATION",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

/** Mã `tinh_trang_dich_vu` của KGara → cột; cùng bảng ánh xạ với backend `kgara-status.map.ts`. */
const KGARA_CODE_LANE: Record<number, GarageKanbanLaneKey> = {
  0: "INTAKE",
  1: "QUOTATION",
  2: "IN_PROGRESS",
  3: "COMPLETED",
  9: "CANCELLED",
};

export function statusToLane(status: GarageCaseStatus): GarageKanbanLaneKey {
  return STATUS_LANE[status] ?? "INTAKE";
}

/** Mã thiếu hoặc lạ rơi về INTAKE, giống backend. */
export function kgaraCodeToLane(
  code: number | null | undefined,
): GarageKanbanLaneKey {
  return (code != null && KGARA_CODE_LANE[code]) || "INTAKE";
}

export function getGarageKanbanLaneAccent(
  key: GarageKanbanLaneKey,
): GarageKanbanAccentConfig {
  return GARAGE_KANBAN_LANE_ACCENTS[key] ?? GARAGE_KANBAN_LANE_ACCENTS.INTAKE;
}

export const GARAGE_KANBAN_LANES: GarageLaneVisualConfig[] = [
  {
    key: "INTAKE",
    titleKey: "v2.garageCases.kanban.laneIntake",
    defaultTitle: "Tiếp nhận",
    accentColor: GARAGE_KANBAN_LANE_ACCENTS.INTAKE.token,
    accentClassName: GARAGE_KANBAN_LANE_ACCENTS.INTAKE.className,
    icon: Clock,
  },
  {
    key: "QUOTATION",
    titleKey: "v2.garageCases.kanban.laneQuotation",
    defaultTitle: "Báo giá",
    accentColor: GARAGE_KANBAN_LANE_ACCENTS.QUOTATION.token,
    accentClassName: GARAGE_KANBAN_LANE_ACCENTS.QUOTATION.className,
    icon: FileSpreadsheet,
  },
  {
    key: "IN_PROGRESS",
    titleKey: "v2.garageCases.kanban.laneInProgress",
    defaultTitle: "Đang làm",
    accentColor: GARAGE_KANBAN_LANE_ACCENTS.IN_PROGRESS.token,
    accentClassName: GARAGE_KANBAN_LANE_ACCENTS.IN_PROGRESS.className,
    icon: Wrench,
  },
  {
    key: "COMPLETED",
    titleKey: "v2.garageCases.kanban.laneCompleted",
    defaultTitle: "Hoàn thành",
    accentColor: GARAGE_KANBAN_LANE_ACCENTS.COMPLETED.token,
    accentClassName: GARAGE_KANBAN_LANE_ACCENTS.COMPLETED.className,
    icon: CheckCircle2,
  },
  {
    key: "CANCELLED",
    titleKey: "v2.garageCases.kanban.laneCancelled",
    defaultTitle: "Hủy",
    accentColor: GARAGE_KANBAN_LANE_ACCENTS.CANCELLED.token,
    accentClassName: GARAGE_KANBAN_LANE_ACCENTS.CANCELLED.className,
    icon: XCircle,
  },
];
