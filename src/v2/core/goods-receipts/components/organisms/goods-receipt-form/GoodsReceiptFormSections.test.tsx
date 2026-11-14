import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { emptyGoodsReceiptForm } from "@/v2/core/goods-receipts";
import { GoodsReceiptFormSections } from "./GoodsReceiptFormSections";

// Ô chi nhánh dùng react-query (danh sách chi nhánh), nên cần provider
const sourceOrder = {
  load: vi.fn(),
  search: vi.fn().mockResolvedValue([]),
};

const renderSections = (
  viewing: boolean,
  setField = vi.fn(),
  withOrder = false,
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <GoodsReceiptFormSections
        form={{
          ...emptyGoodsReceiptForm(),
          receiptNo: "Mẫu",
          receiptDate: "Mẫu",
        }}
        viewing={viewing}
        codeEditable
        onRegenerateCode={vi.fn()}
        errorField={null}
        errorMessage=""
        t={(_key, fallback) => fallback ?? ""}
        setField={setField}
        sourceOrder={withOrder ? sourceOrder : undefined}
      />
    </QueryClientProvider>,
  );

describe("GoodsReceiptFormSections", () => {
  it("renders read-only values in view mode without inputs", () => {
    renderSections(true);
    expect(screen.getAllByText("Mẫu").length).toBeGreaterThan(0);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders editable fields in edit mode", () => {
    renderSections(false);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  it("allows adding a line item and updates lines", () => {
    const setField = vi.fn();
    renderSections(false, setField);
    const addButton = screen.getByRole("button", { name: /Thêm phụ tùng/i });
    fireEvent.click(addButton);
    expect(setField).toHaveBeenCalledWith("lines", expect.any(Array));
  });

  it("phiếu gắn đơn mua: có ô Đơn mua, NCC chỉ đọc, không còn ô trạng thái", () => {
    renderSections(false, vi.fn(), true);
    expect(screen.getByText("Đơn mua")).toBeInTheDocument();
    expect(screen.getByText("Tổng tiền đơn mua")).toBeInTheDocument();
    expect(screen.getByText("Tự điền theo đơn mua")).toBeInTheDocument();
    expect(screen.queryByText("Trạng thái")).not.toBeInTheDocument();
  });

  it("phiếu không gắn đơn mua: không có ô Đơn mua", () => {
    renderSections(false);
    expect(screen.queryByText("Đơn mua")).not.toBeInTheDocument();
  });
});
