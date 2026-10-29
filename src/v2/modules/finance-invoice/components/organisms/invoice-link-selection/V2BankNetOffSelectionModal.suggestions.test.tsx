import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { netOffSuggestionApi } from "@/v2/modules/finance-invoice/api/linkSources/netOffSuggestionApi";
import {
  mockBankList,
  renderModal,
  rowCheckbox,
} from "./V2BankNetOffSelectionModal.testUtils";

vi.mock(
  "@/v2/modules/finance-invoice/api/linkSources/netOffSuggestionApi",
  () => ({
    netOffSuggestionApi: { list: vi.fn() },
  }),
);

vi.mock(
  "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi",
  () => ({
    bankTransactionLinkApi: { list: vi.fn() },
  }),
);

/** Gợi ý khớp hoàn toàn cho khoản chi UNC-100 (còn lại 600) */
const perfectSuggestion = [
  {
    txn: {
      id: "pay-1",
      transDate: "2026-10-26",
      referenceNumber: "UNC-100",
      correspondentName: "NCC A",
      debitAmount: 1000,
      creditAmount: 0,
      remainingAmount: 600,
    },
    score: { score: 95, badge: "PERFECT" as const },
  },
];

describe("V2BankNetOffSelectionModal - gợi ý và chuyển tab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBankList();
  });

  it("shows only the suggested transactions when suggestions are on", async () => {
    vi.mocked(netOffSuggestionApi.list).mockResolvedValue(perfectSuggestion);
    renderModal({ invoiceId: "inv-1" });
    await screen.findByText("UNC-300");
    fireEvent.click(screen.getByRole("button", { name: "Gợi ý khớp" }));
    expect(await screen.findByText("Khớp hoàn toàn")).toBeInTheDocument();
    expect(screen.queryByText("UNC-300")).toBeNull();
    expect(screen.getByText("UNC-100")).toBeInTheDocument();
  });

  it("returns from the suggestion tab to the bank tab in one click", async () => {
    vi.mocked(netOffSuggestionApi.list).mockResolvedValue(perfectSuggestion);
    renderModal({ invoiceId: "inv-1" });
    await screen.findByText("UNC-300");
    fireEvent.click(screen.getByRole("button", { name: "Gợi ý khớp" }));
    expect(await screen.findByText("Khớp hoàn toàn")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sao kê" }));
    expect(await screen.findByText("UNC-300")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sao kê" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the selection when moving between tabs", async () => {
    renderModal({ invoiceId: "inv-1" });
    await screen.findByText("UNC-100");
    fireEvent.click(rowCheckbox("UNC-100"));
    fireEvent.click(screen.getByRole("button", { name: "Gợi ý khớp" }));
    fireEvent.click(screen.getByRole("button", { name: "Sao kê" }));
    expect(
      await screen.findByRole("button", { name: /Xác nhận cấn trừ \(1\)/ }),
    ).toBeInTheDocument();
  });
});
