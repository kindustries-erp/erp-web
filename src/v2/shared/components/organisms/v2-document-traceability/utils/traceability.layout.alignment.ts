import type {
  TraceabilityEdge,
  TraceabilityLayoutDirection,
  TraceabilityStageKey,
} from "../types/traceability.type";
import type { StageNodeGroup } from "./traceability.layout.barycenter";
import { CARD_WIDTH } from "./traceability.layout.placement";

export const HORIZONTAL_METRICS = {
  columnWidth: 330,
  headerHeight: 48,
  rowGap: 185,
  minColumnHeight: 180,
  bottomPadding: 30,
};

export const VERTICAL_METRICS = {
  minRowWidth: 780,
  rowHeight: 190,
  cardGap: 30,
  headerHeight: 48,
  edgePadding: 20,
};

export interface AlignedStageResult {
  nodePositions: Map<string, { x: number; y: number }>;
  stageDimensions: Map<TraceabilityStageKey, { width: number; height: number }>;
}

/**
 * Tính toán vị trí x, y gióng hàng cho các node chứng từ trong từng stage,
 * ưu tiên các cặp node có liên kết nằm ngang hàng nhau (đường nối thẳng).
 */
export function computeAlignedStagePositions(
  stages: StageNodeGroup[],
  edges: TraceabilityEdge[],
  direction: TraceabilityLayoutDirection,
): AlignedStageResult {
  const nodePositions = new Map<string, { x: number; y: number }>();
  const stageDimensions = new Map<
    TraceabilityStageKey,
    { width: number; height: number }
  >();

  // Bản đồ stage của từng node
  const nodeStageMap = new Map<string, number>();
  stages.forEach((stage, idx) => {
    stage.nodes.forEach((n) => nodeStageMap.set(n.id, idx));
  });

  // Bản đồ các node cha ở stage trước
  const upstreamNeighbors = new Map<string, string[]>();
  for (const edge of edges) {
    const sStage = nodeStageMap.get(edge.source);
    const tStage = nodeStageMap.get(edge.target);
    if (sStage === undefined || tStage === undefined || sStage === tStage)
      continue;

    const [parent, child] =
      sStage < tStage ? [edge.source, edge.target] : [edge.target, edge.source];
    if (!upstreamNeighbors.has(child)) upstreamNeighbors.set(child, []);
    upstreamNeighbors.get(child)!.push(parent);
  }

  if (direction === "horizontal") {
    alignHorizontal(stages, upstreamNeighbors, nodePositions, stageDimensions);
  } else {
    alignVertical(stages, upstreamNeighbors, nodePositions, stageDimensions);
  }

  return { nodePositions, stageDimensions };
}

function alignHorizontal(
  stages: StageNodeGroup[],
  upstream: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
  dimensions: Map<TraceabilityStageKey, { width: number; height: number }>,
) {
  const { columnWidth, headerHeight, rowGap, minColumnHeight, bottomPadding } =
    HORIZONTAL_METRICS;
  const nodeX = (columnWidth - CARD_WIDTH) / 2;

  stages.forEach((stage) => {
    const docs = stage.nodes;
    if (docs.length === 0) {
      dimensions.set(stage.stageKey, {
        width: columnWidth,
        height: minColumnHeight,
      });
      return;
    }

    // 1. Tính targetY lý tưởng
    const ys = docs.map((doc, idx) => {
      const parents = upstream.get(doc.id)?.filter((p) => positions.has(p));
      if (parents && parents.length > 0) {
        const sumY = parents.reduce((acc, p) => acc + positions.get(p)!.y, 0);
        return sumY / parents.length;
      }
      return headerHeight + idx * rowGap;
    });

    // 2. Chống va chạm: đảm bảo y[i+1] >= y[i] + rowGap
    if (ys[0] < headerHeight) ys[0] = headerHeight;
    for (let i = 0; i < ys.length - 1; i++) {
      if (ys[i + 1] < ys[i] + rowGap) {
        ys[i + 1] = ys[i] + rowGap;
      }
    }

    // 3. Gán vị trí và tính chiều cao khung stage
    let maxY = 0;
    docs.forEach((doc, idx) => {
      positions.set(doc.id, { x: nodeX, y: ys[idx] });
      if (ys[idx] > maxY) maxY = ys[idx];
    });

    const height = Math.max(minColumnHeight, maxY + 140 + bottomPadding);
    dimensions.set(stage.stageKey, { width: columnWidth, height });
  });
}

function alignVertical(
  stages: StageNodeGroup[],
  upstream: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
  dimensions: Map<TraceabilityStageKey, { width: number; height: number }>,
) {
  const { minRowWidth, rowHeight, cardGap, headerHeight, edgePadding } =
    VERTICAL_METRICS;
  const nodeY = headerHeight + 8;

  stages.forEach((stage) => {
    const docs = stage.nodes;
    if (docs.length === 0) {
      dimensions.set(stage.stageKey, { width: minRowWidth, height: rowHeight });
      return;
    }

    const xs = docs.map((doc, idx) => {
      const parents = upstream.get(doc.id)?.filter((p) => positions.has(p));
      if (parents && parents.length > 0) {
        const sumX = parents.reduce((acc, p) => acc + positions.get(p)!.x, 0);
        return sumX / parents.length;
      }
      return edgePadding + idx * (CARD_WIDTH + cardGap);
    });

    if (xs[0] < edgePadding) xs[0] = edgePadding;
    for (let i = 0; i < xs.length - 1; i++) {
      if (xs[i + 1] < xs[i] + CARD_WIDTH + cardGap) {
        xs[i + 1] = xs[i] + CARD_WIDTH + cardGap;
      }
    }

    let maxX = 0;
    docs.forEach((doc, idx) => {
      positions.set(doc.id, { x: xs[idx], y: nodeY });
      if (xs[idx] > maxX) maxX = xs[idx];
    });

    const width = Math.max(minRowWidth, maxX + CARD_WIDTH + edgePadding);
    dimensions.set(stage.stageKey, { width, height: rowHeight });
  });
}
