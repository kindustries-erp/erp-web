import * as React from "react";
import {
  V2ConfirmModal,
  V2ModulePage,
  type V2ModuleTab,
} from "@/v2/shared/components";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useProcurementList } from "../hooks/useProcurementList";
import { useProcurementQuery } from "../hooks/useProcurementQuery";
import type { ProcurementListConfig } from "../hooks/procurementListConfig.type";
import { ProcurementReasonModal } from "./ProcurementReasonModal";
import { V2Button } from "@/v2/shared/components";
import type { ProcurementDrawerProps } from "../drawers/procurementDrawer.type";

export interface ProcurementPageDisplay<T> {
  tableId: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  buildColumns: (t: (key: string, fallback: string) => string) => V2Column<T>[];
  /** Drawer chi tiết/sửa của họ chứng từ, dựng bởi module */
  renderDrawer: (props: ProcurementDrawerProps) => React.ReactNode;
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
  const columns = React.useMemo(() => display.buildColumns(t), [display, t]);

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

  const reasonLabel = state.reasonTarget
    ? `${t(`v2.procurement.actions.${state.reasonTarget.action}`, state.reasonTarget.action)} ${config.rowLabel(state.reasonTarget.row)}`
    : "";
  const confirm = state.confirmTarget;

  return (
    <V2ModulePage<T>
      title={t(display.titleKey, "")}
      description={t(display.descriptionKey, "")}
      icon={display.icon}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button size="sm" onClick={state.openCreate}>
            {t("v2.procurement.actions.create", "Tạo mới")}
          </V2Button>
        ) : undefined
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
                requestApi: config.requestApi,
              })}
            </React.Fragment>
          )}
          <ProcurementReasonModal
            open={Boolean(state.reasonTarget)}
            title={reasonLabel}
            isLoading={state.isTransitioning}
            onCancel={state.closeReason}
            onConfirm={state.submitReason}
          />
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.procurement.delete.title", "Xóa đơn nháp")}
            message={
              state.deleteTarget
                ? `${t("v2.procurement.delete.message", "Đơn nháp sẽ bị xóa. Bạn có chắc không?")} ${config.rowLabel(state.deleteTarget)}`
                : ""
            }
            confirmLabel={t("v2.procurement.actions.delete", "Xóa")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.isTransitioning}
            onConfirm={state.confirmDelete}
            onCancel={state.closeDelete}
            onOpenChange={(open) => !open && state.closeDelete()}
          />
          <V2ConfirmModal
            open={Boolean(confirm)}
            title={t("v2.procurement.confirm.title", "Xác nhận thao tác")}
            message={
              confirm
                ? `${t("v2.procurement.confirm.message", "Bạn có chắc muốn thực hiện thao tác này?")} ${config.rowLabel(confirm.row)}`
                : ""
            }
            confirmLabel={
              confirm
                ? t(`v2.procurement.actions.${confirm.action}`, confirm.action)
                : ""
            }
            cancelLabel={t("v2.common.cancel", "Hủy")}
            isLoading={state.isTransitioning}
            onConfirm={state.confirmAction}
            onCancel={state.closeConfirm}
            onOpenChange={(open) => !open && state.closeConfirm()}
          />
        </>
      }
    />
  );
}
