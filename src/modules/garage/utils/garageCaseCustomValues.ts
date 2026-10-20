interface AttributeValueLike {
  attrDefId?: string;
  attrCode?: string;
  isSystem?: boolean;
  valueText?: string | null;
}

interface CaseWithCustomView {
  custom?: { byCode?: Record<string, unknown> };
  customAttributes?: Record<string, unknown>;
  attributeValues?: AttributeValueLike[];
}

/**
 * Giá trị thuộc tính TÙY CHỈNH của vụ việc, khóa theo attrDefId (mỗi giá trị một lần).
 * Chỉ lấy def không phải hệ thống và có mặt trong `custom.byCode` (contract mới của API);
 * 2 cờ loại trừ/category là built-in nằm ở cột, không đi qua đây.
 */
export function extractCaseCustomValues(
  caseData?: CaseWithCustomView | null,
): Record<string, unknown> {
  const byCode = caseData?.custom?.byCode;
  if (!byCode) return {};
  const result: Record<string, unknown> = {};
  for (const av of caseData?.attributeValues ?? []) {
    if (!av.attrDefId || !av.attrCode || av.isSystem) continue;
    if (!(av.attrCode in byCode)) continue;
    result[av.attrDefId] = byCode[av.attrCode];
  }
  return result;
}
