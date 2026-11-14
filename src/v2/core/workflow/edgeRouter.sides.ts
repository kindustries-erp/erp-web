import type { RoutePoint, RouteRect, RouteSide } from "./edgeRouter.type";

export const ROUTE_CELL = 10;
/** Khoảng cách đường đi giữ với mép thẻ. */
export const CLEARANCE = 8;
/** Khoảng cách điểm bắt đầu/kết thúc ra khỏi mép thẻ. */
export const EXIT_OFFSET = 12;
/** Chi phí phạt mỗi lần rẽ, tính bằng số ô. */
export const TURN_PENALTY = 6;
/** Phạt cho ô sát mép thẻ (chi phí cộng thêm mỗi ô). */
export const NEAR_PENALTY = 1.5;
/** Phạt cho mỗi mũi tên khác đã đi qua ô đó. */
export const SHARE_PENALTY = 4;
/** Dải quanh thẻ được coi là "sát mép" (tính từ mép đệm). */
export const NEAR_BAND = 2 * ROUTE_CELL;

/** Thứ tự hướng trên lưới: 0 phải, 1 xuống, 2 trái, 3 lên. */
export const GRID_STEPS: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
export const SIDE_DIRECTION: Record<RouteSide, number> = {
  right: 0,
  bottom: 1,
  left: 2,
  top: 3,
};

export function sidePoint(
  rect: RouteRect,
  side: RouteSide,
  offset: number,
): RoutePoint {
  switch (side) {
    case "right":
      return { x: rect.x + rect.width + offset, y: rect.y + rect.height / 2 };
    case "left":
      return { x: rect.x - offset, y: rect.y + rect.height / 2 };
    case "bottom":
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height + offset };
    case "top":
      return { x: rect.x + rect.width / 2, y: rect.y - offset };
  }
}

/** Các cặp (cạnh nguồn, cạnh đích) thử theo thứ tự: hướng chính trước, hướng phụ sau. */
export function sidePairs(
  source: RouteRect,
  target: RouteRect,
): [RouteSide, RouteSide][] {
  const dx = target.x + target.width / 2 - (source.x + source.width / 2);
  const dy = target.y + target.height / 2 - (source.y + source.height / 2);
  const horizontal: [RouteSide, RouteSide] =
    dx >= 0 ? ["right", "left"] : ["left", "right"];
  const vertical: [RouteSide, RouteSide] =
    dy >= 0 ? ["bottom", "top"] : ["top", "bottom"];
  return Math.abs(dx) >= Math.abs(dy)
    ? [horizontal, vertical]
    : [vertical, horizontal];
}

/** Các cặp cạnh thử cho một mũi tên, hướng chính trước. */
export function candidateSides(
  source: RouteRect,
  target: RouteRect,
): [RouteSide, RouteSide][] {
  return sidePairs(source, target).slice(0, 2);
}
