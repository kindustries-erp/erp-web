import { describe, expect, it } from "vitest";
import { MAX_BATCH_ROWS } from "./batchRows";
import { parseAmountCell, parsePastedRows } from "./parsePastedRows";

const HEADER = "Ngân hàng\tSố tài khoản\tTên chủ tài khoản\tSố tiền\tNội dung";

describe("parsePastedRows", () => {
  it("đọc đúng các cột theo thứ tự cố định và khớp BIN từ mã ngân hàng", () => {
    const { rows, skippedHeader, truncated } = parsePastedRows(
      "VCB\t0123456789\tNGUYEN VAN A\t1.500.000\tHD001/2025",
    );
    expect(skippedHeader).toBe(false);
    expect(truncated).toBe(false);
    expect(rows).toEqual([
      {
        bin: "970436",
        bankCode: "VCB",
        accountNumber: "0123456789",
        accountName: "NGUYEN VAN A",
        amount: 1500000,
        amountInvalid: false,
        content: "HD001/2025",
      },
    ]);
  });

  it("bỏ dòng tiêu đề và dòng trống, chấp nhận \\r\\n", () => {
    const text = `${HEADER}\r\n\r\nVCB\t0123456789\tA\t100\tx\r\n\r\nTCB\t19011\tB\t200\ty\r\n`;
    const { rows, skippedHeader } = parsePastedRows(text);
    expect(skippedHeader).toBe(true);
    expect(rows.map((row) => row.bankCode)).toEqual(["VCB", "TCB"]);
    expect(rows[1].bin).toBe("970407");
  });

  it("ngân hàng không khớp thì bin = null để hiện lỗi, giữ nguyên mã gốc", () => {
    const { rows } = parsePastedRows("XYZ\t123\tA\t100\tx");
    expect(rows[0]).toMatchObject({ bin: null, bankCode: "XYZ" });
  });

  it("bỏ khoảng trắng trong số tài khoản", () => {
    const { rows } = parsePastedRows("VCB\t0123 4567 89\tA\t100\tx");
    expect(rows[0].accountNumber).toBe("0123456789");
  });

  it("cột thiếu thì để chuỗi rỗng, không làm hỏng dòng", () => {
    const { rows } = parsePastedRows("VCB\t0123456789");
    expect(rows[0]).toMatchObject({
      accountName: "",
      amount: null,
      amountInvalid: false,
      content: "",
    });
  });

  it("cắt ở MAX_BATCH_ROWS và báo truncated", () => {
    const lines = Array.from(
      { length: MAX_BATCH_ROWS + 1 },
      (_, i) => `VCB\t${1000 + i}\tA\t100\tx`,
    ).join("\n");
    const { rows, truncated } = parsePastedRows(lines);
    expect(rows).toHaveLength(MAX_BATCH_ROWS);
    expect(truncated).toBe(true);
  });
});

describe("parseAmountCell", () => {
  it.each([
    ["1.500.000", 1500000],
    ["1,500,000", 1500000],
    ["1500000", 1500000],
    ["1.500.000 VND", 1500000],
    ["2000000đ", 2000000],
    ["1.500", 1500],
  ])("đọc %s thành %s", (raw, expected) => {
    expect(parseAmountCell(raw)).toEqual({ amount: expected, invalid: false });
  });

  it("ô trống là QR tĩnh, không phải lỗi", () => {
    expect(parseAmountCell("")).toEqual({ amount: null, invalid: false });
  });

  it("chữ lẫn trong số tiền là lỗi", () => {
    expect(parseAmountCell("12a")).toEqual({ amount: null, invalid: true });
  });

  it.each(["150.5", "1,5", "1.2.3", "1.5000"])(
    "số thập phân hoặc nhóm sai %s là lỗi, không tự chia tỷ lệ",
    (raw) => {
      expect(parseAmountCell(raw)).toEqual({ amount: null, invalid: true });
    },
  );
});
