// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateCashTransactionDrawer } from "../CreateCashTransactionDrawer";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector: (s: { currentBranchId: string }) => unknown) =>
    selector({ currentBranchId: "branch-stale" }),
}));

vi.mock("@/shared/components/DrawerModal", () => ({
  DrawerModal: ({ open, title, children }: any) =>
    open ? (
      <div data-testid="drawer">
        <h1>{title}</h1>
        {children}
      </div>
    ) : null,
  DrawerSection: ({ children }: any) => <section>{children}</section>,
  DrawerField: ({ label, children }: any) => (
    <label>
      {label}
      {children}
    </label>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange }: any) => (
    <input
      aria-label="date"
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getCashBooks: vi.fn(),
    createManualTransaction: vi.fn(),
  },
}));

const renderDrawer = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateCashTransactionDrawer
        isOpen
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    </QueryClientProvider>,
  );
};

describe("CreateCashTransactionDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (bankStatementApi.getCashBooks as any).mockResolvedValue([
      {
        id: "cb-dt",
        name: "Quỹ ĐT",
        branchId: "branch-dt",
      },
    ]);
    (bankStatementApi.createManualTransaction as any).mockResolvedValue({
      id: "txn-new",
    });
  });

  it("gửi branchId của sổ quỹ đã chọn thay vì currentBranchId đã cũ", async () => {
    renderDrawer();

    const select = await screen.findByRole("combobox");
    await waitFor(() => expect(screen.getByText("Quỹ ĐT")).toBeInTheDocument());
    fireEvent.change(select, { target: { value: "cb-dt" } });
    fireEvent.change(screen.getByLabelText("date"), {
      target: { value: "2026-10-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() =>
      expect(bankStatementApi.createManualTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: "branch-dt",
          sourceType: "CASH",
          cashBookId: "cb-dt",
          transDate: "2026-10-01",
        }),
      ),
    );
  });
});
