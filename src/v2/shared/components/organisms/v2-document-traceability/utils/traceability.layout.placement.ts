import type {
  TraceabilityLayoutDirection,
  TraceabilityStageConfig,
} from "../types/traceability.type";

export const CARD_WIDTH = 290;

/** Bố cục ngang: mỗi giai đoạn là một cột, chứng từ xếp dọc */
export const HORIZONTAL = {
  columnWidth: 330,
  columnGap: 170,
  headerHeight: 48,
  rowGap: 185,
  minColumnHeight: 180,
  bottomPadding: 30,
};

/** Bố cục dọc: mỗi giai đoạn là một hàng, chứng từ xếp ngang */
export const VERTICAL = {
  minRowWidth: 780,
  rowHeight: 190,
  rowGap: 120,
  cardGap: 30,
  headerHeight: 48,
  edgePadding: 20,
};

export interface StagePlacement {
  width: number;
  height: number;
  x: number;
  y: number;
}

/** Vị trí khung một giai đoạn; `maxDocs` dùng để đồng đều chiều rộng hàng ở bố cục dọc */
export function placeStage(
  direction: TraceabilityLayoutDirection,
  stageIndex: number,
  count: number,
  maxDocs: number,
  customDimensions?: { width: number; height: number },
): StagePlacement {
  if (direction === "horizontal") {
    const defaultHeight = Math.max(
      HORIZONTAL.minColumnHeight,
      HORIZONTAL.headerHeight +
        count * HORIZONTAL.rowGap +
        HORIZONTAL.bottomPadding,
    );
    return {
      width: customDimensions?.width ?? HORIZONTAL.columnWidth,
      height: customDimensions?.height ?? defaultHeight,
      x: stageIndex * (HORIZONTAL.columnWidth + HORIZONTAL.columnGap),
      y: 0,
    };
  }
  const defaultWidth = Math.max(
    VERTICAL.minRowWidth,
    maxDocs * (CARD_WIDTH + VERTICAL.cardGap) + VERTICAL.cardGap,
  );
  return {
    width: customDimensions?.width ?? defaultWidth,
    height: customDimensions?.height ?? VERTICAL.rowHeight,
    x: 0,
    y: stageIndex * (VERTICAL.rowHeight + VERTICAL.rowGap),
  };
}

/** Vị trí một chứng từ bên trong khung giai đoạn (dự phòng) */
export function placeDocument(
  direction: TraceabilityLayoutDirection,
  docIndex: number,
  stageWidth: number,
): { x: number; y: number } {
  if (direction === "horizontal") {
    return {
      x: (stageWidth - CARD_WIDTH) / 2,
      y: HORIZONTAL.headerHeight + docIndex * HORIZONTAL.rowGap,
    };
  }
  return {
    x: VERTICAL.edgePadding + docIndex * (CARD_WIDTH + VERTICAL.cardGap),
    y: VERTICAL.headerHeight + 8,
  };
}

export const stageNodeId = (stage: TraceabilityStageConfig) =>
  `stage-group-${stage.key}`;
