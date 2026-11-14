import { V2Badge } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { StockVoucherTypeConfig } from "../../../inventoryMovements.config.type";
import { StockVoucherStatus } from "../../../domain/stockVoucher";

const DIRECTION_VARIANT = {
  IN: "success",
  OUT: "warning",
  ADJUST: "secondary",
} as const;

/** Nhãn loại chứng từ; loại lạ (không khai báo) hiển thị mã gốc */
export function StockVoucherTypeBadge({
  type,
  types,
}: {
  type: string;
  types: readonly StockVoucherTypeConfig[];
}) {
  const { t } = useV2Translation();
  const config = types.find((item) => item.code === type);
  if (!config) return <V2Badge variant="outline">{type}</V2Badge>;
  return (
    <V2Badge variant={DIRECTION_VARIANT[config.direction]}>
      {t(config.labelKey, config.labelFallback)}
    </V2Badge>
  );
}

/** Nhãn trạng thái chứng từ kho: DRAFT, POSTED, CANCELLED */
export function StockVoucherStatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const { t } = useV2Translation();
  if (status === StockVoucherStatus.POSTED)
    return (
      <V2Badge variant="success">
        {t("v2.inventoryMovements.status.posted", "Đã ghi sổ")}
      </V2Badge>
    );
  if (status === StockVoucherStatus.CANCELLED)
    return (
      <V2Badge variant="destructive">
        {t("v2.inventoryMovements.status.cancelled", "Đã hủy")}
      </V2Badge>
    );
  return (
    <V2Badge variant="warning">
      {t("v2.inventoryMovements.status.draft", "Nháp")}
    </V2Badge>
  );
}
