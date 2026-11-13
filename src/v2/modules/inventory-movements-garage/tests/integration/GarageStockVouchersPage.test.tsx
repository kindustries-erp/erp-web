import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GarageStockVouchersPage } from "../../pages/GarageStockVouchersPage";

const stockApi = vi.hoisted(() => ({
  listVouchers: vi.fn(),
  voucherOptions: vi.fn(),
  getVoucher: vi.fn(),
  listBalances: vi.fn(),
  listTransactions: vi.fn(),
}));
const receiptApi = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  nextCode: vi.fn(),
}));

vi.mock("../../api/garageStockApi", () => ({ garageStockApi: stockApi }));
vi.mock("../../purchase-receipts/api/garageGoodsReceiptsApi", () => ({
  garageGoodsReceiptsV2Api: receiptApi,
}));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));

const row = (over: object) => ({
  id: "r1",
  type: "ISSUE",
  voucherNo: "PX-001",
  voucherDate: "2026-01-01",
  status: "POSTED",
  partnerName: "Khách A",
  branchId: null,
  totalAmount: 1000,
  remarks: null,
  createdAt: "2026-01-01",
  ...over,
});

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <div className="h-[800px]">
        <GarageStockVouchersPage />
      </div>
    </QueryClientProvider>,
  );
};

describe("GarageStockVouchersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/garage-stock-vouchers");
    stockApi.listVouchers.mockResolvedValue({
      items: [
        row({}),
        row({ id: "r2", type: "PURCHASE_RECEIPT", voucherNo: "PN-009" }),
      ],
      total: 2,
    });
    stockApi.voucherOptions.mockResolvedValue({
      items: [],
      total: 0,
      next: null,
    });
    stockApi.getVoucher.mockResolvedValue({
      id: "r1",
      voucherNo: "PX-001",
      voucherDate: "2026-01-01",
      status: "POSTED",
      partnerName: "Khách A",
      remarks: null,
      lines: [],
    });
    receiptApi.options.mockResolvedValue({ items: [], total: 0, next: null });
  });

  it("gộp mọi loại phiếu vào một danh sách qua API chứng từ kho", async () => {
    renderPage();
    expect(await screen.findByText("PX-001")).toBeTruthy();
    expect(screen.getByText("PN-009")).toBeTruthy();
    expect(stockApi.listVouchers).toHaveBeenCalled();
    expect(receiptApi.list).not.toHaveBeenCalled();
  });

  it("mở drawer chỉ đọc cho phiếu xuất", async () => {
    renderPage();
    await screen.findByText("PX-001");
    fireEvent.click(screen.getAllByRole("button", { name: "Xem chi tiết" })[0]);
    await waitFor(() =>
      expect(stockApi.getVoucher).toHaveBeenCalledWith("ISSUE", "r1"),
    );
  });

  it("gắn số phiếu theo loại vào tab; Tất cả là tổng, loại 0 hiện số 0", async () => {
    stockApi.listVouchers.mockResolvedValue({
      items: [row({})],
      total: 1,
      typeCounts: {
        PURCHASE_RECEIPT: 5,
        ISSUE: 3,
        OTHER_RECEIPT: 0,
        ADJUSTMENT: 0,
      },
    });
    renderPage();
    const tabsWithBadge = (n: string) =>
      screen
        .getAllByRole("tab")
        .filter((el) => within(el).queryByText(n) !== null);
    await waitFor(() => expect(tabsWithBadge("8")).toHaveLength(1));
    expect(tabsWithBadge("5")).toHaveLength(1);
    expect(tabsWithBadge("3")).toHaveLength(1);
    // Số 0 hiện trên thẻ KPI (OTHER_RECEIPT, ADJUSTMENT)
    expect(tabsWithBadge("0")).toHaveLength(2);
  });

  it("mở phiếu nhập mua hàng bằng ?receipt= (drawer đầy đủ của core)", async () => {
    window.history.replaceState(null, "", "/garage-stock-vouchers?receipt=r2");
    receiptApi.get.mockResolvedValue({
      id: "r2",
      receiptNo: "PN-009",
      receiptDate: "2026-01-01",
      status: "POSTED",
      lines: [],
    });
    renderPage();
    await waitFor(() => expect(receiptApi.get).toHaveBeenCalledWith("r2"));
  });
});
