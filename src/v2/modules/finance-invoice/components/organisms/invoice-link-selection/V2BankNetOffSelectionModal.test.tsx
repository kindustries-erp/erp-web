import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2BankNetOffSelectionModal } from "./V2BankNetOffSelectionModal";
import { bankTransactionLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

vi.mock(
  "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi",
  () => ({
    bankTransactionLinkApi: { list: vi.fn() },
  }),
);

const payment: BankTransactionLinkDto = {
  id: "pay-1",
  transDate: "2026-10-26",
  referenceNumber: "UNC-100",
  correspondentName: "NCC A",
  debitAmount: "1000",
  creditAmount: "0",
  netOffAmount: "400",
};
const receipt: BankTransactionLinkDto = {
  id: "rec-1",
  transDate: "2026-10-26",
  referenceNumber: "GBC-200",
  correspondentName: "KH B",
  debitAmount: "0",
  creditAmount: "500",
  netOffAmount: "0",
};
const linked: BankTransactionLinkDto = {
  ...payment,
  id: "pay-2",
  referenceNumber: "UNC-300",
  debitAmount: "700",
  netOffAmount: "0",
};

const renderModal = (
  props: Partial<React.ComponentProps<typeof V2BankNetOffSelectionModal>> = {},
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <V2BankNetOffSelectionModal
        open
        onClose={vi.fn()}
        side="PAYMENT"
        onSelect={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );

const rowCheckbox = (reference: string) => {
  const row = screen.getByText(reference).closest("tr") as HTMLElement;
  return within(row).getByRole("checkbox");
};

describe("V2BankNetOffSelectionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bankTransactionLinkApi.list).mockResolvedValue({
      items: [payment, receipt, linked],
      total: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it("shows only transactions on the side of the invoice", async () => {
    renderModal({ side: "PAYMENT" });
    expect(await screen.findByText("UNC-100")).toBeInTheDocument();
    expect(screen.queryByText("GBC-200")).toBeNull();
  });

  it("selects a transaction and confirms it with its remaining amount", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    renderModal({ onSelect, onClose });
    await screen.findByText("UNC-100");
    fireEvent.click(rowCheckbox("UNC-100"));
    fireEvent.click(
      await screen.findByRole("button", { name: /Xác nhận cấn trừ \(1\)/ }),
    );
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith([{ id: "pay-1", amount: 600 }]),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not let a linked transaction be selected", async () => {
    renderModal({ existingTxnIds: ["pay-2"] });
    expect(await screen.findByText("UNC-300")).toBeInTheDocument();
    const row = screen.getByText("UNC-300").closest("tr") as HTMLElement;
    expect(within(row).getByText("Đã liên kết")).toBeInTheDocument();
    fireEvent.click(within(row).getByRole("checkbox"));
    expect(
      screen.getByRole("button", { name: "Xác nhận cấn trừ" }),
    ).toBeDisabled();
  });

  it("keeps confirm disabled until a transaction is chosen", async () => {
    renderModal();
    await screen.findByText("UNC-100");
    expect(
      screen.getByRole("button", { name: "Xác nhận cấn trừ" }),
    ).toBeDisabled();
  });
});
