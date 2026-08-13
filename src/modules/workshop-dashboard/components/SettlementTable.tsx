import React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import {
  Eye,
  Download,
  RefreshCw,
  PanelRightOpen,
  Check,
  Copy,
  FileText,
} from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { DrawerModal } from "@/shared/components/DrawerModal";
import type {
  DashboardDateParams,
  SettlementRow,
} from "../api/workshopDashboardApi";
import { useWorkshopSettlementTable } from "../hooks/useWorkshopSettlementTable";
import api from "@/core/api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FilterButton } from "@/shared/components/FilterPanel";

export interface SettlementTableProps {
  filterParams: DashboardDateParams & { search?: string };
  onSetPeriod?: (from: string | undefined, to: string | undefined) => void;
  onOpenDetail?: (row: SettlementRow) => void;
  onExportExcel?: () => void;
  onRefresh?: () => void;
  extraActiveFilters?: number;
  onClearAllFilters?: () => void;
}

const LicensePlate = ({ plate }: { plate: string }) => {
  if (!plate) return <>—</>;
  return (
    <div className="border border-slate-400 bg-white text-slate-800 font-bold px-1.5 py-[3px] rounded-md shadow-sm flex items-center justify-center w-[100px] mx-auto uppercase tracking-wide text-xs">
      {plate}
    </div>
  );
};

const CopyIconBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);
  if (!text) return null;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded text-slate-500"
      title="Copy"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

function SettlementDetailDrawer({
  open,
  onClose,
  row,
  onOpenInvoice,
}: {
  open: boolean;
  onClose: () => void;
  row: SettlementRow | null;
  onOpenInvoice?: (id: string) => void;
}) {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useQuery({
    queryKey: ["settlement-orders-details", row?.settlementOrder, row?.period],
    enabled: open && !!row?.settlementOrder && !!row?.period,
    queryFn: async () => {
      const res = await api.get("/api/v1/reports/settlement-orders/details", {
        params: {
          settlementOrder: row!.settlementOrder,
          period: row!.period,
        },
      });
      return res.data as any[];
    },
  });

  const filtered = data || [];

  const cols: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "invoiceDate",
        header: t("invoice.partnersTable.lastInvoiceDate"),
        size: 110,
        headerClassName: "text-center",
        className: "text-center",
        cell: (r) =>
          r.invoiceDate ? format(new Date(r.invoiceDate), "dd-MM-yyyy") : "—",
      },
      {
        key: "serialNo",
        header: "Ký hiệu",
        size: 100,
        headerClassName: "text-center",
        className: "text-center text-muted-foreground",
        cell: (r) => r.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: "Số HĐ",
        size: 110,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (r) =>
          r.invoiceId ? (
            <span
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => onOpenInvoice?.(r.invoiceId)}
            >
              {r.invoiceNo || "—"}
            </span>
          ) : (
            r.invoiceNo || "—"
          ),
      },
      {
        key: "status",
        header: "Trạng thái",
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (r) => {
          const s = r.status;
          if (s === "CONFIRMED")
            return (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                Hoàn thành
              </Badge>
            );
          if (s === "CANCELLED")
            return <Badge variant="destructive">Đã hủy</Badge>;
          return <Badge variant="secondary">{s || "—"}</Badge>;
        },
      },
      {
        key: "buyerName",
        header: "Khách hàng",
        size: 200,
        headerClassName: "text-center",
        cell: (r) => (
          <div className="truncate max-w-[180px]" title={r.buyerName}>
            {r.buyerName || "—"}
          </div>
        ),
      },
      {
        key: "buyerTaxCode",
        header: "MST",
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (r) => r.buyerTaxCode || "—",
      },
      {
        key: "preVatAmount",
        header: "Trước GTGT",
        size: 130,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums",
        cell: (r) => money(r.preVatAmount),
      },
      {
        key: "vatAmount",
        header: "VAT",
        size: 130,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums",
        cell: (r) => money(r.vatAmount),
      },
      {
        key: "totalAmount",
        header: "Thành tiền",
        size: 130,
        headerClassName: "text-center",
        className: "text-right font-medium text-emerald-700 tabular-nums",
        cell: (r) => money(r.totalAmount),
      },
      {
        key: "netoffAmount",
        header: "Đã cấn trừ",
        size: 130,
        headerClassName: "text-center",
        className: "text-right font-medium text-amber-600 tabular-nums",
        cell: (r) => money(r.netoffAmount),
      },
    ],
    [t, onOpenInvoice],
  );

  const summaryTotals = useMemo(() => {
    return {
      preVatAmount: filtered.reduce(
        (a: number, c: any) => a + (Number(c.preVatAmount) || 0),
        0,
      ),
      vatAmount: filtered.reduce(
        (a: number, c: any) => a + (Number(c.vatAmount) || 0),
        0,
      ),
      totalAmount: filtered.reduce(
        (a: number, c: any) => a + (Number(c.totalAmount) || 0),
        0,
      ),
    };
  }, [filtered]);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Chi tiết hóa đơn lệnh quyết toán"
      subtitle={`${row?.settlementOrder || "—"} (Kỳ: ${row?.period || "—"} • Biển số: ${
        row?.licensePlate || "—"
      })`}
      icon={<FileText className="w-5 h-5 text-slate-600" />}
      panelClassName="w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]"
    >
      <div className="p-4 h-full flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            Danh sách hóa đơn
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {filtered.length}
            </span>
          </h3>
          <StandardTable
            tableId="vinfast-settlement-detail"
            variant="spreadsheet"
            minWidth={1000}
            enableColumnResizing={true}
            enableColumnVisibility={true}
            columns={cols}
            items={filtered}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(r: any) =>
              r.invoiceId || `${r.invoiceNo}-${r.serialNo}`
            }
            summaryRow={{
              buyerName: (
                <div className="text-right font-semibold text-slate-700 w-full pr-4">
                  {t("common.total")}:
                </div>
              ),
              preVatAmount: (
                <div className="text-right font-bold text-slate-700">
                  {money(summaryTotals.preVatAmount)}
                </div>
              ),
              vatAmount: (
                <div className="text-right font-bold text-slate-700">
                  {money(summaryTotals.vatAmount)}
                </div>
              ),
              totalAmount: (
                <div className="text-right font-bold text-emerald-700">
                  {money(summaryTotals.totalAmount)}
                </div>
              ),
            }}
            emptyLabel={t("common.noData")}
          />
        </div>
      </div>
    </DrawerModal>
  );
}

