import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInventoryMovementsKeys } from "../../../api/inventoryMovementsKeys";
import type { InventoryMovementsApi } from "../../../api/inventoryMovementsApi.type";
import type { InventoryMovementsModuleConfig } from "../../../inventoryMovements.config.type";
import { StockLedgerDrawer } from "./StockLedgerDrawer";

const listTransactions = vi.fn();

const config = {
  api: { listTransactions } as unknown as InventoryMovementsApi,
  keys: createInventoryMovementsKeys(["test-ledger-drawer"]),
} as unknown as InventoryMovementsModuleConfig;

function renderDrawer() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <StockLedgerDrawer
        config={config}
        itemCode="SKU-01"
        itemName="Lọc dầu"
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("StockLedgerDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tải thẻ kho của mã hàng, hiển thị bảng và stat cards", async () => {
    listTransactions.mockResolvedValue({
      items: [
        {
          id: "t1",
          transactionDate: "2026-01-02T00:00:00Z",
          createdAt: "2026-01-02T14:30:25Z",
          transactionType: "RECEIPT",
          documentType: "PURCHASE_RECEIPT",
          documentId: "d1",
          documentNo: "PN-001",
          qtyIn: 5,
          qtyOut: 0,
          unitCost: 100,
        },
      ],
      total: 1,
    });
    renderDrawer();
    await waitFor(() => expect(screen.getByText("PN-001")).toBeTruthy());
    expect(screen.getByText("Nhập kho")).toBeTruthy();
    expect(screen.getByText("Tổng Nhập")).toBeTruthy();
    expect(screen.getByText("Tồn Cuối")).toBeTruthy();
    expect(screen.getByText("02/01/2026")).toBeTruthy();
    expect(listTransactions).toHaveBeenCalledWith(
      "SKU-01",
      1,
      200,
      "WEIGHTED_AVG",
      undefined,
    );
  });

  it("cho phép chuyển đổi qua lại giữa Bình quân gia quyền và FIFO", async () => {
    listTransactions.mockResolvedValue({
      items: [
        {
          id: "t1",
          transactionDate: "2026-01-02T00:00:00Z",
          transactionType: "RECEIPT",
          documentType: "PURCHASE_RECEIPT",
          documentId: "d1",
          documentNo: "PN-001",
          qtyIn: 10,
          qtyOut: 0,
          unitCost: 100,
        },
      ],
      total: 1,
    });
    renderDrawer();
    await waitFor(() =>
      expect(screen.getAllByText("FIFO").length).toBeGreaterThan(0),
    );

    // Click chuyển sang FIFO
    fireEvent.click(screen.getAllByText("FIFO")[0]);
    await waitFor(() => {
      expect(screen.getAllByText("FIFO").length).toBeGreaterThan(0);
    });

    // Click chuyển lại Bình quân gia quyền
    fireEvent.click(screen.getAllByText("Bình quân gia quyền")[0]);
    await waitFor(() => {
      expect(screen.getAllByText("Bình quân gia quyền").length).toBeGreaterThan(
        0,
      );
    });
  });

  it("phân trang client khi số lượng giao dịch vượt quá 50 dòng", async () => {
    const items = Array.from({ length: 60 }, (_, i) => ({
      id: `t-${i}`,
      transactionDate: "2026-01-02T00:00:00Z",
      transactionType: "RECEIPT",
      documentType: "PURCHASE_RECEIPT",
      documentId: `d-${i}`,
      documentNo: `PN-${i}`,
      qtyIn: 1,
      qtyOut: 0,
      unitCost: 10,
    }));
    listTransactions.mockResolvedValue({ items, total: 60 });
    renderDrawer();
    await waitFor(() => expect(screen.getByText("1 / 2")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Sau" }));
    await waitFor(() => expect(screen.getByText("2 / 2")).toBeTruthy());
  });

  it("hiển thị đầy đủ thông tin itemInfo và panel cột phải khi được cung cấp", async () => {
    listTransactions.mockResolvedValue({
      items: [],
      total: 0,
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <StockLedgerDrawer
          config={config}
          itemCode="SKU-99"
          itemName="Lọc gió động cơ"
          itemInfo={{
            itemCode: "SKU-99",
            itemName: "Lọc gió động cơ",
            unit: "Cái",
            avgCost: 250000,
            qtyOnHand: 15,
          }}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Thông tin phụ tùng")).toBeTruthy(),
    );
    expect(screen.getByText("Cái")).toBeTruthy();
    expect(screen.getByText("SKU-99")).toBeTruthy();
  });
});
