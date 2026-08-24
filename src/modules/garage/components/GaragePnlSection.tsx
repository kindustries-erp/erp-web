import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import {
  garageOpexApi,
  type GaragePnlReportResponse,
} from "../api/garageOpexApi";
import { useAppStore } from "@/core/config/appStore";
import { GarageOpexDrawer } from "./GarageOpexDrawer";
import toast from "react-hot-toast";
import {
  FileSpreadsheet,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface PairedPnlItem {
  key: string;
  categoryKey: string;
  categoryName: string;
  note?: string | null;
  curAmount: number;
  prevAmount?: number;
}

function mergePnlItems(
  curItems: Array<{
    id?: string;
    categoryKey: string;
    categoryName: string;
    amount: number;
    note?: string | null;
  }> = [],
  prevItems: Array<{
    id?: string;
    categoryKey: string;
    categoryName: string;
    amount: number;
    note?: string | null;
  }> = [],
): PairedPnlItem[] {
  const map = new Map<string, PairedPnlItem>();

  for (const item of curItems) {
    const key = item.categoryKey || item.categoryName;
    map.set(key, {
      key,
      categoryKey: item.categoryKey,
      categoryName: item.categoryName,
      note: item.note,
      curAmount: item.amount,
      prevAmount: undefined,
    });
  }

  for (const prev of prevItems) {
    const key = prev.categoryKey || prev.categoryName;
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.prevAmount = prev.amount;
      if (!existing.note && prev.note) {
        existing.note = prev.note;
      }
    } else {
      map.set(key, {
        key,
        categoryKey: prev.categoryKey,
        categoryName: prev.categoryName,
        note: prev.note,
        curAmount: 0,
        prevAmount: prev.amount,
      });
    }
  }

  return Array.from(map.values());
}

