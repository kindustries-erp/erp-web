import * as React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";

interface LinkedDoc {
  id: string;
  type: string;
  number: string;
  date: string;
}

const DOCS: LinkedDoc[] = [
  { id: "1", type: "Đơn mua hàng", number: "PO-2026-014", date: "2026-02-03" },
  {
    id: "2",
    type: "Phiếu nhập kho",
    number: "GR-2026-031",
    date: "2026-02-05",
  },
  {
    id: "3",
    type: "Giao dịch ngân hàng",
    number: "BT-88231",
    date: "2026-02-20",
  },
];

const COLUMNS: V2Column<LinkedDoc>[] = [
  { key: "type", label: "Loại chứng từ", size: 200, cell: (row) => row.type },
  { key: "number", label: "Số chứng từ", size: 200, cell: (row) => row.number },
  { key: "date", label: "Ngày", size: 140, cell: (row) => row.date },
];

/** Tab Chứng từ liên kết: bản rút gọn dạng bảng; mạng liên kết đa tầng của V1 chưa có bản V2 */
export const InvoiceShapeDetailLinks: React.FC = () => (
  <DrawerSection title="Chứng từ liên kết" count={DOCS.length}>
    <V2StandardTable<LinkedDoc>
      tableId="invoice-shape-links"
      mode="client"
      columns={COLUMNS}
      items={DOCS}
      getRowKey={(row) => row.id}
      initialQuery={{ pageSize: 20 }}
    />
  </DrawerSection>
);
