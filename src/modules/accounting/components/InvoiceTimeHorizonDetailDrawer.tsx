import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  DataTable,
  type DataTableColumn,
  createColumnHeaderFilter,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";
import {
  Calendar,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building2,
  Lightbulb,
  ExternalLink,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import {
  type TimeHorizonKey,
  type TimeHorizonInvoiceItem,
} from "../api/invoiceDashboardApi";
import { useTimeHorizonInvoices } from "../hooks/useTimeHorizonInvoices";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

export interface InvoiceTimeHorizonDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  horizon: TimeHorizonKey | null;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
}

export function InvoiceTimeHorizonDetailDrawer({
  open,
  onClose,
  horizon,
  dateFrom,
  dateTo,
  branchId,
  onOpenPartnerDetail,
}: InvoiceTimeHorizonDetailDrawerProps) {
  const { t } = useTranslation(["debts", "common"]);

  // Direction Filter State: 'ALL' | 'OUT' (Receivables) | 'IN' (Payables)
  const [direction, setDirection] = useState<"ALL" | "IN" | "OUT">("ALL");

  // Client Table Column State for Header Filters and Sorting
  const tableState = useTableColumnState(
    `time-horizon-detail-${horizon || "unknown"}`,
  );

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Reset pagination when filter/horizon/tab changes
  useEffect(() => {
    setPage(1);
  }, [
    horizon,
    direction,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
  ]);

  const activeSort = tableState.sorts[0];
  const sortBy = activeSort
    ? activeSort.startsWith("-")
      ? activeSort.slice(1)
      : activeSort
    : undefined;
  const sortOrder = activeSort
    ? activeSort.startsWith("-")
      ? ("DESC" as const)
      : ("ASC" as const)
    : ("DESC" as const);

  // Data Query Hook
  const { summary, items, total, totalPages, isLoading, isFetching, refetch } =
    useTimeHorizonInvoices({
      horizon,
      dateFrom,
      dateTo,
      branchId,
      direction,
      page,
      pageSize,
      sortBy,
      sortOrder,
      columnSearch: tableState.columnSearch,
      columnFilters: tableState.columnFilters,
      enabled: open && Boolean(horizon),
    });

  // Internal invoice drawer hook for viewing full invoice detail
  const handleReloadInvoices = useCallback(() => {
    void refetch();
  }, [refetch]);
  const formHook = useErpInvoiceForm(handleReloadInvoices);

  // Horizon Metadata & Badge info
  const horizonMeta = useMemo(() => {
    switch (horizon) {
      case "nextWeekDue":
        return {
          title: t("debts:dashboard.freshDebt7", "Mới phát sinh (≤ 7 ngày)"),
          badge: t("debts:dashboard.freshBadge", "Mới"),
          badgeVariant: "outline" as const,
          icon: <Calendar className="w-4 h-4 text-emerald-600" />,
          recommendation: t(
            "debts:horizonDrawer.recNextWeek",
            "Các khoản nợ mới phát sinh trong 7 ngày gần nhất, đang trong hạn luân chuyển chứng từ và chuẩn bị đối chiếu công nợ ban đầu.",
          ),
        };
      case "nextMonthDue":
        return {
          title: t(
            "debts:dashboard.standardDebt30",
            "Trong hạn chuẩn (≤ 30 ngày)",
          ),
          badge: t("debts:dashboard.standardBadge", "Chuẩn"),
          badgeVariant: "default" as const,
          icon: <Calendar className="w-4 h-4 text-primary" />,
          recommendation: t(
            "debts:horizonDrawer.recNextMonth",
            "Các khoản nợ trong hạn tiêu chuẩn thông thường (0-30 ngày). Cần theo dõi sát hạn thanh toán và chuẩn bị nguồn tiền cân đối dòng tiền chi trả.",
          ),
        };
      case "overdue30To90":
        return {
          title: t("debts:dashboard.overdue30To90", "Quá hạn 31-90 ngày"),
          badge: t("debts:dashboard.urgentBadge", "Đôn đốc"),
          badgeVariant: "outline" as const,
          icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
          recommendation: t(
            "debts:horizonDrawer.recOverdue30To90",
            "Các khoản nợ quá hạn từ 31 đến 90 ngày cần được đôn đốc quyết liệt. Gửi công văn đối soát và nhắc nợ đối với các khách hàng trọng yếu.",
          ),
        };
      case "criticalOverdue90Plus":
        return {
          title: t("debts:dashboard.criticalOverdue90Plus", "Quá hạn >90 ngày"),
          badge: t("debts:dashboard.warningBadge", "Cảnh báo"),
          badgeVariant: "destructive" as const,
          icon: <AlertOctagon className="w-4 h-4 text-rose-600" />,
          recommendation: t(
            "debts:horizonDrawer.recCriticalOverdue90Plus",
            "Cảnh báo rủi ro cao đối với các khoản nợ quá hạn >90 ngày. Cần kích hoạt quy trình thu hồi nợ nghiêm ngặt và xem xét trích lập dự phòng nợ phải thu khó đòi.",
          ),
        };
      case "forecastNext7Days":
        return {
          title: t(
            "debts:dashboard.forecastNext7Days",
            "Dự báo Tuần tới (7 ngày)",
          ),
          badge: t("debts:dashboard.forecastT7Badge", "T+7 (Lag)"),
          badgeVariant: "outline" as const,
          icon: <Calendar className="w-4 h-4 text-emerald-600" />,
          recommendation: t(
            "debts:horizonDrawer.recForecastNext7Days",
            "Dự phóng dòng tiền thực tế sẽ phát sinh trong 7 ngày tới dựa trên độ trễ thanh toán trung bình (DSO/DPO) lịch sử của từng đối tác.",
          ),
        };
      case "forecastNext30Days":
        return {
          title: t(
            "debts:dashboard.forecastNext30Days",
            "Kế hoạch Tháng tới (30 ngày)",
          ),
          badge: t("debts:dashboard.forecastT30Badge", "T+30 (Lag)"),
          badgeVariant: "default" as const,
          icon: <Calendar className="w-4 h-4 text-primary" />,
          recommendation: t(
            "debts:horizonDrawer.recForecastNext30Days",
            "Kế hoạch dòng tiền luân chuyển trong vòng 30 ngày tới. Cân đối các khoản thu từ khách hàng có độ trễ ngắn để chuẩn bị nguồn thanh toán cho nhà cung cấp.",
          ),
        };
      case "expectedCashflow":
        return {
          title: t(
            "debts:dashboard.expectedCashflow",
            "Dòng tiền Kỳ vọng (IFRS 9)",
          ),
          badge: t("debts:dashboard.forecastExpectedBadge", "Kỳ vọng"),
          badgeVariant: "outline" as const,
          icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
          recommendation: t(
            "debts:horizonDrawer.recExpectedCashflow",
            "Giá trị dòng tiền kỳ vọng thực thu/thực chi sau khi áp dụng ma trận xác suất thu hồi nợ IFRS 9 dựa trên mức độ trễ hạn của từng khoản nợ.",
          ),
        };
      case "defaultRiskProvision":
        return {
          title: t(
            "debts:dashboard.defaultRiskProvision",
            "Dự phòng Rủi ro Nợ",
          ),
          badge: t("debts:dashboard.forecastRiskBadge", "Rủi ro"),
          badgeVariant: "destructive" as const,
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          recommendation: t(
            "debts:horizonDrawer.recDefaultRiskProvision",
            "Giá trị nợ cần trích lập dự phòng rủi ro khó đòi theo IFRS 9 đối với các khoản nợ quá hạn kéo dài hoặc đối tác có lịch sử thanh toán chậm bất thường.",
          ),
        };
      default:
        return {
          title: t("debts:title", "Công nợ"),
          badge: "Chi tiết",
          badgeVariant: "default" as const,
          icon: <Clock className="w-4 h-4 text-primary" />,
          recommendation: "",
        };
    }
  }, [horizon, t]);

  // Direction Tab Items
  const directionTabs = useMemo<PillTabItem<"ALL" | "IN" | "OUT">[]>(
    () => [
      {
        value: "ALL",
        label: `${t("debts:horizonDrawer.tabAll", "Tất cả")} (${(summary?.receivableCount || 0) + (summary?.payableCount || 0)})`,
      },
      {
        value: "OUT",
        label: `${t("debts:horizonDrawer.tabReceivables", "Phải thu (Bán ra)")} (${summary?.receivableCount || 0}) • +${money(summary?.receivableAmount || 0)}`,
      },
      {
        value: "IN",
        label: `${t("debts:horizonDrawer.tabPayables", "Phải trả (Mua vào)")} (${summary?.payableCount || 0}) • -${money(summary?.payableAmount || 0)}`,
      },
    ],
    [summary, t],
  );

  // Column Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items,
        defaultAlign: "center",
      }),
    [tableState, items],
  );

  // Table Columns Definition according to /standardize-table
  const columns: DataTableColumn<TimeHorizonInvoiceItem>[] = useMemo(() => {
    return [
      // 1. STT (#) - 40px, Center aligned, 1-based index via {idx}
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

      // 2. Số hóa đơn (invoiceNo) - Clickable to open ErpInvoiceInternalDrawer
      {
        key: "invoiceNo",
        header: headerFilter("invoiceNo", t("debts:drawer.invoiceNo", "Số HĐ")),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.invoiceNo || "—"}
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

      // 3. Ký hiệu (serialNo)
      {
        key: "serialNo",
        header: headerFilter("serialNo", t("debts:drawer.serialNo", "Ký hiệu")),
        size: 110,
        minSize: 90,
        enableResizing: true,
        className: "text-left font-mono text-xs text-muted-foreground",
        cell: (row) => row.serialNo || "—",
      },

      // 4. Ngày HĐ (invoiceDate) - TableDateCell right aligned
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

      // 5. Loại HĐ (direction) - Bán ra / Mua vào
      {
        key: "direction",
        className: "text-center",
        header: headerFilter.client(
          "direction",
          t("common:type", "Phân loại"),
          {
            filterOptions: [
              { label: "Bán ra (Thu)", value: "OUT" },
              { label: "Mua vào (Chi)", value: "IN" },
            ],
          },
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <Badge
            variant={row.direction === "OUT" ? "default" : "secondary"}
            className={cn(
              "text-[10px] px-2 py-0 h-5 font-medium inline-flex items-center justify-center",
              row.direction === "OUT"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200",
            )}
          >
            {row.direction === "OUT" ? "Bán ra (Thu)" : "Mua vào (Chi)"}
          </Badge>
        ),
      },

      // 6. Đối tác (partnerName) - Clickable to open Partner Debt Drawer
      {
        key: "partnerName",
        header: headerFilter(
          "partnerName",
          t("debts:columns.partnerName", "Đối tác"),
        ),
        size: 240,
        minSize: 200,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.partnerName || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="truncate text-foreground font-medium text-xs leading-tight select-text"
            onDetailClick={(e) => {
              e?.stopPropagation();
              if (row.taxCode) {
                onOpenPartnerDetail?.(row.taxCode, row.partnerName);
              }
            }}
          />
        ),
      },

      // 7. Mã số thuế / CCCD (taxCode)
      {
        key: "taxCode",
        header: headerFilter(
          "taxCode",
          t("debts:columns.taxCode", "Mã số thuế"),
        ),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={
              row.taxCode === "KHONG_MST"
                ? "— (Không có MST)"
                : row.taxCode || "—"
            }
            enableCopy={Boolean(row.taxCode && row.taxCode !== "KHONG_MST")}
            tooltip={true}
            className="font-mono text-muted-foreground font-normal text-xs"
          />
        ),
      },

      // 8. Tổng tiền (totalAmount)
      {
        key: "totalAmount",
        className: "text-right",
        header: headerFilter.amount(
          "totalAmount",
          t("debts:drawer.totalAmount", "Tổng tiền"),
        ),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
            {money(row.totalAmount)}
          </span>
        ),
      },

      // 9. Đã thu / Đã trả (paidAmount)
      {
        key: "paidAmount",
        className: "text-right",
        header: headerFilter.amount(
          "paidAmount",
          t("debts:drawer.paidAmount", "Đã cấn trừ"),
        ),
        size: 130,
        minSize: 110,
        enableResizing: true,
        cell: (row) => (
          <span className="tabular-nums font-mono font-medium text-xs text-emerald-700 dark:text-emerald-400">
            {money(row.paidAmount)}
          </span>
        ),
      },

      // 10. Còn nợ (balanceAmount)
      {
        key: "balanceAmount",
        className: "text-right",
        header: headerFilter.amount(
          "balanceAmount",
          t("debts:drawer.balanceAmount", "Còn nợ"),
        ),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "tabular-nums font-mono font-bold text-xs",
              row.direction === "OUT"
                ? "text-rose-600 dark:text-rose-400"
                : "text-amber-700 dark:text-amber-400",
            )}
          >
            {money(row.balanceAmount)}
          </span>
        ),
      },

      // 11. Tuổi nợ (agingDays)
      {
        key: "agingDays",
        className: "text-center",
        header: headerFilter.numeric(
          "agingDays",
          t("debts:drawer.agingDays", "Tuổi nợ"),
        ),
        size: 110,
        minSize: 95,
        enableResizing: true,
        cell: (row) => {
          const aging = row.agingDays || 0;
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;
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
              {aging} ngày
            </Badge>
          );
        },
      },

      // 12. Độ trễ TB đối tác (partnerAvgLagDays)
      {
        key: "partnerAvgLagDays",
        className: "text-center",
        header: headerFilter.numeric(
          "partnerAvgLagDays",
          t("debts:columns.partnerAvgLagDays", "Độ trễ TB"),
        ),
        size: 110,
        minSize: 95,
        enableResizing: true,
        cell: (row) => {
          const lag = row.partnerAvgLagDays ?? 30;
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {lag} ngày
            </span>
          );
        },
      },

      // 13. Ngày dự kiến về tiền / thanh toán (estimatedSettlementDate)
      {
        key: "estimatedSettlementDate",
        className: "text-right",
        header: headerFilter.date(
          "estimatedSettlementDate",
          t("debts:columns.estimatedSettlementDate", "Dự kiến thu/trả"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row) => (
          <TableDateCell
            date={row.estimatedSettlementDate}
            format="date"
            className="justify-end w-full font-medium text-primary"
          />
        ),
      },

      // 14. Trạng thái (status)
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
        size: 115,
        minSize: 105,
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
  }, [headerFilter, formHook, onOpenPartnerDetail, t]);

  // Subtotal Summary Row for DataTable
  const summaryRow = useMemo(() => {
    if (!items || items.length === 0) return undefined;

    let subtotalTotal = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;

    for (const inv of items) {
      subtotalTotal += Number(inv.totalAmount) || 0;
      subtotalPaid += Number(inv.paidAmount) || 0;
      subtotalBal += Number(inv.balanceAmount) || 0;
    }

    const grandTotal =
      (summary?.receivableAmount || 0) + (summary?.payableAmount || 0);

    return {
      invoiceDate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.totalAmount", "Tổng giá trị hóa đơn")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalTotal}
          grandTotalAmount={grandTotal}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-foreground font-bold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.paidAmount", "Đã thanh toán / Cấn trừ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPaid}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.balanceAmount", "Tổng nợ còn lại")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={grandTotal}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-destructive font-bold"
        />
      ),
    };
  }, [items, summary, page, totalPages, total, t]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("debts:horizonDrawer.title", { name: horizonMeta.title, defaultValue: `Chi tiết Mốc thời gian: ${horizonMeta.title}` })}`}
        subtitle={t(
          "debts:horizonDrawer.subtitle",
          "Theo dõi chi tiết hóa đơn phát sinh, tiến độ cấn trừ và cơ cấu nợ theo mốc thời gian",
        )}
        titleExtra={
          <Badge variant={horizonMeta.badgeVariant}>{horizonMeta.badge}</Badge>
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        leftPanel={
          <div className="space-y-3.5 pb-4">
            {/* Section 1: Direction Filter Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <PillTabs<"ALL" | "IN" | "OUT">
                items={directionTabs}
                value={direction}
                onValueChange={(val) => setDirection(val)}
              />
              {tableState.activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    tableState.resetFilters();
                    setPage(1);
                  }}
                  className="text-xs font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2.5 py-1 rounded-full"
                >
                  {t("common:clearFilters", "Xóa bộ lọc")} (
                  {tableState.activeFilterCount})
                </button>
              )}
            </div>

            {/* Section 2: Embedded DataTable */}
            <DrawerSection
              title={`${t("debts:horizonDrawer.invoicesList", "Danh sách hóa đơn chi tiết")} (${total})`}
              collapsible
              defaultCollapsed={false}
            >
              <DataTable<TimeHorizonInvoiceItem>
                tableId="time-horizon-invoices-table"
                items={items}
                columns={columns}
                variant="spreadsheet"
                enableColumnResizing={true}
                getRowKey={(r) => r.id}
                loading={isLoading || isFetching}
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPage={(p) => setPage(p)}
                onPageSize={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                summaryRow={summaryRow}
                emptyLabel={t(
                  "debts:horizonDrawer.emptyInvoices",
                  "Không tìm thấy hóa đơn nào trong mốc thời gian này",
                )}
              />
            </DrawerSection>
          </div>
        }
        rightPanel={
          <div className="space-y-3.5 pb-4">
            {/* Tier 1: Financial KPI Overview */}
            <DrawerSection
              title={t(
                "debts:horizonDrawer.financialSummary",
                "Tổng quan tài chính mốc thời gian",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="space-y-2.5">
                {/* Expected In (Dự thu) */}
                <div className="p-3 rounded-xl border border-border/70 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {t("debts:dashboard.expectedIn", "Dự thu (Phải thu)")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {summary?.receivableCount || 0}{" "}
                        {t("debts:unitInvoice", "hóa đơn")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    +{money(summary?.receivableAmount || 0)}
                  </div>
                </div>

                {/* Expected Out (Dự chi) */}
                <div className="p-3 rounded-xl border border-border/70 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {t("debts:dashboard.expectedOut", "Dự chi (Phải trả)")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {summary?.payableCount || 0}{" "}
                        {t("debts:unitInvoice", "hóa đơn")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                    -{money(summary?.payableAmount || 0)}
                  </div>
                </div>

                {/* Net Position (Vị thế ròng) */}
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {t("debts:dashboard.netFlow", "Vị thế ròng")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(summary?.netAmount || 0) >= 0
                          ? t(
                              "debts:horizonDrawer.surplus",
                              "Thặng dư dòng tiền",
                            )
                          : t("debts:horizonDrawer.deficit", "Áp lực chi trả")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-right font-mono font-bold text-sm",
                      (summary?.netAmount || 0) >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {(summary?.netAmount || 0) >= 0 ? "+" : ""}
                    {money(summary?.netAmount || 0)}
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* Tier 2: Top Debtors in this Horizon */}
            <DrawerSection
              title={t(
                "debts:horizonDrawer.topPartners",
                "Top đối tác trọng yếu trong kỳ",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="space-y-3">
                {/* Top Receivable Customers */}
                <div>
                  <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t(
                      "debts:horizonDrawer.topCustomers",
                      "Top 5 Khách hàng nợ nhiều nhất",
                    )}
                  </div>
                  {(summary?.topReceivablePartners?.length || 0) > 0 ? (
                    <div className="space-y-1.5">
                      {summary?.topReceivablePartners.map((p, idx) => (
                        <div
                          key={p.taxCode + idx}
                          onClick={() =>
                            onOpenPartnerDetail?.(p.taxCode, p.partnerName)
                          }
                          className="group flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                              <span className="truncate">{p.partnerName}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-primary" />
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {p.taxCode} • {p.invoiceCount} HĐ
                            </div>
                          </div>
                          <div className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {money(p.balanceAmount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic py-1">
                      {t("common:noData", "Không có dữ liệu")}
                    </div>
                  )}
                </div>

                {/* Top Payable Suppliers */}
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    {t(
                      "debts:horizonDrawer.topSuppliers",
                      "Top 5 Nhà cung cấp cần thanh toán",
                    )}
                  </div>
                  {(summary?.topPayablePartners?.length || 0) > 0 ? (
                    <div className="space-y-1.5">
                      {summary?.topPayablePartners.map((p, idx) => (
                        <div
                          key={p.taxCode + idx}
                          onClick={() =>
                            onOpenPartnerDetail?.(p.taxCode, p.partnerName)
                          }
                          className="group flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                              <span className="truncate">{p.partnerName}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-primary" />
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {p.taxCode} • {p.invoiceCount} HĐ
                            </div>
                          </div>
                          <div className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0">
                            {money(p.balanceAmount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic py-1">
                      {t("common:noData", "Không có dữ liệu")}
                    </div>
                  )}
                </div>
              </div>
            </DrawerSection>

            {/* Tier 3: Actionable Recommendations */}
            {horizonMeta.recommendation && (
              <DrawerSection
                title={t(
                  "debts:horizonDrawer.recommendations",
                  "Hành động đề xuất & Quản trị rủi ro",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-foreground/90">
                    {horizonMeta.recommendation}
                  </div>
                </div>
              </DrawerSection>
            )}
          </div>
        }
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
