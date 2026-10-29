import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-hot-toast";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { usePortalSync } from "./usePortalSync";

vi.mock("react-hot-toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

describe("usePortalSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(erpInvoicesCoreApi.getPortalConfig).mockResolvedValue({
      token: "",
      cookies: "",
      hasPassword: false,
      username: "",
    } as any);
    vi.mocked(erpInvoicesCoreApi.portalSync).mockResolvedValue(
      syncResult as any,
    );
  });

  it("đồng bộ khoảng hơn 30 ngày mà không bị chặn", async () => {
    const { result } = renderHook(() => usePortalSync());

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
    const { result } = renderHook(() => usePortalSync());

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
});
