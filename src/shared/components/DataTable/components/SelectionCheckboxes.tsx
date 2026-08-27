import React, { useCallback } from "react";
import type { Table as TanstackTable, Row } from "@tanstack/react-table";
import { Checkbox } from "@/shared/components/ui/checkbox";

export const SelectionHeaderCheckbox = React.memo(
  function SelectionHeaderCheckbox({ table }: { table: TanstackTable<any> }) {
    const checked =
      table.getIsAllPageRowsSelected() ||
      (table.getIsSomePageRowsSelected() && "indeterminate");
    const onCheckedChange = useCallback(
      (value: any) => {
        table.toggleAllPageRowsSelected(!!value);
      },
      [table],
    );

    return (
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    );
  },
);

export const SelectionCellCheckbox = React.memo(function SelectionCellCheckbox({
  row,
}: {
  row: Row<any>;
}) {
  const isSelected = row.getIsSelected();
  const onCheckedChange = useCallback(
    (value: any) => {
      row.toggleSelected(!!value);
    },
    [row],
  );

  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={onCheckedChange}
      aria-label="Select row"
      className="translate-y-[2px]"
      onClick={(e) => e.stopPropagation()}
    />
  );
});
