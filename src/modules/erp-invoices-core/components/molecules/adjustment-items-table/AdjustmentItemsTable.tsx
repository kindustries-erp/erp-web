import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { StandardTable } from "@/shared/components/StandardTable";
import { cn } from "@/shared/utils";
import type { AdjustmentItemsTableProps } from "./AdjustmentItemsTable.type";
import { getAdjustmentItemsColumns } from "./AdjustmentItemsTable.columns";

export const AdjustmentItemsTable: React.FC<AdjustmentItemsTableProps> = ({
  items,
  className,
}) => {
  const { t } = useTranslation("erpInvoices");
  const columns = useMemo(() => getAdjustmentItemsColumns(t), [t]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Package className="w-3.5 h-3.5 text-muted-foreground" />
        <span>{t("Đối soát số lượng mặt hàng")}</span>
        <span className="text-[11px] font-normal text-muted-foreground">
          ({items.length})
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-surface">
        <StandardTable
          items={items}
          columns={columns}
          getRowKey={(r) => r.itemCode || r.description}
          variant="spreadsheet"
          minWidth={600}
          tableId="adjustment-items-table"
          enableColumnResizing={true}
          enableRowHoverActions={false}
          containerClassName="w-full"
        />
      </div>
    </div>
  );
};

export default AdjustmentItemsTable;
