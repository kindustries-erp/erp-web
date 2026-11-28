import { describe, expect, it } from "vitest";
import {
  applyFieldChange,
  findFormViolation,
} from "./garageCashflowDrawer.rules";
import { buildPaymentFieldConfigs } from "./garageCashflowDrawer.paymentFields";
import { buildUpdatePayload } from "./GarageCashflowDrawer.state";

const t = (_key: string, fallback?: string) => fallback ?? "";
const fieldsOf = (formData: any, voucher: any = null) => {
  const [method, content] = buildPaymentFieldConfigs(formData, voucher, t);
  return { method: method as any, content: content as any };
};
const values = (field: any) => field.options.map((o: any) => o.value);

describe("form phiếu thu chi: luật theo loại phiếu", () => {
  it("đổi loại phiếu thì bỏ nội dung sai loại, giữ nội dung dùng chung", () => {
    const base = {
      voucherType: "RECEIPT" as const,
      paymentContent: "3. BH thanh toán",
    };
    expect(applyFieldChange(base, "voucherType", "PAYMENT")).toMatchObject({
      paymentContent: "",
      paymentStatus: "PENDING",
    });
    expect(
      applyFieldChange(
        { ...base, paymentContent: "8. Cấn trừ" },
        "voucherType",
        "PAYMENT",
      ).paymentContent,
    ).toBe("8. Cấn trừ");
  });

  it("lựa chọn nội dung theo loại, vẫn hiện giá trị cũ sai loại kèm cảnh báo", () => {
    const { content } = fieldsOf({
      voucherType: "PAYMENT",
      paymentContent: "3. BH thanh toán",
    });
    expect(values(content)).toContain("9. Phụ tùng / vật tư");
    expect(values(content)).not.toContain("1. KH thanh toán");
    expect(values(content)).toContain("3. BH thanh toán");
    expect(content.helperText).toContain("không đúng loại phiếu");
  });

  it("chỉ phiếu đã thu chi mới đánh dấu bắt buộc phương thức, nội dung", () => {
    expect(
      fieldsOf({ voucherType: "RECEIPT", paymentStatus: "PAID" }).method
        .required,
    ).toBe(true);
    expect(
      fieldsOf({ voucherType: "PAYMENT", paymentStatus: "PENDING" }).content
        .required,
    ).toBe(false);
  });

  it("nhắc ghi lý do khi thiếu phiếu dịch vụ, cảnh báo phương thức cũ", () => {
    const { method, content } = fieldsOf({
      voucherType: "RECEIPT",
      paymentContent: "1. KH thanh toán",
      paymentMethod: "Quẹt thẻ",
    });
    expect(content.helperText).toContain("ghi lý do");
    expect(method.helperText).toContain("không còn trong danh sách");
    expect(values(method)).toContain("Quẹt thẻ");
  });

  it("kiểm vi phạm theo trạng thái mặc định của payload", () => {
    expect(
      findFormViolation({ voucherType: "RECEIPT", amount: 1000 })?.code,
    ).toBe("methodRequired");
    expect(
      findFormViolation({ voucherType: "PAYMENT", amount: 1000 }),
    ).toBeNull();
  });

  it("gửi null cho trường người dùng đã xóa, không gửi null cho trường vốn trống", () => {
    const stored: any = {
      note: "cũ",
      paymentContent: "13. Khác",
      caseId: "case-1",
    };
    const payload = buildUpdatePayload(
      { voucherType: "PAYMENT", amount: 1000 },
      stored,
    );
    expect(payload).toMatchObject({
      note: null,
      paymentContent: null,
      caseId: null,
    });
    expect(payload.paymentMethod).toBeUndefined();
  });

  it("đổi thu sang chi thì bỏ tên khách tự điền, giữ tên tự gõ", () => {
    const auto = {
      voucherType: "RECEIPT" as const,
      partnerName: "Khách PDV",
      autoPartnerName: "Khách PDV",
    };
    const asPayment = applyFieldChange(auto, "voucherType", "PAYMENT");
    expect(asPayment.partnerName).toBe("");
    expect(
      applyFieldChange(asPayment, "voucherType", "RECEIPT").partnerName,
    ).toBe("Khách PDV");
    expect(
      applyFieldChange(
        { ...auto, partnerName: "NCC A" },
        "voucherType",
        "PAYMENT",
      ).partnerName,
    ).toBe("NCC A");
  });
});
