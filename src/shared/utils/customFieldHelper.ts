import {
  resolveAttrName,
  resolveOptionLabel,
  type ModuleAttributeDef,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";

export { resolveAttrName, resolveOptionLabel };

export function parseAttributeOptions(options: any): ModuleAttributeOption[] {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }
  return [];
}

export function formatAttributeValue(
  val: any,
  attrDef: ModuleAttributeDef,
  locale: string = "vi",
): string {
  if (val === undefined || val === null || val === "") return "-";
  const fieldType = attrDef.fieldType || (attrDef as any).type;
  if (fieldType === "CHECKBOX") {
    return val ? "✓" : "✗";
  }
  if (fieldType === "DATE") {
    return String(val);
  }
  if (fieldType === "SELECT") {
    const options = parseAttributeOptions(attrDef.options);
    const found = options.find((o) => o.value === val);
    if (found) {
      return resolveOptionLabel(found, locale);
    }
  }
  return String(val);
}
