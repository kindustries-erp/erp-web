import { describe, it, expect } from "vitest";
import {
  deriveSyncPanelStatus,
  reconcileSyncStatus,
  type VinfastSyncStatus,
} from "../hooks/vinfastSyncStatus";

const idle: VinfastSyncStatus = {
  running: false,
  startedAt: null,
  finishedAt: null,
  phase: null,
  current: 0,
  total: 0,
  message: null,
  lastError: null,
};

describe("reconcileSyncStatus", () => {
  it("attaches to a run started elsewhere and shows its progress", () => {
    const update = reconcileSyncStatus(
      {
        ...idle,
        running: true,
        startedAt: "t",
        current: 250,
        total: 1000,
        message: "Đang xử lý Sổ cái: 250/1000 dòng...",
      },
      false,
      undefined,
    );
    expect(update).toEqual({
      isSyncing: true,
      progress: 25,
      logMessage: "Đang xử lý Sổ cái: 250/1000 dòng...",
    });
  });

  it("does not repeat the same log message", () => {
    const update = reconcileSyncStatus(
      { ...idle, running: true, total: 10, current: 5, message: "same" },
      true,
      "same",
    );
    expect(update.logMessage).toBeUndefined();
  });

  it("finishes the drawer state when a run completes", () => {
    const update = reconcileSyncStatus(
      { ...idle, finishedAt: "t2" },
      true,
      undefined,
    );
    expect(update).toEqual({
      isSyncing: false,
      progress: 100,
      logMessage: "Hoàn tất đồng bộ.",
    });
  });

  it("reports the last error of a failed run", () => {
    const update = reconcileSyncStatus(
      { ...idle, finishedAt: "t2", lastError: "deadlock" },
      true,
      undefined,
    );
    expect(update.logMessage).toBe("Lỗi: deadlock");
  });

  it("leaves an idle drawer untouched", () => {
    expect(reconcileSyncStatus(idle, false, undefined)).toEqual({
      isSyncing: false,
    });
  });
});

describe("deriveSyncPanelStatus", () => {
  it("is running while a sync is in progress, whatever the last log says", () => {
    expect(deriveSyncPanelStatus(true, 0, "error")).toBe("running");
  });

  it("is error when the last line is an error", () => {
    expect(deriveSyncPanelStatus(false, 30, "error")).toBe("error");
  });

  it("is done at 100% without an error", () => {
    expect(deriveSyncPanelStatus(false, 100, "success")).toBe("done");
  });

  it("is idle before any run", () => {
    expect(deriveSyncPanelStatus(false, 0, undefined)).toBe("idle");
  });
});
