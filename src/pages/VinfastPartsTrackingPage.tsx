import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import api from "@/core/api/axiosInstance";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useCallback } from "react";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  FileText,
  Eye,
  Download,
  Info,
  Loader2,
  RefreshCw,
  PanelRightOpen,
  Copy,
  Check,
} from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { Popover } from "@/core/components/ui/Popover";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  ErpInvoiceInternalSidebar,
  ErpInvoiceInternalMain,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";

import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";

interface VinfastPartTrackingRow {
  itemCode: string;
  itemName: string;
  vehicleType: "CAR" | "MOTORBIKE";
  month: string;
  qtyBought: number;
  qtySold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  margin: number;
  marginPct: string;
  buyInvoiceIds: string[];
  sellInvoiceIds: string[];
}

function getVehicleTypeLabel(vehicleType: "CAR" | "MOTORBIKE") {
  return vehicleType === "CAR" ? "Ô tô" : "Xe máy";
}

function getVehicleTypeBadgeClass(vehicleType: "CAR" | "MOTORBIKE") {
  return vehicleType === "CAR"
    ? "w-[80px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
    : "w-[80px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
}

const CopyIconBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
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

function VinfastPartDetailDrawer({
  open,
  onClose,
  itemCode,
  itemName,
  month,
  onOpenInvoice,
}: {
  open: boolean;
  onClose: () => void;
  itemCode: string;
  itemName: string;
  month: string;
  onOpenInvoice?: (id: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["vinfast-parts-details", itemCode, month],
    enabled: open && !!itemCode && !!month,
    queryFn: async () => {
      const dateFrom = `${month}-01`;
      // Calculate end of month (e.g. 2026-03-31)
      const [y, m] = month.split("-");
      const d = new Date(parseInt(y), parseInt(m), 0).getDate();
      const dateTo = `${month}-${d}`;

      const res = await api.get("/api/v1/reports/vinfast-parts/details", {
        params: {
          dateFrom,
          dateTo,
          itemCode,
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
      cell: (row) =>
        row.invoiceDate ? format(new Date(row.invoiceDate), "dd-MM-yyyy") : "—",
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      size: 120,
      headerClassName: "text-center",
      className: "text-muted-foreground text-left",
      cell: (row) => row.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: "Số HĐ",
      size: 100,
      headerClassName: "text-center",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {onOpenInvoice && row.invoiceId ? (
              <Button
                variant="link"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInvoice(row.invoiceId);
                }}
                className="font-medium text-primary hover:underline p-0 h-auto"
              >
                {row.invoiceNo || "—"}
              </Button>
            ) : (
              <span className="font-medium text-primary">
                {row.invoiceNo || "—"}
              </span>
            )}
            {row.status && row.status !== "CONFIRMED" && (
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                  row.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {row.status === "CANCELLED" ? "Đã hủy" : "Nháp"}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "partnerName",
      header: "Đối tác",
      size: 200,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.partnerName || ""}>
          <div
            className="whitespace-normal break-words w-full truncate max-w-[200px]"
            title={row.partnerName || ""}
          >
            {row.partnerName || "—"}
          </div>
        </Tooltip>
      ),
    },
    {
      key: "taxCode",
      header: "MST",
      size: 120,
      headerClassName: "text-center",
      className: "text-muted-foreground text-xs text-left",
      cell: (row) => row.taxCode || "—",
    },
    {
      key: "description",
      header: "Diễn giải",
      size: 250,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.description || ""}>
          <div
            className="whitespace-normal break-words w-full truncate max-w-[250px]"
            title={row.description || ""}
          >
            {row.description || "—"}
          </div>
        </Tooltip>
      ),
    },
    { key: "unit", header: "ĐVT", size: 80, headerClassName: "text-center" },
    {
      key: "qty",
      header: "Số lượng",
      size: 100,
      headerClassName: "text-center",
      className: "text-right font-medium",
      cell: (row) =>
        Number(row.qty).toLocaleString("vi-VN", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
    },
    {
      key: "unitPrice",
      header: "Đơn giá",
      size: 120,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => money(row.unitPrice),
    },
    {
      key: "preVatAmount",
      header: "Trước GTGT",
      size: 120,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => money(row.preVatAmount),
    },
    {
      key: "vatRate",
      header: "Thuế suất",
      size: 80,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) =>
        row.vatRate != null
          ? `${(Number(row.vatRate) * 100).toFixed(0)}%`
          : "—",
    },
    {
      key: "vatAmount",
      header: "Thuế GTGT",
      size: 120,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => money(row.vatAmount),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      size: 140,
      headerClassName: "text-center",
      className: "text-right font-medium text-emerald-700",
      cell: (row) => money(row.totalAmount),
    },
  ];

  const buyData = useMemo(
    () =>
      data
        ?.filter((r: any) => r.direction === "IN")
        .map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.invoiceNo}-${r.direction}-${i}`,
        })) || [],
    [data],
  );
  const sellData = useMemo(
    () =>
      data
        ?.filter((r: any) => r.direction === "OUT")
        .map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.invoiceNo}-${r.direction}-${i}`,
        })) || [],
    [data],
  );

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Chi tiết mã phụ tùng"
      subtitle={`${itemCode} - ${itemName}`}
      icon={<Info className="w-5 h-5 text-blue-600" />}
      panelClassName="w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]"
    >
      <div className="p-4 h-full flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            Hóa đơn Mua vào
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {buyData.length}
            </span>
          </h3>
          <StandardTable
            tableId="vinfast-parts-detail-in"
            variant="spreadsheet"
            minWidth={1000}
            enableColumnResizing={true}
            enableColumnVisibility={true}
            columns={columns as any}
            items={buyData}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(row: any) => row._rowKey}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            Hóa đơn Bán ra
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {sellData.length}
            </span>
          </h3>
          <StandardTable
            tableId="vinfast-parts-detail-out"
            variant="spreadsheet"
            minWidth={1000}
            enableColumnResizing={true}
            enableColumnVisibility={true}
            columns={columns as any}
            items={sellData}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(row: any) => row._rowKey}
          />
        </div>
      </div>
    </DrawerModal>
  );
}

