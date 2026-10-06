import { resolveAttrName } from "@/core/api/moduleConfigApi";
import type { ValidateModuleRequiredFieldsParams } from "../types/customFields";

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
