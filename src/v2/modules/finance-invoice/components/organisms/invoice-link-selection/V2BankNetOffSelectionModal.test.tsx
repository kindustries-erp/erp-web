import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { bankTransactionLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi";
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

describe("V2BankNetOffSelectionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBankList();
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

  it("loads the cash book when the cash-book source is chosen", async () => {
    renderModal();
    await screen.findByText("UNC-100");
    fireEvent.click(screen.getByRole("button", { name: "Sổ quỹ" }));
    await waitFor(() =>
      expect(bankTransactionLinkApi.list).toHaveBeenLastCalledWith(
        expect.anything(),
        "CASH",
      ),
    );
  });

  it("keeps a selection when switching the source", async () => {
    renderModal();
    await screen.findByText("UNC-100");
    fireEvent.click(rowCheckbox("UNC-100"));
    fireEvent.click(screen.getByRole("button", { name: "Sổ quỹ" }));
    fireEvent.click(screen.getByRole("button", { name: "Sao kê" }));
    expect(
      await screen.findByRole("button", { name: /Xác nhận cấn trừ \(1\)/ }),
    ).toBeInTheDocument();
  });
});
