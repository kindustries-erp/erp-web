import type { Meta, StoryObj } from "@storybook/react";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Boxes,
  Settings,
} from "lucide-react";
import { V2TabBar } from "./V2TabBar";

const meta: Meta<typeof V2TabBar> = {
  title: "V2/Organisms/V2TabBar",
  component: V2TabBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof V2TabBar>;

const sampleTabs = [
  {
    id: "tab-dashboard",
    label: "Bảng tổng quan",
    icon: LayoutDashboard,
    isClosable: false,
  },
  {
    id: "tab-invoices",
    label: "Hóa đơn VAT",
    icon: FileText,
    isClosable: true,
  },
  {
    id: "tab-garage",
    label: "Dịch vụ Garage",
    icon: Wrench,
    isClosable: true,
  },
  {
    id: "tab-inventory",
    label: "Tồn kho thực tế",
    icon: Boxes,
    isClosable: true,
  },
  {
    id: "tab-settings",
    label: "Cấu hình hệ thống",
    icon: Settings,
    isClosable: true,
  },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    activeTabId: "tab-invoices",
  },
};

export const FirstTabActive: Story = {
  args: {
    tabs: sampleTabs,
    activeTabId: "tab-dashboard",
  },
};
