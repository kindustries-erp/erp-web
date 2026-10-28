import type { Meta } from "@storybook/react";
import React from "react";
import { V2ExportHistoryList } from "./V2ExportHistoryList";

const meta: Meta<typeof V2ExportHistoryList> = {
  title: "Components/Molecules/Data Display/V2ExportHistoryList",
  component: V2ExportHistoryList,
  tags: ["autodocs"],
};
export default meta;

const items = [
  {
    id: "job-1",
    fileName: "Bao_cao_phu_tung_VINFAST_2026-03.xlsx",
    periodLabel: "01/03/2026 - 31/03/2026",
    createdAt: "25/10/2026 09:00",
    statusTone: "ready" as const,
    statusLabel: "Sẵn sàng tải",
    canDownload: true,
  },
  {
    id: "job-2",
    fileName: "Bao_cao_phu_tung_VINFAST_2026-04.xlsx",
    periodLabel: "01/04/2026 - 30/04/2026",
    createdAt: "25/10/2026 09:10",
    statusTone: "running" as const,
    statusLabel: "Đang tạo 40%",
    canDownload: false,
  },
];

export const Default = () => (
  <V2ExportHistoryList
    items={items}
    emptyLabel="Chưa có file xuất nào"
    downloadLabel="Tải file"
    downloadingLabel="Đang tải..."
    onDownload={() => undefined}
    page={1}
    pageSize={10}
    total={items.length}
    onPageChange={() => undefined}
    onPageSizeChange={() => undefined}
  />
);
