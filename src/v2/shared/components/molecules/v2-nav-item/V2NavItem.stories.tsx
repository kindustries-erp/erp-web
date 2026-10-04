import type { Meta, StoryObj } from "@storybook/react";
import { LayoutDashboard, ShoppingCart, Bell, Wrench } from "lucide-react";
import { V2NavItem } from "./V2NavItem";

const meta: Meta<typeof V2NavItem> = {
  title: "V2/Molecules/V2NavItem",
  component: V2NavItem,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["sidebar", "bottom-nav"],
    },
    isActive: {
      control: "boolean",
    },
    isCollapsed: {
      control: "boolean",
    },
    badgeCount: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2NavItem>;

export const SidebarActive: Story = {
  args: {
    label: "Bảng tổng quan",
    icon: LayoutDashboard,
    isActive: true,
    variant: "sidebar",
    isCollapsed: false,
  },
};

export const SidebarWithBadge: Story = {
  args: {
    label: "Đơn bán hàng",
    icon: ShoppingCart,
    isActive: false,
    badgeCount: 5,
    variant: "sidebar",
    isCollapsed: false,
  },
};

export const SidebarCollapsed: Story = {
  args: {
    label: "Thông báo hệ thống",
    icon: Bell,
    isActive: false,
    variant: "sidebar",
    isCollapsed: true,
  },
};

export const BottomNavActive: Story = {
  args: {
    label: "Dịch vụ",
    icon: Wrench,
    isActive: true,
    variant: "bottom-nav",
  },
};
