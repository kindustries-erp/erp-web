import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInvoiceSyncProgress } from "./useInvoiceSyncProgress";
import { useInvoiceSyncProgressStore } from "./useInvoiceSyncProgressStore";

type SseOptions = {
  onmessage: (ev: { data: string }) => void;
};

let currentToken: string | null = "token-1";
let capturedOptions: SseOptions | null = null;
const fetchEventSourceMock = vi.fn();

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: (...args: unknown[]) => fetchEventSourceMock(...args),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: currentToken }),
}));

vi.mock("@/core/api/axiosInstance", () => ({
  API_BASE_URL: "http://api.test",
}));

vi.mock("react-hot-toast", () => ({
  default: { loading: vi.fn(), success: vi.fn() },
}));

function emit(event: Record<string, unknown>) {
  capturedOptions?.onmessage({ data: JSON.stringify(event) });
}

describe("useInvoiceSyncProgress", () => {
  beforeEach(() => {
    currentToken = "token-1";
    capturedOptions = null;
    fetchEventSourceMock.mockReset();
    fetchEventSourceMock.mockImplementation(
      async (_url: string, opts: SseOptions) => {
        capturedOptions = opts;
      },
    );
    useInvoiceSyncProgressStore.setState({
      status: "idle",
      progress: 0,
      logs: [],
      currentItem: undefined,
      panelVisible: true,
    });
  });

  it("không mở SSE khi chưa có token", () => {
    currentToken = null;

    renderHook(() => useInvoiceSyncProgress());

    expect(fetchEventSourceMock).not.toHaveBeenCalled();
  });

  it("mở SSE tới endpoint tiến trình với token Bearer", () => {
    renderHook(() => useInvoiceSyncProgress());

    expect(fetchEventSourceMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/erp-invoices/portal/progress",
      expect.objectContaining({
        headers: { Authorization: "Bearer token-1" },
      }),
    );
  });

  it("áp dụng sự kiện tiến trình vào store", () => {
    renderHook(() => useInvoiceSyncProgress());

    emit({
      processId: "p1",
      total: 10,
      current: 5,
      message: "Đang lấy hóa đơn",
      completed: false,
    });

    const state = useInvoiceSyncProgressStore.getState();
    expect(state.progress).toBe(50);
    expect(state.status).toBe("running");
  });

  it("bỏ qua gói keep-alive", () => {
    renderHook(() => useInvoiceSyncProgress());
    const before = useInvoiceSyncProgressStore.getState().logs.length;

    emit({
      processId: "ping",
      total: 0,
      current: 0,
      message: "Ping",
      completed: false,
    });

    expect(useInvoiceSyncProgressStore.getState().logs).toHaveLength(before);
  });

  it("gọi onComplete khi sự kiện hoàn tất", () => {
    const onComplete = vi.fn();
    renderHook(() => useInvoiceSyncProgress(onComplete));

    emit({
      processId: "p1",
      total: 3,
      current: 3,
      message: "Hoàn tất",
      completed: true,
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(useInvoiceSyncProgressStore.getState().status).toBe("done");
  });
});
