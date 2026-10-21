import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet,
  Eye,
  Users,
  Pencil,
  SlidersHorizontal,
  Scale,
  Network,
} from "lucide-react";
import { useGarageStore } from "../../store/garageStore";
import { useGarageCaseServicesList } from "../../hooks/useGarageCaseServicesList";
import { useServiceColumns } from "./components/serviceColumns";
import { useGarageCaseServicesSummary } from "./hooks/useGarageCaseServicesSummary";
import { garageApi } from "../../api/garageApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  GARAGE_SERVICE_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_SERVICE_COLUMN_VISIBILITY,
} from "../../utils/garageCaseServicesViewPresets";
import type { KgaraCaseServiceRow } from "./types";

const columnPresetsTableId = "garage-case-services-column-views";
const actualTableId = "garage-case-services-table";

export function useGarageCaseServicesSectionLogic() {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageCaseServicesList();

  // Column view presets
  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: GARAGE_SERVICE_COLUMN_VIEW_PRESETS,
  });

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(actualTableId);
      return stored?.activeView || "all_columns";
    },
  );

  const handleColumnPresetChange = useCallback((preset: TableViewPreset) => {
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
        preset.columnVisibility || DEFAULT_GARAGE_SERVICE_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
  }, []);

  const handleCreateViewPreset = useCallback(() => {
    toast(
      t(
        "cases.viewConfig.comingSoon",
        "Tính năng tùy biến chế độ xem đang được hoàn thiện",
      ),
    );
  }, [t]);

  const handleEditViewPreset = useCallback(() => {
    toast(
      t(
        "cases.viewConfig.comingSoon",
        "Tính năng tùy biến chế độ xem đang được hoàn thiện",
      ),
    );
  }, [t]);

  const handleDeleteViewPreset = useCallback(
    (key: string) => {
      if (["all_columns", "overview", "financial"].includes(key)) return;
      columnViewPresetsHook.deleteView(key);
      if (activeColumnPresetKey === key) {
        handleColumnPresetChange(GARAGE_SERVICE_COLUMN_VIEW_PRESETS[0]);
      }
    },
    [activeColumnPresetKey, columnViewPresetsHook, handleColumnPresetChange],
  );

  // Drawer states
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] =
    useState<string>("quote_details");
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [syncMode, setSyncMode] = useState<
    "all" | "cases" | "gross-profit" | "case-details"
  >("all");
  const [workflowDrawerOpen, setWorkflowDrawerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Permissions
  const canCreateGarage = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.CREATE,
  );
  const canUpdateGarage = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.UPDATE,
  );
  const canSyncGarage = canCreateGarage || canUpdateGarage;

  const openWorkflow = useCallback(() => setWorkflowDrawerOpen(true), []);
  const closeWorkflow = useCallback(() => setWorkflowDrawerOpen(false), []);

  const handleDirectSync = useCallback(() => {
    setSyncMode("all");
    setSyncDrawerOpen(true);
  }, []);

  const openCaseDetail = useCallback(
    (
      caseCode: string,
      mode: "view" | "edit" = "view",
      tab = "quote_details",
    ) => {
      setDrawerEditMode(mode === "edit");
      setDrawerInitialTab(tab);
      setSelectedCaseCode(caseCode);
    },
    [],
  );

  const closeCaseDetail = useCallback(() => {
    setSelectedCaseCode(null);
    setDrawerEditMode(false);
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      setExporting(true);
      toast.loading(
        t("services.exporting", "Đang xuất file Excel chi tiết..."),
        {
          id: "export-case-services",
        },
      );

      const dateFrom = listHook.dateRanges["caseDate"]?.from || undefined;
      const dateTo = listHook.dateRanges["caseDate"]?.to || undefined;

      const fileName = await garageApi.exportCaseServicesExcel({
        branchId: selectedBranchId || undefined,
        from: dateFrom,
        to: dateTo,
        serviceType: listHook.serviceTypeFilter,
        filtersStr: listHook.serverFiltersStr,
        sorts: listHook.tableState.sorts,
        q: listHook.globalSearch,
      });

      toast.success(
        t("services.exportSuccess", "Đã xuất file {{fileName}} thành công!", {
          fileName,
        }),
        { id: "export-case-services" },
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "services.exportError",
            "Lỗi khi xuất file Excel chi tiết phiếu dịch vụ",
          ),
        { id: "export-case-services" },
      );
    } finally {
      setExporting(false);
    }
  }, [
    listHook.dateRanges,
    listHook.serviceTypeFilter,
    listHook.serverFiltersStr,
    listHook.tableState.sorts,
    listHook.globalSearch,
    selectedBranchId,
    t,
  ]);

  const columns = useServiceColumns({
    t,
    listHook,
    fetchColumnOptions: listHook.fetchColumnOptions,
    openCaseDetail,
  });

  const summary = useGarageCaseServicesSummary({
    items: listHook.items,
    totals: listHook.data?.totals,
    page: listHook.page,
    pageSize: listHook.pageSize,
    totalCount: listHook.totalCount,
    totalPages: listHook.totalPages,
  });

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("cases.actions.exportGroup", "Báo cáo & Xuất file"),
        items: [
          {
            label: t("services.actions.exportExcel", "Xuất Excel chi tiết"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: handleExportExcel,
            disabled: exporting,
          },
          {
            label: t("cases.actions.viewWorkflow", "Xem sơ đồ quy trình"),
            icon: <Network className="w-4 h-4 text-violet-600" />,
            onClick: openWorkflow,
          },
        ],
      },
    ],
    [exporting, handleExportExcel, openWorkflow, t],
  );

  const rowActions = useCallback(
    (item: KgaraCaseServiceRow) => {
      const code = item.soChungTu || item.hdPhieuDichVuId || "";
      return [
        {
          groupLabel: "TRA CỨU",
          items: [
            {
              label: t("cases.actions.viewDetail", "Xem chi tiết phiếu"),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => openCaseDetail(code, "view", "quote_details"),
            },
            {
              label: t(
                "cases.actions.viewPartnerDetail",
                "Chi tiết theo đối tượng",
              ),
              icon: <Users className="w-4 h-4" />,
              onClick: () => openCaseDetail(code, "view", "partner_details"),
            },
          ],
        },
        {
          groupLabel: "THAO TÁC",
          items: [
            {
              label: t("cases.actions.editCase", "Chỉnh sửa phiếu"),
              icon: <Pencil className="w-4 h-4" />,
              onClick: () => openCaseDetail(code, "edit", "quote_details"),
            },
            {
              label: t("cases.actions.configure", "Phân loại"),
              icon: <SlidersHorizontal className="w-4 h-4" />,
              onClick: () => openCaseDetail(code, "edit", "quote_details"),
            },
            {
              label: t("cases.actions.reconcile", "Đối soát"),
              icon: <Scale className="w-4 h-4" />,
              onClick: () => openCaseDetail(code, "edit", "financials"),
            },
          ],
        },
      ];
    },
    [openCaseDetail, t],
  );

  const handleDrawerSuccess = useCallback(() => {
    listHook.refetch();
    queryClient.invalidateQueries({
      queryKey: ["garage", "cases"],
    });
    queryClient.invalidateQueries({
      queryKey: ["garage", "grossProfitReport"],
    });
  }, [listHook, queryClient]);

  return {
    t,
    listHook,
    columns,
    summary,
    createActions,
    rowActions,
    // Drawer
    selectedCaseCode,
    drawerEditMode,
    drawerInitialTab,
    closeCaseDetail,
    handleDrawerSuccess,
    // Sync & Permissions
    canSyncGarage,
    handleDirectSync,
    syncDrawerOpen,
    syncMode,
    setSyncDrawerOpen,
    setSyncMode,
    // Column view presets
    columnViewPresetsHook,
    activeColumnPresetKey,
    handleColumnPresetChange,
    handleCreateViewPreset,
    handleEditViewPreset,
    handleDeleteViewPreset,
    // Workflow Drawer
    workflowDrawerOpen,
    openWorkflow,
    closeWorkflow,
    // Export state
    exporting,
  };
}
