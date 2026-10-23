import * as React from "react";
import { format } from "date-fns";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import { getSyncLogClassName } from "./V2SyncProgress.helper";
import type { V2SyncProgressEntry } from "./V2SyncProgress.type";

export interface V2SyncProgressLogProps {
  logs: V2SyncProgressEntry[];
  emptyText: string;
  fillHeight?: boolean;
  className?: string;
}

/** Console nhật ký: tự cuộn xuống dòng mới nhất, giờ lấy từ mốc thời gian của từng dòng */
export const V2SyncProgressLog: React.FC<V2SyncProgressLogProps> = ({
  logs,
  emptyText,
  fillHeight,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      className={cn(
        "overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-100 space-y-1",
        fillHeight ? "min-h-0 flex-1" : "h-64",
        "dark:border-white/[0.06] dark:bg-black/40",
        className,
      )}
    >
      {logs.length === 0 ? (
        <V2Text variant="caption" className="text-slate-400">
          {emptyText}
        </V2Text>
      ) : (
        logs.map((log, idx) => (
          <div key={`${log.at}-${idx}`} className="flex gap-2">
            <span className="shrink-0 text-slate-400">
              [{format(new Date(log.at), "HH:mm:ss")}]
            </span>
            <span className={getSyncLogClassName(log.level)}>
              {log.message}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
V2SyncProgressLog.displayName = "V2SyncProgressLog";
