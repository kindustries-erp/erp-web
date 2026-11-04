import { V2Badge, V2BadgeVariant } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { PurchaseOrderStatus } from "../../../domain/purchaseOrderConstants";

export interface PurchaseOrderStatusBadgeProps {
  status?: PurchaseOrderStatus | string | null;
}

/** Nhãn trạng thái PO dùng V2Badge chuẩn, màu theo ngữ nghĩa của token */
export function PurchaseOrderStatusBadge({
  status,
}: PurchaseOrderStatusBadgeProps) {
  const { t } = useV2Translation();

  switch (status) {
    case PurchaseOrderStatus.APPROVED:
      return (
        <V2Badge variant={V2BadgeVariant.DEFAULT}>
          {t("v2.purchaseOrders.status.approved", "Đã duyệt")}
        </V2Badge>
      );
    case PurchaseOrderStatus.CONFIRMED:
      return (
        <V2Badge variant={V2BadgeVariant.SECONDARY}>
          {t("v2.purchaseOrders.status.confirmed", "Đã xác nhận")}
        </V2Badge>
      );
    case PurchaseOrderStatus.PARTIAL_RECEIVED:
      return (
        <V2Badge variant={V2BadgeVariant.OUTLINE}>
          {t("v2.purchaseOrders.status.partialReceived", "Nhận một phần")}
        </V2Badge>
      );
    case PurchaseOrderStatus.RECEIVED:
      return (
        <V2Badge variant={V2BadgeVariant.SUCCESS}>
          {t("v2.purchaseOrders.status.received", "Đã nhận đủ")}
        </V2Badge>
      );
    case PurchaseOrderStatus.CANCELLED:
      return (
        <V2Badge variant={V2BadgeVariant.DESTRUCTIVE}>
          {t("v2.purchaseOrders.status.cancelled", "Đã hủy")}
        </V2Badge>
      );
    default:
      return (
        <V2Badge variant={V2BadgeVariant.WARNING}>
          {t("v2.purchaseOrders.status.draft", "Nháp")}
        </V2Badge>
      );
  }
}
