import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2PurchaseOrderSelectionModal } from "./V2PurchaseOrderSelectionModal";
import { purchaseOrderLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/purchaseOrderLinkApi";
import type { PurchaseOrderLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

vi.mock(
  "@/v2/modules/finance-invoice/api/linkSources/purchaseOrderLinkApi",
  () => ({
    purchaseOrderLinkApi: { list: vi.fn() },
  }),
);

const po = (id: string, poNo: string): PurchaseOrderLinkDto => ({
  id,
  poNo,
  supplierName: `NCC ${poNo}`,
  orderDate: "2026-10-26",
  status: "OPEN",
});

const mockRows = (items: PurchaseOrderLinkDto[]) => {
  vi.mocked(purchaseOrderLinkApi.list).mockResolvedValue({
    items,
    total: items.length,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });
};

const renderModal = (
  props: Partial<
    React.ComponentProps<typeof V2PurchaseOrderSelectionModal>
  > = {},
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <V2PurchaseOrderSelectionModal
        open
        onClose={vi.fn()}
        onSelect={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );

describe("V2PurchaseOrderSelectionModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists purchase orders with their number and supplier", async () => {
    mockRows([po("1", "PO-001")]);
    renderModal();
    expect(await screen.findByText("PO-001")).toBeInTheDocument();
    expect(screen.getByText("NCC PO-001")).toBeInTheDocument();
  });

  it("selects an order, reports it and closes the modal", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const order = po("1", "PO-001");
    mockRows([order]);
    renderModal({ onSelect, onClose });
    fireEvent.click(await screen.findByRole("button", { name: "Chọn" }));
    expect(onSelect).toHaveBeenCalledWith(order);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("marks an already linked order and does not allow choosing it", async () => {
    const onSelect = vi.fn();
    mockRows([po("1", "PO-001")]);
    renderModal({ onSelect, existingPoIds: ["1"] });
    expect(await screen.findByText("Đã liên kết")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chọn" })).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("shows the empty message when there are no orders", async () => {
    mockRows([]);
    renderModal();
    expect(
      await screen.findByText("Không có đơn mua hàng"),
    ).toBeInTheDocument();
  });

  it("shows the load error message when the request fails", async () => {
    vi.mocked(purchaseOrderLinkApi.list).mockRejectedValue(
      new Error("network"),
    );
    renderModal();
    expect(
      await screen.findByText("Không tải được danh sách đơn mua hàng"),
    ).toBeInTheDocument();
  });
});
