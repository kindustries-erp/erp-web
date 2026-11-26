import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGarageCashflowPaymentQr } from "./useGarageCashflowPaymentQr";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

vi.mock("@/core/api/companyProfileApi", () => ({
  useCompanyProfile: () => ({
    data: { company_name: "CÔNG TY TNHH BLUEWAY", short_name: "BLUEWAY" },
  }),
}));

vi.mock(
  "@/v2/modules/transfer-qr-bank-statements/hooks/useBanksCatalog",
  () => ({
    useBanksCatalog: () => ({
      bankOptions: [
        {
          label: "BIDV - Ngan hang TMCP Dau tu va Phat trien Viet Nam",
          value: "970418",
        },
        { label: "TCB - Ngan hang TMCP Ky thuong Viet Nam", value: "970407" },
      ],
      onScrollBottom: vi.fn(),
      onSearchChange: vi.fn(),
      loading: false,
    }),
  }),
);

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: [
        {
          id: "acc-1",
          bankName: "BIDV",
          accountNumber: "1240000123456",
          accountName: "CTY TNHH BLUEWAY",
          isDefault: true,
        },
      ],
      isLoading: false,
    })),
  };
});

const mockReceiptVoucher: GarageCashflowVoucher = {
  id: "v-1",
  voucherCode: "PT-2026-001",
  voucherType: "RECEIPT",
  transDate: "2026-11-26",
  amount: 5000000,
  licensePlate: "30A-123.45",
  partnerName: "Khách hàng A",
  paymentStatus: "PENDING",
  createdAt: "2026-11-26T00:00:00Z",
  updatedAt: "2026-11-26T00:00:00Z",
};

const mockPaymentVoucher: GarageCashflowVoucher = {
  id: "v-2",
  voucherCode: "PC-2026-002",
  voucherType: "PAYMENT",
  transDate: "2026-11-26",
  amount: 2500000,
  partnerName: "Nhà cung cấp B",
  paymentStatus: "PENDING",
  createdAt: "2026-11-26T00:00:00Z",
  updatedAt: "2026-11-26T00:00:00Z",
};

describe("useGarageCashflowPaymentQr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes receipt voucher with company account and generates QR", async () => {
    const { result } = renderHook(() =>
      useGarageCashflowPaymentQr({
        voucher: mockReceiptVoucher,
        formData: {},
      }),
    );

    expect(result.current.isReceipt).toBe(true);
    expect(result.current.amount).toBe(5000000);
    expect(result.current.content).toContain("PT-2026-001 30A-123.45");

    await waitFor(() => {
      expect(result.current.qrDataUrl).toBeTruthy();
    });
  });

  it("initializes payment voucher with partner fields and allows updating STK", async () => {
    const { result } = renderHook(() =>
      useGarageCashflowPaymentQr({
        voucher: mockPaymentVoucher,
        formData: {},
      }),
    );

    expect(result.current.isReceipt).toBe(false);
    expect(result.current.amount).toBe(2500000);
    expect(result.current.content).toBe("PC-2026-002");

    act(() => {
      result.current.handleSelectPartnerBank("970418");
      result.current.setAccountNumber("0987654321");
    });

    expect(result.current.bin).toBe("970418");
    expect(result.current.accountNumber).toBe("0987654321");

    await waitFor(() => {
      expect(result.current.qrDataUrl).toBeTruthy();
    });
  });
});
