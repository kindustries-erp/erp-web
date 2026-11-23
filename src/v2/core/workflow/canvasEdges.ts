import { MarkerType, type Edge } from "@xyflow/react";

import { canvasBounds } from "./canvasBounds";
import { canvasHeaderRects } from "./canvasHeaderRects";
import {
  estimateLabelSize,
  placeLabels,
  type LabelRequest,
} from "./edgeLabels";
import { routeEdges, type RoutePoint, type RouteRect } from "./edgeRouter";
import type { CardTexts } from "./canvasNodes";
import type { WorkflowEdgeType } from "./WorkflowEdge";
import {
  isEdgeDimmed,
  type FocusResult,
  type WorkflowFocus,
} from "./workflowFocus";
import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type WorkflowCanvasDefinition,
  type WorkflowCanvasEdge,
  type WorkflowCanvasNode,
} from "./workflowTypes";

/** Mũi tên và nhãn nằm trên cùng. */
const Z_EDGE = 30;

type Translate = (key: string, fallback: string) => string;

/** Ước lượng chiều cao thẻ theo số dòng tiêu đề và badge; dùng tạm trước khi đo được chiều cao thật. */
export function estimateCardHeight(title: string, badges: string[]): number {
  const titleLines = Math.max(1, Math.ceil(title.length / 24));
  const badgeLines = badges.reduce(
    (sum, badge) => sum + Math.max(1, Math.ceil(badge.length / 40)),
    0,
  );
  const content =
    22 + titleLines * 18 + (badgeLines > 0 ? 8 + badgeLines * 15 : 0);
  return Math.max(WORKFLOW_CARD_MIN_HEIGHT, content);
}

export interface CanvasRouting {
  routes: { points: RoutePoint[]; labelPoint: RoutePoint }[];
  labelPoints: Map<string, RoutePoint>;
}

export interface BuildCanvasRoutingInput {
  canvas: WorkflowCanvasDefinition;
  t: Translate;
  showRead: boolean;
  visibleNodes: WorkflowCanvasNode[];
  visibleEdges: WorkflowCanvasEdge[];
  cardTexts: CardTexts;
  measuredHeights: Record<string, number>;
}

/** Đường đi và vị trí nhãn chỉ phụ thuộc bố cục, không đổi khi chọn luồng hay thẻ. */
export function buildCanvasRouting({
  canvas,
  t,
  showRead,
  visibleNodes,
  visibleEdges,
  cardTexts,
  measuredHeights,
}: BuildCanvasRoutingInput): CanvasRouting {
  const routeBounds = canvasBounds(canvas, { showRead });

  const cardRects = new Map<string, RouteRect>(
    visibleNodes.map((node) => {
      const text = cardTexts.get(node.id)!;
      const height =
        measuredHeights[node.id] ?? estimateCardHeight(text.title, text.badges);
      return [
        node.id,
        { x: node.x, y: node.y, width: WORKFLOW_NODE_WIDTH, height },
      ];
    }),
  );
  const allRects = [...cardRects.values()];
  // Thanh tiêu đề khung/cột cũng là vật cản: mũi tên và nhãn không được đè lên chữ tiêu đề.
  const obstacles = [...allRects, ...canvasHeaderRects(canvas, { showRead })];

  const routes = routeEdges(
    obstacles,
    routeBounds,
    visibleEdges.map((edge) => ({
      source: cardRects.get(edge.source)!,
      target: cardRects.get(edge.target)!,
    })),
  );

  const labelRequests: LabelRequest[] = visibleEdges.map((edge, index) => ({
    id: edge.id,
    points: routes[index].points,
    ...estimateLabelSize(
      edge.label ? t(edge.label.key, edge.label.fallback) : "",
      edge.mechanism ?? "",
      edge.step !== undefined || edge.steps !== undefined,
    ),
  }));
  const placements = placeLabels(labelRequests, obstacles);
  const labelPoints = new Map<string, RoutePoint>(
    visibleEdges.map((edge, index) => [
      edge.id,
      placements.get(edge.id) ?? routes[index].labelPoint,
    ]),
  );

  return { routes, labelPoints };
}

export interface BuildCanvasEdgesInput {
  canvas: WorkflowCanvasDefinition;
  t: Translate;
  routing: CanvasRouting;
  visibleEdges: WorkflowCanvasEdge[];
  focus: WorkflowFocus;
  focusResult: FocusResult;
}

/** Màu, nhãn số (A1, B2...), độ mờ và animation theo trạng thái làm nổi bật. */
export function buildCanvasEdges({
  canvas,
  t,
  routing,
  visibleEdges,
  focus,
  focusResult,
}: BuildCanvasEdgesInput): Edge[] {
  const { routes, labelPoints } = routing;
  const flowById = new Map((canvas.flows ?? []).map((flow) => [flow.id, flow]));
  const activeFlowId = focus?.kind === "flow" ? focus.id : null;

  const flowEdges: WorkflowEdgeType[] = visibleEdges.map((edge, index) => {
    const read = edge.kind === "read";
    const shownFlowId =
      activeFlowId && edge.flows?.includes(activeFlowId)
        ? activeFlowId
        : edge.flows?.[0];
    const flow = shownFlowId ? flowById.get(shownFlowId) : undefined;
    const stepNumber = shownFlowId ? edge.steps?.[shownFlowId] : undefined;
    const color = read ? undefined : flow?.color;

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "workflow-edge",
      zIndex: Z_EDGE,
      animated: focusResult.animatedEdges.has(edge.id),
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: read ? "#94a3b8" : (color ?? "#334155"),
        width: 16,
        height: 16,
      },
      selectable: false,
      data: {
        points: routes[index].points,
        labelPoint: labelPoints.get(edge.id)!,
        label: edge.label ? t(edge.label.key, edge.label.fallback) : undefined,
        mechanism: edge.mechanism,
        dashed: edge.dashed,
        read,
        step: edge.step,
        color,
        stepLabel:
          flow && stepNumber !== undefined
            ? `${flow.letter}${stepNumber}`
            : undefined,
        dimmed: isEdgeDimmed(focusResult, edge.id),
      },
    };
  });

  const allEdges: Edge[] = flowEdges;
  return allEdges;
}
