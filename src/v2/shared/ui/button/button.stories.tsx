import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "V2/UI Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "destructive",
        "destructive-outline",
        "outline",
        "secondary",
        "ghost",
        "link",
        "spreadsheet",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "md", "lg", "icon", "icon-sm"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Nút mặc định",
    variant: "default",
    size: "default",
  },
};

export const Primary: Story = {
  args: {
    children: "Lưu thay đổi",
    variant: "primary",
    size: "default",
  },
};

export const Outline: Story = {
  args: {
    children: "Đóng cửa sổ",
    variant: "outline",
    size: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Tùy chọn phụ",
    variant: "secondary",
    size: "default",
  },
};

export const Ghost: Story = {
  args: {
    children: "Nút trong suốt",
    variant: "ghost",
    size: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Xóa dữ liệu",
    variant: "destructive",
    size: "default",
  },
};

export const DestructiveOutline: Story = {
  args: {
    children: "Hủy bỏ tác vụ",
    variant: "destructive-outline",
    size: "default",
  },
};

export const Spreadsheet: Story = {
  args: {
    children: "Hành động bảng",
    variant: "spreadsheet",
    size: "sm",
  },
};

export const Disabled: Story = {
  args: {
    children: "Không thể bấm",
    disabled: true,
  },
};
