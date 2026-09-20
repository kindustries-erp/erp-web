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
import { ReceiptText, Eye, FileText } from "lucide-react";
import type { TabItem } from "@/shared/components/PageLayout";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { useInvoiceDebtsList } from "../hooks/useInvoiceDebtsList";
import { invoiceDebtsApi, type InvoiceDebtItem } from "../api/invoiceDebtsApi";
import { InvoicePartnerDebtDetailDrawer } from "../components/InvoicePartnerDebtDetailDrawer";
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

  // 3. Detail Drawer State
  const [selectedPartner, setSelectedPartner] = useState<{
    taxCode: string;
    partnerName?: string;
  } | null>(null);

  const openDetail = useCallback((taxCode: string, partnerName?: string) => {
    setSelectedPartner({ taxCode, partnerName });
  }, []);

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
            textClassName="whitespace-normal line-clamp-2 break-words text-foreground font-medium text-xs leading-normal select-text"
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
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-foreground transition-all duration-150 cursor-pointer group shadow-xs hover:scale-105"
              >
                <FileText className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
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
              <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
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

      // 7. Tuổi nợ (Aging - Fintech Progress Bar & Badges)
      {
        key: "maxAgingDays",
        className: "text-left",
        header: headerFilter(
          "maxAgingDays",
          t("debts:columns.maxAgingDays", "Tuổi nợ"),
        ),
        size: 200,
        enableResizing: true,
        cell: (row) => {
          const bal = Number(row.balanceAmount) || 0;
          const aging = row.maxAgingDays || 0;

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

          const agingPercent = Math.min(100, Math.round((aging / 90) * 100));
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;

          const bracketLabel = isOver90
            ? ">90 ngày"
            : is61to90
              ? "61-90 ngày"
              : is31to60
                ? "31-60 ngày"
                : "0-30 ngày";

          const tagCls = isOver90
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50"
            : is61to90
              ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50"
              : is31to60
                ? "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40"
                : "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40";

          const dayTextCls = isOver90
            ? "text-rose-700 dark:text-rose-400 font-bold"
            : is61to90
              ? "text-orange-700 dark:text-orange-400 font-semibold"
              : is31to60
                ? "text-amber-800 dark:text-amber-300 font-semibold"
                : "text-emerald-700 dark:text-emerald-400 font-medium";

          const barColorCls = isOver90
            ? "bg-rose-500 dark:bg-rose-400"
            : is61to90
              ? "bg-orange-500 dark:bg-orange-400"
              : is31to60
                ? "bg-amber-500 dark:bg-amber-400"
                : "bg-emerald-500 dark:bg-emerald-400";

          return (
            <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
              <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                <span className={cn("font-mono text-xs", dayTextCls)}>
                  {aging} ngày
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 border leading-none font-medium",
                    tagCls,
                  )}
                >
                  {bracketLabel}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    barColorCls,
                  )}
                  style={{ width: `${agingPercent}%` }}
                />
              </div>
            </div>
          );
        },
      },

      // 8. Ngày hóa đơn phát sinh gần nhất
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

    for (const r of items) {
      subtotalInvoices += Number(r.invoiceCount) || 0;
      subtotalAmount += Number(r.totalAmount) || 0;
      subtotalBal += Number(r.balanceAmount) || 0;
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
    </>
  );
}
