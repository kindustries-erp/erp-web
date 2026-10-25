import * as React from "react";
import { V2Button, V2Stack, V2Text } from "@/v2/shared/components/atoms";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { Badge } from "@/v2/shared/ui/badge";
import { cn } from "@/v2/shared/utils/cn";
import type {
  V2ExportHistoryListProps,
  V2ExportHistoryTone,
} from "./V2ExportHistoryList.type";

const TONE_BADGE: Record<
  V2ExportHistoryTone,
  "success" | "warning" | "destructive"
> = {
  ready: "success",
  running: "warning",
  failed: "destructive",
};

export const V2ExportHistoryList: React.FC<V2ExportHistoryListProps> = ({
  items,
  isLoading = false,
  emptyLabel,
  downloadLabel,
  downloadingLabel,
  downloadingId,
  onDownload,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className,
}) => {
  const busy = Boolean(downloadingId);

  return (
    <V2Stack gap="xs" className={cn("gap-2", className)}>
      {items.length === 0 && !isLoading ? (
        <V2Text
          variant="body-sm"
          className="py-6 text-center text-muted-foreground"
        >
          {emptyLabel}
        </V2Text>
      ) : (
        <V2Stack
          role="list"
          className="divide-y divide-border/60 rounded-lg border border-border/60"
        >
          {items.map((item) => (
            <V2Stack
              key={item.id}
              role="listitem"
              className="flex-row items-center gap-3 px-3 py-2"
            >
              <V2Stack gap="none" className="min-w-0 flex-1">
                <V2Text variant="body-sm" truncate className="font-medium">
                  {item.fileName}
                </V2Text>
                <V2Text variant="body-sm" className="text-muted-foreground">
                  {item.periodLabel} · {item.createdAt}
                </V2Text>
              </V2Stack>
              <Badge variant={TONE_BADGE[item.statusTone]}>
                {item.statusLabel}
              </Badge>
              <V2Button
                size="sm"
                variant="ghost"
                disabled={!item.canDownload || busy}
                isLoading={downloadingId === item.id}
                loadingText={downloadingLabel}
                onClick={() => onDownload(item.id)}
              >
                {downloadLabel}
              </V2Button>
            </V2Stack>
          ))}
        </V2Stack>
      )}
      <V2TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </V2Stack>
  );
};
