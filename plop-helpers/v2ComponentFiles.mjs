import { kebabCase, pascalCase } from "./v2ModuleData.mjs";

/** Tầng Atomic V2 hợp lệ (khớp thư mục src/v2/shared/components/<layer>) */
export const COMPONENT_LAYERS = ["atoms", "molecules", "organisms"];

const LAYER_TITLE = { atoms: "Atoms", molecules: "Molecules", organisms: "Organisms" };

/** Chuẩn hóa đầu vào: tên bắt buộc tiền tố V2 (quy ước mọi component shared V2) */
export function buildComponentData(answers) {
  const layer = answers.layer;
  if (!COMPONENT_LAYERS.includes(layer)) {
    throw new Error(`Tầng không hợp lệ "${layer}", chọn: ${COMPONENT_LAYERS.join(", ")}`);
  }
  const Name = pascalCase(answers.name);
  if (!/^V2[A-Z][A-Za-z0-9]*$/.test(Name)) {
    throw new Error(`Tên "${answers.name}" phải bắt đầu bằng V2 và PascalCase, vd: V2TraceabilityCanvas`);
  }
  return {
    layer,
    layerTitle: LAYER_TITLE[layer],
    Name,
    folder: kebabCase(Name),
    description: answers.description || `${Name} dùng chung trong V2`,
  };
}

/** Danh sách template → file đích; thư mục gốc: src/v2/shared/components/<layer>/<folder>/ */
export function componentFileMap(data) {
  const base = `src/v2/shared/components/${data.layer}/${data.folder}`;
  return [
    ["Component.tsx.hbs", `${base}/${data.Name}.tsx`],
    ["Component.type.ts.hbs", `${base}/${data.Name}.type.ts`],
    ["Component.test.tsx.hbs", `${base}/${data.Name}.test.tsx`],
    ["Component.stories.tsx.hbs", `${base}/${data.Name}.stories.tsx`],
    ["index.ts.hbs", `${base}/index.ts`],
  ];
}

/** Thêm `export * from "./<folder>";` vào barrel của tầng (idempotent) */
export function addBarrelExport(content, folder) {
  const line = `export * from "./${folder}";`;
  if (content.split("\n").includes(line)) return content;
  const trimmed = content.endsWith("\n") ? content : `${content}\n`;
  return `${trimmed}${line}\n`;
}
