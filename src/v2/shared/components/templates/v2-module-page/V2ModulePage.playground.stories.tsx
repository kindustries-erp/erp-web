import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2StatCard } from "@/v2/shared/components/molecules/v2-stat-card";
import {
  buildToolbar,
  TOOLBAR_TOGGLE_ARG_TYPES,
  TOOLBAR_TOGGLE_DEFAULTS,
  type ToolbarToggleArgs,
} from "@/v2/shared/components/organisms/v2-standard-table/playground/V2StandardTable.playground.toolbar";
import {
  V2_MODULE_PAGE_TAB_VARIANTS,
  type V2ModulePageProps,
  type V2ModuleTab,
} from "./V2ModulePage.type";
import { V2ModulePage } from "./V2ModulePage";

const queryClient = new QueryClient();

type DemoRow = { id: string; name: string; amount: number };

const rows: DemoRow[] = [
  { id: "1", name: "Hóa đơn A", amount: 1200000 },
  { id: "2", name: "Hóa đơn B", amount: 860000 },
];

const useDemoData = () => ({
  items: rows,
  total: rows.length,
  loading: false,
});

const dashboardTab: V2ModuleTab<DemoRow> = {
  key: "dashboard",
  label: "Tổng quan",
  kind: "dashboard",
  content: (
    <div className="grid grid-cols-2 gap-4">
      <V2StatCard label="Tổng hóa đơn" value="2" />
      <V2StatCard label="Tổng số tiền" value="2.060.000" unit="₫" />
    </div>
  ),
};

/** Prop của trang lấy từ `V2ModulePageProps`; `showDashboard` là công tắc của playground */
type PagePlaygroundProps = Partial<
  Pick<
    V2ModulePageProps<DemoRow>,
    "title" | "description" | "tabVariant" | "syncUrl" | "className"
  >
>;

type PlaygroundArgs = PagePlaygroundProps &
  ToolbarToggleArgs & { showDashboard?: boolean };

/** Trang playground: tab danh sách có toolbar bật/tắt theo công tắc, cộng tab tổng quan tùy chọn */
const PagePlayground = ({ showDashboard = true, ...args }: PlaygroundArgs) => {
  const { title, description, tabVariant, syncUrl, className, ...toggles } =
    args;

  const listTab: V2ModuleTab<DemoRow> = {
    key: "list",
    label: "Danh sách",
    kind: "list",
    table: {
      tableId: "playground-module-list",
      columns: [
        { key: "name", label: "Tên", cell: (row) => row.name },
        {
          key: "amount",
          label: "Số tiền",
          cell: (row) => row.amount.toLocaleString("vi-VN"),
        },
      ],
      getRowKey: (row) => row.id,
      toolbar: buildToolbar(toggles),
    },
    useData: useDemoData,
  };

  return (
    <V2ModulePage<DemoRow>
      title={title ?? ""}
      description={description}
      tabVariant={tabVariant}
      syncUrl={syncUrl}
      className={className}
      tabs={showDashboard ? [dashboardTab, listTab] : [listTab]}
    />
  );
};

const meta: Meta<PlaygroundArgs> = {
  title: "Components/Templates/V2ModulePage",
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
  args: {
    title: "Hóa đơn",
    description: "Tổng quan và danh sách hóa đơn",
    tabVariant: "page",
    syncUrl: false,
    showDashboard: true,
    ...TOOLBAR_TOGGLE_DEFAULTS,
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    tabVariant: {
      control: "inline-radio",
      options: [...V2_MODULE_PAGE_TAB_VARIANTS],
    },
    syncUrl: { control: "boolean" },
    className: { control: "text" },
    showDashboard: { control: "boolean" },
    ...TOOLBAR_TOGGLE_ARG_TYPES,
  },
  render: (args) => <PagePlayground {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
