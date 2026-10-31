import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2NotificationPopover } from "./V2NotificationPopover";
import {
  notificationsApi,
  type CoreNotification,
} from "@/core/api/notifications";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string, fallback?: string) => {
      const map: Record<string, string> = {
        "v2.notifications.title": "Thông báo",
        "v2.notifications.empty": "Chưa có thông báo nào",
        "v2.notifications.deleteAll": "Xóa tất cả",
        "v2.notifications.markAllAsRead": "Đánh dấu đã đọc tất cả",
        "v2.notifications.deleteItem": "Xóa thông báo",
      };
      return map[key] ?? fallback ?? key;
    },
    locale: "vi",
  }),
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ locale: "vi" }),
}));

vi.mock("@/core/api/notifications", () => ({
  notificationsApi: {
    findAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    delete: vi.fn(),
    deleteAll: vi.fn(),
  },
}));

const mockUseViewport = vi.fn().mockReturnValue({
  width: 1280,
  height: 800,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => mockUseViewport(),
}));

const mockNotifications: CoreNotification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    title: "Đơn hàng mới #1001",
    message: "Khách hàng Nguyễn Văn A vừa đặt hàng.",
    type: "INFO",
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    userId: "user-1",
    title: "Cập nhật tồn kho",
    message: "Mã SKU ABC đã hết hàng.",
    type: "WARNING",
    isRead: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("V2NotificationPopover Molecule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseViewport.mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });

  it("renders trigger element properly", () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover notifications={[]}>
          <button>Bell Trigger</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Bell Trigger" }),
    ).toBeInTheDocument();
  });

  it("shows empty state when notifications array is empty", () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover notifications={[]}>
          <button>Open</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Thông báo")).toBeInTheDocument();
    expect(screen.getByText("Chưa có thông báo nào")).toBeInTheDocument();
  });

  it("renders list of notifications when provided via props", () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover notifications={mockNotifications}>
          <button>Open</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Đơn hàng mới #1001")).toBeInTheDocument();
    expect(
      screen.getByText("Khách hàng Nguyễn Văn A vừa đặt hàng."),
    ).toBeInTheDocument();
    expect(screen.getByText("Cập nhật tồn kho")).toBeInTheDocument();
    expect(screen.getByTestId("unread-indicator")).toBeInTheDocument();
  });

  it("handles mark as read and delete mutations", async () => {
    (notificationsApi.markAsRead as any).mockResolvedValue({});
    (notificationsApi.delete as any).mockResolvedValue({});
    (notificationsApi.markAllAsRead as any).mockResolvedValue({});
    (notificationsApi.deleteAll as any).mockResolvedValue({});

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover notifications={mockNotifications}>
          <button>Open</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    // Click unread notification item
    fireEvent.click(screen.getByText("Đơn hàng mới #1001"));
    await waitFor(() => {
      expect(notificationsApi.markAsRead).toHaveBeenCalledWith("notif-1");
    });

    // Click mark all as read
    const markAllBtn = screen.getByText("Đánh dấu đã đọc tất cả");
    fireEvent.click(markAllBtn);
    await waitFor(() => {
      expect(notificationsApi.markAllAsRead).toHaveBeenCalled();
    });

    // Click delete all
    const deleteAllBtn = screen.getByText("Xóa tất cả");
    fireEvent.click(deleteAllBtn);
    await waitFor(() => {
      expect(notificationsApi.deleteAll).toHaveBeenCalled();
    });
  });

  it("falls back to querying API when notifications prop is undefined", async () => {
    (notificationsApi.findAll as any).mockResolvedValue(mockNotifications);

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover>
          <button>Open</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    expect(notificationsApi.findAll).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Đơn hàng mới #1001")).toBeInTheDocument();
    });
  });

  it("renders and opens V2BottomSheet on mobile viewport", async () => {
    mockUseViewport.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    (notificationsApi.markAsRead as any).mockResolvedValue({});
    const handleNotificationClick = vi.fn();

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover
          notifications={mockNotifications}
          onNotificationClick={handleNotificationClick}
        >
          <button>Mobile Bell Trigger</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    // Initial state: bottom sheet content not yet rendered
    expect(
      screen.queryByTestId("v2-bottom-sheet-content"),
    ).not.toBeInTheDocument();

    // Click trigger to open bottom sheet
    fireEvent.click(
      screen.getByRole("button", { name: "Mobile Bell Trigger" }),
    );

    // Bottom sheet elements should be visible
    const sheetContent = screen.getByTestId("v2-bottom-sheet-content");
    expect(sheetContent).toBeInTheDocument();
    expect(sheetContent.className).toContain("h-[100dvh]");
    expect(
      screen.getByTestId("v2-bottom-sheet-drag-handle"),
    ).toBeInTheDocument();
    expect(screen.getByText("Thông báo")).toBeInTheDocument();
    expect(screen.getByText("Đơn hàng mới #1001")).toBeInTheDocument();

    // Click a notification item
    fireEvent.click(screen.getByText("Đơn hàng mới #1001"));
    await waitFor(() => {
      expect(notificationsApi.markAsRead).toHaveBeenCalledWith("notif-1");
      expect(handleNotificationClick).toHaveBeenCalledWith(
        mockNotifications[0],
      );
    });
  });
});
