import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchEventSource, showToast } = vi.hoisted(() => ({
  fetchEventSource: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@microsoft/fetch-event-source", () => ({ fetchEventSource }));
vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (sel: (s: { accessToken: string }) => unknown) =>
    sel({ accessToken: "tok" }),
}));
vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  V2_API_BASE_URL: "http://test",
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => {
  const t = (_k: string, fb: string) => fb;
  return { useV2Translation: () => ({ t }) };
});
vi.mock("@/v2/shared/stores/useV2ToastStore", () => ({
  useV2ToastStore: { getState: () => ({ showToast }) },
}));

import { createExportProgressStore } from "../stores/createExportProgressStore";
import { useExportJobProgress } from "./useExportJobProgress";

const useStore = createExportProgressStore();
const downloadFile = vi.fn();
const config = {
  streamPath: "/stream",
  processId: "p1",
  useStore,
  downloadFile,
  defaultFileName: "default.xlsx",
  logLabel: "test",
  text: {
    failed: { key: "k.failed", fallback: "Thất bại" },
    ready: { key: "k.ready", fallback: "Sẵn sàng" },
    noJob: { key: "k.nojob", fallback: "Không có job" },
  },
};

const noReady = { ...config, text: { ...config.text, ready: undefined } };

const emit = async (data: unknown) => {
  const opts = fetchEventSource.mock.calls[0][1];
  await act(async () => opts.onmessage({ data: JSON.stringify(data) }));
};

describe("useExportJobProgress", () => {
  beforeEach(() => {
    fetchEventSource.mockReset().mockReturnValue(new Promise(() => {}));
    showToast.mockReset();
    downloadFile.mockReset();
    useStore.getState().resetProgress();
  });

  it("connects with the bearer token to the stream path", async () => {
    renderHook(() => useExportJobProgress(config));
    await waitFor(() => expect(fetchEventSource).toHaveBeenCalled());
    expect(fetchEventSource.mock.calls[0][0]).toBe("http://test/stream");
    expect(fetchEventSource.mock.calls[0][1].headers).toEqual({
      Authorization: "Bearer tok",
    });
  });

  it("updates the store for its processId and ignores other processes", async () => {
    renderHook(() => useExportJobProgress(config));
    await waitFor(() => expect(fetchEventSource).toHaveBeenCalled());

    await emit({
      processId: "other",
      jobId: "x",
      current: 1,
      total: 2,
      isRunning: true,
      completed: false,
      ready: false,
      failed: false,
    });
    expect(useStore.getState().jobId).toBeNull();

    await emit({
      processId: "p1",
      jobId: "j1",
      current: 40,
      total: 100,
      isRunning: true,
      completed: false,
      ready: false,
      failed: false,
    });
    expect(useStore.getState()).toMatchObject({ jobId: "j1", current: 40 });
  });

  it("toasts success only when a ready text is configured", async () => {
    renderHook(() => useExportJobProgress(config));
    await waitFor(() => expect(fetchEventSource).toHaveBeenCalled());
    await emit({
      processId: "p1",
      jobId: "j1",
      current: 100,
      total: 100,
      isRunning: false,
      completed: true,
      ready: true,
      failed: false,
    });
    expect(showToast).toHaveBeenCalledWith({
      title: "Sẵn sàng",
      variant: "success",
    });
  });

  it("does not toast ready without a ready text", async () => {
    renderHook(() => useExportJobProgress(noReady));
    await waitFor(() => expect(fetchEventSource).toHaveBeenCalled());
    await emit({
      processId: "p1",
      current: 100,
      total: 100,
      isRunning: false,
      completed: true,
      ready: true,
      failed: false,
    });
    expect(showToast).not.toHaveBeenCalled();
  });

  it("toasts the server message on failure", async () => {
    renderHook(() => useExportJobProgress(config));
    await waitFor(() => expect(fetchEventSource).toHaveBeenCalled());
    await emit({
      processId: "p1",
      current: 0,
      total: 100,
      isRunning: false,
      completed: false,
      ready: false,
      failed: true,
      message: "Lỗi server",
    });
    expect(showToast).toHaveBeenCalledWith({
      title: "Lỗi server",
      variant: "destructive",
    });
  });

  it("ping only refreshes the heartbeat", async () => {
    renderHook(() => useExportJobProgress(config));
    await waitFor(() => expect(fetchEventSource).toHaveBeenCalled());
    await emit({ processId: "ping" });
    expect(useStore.getState().sseConnected).toBe(true);
    expect(useStore.getState().jobId).toBeNull();
  });

  it("downloadReadyFile throws when there is no job", async () => {
    const { result } = renderHook(() => useExportJobProgress(config));
    await expect(result.current.downloadReadyFile()).rejects.toThrow(
      "Không có job",
    );
  });

  it("downloadReadyFile downloads the given job", async () => {
    downloadFile.mockResolvedValue(new Blob(["x"]));
    window.URL.createObjectURL = vi.fn(() => "blob:t");
    window.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const { result } = renderHook(() => useExportJobProgress(config));
    await result.current.downloadReadyFile("j9", "a.xlsx");
    expect(downloadFile).toHaveBeenCalledWith("j9");
  });
});
