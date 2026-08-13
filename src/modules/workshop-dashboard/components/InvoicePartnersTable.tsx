import React from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Eye, Download, FileText, PanelRightOpen } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import type {
  DashboardDateParams,
  InvoicePartnerInfo,
} from "../api/workshopDashboardApi";
import { useWorkshopInvoicePartnersTable } from "../hooks/useWorkshopInvoicePartnersTable";

export interface InvoicePartnersTableProps {
  filterParams: DashboardDateParams & { search?: string };
  onOpenPartnerDetail?: (taxCode: string, partnerName: string) => void;
  onExportExcel?: () => void;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;
  externalSetPage?: (p: number) => void;
}

export function InvoicePartnersTable({
  filterParams,
  onOpenPartnerDetail,
  onExportExcel,
}: InvoicePartnersTableProps) {
  const { t } = useTranslation("dashboard");

  const hook = useWorkshopInvoicePartnersTable(filterParams, 1, 20);
  const {
    data,
    isLoading,
    isFetching,
    tableState,
    setPage,
    setPageSize,
    fetchOptions,
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

  const commonFetchProps = useMemo(
    () => ({
      fetchOptions,
      allFilters: tableState.columnFilters,
    }),
    [fetchOptions, tableState.columnFilters],
  );

  const totals = useMemo(() => {
    return {
      totalInAmount: items.reduce(
        (acc, r) => acc + (Number(r.totalInAmount) || 0),
        0,
      ),
      totalOutAmount: items.reduce(
        (acc, r) => acc + (Number(r.totalOutAmount) || 0),
        0,
      ),
      payableAmount: items.reduce(
        (acc, r) => acc + (Number(r.payableAmount) || 0),
        0,
      ),
      receivableAmount: items.reduce(
        (acc, r) => acc + (Number(r.receivableAmount) || 0),
        0,
      ),
    };
  }, [items]);

  const columns: DataTableColumn<InvoicePartnerInfo>[] = useMemo(
    () => [
      {
        key: "idx",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.idx")}
            align="center"
            sortState={"none"}
            onSortChange={() => {}}
            searchValue={""}
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
          />
        ),
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_row, idx) => <span>{idx}</span>,
      },
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
                groupLabel: t("invoice.partnersTable.groupLookup"),
                items: [
                  {
                    label: t("invoice.partnersTable.actionDetail"),
                    icon: <Eye className="w-3.5 h-3.5" />,
                    onClick: () =>
                      onOpenPartnerDetail?.(row.taxCode, row.partnerName),
                  },
                  {
                    label: t("invoice.partnersTable.actionExport"),
                    icon: <Download className="w-3.5 h-3.5" />,
                    onClick: () => onExportExcel?.(),
                  },
                ],
              },
              {
                groupLabel: t("invoice.partnersTable.groupAction"),
                items: [
                  {
                    label: t("invoice.partnersTable.actionViewInvoices"),
                    icon: <FileText className="w-3.5 h-3.5" />,
                    onClick: () =>
                      onOpenPartnerDetail?.(row.taxCode, row.partnerName),
                  },
                ],
              },
            ]}
          />
        ),
      },
      {
        key: "taxCode",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.taxCode")}
            align="center"
            sortState={getSortState("taxCode")}
            onSortChange={(st) => handleSortChange("taxCode", st)}
            searchValue={tableState.columnSearch["taxCode"] || ""}
            onSearchChange={(val) => handleSearchChange("taxCode", val)}
            selectedFilters={tableState.columnFilters["taxCode"] || []}
            onFilterChange={(vals) => handleFilterChange("taxCode", vals)}
            isActive={!!tableState.columnFilters["taxCode"]?.length}
            columnKey="taxCode"
            queryKeyPrefix={"workshop-invoice-options"}
            {...commonFetchProps}
          />
        ),
        size: 200,
        enableResizing: true,
        cell: (row) => (
          <div className="flex items-center gap-2 w-full">
            <TableText
              text={row.taxCode}
              enableCopy={true}
              tooltip={true}
              onDrawerClick={(e) => {
                e.stopPropagation();
                onOpenPartnerDetail?.(row.taxCode, row.partnerName);
              }}
            />
            {Number(row.receivableAmount || 0) > 0 &&
              Number(row.payableAmount || 0) === 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4 flex-shrink-0"
                >
                  {t("invoice.partnersTable.receivableAmount")}
                </Badge>
              )}
          </div>
        ),
      },
      {
        key: "partnerName",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.partnerName")}
            align="center"
            sortState={getSortState("partnerName")}
            onSortChange={(st) => handleSortChange("partnerName", st)}
            searchValue={tableState.columnSearch["partnerName"] || ""}
            onSearchChange={(val) => handleSearchChange("partnerName", val)}
            selectedFilters={tableState.columnFilters["partnerName"] || []}
            onFilterChange={(vals) => handleFilterChange("partnerName", vals)}
            isActive={!!tableState.columnFilters["partnerName"]?.length}
            columnKey="partnerName"
            queryKeyPrefix={"workshop-invoice-options"}
            {...commonFetchProps}
          />
        ),
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.partnerName}
            tooltip={true}
            onDrawerClick={(e) => {
              e.stopPropagation();
              onOpenPartnerDetail?.(row.taxCode, row.partnerName);
            }}
          />
        ),
      },
      {
        key: "totalInAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.totalInAmount")}
            align="center"
            sortState={getSortState("totalInAmount")}
            onSortChange={(st) => handleSortChange("totalInAmount", st)}
            searchValue={tableState.columnSearch["totalInAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalInAmount", val)}
            selectedFilters={tableState.columnFilters["totalInAmount"] || []}
            onFilterChange={(vals) => handleFilterChange("totalInAmount", vals)}
            isActive={!!tableState.columnFilters["totalInAmount"]?.length}
            columnKey="totalInAmount"
            queryKeyPrefix={"workshop-invoice-options"}
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right tabular-nums font-semibold",
        headerClassName: "text-center",
        cell: (row) => (
          <span className="text-orange-600">{money(row.totalInAmount)}</span>
        ),
      },
      {
        key: "totalOutAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.totalOutAmount")}
            align="center"
            sortState={getSortState("totalOutAmount")}
            onSortChange={(st) => handleSortChange("totalOutAmount", st)}
            searchValue={tableState.columnSearch["totalOutAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalOutAmount", val)}
            selectedFilters={tableState.columnFilters["totalOutAmount"] || []}
            onFilterChange={(vals) =>
              handleFilterChange("totalOutAmount", vals)
            }
            isActive={!!tableState.columnFilters["totalOutAmount"]?.length}
            columnKey="totalOutAmount"
            queryKeyPrefix={"workshop-invoice-options"}
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right tabular-nums font-semibold",
        headerClassName: "text-center",
        cell: (row) => (
          <span className="text-emerald-600">{money(row.totalOutAmount)}</span>
        ),
      },
      {
        key: "payableAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.payableAmount")}
            align="center"
            sortState={getSortState("payableAmount")}
            onSortChange={(st) => handleSortChange("payableAmount", st)}
            searchValue={tableState.columnSearch["payableAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("payableAmount", val)}
            selectedFilters={tableState.columnFilters["payableAmount"] || []}
            onFilterChange={(vals) => handleFilterChange("payableAmount", vals)}
            isActive={!!tableState.columnFilters["payableAmount"]?.length}
            columnKey="payableAmount"
            queryKeyPrefix={"workshop-invoice-options"}
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right tabular-nums font-semibold",
        headerClassName: "text-center",
        cell: (row) => {
          const val = Number(row.payableAmount) || 0;
          return (
            <span className={val > 0 ? "text-red-600" : "text-slate-500"}>
              {money(val)}
            </span>
          );
        },
      },
      {
        key: "receivableAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.partnersTable.receivableAmount")}
            align="center"
            sortState={getSortState("receivableAmount")}
            onSortChange={(st) => handleSortChange("receivableAmount", st)}
            searchValue={tableState.columnSearch["receivableAmount"] || ""}
            onSearchChange={(val) =>
              handleSearchChange("receivableAmount", val)
            }
            selectedFilters={tableState.columnFilters["receivableAmount"] || []}
            onFilterChange={(vals) =>
              handleFilterChange("receivableAmount", vals)
            }
            isActive={!!tableState.columnFilters["receivableAmount"]?.length}
            columnKey="receivableAmount"
            queryKeyPrefix={"workshop-invoice-options"}
            hideFilter={true}
            {...commonFetchProps}
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right tabular-nums font-semibold",
        headerClassName: "text-center",
        cell: (row) => {
          const val = Number(row.receivableAmount) || 0;
          return (
            <span className={val > 0 ? "text-blue-600" : "text-slate-500"}>
              {money(val)}
            </span>
          );
        },
      },
    ],

    [t, tableState, onOpenPartnerDetail, commonFetchProps, totals],
  );

  const summaryRow = useMemo(
    () => ({
      idx: null,
      actions: null,
      partnerName: (
        <div className="text-right font-semibold text-slate-700 w-full pr-4">
          {t("common.total")}:
        </div>
      ),
      totalInAmount: (
        <div className="text-right font-bold text-orange-600">
          {money(totals.totalInAmount)}
        </div>
      ),
      totalOutAmount: (
        <div className="text-right font-bold text-emerald-600">
          {money(totals.totalOutAmount)}
        </div>
      ),
      payableAmount: (
        <div className="text-right font-bold text-red-600">
          {money(totals.payableAmount)}
        </div>
      ),
      receivableAmount: (
        <div className="text-right font-bold text-blue-600">
          {money(totals.receivableAmount)}
        </div>
      ),
    }),

    [t, totals],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
          <PanelRightOpen className="w-4 h-4 text-slate-500" />
          {t("invoice.partnersTable.title")}
        </h3>
      </div>
      <StandardTable
        tableId="workshop-invoice-partners"
        variant="spreadsheet"
        minWidth={1200}
        enableColumnResizing={true}
        enableColumnVisibility={true}
        columns={columns}
        items={items}
        getRowKey={(row) => row.taxCode || row.partnerName}
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
    </div>
  );
}
