import { describe, expect, it } from "vitest";
import {
  buildTransferQrFileName,
  buildVietQrPayload,
  computeCrc16Ccitt,
  isValidVndAmount,
  sanitizeTransferContent,
} from "./vietQrPayload";

/** Đọc chuỗi TLV một cấp thành map tag -> value. */
const parseTlv = (payload: string): Record<string, string> => {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < payload.length) {
    const tag = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    out[tag] = payload.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
};

describe("computeCrc16Ccitt", () => {
  it("khớp check value CRC-16/CCITT-FALSE của '123456789'", () => {
    expect(computeCrc16Ccitt("123456789")).toBe("29B1");
  });
});

describe("sanitizeTransferContent", () => {
  it("bỏ dấu, đ→d, bỏ ký tự đặc biệt và cắt tối đa 95 ký tự", () => {
    expect(sanitizeTransferContent("Thanh toán đơn #123")).toBe(
      "Thanh toan don 123",
    );
    expect(sanitizeTransferContent("  Đặt cọc   xe  ")).toBe("Dat coc xe");
    expect(sanitizeTransferContent("A".repeat(250))).toHaveLength(95);
  });

  it("nội dung đúng 95 ký tự vẫn cho thẻ 62 có độ dài 2 chữ số hợp lệ", () => {
    const payload = buildVietQrPayload({
      bin: "970436",
      accountNumber: "1234567890",
      content: "A".repeat(95),
    });
    const fields = parseTlv(payload.slice(0, -8));
    expect(fields["62"]).toHaveLength(99);
    expect(parseTlv(fields["62"])["08"]).toBe("A".repeat(95));
    expect(payload.slice(-4)).toBe(computeCrc16Ccitt(payload.slice(0, -4)));
  });

  it("đổi ký tự đặc biệt thành dấu cách, không làm dính chữ", () => {
    expect(sanitizeTransferContent("HD001/2025")).toBe("HD001 2025");
    expect(sanitizeTransferContent("A-B_C")).toBe("A B C");
    expect(sanitizeTransferContent("NCC (ABC)-01")).toBe("NCC ABC 01");
    expect(sanitizeTransferContent("a///b...c")).toBe("a b c");
    expect(sanitizeTransferContent("--x--")).toBe("x");
  });
});

describe("isValidVndAmount", () => {
  it("chỉ nhận số nguyên dương trong giới hạn", () => {
    expect(isValidVndAmount(1500000)).toBe(true);
    expect(isValidVndAmount(0)).toBe(false);
    expect(isValidVndAmount(1.5)).toBe(false);
    expect(isValidVndAmount(1000000000000)).toBe(false);
  });
});

describe("buildVietQrPayload", () => {
  const base = { bin: "970436", accountNumber: "1234567890" };

  it("QR tĩnh (không số tiền): tag 01 = 11, không có tag 54", () => {
    const payload = buildVietQrPayload(base);
    const fields = parseTlv(payload.slice(0, -8));
    expect(fields["01"]).toBe("11");
    expect(fields["54"]).toBeUndefined();
    expect(fields["53"]).toBe("704");
    expect(fields["58"]).toBe("VN");
  });

  it("QR động (có số tiền và nội dung): tag 01 = 12, có số tiền và nội dung đúng tag", () => {
    const payload = buildVietQrPayload({
      ...base,
      amount: 1500000,
      content: "Thanh toan NCC",
    });
    const fields = parseTlv(payload.slice(0, -8));
    expect(fields["01"]).toBe("12");
    expect(fields["54"]).toBe("1500000");
    expect(parseTlv(fields["62"])["08"]).toBe("Thanh toan NCC");
  });

  it("tag 38 chứa GUID, BIN, số tài khoản và dịch vụ chuyển khoản", () => {
    const payload = buildVietQrPayload(base);
    const merchant = parseTlv(parseTlv(payload)["38"]);
    expect(merchant["00"]).toBe("A000000727");
    expect(merchant["02"]).toBe("QRIBFTTA");
    const consumer = parseTlv(merchant["01"]);
    expect(consumer["00"]).toBe("970436");
    expect(consumer["01"]).toBe("1234567890");
  });

  it("CRC ở cuối khớp với phần thân trước tag 63", () => {
    const payload = buildVietQrPayload({ ...base, amount: 100000 });
    const crc = payload.slice(-4);
    const withoutCrc = payload.slice(0, -4);
    expect(withoutCrc.endsWith("6304")).toBe(true);
    expect(computeCrc16Ccitt(withoutCrc)).toBe(crc);
  });

  it("nội dung không có dấu và không có tag 62 khi để trống", () => {
    const withContent = buildVietQrPayload({ ...base, content: "Đặt cọc" });
    expect(parseTlv(parseTlv(withContent.slice(0, -8))["62"])["08"]).toBe(
      "Dat coc",
    );
    const withoutContent = buildVietQrPayload(base);
    expect(parseTlv(withoutContent)["62"]).toBeUndefined();
  });
});

describe("buildTransferQrFileName", () => {
  it("tạo tên file dễ đọc, có hoặc không có số tiền", () => {
    expect(
      buildTransferQrFileName({ bankCode: "VCB", accountNumber: "123" }),
    ).toBe("QR_VCB_123.png");
    expect(
      buildTransferQrFileName({
        bankCode: "VCB",
        accountNumber: "123",
        amount: 500,
      }),
    ).toBe("QR_VCB_123_500.png");
  });
});
