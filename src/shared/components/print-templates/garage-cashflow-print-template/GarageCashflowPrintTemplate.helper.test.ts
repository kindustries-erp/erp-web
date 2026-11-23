import { describe, it, expect } from "vitest";
import {
  buildGarageCashflowPrintData,
  buildGarageCashflowPrintReason,
} from "./GarageCashflowPrintTemplate.helper";

const baseSource = {
  voucherCode: "PT-GARA-001",
  voucherType: "RECEIPT" as const,
  transDate: "2026-08-26",
  amount: 600000000,
  partnerName: "LỤC NGỌC HẢI",
};

describe("buildGarageCashflowPrintData", () => {
  it("maps core fields and reads amount in words", () => {
    const data = buildGarageCashflowPrintData(baseSource);

    expect(data.variant).toBe("RECEIPT");
    expect(data.voucherCode).toBe("PT-GARA-001");
    expect(data.partyName).toBe("LỤC NGỌC HẢI");
    expect(data.amount).toBe(600000000);
    expect(data.amountInWords).toMatch(/đồng$/);
    expect(data.amountInWords.charAt(0)).toBe("S");
  });

  it("falls back to case customer name when partnerName is missing", () => {
    const data = buildGarageCashflowPrintData({
      ...baseSource,
      partnerName: null,
      case: { khachHangName: "Nguyễn Văn A" },
    });

    expect(data.partyName).toBe("Nguyễn Văn A");
  });

  it("keeps party address blank when voucher has no address", () => {
    const data = buildGarageCashflowPrintData(baseSource);
    expect(data.partyAddress).toBe("");
  });
});

describe("buildGarageCashflowPrintReason", () => {
  it("appends license plate from voucher", () => {
    expect(
      buildGarageCashflowPrintReason({
        ...baseSource,
        paymentContent: "Thanh toán tiền mua xe",
        licensePlate: "67A-228.92",
      }),
    ).toBe("Thanh toán tiền mua xe - Biển số: 67A-228.92");
  });

  it("falls back to case license plate", () => {
    expect(
      buildGarageCashflowPrintReason({
        ...baseSource,
        paymentContent: "Thu tiền dịch vụ",
        case: { bienSoXe: "51A-888.88" },
      }),
    ).toBe("Thu tiền dịch vụ - Biển số: 51A-888.88");
  });

  it("returns empty string when there is no content", () => {
    expect(buildGarageCashflowPrintReason(baseSource)).toBe("");
  });

  it("strips leading numeric bullet from payment content", () => {
    expect(
      buildGarageCashflowPrintReason({
        ...baseSource,
        paymentContent: "6. HH Xưởng",
        licensePlate: "51A-888.88",
      }),
    ).toBe("HH Xưởng - Biển số: 51A-888.88");
  });
});
