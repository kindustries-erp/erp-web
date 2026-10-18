import React from "react";
import { DataTable } from "@/shared/components/DataTable";
import { EmptyState } from "@/shared/components/EmptyState";
import type { ManualCashflowTableProps } from "../ManualCashflowTabContent.type";

export function ManualCashflowTable({
  tableId,
  items,
  columns,
  summaryRow,
  rowHoverActions,
  emptyLabel,
}: ManualCashflowTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        size="md"
        message={emptyLabel}
        description="Chưa ghi nhận khoản thu/chi tiền mặt hoặc chuyển khoản cá nhân ngoài hệ thống ERP."
      />
    );
  }

  return (
    <DataTable
      tableId={tableId}
      items={items}
      columns={columns}
      variant="spreadsheet"
      enableColumnResizing={true}
      summaryRow={summaryRow}
      rowHoverActions={rowHoverActions}
      emptyLabel={emptyLabel}
    />
  );
}
