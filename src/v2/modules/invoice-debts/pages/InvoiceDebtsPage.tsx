import * as React from "react";
import { FileText } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2ModulePage } from "@/v2/shared/components/templates/v2-module-page";
import type { V2ModuleTab } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useInvoiceDebtsQuery } from "../api/queries/useInvoiceDebtsQuery";
import { InvoiceDebtDrawer } from "../drawers/InvoiceDebtDrawer";
import type { InvoiceDebt } from "../domain/entities/invoiceDebt";
import { useInvoiceDebtsPage } from "./useInvoiceDebtsPage";
import "../invoiceDebts.locale";

export function InvoiceDebtsPage() {
  const state = useInvoiceDebtsPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<InvoiceDebt>[]>(
    () => [
      {
        key: "list",
        label: t("v2.invoiceDebts.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            import("../api/invoiceDebtsApi").then(({ invoiceDebtsV2Api }) =>
              invoiceDebtsV2Api.options(params),
            ),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.invoiceDebts.empty", "Không có dữ liệu"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.invoiceDebts.views.overview", "Tổng quan"),
                },
                {
                  key: "all",
                  label: t("v2.invoiceDebts.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) => useInvoiceDebtsQuery(query, state.onListError),
      },
    ],
    [state],
  );

  return (
    <V2ModulePage<InvoiceDebt>
      title={t("v2.invoiceDebts.title", "Báo cáo công nợ")}
      description={t("v2.invoiceDebts.description", "Quản lý Báo cáo công nợ")}
      icon={<FileText className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button size="sm" onClick={() => state.open(null, "edit")}>
            {t("v2.invoiceDebts.create", "Thêm Báo cáo công nợ")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <InvoiceDebtDrawer
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.invoiceDebts.delete.title", "Xác nhận xóa")}
            message={
              state.deleteTarget
                ? `${t("v2.invoiceDebts.delete.message", "Bạn có chắc muốn xóa?")} ${state.deleteTarget.search}`
                : ""
            }
            confirmLabel={t("v2.invoiceDebts.actions.delete", "Xóa")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.remove.isPending}
            onConfirm={() => {
              if (state.deleteTarget)
                state.remove.mutate(state.deleteTarget.id);
            }}
            onCancel={() => state.setDeleteTarget(null)}
            onOpenChange={(open) => !open && state.setDeleteTarget(null)}
          />
        </>
      }
    />
  );
}
