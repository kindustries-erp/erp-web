import * as React from "react";
import { ScrollText } from "lucide-react";
import { V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import { AuditLogDrawer, useAuditLogsQuery } from "@/v2/core/audit";
import type { AuditLogRow } from "@/v2/core/audit";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { auditLogsConfig } from "../auditLogs.config";
import { useAuditLogsPage } from "./AuditLogsPage.hook";
import "../auditLogs.locale";

/** Màn Nhật ký hoạt động (chỉ xem): bố cục và nối lõi audit */
export function AuditLogsPage() {
  const state = useAuditLogsPage();
  const { t, remember } = state;

  const tabs = React.useMemo<V2ModuleTab<AuditLogRow>[]>(
    () => [
      {
        key: "list",
        label: t("v2.auditLogs.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) => auditLogsConfig.api.options(params),
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.auditLogs.empty", "Chưa có nhật ký"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.common.overview", "Tổng quan"),
                },
                { key: "all", label: t("v2.audit.views.all", "Tất cả cột") },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) => {
          const data = useAuditLogsQuery({
            api: auditLogsConfig.api,
            keys: auditLogsConfig.keys,
            query,
            onError: state.onListError,
          });
          remember(data.items);
          return data;
        },
      },
    ],
    [state, t, remember],
  );

  return (
    <V2ModulePage<AuditLogRow>
      title={t("v2.auditLogs.title", "Nhật ký hoạt động")}
      description={t(
        "v2.auditLogs.description",
        "Theo dõi thao tác của người dùng trên hệ thống",
      )}
      icon={<ScrollText className="h-4 w-4" />}
      tabs={tabs}
      overlays={
        <AuditLogDrawer
          open={Boolean(state.selected)}
          row={state.selected}
          onClose={state.closeDrawer}
        />
      }
    />
  );
}
