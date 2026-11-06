import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DrawerAuditTimeline } from "./DrawerAuditTimeline";
import type { DrawerAuditItem } from "./DrawerAuditTimeline.type";

const meta: Meta<typeof DrawerAuditTimeline> = {
  title: "Components/Molecules/Overlay & Menu/V2DrawerAuditTimeline",
  component: DrawerAuditTimeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DrawerAuditTimeline>;

const ITEMS: DrawerAuditItem[] = [
  {
    id: "1",
    action: "Gửi duyệt",
    actor: "Nguyễn Văn A",
    timestamp: "05/11/2026 08:00",
    variant: "warning",
  },
  {
    id: "2",
    action: "Duyệt",
    actor: "Trưởng garage",
    timestamp: "05/11/2026 09:00",
    details: "Lý do: Duyệt đơn hàng gấp",
    variant: "success",
  },
  {
    id: "3",
    action: "Đã hủy",
    actor: "Trưởng garage",
    timestamp: "06/11/2026 13:39",
    details: "Lý do: Test hủy",
    variant: "danger",
  },
];

export const Default: Story = {
  args: { items: ITEMS },
};

export const Stacked: Story = {
  args: { items: ITEMS, layout: "stacked" },
};

export const Empty: Story = {
  args: { items: [], emptyMessage: "Chưa có sự kiện phê duyệt nào" },
};
