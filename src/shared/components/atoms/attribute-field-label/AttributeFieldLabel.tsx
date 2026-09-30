import React from "react";
import { CornerDownRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { AttributeFieldLabelProps } from "@/shared/types/customFields";

export function AttributeFieldLabel({
  displayName,
  isSystem,
  isChild,
  parentDisplayName,
  parentCode,
  t,
}: AttributeFieldLabelProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        {isChild && (
          <CornerDownRight className="w-3 h-3 text-primary/70 shrink-0 inline-block mr-0.5" />
        )}
        <span className="font-medium text-foreground">{displayName}</span>
        {isSystem ? (
          <Badge
            variant="outline"
            className="text-[10px] font-medium py-0 px-1 text-muted-foreground"
          >
            {t("moduleConfig.systemAttr", "Hệ thống")}
          </Badge>
        ) : null}
      </div>
      {isChild && parentDisplayName && (
        <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-normal">
          <span>🔗 {t("moduleConfig.childOf", "Phụ thuộc:")}</span>
          <span className="font-medium text-foreground/80">
            {parentDisplayName}
          </span>
          {parentCode && (
            <span className="font-mono text-[9px] text-muted-foreground">
              ({parentCode})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
