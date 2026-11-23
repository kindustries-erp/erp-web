import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2NotificationPopover } from "./V2NotificationPopover";
import {
  notificationsApi,
  NotificationType,
  NotificationTargetAction,
  type CoreNotification,
} from "@/core/api/notifications";
import { resolveNotificationIconMeta } from "./V2NotificationItem.config";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string, fallback?: string) => {
      const map: Record<string, string> = {
        "v2.notifications.title": "Thông báo",
        "v2.notifications.empty": "Chưa có thông báo nào",
        "v2.notifications.deleteAll": "Xóa tất cả",
        "v2.notifications.markAllAsRead": "Đánh dấu đã đọc tất cả",
        "v2.notifications.deleteItem": "Xóa thông báo",
        "v2.notifications.markAsReadSuccess": "Đã đánh dấu thông báo là đã đọc",
        "v2.notifications.markAllAsReadSuccess":
          "Đã đánh dấu tất cả thông báo là đã đọc",
      };
      return map[key] ?? fallback ?? key;
    },
    locale: "vi",
  }),
}));

const mockShowToast = vi.fn();
vi.mock("@/v2/shared/stores/useV2ToastStore", () => ({
  useV2ToastStore: (selector: any) =>
    selector
      ? selector({ showToast: mockShowToast })
      : { showToast: mockShowToast },
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ locale: "vi" }),
}));

