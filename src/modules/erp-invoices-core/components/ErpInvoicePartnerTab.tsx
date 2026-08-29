import React, { useMemo, useCallback, useState } from "react";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Copy,
  Check,
  FileText,
  TrendingUp,
  CreditCard,
  MapPin,
  AlertCircle,
  Eye,
  RotateCcw,
  Boxes,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  type ErpInvoice,
  type ErpInvoiceItemRow,
} from "../api/erpInvoicesCoreApi";
import { erpInvoiceDashboardApi } from "../api/erpInvoiceDashboardApi";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { VietnamInvoiceTemplate } from "./VietnamInvoiceTemplate";
import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";
import { InvoiceNoCell } from "./ErpInvoicesTab/components/cells/InvoiceNoCell";

export interface ErpInvoicePartnerTabProps {
  detailInvoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
  defaultViewMode?: "invoices" | "lines";
}

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export const ErpInvoicePartnerTab = React.memo(function ErpInvoicePartnerTab({
  detailInvoice,
  direction,
  defaultViewMode,
}: ErpInvoicePartnerTabProps) {
  const { t } = useTranslation("erpInvoices");
  const [previewSubInvoice, setPreviewSubInvoice] = useState<ErpInvoice | null>(
    null,
  );

  const [isTableCollapsed, setIsTableCollapsed] = useState(false);

  const isUrlLinesTab = useMemo(() => {
    if (typeof window === "undefined") return false;
    const s = window.location.search;
    return (
      s.includes("tab=in-lines") ||
      s.includes("tab=out-lines") ||
      s.includes("view=lines")
    );
  }, []);

  const [viewMode, setViewMode] = useState<"invoices" | "lines">(() => {
    if (defaultViewMode) return defaultViewMode;
    return isUrlLinesTab ? "lines" : "invoices";
  });

  const isDirectionIn = (direction || detailInvoice?.direction) === "IN";
  const partnerName =
    (isDirectionIn
      ? detailInvoice?.sellerName
      : detailInvoice?.buyerName || detailInvoice?.buyerPersonalName
    )?.trim() || "";

  const taxCode =
    (isDirectionIn
      ? detailInvoice?.sellerTaxCode
      : detailInvoice?.buyerTaxCode || detailInvoice?.buyerCccd
    )?.trim() || "";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STATE & HOOKS CHO BẢNG DANH SÁCH HÓA ĐƠN (INVOICE HEADERS)
  // ═══════════════════════════════════════════════════════════════════════════
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearchState] = useState<Record<string, string>>(
    {},
  );

  const setSort = useCallback((key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  }, []);

  const setColumnFilter = useCallback((key: string, vals: string[]) => {
    setColumnFilters((prev) => {
      if (!vals || vals.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: vals };
    });
    setPage(1);
  }, []);

  const setColumnSearch = useCallback((key: string, val: string) => {
    setColumnSearchState((prev) => {
      if (!val || val.trim().length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: val };
    });
    setPage(1);
  }, []);

  const setDateRange = useCallback((from?: string, to?: string) => {
    setDateFrom(from || "");
    setDateTo(to || "");
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearchState({});
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STATE & HOOKS CHO BẢNG CHI TIẾT HÀNG HÓA (ITEM LINES)
  // ═══════════════════════════════════════════════════════════════════════════
  const [itemPage, setItemPage] = useState(1);
  const [itemPageSize, setItemPageSize] = useState<number>(getDefaultPageSize);
  const [itemSorts, setItemSorts] = useState<string[]>([]);
  const [itemDateFrom, setItemDateFrom] = useState<string>("");
  const [itemDateTo, setItemDateTo] = useState<string>("");
  const [itemColumnFilters, setItemColumnFilters] = useState<
    Record<string, string[]>
  >({});
  const [itemColumnSearch, setItemColumnSearchState] = useState<
    Record<string, string>
  >({});

  const setItemSort = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      setItemSorts((prev) => {
        const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
        if (state === "asc") return [...filtered, key];
        if (state === "desc") return [...filtered, `-${key}`];
        return filtered;
      });
      setItemPage(1);
    },
    [],
  );

  const setItemColumnFilter = useCallback((key: string, vals: string[]) => {
    setItemColumnFilters((prev) => {
      if (!vals || vals.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: vals };
    });
    setItemPage(1);
  }, []);

  const setItemColumnSearch = useCallback((key: string, val: string) => {
    setItemColumnSearchState((prev) => {
      if (!val || val.trim().length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: val };
    });
    setItemPage(1);
  }, []);

  const setItemDateRange = useCallback((from?: string, to?: string) => {
    setItemDateFrom(from || "");
    setItemDateTo(to || "");
    setItemPage(1);
  }, []);

  const itemActiveFilterCount = useMemo(() => {
    let count = 0;
    Object.values(itemColumnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(itemColumnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (itemDateFrom || itemDateTo) count += 1;
    return count;
  }, [itemColumnFilters, itemColumnSearch, itemDateFrom, itemDateTo]);

  const clearItemAllFilters = useCallback(() => {
    setItemColumnFilters({});
    setItemColumnSearchState({});
    setItemDateFrom("");
    setItemDateTo("");
    setItemPage(1);
  }, []);

  // ── Query Invoices List ───
  const activeSort = sorts[0] || "";
  let sortBy = "";
  let sortOrder: "asc" | "desc" = "desc";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "invoiceDate";
    sortOrder = "desc";
  }

  const { data: listResponse, isLoading: isLoadingList } = useQuery({
    queryKey: [
      "partner-invoices-list",
      taxCode,
      page,
      pageSize,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        partner_tax_code: taxCode,
        date_from: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
        page,
        pageSize,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
        column_filters: Object.keys(columnFilters).length
          ? JSON.stringify(columnFilters)
          : undefined,
      }),
    enabled: !!taxCode && viewMode === "invoices",
  });

  const invoices = useMemo(() => listResponse?.items || [], [listResponse]);
  const total = listResponse?.total || 0;
  const totalPages = listResponse?.totalPages || 0;

  // ── Query Item Lines List ───
  const activeItemSort = itemSorts[0] || "";
  let itemSortBy = "";
  let itemSortOrder: "asc" | "desc" = "desc";
  if (activeItemSort.startsWith("-")) {
    itemSortBy = activeItemSort.substring(1);
    itemSortOrder = "desc";
  } else if (activeItemSort) {
    itemSortBy = activeItemSort;
    itemSortOrder = "asc";
  } else {
    itemSortBy = "invoiceDate";
    itemSortOrder = "desc";
  }

  const { data: itemLinesResponse, isLoading: isLoadingItems } = useQuery({
    queryKey: [
      "partner-items-list",
      taxCode,
      direction || detailInvoice?.direction,
      itemPage,
      itemPageSize,
      itemSortBy,
      itemSortOrder,
      itemDateFrom,
      itemDateTo,
      itemColumnFilters,
      itemColumnSearch,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.getItemsList({
        partner_tax_code: taxCode,
        direction: (direction || detailInvoice?.direction) as "IN" | "OUT",
        date_from: itemDateFrom ? `${itemDateFrom}T00:00:00` : undefined,
        date_to: itemDateTo ? `${itemDateTo}T23:59:59` : undefined,
        page: itemPage,
        pageSize: itemPageSize,
        sort_by: itemSortBy || undefined,
        sort_order: itemSortOrder || undefined,
        column_search: Object.keys(itemColumnSearch).length
          ? JSON.stringify(itemColumnSearch)
          : undefined,
        column_filters: Object.keys(itemColumnFilters).length
          ? JSON.stringify(itemColumnFilters)
          : undefined,
      }),
    enabled: !!taxCode && viewMode === "lines",
  });

  const itemLines = useMemo(
    () => itemLinesResponse?.items || [],
    [itemLinesResponse],
  );
  const itemLinesTotal = itemLinesResponse?.total || 0;
  const itemLinesTotalPages = itemLinesResponse?.totalPages || 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. COLUMNS & FILTERS CHO BẢNG HÓA ĐƠN (INVOICE HEADERS)
  // ═══════════════════════════════════════════════════════════════════════════
  const listHookLike = useMemo(
    () => ({
      sorts,
      setSort,
      columnFilters,
      setColumnFilter,
      columnSearch,
      setColumnSearch,
      dateFrom,
      dateTo,
      setDateRange,
    }),
    [
      sorts,
      setSort,
      columnFilters,
      setColumnFilter,
      columnSearch,
      setColumnSearch,
      dateFrom,
      dateTo,
      setDateRange,
    ],
  );

  const fetchInvoiceOptions = useCallback(
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
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore parse error
        }
      }
      if (taxCode) {
        currentFilters["taxCode"] = [taxCode];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        newFiltersStr,
        undefined,
      );
      return {
        items: res.items.map((i: any) => {
          const valStr =
            typeof i === "object" ? String(i.value || i.id || i) : String(i);
          const labelStr =
            typeof i === "object"
              ? String(i.label || i.name || valStr)
              : String(i);
          if (columnKey === "invoiceDate" && valStr) {
            const dateVal = valStr.substring(0, 10);
            try {
              const parsed = new Date(dateVal);
              const label = isValid(parsed)
                ? format(parsed, "dd-MM-yyyy")
                : dateVal;
              return { label, value: dateVal };
            } catch {
              return { label: valStr, value: valStr };
            }
          }
          return { label: labelStr, value: valStr };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [taxCode],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: listHookLike,
        queryKeyPrefix: `partner-invoice-options-${taxCode}`,
        fetchOptions: fetchInvoiceOptions,
      }),
    [listHookLike, taxCode, fetchInvoiceOptions],
  );

  const columns: DataTableColumn<ErpInvoice>[] = useMemo(() => {
    return [
      // 1. Cột STT: 40px, căn giữa tuyệt đối
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      // 2. Cột Ngày HĐ
      {
        key: "invoiceDate",
        size: 110,
        enableResizing: true,
        header: headerFilter.date("invoiceDate", t("invoiceDate", "Ngày HĐ")),
        className: "text-right font-medium",
        cell: (inv: ErpInvoice) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
            : "—",
      },
      // 3. Cột Số HĐ
      {
        key: "invoiceNo",
        size: 155,
        enableResizing: true,
        header: headerFilter("invoiceNo", t("invoiceNo", "Số HĐ")),
        cell: (inv: ErpInvoice) => (
          <InvoiceNoCell
            inv={inv}
            handleOpenInternal={(targetInv) => setPreviewSubInvoice(targetInv)}
          />
        ),
      },
      // 4. Cột Trước GTGT
      {
        key: "preVatAmount",
        size: 130,
        enableResizing: true,
        className: "text-right tabular-nums",
        header: headerFilter.amount(
          "preVatAmount",
          t("preVatAmount", "Trước GTGT"),
        ),
        cell: (inv: ErpInvoice) => money(Number(inv.preVatAmount) || 0),
      },
      // 5. Cột Thuế suất
      {
        key: "vatRate",
        size: 90,
        enableResizing: true,
        className: "text-center tabular-nums font-medium",
        header: headerFilter.numeric("vatRate", t("vatRate", "Thuế suất"), {
          currencySymbol: "%",
          isCurrency: false,
        }),
        cell: (inv: ErpInvoice) => {
          if (
            inv.vatRate === null ||
            inv.vatRate === undefined ||
            inv.vatRate === ""
          ) {
            return "—";
          }
          const num = Number(inv.vatRate);
          if (isNaN(num)) return String(inv.vatRate);
          if (num === 0) return "0%";
          const percent =
            Math.abs(num) <= 1 ? Math.round(num * 100 * 100) / 100 : num;
          return `${percent}%`;
        },
      },
      // 6. Cột Thuế GTGT
      {
        key: "vatAmount",
        size: 120,
        enableResizing: true,
        className: "text-right tabular-nums",
        header: headerFilter.amount("vatAmount", t("vatAmount", "Thuế GTGT")),
        cell: (inv: ErpInvoice) => money(Number(inv.vatAmount) || 0),
      },
      // 7. Cột Tổng tiền
      {
        key: "totalAmount",
        size: 135,
        enableResizing: true,
        className: "text-right font-semibold tabular-nums text-foreground",
        header: headerFilter.amount(
          "totalAmount",
          t("totalAmount", "Tổng tiền"),
        ),
        cell: (inv: ErpInvoice) => money(Number(inv.totalAmount) || 0),
      },
      // 8. Cột Diễn giải
      {
        key: "description",
        size: 220,
        enableResizing: true,
        header: headerFilter("description", t("description", "Diễn giải")),
        cell: (inv: ErpInvoice) => (
          <Tooltip content={inv.description || ""}>
            <div className="truncate max-w-[220px] text-xs text-muted-foreground">
              {inv.description || "—"}
            </div>
          </Tooltip>
        ),
      },
    ];
  }, [headerFilter, t]);

  const summaryRow = useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;
    const sumPreVat = invoices.reduce(
      (sum, i) => sum + (Number(i.preVatAmount) || 0),
      0,
    );
    const sumVat = invoices.reduce(
      (sum, i) => sum + (Number(i.vatAmount) || 0),
      0,
    );
    const sumTotal = invoices.reduce(
      (sum, i) => sum + (Number(i.totalAmount) || 0),
      0,
    );
    return {
      invoiceDate: (
        <span className="font-semibold text-xs text-foreground">
          {t("total", "Tổng")}
        </span>
      ),
      preVatAmount: (
        <span className="font-semibold text-xs tabular-nums text-foreground">
          {money(sumPreVat)}
        </span>
      ),
      vatAmount: (
        <span className="font-semibold text-xs tabular-nums text-foreground">
          {money(sumVat)}
        </span>
      ),
      totalAmount: (
        <span className="font-bold text-xs tabular-nums text-foreground">
          {money(sumTotal)}
        </span>
      ),
    };
  }, [invoices, t]);

  const rowActions = useCallback(
    (inv: ErpInvoice) => [
      {
        label: t("actionDetail", "Xem chi tiết"),
        icon: <Eye className="w-3.5 h-3.5" />,
        onClick: () => setPreviewSubInvoice(inv),
      },
    ],
    [t],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. COLUMNS & FILTERS CHO BẢNG CHI TIẾT HÀNG HÓA (ITEM LINES)
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchItemOptions = useCallback(
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
      let mergedFilters: Record<string, any> = {};
      if (filtersStr) {
        try {
          mergedFilters = JSON.parse(filtersStr);
        } catch {
          // ignore
        }
      }
      if (taxCode) {
        mergedFilters["taxCode"] = [taxCode];
      }
      const res = await erpInvoicesCoreApi.getItemColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        JSON.stringify(mergedFilters),
        (direction || detailInvoice?.direction) as "IN" | "OUT",
      );
      return {
        items: res.items.map((it) =>
          typeof it === "string" ? { label: it, value: it } : it,
        ),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [taxCode, direction, detailInvoice?.direction],
  );

  const itemListHookLike = useMemo(
    () => ({
      columnFilters: itemColumnFilters,
      columnSearch: itemColumnSearch,
      sorts: itemSorts,
      dateFrom: itemDateFrom,
      dateTo: itemDateTo,
      setSort: setItemSort,
      setColumnFilter: setItemColumnFilter,
      setColumnSearch: setItemColumnSearch,
      setDateRange: setItemDateRange,
    }),
    [
      itemColumnFilters,
      itemColumnSearch,
      itemSorts,
      itemDateFrom,
      itemDateTo,
      setItemSort,
      setItemColumnFilter,
      setItemColumnSearch,
      setItemDateRange,
    ],
  );

  const itemHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: itemListHookLike,
        queryKeyPrefix: `partner-items-options-${taxCode}`,
        fetchOptions: fetchItemOptions,
      }),
    [itemListHookLike, taxCode, fetchItemOptions],
  );

  const itemColumns: DataTableColumn<ErpInvoiceItemRow>[] = useMemo(
    () => [
      // 1. Cột STT: 40px, căn giữa tuyệt đối
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      // 2. Cột Ngày HĐ
      {
        key: "invoiceDate",
        size: 105,
        enableResizing: true,
        header: itemHeaderFilter.date(
          "invoiceDate",
          t("invoiceDate", "Ngày HĐ"),
        ),
        className: "text-right font-medium",
        cell: (row: ErpInvoiceItemRow) =>
          row.invoiceDate
            ? format(new Date(row.invoiceDate), "dd/MM/yyyy")
            : "—",
      },
      // 3. Cột Số HĐ
      {
        key: "invoiceNo",
        size: 140,
        enableResizing: true,
        header: itemHeaderFilter("invoiceNo", t("invoiceNo", "Số HĐ")),
        cell: (row: ErpInvoiceItemRow) => (
          <InvoiceNoCell
            inv={
              {
                id: row.invoiceId,
                invoiceNo: row.invoiceNo,
                serialNo: row.serialNo,
              } as any
            }
            handleOpenInternal={(targetInv) => setPreviewSubInvoice(targetInv)}
          />
        ),
      },
      // 4. Cột Mã hàng
      {
        key: "itemCode",
        size: 110,
        enableResizing: true,
        header: itemHeaderFilter("itemCode", t("itemCode", "Mã hàng")),
        cell: (row: ErpInvoiceItemRow) => (
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {row.itemCode || "—"}
          </span>
        ),
      },
      // 5. Cột Diễn giải / Hàng hóa
      {
        key: "description",
        size: 230,
        enableResizing: true,
        header: itemHeaderFilter(
          "description",
          t("description", "Diễn giải / Hàng hóa"),
        ),
        cell: (row: ErpInvoiceItemRow) => (
          <TableText text={row.description || "—"} tooltip />
        ),
      },
      // 6. Cột ĐVT
      {
        key: "unit",
        size: 70,
        enableResizing: true,
        className: "text-center",
        header: itemHeaderFilter("unit", t("unit", "ĐVT")),
        cell: (row: ErpInvoiceItemRow) => (
          <span className="text-center w-full block text-xs text-muted-foreground">
            {row.unit || "—"}
          </span>
        ),
      },
      // 7. Cột Số lượng
      {
        key: "quantity",
        size: 85,
        enableResizing: true,
        className: "text-right tabular-nums",
        header: itemHeaderFilter.qty("quantity", t("quantity", "Số lượng")),
        cell: (row: ErpInvoiceItemRow) => (
          <span className="font-medium">
            {row.quantity != null
              ? Number(row.quantity).toLocaleString("vi-VN")
              : "—"}
          </span>
        ),
      },
      // 8. Cột Đơn giá
      {
        key: "unitPrice",
        size: 110,
        enableResizing: true,
        className: "text-right tabular-nums",
        header: itemHeaderFilter.amount("unitPrice", t("unitPrice", "Đơn giá")),
        cell: (row: ErpInvoiceItemRow) =>
          row.unitPrice != null ? money(Number(row.unitPrice)) : "—",
      },
      // 9. Cột Trước GTGT
      {
        key: "preVatAmount",
        size: 125,
        enableResizing: true,
        className: "text-right tabular-nums",
        header: itemHeaderFilter.amount(
          "preVatAmount",
          t("preVatAmount", "Trước GTGT"),
        ),
        cell: (row: ErpInvoiceItemRow) => money(Number(row.preVatAmount) || 0),
      },
      // 10. Cột Thuế suất
      {
        key: "vatRate",
        size: 85,
        enableResizing: true,
        className: "text-center tabular-nums font-medium",
        header: itemHeaderFilter.numeric("vatRate", t("vatRate", "Thuế suất"), {
          currencySymbol: "%",
          isCurrency: false,
        }),
        cell: (row: ErpInvoiceItemRow) => {
          if (
            row.vatRate === null ||
            row.vatRate === undefined ||
            row.vatRate === ""
          ) {
            return "—";
          }
          const num = Number(row.vatRate);
          if (isNaN(num)) return String(row.vatRate);
          if (num === 0) return "0%";
          const percent =
            Math.abs(num) <= 1 ? Math.round(num * 100 * 100) / 100 : num;
          return `${percent}%`;
        },
      },
      // 11. Cột Thuế GTGT
      {
        key: "vatAmount",
        size: 115,
        enableResizing: true,
        className: "text-right tabular-nums",
        header: itemHeaderFilter.amount(
          "vatAmount",
          t("vatAmount", "Thuế GTGT"),
        ),
        cell: (row: ErpInvoiceItemRow) => money(Number(row.vatAmount) || 0),
      },
      // 12. Cột Thành tiền
      {
        key: "totalAmount",
        size: 130,
        enableResizing: true,
        className: "text-right font-semibold tabular-nums text-foreground",
        header: itemHeaderFilter.amount(
          "totalAmount",
          t("totalAmount", "Thành tiền"),
        ),
        cell: (row: ErpInvoiceItemRow) => money(Number(row.totalAmount) || 0),
      },
      // 13. Cột Phân loại
      {
        key: "invoiceSubcategory",
        size: 120,
        enableResizing: true,
        header: itemHeaderFilter(
          "invoiceSubcategory",
          t("subcategory", "Phân loại"),
        ),
        cell: (row: ErpInvoiceItemRow) => (
          <span className="text-xs text-muted-foreground truncate block">
            {row.invoiceSubcategory || "—"}
          </span>
        ),
      },
    ],
    [itemHeaderFilter, t],
  );

  const itemSummaryRow = useMemo(() => {
    const summary = itemLinesResponse?.summary;
    if (!summary) return undefined;
    return {
      invoiceDate: (
        <span className="font-semibold text-xs text-foreground block">
          {t("total", "Tổng")}
        </span>
      ),
      quantity: (
        <span className="font-semibold text-right block tabular-nums text-xs">
          {Number(summary.totalQuantity || 0).toLocaleString("vi-VN")}
        </span>
      ),
      preVatAmount: (
        <span className="font-semibold text-right block tabular-nums text-xs">
          {money(Number(summary.totalPreVatAmount || 0))}
        </span>
      ),
      vatAmount: (
        <span className="font-semibold text-right block tabular-nums text-xs">
          {money(Number(summary.totalVatAmount || 0))}
        </span>
      ),
      totalAmount: (
        <span className="font-bold text-right block tabular-nums text-xs text-primary">
          {money(Number(summary.totalAmount || 0))}
        </span>
      ),
    };
  }, [itemLinesResponse?.summary, t]);

  const itemRowActions = useCallback(
    (row: ErpInvoiceItemRow) => [
      {
        groupLabel: "TRA CỨU",
        items: [
          {
            label: t("viewInvoiceDetail", "Xem chi tiết hóa đơn"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () =>
              setPreviewSubInvoice({
                id: row.invoiceId,
                invoiceNo: row.invoiceNo,
                serialNo: row.serialNo,
              } as any),
          },
        ],
      },
    ],
    [t],
  );

  if (!taxCode && !partnerName) {
    return (
      <div className="p-8 text-center bg-surface/50 rounded-xl border border-border/70 flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
        <div className="text-sm font-medium text-foreground">
          {t("noPartnerInfo", "Không có thông tin đối tác")}
        </div>
        <p className="text-xs text-muted-foreground max-w-sm">
          {t(
            "noPartnerInfoDesc",
            "Hóa đơn này chưa có tên hoặc Mã số thuế đối tác để tra cứu lịch sử giao dịch liên quan.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 min-w-0 w-full flex flex-col transition-all duration-300",
        !isTableCollapsed ? "h-[calc(100vh-210px)]" : "h-auto",
      )}
    >
      <DrawerSection
        title={
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-lg text-xs border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("lines")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5",
                  viewMode === "lines"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Boxes className="w-3.5 h-3.5 text-primary" />
                <span>{t("tabGoodsItems", "Chi tiết hàng hóa")}</span>
                {itemLinesTotal > 0 && (
                  <span className="text-[10px] px-1.5 py-0 rounded-full bg-primary/10 text-primary font-bold">
                    {itemLinesTotal}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("invoices")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5",
                  viewMode === "invoices"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>{t("tabInvoicesList", "Danh sách hóa đơn")}</span>
                {total > 0 && (
                  <span className="text-[10px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground font-bold">
                    {total}
                  </span>
                )}
              </button>
            </div>
          </div>
        }
        titleExtra={
          <div className="flex items-center gap-2">
            {viewMode === "lines" ? (
              <>
                {itemActiveFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearItemAllFilters}
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t("clearFilters", "Đặt lại")} ({itemActiveFilterCount})
                  </Button>
                )}
                {itemLinesTotal > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {itemLinesTotal} {t("itemsCount", "dòng hàng hóa")}
                  </span>
                )}
              </>
            ) : (
              <>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t("clearFilters", "Đặt lại")} ({activeFilterCount})
                  </Button>
                )}
                {total > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {total} {t("invoicesCount", "hóa đơn")}
                  </span>
                )}
              </>
            )}
          </div>
        }
        collapsible={true}
        collapsed={isTableCollapsed}
        onToggleCollapse={() => setIsTableCollapsed((prev) => !prev)}
        fitViewportHeight={!isTableCollapsed}
        className={cn(
          "mb-0 flex flex-col transition-all duration-300",
          !isTableCollapsed ? "h-full" : "h-auto",
        )}
        bodyClassName="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          {viewMode === "lines" ? (
            <StandardTable
              items={itemLines}
              columns={itemColumns}
              getRowKey={(r) => r.id}
              loading={isLoadingItems}
              variant="spreadsheet"
              minWidth={1100}
              tableId="erp-invoice-partner-items-table"
              enableColumnResizing={true}
              enableRowHoverActions={true}
              hideLegacyActionColumn={true}
              actions={itemRowActions}
              summaryRow={itemSummaryRow}
              page={itemPage}
              pageSize={itemPageSize}
              total={itemLinesTotal}
              totalPages={itemLinesTotalPages}
              onPage={setItemPage}
              onPageSize={setItemPageSize}
            />
          ) : (
            <StandardTable
              items={invoices}
              columns={columns}
              getRowKey={(r) => r.id}
              loading={isLoadingList}
              variant="spreadsheet"
              minWidth={750}
              tableId="erp-invoice-partner-invoices-table"
              enableColumnResizing={true}
              enableRowHoverActions={true}
              hideLegacyActionColumn={true}
              actions={rowActions}
              summaryRow={summaryRow}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          )}
        </div>
      </DrawerSection>

      {/* Sub-drawer for previewing another invoice from partner's list */}
      {previewSubInvoice && (
        <DrawerModal
          open={Boolean(previewSubInvoice)}
          onClose={() => setPreviewSubInvoice(null)}
          title={`Hóa đơn ${previewSubInvoice.invoiceNo || ""} (Ký hiệu: ${previewSubInvoice.serialNo || "—"})`}
          panelClassName="min-[1024px]:w-[calc(100vw-350px)] w-full max-w-[85vw]"
        >
          <div className="p-4">
            <VietnamInvoiceTemplate invoice={previewSubInvoice} />
          </div>
        </DrawerModal>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. CỘT PHẢI (RIGHT PANEL) CHO TAB ĐỐI TÁC: HỒ SƠ ĐỐI TÁC & TỔNG QUAN DÒNG TIỀN
// ═══════════════════════════════════════════════════════════════════════════
export interface ErpInvoicePartnerRightPanelProps {
  detailInvoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
}

export const ErpInvoicePartnerRightPanel = React.memo(
  function ErpInvoicePartnerRightPanel({
    detailInvoice,
    direction,
  }: ErpInvoicePartnerRightPanelProps) {
    const { t } = useTranslation("erpInvoices");
    const [copiedTax, setCopiedTax] = useState(false);
    const [copiedName, setCopiedName] = useState(false);

    const isDirectionIn = (direction || detailInvoice?.direction) === "IN";
    const partnerName =
      (isDirectionIn
        ? detailInvoice?.sellerName
        : detailInvoice?.buyerName || detailInvoice?.buyerPersonalName
      )?.trim() || "";

    const taxCode =
      (isDirectionIn
        ? detailInvoice?.sellerTaxCode
        : detailInvoice?.buyerTaxCode || detailInvoice?.buyerCccd
      )?.trim() || "";

    const address =
      (isDirectionIn
        ? detailInvoice?.sellerAddress
        : detailInvoice?.buyerAddress
      )?.trim() || "";

    const bank = isDirectionIn ? detailInvoice?.sellerBank?.trim() : "";

    const { data: statsData, isLoading: isLoadingStats } = useQuery({
      queryKey: ["partner-invoice-stats", taxCode],
      queryFn: () => erpInvoiceDashboardApi.getPartnerStats(taxCode),
      enabled: !!taxCode,
    });

    const copyToClipboard = (
      text: string,
      isTax: boolean,
      e: React.MouseEvent,
    ) => {
      e.stopPropagation();
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
      if (isTax) {
        setCopiedTax(true);
        toast.success(t("copiedTax", "Đã copy MST"), {
          id: "partner-tax-copy",
        });
        setTimeout(() => setCopiedTax(false), 1500);
      } else {
        setCopiedName(true);
        toast.success(t("copiedName", "Đã copy tên đối tác"), {
          id: "partner-name-copy",
        });
        setTimeout(() => setCopiedName(false), 1500);
      }
    };

    const barIn = "#ea580c"; // Orange 600 (Đầu vào - Chi phí)
    const barOut = "#059669"; // Emerald 600 (Đầu ra - Doanh thu)

    const cashTrendLabels = statsData?.cashTrend?.map((t) => t.label) || [];
    const cashTrendIn = statsData?.cashTrend?.map((t) => t.cashOut) || [];
    const cashTrendOut = statsData?.cashTrend?.map((t) => t.cashIn) || [];

    if (!taxCode && !partnerName) return null;

    return (
      <div className="space-y-4 pb-3">
        {/* 1. Hồ sơ đối tác */}
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{t("partnerProfile", "Hồ sơ đối tác")}</span>
            </div>
          }
          collapsible={true}
        >
          <div className="space-y-3">
            {/* Tên đối tác & Role Badge */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-foreground leading-snug break-words">
                  {partnerName || t("unnamedPartner", "Đối tác chưa đặt tên")}
                </span>
                {partnerName && (
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(partnerName, false, e)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title={t("copyName", "Copy tên")}
                  >
                    {copiedName ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
              >
                {isDirectionIn
                  ? t("roleSeller", "Bên bán (Nhà cung cấp)")
                  : t("roleBuyer", "Bên mua (Khách hàng)")}
              </Badge>
            </div>

            {/* Thông tin chi tiết: MST, Địa chỉ, Ngân hàng */}
            <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
              {taxCode && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground shrink-0 font-medium">
                    MST:
                  </span>
                  <div className="flex items-center gap-1 min-w-0 font-mono">
                    <span className="font-semibold text-foreground truncate">
                      {taxCode}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => copyToClipboard(taxCode, true, e)}
                      className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title={t("copyTax", "Copy MST")}
                    >
                      {copiedTax ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span
                    className="text-[11px] leading-relaxed line-clamp-2"
                    title={address}
                  >
                    {address}
                  </span>
                </div>
              )}

              {bank && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span
                    className="text-[11px] leading-relaxed line-clamp-2"
                    title={bank}
                  >
                    {bank}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DrawerSection>

        {/* 2. Tổng quan Dòng tiền & Biểu đồ compact */}
        {taxCode && (
          <DrawerSection
            title={
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span>{t("cashTrendOverview", "Tổng quan Dòng tiền")}</span>
              </div>
            }
            collapsible={true}
          >
            <div className="space-y-3">
              {/* Compact KPI Badges */}
              {cashTrendLabels.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {t("totalIn", "Đầu vào")}
                    </div>
                    <div className="font-bold text-foreground tabular-nums truncate text-[11px]">
                      {money(
                        cashTrendIn.reduce(
                          (sum, v) => sum + (Number(v) || 0),
                          0,
                        ),
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t("totalOut", "Đầu ra")}
                    </div>
                    <div className="font-bold text-foreground tabular-nums truncate text-[11px]">
                      {money(
                        cashTrendOut.reduce(
                          (sum, v) => sum + (Number(v) || 0),
                          0,
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Compact BarChart */}
              <div className="relative h-[140px] pt-1">
                {!isLoadingStats && cashTrendLabels.length > 0 ? (
                  <BarChart
                    labels={cashTrendLabels}
                    yCallback={(v) => money(Number(v))}
                    datasets={[
                      {
                        data: cashTrendIn,
                        color: barIn,
                        label: t("invoicesIn", "HĐ Đầu vào"),
                      },
                      {
                        data: cashTrendOut,
                        color: barOut,
                        label: t("invoicesOut", "HĐ Đầu ra"),
                      },
                    ]}
                  />
                ) : isLoadingStats ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    {t("noChartData", "Chưa có dữ liệu giao dịch đối soát")}
                  </div>
                )}
              </div>
            </div>
          </DrawerSection>
        )}
      </div>
    );
  },
);
