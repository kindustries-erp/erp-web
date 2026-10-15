import type { Meta, StoryObj } from "@storybook/react";
import React, { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { V2StandardTable } from "../V2StandardTable";
import {
  V2_TABLE_MODES,
  type V2Column,
  type V2StandardTableProps,
} from "../V2StandardTable.type";
import { createInitialQuery } from "../utils/v2TableQuery";
import { useDemoActions } from "../mocks/V2StandardTable.mock";
import {
  MOCK_ORDERS,
  fetchMockOptions,
  fetchMockOrders,
} from "../mocks/V2StandardTable.mock-server";
import type { MockOrder } from "../mocks/V2StandardTable.mock-server";
import {
  TOOLBAR_TOGGLE_ARG_TYPES,
  TOOLBAR_TOGGLE_DEFAULTS,
  buildToolbar,
  type ToolbarToggleArgs,
} from "./V2StandardTable.playground.toolbar";

const queryClient = new QueryClient();

/** Chỉ các prop điều khiển được từ panel; tên lấy từ `V2StandardTableProps` */
type TablePlaygroundProps = Partial<
  Pick<
    V2StandardTableProps<MockOrder>,
    "mode" | "loading" | "emptyLabel" | "enableRowSelection" | "className"
  >
>;

type PlaygroundArgs = TablePlaygroundProps &
  ToolbarToggleArgs & { showSummary?: boolean; keepRows?: boolean };

/** Tổng toàn bộ đơn, dùng cho hàng tổng ở chế độ server (như story `With Summary Server`) */
const GRAND_TOTAL = MOCK_ORDERS.reduce((sum, row) => sum + row.amount, 0);

/** Gắn `summary` cho cột `amount`, cùng cách với story `With Summary` */
const withAmountSummary = (
  columns: V2Column<MockOrder>[],
  summary: { total?: number } = {},
) =>
  columns.map((column) =>
    column.key === "amount"
      ? { ...column, summary: { variant: "amount" as const, ...summary } }
      : column,
  );

/** Client cũng tải qua hàm có độ trễ như server, để trạng thái tải là thật */
const fetchAllOrders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { items: MOCK_ORDERS, total: MOCK_ORDERS.length };
};

/**
 * Bảng dùng dữ liệu mẫu qua React Query thật.
 * `keepRows` tắt: khi đổi trang hoặc làm mới, dòng cũ bị bỏ và bảng hiện skeleton trong lúc chờ.
 */
const PlaygroundTable = ({
  mode = "client",
  loading = false,
  emptyLabel,
  enableRowSelection,
  className,
  showSummary = false,
  keepRows = true,
  ...toggles
}: PlaygroundArgs) => {
  const { columns: demoColumns, rowActions, logLine } = useDemoActions();
  const initialQuery = useMemo(() => createInitialQuery(), []);
  const [query, setQuery] = useState(initialQuery);
  const isServer = mode === "server";
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["playground-orders", mode, isServer ? query : null],
    queryFn: () => (isServer ? fetchMockOrders(query) : fetchAllOrders()),
    placeholderData: keepRows ? keepPreviousData : undefined,
  });

  const columns = showSummary
    ? withAmountSummary(demoColumns, isServer ? { total: GRAND_TOTAL } : {})
    : demoColumns;

  const baseToolbar = buildToolbar(toggles);
  const toolbar = baseToolbar.onRefresh
    ? { ...baseToolbar, onRefresh: () => void refetch() }
    : baseToolbar;

  const source = isServer
    ? {
        items: data?.items ?? [],
        total: data?.total ?? 0,
        fetchOptions: fetchMockOptions,
        initialQuery,
        onQueryChange: setQuery,
      }
    : { items: data?.items ?? [] };

  return (
    <div className="flex h-full flex-col gap-2">
      <V2StandardTable<MockOrder>
        tableId={`playground-orders-${mode}`}
        className={className ?? "min-h-0 flex-1"}
        mode={mode}
        columns={columns}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        toolbar={toolbar}
        enableRowSelection={enableRowSelection}
        emptyLabel={emptyLabel}
        loading={loading || isFetching}
        {...source}
      />
      {logLine}
    </div>
  );
};

const meta: Meta<PlaygroundArgs> = {
  title: "Components/Organisms/Table/V2StandardTable",
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
  args: {
    mode: "client",
    loading: false,
    enableRowSelection: true,
    showSummary: false,
    keepRows: true,
    ...TOOLBAR_TOGGLE_DEFAULTS,
  },
  argTypes: {
    mode: { control: "inline-radio", options: [...V2_TABLE_MODES] },
    loading: { control: "boolean" },
    enableRowSelection: { control: "boolean" },
    emptyLabel: { control: "text" },
    className: { control: "text" },
    showSummary: { control: "boolean" },
    keepRows: { control: "boolean" },
    ...TOOLBAR_TOGGLE_ARG_TYPES,
  },
  render: (args) => <PlaygroundTable {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Cùng điều khiển, khung hẹp để thấy nhánh mobile (thẻ thay cho bảng) */
export const PlaygroundMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
