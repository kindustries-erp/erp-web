import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import type { TimeHorizonInvoiceItem } from "../types";

export interface TimeHorizonInvoicesTabProps {
  items: TimeHorizonInvoiceItem[];
  columns: DataTableColumn<TimeHorizonInvoiceItem>[];
  summaryRow: Record<string, React.ReactNode>;
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  t: (key: string, fallback?: any) => string;
}

export function TimeHorizonInvoicesTab({
  items,
  columns,
  summaryRow,
  isLoading,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  t,
}: TimeHorizonInvoicesTabProps) {
  return (
    <div className="flex-1 min-w-0 w-full flex flex-col pt-1">
      <DrawerSection
        title={`${t(
          "debts:horizonDrawer.invoicesListTitle",
          "Danh sách hóa đơn chi tiết",
        )} (${total})`}
        collapsible
        defaultCollapsed={false}
        bodyClassName="p-0"
      >
        <DataTable<TimeHorizonInvoiceItem>
          tableId="time-horizon-detail-invoices-table"
          items={items}
          columns={columns}
          loading={isLoading}
          variant="spreadsheet"
          enableColumnResizing={true}
          getRowKey={(r) => r.id}
          summaryRow={summaryRow}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPage={onPageChange}
          onPageSize={onPageSizeChange}
          containerClassName="max-h-[calc(100vh-275px)] overflow-y-auto pb-2"
          emptyLabel={t(
            "debts:horizonDrawer.emptyInvoices",
            "Không tìm thấy hóa đơn nào trong nhóm tuổi nợ này",
          )}
        />
      </DrawerSection>
    </div>
  );
}
