import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GarageStockBalancesPage } from "../../pages/GarageStockBalancesPage";

const api = vi.hoisted(() => ({
  listVouchers: vi.fn(),
  voucherOptions: vi.fn(),
  getVoucher: vi.fn(),
  listBalances: vi.fn(),
  listTransactions: vi.fn(),
}));
vi.mock("../../api/garageStockApi", () => ({ garageStockApi: api }));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));

describe("GarageStockBalancesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listBalances.mockResolvedValue({
      items: [
        {
          id: "b1",
          branchId: null,
          itemCode: "SKU-01",
          itemName: "Lọc dầu",
          unit: "Cái",
          qtyOnHand: 5,
          avgCost: 100,
          inventoryValue: 500,
          updatedAt: "2026-01-01",
        },
      ],
      total: 1,
      summaries: {
        qtyOnHand: { total: 5, pageSubtotal: 5, cumulative: 5 },
        inventoryValue: { total: 500, pageSubtotal: 500, cumulative: 500 },
      },
      extraData: { tabCounts: {} },
    });
    api.listTransactions.mockResolvedValue({ items: [], total: 0 });
  });

  it("hiển thị số dư tồn và mở thẻ kho theo mã hàng", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <div className="h-[800px]">
          <GarageStockBalancesPage />
        </div>
      </QueryClientProvider>,
    );
    expect(await screen.findByText("Lọc dầu")).toBeTruthy();
    const tabNames = screen
      .getAllByRole("tab")
      .map((el) => el.textContent?.trim());
    expect(tabNames.slice(0, 4)).toEqual([
      "Tất cả",
      "Còn hàng",
      "Hết hàng",
      "Tồn âm",
    ]);
    expect(api.listBalances).toHaveBeenCalledWith(expect.anything(), "ALL");
    fireEvent.click(screen.getAllByRole("button", { name: "Xem chi tiết" })[0]);
    await waitFor(() =>
      expect(api.listTransactions).toHaveBeenCalledWith("SKU-01", 1, 20),
    );
  });

  it("gắn số đếm vào từng tab, số 0 vẫn hiện trên thẻ KPI", async () => {
    api.listBalances.mockResolvedValue({
      items: [],
      total: 0,
      extraData: {
        tabCounts: { ALL: 6, IN_STOCK: 4, OUT_OF_STOCK: 2, NEGATIVE: 0 },
      },
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <div className="h-[800px]">
          <GarageStockBalancesPage />
        </div>
      </QueryClientProvider>,
    );
    const tab = (name: string) =>
      screen.getAllByRole("tab").find((el) => el.textContent?.includes(name))!;
    await waitFor(() =>
      expect(within(tab("Tất cả")).getByText("6")).toBeTruthy(),
    );
    expect(within(tab("Còn hàng")).getByText("4")).toBeTruthy();
    expect(within(tab("Hết hàng")).getByText("2")).toBeTruthy();
    expect(within(tab("Tồn âm")).getByText("0")).toBeTruthy();
  });
});