export function SettlementTable({
  filterParams,
  onSetPeriod,
  onOpenDetail,
  onExportExcel,
  onRefresh,
  extraActiveFilters = 0,
  onClearAllFilters,
}: SettlementTableProps) {
  const { t } = useTranslation("dashboard");
  const [detailRow, setDetailRow] = React.useState<SettlementRow | null>(null);

  const hook = useWorkshopSettlementTable(filterParams, 1, 50);
  const {
    data,
    isLoading,
    isFetching,
    tableState,
    setPage,
    setPageSize,
    fetchOptions,
    aggregateTotals,
    refetch,
  } = hook;
  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || Math.ceil(total / hook.pageSize) || 1;

  const getSortState = (key: string) => {
    if (tableState.sorts.includes(key)) return "asc";
    if (tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    tableState.setSort(key, state);
    setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    tableState.setColumnSearch(key, val);
    setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    tableState.setColumnFilter(key, vals);
    setPage(1);
  };

  const activeFilterCount =
    (tableState.activeFilterCount || 0) +
    (filterParams.dateFrom || filterParams.dateTo ? 1 : 0) +
    extraActiveFilters;

  const commonFetchProps = useMemo(
    () => ({
      fetchOptions,
      allFilters: tableState.columnFilters,
    }),
    [fetchOptions, tableState.columnFilters],
  );

  const columns: DataTableColumn<SettlementRow>[] = useMemo(
    () => [
      {
        key: "actions",
        header: "",
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                groupLabel: t("settlement.table.groupLookup"),
                items: [
                  {
                    label: t("settlement.table.actionDetail"),
                    icon: <Eye className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setDetailRow(row);
                      onOpenDetail?.(row);
                    },
                  },
                ],
              },
              {
                groupLabel: t("settlement.table.groupAction"),
                items: [
                  {
                    label: t("settlement.table.actionExport"),
                    icon: <Download className="w-3.5 h-3.5" />,
                    onClick: () => onExportExcel?.(),
                  },
                  {
                    label: t("settlement.table.actionRefresh"),
                    icon: <RefreshCw className="w-3.5 h-3.5" />,
                    onClick: () => {
                      void refetch();
                      onRefresh?.();
                    },
                  },
                ],
              },
            ]}
          />
        ),
      },
      {
        key: "period",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.period")}
            sortState={getSortState("period")}
            onSortChange={(st) => handleSortChange("period", st)}
            searchValue={tableState.columnSearch["period"] || ""}
            onSearchChange={(val) => handleSearchChange("period", val)}
            selectedFilters={tableState.columnFilters["period"] || []}
            onFilterChange={(vals) => handleFilterChange("period", vals)}
            align="center"
            columnKey="period"
            hideFilter={true}
            hideFooter={true}
            isActive={!!(filterParams.dateFrom || filterParams.dateTo)}
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={filterParams.dateFrom ?? ""}
                dateTo={filterParams.dateTo ?? ""}
                onChange={(from, to) => {
                  onSetPeriod?.(from, to);
                  setPage(1);
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 100,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row) => row.period || "—",
      },
      {
        key: "settlementOrder",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.settlementOrder")}
            sortState={getSortState("settlementOrder")}
            onSortChange={(st) => handleSortChange("settlementOrder", st)}
            searchValue={tableState.columnSearch["settlementOrder"] || ""}
            onSearchChange={(val) => handleSearchChange("settlementOrder", val)}
            selectedFilters={tableState.columnFilters["settlementOrder"] || []}
            onFilterChange={(vals) =>
              handleFilterChange("settlementOrder", vals)
            }
            align="center"
            columnKey="settlementOrder"
            queryKeyPrefix={"workshop-settlement-options"}
            {...commonFetchProps}
          />
        ),
        size: 260,
        enableResizing: true,
        cell: (row) => (
          <div className="group flex items-center justify-between w-full pr-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailRow(row);
                  onOpenDetail?.(row);
                }}
                className="h-5 w-5 p-0 flex items-center justify-center rounded opacity-40 hover:opacity-100 hover:bg-slate-200 transition-all flex-shrink-0"
                title={t("settlement.table.actionDetail")}
              >
                <PanelRightOpen className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <TableText
                text={row.settlementOrder}
                tooltip={true}
                className="justify-start"
                onDrawerClick={(e) => {
                  e.stopPropagation();
                  setDetailRow(row);
                  onOpenDetail?.(row);
                }}
              />
              <CopyIconBtn text={row.settlementOrder} />
            </div>
          </div>
        ),
      },
      {
        key: "licensePlate",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.licensePlate")}
            sortState={getSortState("licensePlate")}
            onSortChange={(st) => handleSortChange("licensePlate", st)}
            searchValue={tableState.columnSearch["licensePlate"] || ""}
            onSearchChange={(val) => handleSearchChange("licensePlate", val)}
            selectedFilters={tableState.columnFilters["licensePlate"] || []}
            onFilterChange={(vals) => handleFilterChange("licensePlate", vals)}
            align="center"
            columnKey="licensePlate"
            queryKeyPrefix={"workshop-settlement-options"}
            {...commonFetchProps}
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row) => <LicensePlate plate={row.licensePlate} />,
      },
      {
        key: "invoiceCount",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.invoiceCount")}
            sortState={getSortState("invoiceCount")}
            onSortChange={(st) => handleSortChange("invoiceCount", st)}
            searchValue={tableState.columnSearch["invoiceCount"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceCount", val)}
            selectedFilters={tableState.columnFilters["invoiceCount"] || []}
            onFilterChange={(vals) => handleFilterChange("invoiceCount", vals)}
            align="center"
            columnKey="invoiceCount"
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 100,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row) => (
          <Badge variant="secondary" className="px-2">
            {row.invoiceCount || 0}
          </Badge>
        ),
      },
      {
        key: "totalPreVat",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.totalPreVat")}
            sortState={getSortState("totalPreVat")}
            onSortChange={(st) => handleSortChange("totalPreVat", st)}
            searchValue={tableState.columnSearch["totalPreVat"] || ""}
            onSearchChange={(val) => handleSearchChange("totalPreVat", val)}
            selectedFilters={tableState.columnFilters["totalPreVat"] || []}
            onFilterChange={(vals) => handleFilterChange("totalPreVat", vals)}
            align="center"
            columnKey="totalPreVat"
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium text-slate-700 tabular-nums",
        cell: (row) => money(row.totalPreVat),
      },
      {
        key: "totalVat",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.totalVat")}
            sortState={getSortState("totalVat")}
            onSortChange={(st) => handleSortChange("totalVat", st)}
            searchValue={tableState.columnSearch["totalVat"] || ""}
            onSearchChange={(val) => handleSearchChange("totalVat", val)}
            selectedFilters={tableState.columnFilters["totalVat"] || []}
            onFilterChange={(vals) => handleFilterChange("totalVat", vals)}
            align="center"
            columnKey="totalVat"
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium text-slate-700 tabular-nums",
        cell: (row) => money(row.totalVat),
      },
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.totalAmount")}
            sortState={getSortState("totalAmount")}
            onSortChange={(st) => handleSortChange("totalAmount", st)}
            searchValue={tableState.columnSearch["totalAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalAmount", val)}
            selectedFilters={tableState.columnFilters["totalAmount"] || []}
            onFilterChange={(vals) => handleFilterChange("totalAmount", vals)}
            align="center"
            columnKey="totalAmount"
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums",
        cell: (row) => (
          <span className="text-emerald-700">{money(row.totalAmount)}</span>
        ),
      },
      {
        key: "totalNetoff",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.totalNetoff")}
            sortState={getSortState("totalNetoff")}
            onSortChange={(st) => handleSortChange("totalNetoff", st)}
            searchValue={tableState.columnSearch["totalNetoff"] || ""}
            onSearchChange={(val) => handleSearchChange("totalNetoff", val)}
            selectedFilters={tableState.columnFilters["totalNetoff"] || []}
            onFilterChange={(vals) => handleFilterChange("totalNetoff", vals)}
            align="center"
            columnKey="totalNetoff"
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-right bg-blue-50/50 border-l border-blue-200",
        className:
          "text-right bg-blue-50/50 border-l border-blue-200 font-medium tabular-nums",
        cell: (row) => {
          const net = parseFloat(row.totalNetoff as any) || 0;
          if (net === 0) return "--";
          return <span className="text-blue-600">{money(net)}</span>;
        },
      },
      {
        key: "remaining",
        header: (
          <TableColumnHeaderFilter
            title={t("settlement.table.remaining")}
            sortState={getSortState("remaining")}
            onSortChange={(st) => handleSortChange("remaining", st)}
            searchValue={tableState.columnSearch["remaining"] || ""}
            onSearchChange={(val) => handleSearchChange("remaining", val)}
            selectedFilters={tableState.columnFilters["remaining"] || []}
            onFilterChange={(vals) => handleFilterChange("remaining", vals)}
            align="center"
            columnKey="remaining"
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center bg-blue-50/50",
        className: "text-right font-semibold bg-blue-50/50 tabular-nums",
        cell: (row) => {
          const rem = Number(row.remaining) || 0;
          if (rem === 0) return <span className="text-emerald-600">0</span>;
          return <span className="text-slate-700">{money(rem)}</span>;
        },
      },
    ],

    [t, tableState, commonFetchProps, aggregateTotals, filterParams],
  );

  const summaryRow = useMemo(
    () => ({
      actions: null,
      period: null,
      settlementOrder: (
        <span className="font-semibold text-right block pr-4">
          {t("common.total")}:
        </span>
      ),
      totalPreVat: (
        <span className="font-semibold text-right block">
          {money(aggregateTotals.totalPreVat)}
        </span>
      ),
      totalVat: (
        <span className="font-semibold text-right block">
          {money(aggregateTotals.totalVat)}
        </span>
      ),
      totalAmount: (
        <span className="font-semibold text-emerald-700 text-right block">
          {money(aggregateTotals.totalAmount)}
        </span>
      ),
      totalNetoff: (
        <span className="font-semibold text-amber-600 text-right block">
          {money(aggregateTotals.totalNetoff)}
        </span>
      ),
      remaining: (
        <span className="font-semibold text-red-600 text-right block">
          {money(aggregateTotals.remaining)}
        </span>
      ),
    }),

    [t, aggregateTotals],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
          <PanelRightOpen className="w-4 h-4 text-slate-500" />
          {t("settlement.table.title")}
        </h3>
        {activeFilterCount > 0 && (
          <FilterButton
            activeCount={activeFilterCount}
            onClick={() => {
              tableState.resetFilters();
              onClearAllFilters?.();
              setPage(1);
            }}
          />
        )}
      </div>
      <StandardTable
        tableId="workshop-settlement-table"
        variant="spreadsheet"
        minWidth={1400}
        enableColumnResizing={true}
        enableColumnVisibility={true}
        columns={columns}
        items={items}
        getRowKey={(row) => `${row.settlementOrder}-${row.period}`}
        total={total}
        totalPages={totalPages}
        page={hook.page}
        pageSize={hook.pageSize}
        onPage={setPage}
        onPageSize={setPageSize}
        loading={isLoading || isFetching}
        summaryRow={summaryRow}
        emptyLabel={t("common.noData")}
        sortArray={tableState.sorts}
        onSort={(key) => {
          tableState.toggleSort(key);
          setPage(1);
        }}
      />

      <SettlementDetailDrawer
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        row={detailRow}
      />
    </div>
  );
}