vi.mock("@/core/api/notifications", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/core/api/notifications")>();
  return {
    ...actual,
    notificationsApi: {
      findAll: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      delete: vi.fn(),
      deleteAll: vi.fn(),
    },
  };
});

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
    title: "Đơn hàng mới #1001",
    message: "Khách hàng Nguyễn Văn A vừa đặt hàng.",
    type: NotificationType.INFO,
    isRead: false,
    createdAt: new Date().toISOString(),
    readAt: null,
    extraData: {},
    target: null,
  },
  {
    id: "notif-2",
    title: "Cập nhật tồn kho",
    message: "Mã SKU ABC đã hết hàng.",
    type: NotificationType.WARNING,
    isRead: true,
    createdAt: new Date().toISOString(),
    readAt: null,
    extraData: {},
    target: null,
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
    mockShowToast.mockClear();
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

    // Click icon đánh dấu đã đọc: mark read (không điều hướng, panel giữ nguyên)
    fireEvent.click(screen.getByTestId("mark-as-read-button"));
    await waitFor(() => {
      expect(notificationsApi.markAsRead).toHaveBeenCalledWith("notif-1");
      expect(mockShowToast).toHaveBeenCalledWith({
        variant: "success",
        title: "Đã đánh dấu thông báo là đã đọc",
      });
    });
    expect(screen.getByText("Đơn hàng mới #1001")).toBeInTheDocument();

    // Click mark all as read
    const markAllBtn = screen.getByText("Đánh dấu đã đọc tất cả");
    fireEvent.click(markAllBtn);
    await waitFor(() => {
      expect(notificationsApi.markAllAsRead).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith({
        variant: "success",
        title: "Đã đánh dấu tất cả thông báo là đã đọc",
      });
    });

    // Click delete all
    const deleteAllBtn = screen.getByText("Xóa tất cả");
    fireEvent.click(deleteAllBtn);
    await waitFor(() => {
      expect(notificationsApi.deleteAll).toHaveBeenCalled();
    });
  });

  it("click nội dung thông báo trên desktop: điều hướng và đóng popover", async () => {
    const handleNotificationClick = vi.fn();

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover
          notifications={mockNotifications}
          onNotificationClick={handleNotificationClick}
        >
          <button>Open</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(screen.getByText("Đơn hàng mới #1001"));

    await waitFor(() => {
      expect(handleNotificationClick).toHaveBeenCalledWith(
        mockNotifications[0],
      );
      expect(notificationsApi.markAsRead).toHaveBeenCalledWith("notif-1");
      expect(mockShowToast).toHaveBeenCalledWith({
        variant: "success",
        title: "Đã đánh dấu thông báo là đã đọc",
      });
      expect(screen.queryByText("Đơn hàng mới #1001")).not.toBeInTheDocument();
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

    // Click a notification item: tự động mark read và gọi callback điều hướng
    fireEvent.click(screen.getByText("Đơn hàng mới #1001"));
    await waitFor(() => {
      expect(handleNotificationClick).toHaveBeenCalledWith(
        mockNotifications[0],
      );
      expect(notificationsApi.markAsRead).toHaveBeenCalledWith("notif-1");
    });
  });

  it("applies high-contrast Light theme classes while preserving Dark variants and supports per-item delete", async () => {
    (notificationsApi.delete as any).mockResolvedValue({});

    const allTypeNotifications: CoreNotification[] = [
      ...mockNotifications,
      {
        id: "notif-3",
        title: "Nhập kho hoàn tất",
        message: "Phiếu nhập #GR-01 đã xác nhận.",
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date().toISOString(),
        readAt: null,
        extraData: {},
        target: null,
      },
      {
        id: "notif-4",
        title: "Lỗi đồng bộ",
        message: "Không thể kết nối máy chủ hóa đơn.",
        type: NotificationType.ERROR,
        isRead: true,
        createdAt: new Date().toISOString(),
        readAt: null,
        extraData: {},
        target: null,
      },
    ];

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <V2NotificationPopover notifications={allTypeNotifications}>
          <button>Open All Types</button>
        </V2NotificationPopover>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open All Types" }));

    expect(screen.getByText("Nhập kho hoàn tất")).toBeInTheDocument();
    expect(screen.getByText("Lỗi đồng bộ")).toBeInTheDocument();

    const unreadCard = screen
      .getByText("Đơn hàng mới #1001")
      .closest("div.group");
    const readCard = screen.getByText("Cập nhật tồn kho").closest("div.group");

    expect(unreadCard?.className).toContain("bg-item-bg-unread");
    expect(unreadCard?.className).toContain("border-item-border-unread");
    expect(unreadCard?.className).toContain("border-l-primary");
    expect(unreadCard?.className).toContain("shadow-card-item");
    expect(readCard?.className).toContain("border-item-border");
    expect(readCard?.className).toContain("bg-surface-hover/25");
    expect(readCard?.className).toContain("opacity-75");

    const unreadDots = screen.getAllByTestId("unread-indicator");
    expect(unreadDots[0].className).toContain("bg-primary");

    const deleteButtons = screen.getAllByRole("button", {
      name: "Xóa thông báo",
    });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(notificationsApi.delete).toHaveBeenCalledWith("notif-1");
    });
  });

  it("phân giải icon thông minh: icon File* cho chứng từ tương tác và icon Circle* cho thông báo tĩnh", () => {
    const approveAction = resolveNotificationIconMeta(NotificationType.INFO, {
      module: "PROCUREMENT_REQUEST_GARAGE",
      id: "pr-1",
      action: NotificationTargetAction.APPROVE,
    });
    expect(approveAction.isActionable).toBe(true);
    expect(approveAction.Icon.displayName || approveAction.Icon.name).toBe(
      "FileClock",
    );

    const successDoc = resolveNotificationIconMeta(NotificationType.SUCCESS, {
      module: "PROCUREMENT_REQUEST_GARAGE",
      id: "pr-2",
      action: NotificationTargetAction.VIEW,
    });
    expect(successDoc.isActionable).toBe(true);
    expect(successDoc.Icon.displayName || successDoc.Icon.name).toBe(
      "FileCheck2",
    );

    const staticInfo = resolveNotificationIconMeta(NotificationType.INFO, null);
    expect(staticInfo.isActionable).toBe(false);
    expect(staticInfo.Icon.displayName || staticInfo.Icon.name).toBe("Info");
  });
});
