import { describe, expect, it } from "vitest";
import { toTransferQrAccountOptions } from "./transferQrBankStatements.config";

describe("toTransferQrAccountOptions", () => {
  it("khớp BIN từ mã viết tắt hoặc tên ngân hàng tự do", () => {
    const [byCode, byName, unknown] = toTransferQrAccountOptions([
      {
        id: "a1",
        bankCode: "VCB",
        bankName: "",
        accountNumber: "123",
        accountName: "CONG TY",
      },
      {
        id: "a2",
        bankCode: "",
        bankName: "Techcombank",
        accountNumber: "456",
        accountName: "CONG TY",
      },
      {
        id: "a3",
        bankCode: "XYZ",
        bankName: "Ngân hàng lạ",
        accountNumber: "789",
        accountName: "CONG TY",
      },
    ]);
    expect(byCode).toMatchObject({
      bankCode: "VCB",
      bin: "970436",
      label: "VCB - 123",
    });
    expect(byName).toMatchObject({ bankCode: "TCB", bin: "970407" });
    expect(unknown).toMatchObject({ bankCode: "XYZ", bin: null });
  });
});
