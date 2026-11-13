import { LayoutGrid } from "lucide-react";
import type { V2ModuleTab } from "@/v2/shared/components";
import type { V2StatusChipTone } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import {
  useStockVouchersQuery,
  type StockVoucherRow,
} from "@/v2/core/inventory-movements";
import { inventoryMovementsGarageConfig as config } from "../inventoryMovementsGarage.config";
import type { useGarageStockVouchersPage } from "./GarageStockVouchersPage.hook";

export const ALL_TAB = "all";

/** Chấm màu chip theo loại phiếu: nhập = xanh, xuất = cảnh báo, điều chỉnh = nhạt */
const VOUCHER_TONE: Record<string, V2StatusChipTone> = {
  PURCHASE_RECEIPT: "success",
  OTHER_RECEIPT: "success",
  ISSUE: "warning",
  ADJUSTMENT: "muted",
};

type PageState = ReturnType<typeof useGarageStockVouchersPage>;

/** Tab chứng từ: Tất cả (tổng các loại) + từng loại, mỗi tab kèm số phiếu theo loại. */
export function buildGarageVoucherTabs(
  state: PageState,
  typeCounts: Record<string, number>,
): V2ModuleTab<StockVoucherRow>[] {
  const { t } = state;
  const tabDefs = [
    {
      key: ALL_TAB,
      label: t("v2.inventoryMovements.allTypes", "Tất cả"),
      type: undefined,
      icon: LayoutGrid,
      tone: "neutral" as V2StatusChipTone,
      badgeCount: Object.values(typeCounts).reduce((a, b) => a + b, 0),
    },
    ...config.voucherTypes.map((item) => ({
      key: item.code,
      label: t(item.labelKey, item.labelFallback),
      type: item.code as string | undefined,
      icon: item.icon,
      tone: VOUCHER_TONE[item.code] ?? ("neutral" as V2StatusChipTone),
      badgeCount: typeCounts[item.code],
    })),
  ];
  return tabDefs.map(({ key, label, type, icon, tone, badgeCount }) => ({
    key,
    icon,
    tone,
    badgeCount,
    label,
    kind: "list" as const,
    resetKey: `${state.tableId}-${key}-${state.tableKey}`,
    table: {
      tableId: state.tableId,
      columns: state.columns,
      getRowKey: (row) => row.type + row.id,
      mode: "server" as const,
      fetchOptions: (params) => config.api.voucherOptions(params),
      rowActions: state.rowActions,
      preferencesStorage: v2ColumnPreferencesStorage,
      viewPresetStorage: v2ViewPresetStorage,
      emptyLabel: t("v2.inventoryMovements.empty", "Chưa có chứng từ kho nào"),
      toolbar: {
        search: {},
        filterPanel: {},
        enableFullscreen: true,
        viewModes: {
          items: [
            {
              key: "overview",
              label: t("v2.inventoryMovements.views.overview", "Tổng quan"),
            },
            {
              key: "all",
              label: t("v2.inventoryMovements.views.all", "Tất cả cột"),
            },
          ],
          activeKey: state.view,
          onSelect: state.selectView,
        },
      },
    },
    useData: (query) =>
      useStockVouchersQuery({
        api: config.api,
        keys: config.keys,
        query,
        type,
        onError: state.onListError,
      }),
  }));
}
