import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { v2Cash, v2Bank, v2Qr } = vi.hoisted(() => ({
  v2Cash: vi.fn(),
  v2Bank: vi.fn(),
  v2Qr: vi.fn(),
}));

vi.mock("@/v2/modules/transfer-qr-bank-statements", () => ({
  TransferQrBankStatementsDrawer: (props: unknown) => {
    v2Qr(props);
    return null;
  },
}));
vi.mock("@/v2/modules/bank-statements", () => ({
  CashTransactionDetailDrawer: (props: unknown) => {
    v2Cash(props);
    return null;
  },
  BankTransactionDetailDrawer: (props: unknown) => {
    v2Bank(props);
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
  isQrOpen: false,
  setIsQrOpen: vi.fn(),
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
    v2Bank.mockReset();
    v2Qr.mockReset();
  });

  it("tab tiền mặt dùng drawer V2 và nối chọn dòng, lưu, mode", () => {
    render(<BankStatementDrawers {...(baseProps as any)} type="cash" />);
    expect(v2Bank).not.toHaveBeenCalled();
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

  it("tab ngân hàng dùng drawer V2 và nối chọn dòng, lưu, mode", () => {
    render(<BankStatementDrawers {...(baseProps as any)} type="bank" />);
    expect(v2Cash).not.toHaveBeenCalled();
    expect(v2Bank).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        transactionId: "t1",
        defaultTabKey: "txn_partner",
        initialMode: "edit",
        onSelectTransaction: baseProps.setDetailTransactionId,
        onSaved: expect.any(Function),
      }),
    );
  });

  it("drawer QR chỉ mount ở tab ngân hàng và nhận đúng trạng thái mở", () => {
    render(
      <BankStatementDrawers
        {...(baseProps as any)}
        type="bank"
        isQrOpen={true}
      />,
    );
    expect(v2Qr).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, accounts: [] }),
    );
  });

  it("tab tiền mặt không mount drawer QR", () => {
    render(
      <BankStatementDrawers
        {...(baseProps as any)}
        type="cash"
        isQrOpen={true}
      />,
    );
    expect(v2Qr).not.toHaveBeenCalled();
  });
});
