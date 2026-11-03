import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GarageGoodsReceiptsPage } from "@/v2/modules/garage-goods-receipts/pages/GarageGoodsReceiptsPage";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  nextCode: vi.fn(),
}));

vi.mock("../../api/garageGoodsReceiptsApi", () => ({
  garageGoodsReceiptsV2Api: api,
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
        <GarageGoodsReceiptsPage />
      </div>
    </QueryClientProvider>,
  );
};

describe("GarageGoodsReceiptsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue({
      items: [
        {
          id: "r1",
          receiptNo: "Bản ghi mẫu",
          receiptDate: "2026-01-01",
          supplierName: "Bản ghi mẫu",
          branchName: "Bản ghi mẫu",
          totalAmount: 1,
          status: "Bản ghi mẫu",
          remarks: "Bản ghi mẫu",
          createdAt: "2026-01-01",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    api.options.mockResolvedValue({ items: [], total: 0, next: null });
  });

  it("loads the list through the module API", async () => {
    renderPage();
    expect(await screen.findAllByText("Bản ghi mẫu")).not.toHaveLength(0);
    await waitFor(() => expect(api.list).toHaveBeenCalled());
  });
});
