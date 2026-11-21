import React from "react";
import {
  Clock,
  FileSpreadsheet,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { GarageKanbanLaneDefinition } from "./garageCaseKanban.type";

export interface GarageLaneVisualConfig extends GarageKanbanLaneDefinition {
  icon: React.ComponentType<{ className?: string }>;
}

export const GARAGE_KANBAN_LANES: GarageLaneVisualConfig[] = [
  {
    key: "INTAKE",
    titleKey: "v2.garageCases.kanban.laneIntake",
    defaultTitle: "Tiếp nhận",
    accentColor: "#0284c7", // Sky/Blue neutral token
    icon: Clock,
  },
  {
    key: "QUOTATION",
    titleKey: "v2.garageCases.kanban.laneQuotation",
    defaultTitle: "Báo giá",
    accentColor: "#eab308", // Amber/Yellow
    icon: FileSpreadsheet,
  },
  {
    key: "IN_PROGRESS",
    titleKey: "v2.garageCases.kanban.laneInProgress",
    defaultTitle: "Đang làm",
    accentColor: "#f97316", // Orange/Amber
    icon: Wrench,
  },
  {
    key: "COMPLETED",
    titleKey: "v2.garageCases.kanban.laneCompleted",
    defaultTitle: "Hoàn thành",
    accentColor: "#10b981", // Emerald
    icon: CheckCircle2,
  },
  {
    key: "CANCELLED",
    titleKey: "v2.garageCases.kanban.laneCancelled",
    defaultTitle: "Hủy",
    accentColor: "#f43f5e", // Rose
    icon: XCircle,
  },
];
