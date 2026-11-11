import type { RoutePoint, RouteRect } from "./edgeRouter.type";
import {
  CLEARANCE,
  GRID_STEPS,
  NEAR_BAND,
  NEAR_PENALTY,
  ROUTE_CELL,
  SHARE_PENALTY,
  TURN_PENALTY,
} from "./edgeRouter.sides";

export class MinHeap {
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

export interface Grid {
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

export function buildGrid(bounds: RouteRect, obstacles: RouteRect[]): Grid {
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

export function toCell(grid: Grid, point: RoutePoint): [number, number] {
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

export function cellCenter(grid: Grid, i: number, j: number): RoutePoint {
  return {
    x: grid.originX + (i + 0.5) * ROUTE_CELL,
    y: grid.originY + (j + 0.5) * ROUTE_CELL,
  };
}

/** A* trên trạng thái (ô, hướng) để phạt đúng số lần rẽ. Trả về danh sách ô hoặc null. */
export function findCellPath(
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
export function simplify(points: RoutePoint[]): RoutePoint[] {
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
