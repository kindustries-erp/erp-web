import React from "react";
import { formatAttributeValue } from "../../utils/customFieldHelper";
import type { AttributeViewBoxProps } from "../../domains/types";

export function AttributeViewBox({
  attr,
  value,
  locale,
}: AttributeViewBoxProps) {
  const displayVal = formatAttributeValue(value, attr, locale);

  return (
    <div className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/40 rounded-md border border-border/40 min-h-[36px] flex items-center">
      {displayVal}
    </div>
  );
}
