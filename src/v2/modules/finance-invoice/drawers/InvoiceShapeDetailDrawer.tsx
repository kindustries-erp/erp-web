import * as React from "react";
import { V2StandardDrawer } from "@/v2/shared/components";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { InvoiceShapeDetailInfo } from "./InvoiceShapeDetailInfo";

interface Props {
  invoice: FakeInvoice;
  open: boolean;
  onClose: () => void;
}

/** Drawer chi tiết hóa đơn, chỉ đọc (đợt 1 chưa có sửa, hạch toán hay tải tệp) */
export const InvoiceShapeDetailDrawer: React.FC<Props> = ({
  invoice,
  open,
  onClose,
}) => (
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
    actions={[{ label: "Đóng", onClick: onClose }]}
  >
    <InvoiceShapeDetailInfo invoice={invoice} />
  </V2StandardDrawer>
);
