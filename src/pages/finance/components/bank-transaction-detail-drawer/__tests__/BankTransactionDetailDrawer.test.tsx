// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BankTransactionDetailDrawer } from "../BankTransactionDetailDrawer";

const v2BankDrawer = vi.fn();
vi.mock("@/v2/modules/bank-statements", () => ({
  BankTransactionDetailDrawer: (props: any) => {
    v2BankDrawer(props);
    return <div data-testid="v2-bank-detail-drawer">{props.transactionId}</div>;
  },
}));

describe("BankTransactionDetailDrawer Adapter", () => {
  beforeEach(() => {
    v2BankDrawer.mockReset();
  });

  it("chuyển tiếp đầy đủ props sang V2 drawer", () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(
      <BankTransactionDetailDrawer
        isOpen={true}
        onClose={onClose}
        transactionId="tx-bank-99"
        defaultTabKey="details"
        initialMode="edit"
        onSaved={onSaved}
      />,
    );

    expect(screen.getByTestId("v2-bank-detail-drawer")).toBeTruthy();
    expect(v2BankDrawer).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        transactionId: "tx-bank-99",
        defaultTabKey: "details",
        initialMode: "edit",
        onSaved,
        onClose,
      }),
    );
  });
});
