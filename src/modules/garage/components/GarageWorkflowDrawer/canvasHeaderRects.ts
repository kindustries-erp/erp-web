import type { RouteRect } from "./edgeRouter";
import type {
  GarageWorkflowCanvasDefinition,
  GarageWorkflowLane,
} from "./garageWorkflowTypes";

/** Chiều cao thanh tiêu đề của khung (lane) đặt phía trên. */
export const LANE_HEADER_TOP = 40;
/** Chiều rộng thanh tiêu đề của hàng (lane) đặt bên trái. */
export const LANE_HEADER_LEFT = 200;
/** Chiều cao thanh tiêu đề của cột. */
export const COLUMN_HEADER_HEIGHT = 48;
/** Lane rộng hơn cao nhiều (hàng của lưới) thì tiêu đề nằm bên trái. */
const HORIZONTAL_LANE_RATIO = 3;

export function resolveLaneHeaderSide(
  lane: Pick<GarageWorkflowLane, "width" | "height" | "headerSide">,
): "top" | "left" {
  return (
    lane.headerSide ??
    (lane.width > lane.height * HORIZONTAL_LANE_RATIO ? "left" : "top")
  );
}

/**
 * Các thanh tiêu đề đang hiển thị (khung, cột, ô góc). Mũi tên và nhãn không được đè lên
 * những vùng này vì chúng nằm cùng lớp với chữ tiêu đề.
 */
export function canvasHeaderRects(
  canvas: GarageWorkflowCanvasDefinition,
  options: { showRead?: boolean } = {},
): RouteRect[] {
  const showRead = options.showRead ?? false;
  const rects: RouteRect[] = [];

  canvas.lanes
    .filter((lane) => showRead || lane.layer !== "read")
    .forEach((lane) => {
      rects.push(
        resolveLaneHeaderSide(lane) === "left"
          ? {
              x: lane.x,
              y: lane.y,
              width: LANE_HEADER_LEFT,
              height: lane.height,
            }
          : {
              x: lane.x,
              y: lane.y,
              width: lane.width,
              height: LANE_HEADER_TOP,
            },
      );
    });

  canvas.columns
    .filter((column) => showRead || column.layer !== "read")
    .forEach((column) => {
      rects.push({
        x: column.x,
        y: column.y,
        width: column.width,
        height: COLUMN_HEADER_HEIGHT,
      });
    });

  if (canvas.corner) {
    rects.push({
      x: canvas.corner.x,
      y: canvas.corner.y,
      width: canvas.corner.width,
      height: canvas.corner.height,
    });
  }

  return rects;
}
