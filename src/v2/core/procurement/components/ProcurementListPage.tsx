import * as React from "react";
import { V2ModulePage, type V2ModuleTab } from "@/v2/shared/components";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useProcurementList } from "../hooks/useProcurementList";
import { useProcurementQuery } from "../hooks/useProcurementQuery";
import type { ProcurementListConfig } from "../hooks/procurementListConfig.type";
import { V2Button } from "@/v2/shared/components";
import type { ProcurementDrawerProps } from "../procurement.drawer.type";
import type { ProcurementDocumentRef } from "../procurement.types";
import { ProcurementListModals } from "./ProcurementListModals";

export interface ProcurementPageDisplay<T> {
  tableId: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  buildColumns: (
    t: (key: string, fallback: string) => string,
    openDetail?: (id: string) => void,
  ) => V2Column<T>[];
  /** Drawer chi tiết/sửa của họ chứng từ, dựng bởi module */
  renderDrawer: (props: ProcurementDrawerProps) => React.ReactNode;
}

/** Chứng từ mở trong drawer: ưu tiên row từ drawer, không có thì lấy id đang mở. */
function resolveDrawerTarget<T>(
  row: ProcurementDocumentRef | undefined,
  openId: string | null,
): T | null {
  const target = row ?? (openId ? { id: openId } : null);
  return target as T | null;
}

export interface ProcurementListPageProps<T extends { id: string }> {
  config: ProcurementListConfig<T>;
  display: ProcurementPageDisplay<T>;
}

/** Trang danh sách chứng từ procurement: bảng server-side, hành động theo dòng, modal xác nhận. */
export function ProcurementListPage<T extends { id: string }>({
  config,
  display,
}: ProcurementListPageProps<T>) {
  const { t } = useV2Translation();
  const state = useProcurementList(config);
  const { drawer } = state;
  const columns = React.useMemo(
    () => display.buildColumns(t, state.openView),
    [display, state.openView, t],
  );

  const tabs = React.useMemo<V2ModuleTab<T>[]>(
    () => [
      {
        key: "list",
        label: t("v2.procurement.tabs.list", "Danh sách"),
        kind: "list",
        resetKey: display.tableId,
        table: {
          tableId: display.tableId,
          columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: config.api.options,
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.procurement.empty", "Không có dữ liệu"),
          toolbar: { search: {} },
        },
        useData: (query) =>
          useProcurementQuery(config, query, state.onListError),
      },
    ],
    [columns, config, display.tableId, state, t],
  );

  return (
    <V2ModulePage<T>
      title={t(display.titleKey, "")}
      description={t(display.descriptionKey, "")}
      icon={display.icon}
      tabs={tabs}
      actions={
        <>
          {state.canCreate && (
            <V2Button size="sm" onClick={state.openCreate}>
              {t("v2.procurement.actions.create", "Tạo mới")}
            </V2Button>
          )}
        </>
      }
      overlays={
        <>
          {drawer && (
            <React.Fragment key={`${drawer.id ?? "new"}-${drawer.mode}`}>
              {display.renderDrawer({
                open: true,
                documentId: drawer.id,
                mode: drawer.mode,
                canUpdate: state.canUpdate,
                onClose: state.closeDrawer,
                queryKey: config.queryKey,
                api: config.api,
                fromRequestId: drawer.fromRequestId ?? null,
                approval: state.approval.gate,
                requestApi: config.requestApi,
                onTransition: (action, row) => {
                  const target = resolveDrawerTarget<T>(row, drawer.id);
                  if (target) state.start(target, action);
                },
                onSaved: state.openSaved,
                canCreateOrder: state.canCreate && Boolean(config.poHref),
                onOrderFromRequest: (row) => {
                  const target = resolveDrawerTarget<T>(row, drawer.id);
                  if (target) state.orderFromRequest(target);
                },
              })}
            </React.Fragment>
          )}
          <ProcurementListModals config={config} state={state} />
        </>
      }
    />
  );
}
