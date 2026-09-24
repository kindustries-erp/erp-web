import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet,
  TrendingUp,
  Eye,
  Users,
  Pencil,
  SlidersHorizontal,
  Scale,
  RefreshCw,
} from "lucide-react";
import { useGarageStore } from "../../store/garageStore";
import { useGarageCaseServicesList } from "../../hooks/useGarageCaseServicesList";
import { useServiceColumns } from "./components/serviceColumns";
import { useGarageCaseServicesSummary } from "./hooks/useGarageCaseServicesSummary";
import { garageApi } from "../../api/garageApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { KgaraCaseServiceRow } from "./types";

export function useGarageCaseServicesSectionLogic() {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageCaseServicesList();

  // Drawer states
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] =
    useState<string>("quote_details");
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [syncMode, setSyncMode] = useState<
    "cases" | "gross-profit" | "case-details"
  >("case-details");
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
        ],
      },
      ...(canSyncGarage
        ? [
            {
              groupLabel: t("cases.actions.syncOptions", "Tùy chọn đồng bộ"),
              items: [
                {
                  label: t(
                    "services.actions.syncDetails",
                    "Đồng bộ chi tiết vật tư & công thợ",
                  ),
                  icon: <RefreshCw className="w-4 h-4 text-primary" />,
                  onClick: () => {
                    setSyncMode("case-details");
                    setSyncDrawerOpen(true);
                  },
                },
                {
                  label: t(
                    "cases.actions.syncGrossProfit",
                    "Đồng bộ Lợi nhuận gộp",
                  ),
                  icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
                  onClick: () => {
                    setSyncMode("gross-profit");
                    setSyncDrawerOpen(true);
                  },
                },
              ],
            },
          ]
        : []),
    ],
    [canSyncGarage, exporting, handleExportExcel, t],
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
              onClick: () => openCaseDetail(code, "view", "financials"),
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
    // Sync Drawer
    syncDrawerOpen,
    syncMode,
    setSyncDrawerOpen,
    setSyncMode,
    // Export state
    exporting,
  };
}
