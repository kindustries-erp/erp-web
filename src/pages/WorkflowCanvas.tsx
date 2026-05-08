import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
  type FitViewOptions,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getWorkflowGraphApi } from '../modules/system/api/workflowGraphApi';
import type { WorkflowNode, WorkflowEdge } from '../modules/system/api/workflowGraphApi';

// ─── ReactFlow node type helpers ──────────────────────────────────────────────

type WFNode = Node<WorkflowNode, string>;

// ─── Layout constants ─────────────────────────────────────────────────────────

const LEVEL_Y: Record<number, number> = {
  0: 0,
  1: 180,
  2: 380,
  3: 640,
  4: 900,
};

const NODE_W = 280;
const NODE_GAP_X = 32;
const STATUS_W = 150;
const STATUS_GAP_X = 20;

// ─── Auto layout ──────────────────────────────────────────────────────────────

function computeLayout(
  apiNodes: WorkflowNode[],
  apiEdges: WorkflowEdge[],
): { rfNodes: WFNode[]; rfEdges: Edge[] } {
  const byLevel: Record<number, WorkflowNode[]> = {};
  for (const n of apiNodes) {
    (byLevel[n.level] ??= []).push(n);
  }

  const posMap: Record<string, { x: number; y: number }> = {};

  const lvl0 = byLevel[0] ?? [];
  lvl0.forEach((n, i) => {
    posMap[n.id] = {
      x: i * (NODE_W + NODE_GAP_X) - ((lvl0.length - 1) * (NODE_W + NODE_GAP_X)) / 2,
      y: LEVEL_Y[0],
    };
  });

  for (const lvl of [1, 2, 3]) {
    const nodesAtLevel = byLevel[lvl] ?? [];
    if (!nodesAtLevel.length) continue;
    const groups: Record<string, WorkflowNode[]> = {};
    for (const n of nodesAtLevel) {
      const parent = n.meta?.parentId ?? (lvl === 1 ? 'root' : 'admin');
      (groups[parent] ??= []).push(n);
    }
    for (const [parentId, children] of Object.entries(groups)) {
      const parentPos = posMap[parentId] ?? { x: 0, y: 0 };
      const totalW = children.length * NODE_W + (children.length - 1) * NODE_GAP_X;
      const startX = parentPos.x + NODE_W / 2 - totalW / 2;
      children.forEach((child, i) => {
        posMap[child.id] = {
          x: startX + i * (NODE_W + NODE_GAP_X),
          y: LEVEL_Y[lvl],
        };
      });
    }
  }

  const lvl4 = byLevel[4] ?? [];
  const procGroups: Record<string, WorkflowNode[]> = {};
  for (const n of lvl4) {
    const parent = n.meta?.parentId ?? '';
    (procGroups[parent] ??= []).push(n);
  }
  for (const [procId, statusNodes] of Object.entries(procGroups)) {
    const parentPos = posMap[procId] ?? { x: 0, y: 0 };
    const totalW = statusNodes.length * STATUS_W + (statusNodes.length - 1) * STATUS_GAP_X;
    const startX = parentPos.x + NODE_W / 2 - totalW / 2;
    statusNodes.forEach((n, i) => {
      posMap[n.id] = {
        x: startX + i * (STATUS_W + STATUS_GAP_X),
        y: LEVEL_Y[4],
      };
    });
  }

  const rfNodes: WFNode[] = apiNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: posMap[n.id] ?? { x: 0, y: LEVEL_Y[n.level] },
    data: n,
    style: { width: n.type === 'status' ? STATUS_W : NODE_W },
  }));

  const rfEdges: Edge[] = apiEdges.map((e) => {
    const isTransition = e.type === 'workflow_transition';
    const isHierarchy = e.type === 'hierarchy';
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: isTransition ? 'smoothstep' : 'bezier',
      animated: isTransition,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isTransition ? '#6366f1' : isHierarchy ? '#1e40af' : '#64748b',
      },
      style: {
        stroke: isTransition ? '#6366f1' : isHierarchy ? '#1e40af' : '#94a3b8',
        strokeWidth: isHierarchy ? 2 : 1.5,
      },
      labelStyle: { fontSize: 10, fill: '#64748b' },
      labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.85 },
    };
  });

  return { rfNodes, rfEdges };
}

// ─── Employee chips ────────────────────────────────────────────────────────────

