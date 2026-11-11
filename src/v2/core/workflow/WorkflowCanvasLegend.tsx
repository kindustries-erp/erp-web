import type { WorkflowCanvasToolbarLabels } from "./WorkflowCanvasToolbar";

type LegendLabels = Pick<
  WorkflowCanvasToolbarLabels,
  | "step"
  | "solidArrow"
  | "dashedArrow"
  | "readArrow"
  | "completed"
  | "cancelled"
>;

/** Chú giải ký hiệu của sơ đồ (vòng số, loại mũi tên, viền hoàn tất/hủy). */
export function WorkflowCanvasLegend({ labels }: { labels: LegendLabels }) {
  return (
    <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
      <span className="inline-flex items-center gap-1">
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
          1
        </span>
        {labels.step}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-6 border-t-2 border-slate-700" />
        {labels.solidArrow}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-6 border-t-2 border-dashed border-slate-500" />
        {labels.dashedArrow}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-6 border-t border-dotted border-slate-400" />
        {labels.readArrow}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-4 rounded-sm border-2 border-green-700" />
        {labels.completed}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-4 rounded-sm border-2 border-red-700" />
        {labels.cancelled}
      </span>
    </div>
  );
}
