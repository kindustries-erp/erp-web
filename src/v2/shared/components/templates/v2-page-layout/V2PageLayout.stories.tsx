import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LayoutDashboard } from "lucide-react";
import { V2PageLayout } from "./V2PageLayout";
import { V2MobileTabMode } from "@/v2/shared/types";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

const demoTabs = [
  { value: "overview", label: "Tổng quan" },
  { value: "operations", label: "Hoạt động" },
  { value: "reports", label: "Báo cáo" },
];

const meta: Meta<typeof V2PageLayout> = {
  title: "Components/Templates/V2PageLayout",
  component: V2PageLayout,
  tags: ["autodocs"],
  args: {
    title: "Tổng quan Garage",
    desc: "Báo cáo tổng quan hiệu quả hoạt động xưởng dịch vụ",
    icon: <LayoutDashboard className="h-4 w-4" />,
    tabs: demoTabs,
    activeTab: "overview",
    children: (
      <div className="rounded-xl border border-border bg-surface p-6 shadow-2xs">
        <p className="text-sm text-foreground">Nội dung thẻ KPI và Báo cáo</p>
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof V2PageLayout>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    actions: <V2Button size="sm">Đồng bộ</V2Button>,
  },
};

export const ScrollTabMode: Story = {
  args: {
    mobileTabMode: V2MobileTabMode.SCROLL,
  },
};
