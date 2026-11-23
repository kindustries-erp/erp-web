import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProcurementOrderHeaderSection } from "./ProcurementOrderHeaderSection";
import type { ProcurementOrderFormValue } from "../../../../form/procurementOrder.form";

vi.mock(
  "../../../molecules/procurement-pickers/ProcurementPickers",
  async () => {
    const React = await import("react");
    return {
      ProcurementBranchPicker: () =>
        React.createElement("div", null, "branch-input"),
      ProcurementDateField: () =>
        React.createElement("div", null, "date-field"),
      ProcurementRequestPicker: () =>
        React.createElement("div", null, "request-input"),
      ProcurementSupplierPicker: () =>
        React.createElement("div", null, "supplier-input"),
    };
  },
);

const form: ProcurementOrderFormValue = {
  branchId: "b-1",
  branchName: "Chi nhánh Quận 1",
  orderDate: "2026-11-05",
  expectedDate: "2026-11-10",
  supplierId: "s-1",
  supplierName: "NCC Lốp Việt",
  remarks: "Giao buổi sáng",
  supplierInvoiceNo: "HD-001",
  requestId: null,
  lines: [],
};

/** Đứng trước `after` trong DOM: kiểm tra thứ tự nhãn field */
function expectBefore(before: string, after: string) {
  const a = screen.getByText(before, { exact: true });
  const b = screen.getByText(after, { exact: true });
  expect(
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
}

describe("ProcurementOrderHeaderSection — thứ tự đơn Garage", () => {
  it("chế độ sửa: ngày → hóa đơn → NCC → chi nhánh → ghi chú", () => {
    render(
      <ProcurementOrderHeaderSection
        form={form}
        errors={{}}
        viewing={false}
        branchLocked={false}
        branchOptional
        setField={vi.fn()}
      />,
    );
    expectBefore("Ngày đơn", "Số hóa đơn NCC");
    expectBefore("Số hóa đơn NCC", "Nhà cung cấp");
    expectBefore("Nhà cung cấp", "Chi nhánh");
    expectBefore("Chi nhánh", "Ghi chú");
  });

  it("chế độ xem: ngày → hóa đơn → NCC → chi nhánh → ghi chú", () => {
    render(
      <ProcurementOrderHeaderSection
        form={form}
        errors={{}}
        viewing
        branchLocked
        branchOptional
        setField={vi.fn()}
      />,
    );
    expectBefore("Ngày đơn", "Số hóa đơn NCC");
    expectBefore("Số hóa đơn NCC", "Nhà cung cấp");
    expectBefore("Nhà cung cấp", "Chi nhánh");
    expectBefore("Chi nhánh", "Ghi chú");
  });
});
