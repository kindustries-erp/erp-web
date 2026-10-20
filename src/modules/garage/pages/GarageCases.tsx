import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useGarageStore } from "../store/garageStore";
import { useGarageBranches } from "../hooks/useGarage";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  GARAGE_CASE_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_CASE_COLUMN_VISIBILITY,
} from "../utils/garageCaseViewPresets";
import { GarageCasesTable } from "../components/organisms/garage-cases-table";
import { GarageCaseStandaloneDrawer } from "../components/GarageCaseStandaloneDrawer";
import { GarageCaseViewConfigDrawer } from "../components/GarageCaseViewConfigDrawer";
import {
  GarageHeaderActionDrawers,
  useGarageHeaderActions,
} from "../components/GarageHeaderActions";
import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageCasesProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

const columnPresetsTableId = "garage-cases-column-views";
const actualTableId = "garage-cases-table";

export function GarageCases({
  tabs,
  activeTab,
  onTabChange,
}: GarageCasesProps = {}) {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const { selectedBranchId, setSelectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].externalId);
    }
  }, [branches, selectedBranchId, setSelectedBranchId]);

  const activeBranchId = selectedBranchId || branches?.[0]?.externalId || "";

  const [dateRanges, setDateRanges] = useState<
    Record<string, { from: string; to: string }>
  >({});
  const [activeStatusTab, setActiveStatusTab] = useState<string>("all");
  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: GARAGE_CASE_COLUMN_VIEW_PRESETS,
  });

  const currentTablePref = useUserPreferencesStore(
    (s) => s.tables[actualTableId],
  );
  const currentColumnVisibility = currentTablePref?.columnVisibility;

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(actualTableId);
      return stored?.activeView || "overview";
    },
  );

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] =
    useState<string>("quote_details");
  const [viewConfigDrawerOpen, setViewConfigDrawerOpen] = useState(false);
  const [editingViewPreset, setEditingViewPreset] =
    useState<TableViewPreset | null>(null);
  const headerActions = useGarageHeaderActions();
  const { canUpdateGarage, canSyncGarage } = headerActions;

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);
    const currentPref = useUserPreferencesStore
      .getState()
      .getTablePreference(actualTableId) || {
      columnOrder: [],
      columnVisibility: {},
    };
    useUserPreferencesStore.getState().setTablePreferences(actualTableId, {
      ...currentPref,
      columnOrder: [],
      columnVisibility:
        preset.columnVisibility || DEFAULT_GARAGE_CASE_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
    setDateRanges({});
  };

  const handleSaveViewPreset = (data: {
    key?: string;
    label: string;
    columnVisibility: Record<string, boolean>;
  }) => {
    const isDef = [
      "all_columns",
      "financial_progress",
      "overview",
      "audit",
    ].includes(data.key || "");
    const preset: TableViewPreset = {
      key: data.key || `custom_${Date.now()}`,
      label: data.label,
      filters: {},
      columnVisibility: data.columnVisibility,
      isDefault: isDef && Boolean(data.key),
      isCustom: !isDef || !data.key,
      isModified: isDef && Boolean(data.key),
    };
    useUserPreferencesStore
      .getState()
      .saveTableViewPreset(columnPresetsTableId, preset);
    handleColumnPresetChange(preset);
    toast.success(
      t("cases.viewModeSaveSuccess", "Đã lưu chế độ xem thành công"),
    );
  };

  const handleResetViewPreset = (key: string) => {
    columnViewPresetsHook.resetView(key);
    const factory = GARAGE_CASE_COLUMN_VIEW_PRESETS.find((p) => p.key === key);
    if (factory) handleColumnPresetChange(factory);
    toast.success(
      t(
        "cases.viewModeResetSuccess",
        "Đã khôi phục chế độ xem về mặc định thành công",
      ),
    );
  };

  const handleDeleteViewPreset = (key: string) => {
    if (
      ["all_columns", "financial_progress", "overview", "audit"].includes(key)
    )
      return;
    columnViewPresetsHook.deleteView(key);
    if (activeColumnPresetKey === key)
      handleColumnPresetChange(GARAGE_CASE_COLUMN_VIEW_PRESETS[0]);
    toast.success(
      t("cases.viewModeDeleteSuccess", "Đã xóa chế độ xem thành công"),
    );
  };

  const invalidateCases = () => {
    queryClient.invalidateQueries({ queryKey: ["garage", "cases"] });
    queryClient.invalidateQueries({
      queryKey: ["garage", "grossProfitReport"],
    });
  };

  return (
    <>
      <GarageCasesTable
        branchId={activeBranchId}
        branches={branches}
        canUpdateGarage={canUpdateGarage}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        activeStatusTab={activeStatusTab}
        onStatusTabChange={setActiveStatusTab}
        dateRanges={dateRanges}
        onDateRangeChange={(key, from, to) =>
          setDateRanges((prev) => ({
            ...prev,
            [key]: { from: from || "", to: to || "" },
          }))
        }
        onResetDateRanges={() => setDateRanges({})}
        canSyncGarage={canSyncGarage}
        onSyncCases={() => headerActions.openSync("cases")}
        onSyncGrossProfit={() => headerActions.openSync("gross-profit")}
        onExportExcel={headerActions.openExport}
        onOpenWorkflow={headerActions.openWorkflow}
        onOpenDetail={(code) => {
          setDrawerEditMode(false);
          setDrawerInitialTab("quote_details");
          setSelectedCaseId(code);
        }}
        onOpenFinancials={(code, editMode = true) => {
          setDrawerEditMode(canUpdateGarage ? editMode : false);
          setDrawerInitialTab("financials");
          setSelectedCaseId(code);
        }}
        onOpenEditNotes={(item) => {
          setDrawerEditMode(canUpdateGarage ? true : false);
          setSelectedCaseId(item.soChungTu || item.id);
        }}
        onOpenConfig={(item) => {
          setDrawerEditMode(canUpdateGarage ? true : false);
          setSelectedCaseId(item.soChungTu || item.id);
        }}
        columnViewPresetsHook={columnViewPresetsHook}
        activeColumnPresetKey={activeColumnPresetKey}
        onColumnPresetChange={handleColumnPresetChange}
        onCreateViewPreset={() => {
          setEditingViewPreset(null);
          setViewConfigDrawerOpen(true);
        }}
        onEditViewPreset={(preset) => {
          setEditingViewPreset(preset);
          setViewConfigDrawerOpen(true);
        }}
        onDeleteViewPreset={handleDeleteViewPreset}
      />
      <GarageCaseStandaloneDrawer
        isOpen={Boolean(selectedCaseId)}
        caseCode={selectedCaseId}
        initialEditMode={drawerEditMode}
        initialTabKey={drawerInitialTab}
        onClose={() => {
          setSelectedCaseId(null);
          setDrawerEditMode(false);
        }}
        onSuccess={invalidateCases}
      />
      <GarageCaseViewConfigDrawer
        open={viewConfigDrawerOpen}
        onClose={() => setViewConfigDrawerOpen(false)}
        preset={editingViewPreset}
        currentColumnVisibility={currentColumnVisibility}
        onSave={handleSaveViewPreset}
        onResetDefault={handleResetViewPreset}
      />
      <GarageHeaderActionDrawers
        actions={headerActions}
        defaultReportType="cases-list"
        branchId={activeBranchId}
        onSyncSuccess={invalidateCases}
      />
    </>
  );
}
