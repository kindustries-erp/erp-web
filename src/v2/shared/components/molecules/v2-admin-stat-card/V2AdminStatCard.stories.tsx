import type { Meta, StoryObj } from "@storybook/react";
import { V2AdminStatCard } from "./V2AdminStatCard";

const meta: Meta<typeof V2AdminStatCard> = {
  title: "Molecules/V2AdminStatCard",
  component: V2AdminStatCard,
};

export default meta;

type Story = StoryObj<typeof V2AdminStatCard>;

export const Default: Story = {
  args: {
    title: "Doanh thu tháng",
    value: "1.250.000.000 ₫",
    subtitle: "So với tháng trước",
    growthRate: 12.5,
    variant: "success",
  },
};
