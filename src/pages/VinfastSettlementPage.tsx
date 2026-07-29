import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalSidebar,
  ErpInvoiceInternalMain,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import api from "@/core/api/axiosInstance";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  FileText,
  Eye,
  Loader2,
  RefreshCw,
  PanelRightOpen,
  Download,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";

interface VinfastSettlementRow {
  settlementOrder: string;
  period: string;
  licensePlate: string;
  invoiceCount: number;
  totalPreVat: number;
  totalVat: number;
  totalAmount: number;
  totalNetoff: number;
  remaining: number;
}

const CopyIconBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
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

function SettlementAmountPopoverContent({
  settlementOrder,
  period,
  onOpenInvoice,
}: {
  settlementOrder: string;
  period: string;
  onOpenInvoice?: (id: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["settlement-orders-details", settlementOrder, period],
    queryFn: async () => {
      const res = await api.get("/api/v1/reports/settlement-orders/details", {
        params: {
          settlementOrder,
          period,
        },
      });
      return res.data;
    },
  });

  const filteredData = data || [];

  return (
    <div className="p-3 min-w-[750px] w-max max-h-[400px] overflow-auto text-sm text-gray-800">
      {isLoading ? (
        <div className="flex justify-center items-center h-20 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center text-gray-500 p-2">Không có hóa đơn</div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-1.5 font-semibold text-center">Ngày HĐ</th>
              <th className="py-1.5 font-semibold text-center">Số HĐ</th>
              <th className="py-1.5 font-semibold text-center">Khách hàng</th>
              <th className="py-1.5 font-semibold text-center">Biển số</th>
              <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                Trước GTGT
              </th>
              <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                Thuế GTGT
              </th>
              <th className="py-1.5 font-semibold text-center">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row: any, i: number) => (
              <tr
                key={i}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                onClick={() => {
                  if (onOpenInvoice && row.invoiceId) {
                    onOpenInvoice(row.invoiceId);
                  }
                }}
              >
                <td className="py-1.5 whitespace-nowrap text-center">
                  {row.invoiceDate
                    ? format(new Date(row.invoiceDate), "dd-MM-yyyy")
                    : "—"}
                </td>
                <td className="py-1.5 whitespace-nowrap text-center">
                  {row.invoiceNo || "—"}
                </td>
                <td
                  className="py-1.5 truncate max-w-[150px]"
                  title={row.buyerName}
                >
                  {row.buyerName || "—"}
                </td>
                <td className="py-1.5 text-center">
                  <LicensePlate plate={row.licensePlate} />
                </td>
                <td className="py-1.5 text-right font-medium">
                  {money(row.preVatAmount)}
                </td>
                <td className="py-1.5 text-right font-medium">
                  {money(row.vatAmount)}
                </td>
                <td className="py-1.5 text-right font-medium text-emerald-700">
                  {money(row.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-300 bg-gray-50">
              <td
                colSpan={4}
                className="py-2 text-right font-semibold text-slate-700"
              >
                Tổng cộng:
              </td>
              <td className="py-2 text-right font-bold text-slate-700">
                {money(
                  filteredData.reduce(
                    (acc: number, cur: any) =>
                      acc + (Number(cur.preVatAmount) || 0),
                    0,
                  ),
                )}
              </td>
              <td className="py-2 text-right font-bold text-slate-700">
                {money(
                  filteredData.reduce(
                    (acc: number, cur: any) =>
                      acc + (Number(cur.vatAmount) || 0),
                    0,
                  ),
                )}
              </td>
              <td className="py-2 text-right font-bold text-slate-700">
                {money(
                  filteredData.reduce(
                    (acc: number, cur: any) =>
                      acc + (Number(cur.totalAmount) || 0),
                    0,
                  ),
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

function SettlementOrderDetailDrawer({
  open,
  onClose,
  settlementOrder,
  period,
  licensePlate,
  onOpenInvoice,
}: {
  open: boolean;
  onClose: () => void;
  settlementOrder: string;
  period: string;
  licensePlate: string;
  onOpenInvoice?: (id: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["settlement-orders-details", settlementOrder, period],
    enabled: open && !!settlementOrder && !!period,
    queryFn: async () => {
      const res = await api.get("/api/v1/reports/settlement-orders/details", {
        params: {
          settlementOrder,
          period,
        },
      });
      return res.data;
    },
  });

  const columns: DataTableColumn<any>[] = [
    {
      key: "invoiceDate",
      header: "Ngày HĐ",
      size: 100,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row) =>
        row.invoiceDate ? format(new Date(row.invoiceDate), "dd-MM-yyyy") : "—",
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      size: 100,
      headerClassName: "text-center",
      className: "text-muted-foreground text-center",
      cell: (row) => row.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: "Số HĐ",
      size: 100,
      headerClassName: "text-center",
      className: "text-center font-medium",
      cell: (row) => (
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => {
            if (onOpenInvoice && row.invoiceId) {
              onOpenInvoice(row.invoiceId);
            }
          }}
        >
          {row.invoiceNo || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      size: 120,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row) => {
        const s = row.status;
        if (s === "CONFIRMED")
          return (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
              Hoàn thành
            </Badge>
          );
        if (s === "CANCELLED")
          return <Badge variant="destructive">Đã hủy</Badge>;
        return <Badge variant="secondary">{s}</Badge>;
      },
    },
    {
      key: "buyerName",
      header: "Khách hàng",
      size: 200,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.buyerName || ""}>
          <div className="truncate max-w-[180px]">{row.buyerName || "—"}</div>
        </Tooltip>
      ),
    },
    {
      key: "buyerTaxCode",
      header: "MST",
      size: 120,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row) => row.buyerTaxCode || "—",
    },
    {
      key: "preVatAmount",
      header: "Trước GTGT",
      size: 120,
      headerClassName: "text-center",
      className: "text-right font-medium",
      cell: (row) => money(row.preVatAmount),
    },
    {
      key: "vatAmount",
      header: "VAT",
      size: 120,
      headerClassName: "text-center",
      className: "text-right font-medium",
      cell: (row) => money(row.vatAmount),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      size: 120,
      headerClassName: "text-center",
      className: "text-right font-medium text-emerald-700",
      cell: (row) => money(row.totalAmount),
    },
    {
      key: "netoffAmount",
      header: "Đã cấn trừ",
      size: 120,
      headerClassName: "text-center",
      className: "text-right font-medium text-amber-600",
      cell: (row) => money(row.netoffAmount),
    },
  ];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Chi tiết hóa đơn lệnh quyết toán"
      subtitle={`${settlementOrder || "—"} (Kỳ: ${period || "—"} • Biển số: ${licensePlate || "—"})`}
      icon={<FileText className="w-5 h-5 text-slate-600" />}
      panelClassName="w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]"
    >
      <div className="p-4 h-full flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            Danh sách hóa đơn
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {data?.length || 0}
            </span>
          </h3>
          <StandardTable
            tableId="vinfast-settlement-detail"
            variant="spreadsheet"
            minWidth={1000}
            enableColumnResizing={true}
            enableColumnVisibility={true}
            columns={columns}
            items={data || []}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(r) => r.invoiceId}
            summaryRow={{
              buyerName: (
                <div className="text-right font-semibold text-slate-700 w-full pr-4">
                  Tổng cộng:
                </div>
              ),
              preVatAmount: (
                <div className="text-right font-bold text-slate-700">
                  {money(
                    data?.reduce(
                      (acc: number, cur: any) =>
                        acc + (Number(cur.preVatAmount) || 0),
                      0,
                    ) || 0,
                  )}
                </div>
              ),
              vatAmount: (
                <div className="text-right font-bold text-slate-700">
                  {money(
                    data?.reduce(
                      (acc: number, cur: any) =>
                        acc + (Number(cur.vatAmount) || 0),
                      0,
                    ) || 0,
                  )}
                </div>
              ),
              totalAmount: (
                <div className="text-right font-bold text-emerald-700">
                  {money(
                    data?.reduce(
                      (acc: number, cur: any) =>
                        acc + (Number(cur.totalAmount) || 0),
                      0,
                    ) || 0,
                  )}
                </div>
              ),
            }}
          />
        </div>
      </div>
    </DrawerModal>
  );
}

const LicensePlate = ({ plate }: { plate: string }) => {
  if (!plate) return <>—</>;
  return (
    <div className="border border-slate-400 bg-white text-slate-800 font-bold px-1.5 py-[3px] rounded-md shadow-sm flex items-center justify-center w-[100px] mx-auto uppercase tracking-wide text-xs">
      {plate}
    </div>
  );
};

export function VinfastSettlementPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const formHook = useErpInvoiceForm(() => {});

  const [detailRow, setDetailRow] = useState<VinfastSettlementRow | null>(null);

  const tableState = useTableColumnState("vinfast-settlement-table");

  const activeSort = tableState.sorts[0] || "";
  let sortBy = "";
  let sortOrder = "";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "period";
    sortOrder = "desc";
  }

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

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
    }),
    [],
  );

  const filterProps = useFilterPanel(filterConfig, () => setPage(1));
  const { state: filterState } = filterProps;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      "vinfast-settlement-orders",
      page,
      pageSize,
      filterState.dateFrom,
      filterState.dateTo,
      filterState.search,
      sortBy,
      sortOrder,
      tableState.columnSearch,
      tableState.columnFilters,
    ],
    queryFn: async () => {
      const res = await api.get("/api/v1/reports/settlement-orders", {
        params: {
          page,
          limit: pageSize,
          dateFrom: filterState.dateFrom,
          dateTo: filterState.dateTo,
          search: filterState.search,
          sortBy,
          sortDir: sortOrder,
          columnSearch: JSON.stringify(tableState.columnSearch),
          columnFilters: JSON.stringify(tableState.columnFilters),
        },
      });
      return res.data;
    },
  });

  const commonFilterProps = useMemo(
    () => ({
      fetchOptions: async ({
        columnKey: colKey,
        search: searchTerm,
        pageParam,
        filtersStr,
      }: any) => {
        const res = await api.get(
          "/api/v1/reports/settlement-orders/column-options",
          {
            params: {
              columnKey: colKey,
              search: searchTerm,
              filters: filtersStr || JSON.stringify(tableState.columnFilters),
              page: pageParam,
              limit: 20,
            },
          },
        );
        return {
          items: res.data.items,
          total: res.data.total,
          next: res.data.page < res.data.totalPages ? res.data.page + 1 : null,
        };
      },
    }),
    [tableState.columnFilters],
  );
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const res = await api.get(
        "/api/v1/reports/settlement-orders/export/excel",
        {
          params: {
            search: filterState.search || undefined,
            dateFrom: filterState.dateFrom || undefined,
            dateTo: filterState.dateTo || undefined,
            sortBy:
              tableState.sorts.length > 0
                ? tableState.sorts[0].startsWith("-")
                  ? tableState.sorts[0].substring(1)
                  : tableState.sorts[0]
                : undefined,
            sortDir:
              tableState.sorts.length > 0
                ? tableState.sorts[0].startsWith("-")
                  ? "DESC"
                  : "ASC"
                : undefined,
            columnFilters: tableState.columnFilters
              ? JSON.stringify(tableState.columnFilters)
              : undefined,
          },
          responseType: "blob",
        },
      );

      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lenh_Quyet_Toan_XUONG_VF_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Có lỗi khi tải bảng kê");
    } finally {
      setExporting(false);
    }
  };

  const columns: DataTableColumn<VinfastSettlementRow>[] = [
    {
      key: "actions",
      header: "",
      size: 48,
      cell: (row) => (
        <ActionDropdown
          items={[
            {
              label: t("actionDetail", "Xem chi tiết"),
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => {
                setDetailRow(row);
              },
            },
          ]}
        />
      ),
    },
    {
      key: "period",
      header: (
        <TableColumnHeaderFilter
          title="Kỳ"
          sortState={getSortState("period")}
          onSortChange={(state) => handleSortChange("period", state)}
          searchValue={tableState.columnSearch["period"] || ""}
          onSearchChange={(val) => handleSearchChange("period", val)}
          selectedFilters={tableState.columnFilters["period"] || []}
          onFilterChange={(vals) => handleFilterChange("period", vals)}
          align="center"
          columnKey="period"
          hideFilter={true}
          hideFooter={true}
          isActive={!!(filterState.dateFrom || filterState.dateTo)}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={filterState.dateFrom}
              dateTo={filterState.dateTo}
              onChange={(from, to) => {
                filterProps.setDateFrom(from);
                filterProps.setDateTo(to);
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
      cell: (row) => row.period,
    },
    {
      key: "settlementOrder",
      header: (
        <TableColumnHeaderFilter
          title="Lệnh QT"
          sortState={getSortState("settlementOrder")}
          onSortChange={(state) => handleSortChange("settlementOrder", state)}
          searchValue={tableState.columnSearch["settlementOrder"] || ""}
          onSearchChange={(val) => handleSearchChange("settlementOrder", val)}
          selectedFilters={tableState.columnFilters["settlementOrder"] || []}
          onFilterChange={(vals) => handleFilterChange("settlementOrder", vals)}
          align="center"
          columnKey="settlementOrder"
          {...commonFilterProps}
        />
      ),
      size: 250,
      headerClassName: "text-center",
      cell: (row) => (
        <div className="group flex items-center justify-between w-full pr-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDetailRow(row);
              }}
              className="h-5 w-5 p-0 flex items-center justify-center rounded opacity-40 hover:opacity-100 hover:bg-slate-200 transition-all flex-shrink-0"
              title="Xem chi tiết"
            >
              <PanelRightOpen className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <span className="truncate text-slate-700">
              {row.settlementOrder}
            </span>
            <CopyIconBtn text={row.settlementOrder} />
          </div>
        </div>
      ),
    },
    {
      key: "licensePlate",
      header: (
        <TableColumnHeaderFilter
          title="Biển số xe"
          sortState={getSortState("licensePlate")}
          onSortChange={(state) => handleSortChange("licensePlate", state)}
          searchValue={tableState.columnSearch["licensePlate"] || ""}
          onSearchChange={(val) => handleSearchChange("licensePlate", val)}
          selectedFilters={tableState.columnFilters["licensePlate"] || []}
          onFilterChange={(vals) => handleFilterChange("licensePlate", vals)}
          align="center"
          columnKey="licensePlate"
          {...commonFilterProps}
        />
      ),
      size: 140,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row) => <LicensePlate plate={row.licensePlate} />,
    },
    {
      key: "invoiceCount",
      header: (
        <TableColumnHeaderFilter
          title="Số HĐ"
          sortState={getSortState("invoiceCount")}
          onSortChange={(state) => handleSortChange("invoiceCount", state)}
          searchValue={tableState.columnSearch["invoiceCount"] || ""}
          onSearchChange={(val) => handleSearchChange("invoiceCount", val)}
          selectedFilters={tableState.columnFilters["invoiceCount"] || []}
          onFilterChange={(vals) => handleFilterChange("invoiceCount", vals)}
          align="center"
          columnKey="invoiceCount"
          hideFilter={true}
        />
      ),
      size: 100,
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
          title="Trước GTGT"
          sortState={getSortState("totalPreVat")}
          onSortChange={(state) => handleSortChange("totalPreVat", state)}
          searchValue={tableState.columnSearch["totalPreVat"] || ""}
          onSearchChange={(val) => handleSearchChange("totalPreVat", val)}
          selectedFilters={tableState.columnFilters["totalPreVat"] || []}
          onFilterChange={(vals) => handleFilterChange("totalPreVat", vals)}
          align="center"
          columnKey="totalPreVat"
          hideFilter={true}
        />
      ),
      size: 140,
      headerClassName: "text-center",
      className: "text-right font-medium text-slate-700",
      cell: (row) => money(row.totalPreVat),
    },
    {
      key: "totalVat",
      header: (
        <TableColumnHeaderFilter
          title="Thuế GTGT"
          sortState={getSortState("totalVat")}
          onSortChange={(state) => handleSortChange("totalVat", state)}
          searchValue={tableState.columnSearch["totalVat"] || ""}
          onSearchChange={(val) => handleSearchChange("totalVat", val)}
          selectedFilters={tableState.columnFilters["totalVat"] || []}
          onFilterChange={(vals) => handleFilterChange("totalVat", vals)}
          align="center"
          columnKey="totalVat"
          hideFilter={true}
        />
      ),
      size: 140,
      headerClassName: "text-center",
      className: "text-right font-medium text-slate-700",
      cell: (row) => money(row.totalVat),
    },
    {
      key: "totalAmount",
      header: (
        <TableColumnHeaderFilter
          title="Thành tiền"
          sortState={getSortState("totalAmount")}
          onSortChange={(state) => handleSortChange("totalAmount", state)}
          searchValue={tableState.columnSearch["totalAmount"] || ""}
          onSearchChange={(val) => handleSearchChange("totalAmount", val)}
          selectedFilters={tableState.columnFilters["totalAmount"] || []}
          onFilterChange={(vals) => handleFilterChange("totalAmount", vals)}
          align="center"
          columnKey="totalAmount"
          hideFilter={true}
        />
      ),
      size: 140,
      headerClassName: "text-center",
      className: "text-right font-medium",
      cell: (row) => (
        <TableText
          text={money(row.totalAmount)}
          className="justify-end font-medium text-right"
          textClassName="text-emerald-700"
          popoverContent={
            <SettlementAmountPopoverContent
              settlementOrder={row.settlementOrder}
              period={row.period}
              onOpenInvoice={(id) => formHook.openInternal({ id } as any)}
            />
          }
        />
      ),
    },
    {
      key: "totalNetoff",
      header: (
        <TableColumnHeaderFilter
          title="Đã cấn trừ"
          sortState={getSortState("totalNetoff")}
          onSortChange={(state) => handleSortChange("totalNetoff", state)}
          searchValue={tableState.columnSearch["totalNetoff"] || ""}
          onSearchChange={(val) => handleSearchChange("totalNetoff", val)}
          selectedFilters={tableState.columnFilters["totalNetoff"] || []}
          onFilterChange={(vals) => handleFilterChange("totalNetoff", vals)}
          align="center"
          columnKey="totalNetoff"
          hideFilter={true}
        />
      ),
      size: 140,
      headerClassName: "text-right bg-blue-50/50 border-l border-blue-200",
      className: "text-right bg-blue-50/50 border-l border-blue-200",
      cell: (row) => {
        const netOff = parseFloat(row.totalNetoff as any) || 0;
        if (netOff === 0) return "--";
        return <span className="text-blue-600">{money(row.totalNetoff)}</span>;
      },
    },
    {
      key: "remaining",
      header: (
        <TableColumnHeaderFilter
          title="Còn lại"
          sortState={getSortState("remaining")}
          onSortChange={(state) => handleSortChange("remaining", state)}
          searchValue={tableState.columnSearch["remaining"] || ""}
          onSearchChange={(val) => handleSearchChange("remaining", val)}
          selectedFilters={tableState.columnFilters["remaining"] || []}
          onFilterChange={(vals) => handleFilterChange("remaining", vals)}
          align="center"
          columnKey="remaining"
          hideFilter={true}
        />
      ),
      size: 140,
      headerClassName: "text-center bg-blue-50/50",
      className: "text-right font-semibold bg-blue-50/50",
      cell: (row) => {
        const rem = Number(row.remaining) || 0;
        if (rem === 0) return <span className="text-emerald-600">0</span>;
        return <span className="text-slate-700">{money(rem)}</span>;
      },
    },
  ];

  const totalPreVatAll = useMemo(() => {
    return (
      data?.items?.reduce(
        (acc: number, row: VinfastSettlementRow) =>
          acc + (Number(row.totalPreVat) || 0),
        0,
      ) || 0
    );
  }, [data?.items]);

  const totalVatAll = useMemo(() => {
    return (
      data?.items?.reduce(
        (acc: number, row: VinfastSettlementRow) =>
          acc + (Number(row.totalVat) || 0),
        0,
      ) || 0
    );
  }, [data?.items]);

  const totalAmountAll = useMemo(() => {
    return (
      data?.items?.reduce(
        (acc: number, row: VinfastSettlementRow) =>
          acc + (Number(row.totalAmount) || 0),
        0,
      ) || 0
    );
  }, [data?.items]);

  const totalNetoffAll = useMemo(() => {
    return (
      data?.items?.reduce(
        (acc: number, row: VinfastSettlementRow) =>
          acc + (Number(row.totalNetoff) || 0),
        0,
      ) || 0
    );
  }, [data?.items]);

  const remainingAll = useMemo(() => {
    return (
      data?.items?.reduce(
        (acc: number, row: VinfastSettlementRow) =>
          acc + (Number(row.remaining) || 0),
        0,
      ) || 0
    );
  }, [data?.items]);

  const tableSummary = useMemo(() => {
    if (!data?.items?.length) return undefined;
    return {
      period: null,
      totalPreVat: (
        <span className="font-semibold">{money(totalPreVatAll)}</span>
      ),
      totalVat: <span className="font-semibold">{money(totalVatAll)}</span>,
      totalAmount: (
        <span className="font-semibold text-emerald-700">
          {money(totalAmountAll)}
        </span>
      ),
      totalNetoff: (
        <span className="font-semibold text-amber-600">
          {money(totalNetoffAll)}
        </span>
      ),
      remaining: (
        <span className="font-semibold text-red-600">
          {money(remainingAll)}
        </span>
      ),
    };
  }, [
    data?.items,
    totalPreVatAll,
    totalVatAll,
    totalAmountAll,
    totalNetoffAll,
    remainingAll,
  ]);

  return (
    <>
      <SpreadsheetPageTemplate
        title="Lệnh quyết toán xưởng Vinfast"
        icon={<FileText className="w-5 h-5 text-slate-600" />}
        tableId="vinfast-settlement-table"
        createActions={[
          {
            groupLabel: "TRA CỨU",
            items: [
              {
                label: "Tải bảng kê",
                icon: exporting ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-emerald-600" />
                ),
                onClick: handleExportExcel,
              },
            ],
          },
          {
            groupLabel: "THAO TÁC",
            items: [
              {
                label: "Làm mới dữ liệu",
                icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
                onClick: () => {
                  refetch();
                },
              },
            ],
          },
        ]}
        items={data?.items || []}
        columns={columns as any}
        summaryRow={tableSummary}
        getRowKey={(row: any) => `${row.settlementOrder}-${row.period}`}
        loading={isLoading || isFetching}
        emptyLabel="Chưa có dữ liệu"
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={Math.ceil((data?.total || 0) / pageSize) || 1}
        onPage={setPage}
        onPageSize={setPageSize}
        sortArray={tableState.sorts}
        onSort={(key) => {
          tableState.toggleSort(key);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        filterConfig={filterConfig}
        filter={filterProps}
        activeFilterCount={
          filterProps.activeFilterCount + (tableState.activeFilterCount || 0)
        }
        onClearAllFilters={() => {
          filterProps.resetAll();
          tableState.resetFilters();
          setPage(1);
        }}
      />

      <SettlementOrderDetailDrawer
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        settlementOrder={detailRow?.settlementOrder || ""}
        period={detailRow?.period || ""}
        licensePlate={detailRow?.licensePlate || ""}
        onOpenInvoice={(id) => formHook.openInternal({ id } as any)}
      />

      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        rightPanel={
          <div className="flex flex-col gap-5">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.detailInvoice?.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
              pdfSlot={
                <ErpInvoicePdfUpload
                  invoiceId={formHook.detailInvoice?.id ?? null}
                  pdfFiles={formHook.detailInvoice?.pdfFiles ?? null}
                  pdfFileKey={formHook.detailInvoice?.pdfFileKey ?? null}
                  editMode={formHook.editMode}
                />
              }
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <ErpInvoiceInternalMain
            form={formHook.form}
            editMode={formHook.editMode}
            fieldSet={(key: string, value: any) =>
              formHook.setForm((prev) => ({ ...prev, [key]: value }))
            }
            direction={formHook.detailInvoice?.direction || "IN"}
            detailInvoice={formHook.detailInvoice}
            postingState={formHook.postingState}
            pendingUnpost={formHook.pendingUnpost}
            onUnpost={() => formHook.setPendingUnpost(true)}
            onRefreshDetail={() => {
              if (formHook.detailInvoice?.id) {
                formHook.openInternal({ id: formHook.detailInvoice.id } as any);
              }
            }}
            invoicePreview={
              formHook.detailInvoice ? (
                <div className="flex justify-center bg-slate-100 p-8 min-h-full">
                  <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
                </div>
              ) : undefined
            }
          />
        </div>
      </ErpInvoiceInternalDrawer>
    </>
  );
}
