// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BankTransactionDetailDrawer } from "../BankTransactionDetailDrawer";

const v2BankDrawer = vi.fn();
vi.mock("@/v2/modules/bank-statements", () => ({
  BankTransactionDetailDrawer: (props: any) => {
    v2BankDrawer(props);
    return <div data-testid="v2-bank-drawer">{props.transactionId}</div>;
  },
}));

describe("BankTransactionDetailDrawer Facade", () => {
  beforeEach(() => {
    v2BankDrawer.mockReset();
  });

  it("render đúng qua re-export facade và chuyển tiếp props sang V2", () => {
    render(
      <BankTransactionDetailDrawer
        isOpen={true}
        onClose={() => {}}
        transactionId="txn-1"
        initialMode="view"
      />,
    );

    expect(screen.getByTestId("v2-bank-drawer")).toBeTruthy();
    expect(v2BankDrawer).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        transactionId: "txn-1",
        initialMode: "view",
      }),
    );
  });
});
