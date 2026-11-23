/**
 * `core.manifest.json` của lõi họ V2 (web).
 * `exports` ghi tên hook/type UI thật của lõi. Lõi mới sinh bởi `v2-core` để `exports: null`:
 * `v2-thin-module` từ chối ghép cho đến khi người viết lõi bổ sung hook danh sách, query và drawer.
 */
export function buildV2CoreManifest(data, exports = null) {
  return {
    schemaVersion: 1,
    layer: "web",
    family: data.family,
    entity: data.entity,
    barrel: `${data.coreDir}/index.ts`,
    localeNamespace: data.localeNamespace,
    exports,
  };
}

/** Nội dung JSON của manifest, đã thụt lề để ghi đúng file. */
export function v2CoreManifestJson(data, exports = null) {
  return `${JSON.stringify(buildV2CoreManifest(data, exports), null, 2)}\n`;
}
