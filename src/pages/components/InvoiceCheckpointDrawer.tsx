import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslation } from "react-i18next";
import { ErpInvoicesTab } from "@/modules/erp-invoices-core/components/ErpInvoicesTab";

export interface InvoiceCheckpointDrawerProps {
  open: boolean;
  onClose: () => void;
  direction: "IN" | "OUT";
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
}

export function InvoiceCheckpointDrawer({
  open,
  onClose,
  direction,
  dateFrom,
  dateTo,
  periodLabel,
}: InvoiceCheckpointDrawerProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      layout="1-column"
      size="full"
      bodyClassName="p-0 overflow-hidden flex flex-col h-full min-h-0"
      title={`${direction === "OUT" ? t("outbound", "Hóa đơn Bán ra") : t("inbound", "Hóa đơn Mua vào")} - ${periodLabel}`}
      subtitle={`Khoảng thời gian: ${dateFrom} đến ${dateTo}`}
      titleExtra={
        <Badge variant={direction === "OUT" ? "default" : "secondary"}>
          {direction === "OUT"
            ? t("revenue", "Doanh thu")
            : t("expense", "Chi phí")}
        </Badge>
      }
      actions={[
        {
          label: t("close", "Đóng"),
          onClick: onClose,
        },
      ]}
      leftPanel={
        <div className="w-full flex flex-col flex-1 h-full min-h-0">
          {open && (
            <ErpInvoicesTab
              direction={direction}
              initialDateFrom={dateFrom}
              initialDateTo={dateTo}
              isDrawer={true}
            />
          )}
        </div>
      }
    />
  );
}
