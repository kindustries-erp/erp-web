import React from "react";
import {
  V2StandardTable,
  type V2Column,
} from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { Badge } from "@/v2/shared/ui/badge";
import type { TraceabilityNode } from "../../types/traceability.type";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2TraceTableSectionProps {
  tableId: string;
  title: string;
  items: TraceabilityNode[];
  columns: V2Column<TraceabilityNode>[];
  rowActions: (row: TraceabilityNode) => V2RowActionGroup[];
  emptyLabel: string;
}

/** Một nhóm trong bảng kê (trực tiếp hoặc gián tiếp), có tiêu đề và số lượng */
export function V2TraceTableSection({
  tableId,
  title,
  items,
  columns,
  rowActions,
  emptyLabel,
}: V2TraceTableSectionProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <V2Text as="span">{title}</V2Text>
        {items.length > 0 && <Badge variant="secondary">{items.length}</Badge>}
      </div>
      <V2StandardTable<TraceabilityNode>
        tableId={tableId}
        mode="client"
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        emptyLabel={emptyLabel}
      />
    </section>
  );
}
