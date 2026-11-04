/** Lõi họ V2 (web): đầu vào của generator `v2-core` và các hàm chuẩn hóa tên dùng chung. */

const FAMILY_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const ENTITY_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

export const toKebabCase = (value) =>
  String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const toPascalCase = (value) =>
  String(value ?? "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");

export const toCamelCase = (value) => {
  const pascal = toPascalCase(value);
  return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : "";
};

/**
 * Chuẩn hóa đầu vào `v2-core`. Ném lỗi khi sai để plop dừng trước khi ghi file.
 * Tên hợp đồng suy ra từ entity: `<Entity>Record`, `<Entity>FormValue`, `<Entity>Api`,
 * `<Entity>Keys`, `create<Entity>Keys`, `<Entity>ModuleConfig`.
 */
export function buildV2CoreData(answers) {
  const family = String(answers.familyInput ?? "").trim();
  const entity = String(answers.entityInput ?? "").trim();

  if (!FAMILY_PATTERN.test(family)) {
    throw new Error(`Tên họ không hợp lệ: "${family}" (kebab-case, ví dụ: customer-claims)`);
  }
  if (!ENTITY_PATTERN.test(entity)) {
    throw new Error(`Tên entity không hợp lệ: "${entity}" (PascalCase, ví dụ: CustomerClaim)`);
  }

  const familyCamel = toCamelCase(family);
  const entityCamel = toCamelCase(entity);
  return {
    family,
    entity,
    entityKebab: toKebabCase(entity),
    entityCamel,
    coreDir: `src/v2/core/${family}`,
    localeNamespace: familyCamel,
    recordType: `${entity}Record`,
    formValueType: `${entity}FormValue`,
    apiType: `${entity}Api`,
    keysFactory: `create${entity}Keys`,
    keysType: `${entity}Keys`,
    configType: `${entity}ModuleConfig`,
    domainFile: `domain/${entityCamel}`,
    apiTypeFile: `api/${entityCamel}Api.type`,
    keysFile: `api/${entityCamel}Keys`,
    configFile: `${family}.config.type`,
    // Đường dẫn import tương đối giữa các file sinh ra
    configFileImport: `./${family}.config.type`,
    apiTypeImport: `./api/${entityCamel}Api.type`,
    keysImport: `./api/${entityCamel}Keys`,
    domainImport: `./domain/${entityCamel}`,
    domainFromApi: `../domain/${entityCamel}`,
  };
}
