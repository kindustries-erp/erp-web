import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowDrawer } from "./GarageCashflowDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("../../../hooks/useGarageCashflowList", () => ({
  useGarageCashflowList: () => ({
    createMutation: { mutate: vi.fn(), isPending: false },
    updateMutation: { mutate: vi.fn(), isPending: false },
  }),
}));

// Mock sub-comboboxes
vi.mock("../garage-case-combobox", () => ({
  GarageCaseCombobox: () => <div data-testid="mock-case-combobox" />,
}));
vi.mock("../erp-bank-transaction-combobox", () => ({
  ErpBankTransactionCombobox: () => <div data-testid="mock-bank-combobox" />,
}));
vi.mock("../erp-cash-voucher-combobox", () => ({
  ErpCashVoucherCombobox: () => <div data-testid="mock-cash-combobox" />,
}));
vi.mock("../../molecules/payment-method-combobox", () => ({
  PaymentMethodCombobox: () => <div data-testid="mock-pm-combobox" />,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const sampleVoucher: any = {
  id: "voucher-1",
  voucherCode: "PT-GARA-261011-001",
  voucherType: "RECEIPT",
  transDate: "2026-10-11",
  amount: 5000000,
  partnerName: "Nguyễn Văn A",
  partnerPhone: "0901234567",
  licensePlate: "51A-999.99",
  note: "Thu tiền dịch vụ",
};

describe("GarageCashflowDrawer Organism", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders voucher details in view mode with license plate", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowDrawer
          open={true}
          onClose={vi.fn()}
          voucher={sampleVoucher}
          initialMode="view"
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Phiếu PT-GARA-261011-001")).toBeInTheDocument();
    expect(screen.getByText("THÔNG TIN CHUNG")).toBeInTheDocument();
    expect(screen.getByText("THAM CHIẾU LIÊN KẾT")).toBeInTheDocument();
    expect(screen.getByText("51A-999.99")).toBeInTheDocument();
    expect(screen.getByText("Biển số xe")).toBeInTheDocument();
  });

  it("hides Save button when user lacks CREATE permission in create mode", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (res: string, action?: string) => {
        if (
          res === ErpResource.GARAGE_CASHFLOW &&
          action === ErpAction.CREATE
        ) {
          return false;
        }
        return true;
      },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowDrawer
          open={true}
          onClose={vi.fn()}
          voucher={null}
          initialMode="create"
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Tạo Phiếu Thu Chi Mới")).toBeInTheDocument();
    expect(screen.queryByText("Lưu")).not.toBeInTheDocument();
  });

  it("shows Save button when user has CREATE permission in create mode", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowDrawer
          open={true}
          onClose={vi.fn()}
          voucher={null}
          initialMode="create"
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Tạo Phiếu Thu Chi Mới")).toBeInTheDocument();
    expect(screen.getByText("Lưu")).toBeInTheDocument();
  });
});
