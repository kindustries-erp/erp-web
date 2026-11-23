import * as React from "react";
import { DrawerRow } from "./DrawerRow";
import type { V2DrawerRowListProps } from "./DrawerField.type";

/**
 * Render danh sách DrawerRow theo array config chuẩn V2.
 * Hỗ trợ ẩn dòng theo điều kiện (`hidden`), sao chép và multiline.
 */
export function V2DrawerRowList({ rows, className }: V2DrawerRowListProps) {
  const visibleRows = rows.filter((r) => !r.hidden);

  return (
    <div className={className}>
      {visibleRows.map((r) => (
        <DrawerRow
          key={r.key}
          label={r.label}
          value={r.value}
          copyable={r.copyable}
          copyText={r.copyText}
          className={r.className}
          labelClassName={r.labelClassName}
          valueClassName={r.valueClassName}
          multiline={r.multiline}
        />
      ))}
    </div>
  );
}
