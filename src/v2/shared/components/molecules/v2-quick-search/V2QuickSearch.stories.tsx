import type { Meta, StoryObj } from "@storybook/react";
import { V2QuickSearch } from "./V2QuickSearch";

const meta: Meta<typeof V2QuickSearch> = {
  title: "Components/Molecules/Filter & Search/V2QuickSearch",
  component: V2QuickSearch,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
    },
    shortcutLabel: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2QuickSearch>;

export const Default: Story = {
  args: {
    placeholder: "Tìm kiếm nhanh dữ liệu, chứng từ...",
    shortcutLabel: "Ctrl K",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Tìm theo số hóa đơn, serial xe, khách hàng...",
    shortcutLabel: "⌘K",
  },
};
