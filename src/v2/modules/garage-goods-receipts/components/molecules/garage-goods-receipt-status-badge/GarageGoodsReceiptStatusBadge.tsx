import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  GarageGoodsReceiptStatus,
  type GarageGoodsReceiptStatusType,
} from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";

export interface GarageGoodsReceiptStatusBadgeProps {
  status?: GarageGoodsReceiptStatusType | string | null;
}

/** Nhãn trạng thái phiếu nhập kho dùng V2Badge chuẩn: DRAFT, POSTED, CANCELLED */
export function GarageGoodsReceiptStatusBadge({
  status,
}: GarageGoodsReceiptStatusBadgeProps) {
  const { t } = useV2Translation();

  if (status === GarageGoodsReceiptStatus.POSTED) {
    return (
      <V2Badge variant="success">
        {t("v2.garageGoodsReceipts.status.posted", "Đã ghi sổ")}
      </V2Badge>
    );
  }

  if (status === GarageGoodsReceiptStatus.CANCELLED) {
    return (
      <V2Badge variant="destructive">
        {t("v2.garageGoodsReceipts.status.cancelled", "Đã hủy")}
      </V2Badge>
    );
  }

  return (
    <V2Badge variant="warning">
      {t("v2.garageGoodsReceipts.status.draft", "Phiếu nháp")}
    </V2Badge>
  );
}
