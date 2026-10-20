import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, DollarSign, Wallet } from "lucide-react";
import { V2SidebarSection } from "./V2SidebarSection";
import { V2SidebarNavItem } from "../v2-sidebar-nav-item";

const meta: Meta<typeof V2SidebarSection> = {
  title: "Components/Molecules/Navigation & Sidebar/V2SidebarSection",
  component: V2SidebarSection,
  tags: ["autodocs"],
  argTypes: {
    isCollapsed: {
      control: "boolean",
    },
    defaultOpen: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2SidebarSection>;

export const DefaultExpanded: Story = {
  args: {
    label: "Kế toán & Tài chính",
    isCollapsed: false,
    defaultOpen: true,
    children: (
      <div className="space-y-1">
        <V2SidebarNavItem label="Hóa đơn VAT" icon={FileText} isActive={true} />
        <V2SidebarNavItem
          label="Sổ quỹ tiền mặt"
          icon={Wallet}
          isActive={false}
        />
        <V2SidebarNavItem
          label="Sao kê ngân hàng"
          icon={DollarSign}
          isActive={false}
          badgeCount={3}
        />
      </div>
    ),
  },
};

export const CollapsedMode: Story = {
  args: {
    label: "Kế toán",
    isCollapsed: true,
    children: (
      <div className="space-y-1">
        <V2SidebarNavItem
          label="Hóa đơn VAT"
          icon={FileText}
          isActive={true}
          isCollapsed={true}
        />
      </div>
    ),
  },
};
