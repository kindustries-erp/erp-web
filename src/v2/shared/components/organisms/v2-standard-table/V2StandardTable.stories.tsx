import type { Meta } from "@storybook/react";
import React, { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { V2StandardTable } from "./V2StandardTable";
import { createInitialQuery } from "./v2TableQuery";
import { orderRowClassName, useDemoActions } from "./V2StandardTable.mock";
import {
  MOCK_ORDERS,
  fetchMockOptions,
  fetchMockOrders,
} from "./V2StandardTable.mock-server";
import type { MockOrder } from "./V2StandardTable.mock-server";

const queryClient = new QueryClient();

const meta: Meta<typeof V2StandardTable> = {
  title: "V2/Organisms/V2StandardTable",
  component: V2StandardTable,
  tags: ["autodocs"],
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

export const ServerSide = () => {
  const { columns, rowActions, logLine } = useDemoActions();
  const initialQuery = useMemo(() => createInitialQuery(), []);
  const [query, setQuery] = useState(initialQuery);
  const { data, isFetching } = useQuery({
    queryKey: ["v2-demo-orders", query],
    queryFn: () => fetchMockOrders(query),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <V2StandardTable<MockOrder>
        tableId="story-orders-server"
        className="min-h-0 flex-1"
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
      {logLine}
    </div>
  );
};

export const ClientSide = () => {
  const { columns, rowActions, logLine } = useDemoActions();
  return (
    <div className="flex h-full flex-col gap-2">
      <V2StandardTable<MockOrder>
        tableId="story-orders-client"
        className="min-h-0 flex-1"
        mode="client"
        columns={columns}
        items={MOCK_ORDERS}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        getRowClassName={orderRowClassName}
      />
      {logLine}
    </div>
  );
};

export const WithSelection = () => {
  const { columns, rowActions } = useDemoActions();
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="flex h-full flex-col gap-2">
      <V2StandardTable<MockOrder>
        tableId="story-orders-selection"
        className="min-h-0 flex-1"
        mode="client"
        columns={columns}
        items={MOCK_ORDERS}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        enableRowSelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p className="text-xs text-muted-fg">
        Đã chọn {selected.length}: {selected.slice(0, 5).join(", ")}
        {selected.length > 5 ? "…" : ""}
      </p>
    </div>
  );
};

export const Empty = () => {
  const { columns } = useDemoActions();
  return (
    <V2StandardTable<MockOrder>
      tableId="story-orders-empty"
      columns={columns}
      items={[]}
      total={0}
      getRowKey={(row) => row.id}
      fetchOptions={fetchMockOptions}
    />
  );
};

export const Loading = () => {
  const { columns } = useDemoActions();
  return (
    <V2StandardTable<MockOrder>
      tableId="story-orders-loading"
      columns={columns}
      items={[]}
      total={0}
      loading
      getRowKey={(row) => row.id}
      fetchOptions={fetchMockOptions}
    />
  );
};
