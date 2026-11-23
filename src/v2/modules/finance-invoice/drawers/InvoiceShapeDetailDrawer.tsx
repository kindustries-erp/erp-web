import * as React from "react";
import { V2StandardDrawer } from "@/v2/shared/components";
import { createV2OwnerFilesApi, useV2OwnerFilesQuery } from "@/v2/shared/files";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { InvoiceAttachmentsTab } from "./InvoiceAttachmentsTab";
import { InvoiceShapeDetailInfo } from "./InvoiceShapeDetailInfo";
import "../financeInvoiceSync.locale";

interface Props {
  invoice: FakeInvoice;
  open: boolean;
  onClose: () => void;
}

/** Drawer chi tiết hóa đơn: tab Thông tin (chỉ đọc) và tab Tài liệu (đính kèm V2) */
export const InvoiceShapeDetailDrawer: React.FC<Props> = ({
  invoice,
  open,
  onClose,
}) => {
  const { t } = useV2Translation();
  const api = React.useMemo(
    () => createV2OwnerFilesApi(`/api/v2/invoices/${invoice.id}/attachments`),
    [invoice.id],
  );
  // Cùng query key với panel nên không gọi API thêm; chỉ để hiện badge số file
  const files = useV2OwnerFilesQuery(api, open);

  const tabs = React.useMemo(
    () => [
      {
        key: "info",
        label: t("v2.financeInvoiceSync.detail.tabInfo", "Thông tin"),
        content: <InvoiceShapeDetailInfo invoice={invoice} />,
      },
      {
        key: "documents",
        label: t("v2.financeInvoiceSync.detail.tabDocuments", "Tài liệu"),
        badgeCount: files.data?.items.length || undefined,
        content: <InvoiceAttachmentsTab api={api} />,
      },
    ],
    [api, files.data?.items.length, invoice, t],
  );

  return (
    <V2StandardDrawer
      id={`invoice:${invoice.id}`}
      open={open}
      mode="view"
      onClose={onClose}
      title={`Hóa đơn ${invoice.serialNo}-${invoice.invoiceNo}`}
      subtitle={invoice.partner}
      titleExtra={
        <span className="text-xs text-muted-fg">
          {invoice.posting === "POSTED" ? "Đã hạch toán" : "Chưa hạch toán"}
        </span>
      }
      size="xl"
      tabs={tabs}
      defaultTabKey="info"
      actions={[{ label: "Đóng", onClick: onClose }]}
    />
  );
};
