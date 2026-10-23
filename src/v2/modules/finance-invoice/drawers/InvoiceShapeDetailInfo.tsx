import * as React from "react";
import { DrawerRow, DrawerSection } from "@/v2/shared/components";
import {
  BRANCHES,
  formatMoney,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

interface Props {
  invoice: FakeInvoice;
}

/** Thông tin chung của hóa đơn, chỉ đọc */
export const InvoiceShapeDetailInfo: React.FC<Props> = ({ invoice }) => {
  const branch = BRANCHES.find((b) => b.value === invoice.branchId)?.label;
  return (
    <DrawerSection title="Thông tin chung">
      <div className="grid gap-2 sm:grid-cols-2">
        <DrawerRow
          label="Số hóa đơn"
          value={`${invoice.serialNo}-${invoice.invoiceNo}`}
          copyable
        />
        <DrawerRow label="Ngày lập" value={invoice.invoiceDate} />
        <DrawerRow label="Đối tác" value={invoice.partner} />
        <DrawerRow label="Mã số thuế" value={invoice.taxCode} copyable />
        <DrawerRow label="Chi nhánh" value={branch} />
        <DrawerRow
          label="Tiền trước thuế"
          value={formatMoney(invoice.preVat)}
        />
        <DrawerRow label="Thuế GTGT" value={formatMoney(invoice.vat)} />
        <DrawerRow
          label="Tổng thanh toán"
          value={formatMoney(invoice.preVat + invoice.vat)}
        />
        <DrawerRow label="Ghi chú" value={invoice.note || "—"} />
      </div>
    </DrawerSection>
  );
};
