import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { toCamelCase, toKebabCase, toPascalCase } from "./v2CoreData.mjs";
import { NAV_SECTIONS } from "./v2ModuleData.mjs";

const MODULE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Tên export bắt buộc mà lõi phải khai báo để module mỏng ghép được. */
export const REQUIRED_CORE_EXPORTS = [
  "configType",
  "apiType",
  "keysFactory",
  "recordType",
  "formValueType",
  "listController",
  "query",
  "drawer",
];

/**
 * Đọc manifest web của một họ. Ném lỗi khi lõi chưa khai báo `exports`:
 * lõi mới sinh bởi `v2-core` chưa có hook UI, nên chưa được ghép module.
 */
export function readWebCoreManifest(baseDir, family) {
  const path = join(baseDir, "src/v2/core", family, "core.manifest.json");
  if (!existsSync(path))
    throw new Error(`Không tìm thấy manifest của họ "${family}"`);
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  if (manifest.layer !== "web")
    throw new Error(`Manifest của họ "${family}" không phải layer web`);
  if (!manifest.exports) {
    throw new Error(
      `Lõi "${family}" chưa khai báo exports (hook UI). Viết hook danh sách, query và drawer của lõi rồi khai báo trong core.manifest.json trước khi ghép module.`,
    );
  }
  for (const key of REQUIRED_CORE_EXPORTS) {
    if (!manifest.exports[key])
      throw new Error(`Manifest của họ "${family}" thiếu exports.${key}`);
  }
  return manifest;
}

/** Liệt kê họ web có manifest hợp lệ (đã khai báo đủ exports). */
export function listWebCoreFamilies(baseDir) {
  const coreRoot = join(baseDir, "src/v2/core");
  if (!existsSync(coreRoot)) return [];
  return readdirSync(coreRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((family) => {
      try {
        readWebCoreManifest(baseDir, family);
        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

/** Hành động vòng đời mà module có thể khai báo trong `exports.lifecycle` (route `POST <BASE>/<id>/<action>`). */
export const LIFECYCLE_ACTIONS = ["post", "cancel"];

/**
 * Các thành viên API ngoài danh sách chuẩn (list/options/get/create/update/remove),
 * sinh theo `exports.lifecycle` và `exports.nextCode` để khớp hợp đồng API của lõi.
 */
export function buildApiExtraMembers(exports, recordType) {
  const lines = [];
  for (const action of exports.lifecycle ?? []) {
    if (!LIFECYCLE_ACTIONS.includes(action)) {
      throw new Error(
        `Hành động vòng đời "${action}" không được hỗ trợ. Chọn: ${LIFECYCLE_ACTIONS.join(", ")}`,
      );
    }
    lines.push(
      `  ${action}: async (id: string) => {`,
      `    const { data } = await v2HttpClient.post<${recordType}>(\`\${BASE}/\${id}/${action}\`);`,
      `    return data;`,
      `  },`,
    );
  }
  if (exports.nextCode === true) {
    lines.push(
      `  nextCode: async (date?: string) => {`,
      `    const { data } = await v2HttpClient.get<{ nextCode: string }>(\`\${BASE}/next-code\`, {`,
      `      params: date ? { date } : undefined,`,
      `    });`,
      `    return data;`,
      `  },`,
    );
  }
  return lines.length ? `\n${lines.join("\n")}` : "";
}

const cleanTitle = (value, label) => {
  const title = String(value ?? "").trim();
  if (!title) throw new Error(`Thiếu ${label}`);
  if (/["\\]/.test(title))
    throw new Error(`${label} không được chứa dấu " hoặc \\`);
  return title;
};

/** Chuẩn hóa đầu vào `v2-thin-module` và nối với exports của lõi đã chọn. */
export function buildV2ThinData(answers, manifest) {
  const moduleName = String(answers.moduleInput ?? "").trim();
  if (!MODULE_PATTERN.test(moduleName)) {
    throw new Error(
      `Tên module không hợp lệ: "${moduleName}" (kebab-case, ví dụ: garage-goods-receipts)`,
    );
  }
  const exports = manifest.exports;
  const modulePascal = toPascalCase(moduleName);
  const moduleCamel = toCamelCase(moduleName);
  const titleVi = cleanTitle(answers.titleViInput, "tiêu đề tiếng Việt");
  const titleEn = cleanTitle(answers.titleEnInput, "tiêu đề tiếng Anh");
  const routePath = toKebabCase(answers.routeInput || moduleName);
  const navSection = String(answers.navSection ?? "").trim();
  if (!NAV_SECTIONS.includes(navSection)) {
    throw new Error(
      `navSection không hợp lệ: "${navSection}". Chọn: ${NAV_SECTIONS.join(", ")}`,
    );
  }

  return {
    moduleName,
    moduleKebab: moduleName,
    moduleCamel,
    modulePascal,
    // `EntityPlural` là tên trang mà `wiringPlan` (v2-module) dùng để import: `<EntityPlural>Page`
    EntityPlural: modulePascal,
    modulePath: `src/v2/modules/${moduleName}`,
    wire: Boolean(answers.wireInput),
    routePath,
    routeCamel: toCamelCase(routePath),
    navSection,
    family: manifest.family,
    coreBarrel: `@/v2/core/${manifest.family}`,
    configType: exports.configType,
    apiType: exports.apiType,
    keysFactory: exports.keysFactory,
    recordType: exports.recordType,
    formValueType: exports.formValueType,
    listController: exports.listController,
    query: exports.query,
    drawer: exports.drawer,
    apiExtraMembers: buildApiExtraMembers(exports, exports.recordType),
    viewVisibilityImport: exports.viewVisibility
      ? `, ${exports.viewVisibility}`
      : "",
    viewVisibilityExpr: exports.viewVisibility ?? "{}",
    titleVi,
    titleEn,
    permissionCollection:
      String(answers.permissionInput ?? "").trim() ||
      moduleName.replace(/-/g, "_"),
    tableId: `erp-${moduleName}-table`,
    localeNamespace: moduleCamel,
    pageName: `${modulePascal}Page`,
    hookName: `use${modulePascal}Page`,
  };
}
