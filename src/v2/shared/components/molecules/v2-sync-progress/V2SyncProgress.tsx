import * as React from "react";
import { V2Progress } from "@/v2/shared/components/atoms/v2-progress";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import {
  getSyncProgressPercent,
  getSyncProgressStatusLabel,
  getSyncProgressTone,
} from "./V2SyncProgress.helper";
import { V2SyncProgressLog } from "./V2SyncProgressLog";
import type { V2SyncProgressProps } from "./V2SyncProgress.type";

/** Tiến trình đồng bộ: thanh % theo trạng thái + console nhật ký. Không có khung section, bọc bằng DrawerSection ở nơi dùng. */
export const V2SyncProgress: React.FC<V2SyncProgressProps> = ({
  status,
  progress,
  currentItem,
  logs,
  labels,
  fillHeight,
  className,
}) => (
  <div
    className={cn(
      "flex w-full flex-col gap-3",
      fillHeight && "min-h-0 flex-1",
      className,
    )}
  >
    <V2Progress
      value={getSyncProgressPercent(status, progress)}
      tone={getSyncProgressTone(status)}
      label={getSyncProgressStatusLabel(status, labels)}
      showValue
    />
    {status === "running" && currentItem && (
      <V2Text
        variant="body-sm"
        color="muted"
        truncate
        title={currentItem}
        className="min-w-0"
      >
        {labels.currentItem ? `${labels.currentItem}: ` : ""}
        {currentItem}
      </V2Text>
    )}
    <V2SyncProgressLog
      logs={logs}
      emptyText={labels.empty}
      fillHeight={fillHeight}
    />
  </div>
);
V2SyncProgress.displayName = "V2SyncProgress";
