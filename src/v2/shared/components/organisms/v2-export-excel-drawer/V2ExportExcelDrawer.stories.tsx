import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2Button } from "@/v2/shared/components/atoms";
import { V2ExportExcelDrawer } from "./V2ExportExcelDrawer";

const meta: Meta<typeof V2ExportExcelDrawer> = {
  title: "Components/Organisms/Drawers/V2ExportExcelDrawer",
  component: V2ExportExcelDrawer,
  tags: ["autodocs"],
};
export default meta;

const columnGroups = [
  {
    key: "summary",
    label: "Tổng hợp tồn kho",
    columns: [
      { key: "sku", label: "Mã phụ tùng" },
      { key: "qtyBalance", label: "Tồn kho" },
    ],
  },
];
const allKeys = columnGroups.flatMap((g) => g.columns.map((c) => c.key));

export const Default = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(allKeys);
  return (
    <>
      <V2Button onClick={() => setOpen(true)}>Mở drawer</V2Button>
      <V2ExportExcelDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Xuất Excel tồn kho phụ tùng"
        columnGroups={columnGroups}
        selectedColumns={selected}
        defaultColumns={allKeys}
        onColumnsChange={setSelected}
        columnsTitle="Cột xuất Excel"
        historyTitle="Lịch sử xuất file"
        history={<div>Danh sách lịch sử</div>}
        conditions={<div>Điều kiện xuất</div>}
      />
    </>
  );
};
