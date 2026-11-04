import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GaragePurchaseOrdersPage } from "@/v2/modules/garage-purchase-orders/pages/GaragePurchaseOrdersPage";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  nextNo: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  approve: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../api/garagePurchaseOrdersApi", () => ({
  garagePurchaseOrdersV2Api: api,
}));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <div className="h-[800px]">
        <GaragePurchaseOrdersPage />
      </div>
    </QueryClientProvider>,
  );
};

describe("GaragePurchaseOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue({
      items: [
        {
          id: "p1",
          poNo: "GPO-MAU-001",
          orderDate: "2026-01-01",
          status: "DRAFT",
          supplierName: "NCC mẫu",
          branchName: "Chi nhánh mẫu",
          totalAmount: 1000,
          inventoryStatus: "NOT_RECEIVED",
          lines: [],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    api.options.mockResolvedValue({ items: [], total: 0, next: null });
    api.nextNo.mockResolvedValue({ nextNo: "GPO-20261104-009" });
  });

  it("tải danh sách qua API của module", async () => {
    renderPage();
    expect(await screen.findAllByText("GPO-MAU-001")).not.toHaveLength(0);
    await waitFor(() => expect(api.list).toHaveBeenCalled());
  });

  it("bấm Tạo đơn mua hàng mở drawer và sinh số đơn mới", async () => {
    renderPage();
    await screen.findAllByText("GPO-MAU-001");
    fireEvent.click(screen.getByRole("button", { name: "Tạo đơn mua hàng" }));
    expect(
      await screen.findByText("Thêm mới đơn mua hàng"),
    ).toBeInTheDocument();
    await waitFor(() => expect(api.nextNo).toHaveBeenCalled());
  });
});
