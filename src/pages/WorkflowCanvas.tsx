import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  MarkerType,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GitBranch, RefreshCw, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import {
  getWorkflowGraphApi,
  type WorkflowGraph,
  type WorkflowNode as ApiNode,
  type WorkflowEdge as ApiEdge,
  type WorkflowGroup,
} from "@/modules/system/api/workflowGraphApi";
import { cn } from "@/shared/utils";

// ─── Group layout config (column + row slot per group) ───────────────────────

const GROUP_LAYOUT: Record<string, { col: number; label: string }> = {
  system:           { col: 0, label: "Hệ thống" },
  hr:               { col: 1, label: "Nhân sự" },
  master:           { col: 2, label: "Danh mục đối tác" },
  "finance-setup":  { col: 3, label: "Thiết lập tài chính" },
  voucher:          { col: 4, label: "Phiếu thu/chi" },
  "voucher-workflow": { col: 5, label: "Luồng duyệt" },
  ledger:           { col: 6, label: "Công nợ" },
};

const NODE_W = 220;
const NODE_H = 90;
const COL_GAP = 80;
const ROW_GAP = 24;
const COL_X_START = 40;
const ROW_Y_START = 120;

// ─── Edge type colours ────────────────────────────────────────────────────────

const EDGE_COLOR: Record<string, string> = {
  depends_on:          "#3b82f6",
  creates:             "#10b981",
  belongs_to:          "#f59e0b",
  triggers:            "#8b5cf6",
  settles:             "#ec4899",
  workflow_transition: "#f97316",
  reads:               "#6b7280",
};

const EDGE_LABEL_BG: Record<string, string> = {
  depends_on:          "#eff6ff",
  creates:             "#f0fdf4",
  belongs_to:          "#fffbeb",
  triggers:            "#f5f3ff",
  settles:             "#fdf4ff",
  workflow_transition: "#fff7ed",
  reads:               "#f9fafb",
};

// ─── Custom Node component ────────────────────────────────────────────────────

interface NodeData extends Record<string, unknown> {
  label: string;
  description: string;
  color: string;
  icon: string;
  type: "module" | "process" | "status";
  endpoints?: string[];
  statusValue?: string;
  groupLabel: string;
}

