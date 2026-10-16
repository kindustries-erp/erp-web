import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { GarageDashboardExportDrawer } from "../GarageDashboardExportDrawer";
import axiosInstance from "@/core/api/axiosInstance";
import toast from "react-hot-toast";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/core/api/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  API_BASE_URL: "http://api.test",
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: null }),
}));

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/garage/hooks/useGarage", () => ({
  useGarageBranches: () => ({
    data: [
      { id: "b-1", externalId: "CN-01", name: "Chi nhánh Quận 7", code: "Q7" },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ leftPanel, rightPanel }: any) => (
    <div data-testid="drawer-content">
      {leftPanel}
      {rightPanel}
    </div>
  ),
}));

vi.mock("@/shared/components/StandardTable", () => ({
  StandardTable: (props: any) => (
    <div data-testid="history-table">
      <div data-testid="history-table-count">{props.items?.length || 0}</div>
    </div>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="datepicker"
      placeholder={placeholder}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

const historyResponse = {
  items: [
    {
      jobId: "job-1",
      fileName: "Bao_cao_Garage.xlsx",
      status: "COMPLETED",
      current: 100,
      total: 100,
      message: "ok",
      createdAt: "2026-10-10T10:00:00.000Z",
      canDownload: true,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

function renderDrawer(
  props: Partial<React.ComponentProps<typeof GarageDashboardExportDrawer>> = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GarageDashboardExportDrawer open={true} onClose={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

const selectTab = async (name: string) => {
  await act(async () => {
    fireEvent.mouseDown(screen.getByRole("tab", { name }));
    fireEvent.click(screen.getByRole("tab", { name }));
  });
};

const exportAndGetCall = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("Xuất Excel"));
  });
  await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
  return (axiosInstance.post as any).mock.calls[0];
};

describe("GarageDashboardExportDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 16)); // 16/10/2026: tuần 42, quý 4
    (axiosInstance.get as any).mockResolvedValue({ data: historyResponse });
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "job-2", message: "Đang chạy nền", reused: false },
    });
  });
  afterEach(() => vi.useRealTimers());

  it("hiển thị lịch sử từ endpoint nền của dashboard và chỉ có chế độ theo kỳ", async () => {
    renderDrawer();

    await waitFor(() =>
      expect(screen.getByTestId("history-table-count").textContent).toBe("1"),
    );
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/greenway/dashboard/export/background/history",
      { params: { page: 1, pageSize: 10 } },
    );
    expect(screen.getByText("Theo kỳ")).toBeDefined();
    expect(screen.queryByText("Theo filter hiện tại")).toBeNull();
  });

  it("mặc định tháng hiện tại: POST { from, to } kèm header chi nhánh", async () => {
    renderDrawer();
    const [url, body, config] = await exportAndGetCall();

    expect(url).toBe("/api/v1/greenway/dashboard/export/background");
    expect(body).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(config.headers).toEqual({ "x-greenway-branch-id": "CN-01" });
  });

  it("tab Tuần và Quý gửi đúng khoảng ngày", async () => {
    renderDrawer();
    await selectTab("Tuần");
    const [, week] = await exportAndGetCall();
    expect(week).toEqual({ from: "2026-10-12", to: "2026-10-18" });
  });

  it("tab Quý: gửi cả quý hiện tại", async () => {
    renderDrawer();
    await selectTab("Quý");
    const [, body] = await exportAndGetCall();
    expect(body).toEqual({ from: "2026-10-01", to: "2026-12-31" });
  });

  it("tab Tùy chỉnh: thiếu ngày thì báo lỗi và không gọi API", async () => {
    renderDrawer();
    await selectTab("Tùy chỉnh");
    const [from] = screen.getAllByTestId("datepicker");
    fireEvent.change(from, { target: { value: "" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Xuất Excel"));
    });
    expect(toast.error).toHaveBeenCalledWith(
      "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("initialRange đặt sẵn kỳ tùy chỉnh khi mở từ drawer chi tiết KPI", async () => {
    renderDrawer({ initialRange: { from: "2026-09-05", to: "2026-09-20" } });
    const [, body] = await exportAndGetCall();
    expect(body).toEqual({ from: "2026-09-05", to: "2026-09-20" });
  });
});
