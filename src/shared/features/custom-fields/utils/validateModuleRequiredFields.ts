import { resolveAttrName } from "@/core/api/moduleConfigApi";
import type { ValidateModuleRequiredFieldsParams } from "../domains/types";

/**
 * Pure helper validate các trường required cho Module Custom Fields
 * Trả về danh sách tên hiển thị của các trường bắt buộc bị thiếu
 */
export function validateModuleRequiredFields({
  globalDefs = [],
  globalAttributes = {},
  categoryDefs = [],
  attributes = {},
  hasCategory = false,
  moduleKey = "",
  categoryCode = null,
  includeSystemAttributes = false,
  t,
}: ValidateModuleRequiredFieldsParams): string[] {
  const missingNames: string[] = [];

  // 1. Validate global required fields
  const requiredGlobalDefs = globalDefs.filter(
    (d) =>
      !d.isDeleted &&
      d.isActive !== false &&
      d.isGlobal &&
      (includeSystemAttributes || !d.isSystem) &&
      d.isRequired,
  );
  for (const def of requiredGlobalDefs) {
    const val = globalAttributes[def.id];
    if (
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim() === "")
    ) {
      const name = resolveAttrName(def, moduleKey, undefined, t);
      missingNames.push(name);
    }
  }

  // 2. Validate category required fields if category is selected
  if (hasCategory) {
    const requiredCategoryDefs = categoryDefs.filter(
      (d) =>
        !d.isDeleted && d.isActive !== false && !d.isGlobal && d.isRequired,
    );
    for (const def of requiredCategoryDefs) {
      const val = attributes[def.id];
      if (
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "")
      ) {
        const name = resolveAttrName(def, moduleKey, categoryCode, t);
        missingNames.push(name);
      }
    }
  }

  return missingNames;
}
