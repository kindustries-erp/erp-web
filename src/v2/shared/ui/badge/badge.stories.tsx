import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "V2/UI Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "success",
        "warning",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Huy hiệu chính",
    variant: "default",
  },
};

export const Success: Story = {
  args: {
    children: "Hoàn thành",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Đang chờ duyệt",
    variant: "warning",
  },
};

export const Destructive: Story = {
  args: {
    children: "Đã hủy bỏ",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Bản nháp",
    variant: "outline",
  },
};
