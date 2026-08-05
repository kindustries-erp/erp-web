import { useState } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { SlidersHorizontal } from "lucide-react";
import { useT } from "@/core/i18n";
import type { DataTableColumn } from "@/shared/components/DataTable";

export function InventoryTrackingCustomPage() {
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
      key: "itemCode",
      header: t("inventoryTrackingCustom.itemCode", "Mã VT"),
      cell: (row) => row.item?.sku || "—",
    },
    {
      key: "itemName",
      header: t("inventoryTrackingCustom.itemName", "Tên VT"),
      cell: (row) => row.item?.itemName || "—",
    },
    {
      key: "status",
      header: t("inventoryTrackingCustom.status", "Trạng thái"),
      cell: (row) => row.status || "—",
    },
    {
      key: "customMetadata",
      header: t(
        "inventoryTrackingCustom.customMetadata",
        "Thuộc tính tùy chỉnh",
      ),
      cell: (row) => {
        if (!row.customMetadata) return "—";
        return (
          <div className="text-xs text-gray-500 whitespace-pre-wrap">
            {JSON.stringify(row.customMetadata, null, 2)}
          </div>
        );
      },
      size: 400,
    },
    {
      key: "notes",
      header: t("inventoryTrackingCustom.notes", "Ghi chú"),
      cell: (row) => row.notes || "—",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t(
          "inventoryTrackingCustom.title",
          "Theo dõi Tùy chỉnh (Custom)",
        )}
        desc={t(
          "inventoryTrackingCustom.desc",
          "Danh sách vật tư quản lý theo thuộc tính tùy chỉnh",
        )}
        icon={<SlidersHorizontal className="h-5 w-5" />}
        tableId="inventory-tracked-goods-custom-table"
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={loading}
        error={error}
        emptyLabel={t("inventoryTrackingCustom.emptyLabel", "Chưa có dữ liệu.")}
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
