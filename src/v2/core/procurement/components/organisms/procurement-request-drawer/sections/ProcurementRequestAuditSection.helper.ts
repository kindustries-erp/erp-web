import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import type { DrawerAuditVariant } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import type { ProcurementApprovalEvent } from "../../../../procurement.types";

/** Màu sự kiện nhật ký theo hành động duyệt (khớp các action của API). */
export const mapProcurementActionVariant = (
  action: string,
): DrawerAuditVariant => {
  switch (action.toLowerCase()) {
    case "approve":
    case "approved":
    case "auto_approved":
      return "success";
    case "reject":
    case "rejected":
    case "cancel":
    case "cancelled":
      return "danger";
    case "submit":
    case "submitted":
      return "warning";
    default:
      return "default";
  }
};

/** Dòng nhật ký đã chuẩn hóa để hiển thị; badge (JSX) do component ghép từ `toStatus`. */
export interface ProcurementAuditRow {
  key: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
  toStatus: string;
  variant: DrawerAuditVariant;
}

type Translate = (key: string, fallback: string) => string;

/** Thời gian đọc được: dd/MM/yyyy HH:mm (không lộ chuỗi ISO). */
const formatEventTime = (value: string): string => {
  const parts = formatDateTimeParts(value);
  if (!parts) return "—";
  return [parts.date, parts.time].filter(Boolean).join(" ");
};

/**
 * Chuyển sự kiện API thành dòng hiển thị. Tác nhân là họ tên, rồi email, rồi
 * "Không xác định"; không bao giờ là UUID. Lý do lấy từ `comment`.
 */
export function toAuditRows(
  events: ProcurementApprovalEvent[],
  t: Translate,
): ProcurementAuditRow[] {
  const unknownActor = t("v2.procurement.audit.unknownActor", "Không xác định");
  const reasonPrefix = t("v2.procurement.audit.reasonPrefix", "Lý do");

  return events.map((ev, index) => ({
    key: `${index}-${ev.action}-${ev.createdAt}`,
    action: t(`v2.procurement.actions.${ev.action}`, ev.action),
    actor: ev.actorName || ev.actorEmail || unknownActor,
    timestamp: formatEventTime(ev.createdAt),
    details: ev.comment ? `${reasonPrefix}: ${ev.comment}` : undefined,
    toStatus: ev.toStatus,
    variant: mapProcurementActionVariant(ev.action),
  }));
}
