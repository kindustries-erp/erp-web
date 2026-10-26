import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { isInvoiceDebtInactive } from "../../../domain/rules/invoiceDebtRules";

export interface InvoiceDebtStatusBadgeProps {
  status: string;
}

/** Nhãn trạng thái dùng chung giữa cột bảng và tiêu đề drawer */
export function InvoiceDebtStatusBadge({
  status,
}: InvoiceDebtStatusBadgeProps) {
  const { t } = useV2Translation();
  const inactive = isInvoiceDebtInactive(status);

  return (
    <Badge variant={inactive ? "secondary" : "default"}>
      {inactive
        ? t("v2.invoiceDebts.status.inactive", "Ngưng hoạt động")
        : t("v2.invoiceDebts.status.active", "Hoạt động")}
    </Badge>
  );
}
