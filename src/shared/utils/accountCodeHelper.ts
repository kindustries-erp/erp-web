import type { ModuleAttributeOption } from "@/core/api/moduleConfigApi";

export const CATEGORY_TO_DEBIT_ACCOUNT_MAP: Readonly<Record<string, string>> = {
  VF_PARTS: "1561",
  COMMERCIAL_VEHICLES: "1562",
  OEM_OTHER_PARTS: "1563",
  WORKSHOP_CONSUMABLES: "152",
  GARAGE_SUBCONTRACT: "632",
  GARAGE_TOOLS_EQUIPMENT: "153",
  OFFICE_IT_FACILITIES: "153",
  OPEX_LOGISTICS: "6427",
  OPEX_SECURITY_CLEANING: "6427",
  OPEX_BANK_FEES: "635",
  OPEX_ADMIN: "6422",
  OPEX_LEGAL_CONSULTING: "6427",
  OPEX_IT_SOFTWARE: "6427",
  OPEX_MARKETING: "6428",
};

export function extractAccountCodeFromText(
  text?: string | null,
): string | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  const bracketMatch = trimmed.match(/\[(?:TK\s*)?([0-9A-Z]+)\]/i);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1].trim();
  }
  const prefixMatch = trimmed.match(/^TK[:\s]+([0-9A-Z]+)/i);
  if (prefixMatch && prefixMatch[1]) {
    return prefixMatch[1].trim();
  }
  return null;
}

export function resolveOptionAccountCode(
  opt?: ModuleAttributeOption | null,
): string | null {
  if (!opt) return null;

  if (opt.accountCode && opt.accountCode.trim()) {
    return opt.accountCode.trim();
  }

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

  const optKey = (opt.value || "").trim().toUpperCase();
  if (optKey && CATEGORY_TO_DEBIT_ACCOUNT_MAP[optKey]) {
    return CATEGORY_TO_DEBIT_ACCOUNT_MAP[optKey];
  }

  return null;
}

export function cleanOptionDisplayLabel(label?: string | null): string {
  if (!label || typeof label !== "string") return "";
  return label
    .replace(/^\[(?:TK\s*)?[0-9A-Z]+\]\s*/i, "")
    .replace(/\s*\[(?:TK\s*)?[0-9A-Z]+\]$/i, "")
    .replace(/^TK[:\s]+[0-9A-Z]+\s*[-:]\s*/i, "")
    .trim();
}
