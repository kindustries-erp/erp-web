import { computeGutters, snapToGutters } from "./edgeGutters";

/**
 * Định tuyến mũi tên trực giao trên lưới: đường đi tránh mọi thẻ (obstacle),
 * ưu tiên ít lần rẽ. Chạy A* trên lưới ô vuông, rồi rút gọn các điểm thẳng hàng.
 */

export interface RouteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutePoint {
  x: number;
  y: number;
}

export type RouteSide = "top" | "right" | "bottom" | "left";

export interface RouteInput {
  /** Các thẻ cần tránh (không gồm thẻ nguồn và đích). */
  obstacles: RouteRect[];
  /** Vùng cho phép đi (khung canvas). */
  bounds: RouteRect;
  source: RouteRect;
  target: RouteRect;
}

export interface RouteResult {
  points: RoutePoint[];
  labelPoint: RoutePoint;
}

export const ROUTE_CELL = 10;
/** Khoảng cách đường đi giữ với mép thẻ. */
const CLEARANCE = 8;
/** Khoảng cách điểm bắt đầu/kết thúc ra khỏi mép thẻ. */
const EXIT_OFFSET = 12;
/** Chi phí phạt mỗi lần rẽ, tính bằng số ô. */
const TURN_PENALTY = 6;
/** Phạt cho ô sát mép thẻ (chi phí cộng thêm mỗi ô). */
const NEAR_PENALTY = 1.5;
/** Phạt cho mỗi mũi tên khác đã đi qua ô đó. */
const SHARE_PENALTY = 4;
/** Dải quanh thẻ được coi là "sát mép" (tính từ mép đệm). */
const NEAR_BAND = 2 * ROUTE_CELL;

/** Thứ tự hướng trên lưới: 0 phải, 1 xuống, 2 trái, 3 lên. */
const GRID_STEPS: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
const SIDE_DIRECTION: Record<RouteSide, number> = {
  right: 0,
  bottom: 1,
  left: 2,
  top: 3,
};

function sidePoint(
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
function sidePairs(
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

class MinHeap {
  private items: { key: number; value: number }[] = [];

  push(key: number, value: number) {
    this.items.push({ key, value });
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].key <= this.items[i].key) break;
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }

  pop(): { key: number; value: number } | undefined {
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = left + 1;
        let smallest = i;
        if (
          left < this.items.length &&
          this.items[left].key < this.items[smallest].key
        )
          smallest = left;
        if (
          right < this.items.length &&
          this.items[right].key < this.items[smallest].key
        )
          smallest = right;
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [
          this.items[i],
          this.items[smallest],
        ];
        i = smallest;
      }
    }
    return top;
  }

  get size() {
    return this.items.length;
  }
}

interface Grid {
  cols: number;
  rows: number;
  originX: number;
  originY: number;
  blocked: Uint8Array;
  /** Ô sát mép thẻ: đi qua bị phạt nhẹ để đường tránh đi sát thẻ. */
  near: Uint8Array;
  /** Số mũi tên đã đi qua mỗi ô: đi chồng lên mũi tên khác bị phạt nặng. */
  usage: Uint16Array;
}

function buildGrid(bounds: RouteRect, obstacles: RouteRect[]): Grid {
  const cols = Math.ceil(bounds.width / ROUTE_CELL);
  const rows = Math.ceil(bounds.height / ROUTE_CELL);
  const blocked = new Uint8Array(cols * rows);

  obstacles.forEach((rect) => {
    const left = rect.x - CLEARANCE;
    const top = rect.y - CLEARANCE;
    const right = rect.x + rect.width + CLEARANCE;
    const bottom = rect.y + rect.height + CLEARANCE;
    const i0 = Math.max(0, Math.floor((left - bounds.x) / ROUTE_CELL));
    const i1 = Math.min(cols - 1, Math.floor((right - bounds.x) / ROUTE_CELL));
    const j0 = Math.max(0, Math.floor((top - bounds.y) / ROUTE_CELL));
    const j1 = Math.min(rows - 1, Math.floor((bottom - bounds.y) / ROUTE_CELL));
    for (let j = j0; j <= j1; j += 1) {
      for (let i = i0; i <= i1; i += 1) blocked[j * cols + i] = 1;
    }
  });

  const near = new Uint8Array(cols * rows);
  obstacles.forEach((rect) => {
    const left = rect.x - CLEARANCE - NEAR_BAND;
    const top = rect.y - CLEARANCE - NEAR_BAND;
    const right = rect.x + rect.width + CLEARANCE + NEAR_BAND;
    const bottom = rect.y + rect.height + CLEARANCE + NEAR_BAND;
    const i0 = Math.max(0, Math.floor((left - bounds.x) / ROUTE_CELL));
    const i1 = Math.min(cols - 1, Math.floor((right - bounds.x) / ROUTE_CELL));
    const j0 = Math.max(0, Math.floor((top - bounds.y) / ROUTE_CELL));
    const j1 = Math.min(rows - 1, Math.floor((bottom - bounds.y) / ROUTE_CELL));
    for (let j = j0; j <= j1; j += 1) {
      for (let i = i0; i <= i1; i += 1) near[j * cols + i] = 1;
    }
  });

  return {
    cols,
    rows,
    originX: bounds.x,
    originY: bounds.y,
    blocked,
    near,
    usage: new Uint16Array(cols * rows),
  };
}

