import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { money } from "@/shared/utils/format";
import { useGarageStore } from "../store/garageStore";
import { garageApi } from "../api/garageApi";
import { GarageCaseSyncDrawer } from "../components/GarageCaseSyncDrawer";
import { GarageCaseStandaloneDrawer } from "../components/GarageCaseStandaloneDrawer";
import { KgaraCaseStatusBadge } from "../components/KgaraCaseStatusBadge";
import {
  useGarageCases,
  useGarageBranches,
  useSyncGarageCaseDetail,
  useGarageGrossProfit,
} from "../hooks/useGarage";
import { useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  DownloadCloud,
  TrendingUp,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { applyGarageCasesTableState } from "../utils/garageCasesTable";

export function GarageCases() {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const { selectedBranchId, setSelectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();
  const tableState = useTableColumnState("garage-cases-table");
  const [dateRanges, setDateRanges] = useState<
    Record<string, { from: string; to: string }>
  >({});

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].externalId);
    }
  }, [branches, selectedBranchId, setSelectedBranchId]);

  const filterConfig = useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      search: true,
      custom: [],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const getSortState = useCallback(
    (key: string): "asc" | "desc" | "none" => {
      if (tableState.sorts.includes(key)) return "asc";
      if (tableState.sorts.includes(`-${key}`)) return "desc";
      return "none";
    },
    [tableState.sorts],
  );

  const handleSortChange = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      tableState.setSort(key, state);
    },
    [tableState],
  );

  const handleSearchChange = useCallback(
    (key: string, search: string) => {
      tableState.setColumnSearch(key, search);
    },
    [tableState],
  );

  const handleFilterChange = useCallback(
    (key: string, filters: string[]) => {
      tableState.setColumnFilter(key, filters);
    },
    [tableState],
  );

  const getDateRange = useCallback(
    (key: string) => dateRanges[key] || { from: "", to: "" },
    [dateRanges],
  );

  const handleDateRangeChange = useCallback(
    (key: string, from?: string, to?: string) => {
      setDateRanges((prev) => ({
        ...prev,
        [key]: { from: from || "", to: to || "" },
      }));
    },
    [],
  );

  const serverFiltersStr = useMemo(() => {
    return Object.keys(tableState.columnFilters).length > 0
      ? JSON.stringify(tableState.columnFilters)
      : undefined;
  }, [tableState.columnFilters]);

  const fetchCaseColumnOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await garageApi.getCaseColumnOptions(
        selectedBranchId || "",
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((item: string) => ({ label: item, value: item })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [selectedBranchId],
  );

  const commonOptionProps = {
    queryKeyPrefix: "garage-case-column-options",
    fetchOptions: fetchCaseColumnOptions,
    allFilters: tableState.columnFilters,
    enableSelectAllMatching: true,
  };

  const createHeaderProps = (
    key: string,
    title: string,
    align: "left" | "center" | "right" = "left",
    hideFilter = false,
  ) => ({
    title,
    columnKey: key,
    sortState: getSortState(key),
    onSortChange: (state: "asc" | "desc" | "none") =>
      handleSortChange(key, state),
    searchValue: tableState.columnSearch[key] || "",
    onSearchChange: (val: string) => handleSearchChange(key, val),
    selectedFilters: tableState.columnFilters[key] || [],
    onFilterChange: (vals: string[]) => handleFilterChange(key, vals),
    align,
    hideFilter,
  });

  const { data: profitData } = useGarageGrossProfit(
    selectedBranchId,
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined,
  );

  const profitCases = useMemo(() => {
    const groups = profitData?.results?.Groups || profitData?.Groups || [];
    return groups.flatMap((g: any) => g.Items || []);
  }, [profitData]);

  const {
    data: casesData,
    isLoading,
    refetch,
  } = useGarageCases(
    selectedBranchId,
    page,
    pageSize,
    filter.state.search || "",
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined,
    serverFiltersStr,
  );
  const cases = casesData?.data || [];
  const visibleCases = useMemo(
    () =>
      applyGarageCasesTableState(
        cases,
        tableState,
        filter.state.search || "",
        dateRanges,
      ),
    [cases, tableState, filter.state.search, dateRanges],
  );
  const totalCases = casesData?.pagination?.total || 0;

  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();

  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [syncMode, setSyncMode] = useState<"cases" | "gross-profit">("cases");

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const canCreateGarage = useHasPermission("garage", "create");
  const canUpdateGarage = useHasPermission("garage", "update");
  const canCreateGreenway = useHasPermission("greenway_integration", "create");
  const canCreateKgara = useHasPermission("kgara_integration", "create");
  const canSyncGarage =
    canCreateGarage || canUpdateGarage || canCreateGreenway || canCreateKgara;

  const createActions = useMemo(
    () =>
      canSyncGarage
        ? [
            {
              groupLabel: t("cases.actions.syncOptions", "Tùy chọn đồng bộ"),
              items: [
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
        : undefined,
    [canSyncGarage, t],
  );

  const columns = [
    {
      key: "createdAt",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "createdAt",
            t("cases.columns.createdAt", "Ngày tạo"),
            "center",
            true,
          )}
          isActive={
            !!(getDateRange("createdAt").from || getDateRange("createdAt").to)
          }
          hideFooter={true}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={getDateRange("createdAt").from}
              dateTo={getDateRange("createdAt").to}
              onChange={(from, to) => {
                handleDateRangeChange("createdAt", from, to);
                close();
              }}
              onClose={close}
            />
          )}
        />
      ),
      sortable: false,
      size: 150,
      enableResizing: true,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell date={item.createdAt} className="justify-end w-full" />
      ),
    },
    {
      key: "ngayHoanThanhCongViec",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "ngayHoanThanhCongViec",
            t("cases.columns.completionDate", "Ngày hoàn thành"),
            "center",
            true,
          )}
          isActive={
            !!(
              getDateRange("ngayHoanThanhCongViec").from ||
              getDateRange("ngayHoanThanhCongViec").to
            )
          }
          hideFooter={true}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={getDateRange("ngayHoanThanhCongViec").from}
              dateTo={getDateRange("ngayHoanThanhCongViec").to}
              onChange={(from, to) => {
                handleDateRangeChange("ngayHoanThanhCongViec", from, to);
                close();
              }}
              onClose={close}
            />
          )}
        />
      ),
      sortable: false,
      size: 150,
      enableResizing: true,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell
          date={item.ngayHoanThanhCongViec}
          className="justify-end w-full"
        />
      ),
    },
    {
      key: "statusName",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "statusName",
            t("cases.columns.status"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      cell: (item: any) => (
        <KgaraCaseStatusBadge
          status={item.tenTinhTrangDichVu || t("cases.common.unknown")}
        />
      ),
    },
    {
      key: "caseCode",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "caseCode",
            t("cases.columns.caseCode"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 200,
      enableResizing: true,
      cell: (item: any) => (
        <TableText
          text={item.soChungTu}
          textClassName="font-medium text-primary text-left"
          enableCopy={true}
          tooltip={true}
          onDrawerClick={() => setSelectedCaseId(item.soChungTu)}
        />
      ),
    },
    {
      key: "licensePlate",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "licensePlate",
            t("cases.columns.licensePlate"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      cell: (item: any) => item.bienSoXe || "-",
    },
    {
      key: "customerCode",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "customerCode",
            t("cases.columns.customerCode"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      cell: (item: any) => item.khachHangCode || "-",
    },
    {
      key: "customerName",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "customerName",
            t("cases.columns.customerName"),
            "left",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 200,
      enableResizing: true,
      cell: (item: any) => item.khachHangName || "-",
    },
    {
      key: "isInsuranceClaim",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "isInsuranceClaim",
            t("cases.columns.insurance"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 100,
      enableResizing: true,
      cell: (item: any) =>
        item.rawData?.XeLamBaoHiem
          ? t("cases.common.yes")
          : t("cases.common.no"),
    },
    {
      key: "doanhThu",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("doanhThu", "Doanh thu", "right")}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = item.doanhThu ?? pItem?.DoanhThu ?? item.rawData?.DoanhThu;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return money(Number(val) || 0);
      },
    },
    {
      key: "chiPhi",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("chiPhi", "Chi phí", "right")}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = item.chiPhi ?? pItem?.ChiPhi ?? item.rawData?.ChiPhi;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return money(Number(val) || 0);
      },
    },
    {
      key: "loiNhuan",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("loiNhuan", "Lợi nhuận", "right")}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = item.loiNhuan ?? pItem?.LoiNhuan ?? item.rawData?.LoiNhuan;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        const numVal = Number(val) || 0;
        return (
          <span
            className={
              numVal >= 0
                ? "text-emerald-600 font-semibold"
                : "text-rose-600 font-semibold"
            }
          >
            {money(numVal)}
          </span>
        );
      },
    },
    {
      key: "margin",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("margin", "Biên LN", "right", true)}
          hideFooter={true}
        />
      ),
      sortable: false,
      size: 100,
      enableResizing: true,
      className: "text-right",
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const rev =
          Number(item.doanhThu ?? pItem?.DoanhThu ?? item.rawData?.DoanhThu) ||
          0;
        const profit =
          Number(item.loiNhuan ?? pItem?.LoiNhuan ?? item.rawData?.LoiNhuan) ||
          0;

        if (
          item.tenTinhTrangDichVu === "Kết thúc" &&
          item.doanhThu == null &&
          pItem?.DoanhThu == null
        ) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        if (!rev || rev <= 0) {
          return <span className="text-muted-foreground text-xs">-</span>;
        }

        const margin = (profit / rev) * 100;
        const isHigh = margin >= 20;
        const isMid = margin >= 0 && margin < 20;

        return (
          <div className="flex items-center justify-end">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                isHigh
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                  : isMid
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40"
              }`}
            >
              {margin > 0 ? `+${margin.toFixed(1)}%` : `${margin.toFixed(1)}%`}
            </span>
          </div>
        );
      },
    },
    {
      key: "totalAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "totalAmount",
            t("cases.columns.totalAmount"),
            "right",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.tienCoThue) || 0),
    },
    {
      key: "balanceAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "balanceAmount",
            t("cases.columns.balanceAmount"),
            "right",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(item.tienConPhaiThanhToan) || 0),
    },
    {
      key: "branchName",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("branchName", "Chi nhánh Kgara", "left", true)}
          hideFooter={true}
        />
      ),
      sortable: false,
      size: 160,
      enableResizing: true,
      cell: (item: any) => {
        const b = branches?.find(
          (b: any) => b.externalId === item.branchExternalId,
        );
        return b?.name || "-";
      },
    },
    {
      key: "caseDate",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "caseDate",
            t("cases.columns.caseDate"),
            "center",
            true,
          )}
          isActive={
            !!(getDateRange("caseDate").from || getDateRange("caseDate").to)
          }
          hideFooter={true}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={getDateRange("caseDate").from}
              dateTo={getDateRange("caseDate").to}
              onChange={(from, to) => {
                handleDateRangeChange("caseDate", from, to);
                close();
              }}
              onClose={close}
            />
          )}
        />
      ),
      sortable: false,
      size: 150,
      enableResizing: true,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell
          date={item.ngayPhatSinh}
          className="justify-end w-full"
        />
      ),
    },
    {
      key: "dataAsOf",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "dataAsOf",
            t("cases.columns.dataAsOf"),
            "center",
            true,
          )}
          isActive={
            !!(getDateRange("dataAsOf").from || getDateRange("dataAsOf").to)
          }
          hideFooter={true}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={getDateRange("dataAsOf").from}
              dateTo={getDateRange("dataAsOf").to}
              onChange={(from, to) => {
                handleDateRangeChange("dataAsOf", from, to);
                close();
              }}
              onClose={close}
            />
          )}
        />
      ),
      sortable: false,
      size: 150,
      enableResizing: true,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell date={item.dataAsOf} className="justify-end w-full" />
      ),
    },
    {
      key: "updatedAt",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "updatedAt",
            t("cases.columns.updatedAt"),
            "center",
            true,
          )}
          isActive={
            !!(getDateRange("updatedAt").from || getDateRange("updatedAt").to)
          }
          hideFooter={true}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={getDateRange("updatedAt").from}
              dateTo={getDateRange("updatedAt").to}
              onChange={(from, to) => {
                handleDateRangeChange("updatedAt", from, to);
                close();
              }}
              onClose={close}
            />
          )}
        />
      ),
      sortable: false,
      size: 150,
      enableResizing: true,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell date={item.updatedAt} className="justify-end w-full" />
      ),
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("cases.title")}
        desc={t("cases.desc")}
        icon={<FileText className="w-5 h-5 text-slate-700" />}
        tableId="garage-cases-table"
        items={visibleCases}
        columns={columns}
        getRowKey={(item: any) => item.id}
        loading={isLoading}
        onRefresh={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["garage", "grossProfitReport"],
          });
        }}
        filterConfig={filterConfig}
        filter={filter}
        createLabel={t("cases.actions.syncCases", "Đồng bộ Sổ báo giá")}
        createIcon={<DownloadCloud className="w-4 h-4 mr-1.5" />}
        onCreate={
          canSyncGarage
            ? () => {
                setSyncMode("cases");
                setSyncDrawerOpen(true);
              }
            : undefined
        }
        createActions={createActions}
        rowActions={(item: any) => [
          {
            label: t("cases.actions.viewDetail", "Xem chi tiết"),
            icon: <MoreHorizontal className="w-4 h-4" />,
            onClick: () => {
              setSelectedCaseId(item.id);
            },
          },
          {
            label: t("cases.actions.syncDetails", "Đồng bộ chi tiết"),
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: () => {
              syncCaseDetail({
                branchId: selectedBranchId!,
                caseId: item.hdPhieuDichVuId,
              });
            },
          },
        ]}
        page={page}
        pageSize={pageSize}
        total={totalCases}
        totalPages={Math.ceil(totalCases / pageSize) || 1}
        onPage={(p) => setPage(p)}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />

      <GarageCaseStandaloneDrawer
        isOpen={!!selectedCaseId}
        caseCode={selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["garage", "grossProfitReport"],
          });
        }}
      />

      <GarageCaseSyncDrawer
        open={syncDrawerOpen}
        mode={syncMode}
        title={
          syncMode === "gross-profit"
            ? t("cases.syncDrawer.titleGrossProfit", "Đồng bộ Lợi nhuận gộp")
            : t("cases.syncDrawer.titleCases", "Đồng bộ Sổ báo giá")
        }
        description={
          syncMode === "gross-profit"
            ? t(
                "cases.syncDrawer.descGrossProfit",
                "Chọn khoảng thời gian để cập nhật lại dữ liệu Doanh thu - Chi phí - Lợi nhuận gộp từ hệ thống Garage.",
              )
            : t(
                "cases.syncDrawer.descCases",
                "Chọn khoảng thời gian để đồng bộ phiếu dịch vụ (Cases) và doanh thu chi phí từ hệ thống Garage về ERP.",
              )
        }
        onClose={() => setSyncDrawerOpen(false)}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["garage", "grossProfitReport"],
          });
        }}
      />
    </>
  );
}
