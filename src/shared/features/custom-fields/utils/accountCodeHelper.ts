import type { ModuleAttributeOption } from "@/core/api/moduleConfigApi";

/**
 * Bảng ánh xạ 14 danh mục phân loại chuẩn Thông tư 99/2025/TT-BTC
 * sang Tài khoản Nợ mặc định (Fallback Tier 3).
 */
export const CATEGORY_TO_DEBIT_ACCOUNT_MAP: Readonly<Record<string, string>> = {
  VF_PARTS: "1561", // Hàng hóa VinFast chính hãng
  COMMERCIAL_VEHICLES: "1562", // Mua xe ô tô thương mại / xe lướt
  OEM_OTHER_PARTS: "1563", // Phụ tùng OEM & Hãng khác
  WORKSHOP_CONSUMABLES: "152", // Nguyên vật liệu & Tiêu hao xưởng
  GARAGE_SUBCONTRACT: "632", // Gia công ngoài & Thầu phụ kỹ thuật
  GARAGE_TOOLS_EQUIPMENT: "153", // Máy móc, Thiết bị & CCDC xưởng
  OFFICE_IT_FACILITIES: "153", // Thiết bị CNTT, Camera & Nội thất VP
  OPEX_LOGISTICS: "6427", // Vận chuyển, Grab Express, 911, Viettel Post
  OPEX_SECURITY_CLEANING: "6427", // Bảo vệ, Vệ sinh, Môi trường
  OPEX_BANK_FEES: "635", // Phí ngân hàng, POS, lãi vay
  OPEX_ADMIN: "6422", // Hành chính, VPP, Nước uống
  OPEX_LEGAL_CONSULTING: "6427", // Tư vấn pháp lý, kế toán BCTC
  OPEX_IT_SOFTWARE: "6427", // Bản quyền phần mềm KGARA, Cloud, internet
  OPEX_MARKETING: "6428", // Tiếp thị, sự kiện, quà tặng
};

/**
 * Trích xuất mã tài khoản kế toán từ chuỗi văn bản (ví dụ "[TK 632] Gia công", "[1561] Phụ tùng", "TK: 152").
 */
export function extractAccountCodeFromText(
  text?: string | null,
): string | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  // Khớp định dạng [TK 632], [TK632], [632], [TK 1561]
  const bracketMatch = trimmed.match(/\[(?:TK\s*)?([0-9A-Z]+)\]/i);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1].trim();
  }
  // Khớp định dạng tiền tố TK: 1561 hoặc TK 1561 -
  const prefixMatch = trimmed.match(/^TK[:\s]+([0-9A-Z]+)/i);
  if (prefixMatch && prefixMatch[1]) {
    return prefixMatch[1].trim();
  }
  return null;
}

/**
 * Phân giải mã tài khoản kế toán từ ModuleAttributeOption theo chuỗi ưu tiên 3 tầng:
 * 1. opt.accountCode (Trường cấu hình trực tiếp)
 * 2. Trích xuất từ opt.label hoặc opt.labels.vi / opt.labels.en
 * 3. Ánh xạ từ CATEGORY_TO_DEBIT_ACCOUNT_MAP theo opt.value
 */
export function resolveOptionAccountCode(
  opt?: ModuleAttributeOption | null,
): string | null {
  if (!opt) return null;

  // 1. Cấu hình trực tiếp
  if (opt.accountCode && opt.accountCode.trim()) {
    return opt.accountCode.trim();
  }

  // 2. Trích xuất từ nhãn hiển thị
  const fromLabel = extractAccountCodeFromText(opt.label);
  if (fromLabel) return fromLabel;

  if (opt.labels && typeof opt.labels === "object") {
    if (opt.labels.vi) {
      const fromVi = extractAccountCodeFromText(opt.labels.vi);
      if (fromVi) return fromVi;
    }
    if (opt.labels.en) {
      const fromEn = extractAccountCodeFromText(opt.labels.en);
      if (fromEn) return fromEn;
    }
  }

  // 3. Fallback theo bảng 14 phân loại chuẩn TT99
  const optKey = (opt.value || "").trim().toUpperCase();
  if (optKey && CATEGORY_TO_DEBIT_ACCOUNT_MAP[optKey]) {
    return CATEGORY_TO_DEBIT_ACCOUNT_MAP[optKey];
  }

  return null;
}

/**
 * Làm sạch nhãn hiển thị, loại bỏ các tiền tố/hậu tố [TK 632] hoặc [1561] thừa.
 */
export function cleanOptionDisplayLabel(label?: string | null): string {
  if (!label || typeof label !== "string") return "";
  return label
    .replace(/^\[(?:TK\s*)?[0-9A-Z]+\]\s*/i, "")
    .replace(/\s*\[(?:TK\s*)?[0-9A-Z]+\]$/i, "")
    .replace(/^TK[:\s]+[0-9A-Z]+\s*[-:]\s*/i, "")
    .trim();
}
