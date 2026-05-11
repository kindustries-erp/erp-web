import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getWorkflowGraphApi } from '../modules/system/api/workflowGraphApi';
import type { WorkflowNode } from '../modules/system/api/workflowGraphApi';

import { computeLayout, FIT_OPTIONS, FitViewOnMount, NODE_TYPES, type WFNode } from '@/modules/system/components/WorkflowCanvasSupport';

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
