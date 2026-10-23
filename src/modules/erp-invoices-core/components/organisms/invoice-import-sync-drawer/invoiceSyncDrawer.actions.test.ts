import { describe, it, expect, vi } from "vitest";
import { buildInvoiceSyncActions } from "./invoiceSyncDrawer.actions";

const labels = {
  close: "Đóng",
  cancel: "Hủy",
  preview: "Xem trước",
  importMore: "Import thêm",
  viewCreated: "Xem hóa đơn vừa tạo",
};

function handlers() {
  return {
    onClose: vi.fn(),
    onCancel: vi.fn(),
    onPreview: vi.fn(),
    onImportMore: vi.fn(),
  };
}

describe("buildInvoiceSyncActions", () => {
  it("offers only close for the GDT method", () => {
    const actions = buildInvoiceSyncActions({
      method: "GDT",
      xmlStep: "select",
      fileCount: 0,
      createdCount: null,
      labels,
      handlers: handlers(),
    });
    expect(actions.map((a) => a.label)).toEqual(["Đóng"]);
  });

  it("disables preview until a file is selected", () => {
    const actions = buildInvoiceSyncActions({
      method: "XML",
      xmlStep: "select",
      fileCount: 0,
      createdCount: null,
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
      labels,
      handlers: handlers(),
    });
    expect(actions).toEqual([]);
  });
});
