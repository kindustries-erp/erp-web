import type { Meta } from "@storybook/react";
import React, { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import {
  V2StandardTable,
  createInitialQuery,
} from "@/v2/shared/components/organisms/v2-standard-table";
import {
  orderRowClassName,
  useDemoActions,
} from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.mock";
import {
  fetchMockOptions,
  fetchMockOrders,
} from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.mock-server";
import type { MockOrder } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.mock-server";
import { V2TabPanel } from "@/v2/shared/components/molecules/v2-tab-panel";
import { MOCK_ORDERS } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.mock-server";
import { V2TabbedSpreadsheetPage } from "./V2TabbedSpreadsheetPage";

const queryClient = new QueryClient();

const meta: Meta<typeof V2TabbedSpreadsheetPage> = {
  title: "Components/Templates/V2TabbedSpreadsheetPage",
  component: V2TabbedSpreadsheetPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="h-[calc(100vh-3rem)] w-full">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const FullPageLayout = () => {
  const { columns, rowActions } = useDemoActions();
  const initialQuery = useMemo(() => createInitialQuery(), []);
  const [query, setQuery] = useState(initialQuery);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["v2-demo-orders-page", query],
    queryFn: () => fetchMockOrders(query),
    placeholderData: keepPreviousData,
  });

  return (
    <V2TabbedSpreadsheetPage
      title="Đơn bán hàng"
      description="Danh sách đơn bán hàng và trạng thái xử lý"
      icon={<ClipboardList className="h-5 w-5" />}
      layout="fullpage"
      actions={
        <>
          <V2Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => void refetch()}
          >
            Làm mới
          </V2Button>
          <V2Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Tạo đơn
          </V2Button>
        </>
      }
    >
      <V2StandardTable<MockOrder>
        tableId="story-template-orders"
        columns={columns}
        items={data?.items ?? []}
        total={data?.total ?? 0}
        loading={isFetching}
        getRowKey={(row) => row.id}
        fetchOptions={fetchMockOptions}
        initialQuery={initialQuery}
        onQueryChange={setQuery}
        rowActions={rowActions}
        getRowClassName={orderRowClassName}
      />
    </V2TabbedSpreadsheetPage>
  );
};

export const WithSummary = () => {
  const { columns, rowActions } = useDemoActions();
  const withSummary = columns.map((column) =>
    column.key === "amount"
      ? { ...column, summary: { variant: "amount" as const } }
      : column,
  );
  return (
    <V2TabbedSpreadsheetPage title="Bảng có hàng tổng">
      <V2StandardTable<MockOrder>
        tableId="story-template-summary"
        className="min-h-0 flex-1"
        mode="client"
        columns={withSummary}
        items={MOCK_ORDERS}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
      />
    </V2TabbedSpreadsheetPage>
  );
};

export const WithoutHeader = () => {
  const { columns } = useDemoActions();
  return (
    <V2TabbedSpreadsheetPage title="Ẩn tiêu đề" hideHeader>
      <V2StandardTable<MockOrder>
        tableId="story-template-no-header"
        columns={columns}
        items={[]}
        total={0}
        getRowKey={(row) => row.id}
        fetchOptions={fetchMockOptions}
      />
    </V2TabbedSpreadsheetPage>
  );
};

const PANEL_TABS = [
  { key: "overview", label: "Tổng quan" },
  { key: "in", label: "Nhóm 1" },
  { key: "out", label: "Nhóm 2" },
];

export const TabbedWithPanels = () => {
  const { columns, rowActions } = useDemoActions();
  const [tab, setTab] = useState("in");
  const toolbar = (label: string) => ({
    onRefresh: () => {},
    onFilterToggle: () => {},
    create: { label, onClick: () => {} },
  });
  return (
    <V2TabbedSpreadsheetPage
      title="Danh sách theo tab"
      description="Mỗi tab một bảng, toolbar hiện ở header"
      icon={<ClipboardList className="h-5 w-5" />}
      tabs={PANEL_TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      <V2TabPanel tabKey="overview">
        <p className="p-4 text-sm text-muted-fg">Dashboard (không có bảng)</p>
      </V2TabPanel>
      {(["in", "out"] as const).map((key) => (
        <V2TabPanel key={key} tabKey={key}>
          <V2StandardTable<MockOrder>
            tableId={`story-invoices-${key}`}
            className="min-h-0 flex-1"
            mode="client"
            columns={columns}
            items={MOCK_ORDERS}
            getRowKey={(row) => row.id}
            rowActions={rowActions}
            enableRowSelection
            toolbar={toolbar(key === "in" ? "Đồng bộ" : "Phát hành")}
          />
        </V2TabPanel>
      ))}
    </V2TabbedSpreadsheetPage>
  );
};
