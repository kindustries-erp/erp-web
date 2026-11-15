import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { V2NotificationPopover } from "./V2NotificationPopover";
import type { CoreNotification } from "@/core/api/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const sampleNotifications: CoreNotification[] = [
  {
    id: "notif-1",
    title: "Đề nghị đã được duyệt",
    message: "GDNM-20261106-001 đã được duyệt",
    type: "SUCCESS",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    readAt: null,
    extraData: {},
    target: null,
  },
  {
    id: "notif-2",
    title: "Có đề nghị chờ bạn duyệt",
    message: "GDNM-20261109-001 - Mua hàng demo 2 đang chờ bạn duyệt.",
    type: "INFO",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    readAt: null,
    extraData: {},
    target: null,
  },
  {
    id: "notif-3",
    title: "Đồng bộ hóa đơn chưa đầy đủ",
    message:
      "Lượt đồng bộ Cổng Thuế có vấn đề: mua vào: 4 phần lỗi. Các hóa đơn còn thiếu sẽ được quét lại ở lượt sau.",
    type: "WARNING",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    readAt: null,
    extraData: {},
    target: null,
  },
  {
    id: "notif-4",
    title: "Lỗi đồng bộ hóa đơn GDT",
    message: "Hóa đơn số 0012345 bị từ chối do sai chữ ký số.",
    type: "ERROR",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    readAt: null,
    extraData: {},
    target: null,
  },
];

const meta: Meta<typeof V2NotificationPopover> = {
  title: "Components/Molecules/V2NotificationPopover",
  component: V2NotificationPopover,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-12 flex items-center justify-center">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2NotificationPopover>;

export const DefaultWithNotifications: Story = {
  args: {
    notifications: sampleNotifications,
    side: "bottom",
    align: "center",
    children: (
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-surface-hover cursor-pointer text-sm">
        <Bell className="w-4 h-4 text-primary" />
        <span>
          Thông báo ({sampleNotifications.filter((n) => !n.isRead).length})
        </span>
      </button>
    ),
  },
};

export const EmptyState: Story = {
  args: {
    notifications: [],
    side: "bottom",
    align: "center",
    children: (
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-surface-hover cursor-pointer text-sm">
        <Bell className="w-4 h-4 text-muted-fg" />
        <span>Không có thông báo</span>
      </button>
    ),
  },
};
