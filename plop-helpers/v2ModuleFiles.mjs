import { insertAtMarker } from "./v2Wiring.mjs";

const json = (value) => JSON.stringify(String(value));

/** Danh sách template → file đích của module V2 (đường dẫn tương đối từ erp-web) */
export function moduleFileMap(data) {
  const base = `src/v2/modules/${data.moduleKebab}`;
  const org = `${base}/components/organisms`;
  const files = [
    ["api/dtos/dto.ts.hbs", `${base}/api/dtos/${data.entity}.dto.ts`],
    ["api/api.ts.hbs", `${base}/api/${data.entityPlural}Api.ts`],
    ["api/queries/keys.ts.hbs", `${base}/api/queries/${data.entityPlural}Keys.ts`],
    ["api/queries/query.ts.hbs", `${base}/api/queries/use${data.EntityPlural}Query.ts`],
    ["api/mutations/mutations.ts.hbs", `${base}/api/mutations/use${data.Entity}Mutations.ts`],
    ["domain/entities/entity.ts.hbs", `${base}/domain/entities/${data.entity}.ts`],
    ["domain/rules/rules.ts.hbs", `${base}/domain/rules/${data.entity}Rules.ts`],
    ["domain/rules/rules.test.ts.hbs", `${base}/domain/rules/${data.entity}Rules.test.ts`],
    ["components/organisms/table/columns.tsx.hbs", `${org}/${data.entityKebab}-table/${data.Entity}Table.columns.tsx`],
    ["components/organisms/table/columns.test.tsx.hbs", `${org}/${data.entityKebab}-table/${data.Entity}Table.columns.test.tsx`],
    ["components/organisms/table/views.ts.hbs", `${org}/${data.entityKebab}-table/${data.Entity}Table.views.ts`],
    ["components/organisms/table/index.ts.hbs", `${org}/${data.entityKebab}-table/index.ts`],
    ["components/organisms/form/sections.tsx.hbs", `${org}/${data.entityKebab}-form/${data.Entity}FormSections.tsx`],
    ["components/organisms/form/sections.test.tsx.hbs", `${org}/${data.entityKebab}-form/${data.Entity}FormSections.test.tsx`],
    ["components/organisms/form/index.ts.hbs", `${org}/${data.entityKebab}-form/index.ts`],
    ["drawers/Drawer.hook.ts.hbs", `${base}/drawers/${data.Entity}Drawer.hook.ts`],
    ["drawers/Drawer.tsx.hbs", `${base}/drawers/${data.Entity}Drawer.tsx`],
    ["pages/usePage.hook.tsx.hbs", `${base}/pages/use${data.EntityPlural}Page.tsx`],
    ["pages/Page.tsx.hbs", `${base}/pages/${data.EntityPlural}Page.tsx`],
    ["tests/integration/Page.test.tsx.hbs", `${base}/tests/integration/${data.EntityPlural}Page.test.tsx`],
    ["locale.ts.hbs", `${base}/${data.namespace}.locale.ts`],
    ["index.ts.hbs", `${base}/index.ts`],
  ];
  if (data.hasStatus) {
    const badge = `${base}/components/molecules/${data.entityKebab}-status-badge`;
    files.push(
      ["components/molecules/status-badge.tsx.hbs", `${badge}/${data.Entity}StatusBadge.tsx`],
      ["components/molecules/status-badge.test.tsx.hbs", `${badge}/${data.Entity}StatusBadge.test.tsx`],
      ["components/molecules/index.ts.hbs", `${badge}/index.ts`],
    );
  }
  return files;
}

/** Các thay đổi nối vào file chung: { file, marker, snippet, id } */
export function wiringPlan(data) {
  const tag = (suffix) => `${data.moduleKebab}:${suffix}`;
  const route = `${json(data.routePath)}`;
  return [
    {
      file: "src/v2/app/router/v2RouteConfig.ts",
      marker: "// plop:v2-routes",
      id: tag("routes"),
      snippet: [
        "{",
        `  id: ${route},`,
        `  path: ${json(`/v2/${data.routePath}`)},`,
        `  title: ${json(data.titleVi)},`,
        `  permission: { collection: ${json(data.permissionCollection)}, action: "read" },`,
        "},",
        `// v2-module:${tag("routes")}`,
      ].join("\n"),
    },
    {
      file: "src/v2/app/layouts/v2-app-layout/navigation/v2Navigation.config.ts",
      marker: "// plop:v2-nav-items",
      id: tag("nav"),
      snippet: [
        "{",
        `  id: ${route},`,
        `  sectionId: ${json(data.navSection)},`,
        `  labelKey: "v2.nav.items.${data.routeCamel}",`,
        `  fallback: ${json(data.titleVi)},`,
        "  icon: FileText,",
        `  href: ${json(`/v2/${data.routePath}`)},`,
        "},",
        `// v2-module:${tag("nav")}`,
      ].join("\n"),
    },
    {
      file: "src/v2/shared/locales/vi.ts",
      marker: "// plop:v2-nav-items",
      id: tag("locale-vi"),
      snippet: `${data.routeCamel}: ${json(data.titleVi)},\n// v2-module:${tag("locale-vi")}`,
    },
    {
      file: "src/v2/shared/locales/en.ts",
      marker: "// plop:v2-nav-items",
      id: tag("locale-en"),
      snippet: `${data.routeCamel}: ${json(data.titleEn)},\n// v2-module:${tag("locale-en")}`,
    },
    {
      file: "src/v2/app/router/v2PageRegistry.tsx",
      marker: "// plop:v2-page-imports",
      id: tag("imports"),
      snippet: `import { ${data.EntityPlural}Page } from "@/v2/modules/${data.moduleKebab}"; // v2-module:${tag("imports")}`,
    },
    {
      file: "src/v2/app/router/v2PageRegistry.tsx",
      marker: "// plop:v2-pages",
      id: tag("pages"),
      snippet: `${json(data.routePath)}: () => <${data.EntityPlural}Page />,\n// v2-module:${tag("pages")}`,
    },
  ];
}

export { insertAtMarker };
