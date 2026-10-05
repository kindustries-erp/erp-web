import type { Meta, StoryObj } from "@storybook/react";
import { Receipt, Truck, Wrench } from "lucide-react";
import { V2SidebarNavItem } from "./V2SidebarNavItem";

const meta: Meta<typeof V2SidebarNavItem> = {
  title: "V2/Molecules/V2SidebarNavItem",
  component: V2SidebarNavItem,
  tags: ["autodocs"],
  argTypes: {
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
type Story = StoryObj<typeof V2SidebarNavItem>;

export const ActiveInvoiceItem: Story = {
  args: {
    label: "Hóa đơn VAT",
    icon: Receipt,
    isActive: true,
    isCollapsed: false,
  },
};

export const InactiveWithBadge: Story = {
  args: {
    label: "Phiếu nhập kho",
    icon: Truck,
    isActive: false,
    badgeCount: 12,
    isCollapsed: false,
  },
};

export const CollapsedMode: Story = {
  args: {
    label: "Garage Service",
    icon: Wrench,
    isActive: false,
    isCollapsed: true,
  },
};
