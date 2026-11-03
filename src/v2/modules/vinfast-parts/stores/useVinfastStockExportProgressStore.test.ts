import { beforeEach, describe, expect, it } from "vitest";
import { useVinfastStockExportProgressStore } from "./useVinfastStockExportProgressStore";

describe("useVinfastStockExportProgressStore", () => {
  beforeEach(() => {
    useVinfastStockExportProgressStore.setState({
      jobId: null,
      current: 0,
      total: 0,
      isRunning: false,
      completed: false,
      ready: false,
      failed: false,
      message: null,
      fileName: null,
      lastEventAt: null,
      sseConnected: false,
    });
  });

  it("merges progress and stamps the event time", () => {
    useVinfastStockExportProgressStore.getState().updateProgress({
      jobId: "job-1",
      current: 3,
      total: 10,
      isRunning: true,
    });

    const state = useVinfastStockExportProgressStore.getState();
    expect(state.jobId).toBe("job-1");
    expect(state.current).toBe(3);
    expect(state.lastEventAt).not.toBeNull();
  });

  it("resets job progress but keeps the SSE connection flag", () => {
    const store = useVinfastStockExportProgressStore.getState();
    store.setSseConnected(true);
    store.updateProgress({ jobId: "job-1", ready: true });

    store.resetProgress();

    const state = useVinfastStockExportProgressStore.getState();
    expect(state.jobId).toBeNull();
    expect(state.ready).toBe(false);
    expect(state.sseConnected).toBe(true);
  });
});
