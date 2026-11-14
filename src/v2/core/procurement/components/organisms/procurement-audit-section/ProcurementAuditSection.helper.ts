import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import {
  type V2ActivityItem,
  V2ActivityVariant,
} from "@/v2/shared/components/molecules/v2-activity-timeline";
import type { ProcurementApprovalEvent } from "../../../procurement.types";

export type Translate = (key: string, fallback: string) => string;

/** Màu sự kiện nhật ký theo hành động duyệt (No Blue semantic variants). */
export const mapProcurementActionVariant = (
  action: string,
): V2ActivityVariant => {
  switch (action.toLowerCase()) {
    case "approve":
    case "approved":
    case "auto_approved":
      return V2ActivityVariant.SUCCESS;
    case "reject":
    case "rejected":
    case "cancel":
    case "cancelled":
      return V2ActivityVariant.DANGER;
    case "submit":
    case "submitted":
      return V2ActivityVariant.WARNING;
    default:
      return V2ActivityVariant.DEFAULT;
  }
};

/** Thời gian chi tiết: dd/MM/yyyy HH:mm (không lộ chuỗi ISO). */
export const formatExactTime = (value: string): string => {
  const parts = formatDateTimeParts(value);
  if (!parts) return "—";
  return [parts.date, parts.time].filter(Boolean).join(" ");
};

/** Thời gian tương đối dễ đọc: ví dụ '2 phút trước', '3 giờ trước'. */
export const formatRelativeTime = (
  value: string,
  locale: string = "vi",
): string => {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return formatExactTime(value);
    const dateLocale = locale === "en" ? enUS : vi;
    return formatDistanceToNow(d, { addSuffix: true, locale: dateLocale });
  } catch {
    return formatExactTime(value);
  }
};

/**
 * Chuyển đổi danh sách sự kiện API thành cấu trúc V2ActivityItem.
 * Bảo đảm tính bảo mật (không lộ UUID, không lộ ISO date).
 */
export function toProcurementActivityItems(
  events: ProcurementApprovalEvent[],
  t: Translate,
  locale: string = "vi",
): V2ActivityItem[] {
  const unknownActor = t("v2.procurement.audit.unknownActor", "Không xác định");
  const reasonPrefix = t("v2.procurement.audit.reasonPrefix", "Lý do");
  const transitionLabel = t(
    "v2.procurement.audit.transition",
    "Chuyển trạng thái",
  );
  const exactTimeLabel = t(
    "v2.procurement.audit.exactTime",
    "Thời gian chi tiết",
  );

  return events.map((ev, index) => {
    const actor = ev.actorName || ev.actorEmail || unknownActor;
    const action = t(`v2.procurement.actions.${ev.action}`, ev.action);
    const toStatusText = t(`v2.procurement.status.${ev.toStatus}`, ev.toStatus);
    const exactTime = formatExactTime(ev.createdAt);
    const relativeTime = formatRelativeTime(ev.createdAt, locale);

    const subItems = [];
    if (ev.comment) {
      subItems.push({
        key: "reason",
        label: reasonPrefix,
        value: ev.comment,
      });
    }
    if (ev.toStatus) {
      const effectiveFromStatus = ev.fromStatus || "DRAFT";
      const fromStatusText = t(
        `v2.procurement.status.${effectiveFromStatus}`,
        effectiveFromStatus,
      );
      subItems.push({
        key: "transition",
        label: transitionLabel,
        value: `${fromStatusText} ➔ ${toStatusText}`,
      });
    }
    subItems.push({
      key: "exactTime",
      label: exactTimeLabel,
      value: exactTime,
    });

    return {
      id: `${index}-${ev.action}-${ev.createdAt}`,
      action,
      actor,
      timestamp: relativeTime,
      details: ev.comment ? `${reasonPrefix}: ${ev.comment}` : undefined,
      variant: mapProcurementActionVariant(ev.action),
      subItems,
    };
  });
}
