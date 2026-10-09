import type { Meta, StoryObj } from "@storybook/react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2EmptyState } from "./V2EmptyState";

const meta: Meta<typeof V2EmptyState> = {
  title: "Components/Molecules/Feedback/V2EmptyState",
  component: V2EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof V2EmptyState>;

export const Default: Story = {};
export const WithAction: Story = {
  args: {
    title: "Chưa có hóa đơn",
    description: "Đồng bộ từ Cổng thuế hoặc nhập tệp XML để bắt đầu.",
    action: <V2Button size="sm">Đồng bộ ngay</V2Button>,
  },
};
