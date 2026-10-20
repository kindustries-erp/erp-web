import { DEV_CANVAS } from "./devCanvasData";
import { END_USER_CANVAS } from "./endUserCanvasData";
import type {
  GarageWorkflowCanvasDefinition,
  GarageWorkflowCanvasId,
} from "./garageWorkflowTypes";

/** Mã `tinh_trang_dich_vu` đã xác minh trong code (KGARA_STATUS_COMPLETED, filter != 9). */
export const GARAGE_STATUS_CODES = { COMPLETED: 3, CANCELLED: 9 } as const;

export const GARAGE_WORKFLOW_CANVASES: Record<
  GarageWorkflowCanvasId,
  GarageWorkflowCanvasDefinition
> = {
  "end-user": END_USER_CANVAS,
  dev: DEV_CANVAS,
};

/** Thứ tự tab trong drawer: tab đầu là mặc định. */
export const GARAGE_WORKFLOW_CANVAS_ORDER: GarageWorkflowCanvasId[] = [
  "end-user",
  "dev",
];
