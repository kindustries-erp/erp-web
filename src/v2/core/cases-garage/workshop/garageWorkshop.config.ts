import type { V2BadgeVariantType } from "@/v2/shared/components/atoms/v2-badge";
import type { WorkshopCaseStatus } from "./garageWorkshop.type";

export interface WorkshopStatusConfig {
  key: WorkshopCaseStatus;
  /** Khóa locale `v2.garageCases.workshop.status.<key>`. */
  labelKey: string;
  defaultLabel: string;
  badge: V2BadgeVariantType;
  /** Token CSS cho vạch màu cột Kanban. */
  accentColor: string;
  accentClassName: string;
  /** Status nhỏ theo thứ tự hiển thị; khớp backend `case-progress-stage.map.ts`. */
  stages: readonly string[];
}

const label = (k: string) => `v2.garageCases.workshop.status.${k}`;

/** 5 status v2 theo thứ tự quy trình xưởng. Màu chỉ dùng token theme (không `blue-*`, không hex). */
export const WORKSHOP_STATUSES: readonly WorkshopStatusConfig[] = [
  {
    key: "INTAKE",
    labelKey: label("INTAKE"),
    defaultLabel: "Tiếp nhận",
    badge: "secondary",
    accentColor: "var(--muted-fg)",
    accentClassName: "bg-muted-fg",
    stages: ["AWAITING_INSPECTION", "INSPECTED", "AWAITING_QUOTE"],
  },
  {
    key: "QUOTED",
    labelKey: label("QUOTED"),
    defaultLabel: "Báo giá",
    badge: "warning",
    accentColor: "var(--warn-fg)",
    accentClassName: "bg-warning",
    stages: ["AWAITING_APPROVAL", "CUSTOMER_APPROVED", "QUOTE_REVISION"],
  },
  {
    key: "IN_PROGRESS",
    labelKey: label("IN_PROGRESS"),
    defaultLabel: "Đang làm",
    badge: "default",
    accentColor: "var(--primary)",
    accentClassName: "bg-primary",
    stages: [
      "WAITING_PARTS",
      "REPAIRING",
      "PAINTING",
      "QC",
      "READY_FOR_DELIVERY",
    ],
  },
  {
    key: "COMPLETED",
    labelKey: label("COMPLETED"),
    defaultLabel: "Hoàn thành",
    badge: "success",
    accentColor: "var(--approve-fg)",
    accentClassName: "bg-success",
    stages: ["AWAITING_PAYMENT", "DELIVERED"],
  },
  {
    key: "CANCELLED",
    labelKey: label("CANCELLED"),
    defaultLabel: "Hủy",
    badge: "destructive",
    accentColor: "var(--destructive)",
    accentClassName: "bg-destructive",
    stages: ["CUSTOMER_CANCELLED", "INTERNAL_CANCELLED"],
  },
];

/** Nhãn mặc định (VI) của status nhỏ; nhãn hiển thị lấy qua `v2.garageCases.workshop.stage.<code>`. */
export const WORKSHOP_STAGE_DEFAULT_LABELS: Readonly<Record<string, string>> = {
  AWAITING_INSPECTION: "Chờ kiểm tra",
  INSPECTED: "Đã kiểm tra",
  AWAITING_QUOTE: "Chờ báo giá",
  AWAITING_APPROVAL: "Chờ khách duyệt",
  CUSTOMER_APPROVED: "Khách đã duyệt",
  QUOTE_REVISION: "Cần chỉnh giá",
  WAITING_PARTS: "Chờ phụ tùng",
  REPAIRING: "Đang sửa",
  PAINTING: "Sơn",
  QC: "Kiểm tra chất lượng",
  READY_FOR_DELIVERY: "Sẵn sàng giao",
  AWAITING_PAYMENT: "Chờ thanh toán",
  DELIVERED: "Đã giao xe",
  CUSTOMER_CANCELLED: "Khách hủy",
  INTERNAL_CANCELLED: "Nội bộ hủy",
};

export const workshopStageLabelKey = (code: string) =>
  `v2.garageCases.workshop.stage.${code}`;

/** Chữ mặc định (VI) cho khóa lỗi form trả từ `validateLogForm`. */
export const WORKSHOP_FORM_ERROR_DEFAULTS: Readonly<Record<string, string>> = {
  "v2.garageCases.workshop.error.stageRequired": "Chọn công đoạn.",
  "v2.garageCases.workshop.error.noteRequired": "Nhập mô tả công việc.",
  "v2.garageCases.workshop.error.endBeforeStart":
    "Giờ kết thúc phải sau giờ bắt đầu.",
};

/** Công đoạn mở quá lâu: cảnh báo sau 8 giờ, nghiêm trọng sau 24 giờ. */
export const WORKSHOP_STAGE_WARN_MINUTES = 8 * 60;
export const WORKSHOP_STAGE_DANGER_MINUTES = 24 * 60;

/** Board làm mới mỗi phút; đồng hồ trên thẻ cũng nhích theo phút. */
export const WORKSHOP_CLOCK_TICK_MS = 60_000;
