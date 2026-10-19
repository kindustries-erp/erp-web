import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Background,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
  useStore,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTranslation } from "react-i18next";

import { canvasBounds } from "./canvasBounds";
import {
  estimateLabelSize,
  placeLabels,
  type LabelRequest,
} from "./edgeLabels";
import { routeEdges, type RouteRect, type RoutePoint } from "./edgeRouter";
import { WorkflowEdge, type WorkflowEdgeType } from "./WorkflowEdge";
import {
  WorkflowCanvasToolbar,
  type WorkflowCanvasToolbarLabels,
} from "./WorkflowCanvasToolbar";
import {
  WorkflowCardNode,
  WorkflowColumnNode,
  WorkflowCornerNode,
  WorkflowHeadingNode,
  WorkflowLaneNode,
  type WorkflowCardNode as CardNode,
  type WorkflowColumnNode as ColumnNode,
  type WorkflowCornerNode as CornerNode,
  type WorkflowHeadingNode as HeadingNode,
  type WorkflowLaneNode as LaneNode,
} from "./WorkflowNodeCard";
import { useCanvasFullscreen } from "./useCanvasFullscreen";
import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type GarageWorkflowCanvasDefinition,
} from "./garageWorkflowTypes";

const NODE_TYPES = {
  "workflow-card": WorkflowCardNode,
  "workflow-lane": WorkflowLaneNode,
  "workflow-column": WorkflowColumnNode,
  "workflow-corner": WorkflowCornerNode,
  "workflow-heading": WorkflowHeadingNode,
};

const EDGE_TYPES = {
  "workflow-edge": WorkflowEdge,
};

/** Thứ tự xếp lớp: lane/cột nằm dưới, thẻ ở giữa, mũi tên và nhãn nằm trên cùng. */
const Z_LANE = -1;
const Z_CARD = 10;
const Z_HEADING = 20;
const Z_EDGE = 30;

/** Lane rộng hơn cao nhiều (hàng của lưới) thì tiêu đề nằm bên trái. */
const HORIZONTAL_LANE_RATIO = 3;
const CONTENT_PADDING = 24;

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

function sameHeights(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  const keys = Object.keys(b);
  return (
    keys.length === Object.keys(a).length &&
    keys.every((key) => a[key] === b[key])
  );
}

/** Khi khung đổi kích thước (vào/ra full screen, kéo drawer) thì fit lại toàn bộ sơ đồ. */
function FitOnResize() {
  const { fitView } = useReactFlow();
  const size = useStore((state) => `${state.width}x${state.height}`);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.05, duration: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [size, fitView]);

  return null;
}

interface GarageWorkflowCanvasProps {
  canvas: GarageWorkflowCanvasDefinition;
  /** Hiện lớp chỉ đọc (thẻ, cột, mũi tên đọc). */
  showRead: boolean;
  onToggleRead: () => void;
  /** Callback ref: drawer nhận DOM của khung canvas để chụp PNG/PDF. */
  captureRef?: (element: HTMLDivElement | null) => void;
  /** Bật khi đang xuất PNG/PDF: hiện khối tiêu đề và mô tả phía trên sơ đồ. */
  exportMode?: boolean;
}

export function GarageWorkflowCanvas(props: GarageWorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasFrame {...props} />
    </ReactFlowProvider>
  );
}

