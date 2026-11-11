import { registerV2ModuleLocale } from "@/v2/shared/locales";

import {
  PROCUREMENT_WORKFLOW_EN,
  PROCUREMENT_WORKFLOW_VI,
} from "./procurementWorkflow.text.data";

const nest = (flat: Record<string, string>) => {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = root;
    parts.slice(0, -1).forEach((part) => {
      node = (node[part] ??= {}) as Record<string, unknown>;
    });
    node[parts[parts.length - 1]] = value;
  }
  return root;
};

/** Chữ sơ đồ quy trình chuỗi mua. Khóa: `v2.procurementWorkflow.*` */
registerV2ModuleLocale("procurementWorkflow", {
  vi: nest(PROCUREMENT_WORKFLOW_VI),
  en: nest(PROCUREMENT_WORKFLOW_EN),
});
