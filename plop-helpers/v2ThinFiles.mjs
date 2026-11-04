/**
 * Danh sách file của một module mỏng V2 (web).
 * `template` nằm trong `plop-templates/v2-thin-module/`, `path` là đường dẫn đích từ thư mục gốc của repo.
 * Route, menu, i18n và page registry được nối bằng `wiringPlan` khi `wire = true` (xem plopfile).
 */
export function v2ThinFileMap(data) {
  const base = data.modulePath;
  const c = data.moduleCamel;
  return [
    { template: "config.ts.hbs", path: `${base}/${c}.config.ts` },
    { template: "api.ts.hbs", path: `${base}/api/${c}Api.ts` },
    { template: "locale.ts.hbs", path: `${base}/${c}.locale.ts` },
    { template: "page.tsx.hbs", path: `${base}/pages/${data.pageName}.tsx` },
    { template: "page.hook.ts.hbs", path: `${base}/pages/${data.pageName}.hook.ts` },
    { template: "index.ts.hbs", path: `${base}/index.ts` },
    { template: "config.test.ts.hbs", path: `${base}/tests/${c}.config.test.ts` },
    { template: "integration.test.tsx.hbs", path: `${base}/tests/integration/${data.pageName}.test.tsx` },
  ];
}
