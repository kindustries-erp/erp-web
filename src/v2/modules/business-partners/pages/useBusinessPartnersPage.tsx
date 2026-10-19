import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useRemoveBusinessPartnerMutation } from "../api/mutations/useBusinessPartnerMutations";
import {
  buildBusinessPartnerColumns,
  PARTNER_VIEW_VISIBILITY,
} from "../components/organisms/business-partner-table";
import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";

export function useBusinessPartnersPage(partnerType: BusinessPartnerType) {
  const { t } = useV2Translation();
  const canCreate = useV2HasPermission({
    collection: "business_partners",
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: "business_partners",
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: "business_partners",
    action: "delete",
  });
  const tableId = `erp-${partnerType.toLowerCase()}s-table`;
  const [drawer, setDrawer] = React.useState<{
    id: string | null;
    mode: "view" | "edit";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<BusinessPartner | null>(null);
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[tableId]?.views?.activeKey ??
      "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[tableId]?.columns) {
      applyV2SystemView(tableId, "overview", PARTNER_VIEW_VISIBILITY.overview);
    }
  }, [tableId]);

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.partners.listLoadError",
        "Không thể tải danh sách đối tác",
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
    () => buildBusinessPartnerColumns(t, (id) => open(id, "view")),
    [t, open],
  );
  const rowActions = React.useCallback(
    (row: BusinessPartner): V2RowActionGroup[] => {
      const items: V2RowActionGroup["items"] = [
        {
          label: t("v2.partners.actions.view", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "view"),
        },
      ];
      if (canUpdate)
        items.push({
          label: t("v2.partners.actions.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "edit"),
        });
      if (canDelete)
        items.push({
          label: t("v2.partners.actions.delete", "Xóa"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: () => setDeleteTarget(row),
        });
      return [{ items }];
    },
    [canDelete, canUpdate, open, t],
  );

  const remove = useRemoveBusinessPartnerMutation(t, () =>
    setDeleteTarget(null),
  );

  const selectView = (key: string) => {
    const visibility =
      PARTNER_VIEW_VISIBILITY[key as keyof typeof PARTNER_VIEW_VISIBILITY];
    setView(key);
    if (visibility) {
      applyV2SystemView(tableId, key, visibility);
      setTableKey((value) => value + 1);
    }
  };

  return {
    t,
    tableId,
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

export type BusinessPartnersPageState = ReturnType<
  typeof useBusinessPartnersPage
>;
