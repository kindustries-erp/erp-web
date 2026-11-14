import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { buildStockVoucherColumns } from "../components/organisms/stock-voucher-table/StockVoucherTable.columns";
import type { StockVoucherRow } from "../domain/stockVoucher";
import type { InventoryMovementsModuleConfig } from "../inventoryMovements.config.type";

/**
 * Trạng thái màn danh sách chứng từ gộp: chế độ xem, cột và lỗi tải. `onOpen` do module truyền
 * vào để quyết định mở drawer nào cho từng loại (core không biết loại nào sửa được).
 */
export function useStockVoucherListController(
  config: InventoryMovementsModuleConfig,
  onOpen: (row: StockVoucherRow) => void,
) {
  const { t } = useV2Translation();
  const { voucherTableId: tableId, voucherViewVisibility: visibility } = config;
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

  const columns = React.useMemo(
    () => buildStockVoucherColumns(t, config.voucherTypes, onOpen),
    [t, config.voucherTypes, onOpen],
  );

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.inventoryMovements.listLoadError",
        "Không thể tải danh sách chứng từ",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t],
  );

  const selectView = (key: string) => {
    setView(key);
    const next = visibility[key];
    if (next) {
      applyV2SystemView(tableId, key, next);
      setTableKey((value) => value + 1);
    }
  };

  return { t, tableId, tableKey, columns, view, selectView, onListError };
}

export type StockVoucherListController = ReturnType<
  typeof useStockVoucherListController
>;
