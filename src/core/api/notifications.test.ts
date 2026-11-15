import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "./axiosInstance";
import { notificationsApi } from "./notifications";

vi.mock("./axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const ITEM = {
  id: "n-1",
  title: "Đơn mua chờ duyệt",
  message: "PO-0001 đang chờ duyệt",
  type: "WARNING",
  isRead: false,
  readAt: null,
  createdAt: "2026-11-09T08:30:00.000Z",
  extraData: {},
  target: {
    module: "PROCUREMENT_ORDER_GARAGE",
    id: "PO-0001",
    action: "APPROVE",
  },
};

describe("notificationsApi (v2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findAll gọi /api/v2/notifications-inbox với pageSize 50 và trả mảng items", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        items: [ITEM],
        pagination: { page: 1, pageSize: 50, total: 1, totalPages: 1 },
        extraData: { unreadCount: 1 },
      },
    } as any);

    const result = await notificationsApi.findAll();

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v2/notifications-inbox",
      {
        params: { page: 1, pageSize: 50 },
      },
    );
    expect(result).toEqual([ITEM]);
  });

  it("markAsRead gọi PATCH /:id/read với _silentSuccess: true", async () => {
    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: { message: "ok" },
    } as any);

    await notificationsApi.markAsRead("n-1");

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/v2/notifications-inbox/n-1/read",
      undefined,
      { _silentSuccess: true },
    );
  });

  it("markAllAsRead gọi PATCH /read-all với _silentSuccess: true", async () => {
    vi.mocked(axiosInstance.patch).mockResolvedValue({ data: {} } as any);

    await notificationsApi.markAllAsRead();

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/v2/notifications-inbox/read-all",
      undefined,
      { _silentSuccess: true },
    );
  });

  it("delete gọi DELETE /:id và deleteAll gọi DELETE /all", async () => {
    vi.mocked(axiosInstance.delete).mockResolvedValue({ data: {} } as any);

    await notificationsApi.delete("n-1");
    await notificationsApi.deleteAll();

    expect(axiosInstance.delete).toHaveBeenNthCalledWith(
      1,
      "/api/v2/notifications-inbox/n-1",
    );
    expect(axiosInstance.delete).toHaveBeenNthCalledWith(
      2,
      "/api/v2/notifications-inbox/all",
    );
  });

  it("không còn URL v1 nào", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { items: [], pagination: {}, extraData: { unreadCount: 0 } },
    } as any);

    await notificationsApi.findAll();

    const url = vi.mocked(axiosInstance.get).mock.calls[0][0] as string;
    expect(url).not.toContain("/api/v1/notifications");
  });
});
