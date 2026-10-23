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
    userId: "user-1",
    title: "Đơn mua hàng PO-20261023-001 hoàn tất",
    message: "Toàn bộ vật tư đã được nhập kho thành công.",
    type: "SUCCESS",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    userId: "user-1",
    title: "Cảnh báo tồn kho dưới định mức",
    message: "Mặt hàng Má phanh trước chỉ còn 2 bộ trong kho.",
    type: "WARNING",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "notif-3",
    userId: "user-1",
    title: "Lỗi đồng bộ hóa đơn GDT",
    message: "Hóa đơn số 0012345 bị từ chối do sai chữ ký số.",
    type: "ERROR",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const meta: Meta<typeof V2NotificationPopover> = {
  title: "Components/Molecules/Feedback & Overlay/V2NotificationPopover",
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