function ModuleNode({ data }: { data: NodeData }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isStatus = data.type === "status";

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      <div
        style={{
          width: NODE_W,
          minHeight: NODE_H,
          borderColor: data.color,
          borderLeftWidth: isStatus ? 0 : 3,
          borderTopWidth: isStatus ? 3 : 0,
          boxShadow: `0 2px 8px ${data.color}22`,
        }}
        className={cn(
          "bg-white dark:bg-[#1e1e2e] rounded-xl border border-[#e5e7eb] dark:border-[#2d2d3a] p-3 cursor-default select-none",
          isStatus && "rounded-2xl text-center",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {isStatus && (
            <span
              className="inline-block w-3 h-3 rounded-full flex-shrink-0 mx-auto"
              style={{ background: data.color }}
            />
          )}
          <span
            className={cn(
              "font-semibold text-[13px] leading-tight text-gray-800 dark:text-gray-100",
              isStatus && "w-full text-center",
            )}
          >
            {data.label}
          </span>
          {!isStatus && (
            <span
              className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: data.color + "22",
                color: data.color,
              }}
            >
              {data.groupLabel}
            </span>
          )}
        </div>

        {!isStatus && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
            {data.description}
          </p>
        )}

        {isStatus && data.statusValue && (
          <span
            className="text-[10px] font-mono mt-1 block"
            style={{ color: data.color }}
          >
            {data.statusValue}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && !isStatus && (
        <div
          className="absolute left-full top-0 ml-3 z-50 w-72 rounded-xl bg-white dark:bg-[#1e1e2e] border border-[#e5e7eb] dark:border-[#2d2d3a] p-3 shadow-xl text-[12px]"
          style={{ borderTopColor: data.color, borderTopWidth: 2 }}
        >
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {data.label}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
            {data.description}
          </p>
          {data.endpoints && data.endpoints.length > 0 && (
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Endpoints
              </p>
              <ul className="space-y-0.5">
                {data.endpoints.map((ep) => (
                  <li key={ep} className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                    {ep}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = { erp: ModuleNode };

// ─── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block w-6 h-0.5 rounded" style={{ background: color }} />
      <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

// ─── Group header labels ──────────────────────────────────────────────────────

interface GroupHeaderNode extends Record<string, unknown> {
  label: string;
  color: string;
}

function GroupHeader({ data }: { data: GroupHeaderNode }) {
  return (
    <div
      className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest"
      style={{ color: data.color, background: data.color + "18", border: `1px solid ${data.color}40` }}
    >
      {data.label}
    </div>
  );
}

const nodeTypesAll: NodeTypes = { erp: ModuleNode, groupHeader: GroupHeader };

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildLayout(graph: WorkflowGraph): { nodes: Node[]; edges: Edge[] } {
  const colCounters: Record<number, number> = {};

  const rfNodes: Node[] = [];

  // Group header nodes
  for (const [groupId, layout] of Object.entries(GROUP_LAYOUT)) {
    const group = graph.groups.find((g) => g.id === groupId);
    const color = group?.color ?? "#6b7280";
    rfNodes.push({
      id: `__header_${groupId}`,
      type: "groupHeader",
      position: {
        x: COL_X_START + layout.col * (NODE_W + COL_GAP),
        y: 40,
      },
      data: { label: layout.label, color } as GroupHeaderNode,
      draggable: false,
      selectable: false,
    });
  }

  // Module / status nodes
  for (const apiNode of graph.nodes) {
    const layout = GROUP_LAYOUT[apiNode.group];
    const col = layout?.col ?? 7;
    const row = colCounters[col] ?? 0;
    colCounters[col] = row + 1;

    const group = graph.groups.find((g) => g.id === apiNode.group);

    rfNodes.push({
      id: apiNode.id,
      type: "erp",
      position: {
        x: COL_X_START + col * (NODE_W + COL_GAP),
        y: ROW_Y_START + row * (NODE_H + ROW_GAP),
      },
      data: {
        label: apiNode.label,
        description: apiNode.description,
        color: apiNode.meta.color,
        icon: apiNode.meta.icon,
        type: apiNode.type,
        endpoints: apiNode.meta.endpoints,
        statusValue: apiNode.meta.statusValue,
        groupLabel: layout?.label ?? apiNode.group,
        groupColor: group?.color ?? apiNode.meta.color,
      } as NodeData,
    });
  }

  // Edges
  const rfEdges: Edge[] = graph.edges.map((e: ApiEdge) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "smoothstep",
    animated: e.type === "workflow_transition",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_COLOR[e.type] ?? "#6b7280",
      width: 14,
      height: 14,
    },
    style: {
      stroke: EDGE_COLOR[e.type] ?? "#6b7280",
      strokeWidth: e.type === "workflow_transition" ? 2.5 : 1.5,
      strokeDasharray: e.type === "depends_on" ? "5 3" : undefined,
    },
    labelStyle: { fontSize: 10, fill: EDGE_COLOR[e.type] ?? "#6b7280" },
    labelBgStyle: {
      fill: EDGE_LABEL_BG[e.type] ?? "#f9fafb",
      fillOpacity: 0.9,
    },
    labelBgPadding: [4, 3] as [number, number],
    labelBgBorderRadius: 4,
    data: { edgeType: e.type, description: e.meta.description, field: e.meta.field },
  }));

  return { nodes: rfNodes, edges: rfEdges };
}

// ─── Filter legend ────────────────────────────────────────────────────────────

const EDGE_TYPES = [
  { type: "depends_on",          label: "Phụ thuộc" },
  { type: "creates",             label: "Tạo ra" },
  { type: "belongs_to",          label: "Thuộc về" },
  { type: "triggers",            label: "Kích hoạt" },
  { type: "settles",             label: "Bù trừ" },
  { type: "workflow_transition", label: "Luồng duyệt" },
];

// ─── Inner canvas (needs ReactFlowProvider context) ───────────────────────────

function CanvasInner({
  graph,
  visibleEdgeTypes,
}: {
  graph: WorkflowGraph;
  visibleEdgeTypes: Set<string>;
}) {
  const { fitView } = useReactFlow();
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildLayout(graph),
    [graph],
  );

  const filteredEdges = useMemo(
    () =>
      initialEdges.filter((e) =>
        visibleEdgeTypes.has((e.data as { edgeType: string }).edgeType),
      ),
    [initialEdges, visibleEdgeTypes],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(filteredEdges);

  // Update edges when filter changes
  const [displayEdges, setDisplayEdges] = useEdgesState(filteredEdges);
  useEffect(() => {
    setDisplayEdges(filteredEdges);
  }, [filteredEdges, setDisplayEdges]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.08, duration: 400 }), 50);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={displayEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypesAll}
      fitView
      minZoom={0.15}
      maxZoom={2}
      defaultEdgeOptions={{ type: "smoothstep" }}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={20} size={1} color="#e5e7eb" />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          if (n.type === "groupHeader") return "transparent";
          return (n.data as NodeData).color ?? "#6b7280";
        }}
        maskColor="rgba(0,0,0,0.06)"
        style={{ borderRadius: 8 }}
      />
      <Panel position="bottom-left">
        <div className="bg-white dark:bg-[#1e1e2e] rounded-xl border border-[#e5e7eb] dark:border-[#2d2d3a] p-3 shadow-lg flex flex-col gap-1.5">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            Loại liên kết
          </p>
          {EDGE_TYPES.map((et) => (
            <LegendItem key={et.type} color={EDGE_COLOR[et.type]} label={et.label} />
          ))}
        </div>
      </Panel>
    </ReactFlow>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function WorkflowCanvas() {
  const [graph, setGraph] = useState<WorkflowGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState<Set<string>>(
    new Set(EDGE_TYPES.map((e) => e.type)),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkflowGraphApi();
      setGraph(data);
    } catch {
      setError("Không thể tải sơ đồ quy trình. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleEdgeType(type: string) {
    setVisibleEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev; // keep at least 1
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  return (
    <div className="p-5 h-full flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
      <PageHeader
        icon={<GitBranch className="w-5 h-5" />}
        title="Sơ đồ quy trình ERP"
        desc={
          graph
            ? `${graph.meta.totalNodes} nodes · ${graph.meta.totalEdges} edges · ${graph.meta.totalGroups} nhóm`
            : "Toàn bộ quy trình hoạt động và mối liên kết giữa các phân hệ"
        }
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-[#e5e7eb] dark:border-[#2d2d3a] bg-white dark:bg-[#1e1e2e] hover:bg-gray-50 dark:hover:bg-[#2d2d3a] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Làm mới
          </button>
        }
      />

      {/* Edge type filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EDGE_TYPES.map((et) => {
          const active = visibleEdgeTypes.has(et.type);
          return (
            <button
              key={et.type}
              onClick={() => toggleEdgeType(et.type)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                active
                  ? "text-white border-transparent"
                  : "bg-white dark:bg-[#1e1e2e] border-[#e5e7eb] dark:border-[#2d2d3a] text-gray-400",
              )}
              style={active ? { background: EDGE_COLOR[et.type], borderColor: EDGE_COLOR[et.type] } : {}}
            >
              <span
                className="inline-block w-4 h-0.5 rounded"
                style={{ background: active ? "#fff" : EDGE_COLOR[et.type] }}
              />
              {et.label}
            </button>
          );
        })}
      </div>

      {/* Canvas area */}
      <div
        className="flex-1 rounded-2xl border border-[#e5e7eb] dark:border-[#2d2d3a] overflow-hidden bg-[#fafafa] dark:bg-[#13131f]"
        style={{ minHeight: 520 }}
      >
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Layers className="w-8 h-8 text-blue-400 animate-pulse" />
              <p className="text-sm text-gray-500">Đang tải sơ đồ quy trình…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={load}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {!loading && !error && graph && (
          <CanvasInner graph={graph} visibleEdgeTypes={visibleEdgeTypes} />
        )}
      </div>

      {/* Meta footer */}
      {graph && (
        <p className="mt-2 text-[11px] text-gray-400 text-right">
          Cập nhật lúc {new Date(graph.meta.generatedAt).toLocaleTimeString("vi-VN")} · v{graph.meta.version}
        </p>
      )}
    </div>
  );
}
