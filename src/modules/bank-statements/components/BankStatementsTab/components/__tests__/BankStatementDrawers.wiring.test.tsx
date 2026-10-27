import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { v2Cash, v1Detail } = vi.hoisted(() => ({
  v2Cash: vi.fn(),
  v1Detail: vi.fn(),
}));

vi.mock("@/v2/modules/bank-statements", () => ({
  CashTransactionDetailDrawer: (props: unknown) => {
    v2Cash(props);
    return null;
  },
}));
vi.mock("@/pages/finance/components/BankTransactionDetailDrawer", () => ({
  BankTransactionDetailDrawer: (props: unknown) => {
    v1Detail(props);
    return null;
  },
}));
vi.mock("@/pages/finance/components/ImportStatementDrawer", () => ({
  ImportStatementDrawer: () => null,
}));
vi.mock("@/pages/finance/components/OriginalStatementFilesDrawer", () => ({
  OriginalStatementFilesDrawer: () => null,
}));
vi.mock("@/pages/finance/components/CreateCashTransactionDrawer", () => ({
  CreateCashTransactionDrawer: () => null,
}));
vi.mock("@/pages/finance/components/BankStatementExportDrawer", () => ({
  BankStatementExportDrawer: () => null,
}));
vi.mock("@/pages/components/PartnerTransactionsDrawer", () => ({
  PartnerTransactionsDrawer: () => null,
}));

import { BankStatementDrawers } from "../BankStatementDrawers";

const baseProps = {
  branches: [],
  accountsData: [],
  isExportOpen: false,
  setIsExportOpen: vi.fn(),
  isOriginalFilesOpen: false,
  setIsOriginalFilesOpen: vi.fn(),
  isImportOpen: false,
  setIsImportOpen: vi.fn(),
  isCreateOpen: false,
  setIsCreateOpen: vi.fn(),
  detailTransactionId: "t1",
  setDetailTransactionId: vi.fn(),
  detailDefaultTab: "txn_partner",
  detailMode: "edit" as const,
  partnerDrawerOpen: false,
  setPartnerDrawerOpen: vi.fn(),
  selectedPartner: null,
  onRefresh: vi.fn(),
};

describe("BankStatementDrawers: chọn drawer chi tiết theo loại sao kê", () => {
  beforeEach(() => {
    v2Cash.mockReset();
    v1Detail.mockReset();
  });

  it("tab tiền mặt dùng drawer V2 và nối chọn dòng, lưu, mode", () => {
    render(<BankStatementDrawers {...(baseProps as any)} type="cash" />);
    expect(v1Detail).not.toHaveBeenCalled();
    expect(v2Cash).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        transactionId: "t1",
        defaultTabKey: "txn_partner",
        initialMode: "edit",
        onSelectTransaction: baseProps.setDetailTransactionId,
        onSaved: baseProps.onRefresh,
      }),
    );
  });

  it("tab ngân hàng vẫn dùng drawer V1", () => {
    render(<BankStatementDrawers {...(baseProps as any)} type="bank" />);
    expect(v2Cash).not.toHaveBeenCalled();
    expect(v1Detail).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: "t1" }),
    );
  });
});
