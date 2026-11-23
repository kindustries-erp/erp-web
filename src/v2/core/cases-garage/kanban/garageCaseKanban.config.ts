import React from "react";
import {
  Clock,
  FileSpreadsheet,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
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
