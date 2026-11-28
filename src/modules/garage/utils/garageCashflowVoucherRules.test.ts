import { describe, expect, it } from "vitest";
import {
  findGarageVoucherViolation,
  formatGarageVoucherViolation,
  type GarageVoucherRuleState,
} from "./garageCashflowVoucherRules";

// Cùng bảng ca với spec của API: garage-cashflow-voucher-rules.spec.ts
const receipt = (
  patch: GarageVoucherRuleState = {},
): GarageVoucherRuleState => ({
  voucherType: "RECEIPT",
  paymentStatus: "PAID",
  amount: 100000,
  paymentMethod: "Tiền mặt",
  paymentContent: "1. KH thanh toán",
  caseId: "case-1",
  ...patch,
});

const payment = (
  patch: GarageVoucherRuleState = {},
): GarageVoucherRuleState => ({
  voucherType: "PAYMENT",
  paymentStatus: "PAID",
  amount: 100000,
  paymentMethod: "Chuyển khoản khác",
  paymentContent: "9. Phụ tùng / vật tư",
  ...patch,
});

const code = (
  next: GarageVoucherRuleState,
  previous?: GarageVoucherRuleState,
) => findGarageVoucherViolation(next, previous)?.code ?? null;

describe("findGarageVoucherViolation", () => {
  it("chấp nhận phiếu thu và phiếu chi hợp lệ", () => {
    expect(code(receipt())).toBeNull();
    expect(code(payment())).toBeNull();
  });

  it.each([0, -1, undefined, null, "abc"])("chặn số tiền %s", (amount) => {
    expect(code(receipt({ amount }))).toBe("amount");
  });

  it("hủy phiếu thì bỏ qua mọi luật", () => {
    const old = receipt();
    expect(
      code({ ...old, amount: 0, paymentStatus: "CANCELLED" }, old),
    ).toBeNull();
  });

  it("phiếu đã thu chi bắt buộc phương thức và nội dung", () => {
    expect(code(receipt({ paymentMethod: " " }))).toBe("methodRequired");
    expect(code(receipt({ paymentStatus: null, paymentContent: null }))).toBe(
      "contentRequired",
    );
    const old = payment({ paymentContent: "" });
    expect(code({ ...old, note: "x" }, old)).toBe("contentRequired");
    expect(
      code(
        payment({
          paymentStatus: "PENDING",
          paymentMethod: null,
          paymentContent: null,
        }),
      ),
    ).toBeNull();
  });

  it("nội dung phải đúng loại phiếu", () => {
    expect(code(payment({ paymentContent: "3. BH thanh toán" }))).toBe(
      "contentType",
    );
    expect(code(receipt({ paymentContent: "4. HHBH" }))).toBe("contentType");
    expect(code(receipt({ paymentContent: "8. Cấn trừ" }))).toBeNull();
    expect(
      code(payment({ paymentContent: "8. Cấn trừ", caseId: "case-1" })),
    ).toBeNull();
  });

  it("giữ giá trị sai loại đang lưu cho tới khi đổi trạng thái", () => {
    const old = payment({
      paymentStatus: "PENDING",
      paymentContent: "3. BH thanh toán",
      caseId: "case-1",
    });
    expect(code({ ...old, note: "mới" }, old)).toBeNull();
    expect(code({ ...old, paymentStatus: "PAID" }, old)).toBe("contentType");
  });

  it("giữ nhãn chi cũ khi đổi trạng thái, không cho chọn mới", () => {
    const old = payment({
      paymentStatus: "PENDING",
      paymentContent: "6. HH Thưởng",
    });
    expect(code({ ...old, paymentStatus: "PAID" }, old)).toBeNull();
    expect(code(payment({ paymentContent: "6. HH Thưởng" }))).toBe(
      "contentType",
    );
  });

  it("nội dung dự thu chỉ hợp lệ khi còn EXPECTED", () => {
    const expected = receipt({
      paymentStatus: "EXPECTED",
      paymentContent: "Dự thu hoàn tất phiếu dịch vụ",
    });
    expect(code({ ...expected, amount: 200000 }, expected)).toBeNull();
    expect(code({ ...expected, paymentStatus: "PAID" }, expected)).toBe(
      "contentType",
    );
    const legacy = { ...expected, paymentStatus: null };
    expect(
      code({ ...legacy, paymentStatus: "PAID", note: "x" }, legacy),
    ).toBeNull();
  });

  it("chặn phương thức lạ khi nhập mới, giữ giá trị cũ không đổi", () => {
    expect(code(receipt({ paymentMethod: "Ví điện tử" }))).toBe(
      "methodInvalid",
    );
    const old = receipt({ paymentMethod: "Quẹt thẻ" });
    expect(code({ ...old, note: "x" }, old)).toBeNull();
  });

  it.each(["1. KH thanh toán", "3. BH thanh toán", "8. Cấn trừ"])(
    "%s không có phiếu dịch vụ thì cần lý do",
    (paymentContent) => {
      expect(code(receipt({ paymentContent, caseId: null, note: "  " }))).toBe(
        "caseRequired",
      );
    },
  );

  it("liên kết phiếu dịch vụ: ghi lý do, bỏ liên kết, phiếu cũ", () => {
    expect(code(receipt({ caseId: null, note: "Khách trả gộp" }))).toBeNull();
    const linked = receipt();
    expect(code({ ...linked, caseId: null }, linked)).toBe("caseRequired");
    const old = receipt({ caseId: null });
    expect(code({ ...old, amount: 200000 }, old)).toBeNull();
    expect(
      code(receipt({ paymentContent: "2. Tất toán", caseId: null })),
    ).toBeNull();
  });

  it("thông báo chèn được nội dung đang chọn", () => {
    expect(
      formatGarageVoucherViolation(
        { code: "caseRequired", content: "8. Cấn trừ" },
        (_key, options) => options?.defaultValue ?? "",
      ),
    ).toContain('"8. Cấn trừ" cần gắn phiếu dịch vụ');
  });
});
