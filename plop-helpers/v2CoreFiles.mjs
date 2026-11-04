/**
 * Danh sách file khung của một lõi họ V2 (web).
 * `template` nằm trong `plop-templates/`, `path` là đường dẫn đích từ thư mục gốc của repo.
 * Hook danh sách, query và drawer KHÔNG sinh tự động: người viết lõi viết tay rồi khai báo vào manifest.
 */
export function v2CoreFileMap(data) {
  const dir = data.coreDir;
  return [
    { template: "v2-core/config.type.ts.hbs", path: `${dir}/${data.configFile}.ts` },
    { template: "v2-core/api-type.ts.hbs", path: `${dir}/${data.apiTypeFile}.ts` },
    { template: "v2-core/keys.ts.hbs", path: `${dir}/${data.keysFile}.ts` },
    { template: "v2-core/domain.ts.hbs", path: `${dir}/${data.domainFile}.ts` },
    { template: "v2-core/locale.ts.hbs", path: `${dir}/${data.family}.locale.ts` },
    { template: "v2-core/barrel.ts.hbs", path: `${dir}/index.ts` },
  ];
}
