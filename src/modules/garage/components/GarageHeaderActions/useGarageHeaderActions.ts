import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpAction, ErpResource } from "@/modules/system/types/rbac";
import type { GarageCasesTableQuery } from "../../export/garageExportScopes";
import { buildGarageHeaderActions } from "./buildGarageHeaderActions";

export type GarageSyncMode = "all" | "cases" | "gross-profit" | "case-details";

/**
 * Trạng thái nút chính "Đồng bộ" + dropdown xuất file dùng chung cho 2 tab Garage:
 * quyền đồng bộ, drawer đồng bộ, drawer xuất Excel và danh sách action của dropdown.
 */
export function useGarageHeaderActions() {
  const { t } = useTranslation("garage");
  const canCreateGarage = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.CREATE,
  );
  const canUpdateGarage = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.UPDATE,
  );
  const canSyncGarage = canCreateGarage || canUpdateGarage;

  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [syncMode, setSyncMode] = useState<GarageSyncMode>("all");
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [exportTableQuery, setExportTableQuery] = useState<
    GarageCasesTableQuery | undefined
  >(undefined);
  const [workflowDrawerOpen, setWorkflowDrawerOpen] = useState(false);

  const openSync = useCallback((mode: GarageSyncMode = "all") => {
    setSyncMode(mode);
    setSyncDrawerOpen(true);
  }, []);
  const closeSync = useCallback(() => setSyncDrawerOpen(false), []);

  const openExport = useCallback((query?: GarageCasesTableQuery) => {
    setExportTableQuery(query);
    setExportDrawerOpen(true);
  }, []);
  const closeExport = useCallback(() => setExportDrawerOpen(false), []);

  const openWorkflow = useCallback(() => setWorkflowDrawerOpen(true), []);
  const closeWorkflow = useCallback(() => setWorkflowDrawerOpen(false), []);

  const translate = useCallback(
    (key: string, def?: string): string =>
      t(key, { defaultValue: def }) as string,
    [t],
  );

  const createActions = useMemo(
    () =>
      buildGarageHeaderActions(
        {
          canSyncGarage,
          onExportExcel: () => openExport(),
          onOpenWorkflow: () => openWorkflow(),
          onSyncGrossProfit: () => openSync("gross-profit"),
        },
        translate,
      ),
    [canSyncGarage, openExport, openSync, openWorkflow, translate],
  );

  return {
    canUpdateGarage,
    canSyncGarage,
    createActions,
    syncDrawerOpen,
    syncMode,
    openSync,
    closeSync,
    exportDrawerOpen,
    exportTableQuery,
    openExport,
    closeExport,
    workflowDrawerOpen,
    openWorkflow,
    closeWorkflow,
  };
}

export type GarageHeaderActionsState = ReturnType<
  typeof useGarageHeaderActions
>;