function PriceWithInvoicePopover({
  price,
  itemCode,
  month,
  direction,
  onOpenInvoice,
}: {
  price: number;
  itemCode: string;
  month: string;
  direction: "IN" | "OUT";
  onOpenInvoice?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["vinfast-parts-details", itemCode, month],
    enabled: open && !!itemCode && !!month,
    queryFn: async () => {
      const dateFrom = `${month}-01`;
      const [y, m] = month.split("-");
      const d = new Date(parseInt(y), parseInt(m), 0).getDate();
      const dateTo = `${month}-${d}`;

      const res = await api.get("/api/v1/reports/vinfast-parts/details", {
        params: {
          dateFrom,
          dateTo,
          itemCode,
        },
      });
      return res.data;
    },
  });

  const filteredData =
    data?.filter((r: any) => r.direction === direction) || [];

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="center"
      glass
      content={
        <div className="p-3 min-w-[700px] w-max max-h-[400px] overflow-auto text-sm text-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center h-20 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center text-gray-500 p-2">
              Không có hóa đơn
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 font-semibold text-center">Ngày HĐ</th>
                  <th className="py-1.5 font-semibold text-center">Số HĐ</th>
                  <th className="py-1.5 font-semibold text-center">Đối tác</th>
                  <th className="py-1.5 font-semibold text-center">Số lượng</th>
                  <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                    Trước thuế GTGT
                  </th>
                  <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                    Thuế suất
                  </th>
                  <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                    Thuế GTGT
                  </th>
                  <th className="py-1.5 font-semibold text-center">
                    Thành tiền
                  </th>
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
                        setOpen(false);
                      }
                    }}
                  >
                    <td className="py-1.5 whitespace-nowrap">
                      {row.invoiceDate}
                    </td>
                    <td className="py-1.5 whitespace-nowrap">
                      {row.invoiceNo}
                    </td>
                    <td
                      className="py-1.5 truncate max-w-[150px]"
                      title={row.partnerName}
                    >
                      {row.partnerName || "—"}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {Number(row.qty).toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {money(row.preVatAmount)}
                    </td>
                    <td className="py-1.5 text-right">
                      {row.vatRate != null
                        ? `${Number(row.vatRate) * 100}%`
                        : "—"}
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
                    colSpan={3}
                    className="py-2 text-right font-semibold text-slate-700"
                  >
                    Tổng cộng:
                  </td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {filteredData
                      .reduce(
                        (acc: number, cur: any) => acc + (Number(cur.qty) || 0),
                        0,
                      )
                      .toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
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
                  <td></td>
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
      }
    >
      <span className="cursor-pointer font-medium text-slate-700 underline decoration-dotted decoration-slate-400 hover:text-slate-900">
        {money(price)}
      </span>
    </Popover>
  );
}

