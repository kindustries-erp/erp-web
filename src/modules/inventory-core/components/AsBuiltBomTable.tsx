import { DataTable } from "@/shared/components/DataTable";
import { useT } from "@/core/i18n";
import type { AsBuiltBomItem } from "@/modules/manufacturing/api/manufacturingApi";

export interface AsBuiltBomTableProps {
  items: AsBuiltBomItem[];
  loading?: boolean;
}

export function AsBuiltBomTable({ items, loading }: AsBuiltBomTableProps) {
  const t = useT();

  return (
    <DataTable
      items={items}
      getRowKey={(item) => item.id}
      variant="spreadsheet"
      emptyLabel={t("Chưa có linh kiện nào được lắp ráp.")}
      loading={loading}
      columns={[
        {
          key: "index",
          header: "#",
          size: 40,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          cell: (_, idx) => (
            <span className="text-muted-foreground">{idx + 1}</span>
          ),
        },
        {
          key: "itemName",
          header: t("Tên linh kiện"),
          minSize: 200,
          headerClassName: "w-[200px] min-w-[200px]",
          className: "w-[200px] min-w-[200px]",
          cell: (item) => (
            <div
              className="font-medium text-foreground truncate max-w-[260px]"
              title={item.serial?.item_name || item.serial?.sku || "-"}
            >
              {item.serial?.item_name || item.serial?.sku || "-"}
            </div>
          ),
        },
        {
          key: "sku",
          header: t("Mã linh kiện"),
          minSize: 140,
          headerClassName: "w-[140px] min-w-[140px]",
          className: "w-[140px] min-w-[140px]",
          cell: (item) => <span>{item.serial?.sku || "-"}</span>,
        },
        {
          key: "serialNo",
          header: t("Số seri"),
          minSize: 160,
          headerClassName: "w-[160px] min-w-[160px]",
          className: "w-[160px] min-w-[160px]",
          cell: (item) => (
            <span className="font-medium">{item.serial?.serial_no || "-"}</span>
          ),
        },
      ]}
    />
  );
}
