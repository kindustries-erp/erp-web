import type { TraceabilityStageKey } from "../types/traceability.type";
import type { StageNodeGroup } from "./traceability.layout.barycenter";
import { CARD_WIDTH } from "./traceability.layout.placement";

export const HORIZONTAL_METRICS = {
  columnWidth: 300,
  headerHeight: 0,
  rowGap: 180,
  minColumnHeight: 220,
  bottomPadding: 24,
};

export function buildDownstreamMap(
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

export function alignHorizontal(
  stages: StageNodeGroup[],
  upstream: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
  dimensions: Map<TraceabilityStageKey, { width: number; height: number }>,
) {
  const { columnWidth, headerHeight, rowGap, minColumnHeight, bottomPadding } =
    HORIZONTAL_METRICS;
  const nodeX = (columnWidth - CARD_WIDTH) / 2;

  const maxDocs = Math.max(1, ...stages.map((s) => s.nodes.length));
  const maxContentHeight = (maxDocs - 1) * rowGap;

  stages.forEach((stage) => {
    const docs = stage.nodes;
    if (docs.length === 0) {
      dimensions.set(stage.stageKey, {
        width: columnWidth,
        height: minColumnHeight,
      });
      return;
    }

    const stageHeight = (docs.length - 1) * rowGap;
    const defaultStageOffsetY = (maxContentHeight - stageHeight) / 2;

    const targetYs = docs.map((doc, idx) => {
      const parents = upstream.get(doc.id)?.filter((p) => positions.has(p));
      if (parents && parents.length > 0) {
        return (
          parents.reduce((acc, p) => acc + positions.get(p)!.y, 0) /
          parents.length
        );
      }
      return headerHeight + defaultStageOffsetY + idx * rowGap;
    });

    const ys = [...targetYs];
    for (let i = 0; i < ys.length - 1; i++) {
      if (ys[i + 1] < ys[i] + rowGap) {
        ys[i + 1] = ys[i] + rowGap;
      }
    }

    const currentSpanCenter = (ys[0] + ys[ys.length - 1]) / 2;
    const desiredCenter = targetYs.reduce((a, b) => a + b, 0) / targetYs.length;
    const shift = desiredCenter - currentSpanCenter;
    const shiftedYs = ys.map((y) => y + shift);

    const minAllowedY = headerHeight;
    const finalShift =
      shiftedYs[0] < minAllowedY ? minAllowedY - shiftedYs[0] : 0;
    const finalYs = shiftedYs.map((y) => y + finalShift);

    docs.forEach((doc, idx) =>
      positions.set(doc.id, { x: nodeX, y: finalYs[idx] }),
    );
  });

  // Backward pass: đảm bảo các cặp node 1-1 giữa các stage liên tiếp luôn cùng hàng Y
  const downstream = buildDownstreamMap(upstream);
  for (let s = stages.length - 2; s >= 0; s--) {
    const docs = stages[s].nodes;
    if (docs.length === 1) {
      const parentId = docs[0].id;
      const children = downstream
        .get(parentId)
        ?.filter((c) => positions.has(c));
      const nextStageDocs = stages[s + 1]?.nodes;

      if (
        nextStageDocs &&
        nextStageDocs.length === 1 &&
        children &&
        children.includes(nextStageDocs[0].id)
      ) {
        const nextId = nextStageDocs[0].id;
        const curY = positions.get(parentId)!.y;
        const nextY = positions.get(nextId)!.y;
        const midY = (curY + nextY) / 2;
        positions.set(parentId, { x: nodeX, y: midY });
        positions.set(nextId, { x: nodeX, y: midY });
      } else if (children && children.length > 1) {
        const avgY =
          children.reduce((acc, c) => acc + positions.get(c)!.y, 0) /
          children.length;
        positions.set(parentId, {
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
