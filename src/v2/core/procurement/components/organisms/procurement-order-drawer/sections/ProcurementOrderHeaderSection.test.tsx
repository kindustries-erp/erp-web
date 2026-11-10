import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProcurementOrderHeaderSection } from "./ProcurementOrderHeaderSection";
import type { ProcurementOrderFormValue } from "../../../../form/procurementOrder.form";

vi.mock(
  "../../../molecules/procurement-pickers/ProcurementPickers",
  async () => {
    const React = await import("react");
    return {
      ProcurementBranchPicker: ({ label }: { label: string }) =>
        React.createElement("div", null, `branch:${label}`),
      ProcurementDateField: () =>
        React.createElement("div", null, "date-field"),
      ProcurementSupplierPicker: ({ label }: { label: string }) =>
        React.createElement("div", null, `supplier:${label}`),
    };
  },
);

const baseForm: ProcurementOrderFormValue = {
  branchId: "b-1",
  branchName: "Chi nhánh Quận 1",
  orderDate: "2026-11-05",
  expectedDate: "",
  supplierId: "s-1",
  supplierName: "NCC Lốp Việt",
  remarks: "Giao buổi sáng",
  supplierInvoiceNo: "HD-001",
  requestId: null,
  lines: [],
};

describe("ProcurementOrderHeaderSection", () => {
  it("chế độ xem hiển thị số hóa đơn NCC và ghi chú dạng đọc", () => {
    render(
      <ProcurementOrderHeaderSection
        form={baseForm}
        errors={{}}
        viewing
        branchLocked
        setField={vi.fn()}
      />,
    );
    expect(screen.getByText("HD-001")).toBeDefined();
    expect(screen.getByText("Giao buổi sáng")).toBeDefined();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("hiển thị lỗi bắt buộc khi thiếu ngày đơn", () => {
    render(
      <ProcurementOrderHeaderSection
        form={baseForm}
        errors={{ orderDate: true }}
        viewing={false}
        branchLocked={false}
        setField={vi.fn()}
      />,
    );
    expect(screen.getByText("Trường này bắt buộc")).toBeDefined();
  });

  it("sửa số hóa đơn NCC khi đang sửa gọi setField đúng khóa", async () => {
    const setField = vi.fn();
    render(
      <ProcurementOrderHeaderSection
        form={{ ...baseForm, supplierInvoiceNo: "" }}
        errors={{}}
        viewing={false}
        branchLocked={false}
        setField={setField}
      />,
    );
    const invoiceInput = screen.getAllByRole("textbox")[0];
    await userEvent.type(invoiceInput, "9");
    expect(setField).toHaveBeenCalledWith("supplierInvoiceNo", "9");
  });

  const labelsInOrder = (labels: string[]) =>
    labels.every((label, i) =>
      i === 0
        ? true
        : Boolean(
            screen
              .getByText(labels[i - 1])
              .compareDocumentPosition(screen.getByText(label)) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ),
    );

  it("Garage: ngày đơn, ngày dự kiến nhận rồi chi nhánh", () => {
    render(
      <ProcurementOrderHeaderSection
        form={{ ...baseForm, requestId: null }}
        errors={{}}
        viewing={false}
        branchLocked={false}
        branchOptional
        setField={vi.fn()}
      />,
    );
    expect(
      labelsInOrder([
        "Ngày đơn",
        "Ngày dự kiến nhận",
        "Chi nhánh",
        "Nhà cung cấp",
      ]),
    ).toBe(true);
  });

  it("luồng thường (ERP): chi nhánh vẫn đứng đầu", () => {
    render(
      <ProcurementOrderHeaderSection
        form={{ ...baseForm, requestId: null }}
        errors={{}}
        viewing={false}
        branchLocked={false}
        setField={vi.fn()}
      />,
    );
    expect(labelsInOrder(["Chi nhánh", "Ngày đơn", "Ngày dự kiến nhận"])).toBe(
      true,
    );
  });

  it("chế độ xem Garage: chi nhánh đứng sau ngày dự kiến nhận", () => {
    render(
      <ProcurementOrderHeaderSection
        form={{ ...baseForm, requestId: null }}
        errors={{}}
        viewing
        branchLocked
        branchOptional
        setField={vi.fn()}
      />,
    );
    expect(labelsInOrder(["Ngày dự kiến nhận", "Chi nhánh"])).toBe(true);
  });
});