function toCell(grid: Grid, point: RoutePoint): [number, number] {
  return [
    Math.min(
      grid.cols - 1,
      Math.max(0, Math.floor((point.x - grid.originX) / ROUTE_CELL)),
    ),
    Math.min(
      grid.rows - 1,
      Math.max(0, Math.floor((point.y - grid.originY) / ROUTE_CELL)),
    ),
  ];
}

function cellCenter(grid: Grid, i: number, j: number): RoutePoint {
  return {
    x: grid.originX + (i + 0.5) * ROUTE_CELL,
    y: grid.originY + (j + 0.5) * ROUTE_CELL,
  };
}

/** A* trên trạng thái (ô, hướng) để phạt đúng số lần rẽ. Trả về danh sách ô hoặc null. */
function findCellPath(
  grid: Grid,
  start: [number, number],
  startDir: number,
  goal: [number, number],
): [number, number][] | null {
  const { cols, rows, blocked } = grid;
  const stateCount = cols * rows * 4;
  const gScore = new Float64Array(stateCount).fill(Infinity);
  const parent = new Int32Array(stateCount).fill(-1);
  const heap = new MinHeap();

  const heuristic = (i: number, j: number) =>
    Math.abs(i - goal[0]) + Math.abs(j - goal[1]);
  const startState = (start[1] * cols + start[0]) * 4 + startDir;
  gScore[startState] = 0;
  heap.push(heuristic(start[0], start[1]), startState);

  while (heap.size > 0) {
    const { value: state } = heap.pop()!;
    const dir = state % 4;
    const cell = (state - dir) / 4;
    const i = cell % cols;
    const j = Math.floor(cell / cols);

    if (i === goal[0] && j === goal[1]) {
      const cells: [number, number][] = [];
      let current = state;
      while (current !== -1) {
        const c = (current - (current % 4)) / 4;
        cells.push([c % cols, Math.floor(c / cols)]);
        current = parent[current];
      }
      return cells.reverse();
    }

    for (let nextDir = 0; nextDir < 4; nextDir += 1) {
      const [di, dj] = GRID_STEPS[nextDir];
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
      const nextCell = nj * cols + ni;
      if (blocked[nextCell] && !(ni === goal[0] && nj === goal[1])) continue;

      const turnCost = nextDir === dir ? 0 : TURN_PENALTY;
      const nearCost = grid.near[nextCell] ? NEAR_PENALTY : 0;
      const shareCost = grid.usage[nextCell] * SHARE_PENALTY;
      const tentative = gScore[state] + 1 + turnCost + nearCost + shareCost;
      const nextState = nextCell * 4 + nextDir;
      if (tentative < gScore[nextState]) {
        gScore[nextState] = tentative;
        parent[nextState] = state;
        heap.push(tentative + heuristic(ni, nj), nextState);
      }
    }
  }

  return null;
}

/** Bỏ điểm nằm giữa hai điểm thẳng hàng (cùng x hoặc cùng y). */
function simplify(points: RoutePoint[]): RoutePoint[] {
  if (points.length <= 2) return points;
  const result: RoutePoint[] = [points[0]];
  for (let k = 1; k < points.length - 1; k += 1) {
    const prev = result[result.length - 1];
    const cur = points[k];
    const next = points[k + 1];
    const collinear =
      (prev.x === cur.x && cur.x === next.x) ||
      (prev.y === cur.y && cur.y === next.y);
    if (!collinear) result.push(cur);
  }
  result.push(points[points.length - 1]);
  return result;
}

