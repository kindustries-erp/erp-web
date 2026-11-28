import { describe, expect, it } from "vitest";
import { getVoucherPartnerName } from "./garageCashflowPartner";

const linked = { case: { khachHangName: "Khách PDV" } };

describe("getVoucherPartnerName", () => {
  it("phiếu thu trống đối tác lấy tên khách của phiếu dịch vụ", () => {
    expect(getVoucherPartnerName({ ...linked, voucherType: "RECEIPT" })).toBe(
      "Khách PDV",
    );
  });

  it("phiếu chi không bao giờ suy từ khách hàng", () => {
    expect(getVoucherPartnerName({ ...linked, voucherType: "PAYMENT" })).toBe(
      "",
    );
  });

  it("đối tác đã lưu được giữ ở cả hai loại", () => {
    expect(
      getVoucherPartnerName({
        ...linked,
        voucherType: "PAYMENT",
        partnerName: "NCC A",
      }),
    ).toBe("NCC A");
  });
});
