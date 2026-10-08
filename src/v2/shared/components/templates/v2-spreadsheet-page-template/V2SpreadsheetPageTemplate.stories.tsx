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
import { V2SpreadsheetPageTemplate } from "./V2SpreadsheetPageTemplate";

const queryClient = new QueryClient();

const meta: Meta<typeof V2SpreadsheetPageTemplate> = {
  title: "V2/Templates/V2SpreadsheetPageTemplate",
  component: V2SpreadsheetPageTemplate,
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

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "draft", label: "Nháp" },
  { key: "done", label: "Hoàn tất" },
];

export const FullPage = () => {
  const { columns, rowActions } = useDemoActions();
  const initialQuery = useMemo(() => createInitialQuery(), []);
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState("all");
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["v2-demo-orders-page", query],
    queryFn: () => fetchMockOrders(query),
    placeholderData: keepPreviousData,
  });

  return (
    <V2SpreadsheetPageTemplate
      title="Đơn bán hàng"
      description="Danh sách đơn bán hàng và trạng thái xử lý"
      icon={<ClipboardList className="h-5 w-5" />}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
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
    </V2SpreadsheetPageTemplate>
  );
};

export const WithoutHeader = () => {
  const { columns } = useDemoActions();
  return (
    <V2SpreadsheetPageTemplate title="Ẩn tiêu đề" hideHeader>
      <V2StandardTable<MockOrder>
        tableId="story-template-no-header"
        columns={columns}
        items={[]}
        total={0}
        getRowKey={(row) => row.id}
        fetchOptions={fetchMockOptions}
      />
    </V2SpreadsheetPageTemplate>
  );
};

const INVOICE_TABS = [
  { key: "overview", label: "Tổng quan" },
  { key: "in", label: "Hóa đơn mua vào" },
  { key: "out", label: "Hóa đơn bán ra" },
];

export const MultiTabInvoices = () => {
  const { columns, rowActions } = useDemoActions();
  const [tab, setTab] = useState("in");
  const toolbar = (label: string) => ({
    onRefresh: () => {},
    onFilterToggle: () => {},
    create: { label, onClick: () => {} },
  });
  return (
    <V2SpreadsheetPageTemplate
      title="Hóa đơn"
      description="Mỗi tab một bảng, toolbar hiện ở header"
      icon={<ClipboardList className="h-5 w-5" />}
      tabs={INVOICE_TABS}
      activeTab={tab}
      onTabChange={setTab}
      tabVariant="page"
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
    </V2SpreadsheetPageTemplate>
  );
};
