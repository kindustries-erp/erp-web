import { describe, it, expect } from "vitest";
import {
  applyInvoiceSyncEvent,
  isInvoiceSyncKeepAlive,
  type InvoiceSyncEvent,
  type InvoiceSyncSnapshot,
} from "./invoiceSyncEvent";

const empty: InvoiceSyncSnapshot = { status: "idle", progress: 0, logs: [] };

function event(overrides: Partial<InvoiceSyncEvent> = {}): InvoiceSyncEvent {
  return {
    processId: "sync-progress",
    type: "sync",
    total: 10,
    current: 0,
    message: "Đang tải chi tiết & XML (0/10)...",
    completed: false,
    ...overrides,
  };
}

describe("isInvoiceSyncKeepAlive", () => {
  it("treats ping events and connection messages as noise", () => {
    expect(isInvoiceSyncKeepAlive(event({ processId: "ping" }))).toBe(true);
    expect(isInvoiceSyncKeepAlive(event({ message: "Connected" }))).toBe(true);
    expect(isInvoiceSyncKeepAlive(event({ message: "Ping" }))).toBe(true);
  });

  it("keeps real progress events", () => {
    expect(isInvoiceSyncKeepAlive(event())).toBe(false);
  });
});

describe("applyInvoiceSyncEvent", () => {
  it("ignores keep-alive events", () => {
    const state: InvoiceSyncSnapshot = {
      status: "running",
      progress: 30,
      logs: [{ at: 1, message: "A" }],
    };
    const next = applyInvoiceSyncEvent(
      state,
      event({ processId: "ping", message: "Ping" }),
      2,
    );
    expect(next).toBe(state);
  });

  it("marks the run as running and computes the percentage", () => {
    const next = applyInvoiceSyncEvent(
      empty,
      event({ current: 3, total: 10 }),
      5,
    );
    expect(next.status).toBe("running");
    expect(next.progress).toBe(30);
    expect(next.logs).toEqual([
      { at: 5, message: "Đang tải chi tiết & XML (0/10)...", level: "info" },
    ]);
  });

  it("keeps the previous progress when total is zero", () => {
    const state: InvoiceSyncSnapshot = {
      status: "running",
      progress: 40,
      logs: [],
    };
    const next = applyInvoiceSyncEvent(
      state,
      event({ total: 0, current: 0 }),
      1,
    );
    expect(next.progress).toBe(40);
  });

  it("caps the percentage at 100", () => {
    const next = applyInvoiceSyncEvent(
      empty,
      event({ current: 12, total: 10 }),
      1,
    );
    expect(next.progress).toBe(100);
  });

  it("marks the run as done with a success log when the stage completes", () => {
    const next = applyInvoiceSyncEvent(
      { status: "running", progress: 60, logs: [] },
      event({
        current: 10,
        total: 10,
        message: "Đã hoàn tất tải 10 hóa đơn!",
        completed: true,
      }),
      9,
    );
    expect(next.status).toBe("done");
    expect(next.progress).toBe(100);
    expect(next.logs[next.logs.length - 1]).toEqual({
      at: 9,
      message: "Đã hoàn tất tải 10 hóa đơn!",
      level: "success",
    });
  });

  it("does not log the same message twice in a row", () => {
    const first = applyInvoiceSyncEvent(empty, event({ current: 1 }), 1);
    const second = applyInvoiceSyncEvent(first, event({ current: 2 }), 2);
    expect(second.logs).toHaveLength(1);
    expect(second.progress).toBe(20);
  });

  it("shows the current invoice in the log line and keeps it while running", () => {
    const item = "HĐ 1847 · C26MSP · ABC";
    const next = applyInvoiceSyncEvent(
      empty,
      event({ current: 3, total: 10, currentItem: item }),
      1,
    );
    expect(next.currentItem).toBe(item);
    expect(next.logs[0].message).toBe(
      `Đang tải chi tiết & XML (0/10)... — ${item}`,
    );
  });

  it("collapses the before and after events of the same invoice into one line", () => {
    const item = "HĐ 1847 · C26MSP · ABC";
    const before = applyInvoiceSyncEvent(
      empty,
      event({ current: 3, total: 10, message: "(4/10)", currentItem: item }),
      1,
    );
    const after = applyInvoiceSyncEvent(
      before,
      event({ current: 4, total: 10, message: "(4/10)", currentItem: item }),
      2,
    );
    expect(after.logs).toHaveLength(1);
    expect(after.progress).toBe(40);
  });

  it("clears the current invoice when the stage completes", () => {
    const next = applyInvoiceSyncEvent(
      { status: "running", progress: 90, logs: [], currentItem: "HĐ 9" },
      event({ completed: true, message: "Xong" }),
      1,
    );
    expect(next.currentItem).toBeUndefined();
  });
});
