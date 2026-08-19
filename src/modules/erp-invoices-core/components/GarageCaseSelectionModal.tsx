import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { formatGMT7, money } from "@/shared/utils/format";
import { garageApi } from "@/modules/garage/api/garageApi";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import { Wrench, Check, Building2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (caseItem: any) => void;
  existingCaseCodes?: string[];
}

export function GarageCaseSelectionModal({
  open,
  onClose,
  onSelect,
  existingCaseCodes = [],
}: Props) {
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
        header: renderHeaderFilter(
          "VuViecCode",
          t("Mã vụ việc / Báo giá", "Mã vụ việc / Báo giá"),
        ),
        size: 170,
        enableResizing: true,
        cell: (row: any) => (
          <span className="font-mono font-semibold text-primary">
            {row.VuViecCode || row.SoBaoGia || row.id}
          </span>
        ),
      },
      {
        key: "BienSo",
        header: renderHeaderFilter("BienSo", t("Biển số xe", "Biển số xe")),
        size: 130,
        enableResizing: true,
        cell: (row: any) => (
          <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80">
            {row.BienSo || "--"}
          </span>
        ),
      },
      {
        key: "TenKhachHang",
        header: renderHeaderFilter(
          "TenKhachHang",
          t("Khách hàng", "Khách hàng"),
        ),
        size: 240,
        enableResizing: true,
        cell: (row: any) => (
          <span className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
            {row.TenKhachHang || row.customerName || "--"}
          </span>
        ),
      },
      {
        key: "NgayVao",
        header: renderHeaderFilter("NgayVao", t("Ngày vào", "Ngày vào")),
        size: 120,
        enableResizing: true,
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

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<Wrench className="w-5 h-5 text-primary" />}
      title={t(
        "Chọn vụ việc / phiếu dịch vụ Garage để ghép nối",
        "Chọn vụ việc / phiếu dịch vụ Garage để ghép nối",
      )}
      panelClassName="w-full md:w-[95vw] lg:w-[1200px] xl:w-[1200px]"
      actions={[
        {
          label: t("cancel", "Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("confirm", "Ghép nối"),
          primary: true,
          disabled: !selectedCase,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[480px] gap-3">
        {/* Branch Filter Header */}
        {branches && branches.length > 1 && (
          <div className="flex items-center gap-2 px-1 text-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {t("Chi nhánh:", "Chi nhánh:")}
            </span>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {branches.map((b: any) => (
                <option key={b.id || b.externalId} value={b.externalId || b.id}>
                  {b.name || b.branchName || b.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Garage Cases Table */}
        <div className="flex-1">
          <StandardTable<any>
            tableId="garage-case-selection-table"
            items={cases}
            columns={columns}
            getRowKey={(row) => row.id || row.VuViecCode}
            variant="spreadsheet"
            enableColumnResizing={true}
            loading={isLoading}
            page={page}
            pageSize={pageSize}
            total={data?.total || 0}
            totalPages={data?.totalPages || 0}
            onPage={setPage}
            onPageSize={setPageSize}
            minWidth={950}
            onRowClick={(row) => {
              const isExisting =
                existingCaseCodes.includes(row.VuViecCode) ||
                existingCaseCodes.includes(row.id);
              if (!isExisting) {
                handleSelect(row);
              }
            }}
          />
        </div>
      </div>
    </DrawerModal>
  );
}
