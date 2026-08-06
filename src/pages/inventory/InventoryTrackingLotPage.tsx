import { useState } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Package } from "lucide-react";
import { useT } from "@/core/i18n";
import type { DataTableColumn } from "@/shared/components/DataTable";

export function InventoryTrackingLotPage() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // TODO: Use actual API hook when available
  const items: any[] = [];
  const loading = false;
  const error = null;
  const total = 0;
  const totalPages = 0;

  const columns: DataTableColumn<any>[] = [
    {
      key: "lotCode",
      header: t("inventoryTrackingLot.lotCode", "Mã lô"),
      cell: (row) => row.lotCode || "—",
    },
    {
      key: "itemCode",
      header: t("inventoryTrackingLot.itemCode", "Mã VT"),
      cell: (row) => row.item?.sku || "—",
    },
    {
      key: "itemName",
      header: t("inventoryTrackingLot.itemName", "Tên VT"),
      cell: (row) => row.item?.itemName || "—",
    },
    {
      key: "receivedQty",
      header: t("inventoryTrackingLot.receivedQty", "SL nhập"),
      cell: (row) => row.receivedQty || 0,
      className: "text-right",
    },
    {
      key: "issuedQty",
      header: t("inventoryTrackingLot.issuedQty", "SL xuất"),
      cell: (row) => row.issuedQty || 0,
      className: "text-right",
    },
    {
      key: "expiryDate",
      header: t("inventoryTrackingLot.expiryDate", "Hạn sử dụng"),
      cell: (row) => row.expiryDate || "—",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("inventoryTrackingLot.title", "Theo dõi Lô (Lot)")}
        desc={t(
          "inventoryTrackingLot.desc",
          "Danh sách vật tư quản lý theo Lô",
        )}
        icon={<Package className="h-5 w-5" />}
        tableId="inventory-tracked-goods-lot-table"
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={loading}
        error={error}
        emptyLabel={t("inventoryTrackingLot.emptyLabel", "Chưa có dữ liệu.")}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </>
  );
}
