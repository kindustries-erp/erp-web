import React from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
} from "lucide-react";

export interface DrawerAuditLogDiff {
  field: string;
  fieldLabel?: string;
  oldVal?: React.ReactNode;
  newVal?: React.ReactNode;
}

export interface DrawerAuditLogItem {
  id: string;
  actionType: string;
  actionLabel?: string;
  actorName?: string;
  actorEmail?: string;
  timestamp: string | Date;
  message?: string;
  diffs?: DrawerAuditLogDiff[];
  status?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
}

export interface DrawerAuditTimelineProps {
  items: DrawerAuditLogItem[];
  loading?: boolean;
  emptyLabel?: string;
  compact?: boolean;
  className?: string;
}

function getActionMeta(actionType: string) {
  const norm = actionType.toUpperCase();
  if (
    norm.includes("CREATE") ||
    norm.includes("ADD") ||
    norm.includes("INSERT")
  ) {
    return {
      icon: <Sparkles className="w-3.5 h-3.5" />,
      badgeCls: "bg-primary/10 text-primary border-primary/20",
    };
  }
  if (
    norm.includes("APPROVE") ||
    norm.includes("CONFIRM") ||
    norm.includes("VALID") ||
    norm.includes("DONE")
  ) {
    return {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badgeCls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    };
  }
  if (
    norm.includes("CANCEL") ||
    norm.includes("REJECT") ||
    norm.includes("DELETE")
  ) {
    return {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      badgeCls: "bg-red-500/10 text-red-700 border-red-500/20",
    };
  }
  if (
    norm.includes("SYNC") ||
    norm.includes("IMPORT") ||
    norm.includes("POST")
  ) {
    return {
      icon: <RefreshCw className="w-3.5 h-3.5" />,
      badgeCls: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    };
  }
  return {
    icon: <Edit2 className="w-3.5 h-3.5" />,
    badgeCls: "bg-muted text-muted-foreground border-border",
  };
}

function formatTimestamp(timestamp: string | Date): {
  formatted: string;
  full: string;
} {
  if (!timestamp) return { formatted: "—", full: "" };
  const d = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(d.getTime())) return { formatted: String(timestamp), full: "" };

  const full = d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return { formatted: "Vừa xong", full };
  if (diffMinutes < 60) return { formatted: `${diffMinutes}m trước`, full };
  if (diffHours < 24) return { formatted: `${diffHours}h trước`, full };
  if (diffDays === 1)
    return {
      formatted: `Hôm qua ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
      full,
    };
  if (diffDays < 7) return { formatted: `${diffDays}d trước`, full };

  return { formatted: full, full };
}

export function DrawerAuditTimeline({
  items,
  loading = false,
  emptyLabel,
  compact = false,
  className,
}: DrawerAuditTimelineProps) {
  const t = useT();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-3 pl-8 relative">
        <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-300 dark:bg-slate-700" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative flex items-center gap-3 animate-pulse"
          >
            <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted/60 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
        <Clock className="w-4 h-4 text-muted-foreground/40 mb-0.5" />
        <span>{emptyLabel || t("Chưa có lịch sử ghi nhận.")}</span>
      </div>
    );
  }

  return (
    <div className={cn("relative pl-1", compact ? "py-1" : "py-2", className)}>
      <div className="relative">
        {/* Continuous vertical divider spine (Solid, clearly visible) */}
        <div className="absolute left-[13px] top-3.5 bottom-3.5 w-[2px] bg-slate-300 dark:bg-slate-700 rounded-full" />

        <div className={cn(compact ? "space-y-3" : "space-y-6")}>
          {items.map((item, idx) => {
            const isLatest = idx === 0;
            const { icon, badgeCls } = getActionMeta(item.actionType);
            const { formatted, full } = formatTimestamp(item.timestamp);
            const actorDisplay =
              item.actorName || item.actorEmail || t("Hệ thống");

            return (
              <div
                key={item.id || idx}
                className="relative flex items-start group"
              >
                {/* 1. Circular Node (Inspired by Image 2 infographic) */}
                <div className="relative z-10 flex-shrink-0">
                  {isLatest ? (
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground flex items-center justify-center shadow-xs ring-4 ring-slate-100 dark:ring-slate-800 transition-transform group-hover:scale-105">
                      {icon}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface border-2 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-transform group-hover:scale-105">
                      {icon}
                    </div>
                  )}
                </div>

                {/* 2. Dotted horizontal connector (Image 2 style) */}
                <div className="w-4 h-0 border-t-2 border-dotted border-slate-300 dark:border-slate-700 self-center mt-3.5 flex-shrink-0" />

                {/* 3. Event Content (Borderless, clean typography) */}
                <div className="flex-1 min-w-0 pl-1.5 pt-0.5">
                  {/* Top Line: Title + Actor + Timestamp */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {item.actionLabel || item.actionType}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {actorDisplay}
                      </span>
                      {item.status && (
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.2 rounded border",
                            badgeCls,
                          )}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>

                    <div
                      className="text-[11px] text-muted-foreground font-mono cursor-help flex items-center gap-1 shrink-0"
                      title={full}
                    >
                      <span>{formatted}</span>
                    </div>
                  </div>

                  {/* Message */}
                  {item.message && (
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  )}

                  {/* Diffs */}
                  {item.diffs && item.diffs.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                      {item.diffs.map((diff, dIdx) => (
                        <div
                          key={dIdx}
                          className="inline-flex items-center gap-1.5 text-xs bg-muted/40 px-2 py-0.5 rounded"
                        >
                          <span className="text-muted-foreground text-[11px]">
                            {diff.fieldLabel || diff.field}:
                          </span>
                          {diff.oldVal !== undefined && (
                            <span className="text-[11px] text-red-600 line-through">
                              {diff.oldVal}
                            </span>
                          )}
                          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-[11px] font-medium text-emerald-700">
                            {diff.newVal ?? "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
