import { V2Badge } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  GoodsReceiptStatus,
  type GoodsReceiptStatusType,
} from "../../../domain/goodsReceipt";

export interface GoodsReceiptStatusBadgeProps {
  status?: GoodsReceiptStatusType | string | null;
}

/** Nhãn trạng thái phiếu nhập dùng V2Badge chuẩn: DRAFT, POSTED, CANCELLED */
export function GoodsReceiptStatusBadge({
  status,
}: GoodsReceiptStatusBadgeProps) {
  const { t } = useV2Translation();

  if (status === GoodsReceiptStatus.POSTED) {
    return (
      <V2Badge variant="success">
        {t("v2.goodsReceipts.status.posted", "Đã ghi sổ")}
      </V2Badge>
    );
  }

  if (status === GoodsReceiptStatus.CANCELLED) {
    return (
      <V2Badge variant="destructive">
        {t("v2.goodsReceipts.status.cancelled", "Đã hủy")}
      </V2Badge>
    );
  }

  return (
    <V2Badge variant="warning">
      {t("v2.goodsReceipts.status.draft", "Nháp")}
    </V2Badge>
  );
}
