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
      "Tạo toàn bộ Module Table Page chuẩn (API + Hook + Page + Detail Drawer + Locales)",
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
    description: "Tạo component StandardFormDrawer đơn lẻ chuẩn hệ thống",
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
    description: "Tạo component Dialog/Modal chuẩn hệ thống",
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
    description: "Tạo bảng dữ liệu nhúng (DataTable) cho Drawer hoặc Section",
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
}
