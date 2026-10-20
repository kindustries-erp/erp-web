import type { Meta, StoryObj } from "@storybook/react";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  Wrench,
  Settings,
} from "lucide-react";
import { V2Sidebar } from "./V2Sidebar";

const meta: Meta<typeof V2Sidebar> = {
  title: "Components/Organisms/Layout Shell/V2Sidebar",
  component: V2Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    collapsed: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2Sidebar>;

const sampleSections = [
  {
    id: "overview",
    label: "Tổng quan",
    items: [
      {
        id: "dashboard",
        label: "Bảng điều khiển",
        icon: LayoutDashboard,
        href: "/v2/dashboard",
      },
    ],
  },
  {
    id: "finance",
    label: "Tài chính & Kế toán",
    items: [
      {
        id: "invoices",
        label: "Hóa đơn VAT",
        icon: FileText,
        href: "/v2/invoices",
        badgeCount: 5,
      },
    ],
  },
  {
    id: "operations",
    label: "Kho vận & Dịch vụ",
    items: [
      {
        id: "inventory",
        label: "Tồn kho thực tế",
        icon: Boxes,
        href: "/v2/inventory",
      },
      {
        id: "garage",
        label: "Dịch vụ Garage",
        icon: Wrench,
        href: "/v2/garage",
      },
      {
        id: "settings",
        label: "Cấu hình",
        icon: Settings,
        href: "/v2/settings",
      },
    ],
  },
];

export const Expanded: Story = {
  args: {
    sections: sampleSections,
    activeId: "invoices",
    collapsed: false,
    user: {
      displayName: "Nguyễn Văn An",
      avatarInitials: "NA",
      unreadCount: 3,
    },
  },
};

export const Collapsed: Story = {
  args: {
    sections: sampleSections,
    activeId: "invoices",
    collapsed: true,
    user: {
      displayName: "Nguyễn Văn An",
      avatarInitials: "NA",
      unreadCount: 3,
    },
  },
};
