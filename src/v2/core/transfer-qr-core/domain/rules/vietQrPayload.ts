/** Chuỗi định danh dịch vụ VietQR (GUID) và dịch vụ chuyển khoản theo số tài khoản. */
export const VIETQR_GUID = "A000000727";
export const VIETQR_TRANSFER_SERVICE = "QRIBFTTA";

/**
 * Thẻ 62 (Additional Data) có độ dài 2 chữ số và chứa sub-tag 08 (4 ký tự phần đầu)
 * nên nội dung tối đa là 99 - 4 = 95 ký tự để payload vẫn hợp lệ theo EMVCo.
 */
const MAX_TLV_VALUE_LENGTH = 99;
const MAX_CONTENT_LENGTH = MAX_TLV_VALUE_LENGTH - 4;
export const MAX_VND_AMOUNT = 999_999_999_999;
const ACCOUNT_NUMBER_PATTERN = /^[A-Za-z0-9]{1,19}$/;

export interface VietQrPayloadInput {
  /** Mã BIN Napas 6 chữ số */
  bin: string;
  accountNumber: string;
  /** VND nguyên dương; bỏ trống = QR tĩnh (khách tự nhập số tiền) */
  amount?: number | null;
  /** Nội dung chuyển khoản (đã hoặc chưa làm sạch) */
  content?: string;
}

/** Ghép một trường TLV; độ dài luôn 2 chữ số, vượt 99 thì ném lỗi thay vì sinh payload hỏng. */
const tlv = (tag: string, value: string): string => {
  if (value.length > MAX_TLV_VALUE_LENGTH)
    throw new RangeError(`TLV ${tag} vượt ${MAX_TLV_VALUE_LENGTH} ký tự`);
  return `${tag}${value.length.toString().padStart(2, "0")}${value}`;
};

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), trả về 4 ký tự hex in hoa. */
export function computeCrc16Ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Làm sạch nội dung: bỏ dấu, mọi chuỗi ký tự không phải chữ/số (kể cả khoảng trắng)
 * đổi thành một dấu cách để chữ không bị dính lại, tối đa 95 ký tự.
 * Ví dụ: "HD001/2025" -> "HD001 2025", "NCC (ABC)-01" -> "NCC ABC 01".
 */
export function sanitizeTransferContent(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^A-Za-z0-9-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH)
    .trim();
}

export function isValidAccountNumber(raw: string): boolean {
  return ACCOUNT_NUMBER_PATTERN.test(raw);
}

export function isValidVndAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= MAX_VND_AMOUNT;
}

/**
 * Tạo chuỗi VietQR (EMVCo) để render thành QR.
 * Giả định input đã được kiểm tra (bin 6 số, số tài khoản hợp lệ, số tiền nguyên dương).
 */
export function buildVietQrPayload(input: VietQrPayloadInput): string {
  const isDynamic = input.amount != null;
  const content = sanitizeTransferContent(input.content ?? "");

  const merchantAccount = tlv(
    "38",
    tlv("00", VIETQR_GUID) +
      tlv("01", tlv("00", input.bin) + tlv("01", input.accountNumber)) +
      tlv("02", VIETQR_TRANSFER_SERVICE),
  );

  const body =
    tlv("00", "01") +
    tlv("01", isDynamic ? "12" : "11") +
    merchantAccount +
    tlv("53", "704") +
    (isDynamic ? tlv("54", String(input.amount)) : "") +
    tlv("58", "VN") +
    (content ? tlv("62", tlv("08", content)) : "");

  const withCrcTag = `${body}6304`;
  return `${withCrcTag}${computeCrc16Ccitt(withCrcTag)}`;
}

/** Tên file tải về, dễ đọc: QR_<mã ngân hàng>_<số tài khoản>[_<số tiền>].png */
export function buildTransferQrFileName(parts: {
  bankCode: string;
  accountNumber: string;
  amount?: number | null;
}): string {
  const amountPart = parts.amount != null ? `_${parts.amount}` : "";
  return `QR_${parts.bankCode}_${parts.accountNumber}${amountPart}.png`;
}