export function VinfastPartsTrackingPage({
  vehicleType,
}: {
  vehicleType?: "CAR" | "MOTORBIKE";
}) {
  const { t } = useTranslation("erpInvoices");
  const formHook = useErpInvoiceForm(() => {});
  const showToast = useUIStore((s) => s.showToast);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [detailRow, setDetailRow] = useState<VinfastPartTrackingRow | null>(
    null,
  );

  const tableState = useTableColumnState(
    `vinfast-parts-table-${vehicleType || "all"}`,
  );

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
    sortBy = "month";
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

  const fetchColumnOptions = useCallback(
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
      const parsedFilters = filtersStr ? JSON.parse(filtersStr) : {};
      if (vehicleType) {
        parsedFilters["vehicleType"] = [vehicleType];
      }
      const res = await api.get(
        "/api/v1/reports/vinfast-parts/column-options",
        {
          params: {
            columnKey,
            search,
            page: pageParam,
            limit: 20,
            filters: JSON.stringify(parsedFilters),
          },
        },
      );
      return {
        items: res.data.items,
        total: res.data.total,
        next: res.data.page < res.data.totalPages ? res.data.page + 1 : null,
      };
    },
    [vehicleType],
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
    }),
    [],
  );

  const filterProps = useFilterPanel(filterConfig, () => setPage(1));
  const { state: filterState } = filterProps;

  const commonFilterProps = useMemo(
    () => ({
      enableSelectAllMatching: true,
      requireSearchToFetchOptions: false,
      queryKeyPrefix: `vinfast-parts-options-${vehicleType || "all"}`,
      allFilters: tableState.columnFilters,
      fetchOptions: fetchColumnOptions,
    }),
    [tableState.columnFilters, fetchColumnOptions, vehicleType],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "vinfast-parts",
      vehicleType || "all",
      page,
      pageSize,
      sortBy,
      sortOrder,
      filterState.dateFrom,
      filterState.dateTo,
      filterState.search,
      tableState.columnSearch,
      tableState.columnFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (filterState.search) params.append("search", filterState.search);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortDir", sortOrder);
      if (tableState.sorts.length > 0)
        params.append("sorts", JSON.stringify(tableState.sorts));
      if (Object.keys(tableState.columnSearch).length > 0)
        params.append("column_search", JSON.stringify(tableState.columnSearch));

      // Inject vehicleType filter if provided
      const finalColumnFilters = { ...tableState.columnFilters };
      if (vehicleType) {
        finalColumnFilters["vehicleType"] = [vehicleType];
      }
      if (Object.keys(finalColumnFilters).length > 0)
        params.append("column_filters", JSON.stringify(finalColumnFilters));
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      const res = await api.get(`/api/v1/reports/vinfast-parts?${params}`);
      return res.data as { data: VinfastPartTrackingRow[]; total: number };
    },
  });

  const summaryRow = useMemo(() => {
    if (!data?.data || data.data.length === 0) return undefined;

    const totalQtyBought = data.data.reduce(
      (acc, curr) => acc + (Number(curr.qtyBought) || 0),
      0,
    );
    const totalQtySold = data.data.reduce(
      (acc, curr) => acc + (Number(curr.qtySold) || 0),
      0,
    );
    const totalMargin = data.data.reduce(
      (acc, curr) => acc + (Number(curr.margin) || 0),
      0,
    );
    const totalAvgBuyPrice = data.data.reduce(
      (acc, curr) => acc + (Number(curr.avgBuyPrice) || 0),
      0,
    );
    const totalAvgSellPrice = data.data.reduce(
      (acc, curr) => acc + (Number(curr.avgSellPrice) || 0),
      0,
    );

    return {
      qtyBought: (
        <span className="font-semibold text-slate-700">
          {totalQtyBought.toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
      qtySold: (
        <span className="font-semibold text-slate-700">
          {totalQtySold.toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
      avgBuyPrice: (
        <span className="font-semibold text-slate-700">
          {money(totalAvgBuyPrice)}
        </span>
      ),
      avgSellPrice: (
        <span className="font-semibold text-slate-700">
          {money(totalAvgSellPrice)}
        </span>
      ),
      margin: (
        <span className="font-semibold text-slate-700">
          {money(totalMargin)}
        </span>
      ),
    };
  }, [data]);

  const columns: DataTableColumn<VinfastPartTrackingRow>[] = [
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
      key: "month",
      header: (
        <TableColumnHeaderFilter
          title="Tháng"
          sortState={getSortState("month")}
          onSortChange={(state) => handleSortChange("month", state)}
          searchValue={tableState.columnSearch["month"] || ""}
          onSearchChange={(val) => handleSearchChange("month", val)}
          selectedFilters={tableState.columnFilters["month"] || []}
          onFilterChange={(vals) => handleFilterChange("month", vals)}
          align="center"
          columnKey="month"
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
      className: "text-right",
      cell: (row) => row.month,
    },
    {
      key: "itemCode",
      header: (
        <TableColumnHeaderFilter
          title="Mã phụ tùng"
          sortState={getSortState("itemCode")}
          onSortChange={(state) => handleSortChange("itemCode", state)}
          searchValue={tableState.columnSearch["itemCode"] || ""}
          onSearchChange={(val) => handleSearchChange("itemCode", val)}
          selectedFilters={tableState.columnFilters["itemCode"] || []}
          onFilterChange={(vals) => handleFilterChange("itemCode", vals)}
          align="center"
          columnKey="itemCode"
          {...commonFilterProps}
        />
      ),
      size: 200,
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
            <span className="truncate text-slate-700">{row.itemCode}</span>
            <CopyIconBtn text={row.itemCode} />
          </div>
        </div>
      ),
    },
    {
      key: "itemName",
      header: (
        <TableColumnHeaderFilter
          title="Tên phụ tùng"
          sortState={getSortState("itemName")}
          onSortChange={(state) => handleSortChange("itemName", state)}
          searchValue={tableState.columnSearch["itemName"] || ""}
          onSearchChange={(val) => handleSearchChange("itemName", val)}
          selectedFilters={tableState.columnFilters["itemName"] || []}
          onFilterChange={(vals) => handleFilterChange("itemName", vals)}
          align="center"
          columnKey="itemName"
          {...commonFilterProps}
        />
      ),
      size: 250,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.itemName || ""}>
          <div
            className="whitespace-normal break-words w-full truncate max-w-[200px]"
            title={row.itemName || ""}
          >
            {row.itemName}
          </div>
        </Tooltip>
      ),
    },
    {
      key: "vehicleType",
      header: (
        <TableColumnHeaderFilter
          title="Loại xe"
          sortState={getSortState("vehicleType")}
          onSortChange={(state) => handleSortChange("vehicleType", state)}
          searchValue={tableState.columnSearch["vehicleType"] || ""}
          onSearchChange={(val) => handleSearchChange("vehicleType", val)}
          selectedFilters={tableState.columnFilters["vehicleType"] || []}
          onFilterChange={(vals) => handleFilterChange("vehicleType", vals)}
          align="center"
          columnKey="vehicleType"
          {...commonFilterProps}
          formatOptionLabel={(label) =>
            label === "CAR" ? "Ô tô" : label === "MOTORBIKE" ? "Xe máy" : label
          }
        />
      ),
      size: 120,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row) => (
        <Tooltip content={getVehicleTypeLabel(row.vehicleType)}>
          <Badge
            variant="ghost"
            className={`border ${getVehicleTypeBadgeClass(row.vehicleType)}`}
          >
            <span className="truncate block max-w-full">
              {getVehicleTypeLabel(row.vehicleType)}
            </span>
          </Badge>
        </Tooltip>
      ),
    },

    {
      key: "qtyBought",
      header: (
        <TableColumnHeaderFilter
          title="SL Mua (VINFAST)"
          sortState={getSortState("qtyBought")}
          onSortChange={(state) => handleSortChange("qtyBought", state)}
          searchValue={tableState.columnSearch["qtyBought"] || ""}
          onSearchChange={(val) => handleSearchChange("qtyBought", val)}
          selectedFilters={tableState.columnFilters["qtyBought"] || []}
          onFilterChange={(vals) => handleFilterChange("qtyBought", vals)}
          align="center"
          columnKey="qtyBought"
          {...commonFilterProps}
          formatOptionLabel={(label) => {
            const num = Number(label);
            return isNaN(num)
              ? label
              : num.toLocaleString("vi-VN", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                });
          }}
        />
      ),
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {Number(row.qtyBought).toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
    },
    {
      key: "avgBuyPrice",
      header: (
        <TableColumnHeaderFilter
          title="Giá mua TB"
          sortState={getSortState("avgBuyPrice")}
          onSortChange={(state) => handleSortChange("avgBuyPrice", state)}
          searchValue={tableState.columnSearch["avgBuyPrice"] || ""}
          onSearchChange={(val) => handleSearchChange("avgBuyPrice", val)}
          selectedFilters={tableState.columnFilters["avgBuyPrice"] || []}
          onFilterChange={(vals) => handleFilterChange("avgBuyPrice", vals)}
          align="center"
          columnKey="avgBuyPrice"
          {...commonFilterProps}
          formatOptionLabel={(label) => {
            const num = Number(label);
            return isNaN(num) ? label : money(num);
          }}
        />
      ),
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => (
        <PriceWithInvoicePopover
          price={row.avgBuyPrice}
          itemCode={row.itemCode}
          month={row.month}
          direction="IN"
          onOpenInvoice={(id) => formHook.openDetail({ id } as any)}
        />
      ),
    },
    {
      key: "qtySold",
      header: (
        <TableColumnHeaderFilter
          title="SL Bán ra"
          sortState={getSortState("qtySold")}
          onSortChange={(state) => handleSortChange("qtySold", state)}
          searchValue={tableState.columnSearch["qtySold"] || ""}
          onSearchChange={(val) => handleSearchChange("qtySold", val)}
          selectedFilters={tableState.columnFilters["qtySold"] || []}
          onFilterChange={(vals) => handleFilterChange("qtySold", vals)}
          align="center"
          columnKey="qtySold"
          {...commonFilterProps}
          formatOptionLabel={(label) => {
            const num = Number(label);
            return isNaN(num)
              ? label
              : num.toLocaleString("vi-VN", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                });
          }}
        />
      ),
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {Number(row.qtySold).toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
    },
    {
      key: "avgSellPrice",
      header: (
        <TableColumnHeaderFilter
          title="Giá bán TB"
          sortState={getSortState("avgSellPrice")}
          onSortChange={(state) => handleSortChange("avgSellPrice", state)}
          searchValue={tableState.columnSearch["avgSellPrice"] || ""}
          onSearchChange={(val) => handleSearchChange("avgSellPrice", val)}
          selectedFilters={tableState.columnFilters["avgSellPrice"] || []}
          onFilterChange={(vals) => handleFilterChange("avgSellPrice", vals)}
          align="center"
          columnKey="avgSellPrice"
          {...commonFilterProps}
          formatOptionLabel={(label) => {
            const num = Number(label);
            return isNaN(num) ? label : money(num);
          }}
        />
      ),
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => (
        <PriceWithInvoicePopover
          price={row.avgSellPrice}
          itemCode={row.itemCode}
          month={row.month}
          direction="OUT"
          onOpenInvoice={(id) => formHook.openDetail({ id } as any)}
        />
      ),
    },
    {
      key: "margin",
      header: (
        <TableColumnHeaderFilter
          title="Biên LN"
          sortState={getSortState("margin")}
          onSortChange={(state) => handleSortChange("margin", state)}
          searchValue={tableState.columnSearch["margin"] || ""}
          onSearchChange={(val) => handleSearchChange("margin", val)}
          selectedFilters={tableState.columnFilters["margin"] || []}
          onFilterChange={(vals) => handleFilterChange("margin", vals)}
          align="center"
          columnKey="margin"
          {...commonFilterProps}
          formatOptionLabel={(label) => {
            const num = Number(label);
            return isNaN(num) ? label : money(num);
          }}
        />
      ),
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.qtySold > 0 && row.margin != null ? money(row.margin) : ""}
        </span>
      ),
    },
    {
      key: "marginPct",
      header: (
        <TableColumnHeaderFilter
          title="Biên LN (%)"
          sortState={getSortState("marginPct")}
          onSortChange={(state) => handleSortChange("marginPct", state)}
          searchValue={tableState.columnSearch["marginPct"] || ""}
          onSearchChange={(val) => handleSearchChange("marginPct", val)}
          selectedFilters={tableState.columnFilters["marginPct"] || []}
          onFilterChange={(vals) => handleFilterChange("marginPct", vals)}
          align="center"
          columnKey="marginPct"
          {...commonFilterProps}
        />
      ),
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => (
        <span className="text-gray-600">
          {row.qtySold > 0 ? row.marginPct : ""}
        </span>
      ),
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          vehicleType === "CAR"
            ? "Báo cáo phụ tùng Ô tô VINFAST"
            : vehicleType === "MOTORBIKE"
              ? "Báo cáo phụ tùng Xe máy VINFAST"
              : "Báo cáo phụ tùng VINFAST"
        }
        desc={
          vehicleType === "CAR"
            ? "Tổng hợp và đối chiếu phụ tùng ô tô mua vào từ VINFAST và bán ra theo tháng"
            : vehicleType === "MOTORBIKE"
              ? "Tổng hợp và đối chiếu phụ tùng xe máy mua vào từ VINFAST và bán ra theo tháng"
              : "Tổng hợp và đối chiếu phụ tùng mua vào từ VINFAST và bán ra theo tháng"
        }
        icon={<FileText className="w-4 h-4 opacity-75" />}
        tableId={`vinfast-parts-${vehicleType || "all"}`}
        createActions={[
          {
            groupLabel: "TRA CỨU",
            items: [
              {
                label: "Tải bảng kê",
                icon: <Download className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  const params = new URLSearchParams();
                  if (filterState.dateFrom)
                    params.append("dateFrom", filterState.dateFrom);
                  if (filterState.dateTo)
                    params.append("dateTo", filterState.dateTo);
                  if (filterState.search)
                    params.append("search", filterState.search);
                  if (sortBy) params.append("sortBy", sortBy);
                  if (sortOrder) params.append("sortDir", sortOrder);
                  if (tableState.sorts.length > 0)
                    params.append("sorts", JSON.stringify(tableState.sorts));
                  if (Object.keys(tableState.columnSearch).length > 0)
                    params.append(
                      "column_search",
                      JSON.stringify(tableState.columnSearch),
                    );
                  const finalExportFilters = { ...tableState.columnFilters };
                  if (vehicleType) {
                    finalExportFilters["vehicleType"] = [vehicleType];
                  }
                  if (Object.keys(finalExportFilters).length > 0)
                    params.append(
                      "column_filters",
                      JSON.stringify(finalExportFilters),
                    );

                  // Logic to trigger download
                  const url = `/api/v1/reports/vinfast-parts/export/excel?${params.toString()}`;
                  api.get(url, { responseType: "blob" }).then((res) => {
                    const fileUrl = window.URL.createObjectURL(res.data);
                    const a = document.createElement("a");
                    a.href = fileUrl;
                    const timeStr = format(new Date(), "yyyyMMdd_HHmmss");
                    const prefix =
                      vehicleType === "CAR"
                        ? "O_to_"
                        : vehicleType === "MOTORBIKE"
                          ? "Xe_may_"
                          : "";
                    a.download = `Bao_cao_phu_tung_${prefix}VINFAST_${timeStr}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(fileUrl);
                    document.body.removeChild(a);
                  });
                },
              },
            ],
          },
          {
            groupLabel: "THAO TÁC",
            items: [
              {
                label: "Đồng bộ mã phụ tùng",
                icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
                onClick: () => {
                  refetch();
                  showToast({
                    title: "Thành công",
                    description:
                      "Đã đồng bộ và trích xuất lại dữ liệu phụ tùng mới nhất!",
                  });
                },
              },
            ],
          },
        ]}
        items={data?.data || []}
        columns={columns as any}
        summaryRow={summaryRow}
        getRowKey={(row: any) => `${row.itemCode}-${row.itemName}-${row.month}`}
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

      <VinfastPartDetailDrawer
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        itemCode={detailRow?.itemCode || ""}
        itemName={detailRow?.itemName || ""}
        month={detailRow?.month || ""}
        onOpenInvoice={(id) => formHook.openInternal({ id } as any)}
      />
    </>
  );
}
