import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getTransaction, updateTransaction, listBranches } = vi.hoisted(() => ({
  getTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  listBranches: vi.fn(),
}));

vi.mock("../api/cashTransactionApi", () => ({
  cashTransactionApi: {
    getTransaction,
    updateTransaction,
    postTransaction: vi.fn(),
    unpostTransaction: vi.fn(),
  },
}));
vi.mock("../api/branchOptionsApi", () => ({
  branchOptionsApi: { listBranchOptions: listBranches },
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({ t: (key: string) => key }),
}));

import { CashTransactionSaveError } from "../api/mutations/cashTransactionSaveError";
import { useCashTransactionDetailDrawer } from "./CashTransactionDetailDrawer.hook";
import { stepMessage } from "./CashTransactionDetailDrawer.helper";

const TX = {
  id: "t1",
  sourceType: "CASH",
  transDate: "2026-10-01",
  debitAmount: 0,
  creditAmount: 200,
  note: "cũ",
  branchIds: ["b1"],
  cashBook: { name: "Quỹ ĐT" },
  partner: null,
  cashflowClassification: null,
  cashflowPurpose: null,
  postingStatus: "UNPOSTED",
  createdAt: "2026-10-01T00:00:00Z",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const renderDrawer = (defaultTabKey?: string) =>
  renderHook(
    () =>
      useCashTransactionDetailDrawer({
        isOpen: true,
        onClose: vi.fn(),
        transactionId: "t1",
        defaultTabKey,
      }),
    { wrapper },
  );

describe("useCashTransactionDetailDrawer", () => {
  beforeEach(() => {
    [getTransaction, updateTransaction, listBranches].forEach((fn) =>
      fn.mockReset(),
    );
    getTransaction.mockResolvedValue(TX);
    listBranches.mockResolvedValue([{ value: "b1", label: "HN — Hà Nội" }]);
  });

  it("nạp nháp từ giao dịch và chưa bẩn", async () => {
    const { result } = renderDrawer();
    await waitFor(() => expect(result.current.draft?.description).toBe("cũ"));
    expect(result.current.dirty).toBe(false);
    expect(result.current.draft?.branchIds).toEqual(["b1"]);
  });

  it("đổi tab từ khóa V1 'txn_partner' về tab đối tượng", async () => {
    const { result } = renderDrawer("txn_partner");
    expect(result.current.activeTab).toBe("partner");
  });

  it("chỉ gửi trường đã đổi khi lưu", async () => {
    updateTransaction.mockResolvedValue(TX);
    const { result } = renderDrawer();
    await waitFor(() => expect(result.current.draft).not.toBeNull());

    act(() => result.current.updateDraft("description", "mới"));
    expect(result.current.dirty).toBe(true);

    act(() => result.current.submit());
    await waitFor(() => expect(updateTransaction).toHaveBeenCalled());
    expect(updateTransaction).toHaveBeenCalledWith("t1", {
      note: "mới",
      cashflowClassification: null,
      cashflowPurpose: null,
    });
  });

  it("lập lịch lưu không có thay đổi thì không gọi PATCH", async () => {
    const { result } = renderDrawer();
    await waitFor(() => expect(result.current.draft).not.toBeNull());
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.saving).toBe(false));
    expect(updateTransaction).not.toHaveBeenCalled();
  });
});

describe("stepMessage", () => {
  const t = (key: string) => key;

  it("báo đúng bước lỗi và ghép thông điệp gốc của API", () => {
    const err = new CashTransactionSaveError(
      "POST",
      "Hạch toán không cân bằng",
    );
    expect(stepMessage(err, t)).toBe(
      "v2.bankStatements.cashDetail.error.post: Hạch toán không cân bằng",
    );
  });

  it("lỗi không rõ bước thì báo lỗi cập nhật thông tin", () => {
    expect(stepMessage(new Error("x"), t)).toBe(
      "v2.bankStatements.cashDetail.error.updateInfo",
    );
  });
});
