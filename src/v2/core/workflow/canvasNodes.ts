import type { Node } from "@xyflow/react";

import { canvasBounds } from "./canvasBounds";
import { resolveLaneHeaderSide } from "./canvasHeaderRects";
import type {
  WorkflowCardNode as CardNode,
  WorkflowColumnNode as ColumnNode,
  WorkflowCornerNode as CornerNode,
  WorkflowHeadingNode as HeadingNode,
  WorkflowLaneNode as LaneNode,
} from "./WorkflowNodeCard";
import {
  isNodeDimmed,
  type FocusResult,
  type WorkflowFocus,
} from "./workflowFocus";
import type {
  WorkflowCanvasDefinition,
  WorkflowCanvasNode,
} from "./workflowTypes";

/** Thứ tự xếp lớp: lane/cột nằm dưới, thẻ ở giữa, tiêu đề xuất file trên cùng. */
const Z_LANE = -1;
const Z_CARD = 10;
const Z_HEADING = 20;
const CONTENT_PADDING = 24;

export type CardTexts = Map<string, { title: string; badges: string[] }>;

export interface BuildCanvasNodesInput {
  canvas: WorkflowCanvasDefinition;
  t: (key: string, fallback: string) => string;
  showRead: boolean;
  exportMode: boolean;
  visibleNodes: WorkflowCanvasNode[];
  cardTexts: CardTexts;
  focusResult: FocusResult;
  focus: WorkflowFocus;
}

/** Dựng toàn bộ node xyflow: lane, cột, ô góc, tiêu đề (khi xuất file) và thẻ. */
export function buildCanvasNodes({
  canvas,
  t,
  showRead,
  exportMode,
  visibleNodes,
  cardTexts,
  focusResult,
  focus,
}: BuildCanvasNodesInput): Node[] {
  const bounds = canvasBounds(canvas, { withHeading: true, showRead });

  const headingNodes: HeadingNode[] = exportMode
    ? [
        {
          id: "workflow-heading",
          type: "workflow-heading",
          position: {
            x: bounds.x + CONTENT_PADDING,
            y: bounds.y + CONTENT_PADDING,
          },
          width: bounds.width - CONTENT_PADDING * 2,
          zIndex: Z_HEADING,
          data: {
            title: t(canvas.title.key, canvas.title.fallback),
            description: t(canvas.description.key, canvas.description.fallback),
          },
          selectable: false,
          draggable: false,
          focusable: false,
        },
      ]
    : [];

  const cornerNodes: CornerNode[] = canvas.corner
    ? [
        {
          id: "workflow-corner",
          type: "workflow-corner",
          position: { x: canvas.corner.x, y: canvas.corner.y },
          width: canvas.corner.width,
          height: canvas.corner.height,
          zIndex: Z_LANE,
          data: {
            title: t(canvas.corner.title.key, canvas.corner.title.fallback),
          },
          selectable: false,
          draggable: false,
          focusable: false,
        },
      ]
    : [];

  const laneNodes: LaneNode[] = canvas.lanes
    .filter((lane) => showRead || lane.layer !== "read")
    .map((lane) => ({
      id: `lane-${lane.id}`,
      type: "workflow-lane",
      position: { x: lane.x, y: lane.y },
      width: lane.width,
      height: lane.height,
      zIndex: Z_LANE,
      data: {
        title: t(lane.title.key, lane.title.fallback),
        tone: lane.tone,
        icon: lane.icon,
        headerSide: resolveLaneHeaderSide(lane),
      },
      selectable: false,
      draggable: false,
      focusable: false,
    }));

  const columnNodes: ColumnNode[] = canvas.columns
    .filter((column) => showRead || column.layer !== "read")
    .map((column) => ({
      id: `column-${column.id}`,
      type: "workflow-column",
      position: { x: column.x, y: column.y },
      width: column.width,
      height: column.height,
      zIndex: Z_LANE,
      data: { title: t(column.title.key, column.title.fallback) },
      selectable: false,
      draggable: false,
      focusable: false,
    }));

  const cardNodes: CardNode[] = visibleNodes.map((node) => {
    const text = cardTexts.get(node.id)!;
    return {
      id: node.id,
      type: "workflow-card",
      position: { x: node.x, y: node.y },
      zIndex: Z_CARD,
      data: {
        title: text.title,
        badges: text.badges,
        kind: node.kind,
        statusCode: node.statusCode,
        step: node.step,
        tone: node.tone,
        group: node.group ? t(node.group.key, node.group.fallback) : undefined,
        dimmed: isNodeDimmed(focusResult, node.id),
        selected: focus?.kind === "node" && focus.id === node.id,
      },
      selectable: false,
      draggable: false,
    };
  });

  const allNodes: Node[] = [
    ...laneNodes,
    ...columnNodes,
    ...cornerNodes,
    ...headingNodes,
    ...cardNodes,
  ];
  return allNodes;
}
