import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { getAttachmentTypeLabel } from "../../types/attachment.types";
import type { AttachmentTypeBadgeProps } from "./AttachmentTypeBadge.type";

export function AttachmentTypeBadge({
  type,
  className,
}: AttachmentTypeBadgeProps) {
  let colorClass = "bg-muted text-muted-foreground border-transparent";

  if (type === "HOP_DONG") {
    colorClass =
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
  } else if (type === "HOA_DON") {
    colorClass =
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40";
  } else if (type === "BANG_KE") {
    colorClass =
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "min-w-16 inline-flex justify-center text-xs font-medium px-2 py-0.5 rounded-md",
        colorClass,
        className,
      )}
    >
      {getAttachmentTypeLabel(type)}
    </Badge>
  );
}
