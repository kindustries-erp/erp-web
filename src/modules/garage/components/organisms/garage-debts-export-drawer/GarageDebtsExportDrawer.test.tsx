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

import axiosInstance from "@/core/api/axiosInstance";
import { GarageDebtsExportDrawer } from "./GarageDebtsExportDrawer";

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

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ title, leftPanel, rightPanel }: any) => (
    <div>
      <h1>{title}</h1>
      {leftPanel}
      {rightPanel}
    </div>
  ),
}));

vi.mock("@/shared/components/StandardTable", () => ({
  StandardTable: (props: any) => (
    <div data-testid="history-table">{props.tableId}</div>
  ),
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, options }: any) => (
    <select value={value} onChange={(e) => onChange?.(e.target.value)}>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange }: any) => (
    <input
      data-testid="datepicker"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

const emptyHistory = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const context = {
  kind: "suppliers" as const,
  filterCount: 2,
  query: {
    from: "2026-07-01",
    q: "abc",
    sorts: ["-balanceAmount"],
    column_filters: '{"customer":["NCC1"]}',
  },
};

function renderDrawer(
  props: Partial<React.ComponentProps<typeof GarageDebtsExportDrawer>> = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GarageDebtsExportDrawer
        open={true}
        onClose={vi.fn()}
        branchId="CN-01"
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("GarageDebtsExportDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as any).mockResolvedValue({ data: emptyHistory });
    (axiosInstance.post as any).mockResolvedValue({
      data: { jobId: "job-1", message: "Đang chạy nền", reused: false },
    });
  });

  it("hiển thị tiêu đề, đối tượng báo cáo và lịch sử của khách hàng theo mặc định", async () => {
    renderDrawer();

    expect(screen.getByText("Xuất Excel công nợ garage")).toBeDefined();
    expect(screen.getByText("Khách hàng (phải thu)")).toBeDefined();
    expect(screen.getByText("Nhà cung cấp (phải trả)")).toBeDefined();
    expect(screen.queryByText("Theo filter hiện tại")).toBeNull();
    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/api/v1/greenway/cases/customers-debt/export/background/history",
        { params: { page: 1, pageSize: 10 } },
      ),
    );
  });

  it("xuất công nợ khách hàng theo kỳ (mốc 2026-07-01) kèm header chi nhánh", async () => {
    renderDrawer();

    await act(async () => {
      fireEvent.click(screen.getByText("Xuất Excel"));
    });

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
    const [url, body, config] = (axiosInstance.post as any).mock.calls[0];
    expect(url).toBe("/api/v1/greenway/cases/customers-debt/export/background");
    expect(body.mode).toBe("by-period");
    expect(body.from).toBe("2026-07-01");
    expect(body.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(config.headers).toEqual({ "x-greenway-branch-id": "CN-01" });
  });

  it("mở từ bảng NCC: mặc định theo filter hiện tại và gọi endpoint NCC", async () => {
    renderDrawer({ context });

    expect(screen.getByTestId("garage-export-filter-preview")).toBeDefined();
    await act(async () => {
      fireEvent.click(screen.getByText("Xuất Excel"));
    });

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
    const [url, body] = (axiosInstance.post as any).mock.calls[0];
    expect(url).toBe(
      "/api/v1/greenway/payables/suppliers-debt/export/background",
    );
    expect(body).toEqual({ mode: "by-current-filter", ...context.query });
  });

  it("đổi sang đối tượng khác thì bỏ chế độ theo filter (filter thuộc bảng khác)", async () => {
    renderDrawer({ context });

    fireEvent.click(screen.getByText("Khách hàng (phải thu)"));

    await waitFor(() =>
      expect(screen.queryByTestId("garage-export-filter-preview")).toBeNull(),
    );
    expect(screen.queryByText("Theo filter hiện tại")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByText("Xuất Excel"));
    });
    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
    const [url, body] = (axiosInstance.post as any).mock.calls[0];
    expect(url).toContain("/cases/customers-debt/export/background");
    expect(body.mode).toBe("by-period");
  });

  describe("chọn kỳ", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 9, 16));
    });
    afterEach(() => vi.useRealTimers());

    const selectTab = async (name: string) => {
      await act(async () => {
        fireEvent.mouseDown(screen.getByRole("tab", { name }));
        fireEvent.click(screen.getByRole("tab", { name }));
      });
    };

    const exportAndGetBody = async () => {
      await act(async () => {
        fireEvent.click(screen.getByText("Xuất Excel"));
      });
      await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledTimes(1));
      return (axiosInstance.post as any).mock.calls[0][1];
    };

    it("mặc định Tùy chỉnh từ mốc 2026-07-01 đến hôm nay", async () => {
      renderDrawer();
      const body = await exportAndGetBody();
      expect(body).toEqual({
        mode: "by-period",
        from: "2026-07-01",
        to: "2026-10-16",
      });
    });

    it("tab Tuần / Tháng / Quý gửi đúng khoảng ngày", async () => {
      renderDrawer();
      await selectTab("Tuần");
      expect(await exportAndGetBody()).toMatchObject({
        from: "2026-10-12",
        to: "2026-10-18",
      });
    });

    it("tab Quý gửi cả quý hiện tại", async () => {
      renderDrawer();
      await selectTab("Quý");
      expect(await exportAndGetBody()).toMatchObject({
        from: "2026-10-01",
        to: "2026-12-31",
      });
    });

    it("tab Tháng gửi cả tháng hiện tại", async () => {
      renderDrawer();
      await selectTab("Tháng");
      expect(await exportAndGetBody()).toMatchObject({
        from: "2026-10-01",
        to: "2026-10-31",
      });
    });
  });
});
