import React, { useCallback, useRef, useState } from "react";
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { buildToolbarFlows, buildToolbarLabels } from "./canvasToolbarProps";
import { FitOnResize } from "./WorkflowCanvasFit";
import { useWorkflowGraph } from "./useWorkflowGraph";
import { WorkflowEdge } from "./WorkflowEdge";
import {
  WorkflowCanvasToolbar,
  type WorkflowCanvasOption,
} from "./WorkflowCanvasToolbar";
import { WorkflowCardNode } from "./WorkflowNodeCard";
import {
  WorkflowColumnNode,
  WorkflowCornerNode,
  WorkflowHeadingNode,
  WorkflowLaneNode,
} from "./WorkflowChromeNodes";
import { useCanvasFullscreen } from "./useCanvasFullscreen";
import { type WorkflowCanvasDefinition } from "./workflowTypes";

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

interface WorkflowCanvasProps {
  canvas: WorkflowCanvasDefinition;
  /** Các sơ đồ có thể chọn trong dropdown trên toolbar, và callback khi đổi sơ đồ. */
  canvasOptions: WorkflowCanvasOption[];
  /** Hàm dịch của host (namespace/prefix do host quyết định): nhận key và chuỗi mặc định. */
  t: (key: string, fallback: string) => string;
  onSelectCanvas: (canvasId: string) => void;
  /** Hiện lớp chỉ đọc (thẻ, cột, mũi tên đọc). */
  showRead: boolean;
  onToggleRead: () => void;
  /** Callback ref: drawer nhận DOM của khung canvas để chụp PNG/PDF. */
  captureRef?: (element: HTMLDivElement | null) => void;
  /** Bật khi đang xuất PNG/PDF: hiện khối tiêu đề và mô tả phía trên sơ đồ. */
  exportMode?: boolean;
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasFrame {...props} />
    </ReactFlowProvider>
  );
}

function CanvasFrame({
  canvas,
  canvasOptions,
  onSelectCanvas,
  showRead,
  onToggleRead,
  captureRef,
  exportMode = false,
  t,
}: WorkflowCanvasProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggle } = useCanvasFullscreen(frameRef);
  const { focus, updateFocus, nodes, edges, handleNodeClick, handlePaneClick } =
    useWorkflowGraph({ canvas, t, showRead, exportMode });

  const [frameElement, setFrameElement] = useState<HTMLDivElement | null>(null);
  const setFrame = useCallback(
    (element: HTMLDivElement | null) => {
      frameRef.current = element;
      setFrameElement(element);
      captureRef?.(element);
    },
    [captureRef],
  );

  const hasReadLayer = canvas.edges.some((edge) => edge.kind === "read");

  const toolbarLabels = buildToolbarLabels(t);
  const toolbarFlows = buildToolbarFlows(canvas, t);

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
        canvasOptions={canvasOptions}
        activeCanvasId={canvas.id}
        onSelectCanvas={onSelectCanvas}
        flows={toolbarFlows}
        activeFlow={focus?.kind === "flow" ? focus.id : null}
        onSelectFlow={(flowId) =>
          updateFocus(flowId ? { kind: "flow", id: flowId } : null)
        }
        hasSelectedNode={focus?.kind === "node"}
        onClearSelection={() => updateFocus(null)}
        portalContainer={isFullscreen ? frameElement : null}
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
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} color="#e2e8f0" />
          <FitOnResize canvasId={canvas.id} />
        </ReactFlow>
      </div>
    </div>
  );
}
