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

import { GarageExportDrawer } from "../GarageExportDrawer";
import axiosInstance from "@/core/api/axiosInstance";

const standardTableSpy = vi.fn();

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
  StandardTable: (props: any) => {
    standardTableSpy(props);
    return (
      <div data-testid="history-table">
        <div data-testid="history-table-count">{props.items?.length || 0}</div>
      </div>
    );
  },
}));

vi.mock("@/shared/components/MultiCombobox", () => ({
  MultiCombobox: ({ value, onChange, placeholder, options }: any) => (
    <select
      multiple
      value={value}
      aria-label={placeholder}
      onChange={(e) =>
        onChange?.(Array.from(e.target.selectedOptions, (o) => o.value))
      }
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, placeholder, options, disabled }: any) => (
    <div data-testid="combobox" data-disabled={disabled ? "true" : "false"}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={placeholder}
        disabled={disabled}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
      fileName: "Bang_ke.xlsx",
      status: "COMPLETED",
      current: 100,
      total: 100,
      message: "ok",
      createdAt: "2026-07-20T10:00:00.000Z",
      canDownload: true,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const tableQuery = {
  date_from: "2026-07-01",
  date_to: "2026-07-31",
  filtersStr: JSON.stringify({ customer: ["A"], statusTab: ["completed"] }),
  sorts: ["-doanhThu"],
};

function renderDrawer(
  props: Partial<React.ComponentProps<typeof GarageExportDrawer>> = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GarageExportDrawer
        open={true}
        onClose={vi.fn()}
        defaultReportType="cases-list"
        initialBranchId="CN-01"
        {...props}
      />
    </QueryClientProvider>,
  );
}

const selectTab = async (name: string) => {
  await act(async () => {
    fireEvent.mouseDown(screen.getByRole("tab", { name }));
    fireEvent.click(screen.getByRole("tab", { name }));
  });
};

describe("GarageExportDrawer - bảng kê phiếu dịch vụ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as any).mockResolvedValue({ data: historyResponse });
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "job-2", message: "Đang chạy nền", reused: false },
    });
  });

  it("hiển thị lịch sử xuất từ server và các trường theo kỳ", async () => {
    renderDrawer();

    await waitFor(() =>
      expect(screen.getByTestId("history-table-count").textContent).toBe("1"),
    );
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/greenway/cases/export/excel/background/history",
      { params: { page: 1, pageSize: 10 } },
    );
    expect(screen.getByText("Theo kỳ")).toBeDefined();
    expect(screen.getByText("Xuất Excel")).toBeDefined();
  });

  it("ẩn chế độ 'theo filter hiện tại' khi bảng không truyền điều kiện", () => {
    renderDrawer();
    expect(screen.queryByText("Theo filter hiện tại")).toBeNull();
  });

  it("chi nhánh chỉ xem (disabled)", () => {
    renderDrawer();
    const disabled = screen
      .getAllByTestId("combobox")
      .find((el) => el.getAttribute("data-disabled") === "true");
    expect(disabled).toBeDefined();
  });

  it("chế độ theo kỳ: POST background với kỳ, trạng thái và header chi nhánh", async () => {
    renderDrawer();

    await act(async () => {
      fireEvent.click(screen.getByText("Xuất Excel"));
    });

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
    const [url, body, config] = (axiosInstance.post as any).mock.calls[0];
    expect(url).toBe("/api/v1/greenway/cases/export/excel/background");
    expect(body).toMatchObject({
      mode: "by-period",
      date_type: "completion_date",
      status: "completed",
    });
    expect(body.date_from).toBeTruthy();
    expect(body.filtersStr).toBeUndefined();
    expect(config.headers).toEqual({ "x-greenway-branch-id": "CN-01" });
  });

  it("chế độ theo filter hiện tại: gửi filtersStr, sorts và khoảng ngày của bảng", async () => {
    renderDrawer({ tableQuery });

    fireEvent.click(screen.getByLabelText(/Theo filter hiện tại/));
    expect(screen.getByTestId("garage-export-filter-preview")).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByText("Xuất Excel"));
    });

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
    const [, body] = (axiosInstance.post as any).mock.calls[0];
    expect(body).toEqual({
      mode: "by-current-filter",
      date_from: "2026-07-01",
      date_to: "2026-07-31",
      q: undefined,
      sorts: ["-doanhThu"],
      filtersStr: tableQuery.filtersStr,
    });
  });

  describe("chọn kỳ Tuần / Tháng / Quý", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 9, 16)); // 16/10/2026: tuần 42, quý 4
    });
    afterEach(() => vi.useRealTimers());

    const exportAndGetBody = async () => {
      await act(async () => {
        fireEvent.click(screen.getByText("Xuất Excel"));
      });
      await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
      return (axiosInstance.post as any).mock.calls[0][1];
    };

    it("mặc định theo tháng hiện tại", async () => {
      renderDrawer();
      const body = await exportAndGetBody();
      expect(body).toMatchObject({
        date_from: "2026-10-01",
        date_to: "2026-10-31",
      });
    });

    it("tab Tuần: gửi thứ Hai - Chủ nhật của tuần hiện tại", async () => {
      renderDrawer();
      await selectTab("Tuần");
      const body = await exportAndGetBody();
      expect(body).toMatchObject({
        mode: "by-period",
        date_from: "2026-10-12",
        date_to: "2026-10-18",
      });
    });

    it("tab Quý: gửi cả quý hiện tại", async () => {
      renderDrawer();
      await selectTab("Quý");
      const body = await exportAndGetBody();
      expect(body).toMatchObject({
        date_from: "2026-10-01",
        date_to: "2026-12-31",
      });
    });

    it("tab Tùy chỉnh: dùng ngày nhập tay", async () => {
      renderDrawer();
      await selectTab("Tùy chỉnh");
      const [from, to] = screen.getAllByTestId("datepicker");
      fireEvent.change(from, { target: { value: "2026-09-05" } });
      fireEvent.change(to, { target: { value: "2026-09-20" } });
      const body = await exportAndGetBody();
      expect(body).toMatchObject({
        date_from: "2026-09-05",
        date_to: "2026-09-20",
      });
    });
  });
});
