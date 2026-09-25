import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { Eye, Scale, Link2 } from "lucide-react";

interface CustomerCaseActionsCellProps {
  row: any;
  onOpenCaseDetail: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal: (c: any) => void;
  onOpenInvoiceLinkingModal: (c: any) => void;
}

export const CustomerCaseActionsCell = React.memo(
  function CustomerCaseActionsCell({
    row,
    onOpenCaseDetail,
    onOpenSettlementModal,
    onOpenInvoiceLinkingModal,
  }: CustomerCaseActionsCellProps) {
    const { t } = useTranslation(["garage", "common"]);

    return (
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title={t("customers.drawer.viewDetail", "Xem chi tiết")}
          onClick={() => onOpenCaseDetail(row.soChungTu || row.id, false)}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary hover:text-primary/80"
          title={t("customers.drawer.netOffVoucher", "Cấn trừ sao kê")}
          onClick={() => onOpenSettlementModal(row)}
        >
          <Scale className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-emerald-600 hover:text-emerald-500"
          title={t("customers.drawer.linkInvoice", "Liên kết hóa đơn VAT")}
          onClick={() => onOpenInvoiceLinkingModal(row)}
        >
          <Link2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  },
);
