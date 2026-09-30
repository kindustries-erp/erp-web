import React, { useMemo, useCallback, useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  FileText,
  TrendingUp,
  CreditCard,
  MapPin,
  AlertCircle,
  Eye,
  RotateCcw,
  Boxes,
  Paperclip,
} from "lucide-react";
import { CopyButton } from "@/shared/components/CopyButton";

import {
  type ErpInvoice,
  type ErpInvoiceItemRow,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { invoiceDebtsApi } from "@/modules/accounting/api/invoiceDebtsApi";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { PartnerDebtAnalyticsSection } from "../partner-debt-analytics";
import { ErpInvoicePartnerInvoicesSection } from "../erp-invoice-partner-invoices-section";
import { DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/molecules/vietnam-invoice-template";
import { formatUom } from "@/modules/erp-invoices-core/utils/uom.helper";
import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";
import { InvoiceNoCell } from "@/modules/erp-invoices-core/components/molecules/invoice-no-cell";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  InvoicePreviewModeContext,
  type InvoiceDetailViewMode,
} from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";

import type { ErpInvoicePartnerTabProps } from "./ErpInvoicePartnerTab.type";
export type { ErpInvoicePartnerTabProps };

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
  children,
  onViewModeChange,
  form,
}: ErpInvoicePartnerTabProps) {
  const { t } = useTranslation("erpInvoices");
  const [previewSubInvoice, setPreviewSubInvoice] = useState<ErpInvoice | null>(
    null,
  );

  const isUrlLinesTab = useMemo(() => {
    if (typeof window === "undefined") return false;
    const s = window.location.search;
    return (
      s.includes("tab=in-lines") ||
      s.includes("tab=out-lines") ||
      s.includes("view=lines")
    );
  }, []);

  const [viewMode, setViewMode] = useState<
    "details" | "invoices" | "lines" | "analytics"
  >(() => {
    if (defaultViewMode) return defaultViewMode;
    return isUrlLinesTab ? "lines" : "details";
  });

  const handleViewModeChange = useCallback(
    (mode: "details" | "invoices" | "lines" | "analytics") => {
      setViewMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const hasPdf = Boolean(
    detailInvoice?.pdfFileKey ||
    (detailInvoice?.pdfFiles && detailInvoice.pdfFiles.length > 0) ||
    (detailInvoice?.attachments &&
      detailInvoice.attachments.some(
        (a: any) =>
          a.attachment?.mimeType === "application/pdf" ||
          a.attachment?.fileName?.toLowerCase().endsWith(".pdf") ||
          a.attachment?.fileKey?.toLowerCase().endsWith(".pdf"),
      )),
  );

  const attachmentCount = useMemo(() => {
    let count = 0;
    if (detailInvoice?.pdfFileKey) count++;
    if (detailInvoice?.pdfFiles && detailInvoice.pdfFiles.length > 0) {
      count += detailInvoice.pdfFiles.length;
    }
    if (detailInvoice?.attachments && detailInvoice.attachments.length > 0) {
      count += detailInvoice.attachments.length;
    }
    if (
      form?.pendingAddedAttachments &&
      form.pendingAddedAttachments.length > 0
    ) {
      count += form.pendingAddedAttachments.length;
    }
    if (form?.pendingDeletedPdfs && form.pendingDeletedPdfs.length > 0) {
      count -= form.pendingDeletedPdfs.length;
    }
    return Math.max(0, count);
  }, [
    detailInvoice?.pdfFileKey,
    detailInvoice?.pdfFiles,
    detailInvoice?.attachments,
    form?.pendingAddedAttachments,
    form?.pendingDeletedPdfs,
  ]);

  const [detailViewMode, setDetailViewMode] =
    useState<InvoiceDetailViewMode>("template");

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
  // 1. STATE & HOOKS CHO BẢNG CHI TIẾT HÀNG HÓA (ITEM LINES)
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
      if (vals && vals.length > 0) count += 1;
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

  // ── Query Partner Debt Invoices (Invoices List & Analytics & Cashflow Trend) ───
  const partnerType = isDirectionIn ? "SUPPLIER" : "CUSTOMER";
  const { data: debtInvoices = [], isLoading: isLoadingDebtInvoices } =
    useQuery({
      queryKey: ["invoice-partner-invoices", partnerType, taxCode, partnerName],
      queryFn: () => {
        if (!taxCode && !partnerName) return Promise.resolve([]);
        return invoiceDebtsApi.getPartnerInvoices(taxCode || "KHONG_MST", {
          partner_type: partnerType,
          partner_name: partnerName || undefined,
        });
      },
      enabled: Boolean(taxCode || partnerName),
      staleTime: DEFAULT_STALE_TIME,
    });
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
        items: res.items.map((it: any) =>
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
            {formatUom(row.unit, "—")}
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
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + QUICK ACTIONS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 w-full">
        {/* Bên trái: Sub-Tabs (1. Chi tiết / 2. Danh sách hóa đơn / 3. Chi tiết HHDV / 4. Biến động) */}
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
          <PillTabs<"details" | "invoices" | "lines" | "analytics">
            size="sm"
            value={viewMode}
            onValueChange={handleViewModeChange}
            items={[
              {
                value: "details",
                label: t("tabDetails", "1. Chi tiết"),
                icon: FileText,
              },
              {
                value: "invoices",
                label: t("tabInvoicesList", "2. Chi tiết theo đối tượng"),
                icon: FileText,
                badgeCount:
                  debtInvoices.length > 0 ? debtInvoices.length : undefined,
              },
              {
                value: "lines",
                label: t("tabGoodsItems", "3. Chi tiết HHDV"),
                icon: Boxes,
                badgeCount: itemLinesTotal > 0 ? itemLinesTotal : undefined,
              },
              {
                value: "analytics",
                label: t("tabCashflowAnalytics", "4. Biến động & Phân tích"),
                icon: TrendingUp,
              },
            ]}
          />
        </div>

        {/* Bên phải: Quick Actions & Count Summary & View Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {viewMode === "details" && (
            <PillTabs<"template" | "pdf">
              size="sm"
              variant="button-group"
              value={detailViewMode}
              onValueChange={(val) => setDetailViewMode(val)}
              items={[
                {
                  value: "template",
                  label: t("viewModeTemplate", "Xem trước HĐ thuần"),
                  icon: FileText,
                },
                {
                  value: "pdf",
                  label: t("viewModeAttachmentsAndPdf", "Tài liệu & PDF"),
                  icon: Paperclip,
                  badgeCount: attachmentCount > 0 ? attachmentCount : undefined,
                  dot: hasPdf && attachmentCount === 0,
                  dotColor: "emerald",
                },
              ]}
            />
          )}

          {viewMode === "invoices" && debtInvoices.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {debtInvoices.length} {t("invoicesCount", "hóa đơn")}
            </span>
          )}

          {viewMode === "lines" && (
            <>
              {itemActiveFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearItemAllFilters}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {t("clearFilters", "Đặt lại")} ({itemActiveFilterCount})
                </Button>
              )}
              {itemLinesTotal > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  {itemLinesTotal} {t("itemsCount", "dòng HHDV")}
                </span>
              )}
            </>
          )}

          {viewMode === "analytics" && debtInvoices.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {debtInvoices.length} {t("invoicesCount", "hóa đơn")}
            </span>
          )}
        </div>
      </div>

      {/* ─── TAB CHI TIẾT: Nội dung chi tiết hóa đơn hiện tại ─── */}
      {viewMode === "details" && (
        <InvoicePreviewModeContext.Provider
          value={{
            previewMode: detailViewMode,
            setPreviewMode: setDetailViewMode,
            hasPdf,
          }}
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            {children ?? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t("noDetailContent", "Không có nội dung chi tiết")}
              </div>
            )}
          </div>
        </InvoicePreviewModeContext.Provider>
      )}

      {/* ─── 2. NỘI DUNG BIẾN ĐỘNG & PHÂN TÍCH (DEBT ANALYTICS DASHBOARD) ─── */}
      {viewMode === "analytics" && (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 w-full">
          <PartnerDebtAnalyticsSection
            invoices={debtInvoices}
            isLoading={isLoadingDebtInvoices}
            isCustomer={!isDirectionIn}
          />
        </div>
      )}

      {/* ─── 3. NỘI DUNG BẢNG DANH SÁCH HÓA ĐƠN CHI TIẾT THEO ĐỐI TƯỢNG ─── */}
      {viewMode === "invoices" && (
        <ErpInvoicePartnerInvoicesSection
          taxCode={taxCode}
          partnerName={partnerName}
          partnerType={partnerType}
          direction={(direction || detailInvoice?.direction) as "IN" | "OUT"}
          onPreviewInvoice={(subInv: any) => setPreviewSubInvoice(subInv)}
        />
      )}

      {/* ─── 4. NỘI DUNG BẢNG CHI TIẾT HÀNG HÓA & DỊCH VỤ (ITEM LINES) ─── */}
      {viewMode === "lines" && (
        <DrawerSection
          title={
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Boxes className="w-4 h-4 text-muted-foreground" />
              <span>
                {t(
                  "tabGoodsItemsTitle",
                  "Danh sách chi tiết hàng hóa & dịch vụ",
                )}
              </span>
              {itemLinesTotal > 0 && (
                <span className="text-xs font-normal text-muted-foreground lowercase">
                  ({itemLinesTotal} {t("recordsItems", "dòng HHDV")})
                </span>
              )}
            </div>
          }
          titleExtra={
            itemActiveFilterCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearItemAllFilters}
                className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                {t("clearFilters", "Đặt lại")} ({itemActiveFilterCount})
              </Button>
            ) : undefined
          }
          collapsible={true}
          defaultCollapsed={false}
          className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
          bodyClassName="p-0"
        >
          <div className="h-[calc(100vh-395px)] min-h-[260px] max-h-[calc(100vh-395px)] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
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
              containerClassName="flex-1 min-h-0"
            />
          </div>
        </DrawerSection>
      )}

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
// 5. CỘT PHẢI (RIGHT PANEL) CHO TAB ĐỐI TÁC: HỒ SƠ ĐỐI TÁC
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
                  <CopyButton
                    value={partnerName}
                    tooltip={t("copyName", "Copy tên")}
                    copiedTooltip={t("copied", "Đã copy")}
                    toastMessage={t("copiedName", "Đã copy tên đối tác")}
                    toastId="partner-name-copy"
                    className="p-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  />
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
                    <CopyButton
                      value={taxCode}
                      tooltip={t("copyTax", "Copy MST")}
                      copiedTooltip={t("copied", "Đã copy")}
                      toastMessage={t("copiedTax", "Đã copy MST")}
                      toastId="partner-tax-copy"
                      iconClassName="w-3 h-3"
                      className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    />
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
      </div>
    );
  },
);
