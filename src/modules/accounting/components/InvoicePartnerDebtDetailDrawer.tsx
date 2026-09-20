import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { BarChart } from "@/shared/components/charts/BarChart";
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
} from "lucide-react";
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

  // Table client state
  const tableState = useTableColumnState(
    `invoice-partner-debt-detail-${taxCode || "unknown"}`,
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
      dateFrom,
      dateTo,
    ],
    queryFn: () => {
      if (!taxCode) return Promise.resolve([]);
      return invoiceDebtsApi.getPartnerInvoices(taxCode, {
        partner_type: partnerType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
    },
    enabled: open && !!taxCode,
  });

  // Fetch Stats Trend
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["invoice-partner-trend-stats", taxCode, dateFrom, dateTo],
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

  // Universal client filter & sorter for drawer table
  const filteredInvoices = useMemo(() => {
    return filterClientItems(invoices, tableState, {
      dateField: "invoiceDate",
    });
  }, [invoices, tableState]);

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
        header: headerFilter("status", t("debts:drawer.status", "Trạng thái")),
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

  // Subtotal summary row for drawer table
  const summaryRow = useMemo(() => {
    if (!filteredInvoices || filteredInvoices.length === 0) return undefined;

    let subtotalPreVat = 0;
    let subtotalVat = 0;
    let subtotalTotal = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;

    for (const inv of filteredInvoices) {
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
          currentPageCount={filteredInvoices.length}
          totalCount={invoices.length}
        />
      ),
      preVatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.preVatAmount", "Tiền trước thuế")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPreVat}
          grandTotalAmount={totals.totalRevenue}
          currentPageCount={filteredInvoices.length}
          totalCount={invoices.length}
          valueClassName="text-muted-foreground font-semibold"
        />
      ),
      vatAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.vatAmount", "Tiền thuế VAT")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalVat}
          grandTotalAmount={totals.totalRevenue}
          currentPageCount={filteredInvoices.length}
          totalCount={invoices.length}
          valueClassName="text-muted-foreground font-semibold"
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.totalAmount", "Tổng giá trị hóa đơn")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalTotal}
          grandTotalAmount={totals.totalRevenue}
          currentPageCount={filteredInvoices.length}
          totalCount={invoices.length}
          valueClassName="text-foreground font-bold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.paidAmount", "Đã thanh toán / Cấn trừ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPaid}
          grandTotalAmount={totals.totalPaid}
          currentPageCount={filteredInvoices.length}
          totalCount={invoices.length}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:drawer.balanceAmount", "Tổng nợ còn lại")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={totals.totalBalance}
          currentPageCount={filteredInvoices.length}
          totalCount={invoices.length}
          valueClassName="text-destructive font-bold"
        />
      ),
    };
  }, [filteredInvoices, invoices.length, totals, t]);

  const barIn = "#ea580c"; // Cam: Đầu vào / Chi phí
  const barOut = "#059669"; // Lục: Đầu ra / Doanh thu
  const cashTrendLabels = statsData?.cashTrend?.map((t) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t) => t.cashOut) || [];
  const cashTrendOut = statsData?.cashTrend?.map((t) => t.cashIn) || [];

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="view"
        title={resolvedName}
        subtitle={
          <span className="text-xs text-muted-foreground font-mono font-normal">
            MST: {taxCode === "KHONG_MST" ? "Không có MST" : taxCode || "N/A"} •{" "}
            {isCustomer ? "Khách hàng" : "Nhà cung cấp"}
          </span>
        }
        icon={<Building2 className="w-5 h-5 text-primary shrink-0" />}
        size="xl"
        layout="1-column"
        leftPanel={
          <div className="space-y-6">
            {/* SECTION 1: 4 KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* KPI 1: Tổng hóa đơn & Doanh thu */}
              <div className="bg-card border rounded-xl p-3.5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("debts:drawer.kpiTotalAmount", "Tổng tiền HĐ")}
                  </span>
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="text-lg font-bold font-mono text-foreground">
                  {money(totals.totalRevenue)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {invoices.length} {t("debts:unitInvoice", "hóa đơn")}
                </div>
              </div>

              {/* KPI 2: Đã thanh toán */}
              <div className="bg-card border rounded-xl p-3.5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {isCustomer
                      ? t("debts:received", "Đã thu")
                      : t("debts:paid", "Đã trả")}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {money(totals.totalPaid)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Tỷ lệ thanh toán:{" "}
                  <span className="font-semibold text-emerald-700">
                    {totals.recoveryRate}%
                  </span>
                </div>
              </div>

              {/* KPI 3: Còn nợ */}
              <div className="bg-card border rounded-xl p-3.5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("debts:drawer.kpiBalanceAmount", "Còn nợ")}</span>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-lg font-bold font-mono text-destructive">
                  {money(totals.totalBalance)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {totals.totalBalance > 0
                    ? "Cần theo dõi đối soát"
                    : "Đã hoàn tất thanh toán"}
                </div>
              </div>

              {/* KPI 4: Tuổi nợ tối đa */}
              <div className="bg-card border rounded-xl p-3.5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("debts:drawer.kpiMaxAging", "Tuổi nợ cao nhất")}
                  </span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-lg font-bold font-mono text-amber-800 dark:text-amber-300">
                  {totals.maxAging} ngày
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {totals.maxAging > 90
                    ? "Quá hạn nghiêm trọng (>90 ngày)"
                    : totals.maxAging > 60
                      ? "Quá hạn (61-90 ngày)"
                      : totals.maxAging > 30
                        ? "Cần theo dõi (31-60 ngày)"
                        : "Trong hạn (0-30 ngày)"}
                </div>
              </div>
            </div>

            {/* SECTION 2: TREND CHART (Nếu có số liệu) */}
            {cashTrendLabels.length > 0 && (
              <DrawerSection
                title={t(
                  "debts:drawer.trendChartTitle",
                  "Biến động hóa đơn theo tháng",
                )}
              >
                <div className="bg-card border rounded-xl p-4 shadow-sm">
                  <div className="relative h-[200px]">
                    {!isLoadingStats ? (
                      <BarChart
                        labels={cashTrendLabels}
                        yCallback={(v) => money(Number(v))}
                        datasets={[
                          {
                            data: cashTrendIn,
                            color: barIn,
                            label: "HĐ Đầu vào (Mua)",
                          },
                          {
                            data: cashTrendOut,
                            color: barOut,
                            label: "HĐ Đầu ra (Bán)",
                          },
                        ]}
                      />
                    ) : (
                      <ChartSkeleton type="bar" />
                    )}
                  </div>
                </div>
              </DrawerSection>
            )}

            {/* SECTION 3: INVOICES LIST TABLE */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2">
                  <span>
                    {t(
                      "debts:drawer.invoicesListTitle",
                      "Danh sách hóa đơn chi tiết",
                    )}
                  </span>
                  {tableState.activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        tableState.resetFilters();
                      }}
                      className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full"
                    >
                      <span>Xóa bộ lọc ({tableState.activeFilterCount})</span>
                    </button>
                  )}
                </div>
              }
              titleExtra={
                <div className="text-xs text-muted-foreground font-mono">
                  {filteredInvoices.length} / {invoices.length} hóa đơn
                </div>
              }
            >
              <DataTable
                items={filteredInvoices}
                columns={columns}
                getRowKey={(r) => r.id}
                loading={isLoadingInvoices}
                variant="spreadsheet"
                emptyLabel={t(
                  "debts:drawer.emptyInvoices",
                  "Chưa có hóa đơn nào",
                )}
                summaryRow={summaryRow}
              />
            </DrawerSection>
          </div>
        }
      />

      {/* Full Detail Invoice Drawer */}
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
