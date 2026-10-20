import React, { useState } from "react";
import type { Meta } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { V2StandardDrawer } from "./V2StandardDrawer";

const queryClient = new QueryClient();

type Line = { id: string; item: string; qty: number; amount: number };

const lines: Line[] = Array.from({ length: 60 }, (_, i) => ({
  id: `l${i + 1}`,
  item: `Hàng hóa ${i + 1}`,
  qty: (i % 7) + 1,
  amount: ((i % 7) + 1) * 125000,
}));

const meta: Meta<typeof V2StandardDrawer> = {
  title: "Components/Organisms/Drawer/V2StandardDrawer",
  component: V2StandardDrawer,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

/** Bảng nhúng trong drawer: DrawerSection `fitViewportHeight` giữ chiều cao, bảng cuộn bên trong, header dính */
export const WithEmbeddedTable = () => {
  const [open, setOpen] = useState(true);
  return (
    <V2StandardDrawer
      open={open}
      onClose={() => setOpen(false)}
      title="Hóa đơn 0001234"
      subtitle="Bảng dòng hàng nhúng trong drawer"
      layout="2-columns"
      size="xl"
      rightPanel={<DrawerSection title="Tóm tắt">Tổng 60 dòng</DrawerSection>}
    >
      <DrawerSection
        title="Dòng hàng"
        fitViewportHeight
        bodyClassName="flex flex-col overflow-hidden"
      >
        <V2StandardTable<Line>
          tableId="drawer-lines"
          mode="client"
          items={lines}
          getRowKey={(row) => row.id}
          initialQuery={{ pageSize: 50 }}
          columns={[
            { key: "item", label: "Hàng hóa", cell: (row) => row.item },
            { key: "qty", label: "SL", cell: (row) => row.qty },
            {
              key: "amount",
              label: "Thành tiền",
              cell: (row) => row.amount.toLocaleString("vi-VN"),
            },
          ]}
        />
      </DrawerSection>
    </V2StandardDrawer>
  );
};
