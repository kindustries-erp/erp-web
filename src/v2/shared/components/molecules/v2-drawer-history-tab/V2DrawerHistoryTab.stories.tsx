import type { Meta } from "@storybook/react";
import React from "react";
import { V2DrawerHistoryTab } from "./V2DrawerHistoryTab";
import type { DrawerAuditItem } from "./V2DrawerHistoryTab.type";

const meta: Meta<typeof V2DrawerHistoryTab> = {
  title: "Components/Molecules/V2DrawerHistoryTab",
  component: V2DrawerHistoryTab,
  tags: ["autodocs"],
};
export default meta;

const items: DrawerAuditItem[] = [
  {
    id: 1,
    action: "Tạo phiếu",
    actor: "Lio",
    timestamp: "2026-11-05 09:00",
    variant: "default",
  },
  {
    id: 2,
    action: "Ghi sổ",
    actor: "Lio",
    timestamp: "2026-11-06 08:30",
    variant: "success",
  },
];

export const Default = () => (
  <V2DrawerHistoryTab items={items} title="Lịch sử" />
);

export const Empty = () => (
  <V2DrawerHistoryTab
    items={[]}
    title="Lịch sử"
    emptyMessage="Chưa có lịch sử"
  />
);

export const Loading = () => <V2DrawerHistoryTab items={[]} loading />;
