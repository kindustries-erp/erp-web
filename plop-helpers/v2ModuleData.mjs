import { hasStatusField, parseFields } from "./v2Fields.mjs";

export const pascalCase = (value) =>
  String(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

export const camelCase = (value) => {
  const pascal = pascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

export const kebabCase = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .join("-")
    .toLowerCase();

const NAV_SECTIONS = ["overview", "sales", "purchasing", "inventory", "manufacturing", "accounting", "settings"];

/** Gắn cờ hiển thị cho từng trường để template chỉ cần `{{#if isStatus}}` */
export function decorateFields(fields) {
  return fields.map((field, index) => ({
    ...field,
    tsType: field.type === "number" || field.type === "decimal" ? "number" : "string",
    isStatus: field.type === "status",
    isText: field.type === "text",
    // decimal là tiền (variant amount), number là số lượng (variant qty); cả hai đều có ô tổng
    isNumber: field.type === "number" || field.type === "decimal",
    summaryVariant: field.type === "decimal" ? "amount" : "qty",
    isDate: field.type === "date",
    isCreatedAt: field.name === "createdAt",
    isFirst: index === 0,
    inOverview: index < 4 && field.name !== "createdAt",
  }));
}

/**
 * Chuyển câu trả lời của prompt thành dữ liệu cho template `v2-module`.
 * Ném lỗi rõ ràng khi đầu vào không hợp lệ, trước khi có file nào được ghi.
 */
export function buildModuleData(answers) {
  const moduleName = kebabCase(answers.moduleName ?? "");
  const entityName = pascalCase(answers.entityName ?? "");
  const entityPlural = pascalCase(answers.pluralName ?? "");

  if (!/^[a-z][a-z0-9-]*$/.test(moduleName)) throw new Error(`moduleName không hợp lệ: "${answers.moduleName}" (kebab-case)`);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(entityName)) throw new Error(`entityName không hợp lệ: "${answers.entityName}" (PascalCase số ít)`);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(entityPlural)) throw new Error(`pluralName không hợp lệ: "${answers.pluralName}" (PascalCase số nhiều)`);
  if (!String(answers.apiBase ?? "").startsWith("/api/")) throw new Error(`apiBase phải bắt đầu bằng /api/: "${answers.apiBase}"`);
  if (!NAV_SECTIONS.includes(answers.navSection)) throw new Error(`navSection không hợp lệ: "${answers.navSection}". Chọn: ${NAV_SECTIONS.join(", ")}`);

  const routePath = kebabCase(answers.routeInput || moduleName);
  const fields = decorateFields(parseFields(answers.fieldSpec));
  const formFields = fields.filter((field) => !field.isCreatedAt);
  const requiredFields = formFields.filter((field) => field.required);

  if (formFields.length === 0) throw new Error("Cần ít nhất một trường ngoài createdAt");
  if (requiredFields.length === 0) throw new Error("Cần ít nhất một trường required (đánh dấu :required)");
  if (answers.hasNextCode && (formFields[0].isStatus || formFields[0].isNumber)) {
    throw new Error("Khi hasNextCode = true, trường đầu tiên phải là chuỗi (dùng làm mã)");
  }

  return {
    moduleKebab: moduleName,
    namespace: camelCase(moduleName),
    Entity: entityName,
    entity: camelCase(entityName),
    entityKebab: kebabCase(entityName),
    EntityPlural: entityPlural,
    entityPlural: camelCase(entityPlural),
    routePath,
    routeCamel: camelCase(routePath),
    tableId: answers.tableInput || `erp-${moduleName}-table`,
    apiBase: answers.apiBase,
    permissionCollection: answers.permissionCollection,
    navSection: answers.navSection,
    titleVi: answers.titleVi,
    titleEn: answers.titleEn,
    hasNextCode: Boolean(answers.hasNextCode),
    hasStatus: hasStatusField(fields),
    hasText: fields.some((field) => field.isText),
    statusName: fields.find((field) => field.isStatus)?.name ?? "status",
    firstName: formFields[0].name,
    needsReadValue: hasStatusField(fields) || fields.some((field) => field.isText),
    fields,
    formFields,
    requiredFields,
    viewConst: `${camelCase(entityPlural)}ViewVisibility`,
  };
}
