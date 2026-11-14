import * as React from "react";
import { Warehouse } from "lucide-react";
import { V2ModulePage, V2ModulePageTabVariant } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  StockLedgerDrawer,
  useStockBalanceListController,
  useStockBalancesQuery,
  useStockTabCountsQuery,
} from "@/v2/core/inventory-movements";
import type { StockBalanceRow } from "@/v2/core/inventory-movements";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { inventoryMovementsGarageConfig as config } from "../inventoryMovementsGarage.config";
import "../inventoryMovementsGarage.locale";
import { GARAGE_STOCK_BALANCE_TABS } from "./GarageStockBalancesPage.tabs";

export function GarageStockBalancesPage() {
  const state = useStockBalanceListController(config);
  const { t } = state;
  const counts = useStockTabCountsQuery({
    api: config.api,
    keys: config.keys,
  });

  const tabs = React.useMemo<V2ModuleTab<StockBalanceRow>[]>(
    () =>
      GARAGE_STOCK_BALANCE_TABS.map(({ tab, key, label, icon, tone }) => ({
        key: tab,
        label: t(`v2.inventoryMovements.balance.tabs.${key}`, label),
        icon,
        tone,
        badgeCount: counts[tab],
        kind: "list" as const,
        resetKey: `${state.tableId}-${tab}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server" as const,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t(
            "v2.inventoryMovements.balance.empty",
            "Chưa có hàng tồn kho",
          ),
          toolbar: {
            search: {},
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
          useStockBalancesQuery({
            api: config.api,
            keys: config.keys,
            query,
            tab,
            onError: state.onListError,
          }),
      })),
    [state, t, counts],
  );

  return (
    <V2ModulePage<StockBalanceRow>
      title={t("v2.garageStockBalances.title", "Tồn kho Garage")}
      description={t(
        "v2.garageStockBalances.description",
        "Số dư tồn theo mã hàng và thẻ kho",
      )}
      icon={<Warehouse className="h-4 w-4" />}
      tabs={tabs}
      tabVariant={V2ModulePageTabVariant.STATUS_CHIP}
      tabBarClassName="pb-0"
      overlays={
        state.ledger && (
          <StockLedgerDrawer
            config={config}
            itemCode={state.ledger.itemCode}
            itemName={state.ledger.itemName}
            onClose={state.closeLedger}
          />
        )
      }
    />
  );
}
