import React from "react";
import "@xyflow/react/dist/style.css";
import {
  Background,
  ControlButton,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { RotateCw } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  TraceabilityGraphData,
  TraceabilityLayoutDirection,
  TraceabilityNodeType,
} from "../../types/traceability.type";
import type { TraceabilityCanvasActions } from "../../types/traceability.flow.type";
import { V2TraceNode } from "../trace-node";
import { V2TraceStageGroup } from "../trace-stage-group";
import { V2TraceEdge } from "../trace-edge";
import { useTraceabilityCanvas } from "./V2TraceabilityCanvas.hook";

const NODE_TYPES = {
  traceabilityNode: V2TraceNode,
  stageGroupNode: V2TraceStageGroup,
};

const EDGE_TYPES = {
  labeledSmoothStep: V2TraceEdge,
};

export interface V2TraceabilityCanvasProps extends TraceabilityCanvasActions {
  graph: TraceabilityGraphData;
  direction: TraceabilityLayoutDirection;
  allowEdit?: boolean;
  allowedDocTypes?: TraceabilityNodeType[];
  isFullscreen?: boolean;
  onToggleDirection?: () => void;
}

/** Sơ đồ luồng chứng từ trên React Flow; mọi thao tác đi qua callback của cha */
export function V2TraceabilityCanvas(props: V2TraceabilityCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}

function CanvasInner({
  graph,
  direction,
  allowEdit = false,
  allowedDocTypes,
  isFullscreen = false,
  onToggleDirection,
  onAddLink,
  onUnlinkNode,
  onOpenDocument,
  onEditManualSettlement,
}: V2TraceabilityCanvasProps) {
  const { t } = useV2Translation();
  const canvas = useTraceabilityCanvas({
    graph,
    direction,
    allowEdit,
    allowedDocTypes,
    isFullscreen,
    actions: {
      onAddLink,
      onUnlinkNode,
      onOpenDocument,
      onEditManualSettlement,
    },
  });

  const toggleLabel =
    direction === "horizontal"
      ? t("v2.traceability.canvas.toVertical")
      : t("v2.traceability.canvas.toHorizontal");

  return (
    <ReactFlow
      nodes={canvas.nodes}
      edges={canvas.edges}
      onNodesChange={canvas.onNodesChange}
      onEdgesChange={canvas.onEdgesChange}
      onNodeClick={canvas.onNodeClick}
      onPaneClick={canvas.onPaneClick}
      onReconnect={canvas.onReconnect}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      edgesReconnectable
      reconnectRadius={30}
      edgesFocusable
      elevateEdgesOnSelect
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.6}
      maxZoom={1.2}
      nodesDraggable
      nodesConnectable
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background color="var(--border)" gap={20} size={1} />
      <Controls
        showInteractive={false}
        className="!m-3.5 !overflow-hidden !rounded-lg !border-border !bg-surface !shadow-sm dark:!border-border dark:!bg-muted"
      >
        {onToggleDirection && (
          <ControlButton
            onClick={onToggleDirection}
            title={toggleLabel}
            aria-label={toggleLabel}
            className="!flex !items-center !justify-center hover:!bg-muted dark:hover:!bg-muted"
          >
            <RotateCw className="h-3 w-3 text-muted-fg " />
          </ControlButton>
        )}
      </Controls>
    </ReactFlow>
  );
}
