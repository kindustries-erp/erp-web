import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableText } from "@/shared/components/DataTable/TableText";
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
import {
  RefreshCw,
  DownloadCloud,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { applyGarageCasesTableState } from "../utils/garageCasesTable";

export function GarageCases() {
  const { t } = useTranslation("garage");
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

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const createActions = useMemo(
    () => [
      {
        groupLabel: "Thao tác",
        items: [
          {
            label: t("cases.actions.syncCases", "Đồng bộ Sổ báo giá"),
            icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
            onClick: () => setSyncDrawerOpen(true),
          },
        ],
      },
    ],
    [t],
  );

  const columns = [
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
      cell: (item: any) => {
        if (!item.updatedAt) return "-";
        return new Date(item.updatedAt).toLocaleString();
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
      cell: (item: any) => {
        if (!item.ngayPhatSinh) return "-";
        const d = new Date(item.ngayPhatSinh);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      },
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
      cell: (item: any) => (
        <TableText
          text={item.soChungTu}
          textClassName="font-medium text-primary text-left"
          enableCopy={true}
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
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = pItem?.DoanhThu ?? item.doanhThu ?? item.rawData?.DoanhThu;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(val) || 0);
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
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = pItem?.ChiPhi ?? item.chiPhi ?? item.rawData?.ChiPhi;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(val) || 0);
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
      cell: (item: any) => {
        const pItem = profitCases.find(
          (p: any) => p.VuViecCode === item.soChungTu,
        );
        const val = pItem?.LoiNhuan ?? item.loiNhuan ?? item.rawData?.LoiNhuan;
        if (item.tenTinhTrangDichVu === "Kết thúc" && val == null) {
          return (
            <span className="text-red-500 text-xs italic">Chưa đồng bộ</span>
          );
        }
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(val) || 0);
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
      cell: (item: any) => {
        const b = branches?.find(
          (b: any) => b.externalId === item.branchExternalId,
        );
        return b?.name || "-";
      },
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
      cell: (item: any) => {
        if (!item.dataAsOf) return "-";
        return new Date(item.dataAsOf).toLocaleString();
      },
    },
    {
      key: "createdAt",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps(
            "createdAt",
            t("cases.columns.createdAt"),
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
      cell: (item: any) => {
        if (!item.createdAt) return "-";
        return new Date(item.createdAt).toLocaleString();
      },
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
        onRefresh={() => refetch()}
        filterConfig={filterConfig}
        filter={filter}
        createLabel="Tạo phiếu dịch vụ"
        createActions={createActions}
        rowActions={(item: any) => [
          {
            label: "Xem chi tiết",
            icon: <MoreHorizontal className="w-4 h-4" />,
            onClick: () => {
              setSelectedCaseId(item.id);
            },
          },
          {
            label: t("cases.actions.syncDetails"),
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
        onSuccess={() => refetch()}
      />

      <GarageCaseSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
        onSuccess={() => refetch()}
      />
    </>
  );
}