/** Điểm giữa của đoạn dài nhất, dùng để đặt nhãn. */
export function labelAnchor(points: RoutePoint[]): RoutePoint {
  let best = { length: -1, point: points[0] ?? { x: 0, y: 0 } };
  for (let k = 0; k < points.length - 1; k += 1) {
    const a = points[k];
    const b = points[k + 1];
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (length > best.length) {
      best = { length, point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    }
  }
  return best.point;
}

function fallbackRoute(source: RouteRect, target: RouteRect): RouteResult {
  const points = [
    { x: source.x + source.width / 2, y: source.y + source.height / 2 },
    { x: target.x + target.width / 2, y: target.y + target.height / 2 },
  ];
  return { points, labelPoint: labelAnchor(points) };
}

/** Chèn điểm gấp để mọi đoạn đều nằm ngang hoặc dọc (tránh đoạn chéo sau khi căn tâm). */
function orthogonalize(
  points: RoutePoint[],
  sourceHorizontal: boolean,
  targetHorizontal: boolean,
): RoutePoint[] {
  const result: RoutePoint[] = [points[0]];
  for (let k = 1; k < points.length; k += 1) {
    const a = result[result.length - 1];
    const b = points[k];
    if (a.x !== b.x && a.y !== b.y) {
      const isFirst = k === 1;
      const isLast = k === points.length - 1;
      const horizontalFirst = isFirst
        ? sourceHorizontal
        : isLast
          ? targetHorizontal
          : Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      if (horizontalFirst) {
        const midX = (a.x + b.x) / 2;
        result.push({ x: midX, y: a.y }, { x: midX, y: b.y });
      } else {
        const midY = (a.y + b.y) / 2;
        result.push({ x: a.x, y: midY }, { x: b.x, y: midY });
      }
    }
    result.push(b);
  }
  return result;
}

/**
 * Đưa đoạn đầu và đoạn cuối về đúng tâm cạnh thẻ nguồn/đích: ra vào thẻ ở chính giữa cạnh,
 * không lệch theo tâm ô lưới. Đoạn thẳng nối thẳng hai thẻ lệch tâm sẽ được gấp khúc nhẹ.
 */
function alignEndpoints(
  points: RoutePoint[],
  source: RouteRect,
  sourceSide: RouteSide,
  target: RouteRect,
  targetSide: RouteSide,
): RoutePoint[] {
  const pts = points.map((point) => ({ ...point }));
  const n = pts.length;
  if (n < 2) return pts;

  const sourceHorizontal = sourceSide === "left" || sourceSide === "right";
  const targetHorizontal = targetSide === "left" || targetSide === "right";
  const sourceAxis = sourceHorizontal ? "y" : "x";
  const targetAxis = targetHorizontal ? "y" : "x";
  const sourceValue = sourceHorizontal
    ? source.y + source.height / 2
    : source.x + source.width / 2;
  const targetValue = targetHorizontal
    ? target.y + target.height / 2
    : target.x + target.width / 2;

  const sourceBase = pts[0][sourceAxis];
  let startEnd = 0;
  while (startEnd < n && pts[startEnd][sourceAxis] === sourceBase) {
    pts[startEnd][sourceAxis] = sourceValue;
    startEnd += 1;
  }

  if (startEnd >= n) {
    pts[n - 1][targetAxis] = targetValue;
  } else {
    const targetBase = pts[n - 1][targetAxis];
    let j = n - 1;
    while (j >= startEnd && pts[j][targetAxis] === targetBase) {
      pts[j][targetAxis] = targetValue;
      j -= 1;
    }
  }

  return simplify(orthogonalize(pts, sourceHorizontal, targetHorizontal));
}

/** Các cặp cạnh thử cho một mũi tên, hướng chính trước. */
function candidateSides(
  source: RouteRect,
  target: RouteRect,
): [RouteSide, RouteSide][] {
  return sidePairs(source, target).slice(0, 2);
}

/** Định tuyến một mũi tên trên lưới đã có sẵn mật độ; trả về đường đi tốt nhất và các ô đi qua. */
function routeOnGrid(
  grid: Grid,
  source: RouteRect,
  target: RouteRect,
): { points: RoutePoint[]; cells: [number, number][] } | null {
  let best: {
    cost: number;
    points: RoutePoint[];
    cells: [number, number][];
  } | null = null;

  for (const [sourceSide, targetSide] of candidateSides(source, target)) {
    const exitStart = sidePoint(source, sourceSide, EXIT_OFFSET);
    const exitGoal = sidePoint(target, targetSide, EXIT_OFFSET);
    const startCell = toCell(grid, exitStart);
    const goalCell = toCell(grid, exitGoal);
    const cells = findCellPath(
      grid,
      startCell,
      SIDE_DIRECTION[sourceSide],
      goalCell,
    );
    if (!cells) continue;

    // Căn đầu và cuối theo tâm ô lưới để các đoạn thẳng hàng đúng, không bị lệch vài pixel.
    const startCenter = cellCenter(grid, startCell[0], startCell[1]);
    const goalCenter = cellCenter(grid, goalCell[0], goalCell[1]);
    const sourceHorizontal = sourceSide === "left" || sourceSide === "right";
    const targetHorizontal = targetSide === "left" || targetSide === "right";
    const sourceEdge = sidePoint(source, sourceSide, 0);
    const targetEdge = sidePoint(target, targetSide, 0);

    const middle = cells.map(([i, j]) => cellCenter(grid, i, j));
    const gridPoints = simplify([
      sourceHorizontal
        ? { x: sourceEdge.x, y: startCenter.y }
        : { x: startCenter.x, y: sourceEdge.y },
      sourceHorizontal
        ? { x: exitStart.x, y: startCenter.y }
        : { x: startCenter.x, y: exitStart.y },
      ...middle,
      targetHorizontal
        ? { x: exitGoal.x, y: goalCenter.y }
        : { x: goalCenter.x, y: exitGoal.y },
      targetHorizontal
        ? { x: targetEdge.x, y: goalCenter.y }
        : { x: goalCenter.x, y: targetEdge.y },
    ]);
    const points = alignEndpoints(
      gridPoints,
      source,
      sourceSide,
      target,
      targetSide,
    );
    const cost = points.reduce((sum, point, k) => {
      if (k === 0) return sum;
      const prev = points[k - 1];
      return sum + Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y);
    }, 0);
    if (!best || cost < best.cost) best = { cost, points, cells };
  }

  return best ? { points: best.points, cells: best.cells } : null;
}

