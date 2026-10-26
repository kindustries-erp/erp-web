/**
 * Mã hóa lựa chọn đối tượng trong ô chọn sao kê, và đổi lựa chọn thành payload gửi API.
 * Hàm thuần: không React, không gọi API.
 */

export type PartnerOptionSource = "MASTER" | "INVOICE";

export interface PartnerSelectionItem {
  partnerId: string | null;
  name: string;
  taxCode: string | null;
  source: PartnerOptionSource;
}

/** Chiều hóa đơn: OUT = khách hàng (tiền thu), IN = nhà cung cấp (tiền chi) */
export type PartnerSelectionDirection = "IN" | "OUT";

export type PartnerSelectionPayload =
  | { partnerId: string | null }
  | {
      invoicePartner: {
        taxCode: string | null;
        name: string;
        partnerType: "CUSTOMER" | "VENDOR";
      };
    };

const MASTER_PREFIX = "master:";
const INVOICE_PREFIX = "invoice:";

export const toPartnerOptionValue = (item: PartnerSelectionItem): string =>
  item.source === "MASTER" && item.partnerId
    ? `${MASTER_PREFIX}${item.partnerId}`
    : `${INVOICE_PREFIX}${item.taxCode ?? ""}:${item.name}`;

/**
 * Đổi giá trị đã chọn thành payload: đối tác trong danh mục gửi partnerId,
 * người mua/bán chưa có trong danh mục gửi invoicePartner để backend tạo rồi gán.
 * Null nghĩa là bỏ đối tượng.
 */
export const toPartnerSelectionPayload = (
  value: string | null,
  direction: PartnerSelectionDirection,
): PartnerSelectionPayload => {
  if (!value) return { partnerId: null };
  if (value.startsWith(MASTER_PREFIX)) {
    return { partnerId: value.slice(MASTER_PREFIX.length) };
  }
  const rest = value.slice(INVOICE_PREFIX.length);
  // MST chỉ gồm ký tự không có dấu ":", nên dấu ":" đầu tiên là ranh giới với tên
  const separator = rest.indexOf(":");
  const taxRaw = separator === -1 ? rest : rest.slice(0, separator);
  const name = separator === -1 ? "" : rest.slice(separator + 1);
  return {
    invoicePartner: {
      taxCode: taxRaw === "" ? null : taxRaw,
      name,
      partnerType: direction === "IN" ? "VENDOR" : "CUSTOMER",
    },
  };
};
