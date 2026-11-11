import type { Meta, StoryObj } from "@storybook/react";
import { V2DrawerLinesTable } from "./V2DrawerLinesTable";
import type { V2DrawerLinesColumn } from "./V2DrawerLinesTable.type";

interface DemoLine {
  id: string;
  name: string;
  note: string;
  qty: number;
  price: number;
}

const rows: DemoLine[] = Array.from({ length: 12 }, (_, i) => ({
  id: `line-${i + 1}`,
  name: `Lọc dầu động cơ loại ${i + 1} dùng cho dòng xe garage`,
  note: "Giao trước 12h, kiểm tra hàng nguyên đai",
  qty: i + 1,
  price: 150000 + i * 1000,
}));

const columns: V2DrawerLinesColumn[] = [
  { id: "index", header: "#", width: 40, align: "center" },
  { id: "name", header: "Tên", grow: true, minWidth: 200, wrap: true },
  { id: "note", header: "Ghi chú", width: 220, wrap: true },
  { id: "qty", header: "Số lượng", width: 96, align: "right" },
  { id: "price", header: "Đơn giá", width: 128, align: "right" },
];

const meta: Meta<typeof V2DrawerLinesTable> = {
  title: "Components/Organisms/V2DrawerLinesTable",
  component: V2DrawerLinesTable,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ width: 720 }}>
      <V2DrawerLinesTable<DemoLine>
        ariaLabel="Dòng hàng demo"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        renderCell={(col, row, index) => {
          switch (col.id) {
            case "index":
              return index + 1;
            case "name":
              return row.name;
            case "note":
              return row.note;
            case "qty":
              return row.qty.toLocaleString("vi-VN");
            default:
              return row.price.toLocaleString("vi-VN");
          }
        }}
        footerLabel="Tổng cộng:"
        footerCells={{
          qty: rows.reduce((s, r) => s + r.qty, 0).toLocaleString("vi-VN"),
        }}
      />
    </div>
  ),
};
