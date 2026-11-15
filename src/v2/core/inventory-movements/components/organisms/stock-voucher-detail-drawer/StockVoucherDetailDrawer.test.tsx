import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInventoryMovementsKeys } from "../../../api/inventoryMovementsKeys";
import type { InventoryMovementsApi } from "../../../api/inventoryMovementsApi.type";
import type { InventoryMovementsModuleConfig } from "../../../inventoryMovements.config.type";
import { StockVoucherDetailDrawer } from "./StockVoucherDetailDrawer";

const getVoucher = vi.fn();

const config = {
  api: { getVoucher } as unknown as InventoryMovementsApi,
  keys: createInventoryMovementsKeys(["test-voucher-drawer"]),
  voucherTypes: [
    {
      code: "ISSUE",
      labelKey: "v2.test.issue",
      labelFallback: "Xuất kho",
      direction: "OUT",
    },
  ],
} as unknown as InventoryMovementsModuleConfig;

function renderDrawer() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <StockVoucherDetailDrawer
        config={config}
        type="ISSUE"
        id="v1"
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("StockVoucherDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gọi API đúng loại và mã phiếu, hiện số phiếu và dòng hàng", async () => {
    getVoucher.mockResolvedValue({
      id: "v1",
      type: "ISSUE",
      voucherNo: "PX-0001",
      voucherDate: "2026-01-05T00:00:00Z",
      status: "POSTED",
      partnerName: "Khách A",
      remarks: "Ghi chú",
      lines: [
        {
          id: "l1",
          itemCode: "SKU-01",
          itemName: "Lọc dầu",
          unit: "Cái",
          qty: 2,
          unitCost: 75000,
          amount: 150000,
        },
      ],
    });
    renderDrawer();
    await waitFor(() => expect(screen.getByText("PX-0001")).toBeTruthy());
    expect(getVoucher).toHaveBeenCalledWith("ISSUE", "v1");
    expect(screen.getByText("SKU-01")).toBeTruthy();
    expect(screen.getByText("Lọc dầu")).toBeTruthy();
    expect(screen.getByText("Đã ghi sổ")).toBeTruthy();
  });

  it("phiếu chưa có dòng hàng hiện thông báo rỗng", async () => {
    getVoucher.mockResolvedValue({
      id: "v2",
      type: "ISSUE",
      voucherNo: "PX-0002",
      voucherDate: "2026-01-06T00:00:00Z",
      status: "DRAFT",
      partnerName: null,
      remarks: null,
      lines: [],
    });
    renderDrawer();
    await waitFor(() =>
      expect(screen.getByText("Phiếu chưa có dòng hàng")).toBeTruthy(),
    );
  });
});
