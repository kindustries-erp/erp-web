import type { Meta, StoryObj } from "@storybook/react";
import { V2Panel } from "@/v2/shared/components/molecules/v2-panel";
import { V2BarChart } from "./V2BarChart";
import { V2DonutChart } from "./V2DonutChart";
import { V2LineChart } from "./V2LineChart";

const months = ["T1", "T2", "T3", "T4", "T5", "T6"];
const series = [
  { key: "in", label: "Mua vào", data: [120, 150, 90, 180, 140, 200] },
  { key: "out", label: "Bán ra", data: [200, 170, 210, 260, 230, 300] },
];
const money = (value: number) => `${value.toLocaleString("vi-VN")} tr`;

const meta: Meta = {
  title: "Components/Organisms/Chart/V2Chart",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[560px] p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Bars: Story = {
  render: () => (
    <V2Panel title="Doanh số theo tháng">
      <V2BarChart
        labels={months}
        series={series}
        formatValue={money}
        ariaLabel="Doanh số theo tháng"
      />
    </V2Panel>
  ),
};

export const StackedBars: Story = {
  render: () => (
    <V2Panel title="Cơ cấu theo tháng">
      <V2BarChart
        stacked
        labels={months}
        series={series}
        formatValue={money}
        ariaLabel="Cơ cấu theo tháng"
      />
    </V2Panel>
  ),
};

export const Lines: Story = {
  render: () => (
    <V2Panel title="Xu hướng dòng tiền">
      <V2LineChart
        area
        labels={months}
        series={series}
        formatValue={money}
        ariaLabel="Xu hướng dòng tiền"
      />
    </V2Panel>
  ),
};

export const SingleSeries: Story = {
  render: () => (
    <V2Panel title="Doanh số bán ra">
      <V2BarChart
        labels={months}
        series={[series[1]!]}
        formatValue={money}
        ariaLabel="Doanh số bán ra"
      />
    </V2Panel>
  ),
};

export const Donut: Story = {
  render: () => (
    <V2Panel title="Cơ cấu đối tác">
      <V2DonutChart
        labels={["Đối tác A", "Đối tác B", "Đối tác C", "Đối tác D"]}
        values={[42, 28, 18, 12]}
        formatValue={(v) => `${v}%`}
        ariaLabel="Cơ cấu đối tác"
        height={220}
      />
    </V2Panel>
  ),
};
