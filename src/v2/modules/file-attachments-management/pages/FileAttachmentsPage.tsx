import * as React from "react";
import { FileText, Settings, Trash2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2ModulePage } from "@/v2/shared/components/templates/v2-module-page";
import type { V2ModuleTab } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useFileAttachmentsQuery } from "../api/queries/useFileAttachmentsQuery";
import type { FileAttachment } from "../domain/entities/fileAttachment";
import { FileAttachmentDrawer } from "../drawers/FileAttachmentDrawer";
import { RetentionSettingsDrawer } from "../drawers/RetentionSettingsDrawer";
import { useFileAttachmentsPage } from "./useFileAttachmentsPage";
import "../fileAttachments.locale";

export function FileAttachmentsPage() {
  const s = useFileAttachmentsPage();
  const { t } = s;
  const showSelect = s.isDeleted && s.canPurge;

  const tabs = React.useMemo<V2ModuleTab<FileAttachment>[]>(
    () => [
      {
        key: "list",
        label: t("v2.fileAttachments.list", "Danh sách"),
        kind: "list",
        resetKey: `${s.tableId}-${s.tableKey}`,
        table: {
          tableId: s.tableId,
          columns: s.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: s.fetchOptions,
          rowActions: s.rowActions,
          enableRowSelection: showSelect,
          selectedKeys: s.selected,
          onSelectionChange: s.setSelected,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.fileAttachments.empty", "Không có tài liệu"),
          toolbar: {
            search: {},
            filterPanel: {},
            filterGroup: s.filterGroup,
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.fileAttachments.views.overview", "Tổng quan"),
                },
                {
                  key: "all",
                  label: t("v2.fileAttachments.views.all", "Tất cả cột"),
                },
              ],
              activeKey: s.view,
              onSelect: s.selectView,
            },
          },
        },
        useData: (query) =>
          useFileAttachmentsQuery(query, s.filter, s.onListError),
      },
    ],
    [s, showSelect, t],
  );

  return (
    <V2ModulePage<FileAttachment>
      title={t("v2.fileAttachments.title", "Quản lý tài liệu")}
      description={t("v2.fileAttachments.description", "")}
      icon={<FileText className="h-4 w-4" />}
      tabs={tabs}
      actions={
        <div className="flex items-center gap-2">
          {showSelect && s.selected.length > 0 && (
            <V2Button
              size="sm"
              variant="destructive"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => s.setPurgeIds(s.selected)}
            >
              {t("v2.fileAttachments.actions.purgeSelected", {
                defaultValue: "Xóa vĩnh viễn ({{count}})",
                count: s.selected.length,
              })}
            </V2Button>
          )}
          <V2Button
            size="sm"
            variant="outline"
            leftIcon={<Settings className="h-4 w-4" />}
            onClick={() => s.setSettingsOpen(true)}
          >
            {t("v2.fileAttachments.actions.settings", "Cài đặt lưu giữ")}
          </V2Button>
        </div>
      }
      overlays={
        <>
          {s.detailId && (
            <FileAttachmentDrawer
              recordId={s.detailId}
              onClose={() => s.setDetailId(null)}
            />
          )}
          {s.settingsOpen && (
            <RetentionSettingsDrawer onClose={() => s.setSettingsOpen(false)} />
          )}
          <V2ConfirmModal
            open={Boolean(s.purgeIds)}
            title={t(
              "v2.fileAttachments.purge.title",
              "Xóa vĩnh viễn tài liệu",
            )}
            message={t("v2.fileAttachments.purge.message", {
              defaultValue: "Xóa vĩnh viễn {{count}} tệp?",
              count: s.purgeIds?.length ?? 0,
            })}
            confirmLabel={t(
              "v2.fileAttachments.actions.purge",
              "Xóa vĩnh viễn",
            )}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={s.purging}
            onConfirm={s.confirmPurge}
            onCancel={() => s.setPurgeIds(null)}
            onOpenChange={(open) => !open && s.setPurgeIds(null)}
          />
        </>
      }
    />
  );
}
