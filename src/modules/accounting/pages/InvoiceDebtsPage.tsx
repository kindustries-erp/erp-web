import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  ReceiptText,
  Eye,
  FileText,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import type { TabItem } from "@/shared/components/PageLayout";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { useInvoiceDebtsList } from "../hooks/useInvoiceDebtsList";
import { invoiceDebtsApi, type InvoiceDebtItem } from "../api/invoiceDebtsApi";
import { InvoicePartnerDebtDetailDrawer } from "../components/InvoicePartnerDebtDetailDrawer";
import { InvoiceDebtsExportDrawer } from "../components/InvoiceDebtsExportDrawer";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";

export function InvoiceDebtsPage() {
  const { t } = useTranslation(["debts", "common"]);
  const canRead = useHasAnyPermission(
    [ErpResource.INVOICE_DEBTS, ErpResource.INVOICES],
    ErpAction.READ,
  );

  // 1. Tab State synchronized with URL Query Param (?tab=customers | ?tab=suppliers)
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "suppliers") return "suppliers";
    }
    return "customers";
  });

  const handleTabChange = useCallback((newTab: string) => {
    const validTab = newTab === "suppliers" ? "suppliers" : "customers";
    setActiveTab(validTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (validTab === "customers") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", validTab);
      }
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const pageTabs: TabItem[] = useMemo(
    () => [
      {
        value: "customers",
        label: t("debts:tabs.customers", "Khách hàng"),
      },
      {
        value: "suppliers",
        label: t("debts:tabs.suppliers", "Nhà cung cấp"),
      },
    ],
    [t],
  );

  const isCustomer = activeTab === "customers";

  // 2. Data Hook
  const listHook = useInvoiceDebtsList(activeTab);

  // 3. Detail Drawer & Export Drawer State
  const [selectedPartner, setSelectedPartner] = useState<{
    taxCode: string;
    partnerName?: string;
  } | null>(null);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);

  const openDetail = useCallback((taxCode: string, partnerName?: string) => {
    setSelectedPartner({ taxCode, partnerName });
  }, []);

  const handleQuickExport = useCallback(async () => {
    try {
      toast.loading(
        t("debts:exportDrawer.toast.downloading", "Đang xuất file Excel..."),
        { id: "quick-export-debt" },
      );
      const blob = await invoiceDebtsApi.exportExcel({
        partner_type: listHook.partnerType,
        search: listHook.search || undefined,
        date_from: listHook.dateFrom || undefined,
        date_to: listHook.dateTo || undefined,
        column_search:
          Object.keys(listHook.columnSearch).length > 0
            ? JSON.stringify(listHook.columnSearch)
            : undefined,
        column_filters:
          Object.keys(listHook.columnFilters).length > 0
            ? JSON.stringify(listHook.columnFilters)
            : undefined,
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = `Bao_cao_cong_no_${activeTab === "suppliers" ? "nha_cung_cap" : "khach_hang"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);
      toast.success(
        t("debts:exportDrawer.toast.downloading", "Đã tải xuống file Excel."),
        { id: "quick-export-debt" },
      );
    } catch (e: any) {
      toast.error(
        e?.message ||
          t(
            "debts:exportDrawer.error.downloadFailed",
            "Không thể xuất file Excel.",
          ),
        { id: "quick-export-debt" },
      );
    }
  }, [activeTab, listHook, t]);

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("common:search", "Tra cứu"),
        items: [
          {
            label: t("debts:exportDetailed", "Xuất Excel theo kỳ / Nâng cao"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: () => setExportDrawerOpen(true),
          },
          {
            label: t("debts:exportCurrentView", "Xuất nhanh dữ liệu hiện tại"),
            icon: <Download className="w-4 h-4 text-primary" />,
            onClick: handleQuickExport,
          },
        ],
      },
    ],
    [handleQuickExport, t],
  );

  // 4. Server-Side Column Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: `invoice-debts-column-options-${activeTab}`,
        fetchOptions: async ({ columnKey, search, pageParam, filtersStr }) => {
          const res = await invoiceDebtsApi.getColumnOptions({
            partner_type: listHook.partnerType,
            column_key: columnKey,
            search,
            page: pageParam,
            pageSize: 20,
            filters: filtersStr,
            date_from: listHook.dateFrom || undefined,
            date_to: listHook.dateTo || undefined,
          });
          return {
            items: res.items,
            total: res.total,
            next: res.next,
          };
        },
      }),
    [listHook, activeTab],
  );

  // 5. Columns Definition Following /standardize-table & /garage-cases
  const columns: DataTableColumn<InvoiceDebtItem>[] = useMemo(() => {
    return [
      // 1. STT (40px, 1-based, căn giữa)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },

      // 2. Tên đối tác (Khách hàng hoặc Nhà cung cấp) - BẬT ICON MẮT / XEM CHI TIẾT
      {
        key: "partnerName",
        header: headerFilter(
          "partnerName",
          isCustomer
            ? t("debts:columns.customerName", "Tên khách hàng")
            : t("debts:columns.supplierName", "Tên nhà cung cấp"),
          { showBlankOption: true },
        ),
        size: 280,
        minSize: 220,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.partnerName || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="truncate text-foreground font-medium text-xs leading-tight select-text"
            onDetailClick={(e) => {
              e?.stopPropagation();
              openDetail(row.taxCode, row.partnerName);
            }}
          />
        ),
      },

      // 3. Mã số thuế / Mã định danh đối tác - TẮT ICON MẮT, GIỮ COPY
      {
        key: "taxCode",
        header: headerFilter(
          "taxCode",
          t("debts:columns.taxCode", "Mã số thuế / MST"),
          {
            showBlankOption: true,
          },
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={
              row.taxCode === "KHONG_MST" ? "— (Không có MST)" : row.taxCode
            }
            enableCopy={row.taxCode !== "KHONG_MST"}
            tooltip={true}
            className="font-mono text-muted-foreground font-normal text-xs"
          />
        ),
      },

      // 4. Số lượng hóa đơn - THIẾT KẾ WOW, HIỆN ĐẠI & HÀI HÒA BẢNG TÍNH
      {
        key: "invoiceCount",
        header: headerFilter.qty(
          "invoiceCount",
          t("debts:columns.invoiceCount", "SL Hóa đơn"),
        ),
        size: 120,
        minSize: 105,
        enableResizing: true,
        className: "text-center",
        cell: (row) => {
          if (!row.invoiceCount || row.invoiceCount <= 0) {
            return (
              <span className="text-muted-foreground/30 font-mono text-xs select-none">
                0
              </span>
            );
          }
          return (
            <Tooltip
              content={`${row.invoiceCount} hóa đơn phát sinh • Click xem chi tiết`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(row.taxCode, row.partnerName);
                }}
                className="inline-flex items-center justify-center gap-1 px-2 py-0 h-[20px] rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-foreground transition-all duration-150 cursor-pointer group shadow-xs hover:scale-105"
              >
                <FileText className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
                  {row.invoiceCount.toLocaleString("vi-VN")}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  HĐ
                </span>
              </button>
            </Tooltip>
          );
        },
      },

      // 5. Tổng phải thu / Tổng phải trả (Progress bar + Tooltip như /garage-cases)
      {
        key: "paymentProgress",
        className: "text-right",
        header: headerFilter(
          "paymentProgress",
          isCustomer
            ? t("debts:columns.totalReceivable", "Tổng phải thu")
            : t("debts:columns.totalPayable", "Tổng phải trả"),
          {
            align: "right",
            filterOptions: isCustomer
              ? [
                  {
                    label: t("debts:filter.paidCustomer", "Đã thu đủ"),
                    value: "PAID",
                  },
                  {
                    label: t("debts:filter.partialCustomer", "Thu một phần"),
                    value: "PARTIAL",
                  },
                  {
                    label: t("debts:filter.unpaidCustomer", "Chưa thu"),
                    value: "UNPAID",
                  },
                ]
              : [
                  {
                    label: t("debts:filter.paidSupplier", "Đã trả đủ"),
                    value: "PAID",
                  },
                  {
                    label: t("debts:filter.partialSupplier", "Trả một phần"),
                    value: "PARTIAL",
                  },
                  {
                    label: t("debts:filter.unpaidSupplier", "Chưa trả"),
                    value: "UNPAID",
                  },
                ],
          },
        ),
        size: 190,
        enableResizing: true,
        cell: (row) => {
          const total = Number(row.totalAmount) || 0;
          const paid = Number(row.paidAmount) || 0;
          const bal = Number(row.balanceAmount) || 0;

          if (total <= 0 && bal <= 0 && paid <= 0) {
            return (
              <span className="text-muted-foreground/40 font-normal select-none">
                —
              </span>
            );
          }

          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && bal > 0;
          const rate =
            total > 0
              ? Math.min(100, Math.round((paid / total) * 100))
              : isAllPaid
                ? 100
                : 0;

          const tooltipText = isCustomer
            ? isAllPaid
              ? `Đã thu đủ 100%: ${money(paid)}`
              : isUnpaid
                ? `Chưa thu (0%): Còn phải thu ${money(bal)} / Tổng ${money(total)}`
                : `Đã thu: ${money(paid)} / ${money(total)} (${rate}%) • Còn phải thu: ${money(bal)}`
            : isAllPaid
              ? `Đã trả đủ 100%: ${money(paid)}`
              : isUnpaid
                ? `Chưa trả (0%): Còn phải trả ${money(bal)} / Tổng ${money(total)}`
                : `Đã trả: ${money(paid)} / ${money(total)} (${rate}%) • Còn phải trả: ${money(bal)}`;

          return (
            <Tooltip content={tooltipText}>
              <div className="flex flex-col gap-0.5 w-full py-0 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAllPaid
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : isUnpaid
                          ? "bg-transparent"
                          : isCustomer
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : "bg-slate-600 dark:bg-slate-400",
                    )}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        },
      },

      // 6. Còn phải thu / Còn phải trả (Highlight màu sắc như /garage-cases)
      {
        key: "balanceAmount",
        className: "text-right",
        header: headerFilter.amount(
          "balanceAmount",
          isCustomer
            ? t("debts:columns.remainingReceivable", "Còn phải thu")
            : t("debts:columns.remainingPayable", "Còn phải trả"),
        ),
        size: 170,
        enableResizing: true,
        cell: (row) => {
          const bal = Number(row.balanceAmount) || 0;
          return (
            <span
              className={cn(
                "font-semibold tabular-nums font-mono text-xs",
                bal === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isCustomer
                    ? "text-destructive"
                    : "text-amber-700 dark:text-amber-400",
              )}
            >
              {money(bal)}
            </span>
          );
        },
      },

      // 7. Nợ 0-30 ngày - Xanh lá Emerald
      {
        key: "aging0To30",
        className:
          "text-right bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs",
        headerClassName:
          "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "aging0To30",
          t("debts:columns.aging0_30", "0-30 ngày"),
        ),
        size: 155,
        minSize: 135,
        enableResizing: true,
        cell: (row) => {
          const val = Number(row.aging0To30) || 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },

      // 8. Nợ 31-60 ngày - Vàng Amber
      {
        key: "aging31To60",
        className:
          "text-right bg-amber-50/40 dark:bg-amber-950/20 font-mono text-xs",
        headerClassName:
          "bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "aging31To60",
          t("debts:columns.aging31_60", "31-60 ngày"),
        ),
        size: 155,
        minSize: 135,
        enableResizing: true,
        cell: (row) => {
          const val = Number(row.aging31To60) || 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-semibold text-amber-800 dark:text-amber-300 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },

      // 9. Nợ 61-90 ngày - Cam Orange
      {
        key: "aging61To90",
        className:
          "text-right bg-orange-50/40 dark:bg-orange-950/20 font-mono text-xs",
        headerClassName:
          "bg-orange-50/80 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "aging61To90",
          t("debts:columns.aging61_90", "61-90 ngày"),
        ),
        size: 155,
        minSize: 135,
        enableResizing: true,
        cell: (row) => {
          const val = Number(row.aging61To90) || 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-semibold text-orange-700 dark:text-orange-400 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },

      // 10. Nợ >90 ngày - Đỏ Rose
      {
        key: "agingOver90",
        className:
          "text-right bg-rose-50/40 dark:bg-rose-950/20 font-mono text-xs",
        headerClassName:
          "bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "agingOver90",
          t("debts:columns.agingOver90", ">90 ngày"),
        ),
        size: 160,
        minSize: 140,
        enableResizing: true,
        cell: (row) => {
          const val = Number(row.agingOver90) || 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },

      // 11. Tuổi nợ (Multi-Bracket Aging - Stacked Progress Bar, Rich Tooltip & Smart Badges)
      {
        key: "maxAgingDays",
        className: "text-left",
        header: headerFilter(
          "maxAgingDays",
          t("debts:columns.agingOverview", "Tuổi nợ & Rủi ro"),
        ),
        size: 210,
        minSize: 180,
        enableResizing: true,
        cell: (row) => {
          const bal = Number(row.balanceAmount) || 0;
          const aging = row.maxAgingDays || 0;
          const weightedAging = row.weightedAgingDays || 0;
          const a0_30 = Number(row.aging0To30) || 0;
          const a31_60 = Number(row.aging31To60) || 0;
          const a61_90 = Number(row.aging61To90) || 0;
          const aOver90 = Number(row.agingOver90) || 0;
          const c0_30 = Number(row.count0To30) || 0;
          const c31_60 = Number(row.count31To60) || 0;
          const c61_90 = Number(row.count61To90) || 0;
          const cOver90 = Number(row.countOver90) || 0;

          if (bal <= 0) {
            return (
              <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    0 ngày
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-sans border font-normal bg-slate-50 dark:bg-slate-800/40 text-muted-foreground/70 border-slate-200/60 dark:border-slate-700/40">
                    {t("debts:filter.paid", "Đã tất toán")}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden" />
              </div>
            );
          }

          const p0_30 = bal > 0 ? (a0_30 / bal) * 100 : 0;
          const p31_60 = bal > 0 ? (a31_60 / bal) * 100 : 0;
          const p61_90 = bal > 0 ? (a61_90 / bal) * 100 : 0;
          const pOver90 = bal > 0 ? (aOver90 / bal) * 100 : 0;

          const activeBuckets = [a0_30, a31_60, a61_90, aOver90].filter(
            (v) => v > 0,
          ).length;

          let badgeLabel = "0-30 ngày";
          let badgeCls =
            "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40";
          let mainText = `${aging} ngày`;
          let mainTextCls =
            "text-emerald-700 dark:text-emerald-400 font-medium";

          if (activeBuckets > 1) {
            mainText = weightedAging ? `BQ ${weightedAging}d` : `Max ${aging}d`;
            if (aOver90 > 0) {
              badgeLabel = "Đa tầng (>90d)";
              badgeCls =
                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50";
              mainTextCls = "text-rose-700 dark:text-rose-400 font-bold";
            } else if (a61_90 > 0) {
              badgeLabel = "Đa tầng (61-90d)";
              badgeCls =
                "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50";
              mainTextCls =
                "text-orange-700 dark:text-orange-400 font-semibold";
            } else {
              badgeLabel = "Đa tầng (0-60d)";
              badgeCls =
                "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40";
              mainTextCls = "text-amber-800 dark:text-amber-300 font-semibold";
            }
          } else {
            if (aOver90 > 0 || aging > 90) {
              badgeLabel = ">90 ngày";
              badgeCls =
                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50";
              mainTextCls = "text-rose-700 dark:text-rose-400 font-bold";
            } else if (a61_90 > 0 || (aging > 60 && aging <= 90)) {
              badgeLabel = "61-90 ngày";
              badgeCls =
                "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50";
              mainTextCls =
                "text-orange-700 dark:text-orange-400 font-semibold";
            } else if (a31_60 > 0 || (aging > 30 && aging <= 60)) {
              badgeLabel = "31-60 ngày";
              badgeCls =
                "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40";
              mainTextCls = "text-amber-800 dark:text-amber-300 font-semibold";
            }
          }

          const tooltipContent = (
            <div className="flex flex-col gap-2 p-1 text-xs min-w-[260px]">
              <div className="font-semibold text-foreground border-b border-border/50 pb-1 flex justify-between items-center">
                <span>Cơ cấu phân tầng tuổi nợ</span>
                <span className="text-[11px] font-mono font-normal text-muted-foreground">
                  Tổng nợ: {money(bal)}
                </span>
              </div>
              <div className="space-y-1.5 tabular-nums">
                {a0_30 > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                      0-30 ngày (Trong hạn):
                    </span>
                    <span className="font-mono font-medium">
                      {money(a0_30)} {c0_30 > 0 ? `(${c0_30} HĐ)` : ""} •{" "}
                      {Math.round(p0_30)}%
                    </span>
                  </div>
                )}
                {a31_60 > 0 && (
                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                      31-60 ngày (Cần theo dõi):
                    </span>
                    <span className="font-mono font-medium">
                      {money(a31_60)} {c31_60 > 0 ? `(${c31_60} HĐ)` : ""} •{" "}
                      {Math.round(p31_60)}%
                    </span>
                  </div>
                )}
                {a61_90 > 0 && (
                  <div className="flex justify-between items-center text-orange-700 dark:text-orange-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shrink-0" />
                      61-90 ngày (Quá hạn):
                    </span>
                    <span className="font-mono font-medium">
                      {money(a61_90)} {c61_90 > 0 ? `(${c61_90} HĐ)` : ""} •{" "}
                      {Math.round(p61_90)}%
                    </span>
                  </div>
                )}
                {aOver90 > 0 && (
                  <div className="flex justify-between items-center text-rose-700 dark:text-rose-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
                      &gt;90 ngày (Quá hạn nặng):
                    </span>
                    <span className="font-mono font-bold">
                      {money(aOver90)} {cOver90 > 0 ? `(${cOver90} HĐ)` : ""} •{" "}
                      {Math.round(pOver90)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-1 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
                <span>
                  Tuổi nợ max: <b>{aging} ngày</b>
                </span>
                {weightedAging > 0 && (
                  <span>
                    Tuổi nợ BQ: <b>{weightedAging} ngày</b>
                  </span>
                )}
              </div>
            </div>
          );

          return (
            <Tooltip content={tooltipContent}>
              <div className="flex flex-col gap-1.5 w-full py-1 justify-center cursor-pointer group">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className={cn("font-mono text-xs", mainTextCls)}>
                    {mainText}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 border leading-none font-medium",
                      badgeCls,
                    )}
                  >
                    {badgeLabel}
                  </span>
                </div>
                {/* Multi-Segment Stacked Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                  {p0_30 > 0 && (
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                      style={{ width: `${p0_30}%` }}
                    />
                  )}
                  {p31_60 > 0 && (
                    <div
                      className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
                      style={{ width: `${p31_60}%` }}
                    />
                  )}
                  {p61_90 > 0 && (
                    <div
                      className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-300"
                      style={{ width: `${p61_90}%` }}
                    />
                  )}
                  {pOver90 > 0 && (
                    <div
                      className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-300"
                      style={{ width: `${pOver90}%` }}
                    />
                  )}
                </div>
              </div>
            </Tooltip>
          );
        },
      },

      // 12. Ngày hóa đơn phát sinh gần nhất
      {
        key: "latestInvoiceDate",
        className: "text-right",
        header: headerFilter.date(
          "latestInvoiceDate",
          t("debts:columns.latestInvoiceDate", "Ngày HĐ gần nhất"),
        ),
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <TableDateCell
            date={row.latestInvoiceDate || ""}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
    ];
  }, [headerFilter, isCustomer, openDetail, t]);

  // 6. Subtotal Summary Row With SubtotalSummaryCell Popovers
  const summaryRow = useMemo(() => {
    const items = listHook.data;
    if (!items || items.length === 0) return undefined;

    let subtotalInvoices = 0;
    let subtotalAmount = 0;
    let subtotalBal = 0;
    let subtotalA0_30 = 0;
    let subtotalA31_60 = 0;
    let subtotalA61_90 = 0;
    let subtotalAOver90 = 0;

    for (const r of items) {
      subtotalInvoices += Number(r.invoiceCount) || 0;
      subtotalAmount += Number(r.totalAmount) || 0;
      subtotalBal += Number(r.balanceAmount) || 0;
      subtotalA0_30 += Number(r.aging0To30) || 0;
      subtotalA31_60 += Number(r.aging31To60) || 0;
      subtotalA61_90 += Number(r.aging61To90) || 0;
      subtotalAOver90 += Number(r.agingOver90) || 0;
    }

    const cumAmount =
      listHook.summary.cumulativeTotalAmount !== undefined
        ? Number(listHook.summary.cumulativeTotalAmount)
        : listHook.page === 1
          ? subtotalAmount
          : undefined;

    const cumBal =
      listHook.summary.cumulativeBalanceAmount !== undefined
        ? Number(listHook.summary.cumulativeBalanceAmount)
        : listHook.page === 1
          ? subtotalBal
          : undefined;

    const cumInvoices =
      listHook.summary.cumulativeInvoiceCount !== undefined
        ? Number(listHook.summary.cumulativeInvoiceCount)
        : listHook.page === 1
          ? subtotalInvoices
          : undefined;

    const cumCount =
      listHook.summary.cumulativePartnersCount !== undefined
        ? Number(listHook.summary.cumulativePartnersCount)
        : (listHook.page - 1) * listHook.pageSize + items.length;

    const cumA0_30 =
      listHook.summary.cumulativeAging0To30 !== undefined
        ? Number(listHook.summary.cumulativeAging0To30)
        : listHook.page === 1
          ? subtotalA0_30
          : undefined;

    const cumA31_60 =
      listHook.summary.cumulativeAging31To60 !== undefined
        ? Number(listHook.summary.cumulativeAging31To60)
        : listHook.page === 1
          ? subtotalA31_60
          : undefined;

    const cumA61_90 =
      listHook.summary.cumulativeAging61To90 !== undefined
        ? Number(listHook.summary.cumulativeAging61To90)
        : listHook.page === 1
          ? subtotalA61_90
          : undefined;

    const cumAOver90 =
      listHook.summary.cumulativeAgingOver90 !== undefined
        ? Number(listHook.summary.cumulativeAgingOver90)
        : listHook.page === 1
          ? subtotalAOver90
          : undefined;

    return {
      partnerName: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={listHook.page}
          totalPages={listHook.totalPages}
          totalCount={listHook.total}
          currentPageCount={items.length}
          cumulativeCount={cumCount}
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
        />
      ),
      invoiceCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("debts:columns.invoiceCount", "Số lượng hóa đơn")}
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalQty={subtotalInvoices}
          cumulativeQty={cumInvoices}
          grandTotalQty={listHook.summary.totalInvoiceCount}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="text-primary font-bold"
        />
      ),
      paymentProgress: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            isCustomer
              ? t("debts:columns.totalReceivable", "Tổng phải thu")
              : t("debts:columns.totalPayable", "Tổng phải trả")
          }
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalAmount={subtotalAmount}
          cumulativeAmount={cumAmount}
          grandTotalAmount={listHook.summary.grandTotalAmount}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="text-foreground font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            isCustomer
              ? t("debts:columns.remainingReceivable", "Còn phải thu")
              : t("debts:columns.remainingPayable", "Còn phải trả")
          }
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalAmount={subtotalBal}
          cumulativeAmount={cumBal}
          grandTotalAmount={listHook.summary.grandTotalBalance}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName={
            subtotalBal === 0
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : "font-bold text-destructive"
          }
        />
      ),
      aging0To30: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:columns.aging0_30", "0-30 ngày")}
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalAmount={subtotalA0_30}
          cumulativeAmount={cumA0_30}
          grandTotalAmount={listHook.summary.grandTotalAging0To30}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-emerald-700 dark:text-emerald-400"
        />
      ),
      aging31To60: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:columns.aging31_60", "31-60 ngày")}
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalAmount={subtotalA31_60}
          cumulativeAmount={cumA31_60}
          grandTotalAmount={listHook.summary.grandTotalAging31To60}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-amber-800 dark:text-amber-300"
        />
      ),
      aging61To90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:columns.aging61_90", "61-90 ngày")}
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalAmount={subtotalA61_90}
          cumulativeAmount={cumA61_90}
          grandTotalAmount={listHook.summary.grandTotalAging61To90}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-orange-700 dark:text-orange-400"
        />
      ),
      agingOver90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:columns.agingOver90", ">90 ngày")}
          itemTitle={t("debts:partner", "Đối tác")}
          itemUnit={t("debts:unitPartner", "đối tác")}
          subtotalAmount={subtotalAOver90}
          cumulativeAmount={cumAOver90}
          grandTotalAmount={listHook.summary.grandTotalAgingOver90}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-rose-700 dark:text-rose-400"
        />
      ),
      maxAgingDays: (
        <Tooltip
          content={
            <div className="flex flex-col gap-1.5 p-1 text-xs min-w-[240px]">
              <div className="font-semibold text-foreground border-b border-border/50 pb-1">
                Tổng nợ theo phân tầng toàn hệ thống
              </div>
              <div className="space-y-1 tabular-nums">
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>🟢 0-30 ngày (Trong hạn):</span>
                  <span className="font-mono font-medium">
                    {money(listHook.summary.grandTotalAging0To30 || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-700 dark:text-amber-400">
                  <span>🟡 31-60 ngày (Theo dõi):</span>
                  <span className="font-mono font-medium">
                    {money(listHook.summary.grandTotalAging31To60 || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-orange-700 dark:text-orange-400">
                  <span>🟠 61-90 ngày (Quá hạn):</span>
                  <span className="font-mono font-medium">
                    {money(listHook.summary.grandTotalAging61To90 || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-rose-700 dark:text-rose-400 font-bold">
                  <span>🔴 &gt;90 ngày (Quá hạn nặng):</span>
                  <span className="font-mono">
                    {money(listHook.summary.grandTotalAgingOver90 || 0)}
                  </span>
                </div>
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-1 cursor-default text-xs font-medium text-muted-foreground py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[11px] ml-1 font-mono">Đa tầng</span>
          </div>
        </Tooltip>
      ),
    };
  }, [
    listHook.data,
    listHook.page,
    listHook.pageSize,
    listHook.totalPages,
    listHook.total,
    listHook.summary,
    isCustomer,
    t,
  ]);

  // 7. Row Actions (Floated Action Menu & Right-Click Context Menu)
  const getRowActions = useCallback(
    (row: InvoiceDebtItem): ActionDropdownItem[] => [
      {
        groupLabel: "TRA CỨU",
        items: [
          {
            label: t("debts:drawer.title", "Xem chi tiết công nợ"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () => openDetail(row.taxCode, row.partnerName),
          },
        ],
      },
    ],
    [openDetail, t],
  );

  if (!canRead) {
    return <Forbidden />;
  }

  return (
    <>
      <SpreadsheetPageTemplate<InvoiceDebtItem>
        title={t("debts:title", "Công nợ")}
        desc={t(
          "debts:desc",
          "Theo dõi, đối soát và phân tích tổng hợp công nợ phải thu, phải trả và tuổi nợ theo Hóa đơn điện tử",
        )}
        icon={<ReceiptText className="w-5 h-5 text-primary" />}
        tabs={pageTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tableId={
          activeTab === "suppliers"
            ? "invoice-debts-table-suppliers"
            : "invoice-debts-table-customers"
        }
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => `${row.partnerName}_${row.taxCode || "NO_MST"}`}
        loading={listHook.isLoading}
        emptyLabel={
          isCustomer
            ? t(
                "debts:emptyCustomers",
                "Không tìm thấy dữ liệu công nợ khách hàng",
              )
            : t(
                "debts:emptySuppliers",
                "Không tìm thấy dữ liệu công nợ nhà cung cấp",
              )
        }
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => listHook.refetch()}
        createLabel={t("debts:exportExcel", "Xuất Excel")}
        createIcon={
          <FileSpreadsheet className="w-4 h-4 mr-1 text-primary-fg/80" />
        }
        onCreate={() => setExportDrawerOpen(true)}
        createActions={createActions}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={getRowActions}
        summaryRow={summaryRow}
      />

      {/* Detail Drawer */}
      <InvoicePartnerDebtDetailDrawer
        open={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
        taxCode={selectedPartner?.taxCode || null}
        partnerName={selectedPartner?.partnerName}
        partnerType={listHook.partnerType}
        dateFrom={listHook.dateFrom || undefined}
        dateTo={listHook.dateTo || undefined}
      />

      {/* Export Drawer */}
      <InvoiceDebtsExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        initialPartnerType={listHook.partnerType}
        buildBaseQuery={() => ({
          partner_type: listHook.partnerType,
          search: listHook.search || undefined,
          date_from: listHook.dateFrom || undefined,
          date_to: listHook.dateTo || undefined,
          column_search:
            Object.keys(listHook.columnSearch).length > 0
              ? JSON.stringify(listHook.columnSearch)
              : undefined,
          column_filters:
            Object.keys(listHook.columnFilters).length > 0
              ? JSON.stringify(listHook.columnFilters)
              : undefined,
        })}
      />
    </>
  );
}
