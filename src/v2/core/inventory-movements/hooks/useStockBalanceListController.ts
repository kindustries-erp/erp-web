import * as React from "react";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { buildStockBalanceColumns } from "../components/organisms/stock-balance-table/StockBalanceTable.columns";
import type { StockBalanceRow, StockTab } from "../domain/stockBalance";
import type { InventoryMovementsModuleConfig } from "../inventoryMovements.config.type";

/** Trạng thái màn tồn kho: tab lọc, mã hàng đang xem thẻ kho, cột và lỗi tải */
export function useStockBalanceListController(
  config: InventoryMovementsModuleConfig,
) {
  const { t } = useV2Translation();
  const { balanceTableId: tableId, balanceViewVisibility: visibility } = config;
  const [tab, setTab] = React.useState<StockTab>("ALL");
  const [ledger, setLedger] = React.useState<StockBalanceRow | null>(null);
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[tableId]?.views?.activeKey ??
      "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[tableId]?.columns) {
      applyV2SystemView(tableId, "overview", visibility.overview);
    }
  }, [tableId, visibility]);

  const selectView = (key: string) => {
    setView(key);
    const next = visibility[key];
    if (next) {
      applyV2SystemView(tableId, key, next);
      setTableKey((value) => value + 1);
    }
  };

  const columns = React.useMemo(
    () => buildStockBalanceColumns(t, setLedger),
    [t],
  );

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.inventoryMovements.balance.loadError",
        "Không thể tải tồn kho",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t],
  );

  return {
    t,
    tableId,
    tableKey,
    view,
    selectView,
    columns,
    tab,
    setTab,
    ledger,
    closeLedger: () => setLedger(null),
    onListError,
  };
}

export type StockBalanceListController = ReturnType<
  typeof useStockBalanceListController
>;
