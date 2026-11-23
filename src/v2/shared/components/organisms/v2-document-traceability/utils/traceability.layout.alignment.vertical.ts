import type { TraceabilityStageKey } from "../types/traceability.type";
import type { StageNodeGroup } from "./traceability.layout.barycenter";
import { CARD_WIDTH } from "./traceability.layout.placement";
import { buildDownstreamMap } from "./traceability.layout.alignment.horizontal";

export const VERTICAL_METRICS = {
  minRowWidth: 780,
  rowHeight: 190,
  cardGap: 30,
  headerHeight: 20,
  edgePadding: 20,
};

export function alignVertical(
  stages: StageNodeGroup[],
  upstream: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
  dimensions: Map<TraceabilityStageKey, { width: number; height: number }>,
) {
  const { minRowWidth, rowHeight, cardGap, headerHeight, edgePadding } =
    VERTICAL_METRICS;
  const nodeY = headerHeight + 8;
  const stepX = CARD_WIDTH + cardGap;

  const maxDocs = Math.max(1, ...stages.map((s) => s.nodes.length));
  const maxContentWidth = (maxDocs - 1) * stepX;

  stages.forEach((stage) => {
    const docs = stage.nodes;
    if (docs.length === 0) {
      dimensions.set(stage.stageKey, { width: minRowWidth, height: rowHeight });
      return;
    }

    const stageWidth = (docs.length - 1) * stepX;
    const defaultStageOffsetX = (maxContentWidth - stageWidth) / 2;

    const targetXs = docs.map((doc, idx) => {
      const parents = upstream.get(doc.id)?.filter((p) => positions.has(p));
      if (parents && parents.length > 0) {
        return (
          parents.reduce((acc, p) => acc + positions.get(p)!.x, 0) /
          parents.length
        );
      }
      return edgePadding + defaultStageOffsetX + idx * stepX;
    });

    const xs = [...targetXs];
    for (let i = 0; i < xs.length - 1; i++) {
      if (xs[i + 1] < xs[i] + stepX) {
        xs[i + 1] = xs[i] + stepX;
      }
    }

    const currentSpanCenter = (xs[0] + xs[xs.length - 1]) / 2;
    const desiredCenter = targetXs.reduce((a, b) => a + b, 0) / targetXs.length;
    const shift = desiredCenter - currentSpanCenter;
    const shiftedXs = xs.map((x) => x + shift);

    const minAllowedX = edgePadding;
    const finalShift =
      shiftedXs[0] < minAllowedX ? minAllowedX - shiftedXs[0] : 0;
    const finalXs = shiftedXs.map((x) => x + finalShift);

    docs.forEach((doc, idx) =>
      positions.set(doc.id, { x: finalXs[idx], y: nodeY }),
    );
  });

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
        const curX = positions.get(parentId)!.x;
        const nextX = positions.get(nextId)!.x;
        const midX = (curX + nextX) / 2;
        positions.set(parentId, { x: midX, y: nodeY });
        positions.set(nextId, { x: midX, y: nodeY });
      } else if (children && children.length > 1) {
        const avgX =
          children.reduce((acc, c) => acc + positions.get(c)!.x, 0) /
          children.length;
        positions.set(parentId, { x: Math.max(edgePadding, avgX), y: nodeY });
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
