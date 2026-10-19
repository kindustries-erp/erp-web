import type { GarageWorkflowCanvasDefinition } from "./garageWorkflowTypes";
import { unionBounds, type WorkflowBounds } from "./useWorkflowExport";

/** Chiều cao khối tiêu đề + mô tả đặt phía trên sơ đồ khi xuất PNG/PDF. */
export const WORKFLOW_HEADING_HEIGHT = 96;

interface CanvasBoundsOptions {
  /** Cộng thêm khối tiêu đề phía trên (khi xuất PNG/PDF). */
  withHeading?: boolean;
  /** Tính cả các cột của lớp chỉ đọc (khi đang bật luồng đọc). */
  showRead?: boolean;
}

/** Khung bao toàn bộ canvas đang hiển thị. */
export function canvasBounds(
  canvas: GarageWorkflowCanvasDefinition,
  options: CanvasBoundsOptions = {},
): WorkflowBounds {
  const columns = canvas.columns.filter(
    (column) => column.layer !== "read" || options.showRead,
  );
  const lanes = canvas.lanes.filter(
    (lane) => lane.layer !== "read" || options.showRead,
  );
  const base = unionBounds([...lanes, ...columns]);
  if (!options.withHeading) return base;
  return {
    x: base.x,
    y: base.y - WORKFLOW_HEADING_HEIGHT,
    width: base.width,
    height: base.height + WORKFLOW_HEADING_HEIGHT,
  };
}
