import { describe, it, expect, beforeEach } from "vitest";
import { useInvoiceSyncProgressStore } from "./useInvoiceSyncProgressStore";

describe("useInvoiceSyncProgressStore", () => {
  beforeEach(() => {
    useInvoiceSyncProgressStore.setState({
      status: "idle",
      progress: 0,
      logs: [],
      currentItem: undefined,
      panelVisible: false,
    });
  });

  it("start đặt lại tiến trình và ghi dòng đầu tiên", () => {
    useInvoiceSyncProgressStore.setState({ progress: 80, status: "done" });

    useInvoiceSyncProgressStore.getState().start("Bắt đầu");

    const state = useInvoiceSyncProgressStore.getState();
    expect(state.status).toBe("running");
    expect(state.progress).toBe(0);
    expect(state.logs.map((l) => l.message)).toEqual(["Bắt đầu"]);
  });

  it("addLog nối thêm dòng kèm mức độ", () => {
    const { start, addLog } = useInvoiceSyncProgressStore.getState();
    start("Bắt đầu");

    addLog("Đã lấy 3 hóa đơn", "success");

    const logs = useInvoiceSyncProgressStore.getState().logs;
    expect(logs).toHaveLength(2);
    expect(logs[1]).toMatchObject({
      message: "Đã lấy 3 hóa đơn",
      level: "success",
    });
  });

  it("fail chuyển trạng thái sang error và ghi lỗi vào nhật ký", () => {
    useInvoiceSyncProgressStore.getState().start("Bắt đầu");

    useInvoiceSyncProgressStore.getState().fail("Token hết hạn");

    const state = useInvoiceSyncProgressStore.getState();
    expect(state.status).toBe("error");
    expect(state.logs[state.logs.length - 1]).toMatchObject({
      message: "Token hết hạn",
      level: "error",
    });
  });

  it("setPanelVisible bật và tắt panel", () => {
    useInvoiceSyncProgressStore.getState().setPanelVisible(true);
    expect(useInvoiceSyncProgressStore.getState().panelVisible).toBe(true);

    useInvoiceSyncProgressStore.getState().setPanelVisible(false);
    expect(useInvoiceSyncProgressStore.getState().panelVisible).toBe(false);
  });
});
