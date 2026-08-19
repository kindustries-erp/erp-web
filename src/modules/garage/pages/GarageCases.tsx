import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
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
  FileText,
  XCircle,
  FileClock,
  Wrench,
  ShieldCheck,
  Eye,
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

  const activeFilterCount = useMemo(() => {
    const activeDateCount = Object.values(dateRanges).filter((range) =>
      Boolean(range?.from || range?.to),
    ).length;
    return (tableState.activeFilterCount || 0) + activeDateCount;
  }, [tableState.activeFilterCount, dateRanges]);

  const handleClearAllFilters = useCallback(() => {
    tableState.resetFilters();
    setDateRanges({});
    setPage(1);
  }, [tableState]);

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
        items: res.items.map((item: string) => {
          if (columnKey === "isInsuranceClaim") {
            return {
              label:
                item === "yes"
                  ? t("cases.common.yes", "Có")
                  : t("cases.common.no", "Không"),
              value: item,
            };
          }
          return { label: item, value: item };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [selectedBranchId, t],
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
    align: "left" | "center" | "right" = "center",
    hideFilter = false,
    formatOptionLabel?: (label: string) => string,
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
    formatOptionLabel,
  });

  const { data: profitData } = useGarageGrossProfit(selectedBranchId);

  const profitCases = useMemo(() => {
    const groups = profitData?.results?.Groups || profitData?.Groups || [];
    return groups.flatMap((g: any) => g.Items || []);
  }, [profitData]);

  const {
    data: casesData,
    isLoading,
    isFetching,
    refetch,
  } = useGarageCases(
    selectedBranchId,
    page,
    pageSize,
    "",
    undefined,
    undefined,
    serverFiltersStr,
  );

  const cases = casesData?.data || [];
  const visibleCases = useMemo(
    () => applyGarageCasesTableState(cases, tableState, "", dateRanges),
    [cases, tableState, dateRanges],
  );
  const totalCases = casesData?.pagination?.total || 0;

  const defaultColumnVisibility = useMemo(
    () => ({
      statusName: false,
      branchName: false,
      createdAt: false,
      dataAsOf: false,
    }),
    [],
  );

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
    // 0. STT
    {
      key: "index",
      label: "#",
      header: <span className="w-full block text-center">#</span>,
      size: 50,
      enableResizing: false,
      hideable: false,
      headerClassName: "text-center",
      className: "text-center font-mono text-xs text-muted-foreground",
      cell: (_: any, idx: number) => <span>{idx}</span>,
    },
    // 1. Mã vụ việc (Số chứng từ)
    {
      key: "caseCode",
      label: t("cases.columns.caseCode", "Số chứng từ"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "caseCode",
            t("cases.columns.caseCode", "Số chứng từ"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 220,
      enableResizing: true,
      className: "text-left",
      cell: (item: any) => {
        const s = (item.tenTinhTrangDichVu || "").toLowerCase();
        const isCanceled =
          s.includes("hủy") ||
          s.includes("từ chối") ||
          s.includes("không duyệt");
        const isInProgress =
          s.includes("đang sửa") ||
          s.includes("đang làm") ||
          s.includes("tiếp nhận") ||
          s.includes("đang xử lý") ||
          s.includes("kiểm tra") ||
          s.includes("sửa chữa") ||
          s.includes("xử lý");
        const isDraft =
          s.includes("nháp") || s.includes("báo giá") || s.includes("chờ");

        return (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={item.soChungTu}
              textClassName="font-medium text-primary text-left"
              enableCopy={true}
              tooltip={true}
              onDetailClick={() => setSelectedCaseId(item.soChungTu)}
            />
            {isCanceled && (
              <Tooltip content={item.tenTinhTrangDichVu}>
                <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 ml-auto" />
              </Tooltip>
            )}
            {isInProgress && (
              <Tooltip content={item.tenTinhTrangDichVu}>
                <Wrench className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 ml-auto" />
              </Tooltip>
            )}
            {isDraft && (
              <Tooltip content={item.tenTinhTrangDichVu}>
                <FileClock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 ml-auto" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    // 2. Biển số xe
    {
      key: "licensePlate",
      label: t("cases.columns.licensePlate", "Biển số xe"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "licensePlate",
            t("cases.columns.licensePlate", "Biển số xe"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "font-medium text-left",
      cell: (item: any) => item.bienSoXe || "-",
    },
    // 3. Trạng thái
    {
      key: "statusName",
      label: t("cases.columns.status", "Trạng thái"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "statusName",
            t("cases.columns.status", "Trạng thái"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 140,
      enableResizing: true,
      className: "text-center",
      cell: (item: any) => (
        <div className="w-full flex justify-center">
          <KgaraCaseStatusBadge
            status={
              item.tenTinhTrangDichVu ||
              t("cases.common.unknown", "Chưa xác định")
            }
          />
        </div>
      ),
    },
    // 4. Mã khách hàng
    {
      key: "customerCode",
      label: t("cases.columns.customerCode", "Mã KH"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "customerCode",
            t("cases.columns.customerCode", "Mã KH"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 130,
      enableResizing: true,
      className: "text-left font-mono",
      cell: (item: any) => item.khachHangCode || "-",
    },
    // 5. Tên khách hàng
    {
      key: "customerName",
      label: t("cases.columns.customerName", "Tên khách hàng"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "customerName",
            t("cases.columns.customerName", "Tên khách hàng"),
            "center",
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 200,
      enableResizing: true,
      className: "text-left",
      cell: (item: any) => item.khachHangName || "-",
    },
    // 6. Bảo hiểm (BH)
    {
      key: "isInsuranceClaim",
      label: t("cases.columns.insurance", "BH"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "isInsuranceClaim",
            t("cases.columns.insurance", "BH"),
            "center",
            false,
            (val: string) =>
              val === "yes"
                ? t("cases.common.yes", "Có")
                : val === "no"
                  ? t("cases.common.no", "Không")
                  : val,
          )}
          {...commonOptionProps}
        />
      ),
      sortable: false,
      size: 90,
      enableResizing: true,
      className: "text-center",
      cell: (item: any) =>
        item.rawData?.XeLamBaoHiem ? (
          <div className="w-full flex justify-center">
            <Tooltip content={t("cases.drawer.insuranceClaim", "Làm bảo hiểm")}>
              <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" />
            </Tooltip>
          </div>
        ) : (
          <span className="text-muted-foreground/30 select-none font-normal">
            —
          </span>
        ),
    },
    // 7. Ngày tiếp nhận (Ngày chứng từ)
    {
      key: "caseDate",
      label: t("cases.columns.caseDate", "Ngày tiếp nhận"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "caseDate",
            t("cases.columns.caseDate", "Ngày tiếp nhận"),
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
    // 8. Ngày hoàn thành
    {
      key: "ngayHoanThanhCongViec",
      label: t("cases.columns.completionDate", "Ngày kết thúc"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "ngayHoanThanhCongViec",
            t("cases.columns.completionDate", "Ngày kết thúc"),
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
    // 9. Doanh thu
    {
      key: "doanhThu",
      label: t("cases.columns.doanhThu", "Doanh thu"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "doanhThu",
            t("cases.columns.doanhThu", "Doanh thu"),
            "center",
          )}
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
            <span className="inline-flex items-center text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200/60 dark:border-rose-800/40">
              {t("cases.common.notSynced", "Chưa đồng bộ")}
            </span>
          );
        }
        const numVal = Number(val) || 0;
        if (numVal === 0) {
          return (
            <span className="text-muted-foreground/60 font-normal select-none">
              —
            </span>
          );
        }
        return money(numVal);
      },
    },
    // 10. Chi phí
    {
      key: "chiPhi",
      label: t("cases.columns.chiPhi", "Chi phí"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "chiPhi",
            t("cases.columns.chiPhi", "Chi phí"),
            "center",
          )}
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
            <span className="inline-flex items-center text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200/60 dark:border-rose-800/40">
              {t("cases.common.notSynced", "Chưa đồng bộ")}
            </span>
          );
        }
        const numVal = Number(val) || 0;
        if (numVal === 0) {
          return (
            <span className="text-muted-foreground/60 font-normal select-none">
              —
            </span>
          );
        }
        return money(numVal);
      },
    },
    // 11. Lợi nhuận
    {
      key: "loiNhuan",
      label: t("cases.columns.loiNhuan", "Lợi nhuận"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "loiNhuan",
            t("cases.columns.loiNhuan", "Lợi nhuận"),
            "center",
          )}
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
            <span className="inline-flex items-center text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200/60 dark:border-rose-800/40">
              {t("cases.common.notSynced", "Chưa đồng bộ")}
            </span>
          );
        }
        const numVal = Number(val) || 0;
        if (numVal === 0) {
          return (
            <span className="text-muted-foreground/60 font-normal select-none">
              —
            </span>
          );
        }
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
    // 12. Biên LN (%)
    {
      key: "margin",
      label: t("cases.columns.margin", "Biên LN"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "margin",
            t("cases.columns.margin", "Biên LN"),
            "center",
            true,
          )}
          hideFooter={true}
        />
      ),
      sortable: false,
      size: 100,
      enableResizing: true,
      className: "text-right tabular-nums",
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
            <span className="inline-flex items-center text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200/60 dark:border-rose-800/40">
              {t("cases.common.notSynced", "Chưa đồng bộ")}
            </span>
          );
        }
        if (!rev || rev <= 0) {
          return (
            <span className="text-muted-foreground/60 font-normal select-none">
              —
            </span>
          );
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
    // 13. Tiến độ thu tiền (Phong cách Neutral Business)
    {
      key: "collectionProgress",
      label: t("cases.columns.collectionProgress", "Tiến độ thu"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "collectionProgress",
            t("cases.columns.collectionProgress", "Tiến độ thu"),
            "center",
            false,
            (val: string) => {
              if (val === "PAID") return t("cases.filter.paid", "Đã thu đủ");
              if (val === "PARTIAL")
                return t("cases.filter.partial", "Thu một phần");
              if (val === "UNPAID") return t("cases.filter.unpaid", "Chưa thu");
              return val;
            },
          )}
          fetchOptions={async () => ({
            items: [
              { label: t("cases.filter.paid", "Đã thu đủ"), value: "PAID" },
              {
                label: t("cases.filter.partial", "Thu một phần"),
                value: "PARTIAL",
              },
              { label: t("cases.filter.unpaid", "Chưa thu"), value: "UNPAID" },
            ],
            total: 3,
            next: null,
          })}
          allFilters={tableState.columnFilters}
        />
      ),
      sortable: false,
      size: 210,
      enableResizing: true,
      className: "text-left",
      cell: (item: any) => {
        const total = Number(item.tienCoThue) || 0;
        const paid = Number(item.tienDaThanhToan) || 0;
        const bal = Number(item.tienConPhaiThanhToan) || 0;

        if (total <= 0 && bal <= 0 && paid <= 0) {
          return (
            <span className="text-muted-foreground/40 font-normal select-none">
              —
            </span>
          );
        }

        const isAllPaid = bal <= 0 && paid > 0;
        const isUnpaid = paid <= 0 && bal > 0;
        const rate =
          total > 0
            ? Math.min(100, Math.round((paid / total) * 100))
            : isAllPaid
              ? 100
              : 0;

        return (
          <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
            {/* Row 1: Left badge + Right amount */}
            <div className="flex items-center justify-between text-xs tabular-nums leading-none">
              {isAllPaid ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đã thu đủ
                </span>
              ) : isUnpaid ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Chưa thu
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                  {rate}%
                </span>
              )}

              <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                {isAllPaid ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {money(paid)}
                  </span>
                ) : isUnpaid ? (
                  <span className="text-muted-foreground font-normal">
                    {money(bal)}
                  </span>
                ) : (
                  <>
                    <span className="text-foreground font-medium">
                      {money(paid)}
                    </span>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-muted-foreground font-normal">
                      {money(bal)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isAllPaid
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : isUnpaid
                      ? "bg-transparent"
                      : "bg-emerald-600 dark:bg-emerald-500",
                )}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      },
    },
    // 14. Tiến độ chi trả NCC (Dựa trên số tiền đã chi thực tế / tổng chi phí)
    {
      key: "costProgress",
      label: t("cases.columns.costProgress", "Tiến độ chi"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "costProgress",
            t("cases.columns.costProgress", "Tiến độ chi"),
            "center",
            false,
            (val: string) => {
              if (val === "PAID")
                return t("cases.filter.costPaid", "Đã chi đủ");
              if (val === "PARTIAL")
                return t("cases.filter.costPartial", "Chi một phần");
              if (val === "UNPAID")
                return t("cases.filter.costUnpaid", "Chưa chi");
              return val;
            },
          )}
          fetchOptions={async () => ({
            items: [
              { label: t("cases.filter.costPaid", "Đã chi đủ"), value: "PAID" },
              {
                label: t("cases.filter.costPartial", "Chi một phần"),
                value: "PARTIAL",
              },
              {
                label: t("cases.filter.costUnpaid", "Chưa chi"),
                value: "UNPAID",
              },
            ],
            total: 3,
            next: null,
          })}
          allFilters={tableState.columnFilters}
        />
      ),
      sortable: false,
      size: 200,
      enableResizing: true,
      className: "text-left",
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const cost =
          Number(item.chiPhi ?? pItem?.ChiPhi ?? item.rawData?.ChiPhi) || 0;
        const paidCost =
          Number(item.tienDaChi ?? item.rawData?.TienDaChi ?? 0) || 0;
        const balCost = Math.max(0, cost - paidCost);

        if (cost <= 0) {
          return (
            <span className="text-muted-foreground/40 font-normal select-none">
              —
            </span>
          );
        }

        const isAllPaidCost = balCost <= 0 && paidCost > 0;
        const isUnpaidCost = paidCost <= 0 && cost > 0;
        const costRate =
          cost > 0 ? Math.min(100, Math.round((paidCost / cost) * 100)) : 0;

        return (
          <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
            {/* Row 1: Left badge + Right amount */}
            <div className="flex items-center justify-between text-xs tabular-nums leading-none">
              {isAllPaidCost ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đã chi đủ
                </span>
              ) : isUnpaidCost ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Chưa chi
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {costRate}%
                </span>
              )}

              <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                {isAllPaidCost ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {money(paidCost)}
                  </span>
                ) : isUnpaidCost ? (
                  <span className="text-muted-foreground font-normal">
                    {money(balCost)}
                  </span>
                ) : (
                  <>
                    <span className="text-foreground font-medium">
                      {money(paidCost)}
                    </span>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-muted-foreground font-normal">
                      {money(balCost)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isAllPaidCost
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : isUnpaidCost
                      ? "bg-transparent"
                      : "bg-slate-700 dark:bg-slate-300",
                )}
                style={{ width: `${costRate}%` }}
              />
            </div>
          </div>
        );
      },
    },
    // 15. Chi nhánh Kgara
    {
      key: "branchName",
      label: t("cases.columns.branchName", "Chi nhánh"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "branchName",
            t("cases.columns.branchName", "Chi nhánh"),
            "center",
            true,
          )}
          hideFooter={true}
        />
      ),
      sortable: false,
      size: 160,
      enableResizing: true,
      className: "text-left",
      cell: (item: any) => {
        const b = branches?.find(
          (b: any) => b.externalId === item.branchExternalId,
        );
        return b?.name || "-";
      },
    },
    // 16. Ngày tạo HT
    {
      key: "createdAt",
      label: t("cases.columns.createdAt", "Ngày tạo"),
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
    // 17. Dữ liệu lúc
    {
      key: "dataAsOf",
      label: t("cases.columns.dataAsOf", "Dữ liệu lúc"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "dataAsOf",
            t("cases.columns.dataAsOf", "Dữ liệu lúc"),
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
    // 18. Ngày cập nhật
    {
      key: "updatedAt",
      label: t("cases.columns.updatedAt", "Ngày cập nhật"),
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "updatedAt",
            t("cases.columns.updatedAt", "Ngày cập nhật"),
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

  const summaryRow = useMemo(() => {
    if (!visibleCases || visibleCases.length === 0) return undefined;

    let totalRev = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalPaidVal = 0;
    let totalBalanceVal = 0;

    for (const item of visibleCases) {
      const pItem = profitCases.find(
        (p: any) => p.VuViecCode === item.soChungTu,
      );
      const rev =
        Number(item.doanhThu ?? pItem?.DoanhThu ?? item.rawData?.DoanhThu) || 0;
      const cost =
        Number(item.chiPhi ?? pItem?.ChiPhi ?? item.rawData?.ChiPhi) || 0;
      const profit =
        Number(item.loiNhuan ?? pItem?.LoiNhuan ?? item.rawData?.LoiNhuan) || 0;
      const paidAmt = Number(item.tienDaThanhToan) || 0;
      const balAmt = Number(item.tienConPhaiThanhToan) || 0;

      totalRev += rev;
      totalCost += cost;
      totalProfit += profit;
      totalPaidVal += paidAmt;
      totalBalanceVal += balAmt;
    }

    return {
      isInsuranceClaim: (
        <div className="text-right w-full font-bold text-xs uppercase text-muted-foreground pr-2">
          {t("cases.common.total", "Tổng")}:
        </div>
      ),
      doanhThu: (
        <div className="text-right font-bold text-primary tabular-nums">
          {money(totalRev)}
        </div>
      ),
      chiPhi: (
        <div className="text-right font-bold text-slate-600 dark:text-slate-300 tabular-nums">
          {money(totalCost)}
        </div>
      ),
      loiNhuan: (
        <div
          className={`text-right font-bold tabular-nums ${
            totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {money(totalProfit)}
        </div>
      ),
      collectionProgress: (
        <div className="flex flex-col gap-0.5 text-right font-bold tabular-nums">
          <div className="text-emerald-600 dark:text-emerald-400 text-xs">
            Đã thu: {money(totalPaidVal)}
          </div>
          <div className="text-destructive text-[11px]">
            Còn lại: {money(totalBalanceVal)}
          </div>
        </div>
      ),
      costProgress: (
        <div className="text-right font-bold text-slate-600 dark:text-slate-300 tabular-nums text-xs">
          Tổng chi: {money(totalCost)}
        </div>
      ),
    };
  }, [visibleCases, profitCases, t]);

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("cases.title")}
        desc={t("cases.desc")}
        icon={<FileText className="w-5 h-5 text-slate-700" />}
        tableId="garage-cases-table"
        items={visibleCases}
        columns={columns}
        defaultColumnVisibility={defaultColumnVisibility}
        getRowKey={(item: any) => item.id}
        loading={isLoading || isFetching}
        onRefresh={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["garage", "grossProfitReport"],
          });
        }}
        activeFilterCount={activeFilterCount}
        onClearAllFilters={handleClearAllFilters}
        summaryRow={summaryRow}
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
            groupLabel: "TRA CỨU",
            items: [
              {
                label: t("cases.actions.viewDetail", "Xem chi tiết"),
                icon: <Eye className="w-4 h-4" />,
                onClick: () => {
                  setSelectedCaseId(item.soChungTu || item.id);
                },
              },
            ],
          },
          {
            groupLabel: "THAO TÁC",
            items: [
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
            ],
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
