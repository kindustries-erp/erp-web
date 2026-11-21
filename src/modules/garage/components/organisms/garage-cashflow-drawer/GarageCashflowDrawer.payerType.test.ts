import { describe, expect, it } from "vitest";
import {
  buildCreatePayload,
  buildInitialFormData,
  buildUpdatePayload,
} from "./GarageCashflowDrawer.state";
import { buildSettlementFieldConfigs } from "./garageCashflowDrawer.settlementFields";
import { GarageCashflowFieldKey } from "./garageCashflowDrawer.enum";

const t = (_key: string, fallback?: string) => fallback ?? _key;

describe("payerType của phiếu thu", () => {
  it("gửi payerType khi là phiếu thu gắn phiếu dịch vụ và đã chọn bên", () => {
    const form = {
      voucherType: "RECEIPT" as const,
      amount: 100,
      caseId: "case-1",
      payerType: "BH" as const,
    };
    expect(buildCreatePayload(form).payerType).toBe("BH");
    expect(buildUpdatePayload(form).payerType).toBe("BH");
  });

  it("không chọn thì không gửi để API tự gán", () => {
    const form = {
      voucherType: "RECEIPT" as const,
      amount: 100,
      caseId: "case-1",
    };
    expect(buildCreatePayload(form).payerType).toBeUndefined();
    expect(buildUpdatePayload(form).payerType).toBeUndefined();
  });

  it("không gửi cho phiếu chi hoặc phiếu chưa gắn phiếu dịch vụ", () => {
    expect(
      buildCreatePayload({
        voucherType: "PAYMENT",
        amount: 1,
        caseId: "case-1",
        payerType: "BH",
      }).payerType,
    ).toBeUndefined();
    expect(
      buildCreatePayload({
        voucherType: "RECEIPT",
        amount: 1,
        payerType: "BH",
      }).payerType,
    ).toBeUndefined();
  });

  it("form khi sửa lấy payerType đã lưu từ phiếu", () => {
    const form = buildInitialFormData({
      id: "v1",
      voucherCode: "PT-1",
      voucherType: "RECEIPT",
      amount: 1,
      caseId: "case-1",
      payerType: "BH",
      createdAt: "",
      updatedAt: "",
      transDate: "2026-10-05",
    });
    expect(form.payerType).toBe("BH");
  });

  describe("field Bên thanh toán (hiện khi sửa; payload chỉ gửi khi có phiếu dịch vụ)", () => {
    const field = buildSettlementFieldConfigs({ voucher: null, t }).find(
      (f) => f.name === GarageCashflowFieldKey.PAYER_TYPE,
    )!;

    it("hiện ở chế độ sửa cho mọi phiếu thu, ẩn với phiếu chi", () => {
      expect(field.visible?.({ voucherType: "RECEIPT" }, "edit")).toBe(true);
      expect(
        field.visible?.({ voucherType: "PAYMENT", caseId: "case-1" }, "edit"),
      ).toBe(false);
    });

    it("chế độ xem chỉ hiện khi đã có payerType", () => {
      expect(
        field.visible?.({ voucherType: "RECEIPT", caseId: "c" }, "view"),
      ).toBe(false);
      expect(
        field.visible?.(
          { voucherType: "RECEIPT", caseId: "c", payerType: "BH" },
          "view",
        ),
      ).toBe(true);
    });
  });
});
