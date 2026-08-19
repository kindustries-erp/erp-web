import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  reconnectEdge,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/shared/types/traceability";
import { STAGES_CONFIG, getStageForDocType } from "../constants";
import type { BusinessStageKey, CanvasLayoutDirection } from "../types";
import { StageGroupNodeCard } from "./StageGroupNode";
import { TraceabilityNodeCard } from "./DocNode";
import { LabeledSmoothStepEdge } from "./LabeledEdge";

const NODE_TYPES = {
  traceabilityNode: TraceabilityNodeCard,
  stageGroupNode: StageGroupNodeCard,
};

const EDGE_TYPES = {
  labeledSmoothStep: LabeledSmoothStepEdge,
};

const CARD_WIDTH = 290;
const STAGE_COL_WIDTH = 330;
const STAGE_HEADER_HEIGHT = 48;
const CARD_ROW_GAP = 145;
const STAGE_COL_GAP = 170;

export function computeLayout(
  graphData: TraceabilityGraphData,
  direction: CanvasLayoutDirection = "horizontal",
  allowEdit?: boolean,
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void,
  onUnlinkNode?: (node: TraceabilityNode) => void,
  allowedDocTypes?: TraceabilityNodeType[],
  onEditManualSettlement?: (node: TraceabilityNode) => void,
  selectedNodeId?: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Compute connected nodes & edges if selectedNodeId is present (Full Multi-hop Traverse)
  const connectedEdgeIds = new Set<string>();
  const connectedNodeIds = new Set<string>();

  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);

    // BFS Downstream
    let current = [selectedNodeId];
    while (current.length > 0) {
      const next: string[] = [];
      for (const nId of current) {
        for (const e of graphData.edges) {
          if (e.source === nId && !connectedEdgeIds.has(e.id)) {
            connectedEdgeIds.add(e.id);
            connectedNodeIds.add(e.target);
            next.push(e.target);
          }
        }
      }
      current = next;
    }

    // BFS Upstream
    current = [selectedNodeId];
    while (current.length > 0) {
      const next: string[] = [];
      for (const nId of current) {
        for (const e of graphData.edges) {
          if (e.target === nId && !connectedEdgeIds.has(e.id)) {
            connectedEdgeIds.add(e.id);
            connectedNodeIds.add(e.source);
            next.push(e.source);
          }
        }
      }
      current = next;
    }
  }

  // 1. Group nodes by Stage
  const stageGroupsMap = new Map<BusinessStageKey, TraceabilityNode[]>();
  STAGES_CONFIG.forEach((s) => stageGroupsMap.set(s.key, []));

  graphData.nodes.forEach((n) => {
    const stage = getStageForDocType(n.docType);
    stageGroupsMap.get(stage.key)!.push(n);
  });

  // Filter only active stages (stages with at least 1 document)
  const activeStages = STAGES_CONFIG.filter(
    (s) => (stageGroupsMap.get(s.key) || []).length > 0,
  );

  activeStages.forEach((stage, stageIdx) => {
    const stageDocs = stageGroupsMap.get(stage.key) || [];
    const count = stageDocs.length;

    if (direction === "horizontal") {
      const stageWidth = STAGE_COL_WIDTH;
      const stageHeight = Math.max(
        180,
        STAGE_HEADER_HEIGHT + count * CARD_ROW_GAP + 20,
      );
      const stageX = stageIdx * (stageWidth + STAGE_COL_GAP);
      const stageY = 0;

      // Add Stage Group Container Background Node
      nodes.push({
        id: `stage-group-${stage.key}`,
        type: "stageGroupNode",
        position: { x: stageX, y: stageY },
        style: { width: stageWidth, height: stageHeight },
        selectable: false,
        draggable: false,
        data: {
          stage,
          count,
          width: stageWidth,
          height: stageHeight,
          allowEdit,
          onAddLink,
          allowedDocTypes,
        },
        zIndex: -1,
      });

      // Add Document Nodes inside this Stage Column
      stageDocs.forEach((doc, docIdx) => {
        const docX = (stageWidth - CARD_WIDTH) / 2;
        const docY = STAGE_HEADER_HEIGHT + docIdx * CARD_ROW_GAP;
        const isSelfSelected = selectedNodeId === doc.id;

        nodes.push({
          id: doc.id,
          type: "traceabilityNode",
          parentId: `stage-group-${stage.key}`,
          extent: "parent",
          position: { x: docX, y: docY },
          selected: isSelfSelected,
          data: {
            ...doc,
            allowEdit,
            onUnlink: onUnlinkNode,
            onEditManualSettlement,
          },
          zIndex: isSelfSelected ? 30 : 10,
        });
      });
    } else {
      // Vertical Stage Rows (Symmetric, well-spaced)
      const maxStageDocs = Math.max(
        ...activeStages.map((s) => (stageGroupsMap.get(s.key) || []).length),
        1,
      );
      const uniformStageWidth = Math.max(
        780,
        maxStageDocs * (CARD_WIDTH + 30) + 30,
      );
      const stageHeight = 190;
      const STAGE_ROW_GAP = 120;
      const stageX = 0;
      const stageY = stageIdx * (stageHeight + STAGE_ROW_GAP);

      nodes.push({
        id: `stage-group-${stage.key}`,
        type: "stageGroupNode",
        position: { x: stageX, y: stageY },
        style: { width: uniformStageWidth, height: stageHeight },
        selectable: false,
        draggable: false,
        data: {
          stage,
          count,
          width: uniformStageWidth,
          height: stageHeight,
          allowEdit,
          onAddLink,
          allowedDocTypes,
        },
        zIndex: -1,
      });

      stageDocs.forEach((doc, docIdx) => {
        const docX = 20 + docIdx * (CARD_WIDTH + 30);
        const docY = STAGE_HEADER_HEIGHT + 8;
        const isSelfSelected = selectedNodeId === doc.id;

        nodes.push({
          id: doc.id,
          type: "traceabilityNode",
          parentId: `stage-group-${stage.key}`,
          extent: "parent",
          position: { x: docX, y: docY },
          selected: isSelfSelected,
          data: {
            ...doc,
            allowEdit,
            onUnlink: onUnlinkNode,
            onEditManualSettlement,
          },
          zIndex: isSelfSelected ? 30 : 10,
        });
      });
    }
  });

  // 2. Build Edges: Giữ nguyên màu neutral chuẩn (#94a3b8), khi được click thì kích hoạt animated
  const edgeStroke = "#94a3b8";

  graphData.edges.forEach((e) => {
    const isConnectedToSelection = connectedEdgeIds.has(e.id);
    const isAnimated = isConnectedToSelection;

    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: direction === "vertical" ? "bottom" : "right",
      targetHandle: direction === "vertical" ? "top" : "left",
      type: "labeledSmoothStep",
      label: e.label || undefined,
      animated: isAnimated,
      interactionWidth: 30,
      reconnectable: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: edgeStroke,
      },
      style: {
        stroke: edgeStroke,
        strokeWidth: isAnimated ? 2.2 : 1.8,
        strokeDasharray: e.isTransitive && !isAnimated ? "4 4" : undefined,
      },
      zIndex: isConnectedToSelection ? 40 : 30,
    });
  });

  return { nodes, edges };
}

