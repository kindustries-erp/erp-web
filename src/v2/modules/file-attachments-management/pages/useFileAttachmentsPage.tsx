import * as React from "react";
import { Eye, Trash2 } from "lucide-react";
import type { V2FilterGroup } from "@/v2/shared/components";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import type {
  V2FetchOptionsParams,
  V2RowActionGroup,
} from "@/v2/shared/types/v2-table";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { fileAttachmentsV2Api } from "../api/fileAttachmentsApi";
import { usePurgeFlow } from "./usePurgeFlow";
import { buildFileAttachmentsColumns } from "../components/organisms/file-attachment-table/FileAttachmentTable.columns";
import { fileAttachmentsViewVisibility } from "../components/organisms/file-attachment-table/FileAttachmentTable.views";
import type { FileAttachment } from "../domain/entities/fileAttachment";

const TABLE_ID = "erp-file-attachments-table";
export const FILES_ALL_KEY = "all";
export const FILES_DELETED_KEY = "deleted";

export function useFileAttachmentsPage() {
  const { t } = useV2Translation();
  const canPurge = useV2HasPermission({
    collection: "attachments",
    action: "purge",
  });
  const canUpdate = useV2HasPermission({
    collection: "attachments",
    action: "update",
  });
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [filterKey, setFilterKey] = React.useState(FILES_ALL_KEY);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[TABLE_ID]?.views
        ?.activeKey ?? "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);
  const isDeleted = filterKey === FILES_DELETED_KEY;
  const filter = React.useMemo(
    () => (isDeleted ? { deleted: "only" as const } : {}),
    [isDeleted],
  );
  const { purgeIds, setPurgeIds, confirmPurge, purging } = usePurgeFlow(t, () =>
    setSelected([]),
  );

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[TABLE_ID]?.columns) {
      applyV2SystemView(
        TABLE_ID,
        "overview",
        fileAttachmentsViewVisibility.overview,
      );
    }
  }, []);

  const toast = useV2ToastStore.getState().showToast;
  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.fileAttachments.listLoadError",
        "Không thể tải danh sách",
      );
      toast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t, toast],
  );

  const changeFilter = React.useCallback((key: string) => {
    setFilterKey(key);
    setSelected([]);
    setTableKey((n) => n + 1);
  }, []);

  const filterGroup = React.useMemo<V2FilterGroup>(
    () => ({
      title: t("v2.fileAttachments.filters.title", "Bộ lọc có sẵn"),
      items: [
        {
          key: FILES_ALL_KEY,
          label: t("v2.fileAttachments.filters.all", "Tất cả"),
        },
        {
          key: FILES_DELETED_KEY,
          label: t("v2.fileAttachments.filters.deleted", "Đã xóa"),
        },
      ],
      activeKey: filterKey,
      onChange: changeFilter,
      allKey: FILES_ALL_KEY,
    }),
    [changeFilter, filterKey, t],
  );

  const columns = React.useMemo(
    () => buildFileAttachmentsColumns(t, setDetailId),
    [t],
  );

  const rowActions = React.useCallback(
    (row: FileAttachment): V2RowActionGroup[] => {
      const items: V2RowActionGroup["items"] = [
        {
          label: t("v2.fileAttachments.actions.view", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => setDetailId(row.id),
        },
      ];
      if (isDeleted && canPurge)
        items.push({
          label: t("v2.fileAttachments.actions.purge", "Xóa vĩnh viễn"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: () => setPurgeIds([row.id]),
        });
      return [{ items }];
    },
    [canPurge, isDeleted, t],
  );

  const fetchOptions = React.useCallback(
    (params: V2FetchOptionsParams) =>
      fileAttachmentsV2Api.options(params, filter),
    [filter],
  );

  const selectView = (key: string) => {
    setView(key);
    const visibility =
      fileAttachmentsViewVisibility[
        key as keyof typeof fileAttachmentsViewVisibility
      ];
    if (visibility) {
      applyV2SystemView(TABLE_ID, key, visibility);
      setTableKey((n) => n + 1);
    }
  };

  return {
    t,
    tableId: TABLE_ID,
    tableKey,
    columns,
    rowActions,
    fetchOptions,
    filter,
    filterGroup,
    isDeleted,
    canPurge,
    canUpdate,
    view,
    selectView,
    onListError,
    selected,
    setSelected,
    detailId,
    setDetailId,
    settingsOpen,
    setSettingsOpen,
    purgeIds,
    setPurgeIds,
    confirmPurge,
    purging,
  };
}

export type FileAttachmentsPageState = ReturnType<
  typeof useFileAttachmentsPage
>;
