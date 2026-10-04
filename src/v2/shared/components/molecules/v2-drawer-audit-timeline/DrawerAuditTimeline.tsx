import React from "react";
import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type {
  DrawerAuditTimelineProps,
  DrawerAuditVariant,
} from "./DrawerAuditTimeline.type";

const VARIANT_NODE_STYLES: Record<DrawerAuditVariant, string> = {
  default: "bg-surface text-foreground border-border",
  success:
    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-800",
  warning:
    "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-800",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
};

function DefaultNodeIcon({
  variant = "default",
}: {
  variant?: DrawerAuditVariant;
}) {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case "warning":
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case "danger":
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <Activity className="w-3.5 h-3.5 text-muted-fg" />;
  }
}

export const DrawerAuditTimeline: React.FC<DrawerAuditTimelineProps> = ({
  items,
  emptyMessage = "Chưa có lịch sử thao tác",
  className,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-fg italic select-none">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("relative py-1 text-xs", className)}>
      {/* Continuous Spine */}
      <div className="absolute left-3 top-3 bottom-3 w-[2px] bg-border/70 -translate-x-1/2" />

      <div className="space-y-4">
        {items.map((item, index) => {
          const variant = item.variant || "default";
          return (
            <div
              key={item.id || index}
              className="relative flex items-start gap-2.5 pl-0.5 group"
            >
              {/* Circular Node */}
              <div
                className={cn(
                  "relative z-10 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                  VARIANT_NODE_STYLES[variant],
                )}
              >
                {item.icon || <DefaultNodeIcon variant={variant} />}
              </div>

              {/* Dotted horizontal connector */}
              <div className="w-2.5 mt-3 border-t-2 border-dotted border-border/80 shrink-0" />

              {/* Event Content Container */}
              <div className="flex-1 min-w-0 bg-surface/50 rounded-lg p-2.5 border border-border/60 hover:border-border transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <V2Text
                      variant="body-sm"
                      weight="semibold"
                      className="truncate"
                    >
                      {item.action}
                    </V2Text>
                    {item.actor && (
                      <V2Text
                        variant="caption"
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-fg leading-none"
                      >
                        {item.actor}
                      </V2Text>
                    )}
                    {item.badge}
                  </div>

                  <V2Text
                    variant="caption"
                    color="muted"
                    className="whitespace-nowrap shrink-0 leading-none"
                  >
                    {item.timestamp}
                  </V2Text>
                </div>

                {item.details && (
                  <V2Text
                    variant="caption"
                    color="muted"
                    className="leading-relaxed break-words mt-1 block"
                  >
                    {item.details}
                  </V2Text>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
