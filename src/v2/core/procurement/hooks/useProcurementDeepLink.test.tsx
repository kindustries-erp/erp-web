import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProcurementDeepLink } from "./useProcurementDeepLink";

let currentSearch = "";
const updateParams = vi.fn();
const showError = vi.fn();

vi.mock("@/v2/shared/hooks/useV2SearchParams", () => ({
  useV2SearchParams: () => new URLSearchParams(currentSearch),
}));
vi.mock("@/v2/shared/utils/v2Url", () => ({
  updateV2SearchParams: (...args: unknown[]) => updateParams(...args),
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
vi.mock("../procurement.toast", () => ({
  showProcurementError: (...args: unknown[]) => showError(...args),
}));

const ME = "me-1";
const OTHER = "other-1";

function setup(opts: {
  search: string;
  row?: Record<string, unknown>;
  fail?: boolean;
}) {
  currentSearch = opts.search;
  const get = vi.fn(async () => {
    if (opts.fail) throw new Error("404");
    return opts.row;
  });
  const config = { queryKey: "garage-pr", api: { get } } as never;
  const state = {
    start: vi.fn(),
    openView: vi.fn(),
    approval: {
      gate: { configured: true, enabled: true, currentUserId: ME },
    },
  } as never;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useProcurementDeepLink(config, state), {
    wrapper,
  });
  return {
    state: state as unknown as Record<string, ReturnType<typeof vi.fn>>,
    hook,
  };
}

const pending = (approverId: string | null) => ({
  id: "req-1",
  status: "PENDING_APPROVAL",
  createdBy: "creator-1",
  approval: { approverId },
});

describe("useProcurementDeepLink", () => {
  beforeEach(() => {
    updateParams.mockClear();
    showError.mockClear();
  });

  it("người duyệt được chỉ định + phiếu chờ duyệt: mở modal duyệt, xóa tham số URL", async () => {
    const { state } = setup({
      search: "tab=requests&open=req-1&action=APPROVE",
      row: pending(ME),
    });

    await waitFor(() => expect(state.start).toHaveBeenCalledTimes(1));
    expect(state.start.mock.calls[0][1]).toBe("approve");
    expect(state.openView).not.toHaveBeenCalled();
    expect(updateParams).toHaveBeenCalled();
  });

  it("người tạo phiếu (createdBy = mình) không được mở modal duyệt dù là người duyệt", async () => {
    const { state } = setup({
      search: "open=req-1&action=APPROVE",
      row: { ...pending(ME), createdBy: ME },
    });

    await waitFor(() => expect(state.openView).toHaveBeenCalledWith("req-1"));
    expect(state.start).not.toHaveBeenCalled();
  });

  it("người khác được chỉ định: chỉ mở drawer xem, không mở modal duyệt", async () => {
    const { state } = setup({
      search: "open=req-1&action=APPROVE",
      row: pending(OTHER),
    });

    await waitFor(() => expect(state.openView).toHaveBeenCalledWith("req-1"));
    expect(state.start).not.toHaveBeenCalled();
  });

  it("không có action (thông báo duyệt/từ chối): mở drawer xem", async () => {
    const { state } = setup({
      search: "open=req-1",
      row: { ...pending(ME), status: "APPROVED" },
    });

    await waitFor(() => expect(state.openView).toHaveBeenCalledWith("req-1"));
    expect(state.start).not.toHaveBeenCalled();
  });

  it("không tải được phiếu (404/403): báo lỗi, không mở gì, xóa tham số", async () => {
    const { state } = setup({
      search: "open=req-9&action=APPROVE",
      fail: true,
    });

    await waitFor(() => expect(showError).toHaveBeenCalledTimes(1));
    expect(state.start).not.toHaveBeenCalled();
    expect(state.openView).not.toHaveBeenCalled();
    expect(updateParams).toHaveBeenCalled();
  });

  it("không có ?open thì không làm gì", () => {
    const { state } = setup({ search: "tab=requests" });

    expect(state.start).not.toHaveBeenCalled();
    expect(state.openView).not.toHaveBeenCalled();
    expect(updateParams).not.toHaveBeenCalled();
  });
});
