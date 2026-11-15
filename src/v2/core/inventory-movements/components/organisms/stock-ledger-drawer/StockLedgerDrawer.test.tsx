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

  it("tải thẻ kho của mã hàng ở trang 1", async () => {
    listTransactions.mockResolvedValue({
      items: [
        {
          id: "t1",
          transactionDate: "2026-01-02T00:00:00Z",
          transactionType: "RECEIPT",
          documentType: "GR",
          documentId: "d1",
          qtyIn: 5,
          qtyOut: 0,
          unitCost: 100,
        },
      ],
      total: 1,
    });
    renderDrawer();
    await waitFor(() => expect(screen.getByText("RECEIPT")).toBeTruthy());
    expect(listTransactions).toHaveBeenCalledWith("SKU-01", 1, 20);
    // Một trang thì không hiện điều hướng phân trang
    expect(screen.queryByText("1 / 1")).toBeNull();
  });

  it("phân trang: hiện 'trang / tổng' và chuyển trang khi bấm Sau", async () => {
    listTransactions.mockResolvedValue({ items: [], total: 45 });
    renderDrawer();
    await waitFor(() => expect(screen.getByText("1 / 3")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Sau" }));
    await waitFor(() =>
      expect(listTransactions).toHaveBeenCalledWith("SKU-01", 2, 20),
    );
    await waitFor(() => expect(screen.getByText("2 / 3")).toBeTruthy());
  });
});
