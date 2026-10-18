import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2StatCard } from "@/v2/shared/components/molecules/v2-stat-card";
import type { V2ModuleTab } from "./V2ModulePage.type";
import { V2ModulePage } from "./V2ModulePage";

const queryClient = new QueryClient();

type DemoRow = { id: string; name: string; amount: number };

const rows: DemoRow[] = [
  { id: "1", name: "Hóa đơn A", amount: 1200000 },
  { id: "2", name: "Hóa đơn B", amount: 860000 },
];

/** Hook nghiệp vụ giả: thực tế module gọi React Query với `query` */
const useDemoData = () => ({
  items: rows,
  total: rows.length,
  loading: false,
});

const listTab: V2ModuleTab<DemoRow> = {
  key: "list",
  label: "Danh sách",
  kind: "list",
  table: {
    tableId: "demo-module-list",
    columns: [
      { key: "name", label: "Tên", cell: (row) => row.name },
      {
        key: "amount",
        label: "Số tiền",
        cell: (row) => row.amount.toLocaleString("vi-VN"),
      },
    ],
    getRowKey: (row) => row.id,
    toolbar: { search: {} },
  },
  useData: useDemoData,
};

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

const meta: Meta<typeof V2ModulePage<DemoRow>> = {
  title: "Components/Templates/V2ModulePage",
  component: V2ModulePage,
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
  args: {
    title: "Hóa đơn",
    description: "Tổng quan và danh sách hóa đơn",
    tabs: [dashboardTab, listTab],
    syncUrl: false,
  },
};

export default meta;
type Story = StoryObj<typeof V2ModulePage<DemoRow>>;

export const ListAndDashboard: Story = {};

export const ListOnly: Story = {
  args: { tabs: [listTab] },
};
