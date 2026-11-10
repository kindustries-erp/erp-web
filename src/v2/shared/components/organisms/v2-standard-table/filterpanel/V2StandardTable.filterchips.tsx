import * as React from "react";
import { V2FilterChip } from "@/v2/shared/components/atoms/v2-filter-chip";
import type { V2ActiveFilterChip } from "../utils/v2ActiveFilterChips";

export interface V2TableFilterChipsProps {
  chips: V2ActiveFilterChip[];
  /** Bấm chip: mở card của cột đó */
  onReveal: (columnKey: string) => void;
  /** Bấm x trên chip: gỡ điều kiện của cột */
  onRemove: (columnKey: string) => void;
}

/** Hàng chip điều kiện đang áp dụng; dùng chung cho panel lọc và editor trong hộp thoại bộ lọc */
export const V2TableFilterChips: React.FC<V2TableFilterChipsProps> = ({
  chips,
  onReveal,
  onRemove,
}) => (
  <div className="flex flex-wrap gap-1.5">
    {chips.map((chip) => (
      <V2FilterChip
        key={chip.id}
        label={chip.label}
        summary={chip.summary}
        onClick={() => onReveal(chip.columnKey)}
        onRemove={() => onRemove(chip.columnKey)}
      />
    ))}
  </div>
);
