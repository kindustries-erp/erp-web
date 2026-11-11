import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ProcurementOrderHeaderSection } from "./ProcurementOrderHeaderSection";
import type { ProcurementOrderFormValue } from "../../../../form/procurementOrder.form";

vi.mock(
  "../../../molecules/procurement-pickers/ProcurementPickers",
  async () => {
    const React = await import("react");
    const stub = (text: string) => () => React.createElement("div", null, text);
    return {
      ProcurementBranchPicker: stub("branch-input"),
      ProcurementDateField: stub("date-field"),
      ProcurementRequestPicker: stub("request-input"),
      ProcurementSupplierPicker: stub("supplier-picker"),
    };
  },
);

vi.mock(
  "../../../molecules/procurement-pickers/ProcurementInvoicePicker",
  async () => {
    const React = await import("react");
    return {
      ProcurementInvoicePicker: (props: {
        onSelect: (i: { invoiceNo: string; sellerName: string }) => void;
        onSupplierResolved: (s: { id: string; name: string } | null) => void;
        onClear: () => void;
      }) =>
        React.createElement(
          "div",
          null,
          React.createElement(
            "button",
            {
              onClick: () =>
                props.onSelect({ invoiceNo: "HD-9", sellerName: "NCC Lốp" }),
            },
            "pick",
          ),
          React.createElement(
            "button",
            {
              onClick: () =>
                props.onSupplierResolved({ id: "s-9", name: "NCC Lốp Việt" }),
            },
            "resolve",
          ),
          React.createElement("button", { onClick: props.onClear }, "clear"),
        ),
    };
  },
);

const form: ProcurementOrderFormValue = {
  branchId: "",
  branchName: "",
  orderDate: "2026-11-05",
  expectedDate: "",
  supplierId: null,
  supplierName: "",
  remarks: "",
  supplierInvoiceNo: "",
  requestId: null,
  lines: [],
};

const renderSection = (
  setField = vi.fn(),
  over: Partial<ProcurementOrderFormValue> = {},
) => {
  render(
    <ProcurementOrderHeaderSection
      form={{ ...form, ...over }}
      errors={{}}
      viewing={false}
      branchLocked={false}
      branchOptional
      invoicePicker
      setField={setField}
    />,
  );
  return setField;
};

describe("ProcurementOrderHeaderSection — NCC phụ thuộc số hóa đơn", () => {
  beforeEach(() => {
    useAuthStore.setState({
      effectivePermissions: [{ collection: "invoices", actions: ["read"] }],
    } as never);
  });

  it("NCC là ô gõ tự do khi có quyền hóa đơn, không có ô chọn danh mục", () => {
    renderSection();
    expect(screen.queryByText("supplier-picker")).toBeNull();
    expect(
      screen.getByPlaceholderText("Nhập tên NCC hoặc chọn hóa đơn"),
    ).toBeDefined();
  });

  it("hiện tên NCC của đơn trong ô nhập", () => {
    renderSection(vi.fn(), { supplierName: "NCC Lốp Việt" });
    expect(screen.getByDisplayValue("NCC Lốp Việt")).toBeDefined();
  });

  it("gõ NCC khác thì xóa số hóa đơn và mã NCC cũ", async () => {
    const setField = renderSection(vi.fn(), {
      supplierInvoiceNo: "HD-9",
      supplierId: "s-9",
      supplierName: "NCC A",
    });
    await userEvent.type(screen.getByDisplayValue("NCC A"), "x");
    expect(setField).toHaveBeenCalledWith("supplierId", null);
    expect(setField).toHaveBeenCalledWith("supplierInvoiceNo", "");
  });

  it("chọn hóa đơn: đặt số hóa đơn, xóa mã NCC cũ và hiện tên người bán", async () => {
    const setField = renderSection();
    await userEvent.click(screen.getByText("pick"));
    expect(setField).toHaveBeenCalledWith("supplierInvoiceNo", "HD-9");
    expect(setField).toHaveBeenCalledWith("supplierId", null);
    expect(setField).toHaveBeenCalledWith("supplierName", "NCC Lốp");
  });

  it("tra được NCC trong danh mục thì gán mã và tên NCC", async () => {
    const setField = renderSection();
    await userEvent.click(screen.getByText("resolve"));
    expect(setField).toHaveBeenCalledWith("supplierId", "s-9");
    expect(setField).toHaveBeenCalledWith("supplierName", "NCC Lốp Việt");
  });

  it("bỏ chọn hóa đơn chỉ xóa số hóa đơn, giữ NCC", async () => {
    const setField = renderSection(vi.fn(), {
      supplierInvoiceNo: "HD-9",
      supplierId: "s-9",
      supplierName: "NCC Lốp Việt",
    });
    await userEvent.click(screen.getByText("clear"));
    expect(setField).toHaveBeenCalledWith("supplierInvoiceNo", "");
    expect(setField).not.toHaveBeenCalledWith("supplierId", null);
    expect(setField).not.toHaveBeenCalledWith("supplierName", "");
  });

  it("thiếu quyền đọc hóa đơn: lùi về ô chọn NCC như cũ", () => {
    useAuthStore.setState({ effectivePermissions: [] } as never);
    renderSection();
    expect(screen.getByText("supplier-picker")).toBeDefined();
  });
});
