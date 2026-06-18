import { DataTable } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Eye, Link2, Warehouse } from "lucide-react";
import { PurchaseSubRow } from "@/modules/operational/components/list/PurchaseSubRow";
import { usePurchaseColumns } from "@/modules/operational/components/list/columns/purchaseColumns";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { useT } from "@/core/i18n";

export interface PurchaseOrderTableProps {
  items: OperationalDocument[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  purchaseSortArray?: string[];
  togglePurchaseSort: (colId: string) => void;
  expandedRowIds: Record<string, boolean>;
  toggleExpandRow: (id: string) => void;
  onOpenDetail: (row: OperationalDocument) => void;
  onOpenPosting: (row: OperationalDocument) => void;
  onOpenSettlement: (row: OperationalDocument) => void;
}

export function PurchaseOrderTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  setPage,
  setPageSize,
  purchaseSortArray,
  togglePurchaseSort,
  expandedRowIds,
  toggleExpandRow,
  onOpenDetail,
  onOpenPosting,
  onOpenSettlement,
}: PurchaseOrderTableProps) {
  const t = useT();
  const columns = usePurchaseColumns({
    variant: "purchase",
    expandedRowIds,
    onToggleExpand: toggleExpandRow,
  });

  return (
    <DataTable
      columns={columns}
      items={items}
      total={total}
      totalPages={totalPages}
      page={page}
      pageSize={pageSize}
      onPage={setPage}
      onPageSize={setPageSize}
      sortBy={
        purchaseSortArray?.[0]?.startsWith("-")
          ? purchaseSortArray[0].slice(1)
          : purchaseSortArray?.[0]
      }
      sortOrder={purchaseSortArray?.[0]?.startsWith("-") ? "desc" : "asc"}
      onSort={togglePurchaseSort}
      getRowKey={(row) => `${row.document_type || "purchase"}-${row.id}`}
      emptyLabel={t("Chưa có dữ liệu.")}
      minWidth={1200}
      actionsColumn={{
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label: t("Chi tiết"),
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onOpenDetail(row),
              },
              {
                label: t("Liên kết tiền"),
                icon: <Link2 className="h-4 w-4" />,
                onClick: () => onOpenSettlement(row),
                hidden: Number(row.open_amount || 0) <= 0,
              },
              {
                label: t("Nhập kho"),
                icon: <Warehouse className="h-4 w-4" />,
                onClick: () => onOpenPosting(row),
              },
            ]}
          />
        ),
      }}
      expandedRowKeys={Object.keys(expandedRowIds).filter(
        (key) => expandedRowIds[key],
      )}
      renderSubRow={(row) => <PurchaseSubRow rowId={row.id} />}
    />
  );
}
