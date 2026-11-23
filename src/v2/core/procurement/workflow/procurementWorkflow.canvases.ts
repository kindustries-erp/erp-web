import type { WorkflowCanvasDefinition } from "@/v2/core/workflow";

import { PROCUREMENT_DEV_CANVAS } from "./procurementWorkflow.dev";
import { PROCUREMENT_END_USER_CANVAS } from "./procurementWorkflow.endUser";

export const PROCUREMENT_WORKFLOW_CANVASES: Record<
  string,
  WorkflowCanvasDefinition
> = {
  "end-user": PROCUREMENT_END_USER_CANVAS,
  dev: PROCUREMENT_DEV_CANVAS,
};

export const PROCUREMENT_WORKFLOW_ORDER = ["end-user", "dev"];
