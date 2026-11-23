import type { RoutePoint, RouteRect } from "./edgeRouter";

export interface LabelRequest {
  id: string;
  /** Các điểm của đường đi mũi tên (đã tránh thẻ). */
  points: RoutePoint[];
  width: number;
  height: number;
}

/** Khoảng cách giữa các ứng viên dọc đường đi. */
const SAMPLE_STEP = 14;
/** Không đặt nhãn sát góc rẽ (dễ đè lên chỗ gấp khúc). */
const CORNER_MARGIN = 18;
const OBSTACLE_MARGIN = 3;
const LABEL_MARGIN = 4;
/** Phạt khi nhãn đè lên mũi tên khác. */
const CROSS_PENALTY = 40;
/** Phạt nhẹ theo khoảng cách tới giữa đoạn dài nhất (ưu tiên vị trí đẹp). */
const CENTER_PENALTY = 0.02;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function overlaps(a: Box, b: Box, margin: number): boolean {
  return (
    a.x < b.x + b.width + margin &&
    b.x < a.x + a.width + margin &&
    a.y < b.y + b.height + margin &&
    b.y < a.y + a.height + margin
  );
}

/** Đoạn orthogonal giao với hộp: so bbox của đoạn với hộp (đoạn thẳng hàng nên bbox chính là đoạn). */
function segmentHitsBox(a: RoutePoint, b: RoutePoint, box: Box): boolean {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return (
    minX < box.x + box.width &&
    maxX > box.x &&
    minY < box.y + box.height &&
    maxY > box.y
  );
}

function pathHitsBox(points: RoutePoint[], box: Box): boolean {
  for (let k = 0; k < points.length - 1; k += 1) {
    if (segmentHitsBox(points[k], points[k + 1], box)) return true;
  }
  return false;
}

/** Ứng viên đặt nhãn: các điểm lấy mẫu dọc đường đi, bỏ qua vùng gần góc rẽ. */
function candidates(points: RoutePoint[]): RoutePoint[] {
  const result: RoutePoint[] = [];
  for (let k = 0; k < points.length - 1; k += 1) {
    const a = points[k];
    const b = points[k + 1];
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (length === 0) continue;
    const ux = (b.x - a.x) / length;
    const uy = (b.y - a.y) / length;
    for (let d = CORNER_MARGIN; d <= length - CORNER_MARGIN; d += SAMPLE_STEP) {
      result.push({ x: a.x + ux * d, y: a.y + uy * d });
    }
  }
  return result;
}

function longestSegmentMidpoint(points: RoutePoint[]): RoutePoint {
  let best = { length: -1, point: points[0] ?? { x: 0, y: 0 } };
  for (let k = 0; k < points.length - 1; k += 1) {
    const a = points[k];
    const b = points[k + 1];
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (length > best.length)
      best = { length, point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  }
  return best.point;
}

/**
 * Đặt nhãn cho từng mũi tên, trả về tâm nhãn theo id.
 * Nhãn chỉ nằm trên đường đi của mũi tên, không đè thẻ, không đè nhãn đã đặt,
 * và ưu tiên vị trí ít cắt mũi tên khác.
 */
export function placeLabels(
  requests: LabelRequest[],
  obstacles: RouteRect[],
): Map<string, RoutePoint> {
  const placed: Box[] = [];
  const result = new Map<string, RoutePoint>();

  for (const request of requests) {
    const center = longestSegmentMidpoint(request.points);
    let best: { cost: number; point: RoutePoint } | null = null;

    for (const point of candidates(request.points)) {
      const box: Box = {
        x: point.x - request.width / 2,
        y: point.y - request.height / 2,
        width: request.width,
        height: request.height,
      };
      if (obstacles.some((rect) => overlaps(box, rect, OBSTACLE_MARGIN)))
        continue;
      if (placed.some((other) => overlaps(box, other, LABEL_MARGIN))) continue;

      const crossings = requests.reduce(
        (sum, other) =>
          other.id !== request.id && pathHitsBox(other.points, box)
            ? sum + 1
            : sum,
        0,
      );
      const distance =
        Math.abs(point.x - center.x) + Math.abs(point.y - center.y);
      const cost = crossings * CROSS_PENALTY + distance * CENTER_PENALTY;
      if (!best || cost < best.cost) best = { cost, point };
    }

    // Không có chỗ trống thì đặt đúng giữa đoạn dài nhất, chấp nhận đè nhẹ.
    const chosen = best?.point ?? center;
    result.set(request.id, chosen);
    placed.push({
      x: chosen.x - request.width / 2,
      y: chosen.y - request.height / 2,
      width: request.width,
      height: request.height,
    });
  }

  return result;
}

/** Kích thước ước lượng của nhãn mũi tên: vòng số + tên mũi tên, cơ chế gọi nằm dòng dưới. */
export function estimateLabelSize(
  label: string,
  mechanism: string,
  hasStep: boolean,
): { width: number; height: number } {
  const textWidth = Math.max(label.length * 6.4, mechanism.length * 5.6);
  return {
    width: 16 + (hasStep ? 26 : 0) + textWidth,
    height: mechanism ? 34 : 20,
  };
}
