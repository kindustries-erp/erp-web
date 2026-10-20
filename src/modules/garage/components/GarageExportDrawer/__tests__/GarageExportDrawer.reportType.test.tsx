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

const chooseReportTypes = async (values: string[]) => {
  await act(async () => {
    const el = screen.getByLabelText("Loại báo cáo") as HTMLSelectElement;
    Array.from(el.options).forEach((o) => {
      o.selected = values.includes(o.value);
    });
    fireEvent.change(el);
  });
};

const PERIOD_KEYS = [
  "period-overview",
  "period-pnl",
  "period-receivables",
  "period-payables",
  "period-overdue",
  "period-cashflow",
];
const PERIOD_SECTION_KEYS = [
  "overview",
  "pnl",
  "receivables",
  "payables",
  "overdue",
  "cashflow",
];

const exportAndGetCall = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText("Xuất Excel"));
  });
  await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
  return (axiosInstance.post as any).mock.calls[0];
};

describe("GarageExportDrawer - Combobox loại báo cáo (nhiều lựa chọn)", () => {
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

  it("có đủ 7 lựa chọn (bảng kê + 6 mục kỳ) và chọn sẵn 6 mục kỳ theo tab Tổng quan", () => {
    renderDrawer({ defaultReportType: "period-all" });
    const select = screen.getByLabelText("Loại báo cáo") as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual([
      "cases-list",
      ...PERIOD_KEYS,
    ]);
    expect(Array.from(select.selectedOptions).map((o) => o.value)).toEqual(
      PERIOD_KEYS,
    );
  });

  it("chọn sẵn đúng 'Bảng kê phiếu dịch vụ' theo tab Hoạt động", () => {
    renderDrawer({ defaultReportType: "cases-list" });
    const select = screen.getByLabelText("Loại báo cáo") as HTMLSelectElement;
    expect(Array.from(select.selectedOptions).map((o) => o.value)).toEqual([
      "cases-list",
    ]);
  });

  it("nhiều mục kỳ gửi reportSections tới endpoint báo cáo kỳ", async () => {
    renderDrawer({ defaultReportType: "period-all" });
    await chooseReportTypes(["period-pnl", "period-payables"]);
    const body = await exportAndGetCall().then((c: any[]) => c[1]);
    expect(body.reportSections).toEqual(["pnl", "payables"]);
    expect(body.reportType).toBeUndefined();
  });

  it("chọn bảng kê phiếu dịch vụ thì bỏ các mục kỳ và gọi endpoint cases", async () => {
    renderDrawer({ defaultReportType: "period-all" });
    await chooseReportTypes(["cases-list"]);
    expect(
      Array.from(
        (screen.getByLabelText("Loại báo cáo") as HTMLSelectElement)
          .selectedOptions,
      ).map((o) => o.value),
    ).toEqual(["cases-list"]);
    const call = await exportAndGetCall();
    expect(call[0]).toContain("/cases/export/excel/background");
  });

  it("không cho để trống lựa chọn: bỏ hết thì giữ lựa chọn cũ", async () => {
    renderDrawer({ defaultReportType: "period-overdue" });
    await chooseReportTypes([]);
    expect(
      Array.from(
        (screen.getByLabelText("Loại báo cáo") as HTMLSelectElement)
          .selectedOptions,
      ).map((o) => o.value),
    ).toEqual(["period-overdue"]);
  });

  it("mặc định tab Tổng quan gửi đủ 6 mục kỳ", async () => {
    renderDrawer({ defaultReportType: "period-all" });
    const body = await exportAndGetCall().then((c: any[]) => c[1]);
    expect(body.reportSections).toEqual(PERIOD_SECTION_KEYS);
  });

  it("mỗi lần mở lại chọn đúng loại mặc định của tab", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const drawer = (open: boolean) => (
      <QueryClientProvider client={client}>
        <GarageExportDrawer
          open={open}
          onClose={vi.fn()}
          defaultReportType="period-all"
          initialBranchId="CN-01"
        />
      </QueryClientProvider>
    );
    const { rerender } = render(drawer(true));
    await chooseReportTypes(["period-overdue"]);
    rerender(drawer(false));
    rerender(drawer(true));
    const select = screen.getByLabelText("Loại báo cáo") as HTMLSelectElement;
    expect(Array.from(select.selectedOptions).map((o) => o.value)).toEqual(
      PERIOD_KEYS,
    );
  });
});
