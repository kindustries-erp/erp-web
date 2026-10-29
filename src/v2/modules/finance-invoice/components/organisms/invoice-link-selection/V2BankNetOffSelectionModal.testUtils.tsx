import React from "react";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { V2BankNetOffSelectionModal } from "./V2BankNetOffSelectionModal";
import { bankTransactionLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

/** Dùng chung cho các file test của modal cấn trừ; `vi.mock` vẫn khai báo trong từng file test */

export const payment: BankTransactionLinkDto = {
  id: "pay-1",
  transDate: "2026-10-26",
  referenceNumber: "UNC-100",
  correspondentName: "NCC A",
  debitAmount: "1000",
  creditAmount: "0",
  netOffAmount: "400",
};
export const receipt: BankTransactionLinkDto = {
  id: "rec-1",
  transDate: "2026-10-26",
  referenceNumber: "GBC-200",
  correspondentName: "KH B",
  debitAmount: "0",
  creditAmount: "500",
  netOffAmount: "0",
};
export const linked: BankTransactionLinkDto = {
  ...payment,
  id: "pay-2",
  referenceNumber: "UNC-300",
  debitAmount: "700",
  netOffAmount: "0",
};

export const renderModal = (
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

export const rowCheckbox = (reference: string) => {
  const row = screen.getByText(reference).closest("tr") as HTMLElement;
  return within(row).getByRole("checkbox");
};

/** Danh sách sao kê mặc định: một khoản chi, một khoản thu và một khoản đã liên kết */
export function mockBankList() {
  vi.mocked(bankTransactionLinkApi.list).mockResolvedValue({
    items: [payment, receipt, linked],
    total: 3,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });
}
