import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast from "react-hot-toast";

import axiosInstance from "@/core/api/axiosInstance";
import { createExportProgressStore } from "../createExportProgressStore";
import type { ExportJobScope } from "../exportJobTypes";
import { useBackgroundExport } from "../useBackgroundExport";
import { resolveDownloadFileName } from "../useBackgroundExportProgress";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/core/api/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  API_BASE_URL: "http://api.test",
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: "token" }),
}));

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: vi.fn().mockResolvedValue(undefined),
}));

const scope: ExportJobScope = {
  key: "test-scope",
  startPath: "/x/background",
  historyPath: "/x/background/history",
  streamPath: "/x/progress/stream",
  downloadPath: (id) => `/x/background/${id}/download`,
};
const messages = {
  downloading: "dang tai",
  downloadFailed: "tai loi",
  startFailed: "start loi",
};
const history = (items: any[] = []) => ({
  data: { items, total: items.length, page: 1, pageSize: 10, totalPages: 1 },
});

function setup() {
  const useStore = createExportProgressStore();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () =>
      useBackgroundExport<{ mode: string }>({
        scope,
        useStore,
        open: true,
        messages,
      }),
    { wrapper },
  );
  return { ...hook, useStore };
}

describe("useBackgroundExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as any).mockImplementation((url: string) =>
      url === scope.historyPath
        ? Promise.resolve(history())
        : Promise.resolve({ data: new Blob(["x"]), headers: {} }),
    );
    (window.URL as any).createObjectURL = vi.fn(() => "blob:x");
    (window.URL as any).revokeObjectURL = vi.fn();
  });

  it("start: POST payload kèm header và báo job chạy nền", async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "j1", message: "chay nen", reused: false },
    });
    const { result } = setup();

    await act(async () => {
      await result.current.start({ mode: "by-period" }, { h: "1" });
    });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/x/background",
      { mode: "by-period" },
      { headers: { h: "1" } },
    );
    expect(toast.success).toHaveBeenCalledWith("chay nen");
  });

  it("start: file đã tạo trước đó (reused) được tải ngay", async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "j9", message: "reuse", reused: true },
    });
    const { result } = setup();

    await act(async () => {
      await result.current.start({ mode: "by-period" });
    });

    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/x/background/j9/download",
        expect.objectContaining({ responseType: "blob" }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("dang tai");
  });

  it("start: lỗi từ server hiển thị message của API", async () => {
    (axiosInstance.post as any).mockRejectedValue({
      response: { data: { message: "Khong du quyen" } },
    });
    const { result } = setup();

    await act(async () => {
      await result.current.start({ mode: "by-period" });
    });

    expect(toast.error).toHaveBeenCalledWith("Khong du quyen");
  });

  it("tự tải file khi tiến độ SSE báo sẵn sàng đúng job đang theo dõi", async () => {
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "j2", message: "chay nen", reused: false },
    });
    const { result, useStore } = setup();

    await act(async () => {
      await result.current.start({ mode: "by-period" });
    });
    expect(
      (axiosInstance.get as any).mock.calls.some((c: any[]) =>
        String(c[0]).includes("/download"),
      ),
    ).toBe(false);

    act(() => {
      useStore.getState().setProgress({
        jobId: "j2",
        fileName: "a.xlsx",
        ready: true,
        completed: true,
        isRunning: false,
      });
    });

    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/x/background/j2/download",
        expect.anything(),
      ),
    );
  });

  it("không tự tải file của job khác (không do phiên này khởi tạo)", async () => {
    const { useStore } = setup();

    act(() => {
      useStore.getState().setProgress({
        jobId: "other",
        ready: true,
        completed: true,
      });
    });

    await new Promise((r) => setTimeout(r, 20));
    expect(
      (axiosInstance.get as any).mock.calls.some((c: any[]) =>
        String(c[0]).includes("/download"),
      ),
    ).toBe(false);
  });
});

describe("resolveDownloadFileName", () => {
  it("ưu tiên tên trong Content-Disposition, giải mã %", () => {
    expect(
      resolveDownloadFileName(
        `attachment; filename="B%C3%A1o_c%C3%A1o.xlsx"`,
        "x.xlsx",
      ),
    ).toBe("Báo_cáo.xlsx");
  });

  it("dùng tên dự phòng khi không có header", () => {
    expect(resolveDownloadFileName(undefined, "fallback.xlsx")).toBe(
      "fallback.xlsx",
    );
    expect(resolveDownloadFileName(undefined)).toBe("export.xlsx");
  });
});
