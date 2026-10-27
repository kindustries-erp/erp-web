// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { CreateCashTransactionDrawer } from "../CreateCashTransactionDrawer";

const { voucherDrawer } = vi.hoisted(() => ({ voucherDrawer: vi.fn() }));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector: (s: { currentBranchId: string }) => unknown) =>
    selector({ currentBranchId: "branch-current" }),
}));

vi.mock("@/v2/modules/cash-vouchers", () => ({
  CashVoucherDrawer: (props: unknown) => {
    voucherDrawer(props);
    return null;
  },
}));

describe("CreateCashTransactionDrawer (cầu nối V2)", () => {
  beforeEach(() => voucherDrawer.mockReset());

  it("truyền chi nhánh đang chọn và chuyển onSuccess thành onCreated", () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(
      <CreateCashTransactionDrawer
        isOpen
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(voucherDrawer).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        onClose,
        onCreated: onSuccess,
        fallbackBranchId: "branch-current",
      }),
    );
  });
});
