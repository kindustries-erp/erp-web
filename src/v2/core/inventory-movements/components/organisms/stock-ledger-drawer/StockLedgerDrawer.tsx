import * as React from "react";
import {
  DrawerSection,
  V2Button,
  V2DrawerLayout,
  V2DrawerLinesTable,
  V2DrawerSize,
  V2StandardDrawer,
  V2Text,
} from "@/v2/shared/components";
import type { V2DrawerLinesColumn } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useStockTransactionsQuery } from "../../../api/queries/useStockTransactionsQuery";
import type { StockTransactionRow } from "../../../domain/stockBalance";
import type { InventoryMovementsModuleConfig } from "../../../inventoryMovements.config.type";

export interface StockLedgerDrawerProps {
  config: InventoryMovementsModuleConfig;
  itemCode: string;
  itemName: string;
  onClose: () => void;
}

const PAGE_SIZE = 20;
const num = (value: number) => Number(value ?? 0).toLocaleString("vi-VN");

/** Drawer thẻ kho của một mã hàng: các bút toán nhập, xuất, điều chỉnh theo thời gian */
export function StockLedgerDrawer({
  config,
  itemCode,
  itemName,
  onClose,
}: StockLedgerDrawerProps) {
  const { t } = useV2Translation();
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useStockTransactionsQuery({
    api: config.api,
    keys: config.keys,
    itemCode,
    page,
    pageSize: PAGE_SIZE,
  });
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const columns: V2DrawerLinesColumn[] = [
    {
      id: "date",
      header: t("v2.inventoryMovements.ledger.date", "Ngày"),
      width: 110,
    },
    {
      id: "type",
      header: t("v2.inventoryMovements.ledger.type", "Nghiệp vụ"),
      grow: true,
      minWidth: 140,
    },
    {
      id: "qtyIn",
      header: t("v2.inventoryMovements.ledger.qtyIn", "Nhập"),
      width: 90,
      align: "right",
    },
    {
      id: "qtyOut",
      header: t("v2.inventoryMovements.ledger.qtyOut", "Xuất"),
      width: 90,
      align: "right",
    },
    {
      id: "unitCost",
      header: t("v2.inventoryMovements.ledger.unitCost", "Đơn giá"),
      width: 110,
      align: "right",
    },
  ];
  const cell = (col: V2DrawerLinesColumn, row: StockTransactionRow) => {
    if (col.id === "date")
      return new Intl.DateTimeFormat("vi-VN").format(
        new Date(row.transactionDate),
      );
    if (col.id === "type") return row.transactionType;
    if (col.id === "qtyIn") return row.qtyIn ? num(row.qtyIn) : "";
    if (col.id === "qtyOut") return row.qtyOut ? num(row.qtyOut) : "";
    return num(row.unitCost);
  };

  return (
    <V2StandardDrawer
      id={`stockLedger-${itemCode}`}
      open
      onClose={onClose}
      mode="view"
      title={itemCode}
      subtitle={itemName}
      layout={V2DrawerLayout.ONE_COLUMN}
      size={V2DrawerSize.LG}
      loading={isLoading}
    >
      <DrawerSection
        title={t("v2.inventoryMovements.ledger.title", "Thẻ kho")}
        count={total}
      >
        <V2DrawerLinesTable<StockTransactionRow>
          ariaLabel={t("v2.inventoryMovements.ledger.title", "Thẻ kho")}
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(row) => row.id}
          renderCell={cell}
          emptyLabel={t(
            "v2.inventoryMovements.ledger.empty",
            "Chưa có giao dịch",
          )}
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3">
            <V2Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("v2.common.previous", "Trước")}
            </V2Button>
            <V2Text as="span" variant="body-sm" className="text-muted-fg">
              {page} / {totalPages}
            </V2Text>
            <V2Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("v2.common.next", "Sau")}
            </V2Button>
          </div>
        )}
      </DrawerSection>
    </V2StandardDrawer>
  );
}
