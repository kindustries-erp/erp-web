import type { Meta, StoryObj } from "@storybook/react";
import { V2ChartFrame } from "./V2ChartFrame";

const meta: Meta<typeof V2ChartFrame> = {
  title: "Components/Molecules/Data Display/V2ChartFrame",
  component: V2ChartFrame,
  tags: ["autodocs"],
  args: {
    labels: ["T1", "T2", "T3"],
    series: [
      { key: "in", label: "Mua vào", data: [1000, 2500, 1800] },
      { key: "out", label: "Bán ra", data: [3000, 4000, 3500] },
    ],
    legend: [
      { key: "in", label: "Mua vào", color: "#eb6834" },
      { key: "out", label: "Bán ra", color: "#1baf7a" },
    ],
    ariaLabel: "Doanh số theo tháng",
    height: 160,
    children: (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Biểu đồ vẽ ở đây
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-[480px] p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2ChartFrame>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { labels: [], series: [], legend: [] } };
