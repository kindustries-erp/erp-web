import * as React from "react";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
} from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

type T = (key: string, fallback: string) => string;

export interface ProcurementStatusBadgeProps {
  value: string;
  t: T;
  className?: string;
}

/** Ánh xạ mã trạng thái sang màu sắc ngữ nghĩa chuẩn V2 (No Blue). */
export function getProcurementBadgeVariant(value: string): V2BadgeVariant {
  switch (value) {
    case "APPROVED":
    case "FULL":
      return V2BadgeVariant.SUCCESS;
    case "SUBMITTED":
    case "PENDING_APPROVAL":
    case "PARTIAL":
      return V2BadgeVariant.WARNING;
    case "REJECTED":
    case "CANCELLED":
      return V2BadgeVariant.DESTRUCTIVE;
    case "CLOSED":
    case "NONE":
      return V2BadgeVariant.OUTLINE;
    case "DRAFT":
    default:
      return V2BadgeVariant.SECONDARY;
  }
}

/** Badge hiển thị trạng thái chuẩn của phân hệ procurement, dùng V2Text component. */
export function ProcurementStatusBadge({
  value,
  t,
  className,
}: ProcurementStatusBadgeProps) {
  const variant = getProcurementBadgeVariant(value);
  return (
    <V2Badge variant={variant} size={V2BadgeSize.SM} className={className}>
      <V2Text
        as="span"
        variant="caption"
        weight="medium"
        className="text-inherit"
      >
        {t(`v2.procurement.status.${value}`, value)}
      </V2Text>
    </V2Badge>
  );
}

/** Text trạng thái hỗ trợ hiển thị tối giản dùng V2Text component. */
export function ProcurementStatusText({ value, t }: { value: string; t: T }) {
  return (
    <V2Text as="span" variant="body-sm">
      {t(`v2.procurement.status.${value}`, value)}
    </V2Text>
  );
}
