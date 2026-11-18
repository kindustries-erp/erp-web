import type {
  TraceabilityEdge,
  TraceabilityLayoutDirection,
  TraceabilityStageKey,
} from "../types/traceability.type";
import type { StageNodeGroup } from "./traceability.layout.barycenter";
import { CARD_WIDTH } from "./traceability.layout.placement";

export const HORIZONTAL_METRICS = {
  columnWidth: 300,
  headerHeight: 0,
  rowGap: 180,
  minColumnHeight: 220,
  bottomPadding: 24,
};
export const VERTICAL_METRICS = {
  minRowWidth: 780,
  rowHeight: 190,
  cardGap: 30,
  headerHeight: 20,
  edgePadding: 20,
};

export interface AlignedStageResult {
  nodePositions: Map<string, { x: number; y: number }>;
  stageDimensions: Map<TraceabilityStageKey, { width: number; height: number }>;
}

/**
 * Tính toán vị trí x, y gióng hàng cho các node chứng từ trong từng stage,
 * ưu tiên các cặp node có liên kết nằm ngang hàng nhau và căn giữa cân đối.
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

  const nodeStageMap = new Map<string, number>();
  stages.forEach((stage, idx) =>
    stage.nodes.forEach((n) => nodeStageMap.set(n.id, idx)),
  );

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

function buildDownstreamMap(
  upstream: Map<string, string[]>,
): Map<string, string[]> {
  const downstream = new Map<string, string[]>();
  upstream.forEach((parents, child) =>
    parents.forEach((p) => {
      const list = downstream.get(p) ?? [];
      list.push(child);
      downstream.set(p, list);
    }),
  );
  return downstream;
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

    const ys = docs.map((doc, idx) => {
      const parents = upstream.get(doc.id)?.filter((p) => positions.has(p));
      if (parents && parents.length > 0) {
        return (
          parents.reduce((acc, p) => acc + positions.get(p)!.y, 0) /
          parents.length
        );
      }
      return headerHeight + idx * rowGap;
    });

    if (ys[0] < headerHeight) ys[0] = headerHeight;
    for (let i = 0; i < ys.length - 1; i++) {
      if (ys[i + 1] < ys[i] + rowGap) ys[i + 1] = ys[i] + rowGap;
    }

    docs.forEach((doc, idx) => positions.set(doc.id, { x: nodeX, y: ys[idx] }));
  });

  // Backward pass: căn giữa node cha đơn lẻ theo trung bình con downstream
  const downstream = buildDownstreamMap(upstream);
  for (let s = stages.length - 2; s >= 0; s--) {
    const docs = stages[s].nodes;
    if (docs.length === 1) {
      const children = downstream
        .get(docs[0].id)
        ?.filter((c) => positions.has(c));
      if (children && children.length > 1) {
        const avgY =
          children.reduce((acc, c) => acc + positions.get(c)!.y, 0) /
          children.length;
        positions.set(docs[0].id, {
          x: nodeX,
          y: Math.max(headerHeight, avgY),
        });
      }
    }
  }

  // Đồng bộ chiều cao các cột swimlane
  let maxHeight = minColumnHeight;
  stages.forEach((stage) => {
    let maxY = 0;
    stage.nodes.forEach((doc) => {
      const p = positions.get(doc.id);
      if (p && p.y > maxY) maxY = p.y;
    });
    const h = Math.max(minColumnHeight, maxY + 140 + bottomPadding);
    if (h > maxHeight) maxHeight = h;
  });
  stages.forEach((stage) =>
    dimensions.set(stage.stageKey, { width: columnWidth, height: maxHeight }),
  );
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
        return (
          parents.reduce((acc, p) => acc + positions.get(p)!.x, 0) /
          parents.length
        );
      }
      return edgePadding + idx * (CARD_WIDTH + cardGap);
    });

    if (xs[0] < edgePadding) xs[0] = edgePadding;
    for (let i = 0; i < xs.length - 1; i++) {
      if (xs[i + 1] < xs[i] + CARD_WIDTH + cardGap) {
        xs[i + 1] = xs[i] + CARD_WIDTH + cardGap;
      }
    }

    docs.forEach((doc, idx) => positions.set(doc.id, { x: xs[idx], y: nodeY }));
  });

  const downstream = buildDownstreamMap(upstream);
  for (let s = stages.length - 2; s >= 0; s--) {
    const docs = stages[s].nodes;
    if (docs.length === 1) {
      const children = downstream
        .get(docs[0].id)
        ?.filter((c) => positions.has(c));
      if (children && children.length > 1) {
        const avgX =
          children.reduce((acc, c) => acc + positions.get(c)!.x, 0) /
          children.length;
        positions.set(docs[0].id, { x: Math.max(edgePadding, avgX), y: nodeY });
      }
    }
  }

  let maxWidth = minRowWidth;
  stages.forEach((stage) => {
    let maxX = 0;
    stage.nodes.forEach((doc) => {
      const p = positions.get(doc.id);
      if (p && p.x > maxX) maxX = p.x;
    });
    const w = Math.max(minRowWidth, maxX + CARD_WIDTH + edgePadding);
    if (w > maxWidth) maxWidth = w;
  });
  stages.forEach((stage) =>
    dimensions.set(stage.stageKey, { width: maxWidth, height: rowHeight }),
  );
}