interface CanvasFlowInnerProps {
  graphData: TraceabilityGraphData;
  direction: CanvasLayoutDirection;
  isFullscreen?: boolean;
  allowEdit?: boolean;
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
  allowedDocTypes?: TraceabilityNodeType[];
  onToggleDirection?: () => void;
  onEditManualSettlement?: (node: TraceabilityNode) => void;
}

function CanvasFlowInner({
  graphData,
  direction,
  isFullscreen,
  allowEdit,
  onAddLink,
  onUnlinkNode,
  allowedDocTypes,
  onToggleDirection,
  onEditManualSettlement,
}: CanvasFlowInnerProps) {
  const { fitView } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const edgeReconnectSuccessful = useRef(true);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      computeLayout(
        graphData,
        direction,
        allowEdit,
        onAddLink,
        onUnlinkNode,
        allowedDocTypes,
        onEditManualSettlement,
        selectedNodeId,
      ),
    [
      graphData,
      direction,
      allowEdit,
      onAddLink,
      onUnlinkNode,
      allowedDocTypes,
      onEditManualSettlement,
      selectedNodeId,
    ],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync layout changes when graphData, direction, or selectedNodeId changes
  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = computeLayout(
      graphData,
      direction,
      allowEdit,
      onAddLink,
      onUnlinkNode,
      allowedDocTypes,
      onEditManualSettlement,
      selectedNodeId,
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [
    graphData,
    direction,
    allowEdit,
    onAddLink,
    onUnlinkNode,
    allowedDocTypes,
    onEditManualSettlement,
    selectedNodeId,
    setNodes,
    setEdges,
  ]);

  // Initial fit view on mount or layout direction change
  useEffect(() => {
    const t = setTimeout(() => {
      fitView({ duration: 400, padding: 0.2 });
    }, 60);
    return () => clearTimeout(t);
  }, [graphData.rootId, direction, fitView]);

  // Re-fit view when transitioning between fullscreen and regular drawer mode
  useEffect(() => {
    const t = setTimeout(() => {
      fitView({ duration: 350, padding: 0.2 });
    }, 120);
    return () => clearTimeout(t);
  }, [isFullscreen, fitView]);

  // Handle node click to toggle active path animation & bold border
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === "stageGroupNode") return;
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    },
    [],
  );

  // Handle canvas background click to clear active path animation
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Allow drag & reconnect edge endpoints
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges],
  );

  const onReconnectEnd = useCallback(() => {
    edgeReconnectSuccessful.current = true;
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      onReconnectStart={onReconnectStart}
      onReconnect={onReconnect}
      onReconnectEnd={onReconnectEnd}
      edgesReconnectable={true}
      reconnectRadius={30}
      edgesFocusable={true}
      elevateEdgesOnSelect={true}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.6}
      maxZoom={1.2}
      nodesDraggable
      nodesConnectable={true}
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#cbd5e1" gap={20} size={1} />
      <Controls
        showInteractive={false}
        className="!border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !shadow-sm !rounded-lg overflow-hidden !m-3.5"
      >
        {onToggleDirection && (
          <ControlButton
            onClick={onToggleDirection}
            title={
              direction === "horizontal"
                ? "Đổi sang bố cục Dọc"
                : "Đổi sang bố cục Ngang"
            }
            aria-label="Toggle Layout Direction"
            className="hover:!bg-slate-100 dark:hover:!bg-slate-800 !flex !items-center !justify-center"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                width: "12px",
                height: "12px",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2.75,
              }}
              className="text-slate-700 dark:text-slate-200 pointer-events-none"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </ControlButton>
        )}
      </Controls>
    </ReactFlow>
  );
}

export type CanvasViewProps = CanvasFlowInnerProps;

export function CanvasView(props: CanvasViewProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner {...props} />
    </ReactFlowProvider>
  );
}
