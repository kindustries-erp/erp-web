import { describe, expect, it } from "vitest";
import { resolveBankBin } from "./resolveBankBin";

describe("resolveBankBin", () => {
  it("khớp theo mã viết tắt, không phân biệt hoa thường", () => {
    expect(resolveBankBin({ bankCode: "VCB" })?.bin).toBe("970436");
    expect(resolveBankBin({ bankCode: " tcb " })?.bin).toBe("970407");
  });

  it("khớp theo tên gọi khác và tên đầy đủ", () => {
    expect(resolveBankBin({ bankName: "Vietcombank" })?.code).toBe("VCB");
    expect(
      resolveBankBin({
        bankName: "Ngân hàng TMCP Kỹ thương Việt Nam",
      })?.code,
    ).toBe("TCB");
  });

  it("ưu tiên mã viết tắt, dùng tên khi mã không khớp", () => {
    expect(resolveBankBin({ bankCode: "XYZ", bankName: "BIDV" })?.code).toBe(
      "BIDV",
    );
  });

  it("khớp mờ theo alias dài nhất, không nhầm Saigonbank với SCB", () => {
    expect(
      resolveBankBin({
        bankName: "Ngân hàng TMCP Sài Gòn Công Thương",
      })?.code,
    ).toBe("SGICB");
    expect(resolveBankBin({ bankName: "Sai gon" })?.code).toBe("SCB");
    expect(
      resolveBankBin({ bankName: "Ngân hàng TMCP Sài Gòn Thương Tín" })?.code,
    ).toBe("STB");
  });

  it("trả null khi không khớp", () => {
    expect(
      resolveBankBin({ bankCode: "XYZ", bankName: "Ngân hàng lạ" }),
    ).toBeNull();
    expect(resolveBankBin({})).toBeNull();
  });
});
