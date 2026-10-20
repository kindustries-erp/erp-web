import type { Meta, StoryObj } from "@storybook/react";
import { Wallet } from "lucide-react";
import { V2StatCard } from "./V2StatCard";

const meta: Meta<typeof V2StatCard> = {
  title: "Components/Molecules/Data Display/V2StatCard",
  component: V2StatCard,
  tags: ["autodocs"],
  args: {
    label: "Doanh thu tháng",
    value: "1.250.000.000",
    unit: "₫",
  },
};

export default meta;
type Story = StoryObj<typeof V2StatCard>;

export const Default: Story = {};

export const WithIconAndTrend: Story = {
  args: {
    icon: <Wallet className="h-4 w-4" />,
    trend: { direction: "up", label: "+12% so với tháng trước" },
  },
};

export const Loading: Story = {
  args: { loading: true },
};
