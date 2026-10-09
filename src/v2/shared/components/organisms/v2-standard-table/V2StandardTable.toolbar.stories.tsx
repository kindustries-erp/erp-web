import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Download, DownloadCloud } from "lucide-react";
import { V2StandardTable } from "./V2StandardTable";
import { useDemoActions } from "./V2StandardTable.mock";
import { MOCK_ORDERS } from "./V2StandardTable.mock-server";
import type { MockOrder } from "./V2StandardTable.mock-server";

const queryClient = new QueryClient();

const meta: Meta<typeof V2StandardTable> = {
  title: "Components/Organisms/Table/V2StandardTable/Toolbar",
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

export const WithFullToolbar = () => {
  const { columns, rowActions } = useDemoActions();
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("overview");
  return (
    <V2StandardTable<MockOrder>
      tableId="story-orders-toolbar"
      className="min-h-0 flex-1"
      mode="client"
      columns={columns}
      items={MOCK_ORDERS}
      getRowKey={(row) => row.id}
      rowActions={rowActions}
      enableRowSelection
      toolbar={{
        pillTabs: {
          items: [
            { key: "all", label: "Tất cả" },
            { key: "new", label: "Mới" },
            { key: "replace", label: "Thay thế" },
            { key: "adjust", label: "Điều chỉnh" },
          ],
          activeKey: tab,
          onChange: setTab,
        },
        viewModes: {
          items: [
            { key: "overview", label: "Tổng quan", isSystem: true },
            { key: "tax", label: "Thuế", isSystem: true },
          ],
          activeKey: view,
          onSelect: setView,
        },
        bulkActions: [
          {
            groupLabel: "Tải & Xuất tệp",
            items: [
              { label: "Tải ZIP", icon: <Download className="h-3.5 w-3.5" /> },
            ],
          },
        ],
        onFilterToggle: () => {},
        onRefresh: () => {},
        create: {
          label: "Đồng bộ",
          icon: <DownloadCloud className="h-4 w-4" />,
          onClick: () => {},
          actions: [{ items: [{ label: "Đồng bộ nâng cao" }] }],
        },
      }}
    />
  );
};

export const WithFilterPanel = () => {
  const { columns, rowActions } = useDemoActions();
  return (
    <V2StandardTable<MockOrder>
      tableId="story-orders-filter-panel"
      className="min-h-0 flex-1"
      mode="client"
      columns={columns}
      items={MOCK_ORDERS}
      getRowKey={(row) => row.id}
      rowActions={rowActions}
      enableRowSelection
      toolbar={{
        onRefresh: () => {},
        filterPanel: { defaultOpen: true },
      }}
    />
  );
};

export const FilterPanelWithExtraContent = () => {
  const { columns } = useDemoActions();
  return (
    <V2StandardTable<MockOrder>
      tableId="story-orders-filter-panel-extra"
      className="min-h-0 flex-1"
      mode="client"
      columns={columns}
      items={MOCK_ORDERS}
      getRowKey={(row) => row.id}
      initialQuery={{ columnFilters: { status: ["DONE"] } }}
      toolbar={{
        filterPanel: {
          defaultOpen: true,
          extraContent: (
            <p className="rounded-lg border border-dashed border-border p-2 text-xs text-muted-fg">
              Bộ lọc tùy biến theo trang (kỳ, tag...) đặt tại đây
            </p>
          ),
        },
      }}
    />
  );
};
