import { NAV_SECTIONS, buildModuleData } from "./plop-helpers/v2ModuleData.mjs";
import { insertAtMarker } from "./plop-helpers/v2Wiring.mjs";
import { moduleFileMap, wiringPlan } from "./plop-helpers/v2ModuleFiles.mjs";
import {
  COMPONENT_LAYERS,
  addBarrelExport,
  buildComponentData,
  componentFileMap,
} from "./plop-helpers/v2ComponentFiles.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { buildV2CoreData } from "./plop-helpers/v2CoreData.mjs";
import { v2CoreFileMap } from "./plop-helpers/v2CoreFiles.mjs";
import { v2CoreManifestJson } from "./plop-helpers/v2CoreManifest.mjs";
import { buildV2ThinData, listWebCoreFamilies, readWebCoreManifest } from "./plop-helpers/v2ThinData.mjs";
import { v2ThinFileMap } from "./plop-helpers/v2ThinFiles.mjs";

export default function (plop) {
  // Handlebars Helper: eq
  plop.setHelper("eq", function (a, b) {
    return a === b;
  });

  // Handlebars Helper: modalSizeClass
  plop.setHelper("modalSizeClass", function () {
    const size = this.modalSize;
    if (size === "sm") return "max-w-[360px]";
    if (size === "lg") return "max-w-[560px]";
    if (size === "xl") return "max-w-[680px]";
    return "max-w-[480px]";
  });

  // 1. GENERATOR: Full Table Page Module
  plop.setGenerator("table-page", {
    description:
      "[LEGACY-V1] Tạo Module Table Page V1 (src/modules). Module V2 mới dùng v2-core + v2-thin-module hoặc v2-module",
    prompts: [
      {
        type: "input",
        name: "moduleName",
        message: "Tên module (kebab-case, vd: purchase-orders-core):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên module",
      },
      {
        type: "input",
        name: "componentName",
        message: "Tên component prefix (PascalCase, vd: PurchaseOrder):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên component",
      },
      {
        type: "input",
        name: "pageTitle",
        message: "Tiêu đề trang hiển thị (vd: Đơn mua hàng):",
        default: "Danh sách dữ liệu",
      },
      {
        type: "input",
        name: "tableId",
        message:
          "Unique Table ID (lưu tùy biến cột vào App Settings, vd: po-table):",
        default: (answers) => `${answers.moduleName}-table`,
      },
      {
        type: "list",
        name: "drawerType",
        message: "Kiểu Drawer chi tiết:",
        choices: [
          {
            name: "Multi-Facet Tabs (Top Navigation Tabs - Chuẩn cho chứng từ lớn)",
            value: "multi-tab",
          },
          { name: "2 Cột tĩnh (2-Columns Layout)", value: "2-columns" },
          { name: "1 Cột đơn giản (1-Column Layout)", value: "1-column" },
        ],
        default: "multi-tab",
      },
      {
        type: "list",
        name: "drawerSize",
        message: "Kích thước Drawer:",
        choices: [
          { name: "xl (Default cho chứng từ & multi-tabs: 90vw)", value: "xl" },
          { name: "lg (74vw)", value: "lg" },
          { name: "md (54vw)", value: "md" },
          { name: "sm (38vw)", value: "sm" },
        ],
        default: "xl",
      },
      {
        type: "confirm",
        name: "hasDateColumn",
        message: "Có cột Ngày tháng với DateRange filter không?",
        default: true,
      },
      {
        type: "confirm",
        name: "hasAmountColumn",
        message: "Có cột Số tiền / Giá trị và dòng Tổng cộng không?",
        default: true,
      },
      {
        type: "confirm",
        name: "hasStatusColumn",
        message: "Có cột Trạng thái (Status Badge) không?",
        default: true,
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/api/{{camelCase componentName}}Api.ts",
        templateFile: "plop-templates/table-page/api.ts.hbs",
      },
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/hooks/use{{pascalCase componentName}}List.ts",
        templateFile: "plop-templates/table-page/hook.ts.hbs",
      },
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/components/{{pascalCase componentName}}Tab.tsx",
        templateFile: "plop-templates/table-page/page.tsx.hbs",
      },
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/components/{{pascalCase componentName}}DetailDrawer.tsx",
        templateFile: "plop-templates/table-page/drawer.tsx.hbs",
      },
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/locales/vi.ts",
        templateFile: "plop-templates/table-page/locale-vi.ts.hbs",
      },
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/locales/en.ts",
        templateFile: "plop-templates/table-page/locale-en.ts.hbs",
      },
    ],
  });

  // 2. GENERATOR: Standalone Drawer
  plop.setGenerator("drawer", {
    description: "[LEGACY-V1] Tạo StandardFormDrawer V1 (src/modules). Drawer V2 nằm trong lõi họ (src/v2/core/<họ>/drawers)",
    prompts: [
      {
        type: "input",
        name: "moduleName",
        message: "Tên module (kebab-case, vd: sales-orders-core):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên module",
      },
      {
        type: "input",
        name: "componentName",
        message: "Tên component (PascalCase, vd: PartnerSelection):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên component",
      },
      {
        type: "list",
        name: "drawerType",
        message: "Kiểu Drawer:",
        choices: [
          {
            name: "Multi-Facet Tabs (Top Navigation Tabs)",
            value: "multi-tab",
          },
          { name: "2 Cột tĩnh (2-Columns Layout)", value: "2-columns" },
          { name: "1 Cột đơn giản (1-Column Layout)", value: "1-column" },
        ],
        default: "2-columns",
      },
      {
        type: "list",
        name: "drawerSize",
        message: "Kích thước Drawer:",
        choices: ["xl", "lg", "md", "sm"],
        default: "lg",
      },
      {
        type: "confirm",
        name: "hasStatus",
        message: "Có hiển thị Badge trạng thái ở titleExtra không?",
        default: true,
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/components/{{pascalCase componentName}}Drawer.tsx",
        templateFile: "plop-templates/drawer/Drawer.tsx.hbs",
      },
    ],
  });

  // 3. GENERATOR: Standalone Modal
  plop.setGenerator("modal", {
    description: "[LEGACY-V1] Tạo Dialog/Modal V1 (src/modules). Component V2 dùng generator v2-component",
    prompts: [
      {
        type: "input",
        name: "moduleName",
        message: "Tên module (kebab-case):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên module",
      },
      {
        type: "input",
        name: "componentName",
        message: "Tên component (PascalCase, vd: ConfirmPosting):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên component",
      },
      {
        type: "list",
        name: "modalType",
        message: "Loại Modal:",
        choices: [
          { name: "Form nhập liệu (Form Modal)", value: "form" },
          { name: "Hộp thoại xác nhận (Confirm Dialog)", value: "confirm" },
        ],
        default: "form",
      },
      {
        type: "list",
        name: "modalSize",
        message: "Kích thước Modal:",
        choices: [
          { name: "sm (360px - confirm/alert)", value: "sm" },
          { name: "md (480px - form nhỏ/vừa)", value: "md" },
          { name: "lg (560px - form lớn)", value: "lg" },
          { name: "xl (680px - bảng/phức tạp)", value: "xl" },
        ],
        default: "md",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/components/{{pascalCase componentName}}Modal.tsx",
        templateFile: "plop-templates/modal/Modal.tsx.hbs",
      },
    ],
  });

  // 4. GENERATOR: Embedded Table Section
  plop.setGenerator("table-section", {
    description: "[LEGACY-V1] Tạo bảng nhúng DataTable V1 (src/modules). Bảng V2 nằm trong lõi họ hoặc v2-component",
    prompts: [
      {
        type: "input",
        name: "moduleName",
        message: "Tên module (kebab-case):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên module",
      },
      {
        type: "input",
        name: "componentName",
        message: "Tên component (PascalCase, vd: InvoiceLineItems):",
        validate: (value) =>
          /.+/.test(value) ? true : "Vui lòng nhập tên component",
      },
      {
        type: "input",
        name: "rowTypeName",
        message: "Tên Type cho mỗi dòng (PascalCase, vd: InvoiceLineItem):",
        default: (answers) => `${answers.componentName}Item`,
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/modules/{{kebabCase moduleName}}/components/{{pascalCase componentName}}Section.tsx",
        templateFile: "plop-templates/table-section/TableSection.tsx.hbs",
      },
    ],
  });

  // 5. GENERATOR: Module V2 chuẩn (Dual-Run /v2/) — xem .agents/skills/erp-web-structure/references/v2-migration.md
  plop.setGenerator("v2-module", {
    description:
      "Tạo module V2 standalone (API, domain, atomic components, drawer, page, locale, test) và nối route/menu/i18n. Họ đã có lõi thì dùng v2-thin-module",
    prompts: [
      {
        type: "input",
        name: "moduleName",
        message: "Tên module (kebab-case, vd: sample-items):",
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value) || "Dùng kebab-case, bắt đầu bằng chữ thường",
      },
      {
        type: "input",
        name: "entityName",
        message: "Tên thực thể số ít (PascalCase, vd: SampleItem):",
      },
      {
        type: "input",
        name: "pluralName",
        message: "Tên thực thể số nhiều (PascalCase, vd: SampleItems):",
      },
      { type: "input", name: "titleVi", message: "Tiêu đề tiếng Việt:" },
      { type: "input", name: "titleEn", message: "Tiêu đề tiếng Anh:" },
      {
        type: "input",
        name: "apiBase",
        message: "Đường dẫn API (vd: /api/v1/sample-items):",
      },
      {
        type: "input",
        name: "permissionCollection",
        message: "Collection quyền (vd: sample_items):",
      },
      {
        type: "input",
        name: "routeInput",
        message: "Đường dẫn route (mặc định = tên module):",
        default: (answers) => answers.moduleName,
      },
      {
        type: "list",
        name: "navSection",
        message: "Nhóm menu:",
        choices: [
          "overview",
          "sales",
          "purchasing",
          "inventory",
          "manufacturing",
          "accounting",
          "settings",
        ],
        default: "settings",
      },
      {
        type: "input",
        name: "tableInput",
        message: "Table ID lưu cấu hình cột (mặc định erp-<module>-table):",
        default: (answers) => `erp-${answers.moduleName}-table`,
      },
      {
        type: "input",
        name: "fieldSpec",
        message:
          "Trường, dạng name:type[:required], ngăn bằng dấu phẩy (type: string|text|number|date|status):",
      },
      {
        type: "confirm",
        name: "hasNextCode",
        message: "Có endpoint sinh mã tự động (next-code)?",
        default: false,
      },
      {
        type: "confirm",
        name: "wire",
        message: "Tự nối route, menu và i18n vào các file chung?",
        default: true,
      },
    ],
    actions: (answers) => {
      // Ném lỗi trước khi ghi file nào, nên đầu vào sai không để lại module dở dang
      const data = buildModuleData(answers);
      const actions = moduleFileMap(data).map(([template, path]) => ({
        type: "add",
        path,
        templateFile: `plop-templates/v2-module/${template}`,
        data,
      }));
      if (answers.wire) {
        for (const change of wiringPlan(data)) {
          actions.push({
            type: "modify",
            path: change.file,
            transform: (content) =>
              insertAtMarker(content, change.marker, change.snippet, change.id).content,
          });
        }
      }
      return actions;
    },
  });

  // 6. GENERATOR: Component V2 dùng chung (src/v2/shared/components/<layer>)
  plop.setGenerator("v2-component", {
    description:
      "Tạo component V2 dùng chung (index, component, type, test, stories) và nối barrel của tầng",
    prompts: [
      {
        type: "list",
        name: "layer",
        message: "Tầng Atomic:",
        choices: COMPONENT_LAYERS,
        default: "molecules",
      },
      {
        type: "input",
        name: "name",
        message: "Tên component (PascalCase, bắt đầu V2, vd: V2TraceabilityCanvas):",
        validate: (value) =>
          /^V2[A-Z][A-Za-z0-9]*$/.test(value) || "Phải bắt đầu bằng V2 và PascalCase",
      },
      {
        type: "input",
        name: "description",
        message: "Mô tả ngắn (dùng cho JSDoc):",
      },
    ],
    actions: (answers) => {
      // Ném lỗi trước khi ghi file nào, đầu vào sai không để lại component dở dang
      const data = buildComponentData(answers);
      const actions = componentFileMap(data).map(([template, path]) => ({
        type: "add",
        path,
        templateFile: `plop-templates/v2-component/${template}`,
        data,
      }));
      actions.push({
        type: "modify",
        path: `src/v2/shared/components/${data.layer}/index.ts`,
        transform: (content) => addBarrelExport(content, data.folder),
      });
      return actions;
    },
  });

  // GENERATOR: Lõi họ V2 web (khung hợp đồng + manifest). Hook UI viết tay rồi khai báo exports.
  plop.setGenerator("v2-core", {
    description:
      "Tạo khung lõi họ V2 web (config type, API type, keys, domain, locale, barrel, manifest). Hook UI viết tay rồi khai báo exports",
    prompts: [
      {
        type: "input",
        name: "familyInput",
        message: "Tên họ (kebab-case, vd: customer-claims):",
        validate: (value) => (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value) ? true : "Dùng kebab-case"),
      },
      {
        type: "input",
        name: "entityInput",
        message: "Entity gốc (PascalCase, vd: CustomerClaim):",
        validate: (value) => (/^[A-Za-z][A-Za-z0-9]*$/.test(value) ? true : "Dùng PascalCase"),
      },
    ],
    actions: (answers) => {
      // Dữ liệu được kiểm tra trước; input sai thì dừng ở đây, chưa ghi file nào.
      const base = plop.getDestBasePath();
      const data = buildV2CoreData(answers);
      if (existsSync(join(base, data.coreDir))) {
        throw new Error(`Họ "${data.family}" đã tồn tại tại ${data.coreDir}.`);
      }
      const withManifest = { ...data, manifestJson: v2CoreManifestJson(data) };
      return [
        ...v2CoreFileMap(withManifest).map(({ template, path }) => ({
          type: "add",
          path,
          templateFile: `plop-templates/${template}`,
          data: withManifest,
        })),
        {
          type: "add",
          path: `${data.coreDir}/core.manifest.json`,
          templateFile: "plop-templates/v2-core/manifest.json.hbs",
          data: withManifest,
        },
      ];
    },
  });

  // GENERATOR: Module V2 mỏng ghép lõi web đã khai báo exports (src/v2/modules/<module>)
  plop.setGenerator("v2-thin-module", {
    description:
      "Tạo module V2 mỏng ghép lõi web có sẵn (config, API, locale, page + hook, index, test tích hợp); tự nối route/menu/i18n khi wire. Chỉ ghép lõi đã khai báo exports",
    prompts: [
      {
        type: "list",
        name: "coreInput",
        message: "Chọn họ lõi (đã khai báo exports):",
        choices: listWebCoreFamilies(plop.getDestBasePath()),
      },
      {
        type: "input",
        name: "moduleInput",
        message: "Tên module (kebab-case, vd: garage-goods-receipts):",
        validate: (value) => (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value) ? true : "Dùng kebab-case"),
      },
      { type: "input", name: "titleViInput", message: "Tiêu đề tiếng Việt:" },
      { type: "input", name: "titleEnInput", message: "Tiêu đề tiếng Anh:" },
      {
        type: "input",
        name: "permissionInput",
        message: "Collection quyền (snake_case, để trống = theo module):",
        default: "",
      },
      {
        type: "input",
        name: "routeInput",
        message: "Đường dẫn route (để trống = theo tên module):",
        default: "",
      },
      {
        type: "list",
        name: "navSection",
        message: "Nhóm menu:",
        choices: NAV_SECTIONS,
        default: "settings",
      },
      {
        type: "confirm",
        name: "wireInput",
        message: "Tự nối route, menu và i18n vào các file chung?",
        default: true,
      },
    ],
    actions: (answers) => {
      const base = plop.getDestBasePath();
      const manifest = readWebCoreManifest(base, answers.coreInput);
      // Validate và dựng dữ liệu trước: input sai thì dừng tại đây, chưa ghi file nào.
      const data = buildV2ThinData(answers, manifest);
      if (existsSync(join(base, data.modulePath))) {
        throw new Error(`Module "${data.moduleName}" đã tồn tại tại ${data.modulePath}.`);
      }
      const actions = v2ThinFileMap(data).map(({ template, path }) => ({
        type: "add",
        path,
        templateFile: `plop-templates/v2-thin-module/${template}`,
        data,
      }));
      if (data.wire) {
        for (const change of wiringPlan(data)) {
          actions.push({
            type: "modify",
            path: change.file,
            transform: (content) =>
              insertAtMarker(content, change.marker, change.snippet, change.id).content,
          });
        }
      }
      return actions;
    },
  });
}