function CanvasFrame({
  canvas,
  showRead,
  onToggleRead,
  captureRef,
  exportMode = false,
}: GarageWorkflowCanvasProps) {
  const { t } = useTranslation("garage");
  const frameRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggle } = useCanvasFullscreen(frameRef);
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const [measuredHeights, setMeasuredHeights] = useState<
    Record<string, number>
  >({});

  const setFrame = useCallback(
    (element: HTMLDivElement | null) => {
      frameRef.current = element;
      captureRef?.(element);
    },
    [captureRef],
  );

  const hasReadLayer = canvas.edges.some((edge) => edge.kind === "read");

  // Thẻ và cột đang hiển thị (lớp đọc chỉ hiện khi bật).
  const visibleNodes = useMemo(
    () => canvas.nodes.filter((node) => showRead || node.layer !== "read"),
    [canvas, showRead],
  );

  const cardTexts = useMemo(
    () =>
      new Map(
        visibleNodes.map((node) => [
          node.id,
          {
            title: t(node.title.key, node.title.fallback),
            badges: (node.badges ?? []).map((badge) =>
              t(badge.key, badge.fallback),
            ),
          },
        ]),
      ),
    [visibleNodes, t],
  );

  const nodes = useMemo(() => {
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
              description: t(
                canvas.description.key,
                canvas.description.fallback,
              ),
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

    const laneNodes: LaneNode[] = canvas.lanes.map((lane) => ({
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
        headerSide:
          lane.width > lane.height * HORIZONTAL_LANE_RATIO ? "left" : "top",
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
          group: node.group
            ? t(node.group.key, node.group.fallback)
            : undefined,
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
  }, [canvas, exportMode, showRead, t, visibleNodes, cardTexts]);

  // Sau khi xyflow đo xong, lấy chiều cao thật của thẻ để mũi tên chạm đúng tâm cạnh.
  useEffect(() => {
    if (!nodesInitialized) return;
    const next: Record<string, number> = {};
    getNodes().forEach((node) => {
      if (node.type === "workflow-card" && node.measured?.height)
        next[node.id] = node.measured.height;
    });
    setMeasuredHeights((prev) => (sameHeights(prev, next) ? prev : next));
  }, [nodesInitialized, getNodes, nodes]);

  const edges = useMemo(() => {
    const routeBounds = canvasBounds(canvas, { showRead });

    const cardRects = new Map<string, RouteRect>(
      visibleNodes.map((node) => {
        const text = cardTexts.get(node.id)!;
        const height =
          measuredHeights[node.id] ??
          estimateCardHeight(text.title, text.badges);
        return [
          node.id,
          { x: node.x, y: node.y, width: WORKFLOW_NODE_WIDTH, height },
        ];
      }),
    );
    const allRects = [...cardRects.values()];

    const visibleEdges = canvas.edges.filter(
      (edge) =>
        (showRead || edge.kind !== "read") &&
        cardRects.has(edge.source) &&
        cardRects.has(edge.target),
    );
    const routes = routeEdges(
      allRects,
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
        edge.step !== undefined,
      ),
    }));
    const placements = placeLabels(labelRequests, allRects);
    const labelPoints = new Map<string, RoutePoint>(
      visibleEdges.map((edge, index) => [
        edge.id,
        placements.get(edge.id) ?? routes[index].labelPoint,
      ]),
    );

    const flowEdges: WorkflowEdgeType[] = visibleEdges.map((edge, index) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "workflow-edge",
      zIndex: Z_EDGE,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.kind === "read" ? "#94a3b8" : "#334155",
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
        read: edge.kind === "read",
        step: edge.step,
      },
    }));

    const allEdges: Edge[] = flowEdges;
    return allEdges;
  }, [canvas, showRead, t, visibleNodes, cardTexts, measuredHeights]);

  const toolbarLabels: WorkflowCanvasToolbarLabels = {
    zoomIn: t("workflow.toolbar.zoomIn", "Phóng to"),
    zoomOut: t("workflow.toolbar.zoomOut", "Thu nhỏ"),
    fit: t("workflow.toolbar.fit", "Vừa khung"),
    enterFullscreen: t("workflow.toolbar.enterFullscreen", "Toàn màn hình"),
    exitFullscreen: t("workflow.toolbar.exitFullscreen", "Thoát toàn màn hình"),
    showRead: t("workflow.toolbar.showRead", "Luồng đọc dữ liệu"),
    hideRead: t("workflow.toolbar.hideRead", "Ẩn luồng đọc"),
    step: t("workflow.legend.step", "Số thứ tự thao tác"),
    solidArrow: t("workflow.legend.solidArrow", "Luồng chính"),
    dashedArrow: t("workflow.legend.dashedArrow", "Cần xác minh"),
    readArrow: t("workflow.legend.readArrow", "Chỉ đọc dữ liệu"),
    completed: t("workflow.legend.completed", "Kết thúc (mã 3)"),
    cancelled: t("workflow.legend.cancelled", "Hủy (mã 9)"),
  };

  return (
    <div
      ref={setFrame}
      className={
        isFullscreen
          ? "flex h-screen w-screen flex-col overflow-hidden bg-white"
          : "flex h-[72vh] min-h-[520px] w-full flex-col overflow-hidden rounded-md border bg-white"
      }
    >
      <WorkflowCanvasToolbar
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggle}
        showReadEdges={showRead}
        onToggleReadEdges={onToggleRead}
        hasReadEdges={hasReadLayer}
        labels={toolbarLabels}
      />
      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.05 }}
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          elevateEdgesOnSelect={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} color="#e2e8f0" />
          <FitOnResize />
        </ReactFlow>
      </div>
    </div>
  );
}
