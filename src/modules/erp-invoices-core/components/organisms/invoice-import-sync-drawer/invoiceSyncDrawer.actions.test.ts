import { describe, it, expect, vi } from "vitest";
import { buildInvoiceSyncActions } from "./invoiceSyncDrawer.actions";

const labels = {
  close: "Đóng",
  cancel: "Hủy",
  preview: "Xem trước",
  importMore: "Import thêm",
  viewCreated: "Xem hóa đơn vừa tạo",
  bulkXml: "Tải lại XML",
  bulkXmlLoading: "Đang xử lý...",
};

const idleBulkXml = { loading: false, disabled: false };

function handlers() {
  return {
    onClose: vi.fn(),
    onCancel: vi.fn(),
    onPreview: vi.fn(),
    onImportMore: vi.fn(),
    onBulkXml: vi.fn(),
  };
}

describe("buildInvoiceSyncActions", () => {
  it("GDT: tải lại XML căn trái ở footer, trước nút Đóng", () => {
    const actions = buildInvoiceSyncActions({
      method: "GDT",
      xmlStep: "select",
      fileCount: 0,
      createdCount: null,
      bulkXml: idleBulkXml,
      labels,
      handlers: handlers(),
    });
    expect(actions.map((a) => a.label)).toEqual(["Tải lại XML", "Đóng"]);
    expect(actions[0].align).toBe("left");
  });

  it("GDT: nút tải lại XML hiện trạng thái đang xử lý và bị khóa", () => {
    const actions = buildInvoiceSyncActions({
      method: "GDT",
      xmlStep: "select",
      fileCount: 0,
      createdCount: null,
      bulkXml: { loading: true, disabled: true },
      labels,
      handlers: handlers(),
    });
    expect(actions[0].label).toBe("Đang xử lý...");
    expect(actions[0].loading).toBe(true);
    expect(actions[0].disabled).toBe(true);
  });

  it("GDT: bấm tải lại XML gọi đúng handler", () => {
    const h = handlers();
    const actions = buildInvoiceSyncActions({
      method: "GDT",
      xmlStep: "select",
      fileCount: 0,
      createdCount: null,
      bulkXml: idleBulkXml,
      labels,
      handlers: h,
    });
    actions[0].onClick?.();
    expect(h.onBulkXml).toHaveBeenCalledTimes(1);
  });

  it("disables preview until a file is selected", () => {
    const actions = buildInvoiceSyncActions({
      method: "XML",
      xmlStep: "select",
      fileCount: 0,
      createdCount: null,
      bulkXml: idleBulkXml,
      labels,
      handlers: handlers(),
    });
    expect(actions[1].disabled).toBe(true);
  });

  it("shows view-created only when invoices were created", () => {
    const base = {
      method: "XML" as const,
      xmlStep: "result" as const,
      fileCount: 2,
      bulkXml: idleBulkXml,
      labels,
      handlers: handlers(),
    };
    const withCreated = buildInvoiceSyncActions({ ...base, createdCount: 3 });
    const none = buildInvoiceSyncActions({ ...base, createdCount: 0 });
    expect(withCreated.map((a) => a.label)).toEqual([
      "Import thêm",
      "Xem hóa đơn vừa tạo",
      "Đóng",
    ]);
    expect(none.map((a) => a.label)).toEqual(["Import thêm", "Đóng"]);
  });

  it("has no actions while importing", () => {
    const actions = buildInvoiceSyncActions({
      method: "XML",
      xmlStep: "importing",
      fileCount: 2,
      createdCount: null,
      bulkXml: idleBulkXml,
      labels,
      handlers: handlers(),
    });
    expect(actions).toEqual([]);
  });
});
