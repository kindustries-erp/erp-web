import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2SalesOrderSelectionModal } from "./V2SalesOrderSelectionModal";
import { salesOrderLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/salesOrderLinkApi";
import type { SalesOrderLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

vi.mock(
  "@/v2/modules/finance-invoice/api/linkSources/salesOrderLinkApi",
  () => ({
    salesOrderLinkApi: { list: vi.fn() },
  }),
);

const so = (id: string, soNo: string): SalesOrderLinkDto => ({
  id,
  soNo,
  customerName: `KH ${soNo}`,
  orderDate: "2026-10-26",
  status: "OPEN",
});

describe("V2SalesOrderSelectionModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists sales orders and reports the chosen one", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const order = so("s1", "SO-001");
    vi.mocked(salesOrderLinkApi.list).mockResolvedValue({
      items: [order],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <V2SalesOrderSelectionModal
          open
          onClose={onClose}
          onSelect={onSelect}
        />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("SO-001")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chọn" }));
    expect(onSelect).toHaveBeenCalledWith(order);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
