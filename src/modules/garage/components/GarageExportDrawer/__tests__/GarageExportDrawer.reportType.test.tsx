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
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
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
        defaultReportType="period-all"
        initialBranchId="CN-01"
        {...props}
      />
    </QueryClientProvider>,
  );
}

const chooseReportType = async (value: string) => {
  await act(async () => {
    fireEvent.change(screen.getByLabelText("Loại báo cáo"), {
      target: { value },
    });
  });
};

const exportAndGetCall = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("Xuất Excel"));
  });
  await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
  return (axiosInstance.post as any).mock.calls[0];
};

describe("GarageExportDrawer - Combobox loại báo cáo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 16));
    (axiosInstance.get as any).mockResolvedValue({ data: historyResponse });
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "job-2", message: "Đang chạy nền", reused: false },
    });
  });
  afterEach(() => vi.useRealTimers());

  it("loại báo cáo, kỳ và nút Xuất nằm trong một section duy nhất 'Điều kiện xuất dữ liệu'", () => {
    renderDrawer({ defaultReportType: "period-all" });
    expect(screen.getAllByText("Điều kiện xuất dữ liệu")).toHaveLength(1);
    expect(screen.queryByText("Kỳ báo cáo")).toBeNull();
    expect(screen.getByLabelText("Loại báo cáo")).toBeDefined();
    expect(screen.getByText("Theo kỳ")).toBeDefined();
    expect(screen.getByText("Xuất Excel")).toBeDefined();
  });

  it("có đủ 5 loại báo cáo và chọn sẵn theo defaultReportType", () => {
    renderDrawer({ defaultReportType: "period-business" });
    const select = screen.getByLabelText("Loại báo cáo") as HTMLSelectElement;
    expect(select.value).toBe("period-business");
    expect(Array.from(select.options).map((o) => o.value)).toEqual([
      "cases-list",
      "period-all",
      "period-business",
      "period-cashflow-debts",
      "period-overdue",
    ]);
  });

  it.each([
    ["period-all", "all"],
    ["period-business", "business"],
    ["period-cashflow-debts", "cashflow-debts"],
    ["period-overdue", "overdue"],
  ])("%s gửi reportType=%s tới endpoint báo cáo kỳ", async (type, apiType) => {
    renderDrawer({ defaultReportType: "cases-list" });
    await chooseReportType(type);
    const [url, body] = await exportAndGetCall();

    expect(url).toBe("/api/v1/greenway/dashboard/export/background");
    expect(body).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
      reportType: apiType,
    });
  });

  it("đổi sang Bảng kê phiếu dịch vụ thì gọi endpoint cases", async () => {
    renderDrawer({ defaultReportType: "period-all" });
    await chooseReportType("cases-list");
    const [url, body] = await exportAndGetCall();

    expect(url).toBe("/api/v1/greenway/cases/export/excel/background");
    expect(body).toMatchObject({ mode: "by-period" });
    expect(body.reportType).toBeUndefined();
  });

  it("mở từ tab nào cũng cùng payload khi chọn cùng loại và cùng kỳ", async () => {
    const first = renderDrawer({ defaultReportType: "cases-list" });
    await chooseReportType("period-business");
    const fromCases = await exportAndGetCall();
    first.unmount();

    vi.clearAllMocks();
    (axiosInstance.get as any).mockResolvedValue({ data: historyResponse });
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "job-3", message: "Đang chạy nền", reused: false },
    });

    renderDrawer({ defaultReportType: "period-all" });
    await chooseReportType("period-business");
    const fromOverview = await exportAndGetCall();

    expect(fromOverview).toEqual(fromCases);
  });

  it("mỗi lần mở lại chọn đúng loại mặc định của tab", async () => {
    const client = new QueryClient();
    const view = (open: boolean) => (
      <QueryClientProvider client={client}>
        <GarageExportDrawer
          open={open}
          onClose={vi.fn()}
          defaultReportType="period-all"
        />
      </QueryClientProvider>
    );
    const { rerender } = render(view(true));
    await chooseReportType("period-overdue");
    rerender(view(false));
    rerender(view(true));

    expect(
      (screen.getByLabelText("Loại báo cáo") as HTMLSelectElement).value,
    ).toBe("period-all");
  });
});
