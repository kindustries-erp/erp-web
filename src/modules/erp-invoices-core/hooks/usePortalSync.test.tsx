import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-hot-toast";
import type { ReactNode } from "react";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { usePortalSync } from "./usePortalSync";
import { mapPortalSyncError } from "./portalSyncError.helper";

vi.mock("react-hot-toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Trả về chuỗi mặc định để assert nội dung toast tiếng Việt
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string"
        ? fallback
        : ((fallback as { defaultValue?: string })?.defaultValue ?? key),
  }),
}));

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getPortalConfig: vi.fn(),
    savePortalConfig: vi.fn(),
    portalSync: vi.fn(),
  },
}));

const syncResult = {
  total: 0,
  imported: 0,
  skipped: 0,
  xmlDownloadQueued: 0,
  note: "",
};

const wrapperFor = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("usePortalSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(erpInvoicesCoreApi.getPortalConfig).mockResolvedValue({
      hasToken: false,
      hasPassword: false,
      username: "",
    });
    vi.mocked(erpInvoicesCoreApi.portalSync).mockResolvedValue(
      syncResult as any,
    );
  });

  it("đồng bộ khoảng hơn 30 ngày mà không bị chặn", async () => {
    const { result } = renderHook(() => usePortalSync(), {
      wrapper: wrapperFor(),
    });

    await act(async () => {
      await result.current.sync("purchase", {
        dateFrom: "2026-01-01",
        dateTo: "2026-06-30",
      });
    });

    expect(erpInvoicesCoreApi.portalSync).toHaveBeenCalledWith({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      type: "purchase",
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("chặn khi ngày đến nhỏ hơn ngày từ", async () => {
    const { result } = renderHook(() => usePortalSync(), {
      wrapper: wrapperFor(),
    });

    await act(async () => {
      await result.current.sync("sold", {
        dateFrom: "2026-06-30",
        dateTo: "2026-01-01",
      });
    });

    expect(erpInvoicesCoreApi.portalSync).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Ngày đến không được nhỏ hơn ngày từ",
    );
  });

  it("đọc hasToken từ cấu hình qua query", async () => {
    vi.mocked(erpInvoicesCoreApi.getPortalConfig).mockResolvedValue({
      hasToken: true,
      hasPassword: true,
      username: "0318334886",
    });

    const { result } = renderHook(() => usePortalSync(), {
      wrapper: wrapperFor(),
    });

    await waitFor(() => expect(result.current.isTokenLoaded).toBe(true));
    expect(result.current.hasToken).toBe(true);
    expect(result.current.hasPassword).toBe(true);
    expect(result.current.username).toBe("0318334886");
  });

  it("bật needsRelogin khi token hết hạn và đăng nhập lại thất bại", async () => {
    vi.mocked(erpInvoicesCoreApi.portalSync).mockRejectedValue({
      response: { data: { message: "GDT_TOKEN_EXPIRED" } },
    });
    const { result } = renderHook(() => usePortalSync(), {
      wrapper: wrapperFor(),
    });

    let returned: unknown = "not-called";
    await act(async () => {
      returned = await result.current.sync("purchase", {
        dateFrom: "2026-10-01",
        dateTo: "2026-10-09",
      });
    });

    expect(returned).toBeUndefined();
    expect(result.current.needsRelogin).toBe(true);
  });
});

describe("mapPortalSyncError", () => {
  it("ánh xạ mã GDT đã biết sang khóa riêng", () => {
    const mapped = mapPortalSyncError({
      response: { data: { message: "GDT_TAXPAYER_MISMATCH" } },
    });
    expect(mapped.key).toBe("portalSyncTaxpayerMismatch");
    expect(mapped.needsRelogin).toBe(false);
  });

  it("mã không biết thì giữ thông điệp của server", () => {
    const mapped = mapPortalSyncError({
      response: { data: { message: "Lỗi lạ" } },
    });
    expect(mapped.key).toBe("portalSyncFailed");
    expect(mapped.fallback).toBe("Lỗi lạ");
  });
});
