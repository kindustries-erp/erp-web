import { describe, expect, it } from "vitest";
import {
  toPartnerOptionValue,
  toPartnerSelectionPayload,
} from "./partnerSelection";

describe("partnerSelection", () => {
  it("encodes a master partner by id", () => {
    expect(
      toPartnerOptionValue({
        partnerId: "p-1",
        name: "ABC",
        taxCode: "0100",
        source: "MASTER",
      }),
    ).toBe("master:p-1");
  });

  it("encodes an invoice-only partner by tax code and name", () => {
    expect(
      toPartnerOptionValue({
        partnerId: null,
        name: "Công ty: XYZ",
        taxCode: "0200",
        source: "INVOICE",
      }),
    ).toBe("invoice:0200:Công ty: XYZ");
  });

  it("maps a master selection to partnerId and clearing to null", () => {
    expect(toPartnerSelectionPayload("master:p-1", "OUT")).toEqual({
      partnerId: "p-1",
    });
    expect(toPartnerSelectionPayload(null, "IN")).toEqual({ partnerId: null });
  });

  it("maps an invoice selection to invoicePartner with partner type by direction", () => {
    // Tiền thu (OUT): người mua là khách hàng
    expect(
      toPartnerSelectionPayload("invoice:0200:Công ty: XYZ", "OUT"),
    ).toEqual({
      invoicePartner: {
        taxCode: "0200",
        name: "Công ty: XYZ",
        partnerType: "CUSTOMER",
      },
    });
    // Tiền chi (IN): người bán là nhà cung cấp
    expect(toPartnerSelectionPayload("invoice::Khách lẻ", "IN")).toEqual({
      invoicePartner: {
        taxCode: null,
        name: "Khách lẻ",
        partnerType: "VENDOR",
      },
    });
  });

  it("round-trips an invoice option through encode and decode", () => {
    const value = toPartnerOptionValue({
      partnerId: null,
      name: "A: B",
      taxCode: "0300",
      source: "INVOICE",
    });
    expect(toPartnerSelectionPayload(value, "IN")).toEqual({
      invoicePartner: { taxCode: "0300", name: "A: B", partnerType: "VENDOR" },
    });
  });
});