function EmployeeChips({ employees }: { employees: WorkflowNode['employees'] }) {
  const show = employees.slice(0, 4);
  const rest = employees.length - show.length;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {show.map((e) => (
        <span
          key={e.id}
          title={`${e.name} — ${e.position}`}
          className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
          {e.name}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
          +{rest}
        </span>
      )}
    </div>
  );
}

// ─── Custom node components ────────────────────────────────────────────────────

function RootNode({ data }: NodeProps<WFNode>) {
  return (
    <div className="rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-700 to-blue-900 p-4 text-white shadow-lg">
      <div className="text-center text-sm font-bold uppercase tracking-widest opacity-60">
        Hệ thống
      </div>
      <div className="mt-1 text-center text-lg font-extrabold">{data.label}</div>
      <div className="mt-1 text-center text-xs opacity-75">{data.description}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function AdminNode({ data }: NodeProps<WFNode>) {
  return (
    <div className="rounded-xl border-2 border-indigo-400 bg-gradient-to-br from-indigo-700 to-indigo-900 p-4 text-white shadow-lg">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <span className="text-lg">👑</span>
        <div className="font-bold leading-tight">{data.label}</div>
      </div>
      {data.roles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.roles.map((r) => (
            <span key={r} className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
              {r}
            </span>
          ))}
        </div>
      )}
      {data.employees.length > 0 && <EmployeeChips employees={data.employees} />}
      {data.employees.length === 0 && (
        <p className="mt-2 text-[10px] italic opacity-60">Chưa có dữ liệu người dùng</p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function DepartmentNode({ data }: NodeProps<WFNode>) {
  return (
    <div className="rounded-xl border border-sky-300 bg-gradient-to-br from-sky-600 to-sky-800 p-3 text-white shadow-md">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <span className="text-base">🏢</span>
        <div className="font-semibold leading-tight">{data.label}</div>
      </div>
      {data.description && (
        <p className="mt-1 text-[10px] opacity-70 line-clamp-2">{data.description}</p>
      )}
      {data.employees.length > 0 ? (
        <>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide opacity-60">
            Nhân viên ({data.employees.length})
          </div>
          <EmployeeChips employees={data.employees} />
        </>
      ) : (
        <p className="mt-2 text-[10px] italic opacity-50">Chưa có nhân viên</p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function ProcessNode({ data }: NodeProps<WFNode>) {
  const color = data.meta?.color ?? '#6366f1';
  return (
    <div
      className="rounded-xl border text-white shadow-md"
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${color}dd 0%, ${color}99 100%)`,
        padding: '12px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-bold">{data.label}</div>
      <p className="mt-0.5 text-[10px] opacity-75 line-clamp-2">{data.description}</p>

      {data.rules.length > 0 && (
        <>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide opacity-70">
            Quy tắc
          </div>
          <ul className="mt-1 space-y-0.5">
            {data.rules.slice(0, 4).map((r, i) => (
              <li key={i} className="text-[9px] leading-snug opacity-80">
                • {r}
              </li>
            ))}
            {data.rules.length > 4 && (
              <li className="text-[9px] opacity-50">+{data.rules.length - 4} quy tắc...</li>
            )}
          </ul>
        </>
      )}

      {data.statuses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.statuses.map((s) => (
            <span
              key={s.value}
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
              style={{ backgroundColor: s.color }}
            >
              {s.label}{s.terminal ? ' ✓' : ''}
            </span>
          ))}
        </div>
      )}

      {data.meta?.endpoints && data.meta.endpoints.length > 0 && (
        <>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide opacity-70">
            API
          </div>
          {data.meta.endpoints.slice(0, 3).map((ep) => (
            <code key={ep} className="block text-[8px] font-mono opacity-70 truncate">
              {ep}
            </code>
          ))}
          {data.meta.endpoints.length > 3 && (
            <code className="block text-[8px] font-mono opacity-50">
              +{data.meta.endpoints.length - 3} more...
            </code>
          )}
        </>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function StatusNode({ data }: NodeProps<WFNode>) {
  const color = data.meta?.color ?? '#94a3b8';
  const terminal = data.meta?.terminal === true;
  return (
    <div
      className="rounded-full border-2 px-3 py-2 text-center text-white shadow"
      style={{ borderColor: color, backgroundColor: color + 'dd' }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-[10px] font-bold leading-tight">{data.label}</div>
      {terminal && <div className="mt-0.5 text-[8px] opacity-70">■ terminal</div>}
      {!terminal && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

const NODE_TYPES = {
  root: RootNode,
  admin: AdminNode,
  department: DepartmentNode,
  process: ProcessNode,
  status: StatusNode,
};

// ─── Fit on mount ─────────────────────────────────────────────────────────────

const FIT_OPTIONS: FitViewOptions = { padding: 0.12 };

function FitViewOnMount() {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const t = setTimeout(() => fitView(FIT_OPTIONS), 80);
    return () => clearTimeout(t);
  }, [fitView]);
  return null;
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function CanvasInner() {
  const [rfNodes, setRfNodes] = useState<WFNode[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorkflowNode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const graph = await getWorkflowGraphApi();
      const { rfNodes: n, rfEdges: e } = computeLayout(graph.nodes, graph.edges);
      setRfNodes(n);
      setRfEdges(e);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải sơ đồ quy trình';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="mb-2 text-3xl animate-spin">⚙</div>
          <div>Đang tải sơ đồ quy trình...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-red-400 text-4xl">✕</div>
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={load}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-slate-900">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={FIT_OPTIONS}
        minZoom={0.05}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        onNodeClick={(_, node) => setSelected(node.data as unknown as WorkflowNode)}
        onPaneClick={() => setSelected(null)}
      >
        <Background color="#334155" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const d = n.data as unknown as WorkflowNode;
            return d?.meta?.color ?? '#64748b';
          }}
          style={{ background: '#0f172a' }}
        />
        <FitViewOnMount />
      </ReactFlow>

      {/* Legend */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-slate-800/90 p-3 text-xs text-slate-200 shadow">
        <div className="mb-1 font-bold text-white">Chú thích</div>
        {[
          { color: '#1e40af', label: 'Root / Hệ thống' },
          { color: '#4f46e5', label: 'Ban Giám Đốc' },
          { color: '#0369a1', label: 'Phòng ban' },
          { color: '#ec4899', label: 'Quy trình nghiệp vụ' },
          { color: '#94a3b8', label: 'Trạng thái' },
        ].map(({ color, label }) => (
          <div key={label} className="mt-0.5 flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="absolute right-3 top-3 bottom-3 w-72 overflow-y-auto rounded-lg bg-slate-800/95 p-4 text-xs text-slate-200 shadow-xl">
          <button
            onClick={() => setSelected(null)}
            className="float-right text-base text-slate-400 hover:text-white"
          >✕</button>
          <div
            className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
            style={{ background: selected.meta?.color ?? '#475569' }}
          >
            {selected.type}
          </div>
          <h3 className="mt-1 text-base font-bold text-white">{selected.label}</h3>
          <p className="mt-1 text-slate-400">{selected.description}</p>

          {selected.employees.length > 0 && (
            <section className="mt-3">
              <div className="mb-1 font-semibold text-slate-300">
                👤 Nhân viên ({selected.employees.length})
              </div>
              {selected.employees.map((e) => (
                <div key={e.id} className="mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                  <span className="font-medium text-white">{e.name}</span>
                  {e.position && <span className="truncate text-slate-400">— {e.position}</span>}
                </div>
              ))}
            </section>
          )}

          {selected.rules.length > 0 && (
            <section className="mt-3">
              <div className="mb-1 font-semibold text-slate-300">📋 Quy tắc nghiệp vụ</div>
              <ol className="list-inside list-decimal space-y-1">
                {selected.rules.map((r, i) => (
                  <li key={i} className="leading-snug text-slate-300">{r}</li>
                ))}
              </ol>
            </section>
          )}

          {selected.statuses.length > 0 && (
            <section className="mt-3">
              <div className="mb-1 font-semibold text-slate-300">🔵 Trạng thái</div>
              <div className="flex flex-wrap gap-1">
                {selected.statuses.map((s) => (
                  <span
                    key={s.value}
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: s.color }}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {selected.meta?.endpoints && selected.meta.endpoints.length > 0 && (
            <section className="mt-3">
              <div className="mb-1 font-semibold text-slate-300">🔗 API Endpoints</div>
              {selected.meta.endpoints.map((ep) => (
                <code key={ep} className="block font-mono text-[10px] text-slate-400">{ep}</code>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkflowCanvas() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-5 py-3">
        <div>
          <h1 className="text-lg font-bold text-white">Sơ đồ Quy trình ERP</h1>
          <p className="text-xs text-slate-400">
            BGĐ → Phòng ban → Nghiệp vụ → Trạng thái • Click vào node để xem chi tiết
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <CanvasInner />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
