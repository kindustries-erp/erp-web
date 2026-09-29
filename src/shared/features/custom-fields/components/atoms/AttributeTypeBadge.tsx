import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import type { ModuleAttributeFieldType } from "@/core/api/moduleConfigApi";
import {
  FIELD_TYPE_ICONS,
  getFieldTypeShortLabel,
} from "../../domains/constants";

interface AttributeTypeBadgeProps {
  type: ModuleAttributeFieldType;
  t: (key: string, fallback: string) => string;
  className?: string;
}

export function AttributeTypeBadge({
  type,
  t,
  className,
}: AttributeTypeBadgeProps) {
  const icon = FIELD_TYPE_ICONS[type];
  const shortLabel = getFieldTypeShortLabel(type, t);

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 text-[11px] font-medium py-0.5 px-1.5 ${className || ""}`}
    >
      {icon}
      <span>{shortLabel}</span>
    </Badge>
  );
}
