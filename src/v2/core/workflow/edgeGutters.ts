import type { RoutePoint, RouteRect } from "./edgeRouter";

/** Khe là khoảng trống rộng tối thiểu này (px) giữa các nhóm thẻ. */
const MIN_GUTTER = 40;
/** Khoảng cách giữa các mũi tên cùng đi trong một khe. */
const SLOT_GAP = 12;
/** Phần khe chừa lại hai bên, mũi tên không sát mép khe. */
const GUTTER_MARGIN = 8;
/** Hai đoạn cùng khe cách nhau ít hơn mức này (px) thì coi là chồng nhau và phải chia slot. */
const SPAN_MARGIN = 8;

export interface Gutter {
  axis: "x" | "y";
  start: number;
  end: number;
  center: number;
}

export interface Gutters {
  /** Khe dọc: khoảng x không có thẻ nào, chạy suốt chiều cao. */
  vertical: Gutter[];
  /** Khe ngang: khoảng y không có thẻ nào, chạy suốt chiều rộng. */
  horizontal: Gutter[];
}

function gapsOf(intervals: [number, number][], axis: "x" | "y"): Gutter[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const gutters: Gutter[] = [];
  let reach = sorted.length > 0 ? sorted[0][1] : 0;
  for (let k = 1; k < sorted.length; k += 1) {
    const [start, end] = sorted[k];
    if (start - reach >= MIN_GUTTER) {
      gutters.push({
        axis,
        start: reach,
        end: start,
        center: (reach + start) / 2,
      });
    }
    reach = Math.max(reach, end);
  }
  return gutters;
}

/** Tìm các khe trống giữa các thẻ (theo cả hai trục). */
export function computeGutters(cards: RouteRect[]): Gutters {
  return {
    vertical: gapsOf(
      cards.map((card) => [card.x, card.x + card.width]),
      "x",
    ),
    horizontal: gapsOf(
      cards.map((card) => [card.y, card.y + card.height]),
      "y",
    ),
  };
}

interface SnapItem {
  route: number;
  index: number;
  axis: "x" | "y";
  gutter: Gutter;
  lo: number;
  hi: number;
}

/** Rút gọn điểm trùng và điểm thẳng hàng. */
function tidy(points: RoutePoint[]): RoutePoint[] {
  const deduped = points.filter(
    (point, k) =>
      k === 0 || point.x !== points[k - 1].x || point.y !== points[k - 1].y,
  );
  const result: RoutePoint[] = [];
  deduped.forEach((point, k) => {
    const prev = result[result.length - 1];
    const next = deduped[k + 1];
    if (
      prev &&
      next &&
      ((prev.x === point.x && point.x === next.x) ||
        (prev.y === point.y && point.y === next.y))
    )
      return;
    result.push(point);
  });
  return result;
}

/**
 * Căn các đoạn nằm trong khe về chính giữa khe. Nhiều đoạn chồng nhau trong cùng một khe
 * được chia slot và dàn đều đối xứng quanh tâm khe. Đoạn đầu và đoạn cuối (chạm thẻ) giữ nguyên.
 */
export function snapToGutters(
  routes: RoutePoint[][],
  gutters: Gutters,
): RoutePoint[][] {
  const items: SnapItem[] = [];

  routes.forEach((points, route) => {
    for (let k = 1; k + 2 < points.length; k += 1) {
      const a = points[k];
      const b = points[k + 1];
      if (a.x === b.x && a.y !== b.y) {
        const gutter = gutters.vertical.find(
          (g) => a.x > g.start && a.x < g.end,
        );
        if (gutter)
          items.push({
            route,
            index: k,
            axis: "x",
            gutter,
            lo: Math.min(a.y, b.y),
            hi: Math.max(a.y, b.y),
          });
      } else if (a.y === b.y && a.x !== b.x) {
        const gutter = gutters.horizontal.find(
          (g) => a.y > g.start && a.y < g.end,
        );
        if (gutter)
          items.push({
            route,
            index: k,
            axis: "y",
            gutter,
            lo: Math.min(a.x, b.x),
            hi: Math.max(a.x, b.x),
          });
      }
    }
  });

  const snapped = routes.map((points) => points.map((point) => ({ ...point })));
  const groups = new Map<Gutter, SnapItem[]>();
  items.forEach((item) =>
    groups.set(item.gutter, [...(groups.get(item.gutter) ?? []), item]),
  );

  groups.forEach((group, gutter) => {
    const sorted = [...group].sort((a, b) => a.lo - b.lo);
    const slotEnds: number[] = [];
    const slotOf = new Map<SnapItem, number>();
    sorted.forEach((item) => {
      let slot = slotEnds.findIndex((end) => end + SPAN_MARGIN <= item.lo);
      if (slot === -1) {
        slot = slotEnds.length;
        slotEnds.push(item.hi);
      } else {
        slotEnds[slot] = item.hi;
      }
      slotOf.set(item, slot);
    });

    const slotCount = slotEnds.length;
    const width = gutter.end - gutter.start - GUTTER_MARGIN * 2;
    const gap = slotCount > 1 ? Math.min(SLOT_GAP, width / (slotCount - 1)) : 0;

    sorted.forEach((item) => {
      const offset = (slotOf.get(item)! - (slotCount - 1) / 2) * gap;
      const value = gutter.center + offset;
      const points = snapped[item.route];
      points[item.index][item.axis] = value;
      points[item.index + 1][item.axis] = value;
    });
  });

  return snapped.map(tidy);
}
