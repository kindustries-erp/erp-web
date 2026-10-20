import React from "react";
import { StandardTable } from "@/shared/components/StandardTable";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useGarageReconciliationInvoicesTable } from "./GarageReconciliationInvoicesTable.hook";
import type { GarageReconciliationInvoicesTableProps } from "./GarageReconciliationInvoicesTable.type";

export function GarageReconciliationInvoicesTable(
  props: GarageReconciliationInvoicesTableProps,
) {
  const { columns } = useGarageReconciliationInvoicesTable(props);

  const tableId =
    props.invoiceDirection === "OUT"
      ? "garage-reconciliation-invoice-out-table"
      : "garage-reconciliation-invoice-in-table";

  return (
    <div
      className={
        props.containerClassName ||
        "h-[calc(100vh-395px)] min-h-[260px] max-h-[calc(100vh-395px)] flex flex-col overflow-hidden"
      }
    >
      <StandardTable
        tableId={tableId}
        items={props.items}
        columns={columns}
        getRowKey={(inv: ErpInvoice) => inv.id}
        variant="spreadsheet"
        enableColumnResizing={true}
        loading={props.loading}
        page={props.page}
        pageSize={props.pageSize}
        total={props.total}
        totalPages={props.totalPages}
        onPage={props.onPageChange}
        onPageSize={props.onPageSizeChange}
        minWidth={props.minWidth || 1180}
        containerClassName="flex-1 min-h-0"
      />
    </div>
  );
}
