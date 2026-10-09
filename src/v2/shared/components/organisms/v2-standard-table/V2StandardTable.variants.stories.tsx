import type { Meta } from "@storybook/react";
import React, { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2StandardTable } from "./V2StandardTable";
import { V2StandardTableMobile } from "./V2StandardTable.mobile";
import { useDemoActions } from "./V2StandardTable.mock";
import { MOCK_ORDERS } from "./V2StandardTable.mock-server";
import type { MockOrder } from "./V2StandardTable.mock-server";
import type { V2ColumnPreferencesStorage } from "./V2StandardTable.type";

const queryClient = new QueryClient();

const meta: Meta<typeof V2StandardTable> = {
  title: "Components/Organisms/Table/V2StandardTable/Variants",
  component: V2StandardTable,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="h-[calc(100vh-3rem)] w-full max-w-[1280px] p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const MobileCards = () => {
  const { columns, rowActions } = useDemoActions();
  return (
    <div className="w-[390px] max-w-full">
      <V2StandardTableMobile<MockOrder>
        tableId="story-orders-mobile"
        mode="client"
        columns={columns}
        items={MOCK_ORDERS}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        initialQuery={{ pageSize: 20 }}
      />
    </div>
  );
};

export const CustomColumnStorage = () => {
  const { columns, rowActions } = useDemoActions();
  const [saved, setSaved] = useState("");
  const storage = useMemo<V2ColumnPreferencesStorage>(
    () => ({
      load: () => null,
      save: (tableId, preferences) =>
        setSaved(JSON.stringify({ tableId, ...preferences }, null, 2)),
      clear: () => setSaved(""),
    }),
    [],
  );
  return (
    <div className="flex h-full flex-col gap-2">
      <V2StandardTable<MockOrder>
        tableId="story-orders-storage"
        className="min-h-0 flex-1"
        mode="client"
        columns={columns}
        items={MOCK_ORDERS}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        preferencesStorage={storage}
      />
      <pre className="rounded-lg bg-muted p-3 text-[11px]">
        {saved ||
          "Ẩn/hiện, kéo thả hoặc đổi độ rộng cột để xem cấu hình được lưu."}
      </pre>
    </div>
  );
};
