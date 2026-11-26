import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useGarageCashflowPaymentQr } from "./useGarageCashflowPaymentQr";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

/** Hook cùng state form thật, như drawer. */
function useWithForm(
  voucher: GarageCashflowVoucher | null,
  readOnly: boolean,
  initial: Partial<CreateGarageCashflowVoucherDto> = {},
) {
  const [formData, setFormData] = useState(initial);
  const qr = useGarageCashflowPaymentQr({
    voucher,
    formData,
    setFormData,
    readOnly,
  });
  return { qr, formData, setFormData };
}

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

  it("payment voucher in edit mode writes bank info into formData", async () => {
    const { result } = renderHook(() => useWithForm(mockPaymentVoucher, false));

    expect(result.current.qr.isReceipt).toBe(false);
    expect(result.current.qr.amount).toBe(2500000);
    expect(result.current.qr.content).toBe("PC-2026-002");

    act(() => result.current.qr.handleSelectPartnerBank("970418"));
    act(() => result.current.qr.setAccountNumber("0987654321"));

    expect(result.current.qr.bin).toBe("970418");
    expect(result.current.qr.accountNumber).toBe("0987654321");
    expect(result.current.formData).toMatchObject({
      qrBankBin: "970418",
      qrBankCode: "BIDV",
      qrAccountNumber: "0987654321",
    });
    // Nội dung CK chỉ lưu khi người dùng tự sửa.
    expect(result.current.formData.qrTransferContent).toBeUndefined();

    await waitFor(() => {
      expect(result.current.qr.qrDataUrl).toBeTruthy();
    });
  });

  it("read-only mode ignores edits and does not touch formData", () => {
    const { result } = renderHook(() => useWithForm(mockPaymentVoucher, true));

    act(() => result.current.qr.setAccountNumber("0987654321"));

    expect(result.current.qr.readOnly).toBe(true);
    expect(result.current.qr.accountNumber).toBe("");
    expect(result.current.formData).toEqual({});
  });

  it("uses saved payment info from the voucher", () => {
    const { result } = renderHook(() =>
      useWithForm(
        {
          ...mockPaymentVoucher,
          qrBankBin: "970407",
          qrBankCode: "TCB",
          qrAccountNumber: "111222",
          qrTransferContent: "ND da luu",
        },
        true,
      ),
    );
    expect(result.current.qr.bin).toBe("970407");
    expect(result.current.qr.accountNumber).toBe("111222");
    expect(result.current.qr.content).toBe("ND da luu");
  });

  it("new receipt seeds default company account into formData", async () => {
    const { result } = renderHook(() =>
      useWithForm(null, false, { voucherType: "RECEIPT", amount: 100000 }),
    );
    await waitFor(() => {
      expect(result.current.formData.qrCompanyAccountId).toBe("acc-1");
    });
    expect(result.current.formData.qrAccountNumber).toBe("1240000123456");
  });

  it("new voucher switching RECEIPT -> PAYMENT drops the company account", async () => {
    const { result } = renderHook(() =>
      useWithForm(null, false, { voucherType: "RECEIPT", amount: 100000 }),
    );
    await waitFor(() =>
      expect(result.current.formData.qrCompanyAccountId).toBe("acc-1"),
    );
    act(() =>
      result.current.setFormData((p) => ({ ...p, voucherType: "PAYMENT" })),
    );
    await waitFor(() => expect(result.current.qr.isReceipt).toBe(false));
    expect(result.current.qr.bin).toBeNull();
    expect(result.current.qr.accountNumber).toBe("");
    expect(result.current.formData.qrAccountNumber).toBeNull();

    act(() =>
      result.current.setFormData((p) => ({ ...p, voucherType: "RECEIPT" })),
    );
    await waitFor(() =>
      expect(result.current.formData.qrCompanyAccountId).toBe("acc-1"),
    );
  });

  it("normalizes separators and flags an invalid account number", () => {
    const { result } = renderHook(() => useWithForm(mockPaymentVoucher, false));
    act(() => result.current.qr.setAccountNumber("0987 654-321"));
    expect(result.current.formData.qrAccountNumber).toBe("0987654321");
    expect(result.current.qr.accountNumberInvalid).toBe(false);

    act(() => result.current.qr.setAccountNumber("0987/654"));
    expect(result.current.qr.accountNumberInvalid).toBe(true);
  });

  it("two edits in one batch both apply (computed from latest form)", () => {
    const { result } = renderHook(() => useWithForm(mockPaymentVoucher, false));
    act(() => {
      result.current.qr.handleSelectPartnerBank("970418");
      result.current.qr.setAccountNumber("123456");
    });
    expect(result.current.formData).toMatchObject({
      qrBankBin: "970418",
      qrAccountNumber: "123456",
    });
  });

  it("transfer content keeps following the voucher until edited", async () => {
    const { result } = renderHook(() =>
      useWithForm(null, false, {
        voucherType: "RECEIPT",
        voucherCode: "PT-1",
        amount: 100000,
      }),
    );
    await waitFor(() =>
      expect(result.current.formData.qrCompanyAccountId).toBe("acc-1"),
    );
    act(() =>
      result.current.setFormData((p) => ({ ...p, licensePlate: "51A12345" })),
    );
    expect(result.current.qr.content).toBe("PT-1 51A12345");

    act(() => result.current.qr.setContent("ND rieng"));
    act(() =>
      result.current.setFormData((p) => ({ ...p, licensePlate: "99Z99999" })),
    );
    expect(result.current.qr.content).toBe("ND rieng");
  });
});
