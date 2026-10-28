import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2ColumnSelector } from "./V2ColumnSelector";

const meta: Meta<typeof V2ColumnSelector> = {
  title: "Components/Molecules/Forms & Inputs/V2ColumnSelector",
  component: V2ColumnSelector,
  tags: ["autodocs"],
};
export default meta;

const groups = [
  {
    key: "summary",
    label: "Tổng hợp tồn kho",
    columns: [
      { key: "sku", label: "Mã phụ tùng" },
      { key: "qtyIn", label: "Tổng nhập" },
      { key: "qtyOut", label: "Tổng xuất" },
    ],
  },
  {
    key: "ledger",
    label: "Sổ cái chi tiết FIFO",
    columns: [
      { key: "invoiceNo", label: "Số hóa đơn" },
      { key: "amount", label: "Thành tiền" },
    ],
  },
];
const allKeys = groups.flatMap((g) => g.columns.map((c) => c.key));

export const Default = () => {
  const [selected, setSelected] = useState(allKeys);
  return (
    <V2ColumnSelector
      groups={groups}
      selectedKeys={selected}
      defaultKeys={allKeys}
      onChange={setSelected}
    />
  );
};
