import { DEV_CANVAS } from "./devCanvas.data";
import { END_USER_CANVAS } from "./endUserCanvas.data";
import type {
  WorkflowCanvasDefinition,
  WorkflowCanvasId,
} from "@/v2/core/workflow";

/** Mã `tinh_trang_dich_vu` đã xác minh trong code (KGARA_STATUS_COMPLETED, filter != 9). */
export const GARAGE_STATUS_CODES = { COMPLETED: 3, CANCELLED: 9 } as const;

export const GARAGE_WORKFLOW_CANVASES: Record<
  WorkflowCanvasId,
  WorkflowCanvasDefinition
> = {
  "end-user": END_USER_CANVAS,
  dev: DEV_CANVAS,
};

/** Thứ tự tab trong drawer: tab đầu là mặc định. */
export const GARAGE_WORKFLOW_CANVAS_ORDER: WorkflowCanvasId[] = [
  "end-user",
  "dev",
];
