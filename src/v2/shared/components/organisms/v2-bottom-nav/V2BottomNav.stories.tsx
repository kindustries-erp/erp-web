import type { Meta, StoryObj } from "@storybook/react";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Boxes,
  Settings,
} from "lucide-react";
import { V2BottomNav } from "./V2BottomNav";

const meta: Meta<typeof V2BottomNav> = {
  title: "Components/Organisms/Layout Shell/V2BottomNav",
  component: V2BottomNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof V2BottomNav>;

const sampleBottomNavItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    href: "/v2/dashboard",
  },
  {
    id: "invoices",
    label: "Hóa đơn",
    icon: FileText,
    href: "/v2/invoices",
    badgeCount: 3,
  },
  {
    id: "garage",
    label: "Garage",
    icon: Wrench,
    href: "/v2/garage",
  },
  {
    id: "inventory",
    label: "Kho",
    icon: Boxes,
    href: "/v2/inventory",
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: Settings,
    href: "/v2/settings",
  },
];

export const DefaultMobile: Story = {
  args: {
    items: sampleBottomNavItems,
    activeId: "dashboard",
  },
};

export const InvoicesActiveWithBadge: Story = {
  args: {
    items: sampleBottomNavItems,
    activeId: "invoices",
  },
};