/**
 * Định tuyến cả batch mũi tên. Mũi tên ngắn được định tuyến trước; mỗi mũi tên đã đi qua ô nào
 * thì các mũi tên sau bị phạt khi đi vào ô đó, nên đường ít chồng lên nhau hơn.
 * Kết quả trả về theo đúng thứ tự đầu vào.
 */
export function routeEdges(
  obstacles: RouteRect[],
  bounds: RouteRect,
  edges: { source: RouteRect; target: RouteRect }[],
): RouteResult[] {
  const grid = buildGrid(bounds, obstacles);
  const center = (rect: RouteRect) => ({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  });
  const order = edges
    .map((edge, index) => {
      const a = center(edge.source);
      const b = center(edge.target);
      return { index, length: Math.abs(a.x - b.x) + Math.abs(a.y - b.y) };
    })
    .sort(
      (left, right) => left.length - right.length || left.index - right.index,
    );

  const results: RouteResult[] = new Array(edges.length);
  for (const { index } of order) {
    const { source, target } = edges[index];
    const routed = routeOnGrid(grid, source, target);
    if (!routed) {
      results[index] = fallbackRoute(source, target);
      continue;
    }
    routed.cells.forEach(([i, j]) => {
      const cell = j * grid.cols + i;
      grid.usage[cell] = Math.min(grid.usage[cell] + 1, 0xffff);
    });
    results[index] = {
      points: routed.points,
      labelPoint: labelAnchor(routed.points),
    };
  }
  // Căn các đoạn nằm trong khe về chính giữa khe (chia slot đối xứng khi nhiều mũi tên chung khe).
  const snapped = snapToGutters(
    results.map((result) => result.points),
    computeGutters(obstacles),
  );
  return snapped.map((points) => ({ points, labelPoint: labelAnchor(points) }));
}

/** Định tuyến một mũi tên đơn lẻ (không tính mật độ của mũi tên khác). */
export function routeEdge(input: RouteInput): RouteResult {
  return routeEdges(input.obstacles, input.bounds, [
    { source: input.source, target: input.target },
  ])[0];
}