export function GaragePnlSection() {
  const { t } = useTranslation("garage");
  const { navigate } = useAppStore();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [exporting, setExporting] = useState<boolean>(false);

  // Quick Drawer open state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const {
    data: report,
    isLoading,
    refetch,
  } = useQuery<GaragePnlReportResponse>({
    queryKey: ["garage-pnl-report", selectedYear, selectedMonth],
    queryFn: () =>
      garageOpexApi.getPnlReport({
        year: selectedYear,
        month: selectedMonth,
      }),
  });

  const { data: prevReport, isLoading: isLoadingPrev } =
    useQuery<GaragePnlReportResponse>({
      queryKey: ["garage-pnl-report", prevYear, prevMonth],
      queryFn: () =>
        garageOpexApi.getPnlReport({
          year: prevYear,
          month: prevMonth,
        }),
    });

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await garageOpexApi.exportPnlExcel({
        year: selectedYear,
        month: selectedMonth,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Garage_PNL_Report_${String(selectedMonth).padStart(2, "0")}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(
        t("pnl.exportSuccess", "Đã tải xuống file báo cáo Excel P&L"),
      );
    } catch (err: any) {
      toast.error(err?.message || "Không thể xuất file Excel");
    } finally {
      setExporting(false);
    }
  };

  const monthOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `${t("pnl.monthLabel", "Tháng")} ${i + 1}`,
      })),
    [t],
  );

  const yearOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear - 2 + i),
        label: `${t("pnl.yearLabel", "Năm")} ${currentYear - 2 + i}`,
      })),
    [currentYear, t],
  );

  const renderPrevVal = (val?: number) => {
    if (isLoadingPrev)
      return <span className="text-muted-foreground/60">...</span>;
    if (val === undefined || val === null)
      return <span className="text-muted-foreground/40">—</span>;
    return `${val.toLocaleString("vi-VN")} đ`;
  };

  const renderDelta = (curVal: number, prevVal?: number, isCost = false) => {
    if (
      prevVal === undefined ||
      prevVal === null ||
      prevVal === 0 ||
      isLoadingPrev
    ) {
      return null;
    }
    const diff = curVal - prevVal;
    if (diff === 0) return null;
    const pct = ((curVal - prevVal) / Math.abs(prevVal)) * 100;
    const isPositive = diff > 0;
    // For cost/opex, increase is bad (red), decrease is good (green)
    const isGood = isCost ? !isPositive : isPositive;

    return (
      <span
        className={`ml-1.5 inline-flex items-center text-[10px] font-medium px-1 py-0.2 rounded ${
          isGood
            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
            : "text-rose-700 dark:text-rose-400 bg-rose-500/10"
        }`}
      >
        {isPositive ? "+" : ""}
        {pct.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 card-shadow overflow-hidden min-w-0">
      {/* Header */}
      <div className="pb-4 mb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  {t("pnl.title", "Báo cáo Lợi nhuận (P&L)")}
                </h3>
                {report && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-normal px-2 py-0"
                  >
                    {report.caseCount}{" "}
                    {t("pnl.casesCompleted", "vụ việc hoàn tất")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "pnl.desc",
                  "Tổng hợp doanh thu, giá vốn, chi phí vận hành và lợi nhuận ròng theo tháng (so sánh với tháng trước)",
                )}
              </p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Chọn Tháng Combobox */}
            <Combobox
              options={monthOptions}
              value={String(selectedMonth)}
              onChange={(val) => val && setSelectedMonth(Number(val))}
              allowClear={false}
              placeholder={t("pnl.monthLabel", "Chọn tháng")}
              className="w-32 h-8 text-xs font-medium"
            />

            {/* Chọn Năm Combobox */}
            <Combobox
              options={yearOptions}
              value={String(selectedYear)}
              onChange={(val) => val && setSelectedYear(Number(val))}
              allowClear={false}
              placeholder={t("pnl.yearLabel", "Chọn năm")}
              className="w-32 h-8 text-xs font-medium"
            />

            {/* Nút Xuất Excel */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting || isLoading}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {t("pnl.exportExcel", "Xuất Excel")}
            </Button>

            {/* Link điều hướng sang trang Chi phí vận hành */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("garage-opex")}
              className="h-8 gap-1.5 px-3 text-xs font-semibold"
            >
              <span>{t("pnl.goToOpex", "Quản lý CP vận hành")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div>
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">
              Đang tổng hợp dữ liệu báo cáo P&L...
            </span>
          </div>
        ) : !report ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Chưa có dữ liệu báo cáo cho kỳ này
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border/70 text-muted-foreground uppercase font-semibold">
                  <th className="py-2.5 px-4 w-[50%]">
                    {t("pnl.tableHeaderCategory", "Danh Mục")}
                  </th>
                  <th className="py-2.5 px-4 w-[25%] text-right">
                    {t("pnl.tableHeaderValue", "Tháng này")} (T{selectedMonth}/
                    {selectedYear})
                  </th>
                  <th className="py-2.5 px-4 w-[25%] text-right text-muted-foreground/80">
                    {t("pnl.tableHeaderPrev", "Tháng trước")} (T{prevMonth}/
                    {prevYear})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {/* I. Doanh Thu */}
                <tr className="bg-muted/30 font-bold text-foreground hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-4">
                    {t("pnl.revenueHeader", "I. Doanh Thu")}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
                    <div className="flex items-center justify-end">
                      <span>{report.revenue.toLocaleString("vi-VN")} đ</span>
                      {renderDelta(report.revenue, prevReport?.revenue)}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
                    {renderPrevVal(prevReport?.revenue)}
                  </td>
                </tr>
                <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
                  <td className="py-2 px-8">
                    {t("pnl.revenueService", "Doanh Thu Dịch Vụ")}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono">
                    {report.revenue.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                    {renderPrevVal(prevReport?.revenue)}
                  </td>
                </tr>

                {/* II. Chi phí (Giá vốn) */}
                <tr className="bg-muted/30 font-bold text-foreground hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-4">
                    {t("pnl.cogsHeader", "II. Chi phí (Giá vốn)")}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
                    <div className="flex items-center justify-end">
                      <span>{report.cogs.toLocaleString("vi-VN")} đ</span>
                      {renderDelta(report.cogs, prevReport?.cogs, true)}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
                    {renderPrevVal(prevReport?.cogs)}
                  </td>
                </tr>
                <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
                  <td className="py-2 px-8">
                    {t(
                      "pnl.cogsDirect",
                      "Chi phí phụ tùng & Gia công ngoài (từ vụ việc)",
                    )}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono">
                    {(report.cogsDirect ?? report.cogs).toLocaleString("vi-VN")}{" "}
                    đ
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                    {renderPrevVal(prevReport?.cogsDirect ?? prevReport?.cogs)}
                  </td>
                </tr>

                {/* Direct Costs / COGS adjustments breakdown */}
                {(() => {
                  const cogsAdjustments = mergePnlItems(
                    report.cogsAdjustment?.items,
                    prevReport?.cogsAdjustment?.items,
                  );
                  if (cogsAdjustments.length === 0) return null;
                  return cogsAdjustments.map((item) => (
                    <tr
                      key={item.key}
                      className="text-amber-700 dark:text-amber-400/90 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                    >
                      <td className="py-2 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>{item.categoryName}</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                          >
                            Nhập tay
                          </Badge>
                        </div>
                        {item.note && (
                          <span className="text-[10px] opacity-75 italic max-w-[180px] truncate">
                            ({item.note})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono">
                        {item.curAmount > 0
                          ? `${item.curAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                        {item.prevAmount !== undefined && item.prevAmount > 0
                          ? `${item.prevAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                    </tr>
                  ));
                })()}

                {/* III. Lợi nhuận gộp */}
                <tr className="bg-blue-500/10 text-blue-900 dark:text-blue-200 font-bold border-y border-blue-200 dark:border-blue-900/50 hover:bg-blue-500/15 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {t("pnl.grossProfitHeader", "III. Lợi nhuận gộp")}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] px-1.5 py-0 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                    >
                      {report.grossMarginRate.toFixed(2)}% Doanh thu
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-blue-700 dark:text-blue-300">
                    <div className="flex items-center justify-end">
                      <span>
                        {report.grossProfit.toLocaleString("vi-VN")} đ
                      </span>
                      {renderDelta(report.grossProfit, prevReport?.grossProfit)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-blue-700/70 dark:text-blue-300/70">
                    {renderPrevVal(prevReport?.grossProfit)}
                  </td>
                </tr>

                {/* IV. Chi phí vận hành */}
                <tr className="bg-muted/30 font-bold text-foreground hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-4 flex items-center justify-between">
                    <span>{t("pnl.opexHeader", "IV. Chi phí vận hành")}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDrawerOpen(true)}
                      className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t("opex.actions.addExpense", "Thêm CP")}</span>
                    </Button>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
                    <div className="flex items-center justify-end">
                      <span>{report.opex.total.toLocaleString("vi-VN")} đ</span>
                      {renderDelta(
                        report.opex.total,
                        prevReport?.opex.total,
                        true,
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
                    {renderPrevVal(prevReport?.opex.total)}
                  </td>
                </tr>

                {(() => {
                  const opexItems = mergePnlItems(
                    report.opex?.items,
                    prevReport?.opex?.items,
                  );
                  if (opexItems.length === 0) {
                    return (
                      <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
                        <td className="py-2 px-8">
                          {t(
                            "pnl.noOpexHint",
                            "Chưa nhập chi phí vận hành cho tháng này",
                          )}
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums font-mono">
                          0 đ
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                          {renderPrevVal(prevReport?.opex.total)}
                        </td>
                      </tr>
                    );
                  }
                  return opexItems.map((item) => (
                    <tr
                      key={item.key}
                      className="text-muted-foreground hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-2 px-8 flex items-center justify-between">
                        <span>{item.categoryName}</span>
                        {item.note && (
                          <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
                            ({item.note})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono">
                        {item.curAmount > 0
                          ? `${item.curAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                        {item.prevAmount !== undefined && item.prevAmount > 0
                          ? `${item.prevAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                    </tr>
                  ));
                })()}

                {/* V. Lợi nhuận ròng (trước hoa hồng) */}
                <tr className="bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 font-bold border-y border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-500/15 transition-colors">
                  <td className="py-2.5 px-4">
                    {t(
                      "pnl.netProfitBeforeCommissionHeader",
                      "V. Lợi nhuận ròng (trước hoa hồng)",
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-indigo-700 dark:text-indigo-300">
                    <div className="flex items-center justify-end">
                      <span>
                        {report.netProfitBeforeCommission.toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </span>
                      {renderDelta(
                        report.netProfitBeforeCommission,
                        prevReport?.netProfitBeforeCommission,
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-indigo-700/70 dark:text-indigo-300/70">
                    {renderPrevVal(prevReport?.netProfitBeforeCommission)}
                  </td>
                </tr>

                {/* VI. Hoa hồng */}
                <tr className="bg-muted/30 font-bold text-foreground hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-4">
                    {t("pnl.commissionHeader", "VI. Hoa hồng")}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
                    <div className="flex items-center justify-end">
                      <span>
                        {report.commission.total.toLocaleString("vi-VN")} đ
                      </span>
                      {renderDelta(
                        report.commission.total,
                        prevReport?.commission.total,
                        true,
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
                    {renderPrevVal(prevReport?.commission.total)}
                  </td>
                </tr>

                {(() => {
                  const commissionItems = mergePnlItems(
                    report.commission?.items,
                    prevReport?.commission?.items,
                  );
                  if (commissionItems.length === 0) {
                    return (
                      <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
                        <td className="py-2 px-8">
                          {t("pnl.noCommissionHint", "Chưa có hoa hồng")}
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums font-mono">
                          0 đ
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                          {renderPrevVal(prevReport?.commission.total)}
                        </td>
                      </tr>
                    );
                  }
                  return commissionItems.map((item) => (
                    <tr
                      key={item.key}
                      className="text-muted-foreground hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-2 px-8">
                        <span>{item.categoryName}</span>
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono">
                        {item.curAmount > 0
                          ? `${item.curAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                        {item.prevAmount !== undefined && item.prevAmount > 0
                          ? `${item.prevAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                    </tr>
                  ));
                })()}

                {/* VII. Lợi nhuận ròng (sau hoa hồng) */}
                <tr className="bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 font-bold border-t-2 border-emerald-400 dark:border-emerald-700 hover:bg-emerald-500/20 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-[13px]">
                      {t(
                        "pnl.netProfitAfterCommissionHeader",
                        "VII. Lợi nhuận ròng (sau hoa hồng)",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] px-2 py-0.5 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                    >
                      {report.netMarginRate.toFixed(2)}% Doanh thu
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-emerald-700 dark:text-emerald-300">
                    <div className="flex items-center justify-end">
                      <span>
                        {report.netProfitAfterCommission.toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </span>
                      {renderDelta(
                        report.netProfitAfterCommission,
                        prevReport?.netProfitAfterCommission,
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-emerald-700/70 dark:text-emerald-300/70">
                    {renderPrevVal(prevReport?.netProfitAfterCommission)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Add Expense Drawer */}
      <GarageOpexDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="edit"
        setMode={() => {}}
        isCreate={true}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
