import * as React from "react";
import { V2Progress } from "@/v2/shared/components/atoms/v2-progress";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { formatMoney } from "./invoiceShape.data";
import type { FakeInvoice } from "./invoiceShape.data";

interface Txn {
  id: string;
  date: string;
  content: string;
  amount: number;
}

const TXNS: Txn[] = Array.from({ length: 25 }, (_, i) => ({
  id: `t${i + 1}`,
  date: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
  content: `Thanh toán đợt ${i + 1} theo hợp đồng`,
  amount: ((i % 5) + 1) * 2500000,
}));

const COLUMNS: V2Column<Txn>[] = [
  { key: "date", label: "Ngày GD", size: 130, cell: (row) => row.date },
  { key: "content", label: "Nội dung", size: 320, cell: (row) => row.content },
  {
    key: "amount",
    label: "Số tiền",
    size: 160,
    align: TableColumnAlign.RIGHT,
    cell: (row) => (
      <span className="tabular-nums">{formatMoney(row.amount)}</span>
    ),
  },
];

/** Tab Tài chính: tiến độ thanh toán và bảng giao dịch nhúng vừa chiều cao drawer */
export const InvoiceShapeDetailFinance: React.FC<{ invoice: FakeInvoice }> = ({
  invoice,
}) => {
  const total = invoice.preVat + invoice.vat;
  return (
    <div className="flex flex-col gap-3">
      <DrawerSection title="Tiến độ thanh toán">
        <V2Progress
          value={total === 0 ? 0 : (invoice.paid / total) * 100}
          label={`${formatMoney(invoice.paid)} / ${formatMoney(total)}`}
          showValue
          tone={invoice.paid >= total ? "emerald" : "amber"}
        />
      </DrawerSection>
      <DrawerSection
        title="Giao dịch ngân hàng"
        count={TXNS.length}
        fitViewportHeight
        bodyClassName="flex flex-col overflow-hidden"
      >
        <V2StandardTable<Txn>
          tableId="invoice-shape-txns"
          mode="client"
          columns={COLUMNS}
          items={TXNS}
          getRowKey={(row) => row.id}
          enableRowSelection
          initialQuery={{ pageSize: 20 }}
        />
      </DrawerSection>
    </div>
  );
};
