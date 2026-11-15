import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { AuditLogRow } from "../api/dtos/audit-log.dto";
import type { AuditModuleConfig } from "../audit.config.type";
import { buildAuditColumns } from "../components/organisms/audit-table";

/** Controller của màn nhật ký: drawer xem, view modes, columns và xử lý lỗi tải. */
export function useAuditListController(config: AuditModuleConfig) {
  const { t } = useV2Translation();
  const { tableId, viewVisibility } = config;
  const [selected, setSelected] = React.useState<AuditLogRow | null>(null);
  const rowsRef = React.useRef(new Map<string, AuditLogRow>());
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[tableId]?.views?.activeKey ??
      "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[tableId]?.columns) {
      applyV2SystemView(tableId, "overview", viewVisibility.overview);
    }
  }, [tableId, viewVisibility]);

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.audit.listLoadError",
        "Không thể tải nhật ký hoạt động",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t],
  );

  const remember = React.useCallback((items: AuditLogRow[]) => {
    items.forEach((row) => rowsRef.current.set(row.id, row));
  }, []);

  const columns = React.useMemo(
    () =>
      buildAuditColumns(t, (id) =>
        setSelected(rowsRef.current.get(id) ?? null),
      ),
    [t],
  );

  const selectView = React.useCallback(
    (key: string) => {
      const visibility = viewVisibility[key];
      setView(key);
      if (visibility) {
        applyV2SystemView(tableId, key, visibility);
        setTableKey((value) => value + 1);
      }
    },
    [tableId, viewVisibility],
  );

  return {
    t,
    tableId,
    tableKey,
    columns,
    selected,
    closeDrawer: () => setSelected(null),
    remember,
    view,
    selectView,
    onListError,
  };
}

export type AuditListControllerState = ReturnType<
  typeof useAuditListController
>;
