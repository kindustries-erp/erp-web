import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { formatGMT7, money } from "@/shared/utils/format";
import { garageApi } from "@/modules/garage/api/garageApi";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import { Check } from "lucide-react";

export function useGarageCaseSelectionModal({
  open,
  onClose,
  onSelect,
  existingCaseCodes = [],
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (caseItem: any) => void;
  existingCaseCodes?: string[];
}) {
  const { t } = useTranslation(["garage", "erpInvoices"]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const { data: branches } = useGarageBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].externalId || branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const tableState = useTableColumnState("garage-case-selection-table");

  const { data, isLoading } = useQuery({
    queryKey: [
      "garage-cases-selection",
      selectedBranchId,
      page,
      pageSize,
      tableState.columnSearch,
      tableState.columnFilters,
    ],
    queryFn: () =>
      garageApi.getCases(
        selectedBranchId,
        page,
        pageSize,
        tableState.columnSearch["VuViecCode"] ||
          tableState.columnSearch["BienSo"] ||
          tableState.columnSearch["TenKhachHang"] ||
          "",
      ),
    enabled: open && !!selectedBranchId,
  });

  const cases = data?.items || [];

  useEffect(() => {
    if (open) {
      setSelectedCase(null);
    }
  }, [open]);

  const handleSelect = (item: any) => {
    setSelectedCase(item);
  };

  const handleConfirm = () => {
    if (selectedCase) {
      onSelect(selectedCase);
      onClose();
    }
  };

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const renderHeaderFilter = (key: string, label: string) => {
    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={getSortState(key)}
        onSortChange={(state) => tableState.setSort(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          tableState.setColumnSearch(key, val);
          setPage(1);
        }}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          tableState.setColumnFilter(key, vals);
          setPage(1);
        }}
        columnKey={key}
        allFilters={tableState.columnFilters}
        queryKeyPrefix="garage-case-selection-column-options"
      />
    );
  };

  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: "select",
        header: "",
        size: 40,
        enableResizing: false,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (row: any) => {
          const isSelected =
            selectedCase?.id === row.id ||
            selectedCase?.VuViecCode === row.VuViecCode;
          const isExisting =
            existingCaseCodes.includes(row.VuViecCode) ||
            existingCaseCodes.includes(row.id);
          return (
            <div className="flex items-center justify-center">
              <input
                type="radio"
                name="case_select"
                disabled={isExisting}
                checked={isSelected}
                onChange={() => handleSelect(row)}
                className="cursor-pointer text-primary focus:ring-primary h-4 w-4"
              />
            </div>
          );
        },
      },
      {
        key: "VuViecCode",
        header: renderHeaderFilter("VuViecCode", t("Mã vụ việc", "Mã vụ việc")),
        size: 140,
        enableResizing: true,
        className: "font-mono font-medium text-primary text-center",
        headerClassName: "text-center",
        cell: (row: any) => (
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {row.VuViecCode || row.code || "--"}
          </span>
        ),
      },
      {
        key: "BienSo",
        header: renderHeaderFilter("BienSo", t("Biển số xe", "Biển số xe")),
        size: 130,
        enableResizing: true,
        className: "font-mono font-medium text-center",
        headerClassName: "text-center",
        cell: (row: any) => (
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {row.BienSo || row.plateNumber || "--"}
          </span>
        ),
      },
      {
        key: "TenKhachHang",
        header: renderHeaderFilter(
          "TenKhachHang",
          t("Tên khách hàng", "Tên khách hàng"),
        ),
        size: 200,
        enableResizing: true,
        cell: (row: any) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.TenKhachHang || row.customerName || "--"}
            </span>
            {row.DienThoai && (
              <span className="text-xs text-slate-400 font-mono">
                {row.DienThoai}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "NgayVao",
        header: renderHeaderFilter("NgayVao", t("Ngày vào", "Ngày vào")),
        size: 120,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        cell: (row: any) => (
          <span className="text-slate-600 dark:text-slate-300 font-sans">
            {row.NgayVao ? formatGMT7(row.NgayVao, "date") : "--"}
          </span>
        ),
      },
      {
        key: "TrangThai",
        header: renderHeaderFilter("TrangThai", t("Trạng thái", "Trạng thái")),
        size: 130,
        enableResizing: true,
        cell: (row: any) => {
          const isExisting =
            existingCaseCodes.includes(row.VuViecCode) ||
            existingCaseCodes.includes(row.id);
          if (isExisting) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Check className="w-3 h-3" />
                {t("Đã liên kết", "Đã liên kết")}
              </span>
            );
          }
          return (
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {row.TrangThai || row.status || "Chờ xử lý"}
            </span>
          );
        },
      },
      {
        key: "TongTien",
        header: renderHeaderFilter("TongTien", t("Tổng tiền", "Tổng tiền")),
        size: 140,
        enableResizing: true,
        className: "text-right font-mono font-semibold",
        headerClassName: "text-center",
        cell: (row: any) => {
          const total =
            row.TongTien || row.totalAmount || row.TongDoanhThu || 0;
          return (
            <span className="text-slate-900 dark:text-slate-100">
              {money(total)}
            </span>
          );
        },
      },
    ];
  }, [selectedCase, existingCaseCodes, tableState, t]);

  return {
    t,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedCase,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    cases,
    data,
    isLoading,
    columns,
    handleSelect,
    handleConfirm,
  };
}
