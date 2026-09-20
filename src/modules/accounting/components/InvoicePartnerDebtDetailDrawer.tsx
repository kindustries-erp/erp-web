import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import {
  DataTable,
  type DataTableColumn,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ReceiptText,
  TrendingUp,
  Activity,
  Percent,
  RotateCcw,
} from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  invoiceDebtsApi,
  type PartnerInvoiceDetailItem,
  type InvoicePartnerType,
} from "../api/invoiceDebtsApi";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

interface InvoicePartnerDebtDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  taxCode: string | null;
  partnerName?: string;
  partnerType: InvoicePartnerType;
  dateFrom?: string;
  dateTo?: string;
}

export function InvoicePartnerDebtDetailDrawer({
  open,
  onClose,
  taxCode,
  partnerName,
  partnerType,
  dateFrom,
  dateTo,
}: InvoicePartnerDebtDetailDrawerProps) {
  const { t } = useTranslation(["debts", "common"]);
  const isCustomer = partnerType === "CUSTOMER";

  // Client table state for header filters, search and sorting
  const tableState = useTableColumnState(
    `invoice-partner-debt-detail-${partnerName || taxCode || "unknown"}`,
  );

  // Client-side pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sub-tab navigation state (Left Panel)
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "analytics">(
    "invoices",
  );

  // Fetch Invoices of Partner
  const {
    data: invoices = [],
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: [
      "invoice-partner-invoices",
      partnerType,
      taxCode,
      partnerName,
      dateFrom,
      dateTo,
    ],
    queryFn: () => {
      if (!taxCode && !partnerName) return Promise.resolve([]);
      return invoiceDebtsApi.getPartnerInvoices(taxCode || "KHONG_MST", {
        partner_type: partnerType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        partner_name: partnerName || undefined,
      });
    },
    enabled: open && (!!taxCode || !!partnerName),
  });

  // Fetch Stats Trend
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "invoice-partner-trend-stats",
      taxCode,
      partnerName,
      dateFrom,
      dateTo,
    ],
    queryFn: () => {
      if (!taxCode || taxCode === "KHONG_MST")
        return Promise.resolve({ cashTrend: [] });
      return invoiceDebtsApi.getPartnerStats(taxCode, {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
    },
    enabled: open && !!taxCode && taxCode !== "KHONG_MST",
  });

  // Reset pagination when data or filters change
  useEffect(() => {
    setPage(1);
  }, [
    taxCode,
    partnerName,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  // Internal invoice drawer hook for viewing full invoice detail
  const handleReloadInvoices = useCallback(() => {
    void refetchInvoices();
  }, [refetchInvoices]);
  const formHook = useErpInvoiceForm(handleReloadInvoices);

  // Compute KPI totals
  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let maxAging = 0;
    let aging0_30 = 0;
    let aging31_60 = 0;
    let aging61_90 = 0;
    let agingOver90 = 0;

    invoices.forEach((inv) => {
      const tot = Number(inv.totalAmount) || 0;
      const paid = Number(inv.paidAmount) || 0;
      const bal = Number(inv.balanceAmount) || 0;
      const aging = Number(inv.agingDays) || 0;

      totalRevenue += tot;
      totalPaid += paid;
      totalBalance += bal;
      if (bal > 0 && aging > maxAging) maxAging = aging;

      if (bal > 0) {
        if (aging <= 30) aging0_30 += bal;
        else if (aging <= 60) aging31_60 += bal;
        else if (aging <= 90) aging61_90 += bal;
        else agingOver90 += bal;
      }
    });

    return {
      totalRevenue,
      totalPaid,
      totalBalance,
      maxAging,
      aging0_30,
      aging31_60,
      aging61_90,
      agingOver90,
      recoveryRate:
        totalRevenue > 0
          ? Math.round((totalPaid / totalRevenue) * 100)
          : totalBalance === 0
            ? 100
            : 0,
    };
  }, [invoices]);

  const resolvedName =
    partnerName ||
    (isCustomer ? invoices[0]?.buyerName : invoices[0]?.sellerName) ||
    taxCode ||
    t("debts:drawer.title", "Hồ sơ công nợ đối tác");

  const partnerAddress =
    (isCustomer ? invoices[0]?.buyerAddress : invoices[0]?.sellerAddress) ||
    undefined;

  // Universal client filter & sorter for drawer table (exact search "", multi search ;, etc.)
  const filteredInvoices = useMemo(() => {
    return filterClientItems(invoices, tableState, {
      dateField: "invoiceDate",
    });
  }, [invoices, tableState]);

  // Paginated data for DataTable
  const totalItems = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, page, pageSize]);

  // Column Header Filter Builder for Client Table
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: invoices,
        defaultAlign: "center",
      }),
    [tableState, invoices],
  );

  // Table Columns Definition
  const columns: DataTableColumn<PartnerInvoiceDetailItem>[] = useMemo(() => {
    return [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => <span>{idx}</span>,
      },
      {
        key: "invoiceNo",
        header: headerFilter("invoiceNo", t("debts:drawer.invoiceNo", "Số HĐ")),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.invoiceNo || "N/A"}
            enableCopy={true}
            tooltip={true}
            className="font-mono text-primary font-medium"
            onDetailClick={(e) => {
              e?.stopPropagation();
              formHook.openInternal(row as any);
            }}
          />
        ),
      },
      {
        key: "serialNo",
        header: headerFilter("serialNo", t("debts:drawer.serialNo", "Ký hiệu")),
        size: 110,
        minSize: 90,
        enableResizing: true,
        className: "text-left font-mono text-xs text-muted-foreground",
        cell: (row) => row.serialNo || "—",
      },
      {
        key: "invoiceDate",
        className: "text-right",
        header: headerFilter.date(
          "invoiceDate",
          t("debts:drawer.invoiceDate", "Ngày HĐ"),
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <TableDateCell
            date={row.invoiceDate}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "preVatAmount",
        className: "text-right",
        header: headerFilter.amount(
          "preVatAmount",
          t("debts:drawer.preVatAmount", "Trước thuế"),
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono text-xs text-muted-foreground">
            {money(row.preVatAmount)}
          </span>
        ),
      },
      {
        key: "vatAmount",
        className: "text-right",
        header: headerFilter.amount(
          "vatAmount",
          t("debts:drawer.vatAmount", "Tiền thuế"),
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono text-xs text-muted-foreground">
            {money(row.vatAmount)}
          </span>
        ),
      },
      {
        key: "totalAmount",
        className: "text-right",
        header: headerFilter.amount(
          "totalAmount",
          t("debts:drawer.totalAmount", "Tổng tiền"),
        ),
        size: 140,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
            {money(row.totalAmount)}
          </span>
        ),
      },
      {
        key: "paidAmount",
        className: "text-right",
        header: headerFilter.amount(
          "paidAmount",
          t("debts:drawer.paidAmount", "Đã cấn trừ"),
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-medium text-xs text-emerald-700 dark:text-emerald-400">
            {money(row.paidAmount)}
          </span>
        ),
      },
      {
        key: "balanceAmount",
        className: "text-right",
        header: headerFilter.amount(
          "balanceAmount",
          t("debts:drawer.balanceAmount", "Còn nợ"),
        ),
        size: 140,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "tabular-nums font-mono font-bold text-xs",
              row.balanceAmount > 0
                ? "text-destructive"
                : "text-muted-foreground font-normal",
            )}
          >
            {money(row.balanceAmount)}
          </span>
        ),
      },
      {
        key: "agingDays",
        className: "text-center",
        header: headerFilter.numeric(
          "agingDays",
          t("debts:drawer.agingDays", "Tuổi nợ"),
        ),
        size: 110,
        minSize: 100,
        enableResizing: true,
        cell: (row) => {
          if (row.balanceAmount <= 0) {
            return (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-normal"
              >
                Đã tất toán
              </Badge>
            );
          }
          const isOver90 = row.agingDays > 90;
          const is61to90 = row.agingDays > 60 && row.agingDays <= 90;
          const is31to60 = row.agingDays > 30 && row.agingDays <= 60;
          const tagCls = isOver90
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : is61to90
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : is31to60
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-mono font-medium",
                tagCls,
              )}
            >
              {row.agingDays} ngày
            </Badge>
          );
        },
      },
      {
        key: "status",
        className: "text-center",
        header: headerFilter.client(
          "status",
          t("debts:drawer.status", "Trạng thái"),
          {
            filterOptions: [
              { label: "Đã xác nhận", value: "CONFIRMED" },
              { label: "Nháp", value: "DRAFT" },
              { label: "Đã hủy", value: "CANCELLED" },
            ],
          },
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <Badge
            variant={
              row.status === "CONFIRMED"
                ? "default"
                : row.status === "CANCELLED"
                  ? "destructive"
                  : "secondary"
            }
            className="w-[85px] inline-flex items-center justify-center text-center truncate text-[10px]"
          >
            {row.status === "CONFIRMED"
              ? "Đã xác nhận"
              : row.status === "CANCELLED"
                ? "Đã hủy"
                : "Nháp"}
          </Badge>
        ),
      },
    ];
  }, [headerFilter, formHook, t]);

  // Cumulative items up to current page for subtotal summary popover
  const cumulativeItems = useMemo(() => {
    const end = page * pageSize;
    return filteredInvoices.slice(0, end);
  }, [filteredInvoices, page, pageSize]);

  const cumulativeTotals = useMemo(() => {
    let cumPreVat = 0;
    let cumVat = 0;
    let cumTotal = 0;
    let cumPaid = 0;
    let cumBal = 0;

    for (const inv of cumulativeItems) {
      cumPreVat += Number(inv.preVatAmount) || 0;
      cumVat += Number(inv.vatAmount) || 0;
      cumTotal += Number(inv.totalAmount) || 0;
      cumPaid += Number(inv.paidAmount) || 0;
      cumBal += Number(inv.balanceAmount) || 0;
    }

    return {
      cumPreVat,
      cumVat,
      cumTotal,
      cumPaid,
      cumBal,
      cumCount: cumulativeItems.length,
    };
  }, [cumulativeItems]);

  // Subtotal summary row for drawer table (supporting pagination summary)
  const summaryRow = useMemo(() => {
    if (!filteredInvoices || filteredInvoices.length === 0) return undefined;

    let subtotalPreVat = 0;
    let subtotalVat = 0;
    let subtotalTotal = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;

    for (const inv of paginatedInvoices) {
      subtotalPreVat += Number(inv.preVatAmount) || 0;
      subtotalVat += Number(inv.vatAmount) || 0;
      subtotalTotal += Number(inv.totalAmount) || 0;
      subtotalPaid += Number(inv.paidAmount) || 0;
      subtotalBal += Number(inv.balanceAmount) || 0;
    }

    return {
      invoiceDate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedInvoices.length}
          totalCount={totalItems}
          cumulativeCount={cumulativeTotals.cumCount}
        />
      ),
      preVatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.preVatAmount", "Tiền trước thuế")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPreVat}
          cumulativeAmount={cumulativeTotals.cumPreVat}
          grandTotalAmount={totals.totalRevenue}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedInvoices.length}
          totalCount={totalItems}
          cumulativeCount={cumulativeTotals.cumCount}
          valueClassName="text-muted-foreground font-semibold"
        />
      ),
      vatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.vatAmount", "Tiền thuế VAT")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalVat}
          cumulativeAmount={cumulativeTotals.cumVat}
          grandTotalAmount={totals.totalRevenue}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedInvoices.length}
          totalCount={totalItems}
          cumulativeCount={cumulativeTotals.cumCount}
          valueClassName="text-muted-foreground font-semibold"
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.totalAmount", "Tổng giá trị hóa đơn")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalTotal}
          cumulativeAmount={cumulativeTotals.cumTotal}
          grandTotalAmount={totals.totalRevenue}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedInvoices.length}
          totalCount={totalItems}
          cumulativeCount={cumulativeTotals.cumCount}
          valueClassName="text-foreground font-bold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.paidAmount", "Đã thanh toán / Cấn trừ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPaid}
          cumulativeAmount={cumulativeTotals.cumPaid}
          grandTotalAmount={totals.totalPaid}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedInvoices.length}
          totalCount={totalItems}
          cumulativeCount={cumulativeTotals.cumCount}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.balanceAmount", "Tổng nợ còn lại")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalBal}
          cumulativeAmount={cumulativeTotals.cumBal}
          grandTotalAmount={totals.totalBalance}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedInvoices.length}
          totalCount={totalItems}
          cumulativeCount={cumulativeTotals.cumCount}
          valueClassName={
            subtotalBal === 0
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-destructive font-bold"
          }
        />
      ),
    };
  }, [
    paginatedInvoices,
    filteredInvoices.length,
    totalItems,
    page,
    totalPages,
    totals,
    cumulativeTotals,
    t,
  ]);

  const barIn = "#ea580c"; // Cam: Đầu vào / Chi phí
  const barOut = "#059669"; // Lục: Đầu ra / Doanh thu
  const cashTrendLabels = statsData?.cashTrend?.map((t) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t) => t.cashOut) || [];
  const cashTrendOut = statsData?.cashTrend?.map((t) => t.cashIn) || [];

  // Aging Donut chart items
  const agingDonutItems = useMemo(() => {
    return [
      {
        id: "aging0_30",
        label: t("debts:drawer.aging0_30", "0 - 30 ngày (Trong hạn)"),
        value: totals.aging0_30,
        color: "#10b981", // emerald-500
      },
      {
        id: "aging31_60",
        label: t("debts:drawer.aging31_60", "31 - 60 ngày (Cần theo dõi)"),
        value: totals.aging31_60,
        color: "#f59e0b", // amber-500
      },
      {
        id: "aging61_90",
        label: t("debts:drawer.aging61_90", "61 - 90 ngày (Quá hạn)"),
        value: totals.aging61_90,
        color: "#f97316", // orange-500
      },
      {
        id: "agingOver90",
        label: t(
          "debts:drawer.agingOver90",
          "> 90 ngày (Quá hạn nghiêm trọng)",
        ),
        value: totals.agingOver90,
        color: "#ef4444", // rose-500
      },
    ].filter((item) => item.value > 0 || totals.totalBalance === 0);
  }, [totals, t]);

  const overdueBalance =
    totals.aging31_60 + totals.aging61_90 + totals.agingOver90;
  const overdueRatioPct =
    totals.totalBalance > 0
      ? Math.round((overdueBalance / totals.totalBalance) * 100)
      : 0;
  const avgInvoiceVal =
    invoices.length > 0 ? Math.round(totals.totalRevenue / invoices.length) : 0;

  // Right Panel: 2-Tier Overview Information (Partner Info & Financial KPIs)
  const rightPanelContent = (
    <div className="space-y-3 pb-3">
      {/* SECTION 1: THÔNG TIN ĐỐI TÁC */}
      <DrawerSection
        title={t("debts:drawer.partnerInfoTitle", "Thông tin đối tác")}
        collapsible
        defaultCollapsed={false}
      >
        <DrawerRow
          label={t("debts:drawer.partnerName", "Tên đối tác")}
          value={resolvedName}
          cls="font-medium text-foreground"
        />
        <DrawerRow
          label={t("debts:drawer.taxCode", "Mã số thuế / MST")}
          value={
            taxCode === "KHONG_MST" || !taxCode ? "— (Không có MST)" : taxCode
          }
          cls="font-mono text-primary font-medium"
        />
        <DrawerRow
          label={t("debts:columns.partnerName", "Phân loại")}
          value={
            <Badge variant="outline" className="font-normal text-xs">
              {isCustomer
                ? t("debts:tabs.customers", "Khách hàng")
                : t("debts:tabs.suppliers", "Nhà cung cấp")}
            </Badge>
          }
        />
        <DrawerRow
          label={t("debts:drawer.address", "Địa chỉ")}
          value={partnerAddress || "—"}
        />
      </DrawerSection>

      {/* SECTION 2: TỔNG QUAN TÀI CHÍNH & KPI CÔNG NỢ */}
      <DrawerSection
        title={t(
          "debts:drawer.financialKpiTitle",
          "Tổng quan tài chính & Công nợ",
        )}
        collapsible
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* KPI 1: Tổng tiền HĐ */}
          <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t("debts:drawer.kpiTotalAmount", "Tổng tiền HĐ")}</span>
              <FileText className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-sm font-bold font-mono text-foreground truncate">
              {money(totals.totalRevenue)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {invoices.length} {t("debts:unitInvoice", "hóa đơn")}
            </div>
          </div>

          {/* KPI 2: Đã thanh toán */}
          <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {isCustomer
                  ? t("debts:received", "Đã thu")
                  : t("debts:paid", "Đã trả")}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 truncate">
              {money(totals.totalPaid)}
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {totals.recoveryRate}% hoàn tất
            </div>
          </div>

          {/* KPI 3: Còn nợ */}
          <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t("debts:drawer.balanceAmount", "Còn nợ")}</span>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div
              className={cn(
                "text-sm font-bold font-mono truncate",
                totals.totalBalance > 0
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {money(totals.totalBalance)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {totals.totalBalance > 0 ? "Cần đối soát" : "Đã tất toán"}
            </div>
          </div>

          {/* KPI 4: Tuổi nợ cao nhất */}
          <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t("debts:drawer.kpiMaxAging", "Tuổi nợ max")}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-sm font-bold font-mono text-amber-800 dark:text-amber-300">
              {totals.maxAging} ngày
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {totals.maxAging > 90
                ? ">90 ngày"
                : totals.maxAging > 60
                  ? "61-90 ngày"
                  : totals.maxAging > 30
                    ? "31-60 ngày"
                    : "0-30 ngày"}
            </div>
          </div>
        </div>

        {/* Phân bổ nợ theo thời hạn */}
        <div className="space-y-1.5 pt-1.5 border-t border-border/60">
          <div className="text-[11px] font-semibold text-muted-foreground mb-1">
            Phân bổ nợ theo thời hạn:
          </div>
          <DrawerRow
            label="0 - 30 ngày (Trong hạn)"
            value={
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {money(totals.aging0_30)}
              </span>
            }
          />
          <DrawerRow
            label="31 - 60 ngày (Cần theo dõi)"
            value={
              <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                {money(totals.aging31_60)}
              </span>
            }
          />
          <DrawerRow
            label="61 - 90 ngày (Quá hạn)"
            value={
              <span className="font-mono text-orange-600 dark:text-orange-400 font-medium">
                {money(totals.aging61_90)}
              </span>
            }
          />
          <DrawerRow
            label="> 90 ngày (Quá hạn nghiêm trọng)"
            value={
              <span className="font-mono text-destructive font-semibold">
                {money(totals.agingOver90)}
              </span>
            }
          />
        </div>
      </DrawerSection>
    </div>
  );

  // Tab 1 Content: Invoices List DataTable and Pagination
  const leftPanelContent = (
    <DrawerSection
      title={
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <ReceiptText className="w-4 h-4 text-muted-foreground" />
          <span>
            {t("debts:drawer.invoicesListTitle", "Danh sách hóa đơn chi tiết")}
          </span>
          {invoices.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground lowercase font-mono">
              ({filteredInvoices.length} / {invoices.length}{" "}
              {t("debts:unitInvoice", "hóa đơn")})
            </span>
          )}
        </div>
      }
      titleExtra={
        tableState.activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              tableState.resetFilters();
            }}
            className="text-[11px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 px-2 py-0.5 rounded-md border border-destructive/20 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa bộ lọc ({tableState.activeFilterCount})</span>
          </button>
        ) : undefined
      }
      collapsible={true}
      defaultCollapsed={false}
      className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
      bodyClassName="p-0"
    >
      <div className="h-[calc(100vh-395px)] min-h-[260px] max-h-[calc(100vh-395px)] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        <DataTable
          items={paginatedInvoices}
          columns={columns}
          getRowKey={(r) => r.id}
          loading={isLoadingInvoices}
          variant="spreadsheet"
          emptyLabel={t("debts:drawer.emptyInvoices", "Chưa có hóa đơn nào")}
          page={page}
          pageSize={pageSize}
          total={filteredInvoices.length}
          totalPages={totalPages}
          pageSizeOptions={[10, 20, 50]}
          onPage={setPage}
          onPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          summaryRow={summaryRow}
          containerClassName="flex-1 min-h-0"
        />
      </div>
    </DrawerSection>
  );

  // Tab 2 Content: Full-size Monthly Trend & Aging Breakdown & Health Analytics
  const analyticsContent = (
    <div className="space-y-4 pb-2">
      {/* SECTION 1: BIẾN ĐỘNG HÓA ĐƠN THEO THÁNG */}
      <DrawerSection
        title={t(
          "debts:drawer.trendChartTitle",
          "Biến động hóa đơn theo tháng",
        )}
        collapsible
        defaultCollapsed={false}
      >
        <div className="bg-card border rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="relative h-[240px] sm:h-[260px]">
            {isLoadingStats ? (
              <ChartSkeleton type="bar" />
            ) : cashTrendLabels.length > 0 ? (
              <BarChart
                labels={cashTrendLabels}
                yCallback={(v) => money(Number(v))}
                datasets={[
                  {
                    data: cashTrendIn,
                    color: barIn,
                    label: isCustomer
                      ? "HĐ Đầu vào (Mua từ KH)"
                      : "HĐ Đầu vào (Mua từ NCC)",
                  },
                  {
                    data: cashTrendOut,
                    color: barOut,
                    label: isCustomer
                      ? "HĐ Đầu ra (Bán cho KH)"
                      : "HĐ Đầu ra (Bán)",
                  },
                ]}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                <FileText className="w-8 h-8 opacity-30" />
                <span>Chưa có dữ liệu biến động dòng tiền theo tháng</span>
              </div>
            )}
          </div>
        </div>
      </DrawerSection>

      {/* SECTION 2 & 3: GRID 2 CỘT CHO CƠ CẤU TUỔI NỢ & SỨC KHỎE TÀI CHÍNH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KHỐI CƠ CẤU PHÂN BỔ TUỔI NỢ */}
        <DrawerSection
          title={t("debts:drawer.agingDistribution", "Cơ cấu phân bổ tuổi nợ")}
          collapsible
          defaultCollapsed={false}
        >
          <div className="bg-card border rounded-xl p-3.5 shadow-sm flex flex-col gap-3 min-h-[260px]">
            {totals.totalBalance > 0 ? (
              <>
                <div className="relative h-[150px]">
                  <DonutChart
                    items={agingDonutItems}
                    cutout="65%"
                    valueFormatter={(v) => money(Number(v))}
                  />
                </div>
                <DonutLegend
                  items={agingDonutItems}
                  valueFormatter={(v) => money(Number(v))}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-6 gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/80" />
                <div className="text-xs font-semibold text-foreground">
                  Đã tất toán toàn bộ công nợ
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Không còn dư nợ quá hạn đối với đối tác này.
                </div>
              </div>
            )}
          </div>
        </DrawerSection>

        {/* KHỐI SỨC KHỎE TÀI CHÍNH & THU HỒI NỢ */}
        <DrawerSection
          title={t(
            "debts:drawer.financialHealth",
            "Chỉ số sức khỏe tài chính & Thu hồi nợ",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="bg-card border rounded-xl p-3.5 shadow-sm flex flex-col justify-between gap-3 min-h-[260px]">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Thẻ 1: Giá trị TB / HĐ */}
              <div className="bg-muted/40 border border-border/60 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {t("debts:drawer.avgInvoiceValue", "Giá trị TB / HĐ")}
                  </span>
                  <Activity className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-sm font-bold font-mono text-foreground truncate">
                  {money(avgInvoiceVal)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {invoices.length} {t("debts:unitInvoice", "hóa đơn")}
                </div>
              </div>

              {/* Thẻ 2: Tỷ lệ hoàn tất */}
              <div className="bg-muted/40 border border-border/60 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {t("debts:drawer.kpiRecoveryRate", "Tỷ lệ thanh toán")}
                  </span>
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {totals.recoveryRate}%
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {totals.recoveryRate === 100
                    ? "Tất toán 100%"
                    : `${money(totals.totalPaid)}`}
                </div>
              </div>

              {/* Thẻ 3: Tỷ trọng quá hạn */}
              <div className="bg-muted/40 border border-border/60 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {t("debts:drawer.overdueRatio", "Tỷ trọng quá hạn")}
                  </span>
                  <AlertCircle
                    className={cn(
                      "w-3.5 h-3.5",
                      overdueRatioPct > 0
                        ? "text-destructive"
                        : "text-emerald-600",
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "text-sm font-bold font-mono",
                    overdueRatioPct > 0
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {overdueRatioPct}%
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {overdueBalance > 0
                    ? money(overdueBalance)
                    : "0 đ (Trong hạn)"}
                </div>
              </div>

              {/* Thẻ 4: Tuổi nợ tối đa */}
              <div className="bg-muted/40 border border-border/60 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{t("debts:drawer.kpiMaxAging", "Tuổi nợ max")}</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-sm font-bold font-mono text-amber-800 dark:text-amber-300">
                  {totals.maxAging} ngày
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {totals.totalBalance === 0
                    ? "Đã tất toán"
                    : totals.maxAging > 90
                      ? "Quá hạn nghiêm trọng"
                      : totals.maxAging > 30
                        ? "Cần theo dõi"
                        : "Trong hạn"}
                </div>
              </div>
            </div>

            {/* Thanh tiến độ thu hồi */}
            <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  Tiến độ thu hồi & cấn trừ công nợ:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {totals.recoveryRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[0.5px]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    totals.recoveryRate === 100
                      ? "bg-emerald-500"
                      : totals.recoveryRate >= 50
                        ? "bg-primary"
                        : "bg-amber-500",
                  )}
                  style={{ width: `${Math.max(totals.recoveryRate, 2)}%` }}
                />
              </div>
            </div>
          </div>
        </DrawerSection>
      </div>
    </div>
  );

  // Left Panel with top navigation PillTabs
  const leftPanel = (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + QUICK ACTIONS ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        {/* Bên trái: Sub-Tabs 1. Danh sách hóa đơn / 2. Biến động & Phân tích */}
        <div className="flex items-center gap-2">
          <PillTabs<"invoices" | "analytics">
            size="sm"
            value={activeSubTab}
            onValueChange={setActiveSubTab}
            items={[
              {
                value: "invoices",
                label: t("debts:drawer.tabInvoices", "1. Danh sách hóa đơn"),
                icon: ReceiptText,
                badgeCount: invoices.length > 0 ? invoices.length : undefined,
              },
              {
                value: "analytics",
                label: t(
                  "debts:drawer.tabAnalytics",
                  "2. Biến động & Phân tích",
                ),
                icon: TrendingUp,
              },
            ]}
          />
        </div>

        {/* Bên phải: Quick Actions & Count Summary */}
        <div className="flex items-center gap-2">
          {activeSubTab === "invoices" && (
            <>
              {tableState.activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => tableState.resetFilters()}
                  className="h-6 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-md border border-destructive/20 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa bộ lọc ({tableState.activeFilterCount})</span>
                </button>
              )}
              <span className="text-xs font-normal text-muted-foreground font-mono">
                {filteredInvoices.length} / {invoices.length}{" "}
                {t("debts:unitInvoice", "hóa đơn")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── 2. NỘI DUNG CHÍNH THEO SUB-TAB ─── */}
      {activeSubTab === "invoices" ? leftPanelContent : analyticsContent}
    </div>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="view"
        title={resolvedName}
        subtitle={
          <span className="text-xs text-muted-foreground font-mono font-normal">
            MST:{" "}
            {taxCode === "KHONG_MST" || !taxCode ? "Không có MST" : taxCode} •{" "}
            {isCustomer
              ? t("debts:tabs.customers", "Khách hàng")
              : t("debts:tabs.suppliers", "Nhà cung cấp")}
          </span>
        }
        icon={<Building2 className="w-5 h-5 text-primary shrink-0" />}
        size="xl"
        layout="2-columns"
        collapsibleRightPanel={true}
        leftPanel={leftPanel}
        rightPanel={rightPanelContent}
      />

      {/* Full Detail Invoice Internal Drawer */}
      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        form={formHook.form}
        fieldSet={(key: string, value: any) =>
          formHook.setForm((prev) => ({ ...prev, [key]: value }))
        }
        direction={formHook.form.direction || "IN"}
        postingState={formHook.postingState}
        pendingUnpost={formHook.pendingUnpost}
        onUnpost={() => formHook.setPendingUnpost(true)}
        rightPanel={
          <div className="flex flex-col gap-4">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.form.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <ErpInvoiceInternalMain
            detailInvoice={formHook.detailInvoice}
            invoicePreview={
              formHook.detailInvoice ? (
                <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
              ) : undefined
            }
          />
        </div>
      </ErpInvoiceInternalDrawer>
    </>
  );
}
