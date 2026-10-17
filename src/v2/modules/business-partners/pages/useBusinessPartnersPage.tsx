import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/core/config/uiStore";
import { extractApiError } from "@/shared/utils/apiError";
import { useUserPreferencesStore } from "@/shared/hooks/useUserPreferences";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { businessPartnersV2Api } from "../api/businessPartnersApi";
import { businessPartnerKeys } from "../api/useBusinessPartnersQuery";
import { buildBusinessPartnerColumns } from "../components/businessPartnerColumns";
import { PARTNER_VIEW_VISIBILITY } from "../components/businessPartnerViews";
import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";
import { applyLegacySystemView } from "../utils/businessPartnerPreferences";

export function useBusinessPartnersPage(partnerType: BusinessPartnerType) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
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
      useUserPreferencesStore.getState().getTablePreference(tableId)
        ?.activeView ?? "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    const saved = useUserPreferencesStore
      .getState()
      .getTablePreference(tableId);
    if (!saved)
      applyLegacySystemView(
        tableId,
        "overview",
        PARTNER_VIEW_VISIBILITY.overview,
      );
  }, [tableId]);

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

  const remove = useMutation({
    mutationFn: (id: string) => businessPartnersV2Api.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: businessPartnerKeys.all,
      });
      setDeleteTarget(null);
      showToast({
        variant: "success",
        title: t("v2.partners.delete.success", "Đã xóa đối tác"),
      });
    },
    onError: (error) =>
      showToast({
        variant: "destructive",
        title: t("v2.partners.delete.error", "Không thể xóa đối tác"),
        description: extractApiError(error),
      }),
  });
  const selectView = (key: string) => {
    const visibility =
      PARTNER_VIEW_VISIBILITY[key as keyof typeof PARTNER_VIEW_VISIBILITY];
    setView(key);
    if (visibility) {
      applyLegacySystemView(tableId, key, visibility);
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
  };
}

export type BusinessPartnersPageState = ReturnType<
  typeof useBusinessPartnersPage
>;
