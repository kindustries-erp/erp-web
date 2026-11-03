import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useRemoveInvoiceDebtMutation } from "../api/mutations/useInvoiceDebtMutations";
import { buildInvoiceDebtsColumns } from "../components/organisms/invoice-debt-table/InvoiceDebtTable.columns";
import { invoiceDebtsViewVisibility } from "../components/organisms/invoice-debt-table/InvoiceDebtTable.views";
import type { InvoiceDebt } from "../domain/entities/invoiceDebt";

const TABLE_ID = "erp-invoice-debts-table";

export function useInvoiceDebtsPage() {
  const { t } = useV2Translation();
  const canCreate = useV2HasPermission({
    collection: "invoice_debts",
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: "invoice_debts",
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: "invoice_debts",
    action: "delete",
  });
  const [drawer, setDrawer] = React.useState<{
    id: string | null;
    mode: "view" | "edit";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<InvoiceDebt | null>(
    null,
  );
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[TABLE_ID]?.views
        ?.activeKey ?? "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[TABLE_ID]?.columns) {
      applyV2SystemView(
        TABLE_ID,
        "overview",
        invoiceDebtsViewVisibility.overview,
      );
    }
  }, []);

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.invoiceDebts.listLoadError",
        "Không thể tải danh sách",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t],
  );

  const open = React.useCallback(
    (id: string | null, mode: "view" | "edit") => setDrawer({ id, mode }),
    [],
  );
  const columns = React.useMemo(
    () => buildInvoiceDebtsColumns(t, (id) => open(id, "view")),
    [t, open],
  );
  const rowActions = React.useCallback(
    (row: InvoiceDebt): V2RowActionGroup[] => {
      const items: V2RowActionGroup["items"] = [
        {
          label: t("v2.invoiceDebts.actions.view", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "view"),
        },
      ];
      if (canUpdate)
        items.push({
          label: t("v2.invoiceDebts.actions.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "edit"),
        });
      if (canDelete)
        items.push({
          label: t("v2.invoiceDebts.actions.delete", "Xóa"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: () => setDeleteTarget(row),
        });
      return [{ items }];
    },
    [canDelete, canUpdate, open, t],
  );

  const remove = useRemoveInvoiceDebtMutation(t, () => setDeleteTarget(null));

  const selectView = (key: string) => {
    setView(key);
    const visibility =
      invoiceDebtsViewVisibility[
        key as keyof typeof invoiceDebtsViewVisibility
      ];
    if (visibility) {
      applyV2SystemView(TABLE_ID, key, visibility);
      setTableKey((value) => value + 1);
    }
  };

  return {
    t,
    tableId: TABLE_ID,
    tableKey,
    columns,
    rowActions,
    canCreate,
    canUpdate,
    drawer,
    setDrawer,
    open,
    deleteTarget,
    setDeleteTarget,
    remove,
    view,
    selectView,
    onListError,
  };
}

export type InvoiceDebtsPageState = ReturnType<typeof useInvoiceDebtsPage>;
