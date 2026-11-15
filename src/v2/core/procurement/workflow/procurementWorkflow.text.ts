import type { WorkflowCanvasText } from "@/v2/core/workflow";

import { PROCUREMENT_WORKFLOW_VI } from "./procurementWorkflow.text.data";

export const PROCUREMENT_WORKFLOW_PREFIX = "v2.procurementWorkflow";

/** Chuỗi hiển thị theo khóa phẳng; `fallback` là bản tiếng Việt. */
export const txt = (path: string): WorkflowCanvasText => ({
  key: `${PROCUREMENT_WORKFLOW_PREFIX}.${path}`,
  fallback: PROCUREMENT_WORKFLOW_VI[path] ?? path,
});

export const FLOW = { post: "post", cancel: "cancel" } as const;
