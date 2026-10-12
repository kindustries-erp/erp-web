import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowDrawer } from "./GarageCashflowDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { garageCashflowApi } from "../../../api/garageCashflowApi";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

export const mockCreateMutate = vi.fn();
export const mockUpdateMutate = vi.fn();

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("../../../api/garageCashflowApi", () => ({
  garageCashflowApi: { checkDuplicates: vi.fn() },
}));

vi.mock("../../../hooks/useGarageCashflowList", () => ({
  useGarageCashflowList: () => ({
    createMutation: { mutate: mockCreateMutate, isPending: false },
    updateMutation: { mutate: mockUpdateMutate, isPending: false },
  }),
}));

// Mock sub-comboboxes
vi.mock("../garage-case-combobox", () => ({
  GarageCaseCombobox: () => <div data-testid="mock-case-combobox" />,
  renderGarageCaseTooltipContent: vi.fn(() => <div>mock-tooltip</div>),
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

  it("sanitizes payload and excludes nested case and rawData when updating voucher", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    const voucherWithHeavyCase: any = {
      id: "voucher-heavy-1",
      voucherCode: "PT-GARA-261012-984",
      voucherType: "RECEIPT",
      amount: 10000000,
      transDate: "2026-10-12",
      partnerName: "Anh Dũng",
      partnerPhone: "0987654321",
      licensePlate: "3UR-3168658",
      note: "CIF:26985202",
      paymentMethod: "Chuyển khoản",
      caseId: "704a0916-3e78-4f93-be03-98461447c409",
      createdAt: "2026-10-12T10:10:00.966Z",
      updatedAt: "2026-10-12T10:10:00.966Z",
      case: {
        id: "704a0916-3e78-4f93-be03-98461447c409",
        soChungTu: "GR-PDV2610-0001",
        rawData: {
          ListPhieuDichVuChiTiet: Array(30).fill({ item: "Phụ tùng nặng" }),
        },
      },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowDrawer
          open={true}
          onClose={vi.fn()}
          voucher={voucherWithHeavyCase}
          initialMode="edit"
        />
      </QueryClientProvider>,
    );

    const saveButton = screen.getByText("Lưu");
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);

    expect(mockUpdateMutate).toHaveBeenCalledTimes(1);
    const calledArg = mockUpdateMutate.mock.calls[0][0];
    expect(calledArg.id).toBe("voucher-heavy-1");
    expect(calledArg.data).toEqual({
      voucherType: "RECEIPT",
      amount: 10000000,
      transDate: "2026-10-12",
      partnerName: "Anh Dũng",
      partnerPhone: "0987654321",
      licensePlate: "3UR-3168658",
      note: "CIF:26985202",
      paymentMethod: "Chuyển khoản",
      caseId: "704a0916-3e78-4f93-be03-98461447c409",
      referenceNumber: undefined,
      erpBankTransactionId: undefined,
      erpCashVoucherId: undefined,
    });
    // Tuyệt đối không chứa trường case hoặc rawData
    expect(calledArg.data.case).toBeUndefined();
    expect(calledArg.data.rawData).toBeUndefined();
    expect(calledArg.data.id).toBeUndefined();
  });

  describe("duplicate warning", () => {
    const empty = { items: [], total: 0 };
    const dup = {
      nearbyDate: {
        items: [
          {
            id: "d1",
            voucherCode: "PT-DUP-1",
            voucherType: "RECEIPT",
            amount: 2200000,
            transDate: "2026-10-07",
          },
        ],
        total: 1,
      },
      sameCase: empty,
      samePlate: empty,
    };

    const renderCreate = (amount: number) => {
      vi.mocked(useHasPermission).mockReturnValue(true);
      const voucher: any = {
        id: "tpl",
        voucherCode: "X",
        voucherType: "RECEIPT",
        transDate: "2026-10-12",
        amount,
      };
      return render(
        <QueryClientProvider client={queryClient}>
          <GarageCashflowDrawer
            open={true}
            onClose={vi.fn()}
            voucher={voucher}
            initialMode="create"
          />
        </QueryClientProvider>,
      );
    };

    it("asks for confirmation on create when a duplicate exists", async () => {
      vi.mocked(garageCashflowApi.checkDuplicates).mockResolvedValue(
        dup as any,
      );
      renderCreate(2200000);
      fireEvent.click(screen.getByText("Lưu"));
      expect(await screen.findByText(/PT-DUP-1/)).toBeInTheDocument();
      expect(mockCreateMutate).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText("Vẫn nhập tiếp"));
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
    });

    it("keeps the form and does not save when user goes back", async () => {
      vi.mocked(garageCashflowApi.checkDuplicates).mockResolvedValue(
        dup as any,
      );
      renderCreate(2200000);
      fireEvent.click(screen.getByText("Lưu"));
      await screen.findByText(/PT-DUP-1/);
      fireEvent.click(screen.getByText("Quay lại sửa"));
      expect(mockCreateMutate).not.toHaveBeenCalled();
      expect(screen.queryByText(/PT-DUP-1/)).not.toBeInTheDocument();
    });

    it("saves directly when nothing matches", async () => {
      vi.mocked(garageCashflowApi.checkDuplicates).mockResolvedValue({
        nearbyDate: empty,
        sameCase: empty,
        samePlate: empty,
      } as any);
      renderCreate(2200000);
      fireEvent.click(screen.getByText("Lưu"));
      await vi.waitFor(() => expect(mockCreateMutate).toHaveBeenCalledTimes(1));
    });
  });
});
