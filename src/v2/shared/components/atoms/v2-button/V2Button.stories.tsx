import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Plus, ArrowRight, Trash2, Check } from "lucide-react";
import { V2Button } from "./V2Button";

const meta: Meta<typeof V2Button> = {
  title: "V2/Atoms/V2Button",
  component: V2Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "destructive-outline",
        "link",
        "spreadsheet",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "md", "lg", "icon", "icon-sm"],
    },
    isLoading: {
      control: "boolean",
    },
    fullWidth: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2Button>;

export const Default: Story = {
  args: {
    children: "Nút chuẩn V2",
    variant: "default",
    size: "default",
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: "Thêm chứng từ mới",
    variant: "default",
    leftIcon: <Plus size={16} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Tiếp tục bước sau",
    variant: "outline",
    rightIcon: <ArrowRight size={16} />,
  },
};

export const LoadingState: Story = {
  args: {
    children: "Lưu dữ liệu",
    isLoading: true,
    loadingText: "Đang lưu...",
    variant: "primary",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Xác nhận và tiếp tục thanh toán",
    fullWidth: true,
    variant: "primary",
    leftIcon: <Check size={16} />,
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    children: "Xóa mặt hàng",
    variant: "destructive",
    leftIcon: <Trash2 size={16} />,
  },
};
