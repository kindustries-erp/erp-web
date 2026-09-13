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
import { Tooltip } from "@/core/components/ui/Tooltip";
import {
  FileSpreadsheet,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
  Sparkles,
} from "lucide-react";

interface PairedPnlItem {
  key: string;
  categoryKey: string;
  categoryName: string;
  note?: string | null;
  curAmount: number;
  curOjAmount?: number;
  prevAmount?: number;
}

function mergePnlItems(
  curItems: Array<{
    id?: string;
    categoryKey: string;
    categoryName: string;
    amount: number;
    ojAmount?: number;
    note?: string | null;
  }> = [],
  prevItems: Array<{
    id?: string;
    categoryKey: string;
    categoryName: string;
    amount: number;
    ojAmount?: number;
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
      curOjAmount: item.ojAmount || 0,
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
        curOjAmount: 0,
        prevAmount: prev.amount,
      });
    }
  }

  return Array.from(map.values());
}

export function GaragePnlSection() {
  const { t } = useTranslation("garage");
  const { navigate } = useAppStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultPeriod = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod);

  // Sinh 24 tháng gần nhất cho Combobox kỳ báo cáo
  const periodOptions = useMemo<ComboboxOption[]>(() => {
    const options: ComboboxOption[] = [];
    const d = new Date(currentYear, currentMonth - 1, 1);
    for (let i = 0; i < 24; i++) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const val = `${y}-${String(m).padStart(2, "0")}`;
      options.push({
        value: val,
        label: `Tháng ${String(m).padStart(2, "0")}/${y}`,
        searchText: `Thang ${m} ${y} T${m}/${y}`,
      });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  }, [currentYear, currentMonth]);

  const [selectedYear, selectedMonth] = useMemo(() => {
    const parts = (selectedPeriod || defaultPeriod).split("-");
    return [
      parseInt(parts[0], 10) || currentYear,
      parseInt(parts[1], 10) || currentMonth,
    ];
  }, [selectedPeriod, defaultPeriod, currentYear, currentMonth]);

  const [exporting, setExporting] = useState<boolean>(false);
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
        className={`ml-1.5 inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded border ${
          isGood
            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}
      >
        {isPositive ? "+" : ""}
        {pct.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header: Title & Badges on Left, Period Filter on Right */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
            {t("pnl.title", "Báo cáo Lợi nhuận (P&L)")}
          </h4>

          {report && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {report.caseCount} {t("pnl.casesCompleted", "vụ việc hoàn tất")}
              </Badge>
              {Boolean(report.oj && report.oj.caseCount > 0) && (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {report.oj!.caseCount} {t("pnl.ojCases", "vụ OJ")}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Nút chuyển đến trang nhập CP vận hành ở trên bên phải */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("garage-opex")}
            className="h-8 gap-1.5 px-3 text-xs font-semibold"
          >
            <span>{t("pnl.goToOpex", "Chi phí vận hành Garage →")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
        {/* Card Actions Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Combobox chọn kỳ báo cáo trực tiếp bên trong Card */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Kỳ báo cáo:
            </span>
            <div className="w-[160px]">
              <Combobox
                options={periodOptions}
                value={selectedPeriod}
                onChange={(val) => val && setSelectedPeriod(val)}
                placeholder="Chọn kỳ..."
                allowClear={false}
                className="h-7 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting || isLoading}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {t("pnl.exportExcel", "Xuất Excel")}
            </Button>
          </div>
        </div>
        {/* Content Table */}
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
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border/70 text-muted-foreground uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-4 w-[38%]">
                    {t("pnl.tableHeaderCategory", "Danh Mục")}
                  </th>
                  <th className="py-2.5 px-4 w-[20%] text-right font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    {t("pnl.tableHeaderOj", "Phát sinh OJ")} (T
                    {String(selectedMonth).padStart(2, "0")}/{selectedYear})
                  </th>
                  <th className="py-2.5 px-4 w-[22%] text-right text-foreground font-bold">
                    {t("pnl.monthPrefix", "Tháng")}{" "}
                    {String(selectedMonth).padStart(2, "0")}/{selectedYear}
                  </th>
                  <th className="py-2.5 px-4 w-[20%] text-right text-muted-foreground">
                    {t("pnl.monthPrefix", "Tháng")}{" "}
                    {String(prevMonth).padStart(2, "0")}/{prevYear}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {/* I. Doanh Thu */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-4">
                    {t("pnl.revenueHeader", "I. Doanh Thu")}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>
                        {(report.oj?.revenue || 0).toLocaleString("vi-VN")} đ
                      </span>
                      {Boolean(
                        report.oj &&
                        report.oj.revenue > 0 &&
                        report.revenue > 0,
                      ) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
                        >
                          {(
                            (report.oj!.revenue / report.revenue) *
                            100
                          ).toFixed(1)}
                          % DT
                        </Badge>
                      )}
                    </div>
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
                  <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                    {(report.oj?.revenue || 0).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono">
                    {report.revenue.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
                    {renderPrevVal(prevReport?.revenue)}
                  </td>
                </tr>

                {/* II. Chi phí (Giá vốn) */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-4 flex items-center gap-1.5">
                    <span>{t("pnl.cogsHeader", "II. Chi phí (Giá vốn)")}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
                    >
                      {report.revenue > 0
                        ? ((report.cogs / report.revenue) * 100).toFixed(1)
                        : 0}
                      % DT
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>
                        {(report.oj?.cogs || 0).toLocaleString("vi-VN")} đ
                      </span>
                      {Boolean(report.oj && report.oj.revenue > 0) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
                        >
                          {(
                            ((report.oj!.cogs || 0) / report.oj!.revenue) *
                            100
                          ).toFixed(1)}
                          % DT
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
                    <div className="flex items-center justify-end">
                      <span>{report.cogs.toLocaleString("vi-VN")} đ</span>
                      {renderDelta(report.cogs, prevReport?.cogs, true)}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{renderPrevVal(prevReport?.cogs)}</span>
                      {prevReport?.revenue && prevReport.revenue > 0 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground/80 font-normal"
                        >
                          {(
                            (prevReport.cogs / prevReport.revenue) *
                            100
                          ).toFixed(1)}
                          % DT
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>
                <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
                  <td className="py-2 px-8">
                    {t(
                      "pnl.cogsDirect",
                      "Chi phí phụ tùng & Gia công ngoài (từ vụ việc)",
                    )}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                    {(report.oj?.cogsDirect || 0).toLocaleString("vi-VN")} đ
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
                      className="text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-2 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>{item.categoryName}</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
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
                      <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                        {item.curOjAmount !== undefined && item.curOjAmount > 0
                          ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
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
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>
                      {t("pnl.grossProfitHeader", "III. Lợi nhuận gộp")}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-foreground font-medium"
                    >
                      {report.grossMarginRate.toFixed(2)}% Doanh thu
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>
                        {(report.oj?.grossProfit || 0).toLocaleString("vi-VN")}{" "}
                        đ
                      </span>
                      {Boolean(report.oj && report.oj.revenue > 0) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
                        >
                          {report.oj!.grossMarginRate.toFixed(2)}% DT
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground">
                    <div className="flex items-center justify-end">
                      <span>
                        {report.grossProfit.toLocaleString("vi-VN")} đ
                      </span>
                      {renderDelta(report.grossProfit, prevReport?.grossProfit)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{renderPrevVal(prevReport?.grossProfit)}</span>
                      {prevReport?.grossMarginRate !== undefined ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300/80 dark:border-slate-700 text-muted-foreground font-normal"
                        >
                          {prevReport.grossMarginRate.toFixed(2)}% DT
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>

                {/* IV. Chi phí vận hành */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span>{t("pnl.opexHeader", "IV. Chi phí vận hành")}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
                      >
                        {report.revenue > 0
                          ? (
                              (report.opex.total / report.revenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        % DT
                      </Badge>
                    </div>
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
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    <span>
                      {(report.oj?.opexTotal || 0).toLocaleString("vi-VN")} đ
                    </span>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{renderPrevVal(prevReport?.opex.total)}</span>
                      {prevReport?.revenue && prevReport.revenue > 0 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground/80 font-normal"
                        >
                          {(
                            (prevReport.opex.total / prevReport.revenue) *
                            100
                          ).toFixed(1)}
                          % DT
                        </Badge>
                      ) : null}
                    </div>
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
                        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                          0 đ
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
                      <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                        {item.curOjAmount !== undefined && item.curOjAmount > 0
                          ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
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
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <td className="py-2.5 px-4 flex items-center gap-1.5">
                    <span>
                      {t(
                        "pnl.netProfitBeforeCommissionHeader",
                        "V. Lợi nhuận ròng (trước hoa hồng)",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-foreground font-medium"
                    >
                      {report.revenue > 0
                        ? (
                            (report.netProfitBeforeCommission /
                              report.revenue) *
                            100
                          ).toFixed(2)
                        : 0}
                      % DT
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    <span>
                      {(
                        report.oj?.netProfitBeforeCommission || 0
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground">
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
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>
                        {renderPrevVal(prevReport?.netProfitBeforeCommission)}
                      </span>
                      {prevReport?.revenue && prevReport.revenue > 0 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300/80 dark:border-slate-700 text-muted-foreground font-normal"
                        >
                          {(
                            (prevReport.netProfitBeforeCommission /
                              prevReport.revenue) *
                            100
                          ).toFixed(2)}
                          % DT
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>

                {/* VI. Hoa hồng */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span>{t("pnl.commissionHeader", "VI. Hoa hồng")}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
                      >
                        {report.netProfitBeforeCommission > 0
                          ? `${(
                              (report.commission.total /
                                report.netProfitBeforeCommission) *
                              100
                            ).toFixed(1)}% LN ròng trước HH`
                          : "0% LN ròng"}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
                    <span>
                      {(report.oj?.commissionTotal || 0).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      đ
                    </span>
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

                {/* 1. Dòng Tỷ lệ lãi gộp Ký gửi / Tổng lãi gộp */}
                <tr className="text-slate-700 dark:text-slate-300 bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50/60 dark:hover:bg-purple-950/20 transition-colors border-b border-border/20">
                  <td className="py-2.5 px-8">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {t(
                            "pnl.kyGuiProfitRate",
                            "Tỷ lệ lãi gộp ký gửi / Lãi gộp",
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-purple-100/80 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-medium"
                          title={t(
                            "pnl.kyGuiProfitRateTooltip",
                            "Tỷ lệ % lợi nhuận gộp từ các phiếu dịch vụ có phân loại Ký gửi/Nội bộ trên tổng lợi nhuận gộp toàn xưởng. Dùng làm hệ số phân bổ Lợi nhuận ròng để tính 10% hoa hồng cho bộ phận Sale.",
                          )}
                        >
                          {t(
                            "pnl.kyGuiAllocationBadge",
                            "Tỷ trọng phân bổ Sale",
                          )}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Lãi gộp Ký gửi:{" "}
                        <strong className="font-semibold text-slate-700 dark:text-slate-300">
                          {(
                            report.kyGui?.grossProfit ??
                            report.commission.auto?.kyGuiGrossProfit ??
                            0
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </strong>{" "}
                        / Tổng lãi gộp:{" "}
                        <strong className="font-semibold text-slate-700 dark:text-slate-300">
                          {report.grossProfit.toLocaleString("vi-VN")} đ
                        </strong>
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono font-medium text-muted-foreground border-r border-border/40">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono px-2 py-0 border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
                    >
                      {(
                        report.oj?.commissionAuto?.kyGuiProfitRate ?? 0
                      ).toFixed(2)}
                      %
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono font-bold text-purple-700 dark:text-purple-400">
                    <div className="flex items-center justify-end">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-mono px-2 py-0.5 border-purple-300 dark:border-purple-800 bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold"
                      >
                        {(report.commission.auto?.kyGuiProfitRate ?? 0).toFixed(
                          2,
                        )}
                        %
                      </Badge>
                      {prevReport?.commission?.auto?.kyGuiProfitRate !==
                        undefined &&
                        renderDelta(
                          report.commission.auto?.kyGuiProfitRate ?? 0,
                          prevReport.commission.auto?.kyGuiProfitRate,
                        )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[12px] text-muted-foreground">
                    {prevReport?.commission?.auto?.kyGuiProfitRate !== undefined
                      ? `${prevReport.commission.auto.kyGuiProfitRate.toFixed(2)}%`
                      : "—"}
                  </td>
                </tr>

                {/* 2. Dòng Hoa hồng cho Sale (10%) */}
                {(() => {
                  const saleItem = (report.commission?.items || []).find(
                    (i) => i.categoryKey === "HOA_HONG_SALE",
                  );
                  const saleAmount =
                    saleItem?.amount ??
                    report.commission.auto?.saleCommission ??
                    0;

                  return (
                    <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors border-b border-border/20">
                      <td className="py-2.5 px-8">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {t(
                                "pnl.saleCommission",
                                "Hoa hồng cho Sale (10%)",
                              )}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-normal"
                            >
                              10% × LN ròng ×{" "}
                              {(
                                report.commission.auto?.kyGuiProfitRate ?? 0
                              ).toFixed(1)}
                              % Ký gửi
                            </Badge>

                            <Tooltip
                              content={t(
                                "pnl.autoCalculatedTooltip",
                                "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L (Chỉ đọc)",
                              )}
                            >
                              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 cursor-help shrink-0 shadow-xs hover:bg-amber-500/20 transition-colors">
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                            </Tooltip>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {saleItem?.note ||
                              t(
                                "pnl.saleCommissionSubtitle",
                                "Tính trên 10% của Lợi nhuận ròng theo Tỷ lệ lợi nhuận gộp do ký gửi",
                              )}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                        {(
                          saleItem?.ojAmount ??
                          report.oj?.commissionAuto?.saleCommission ??
                          0
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono font-semibold">
                        <div className="flex items-center justify-end">
                          <span>{saleAmount.toLocaleString("vi-VN")} đ</span>
                          {renderDelta(
                            saleAmount,
                            prevReport?.commission?.items?.find(
                              (i) => i.categoryKey === "HOA_HONG_SALE",
                            )?.amount ??
                              prevReport?.commission?.auto?.saleCommission,
                            true,
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground">
                        {renderPrevVal(
                          prevReport?.commission?.items?.find(
                            (i) => i.categoryKey === "HOA_HONG_SALE",
                          )?.amount ??
                            prevReport?.commission?.auto?.saleCommission,
                        )}
                      </td>
                    </tr>
                  );
                })()}

                {/* 3. Dòng Hoa hồng cho DV (10%) */}
                {(() => {
                  const dvItem = (report.commission?.items || []).find(
                    (i) => i.categoryKey === "HOA_HONG_DV",
                  );
                  const dvAmount =
                    dvItem?.amount ?? report.commission.auto?.dvCommission ?? 0;

                  return (
                    <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors border-b border-border/20">
                      <td className="py-2.5 px-8">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {t("pnl.dvCommission", "Hoa hồng cho DV (10%)")}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-normal"
                            >
                              10% × (LN ròng - HH Sale)
                            </Badge>

                            <Tooltip
                              content={t(
                                "pnl.autoCalculatedTooltip",
                                "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L (Chỉ đọc)",
                              )}
                            >
                              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 cursor-help shrink-0 shadow-xs hover:bg-amber-500/20 transition-colors">
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                            </Tooltip>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {dvItem?.note ||
                              t(
                                "pnl.dvCommissionSubtitle",
                                "Tính trên 10% Lợi nhuận ròng sau khi trừ hoa hồng Sale",
                              )}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                        {(
                          dvItem?.ojAmount ??
                          report.oj?.commissionAuto?.dvCommission ??
                          0
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono font-semibold">
                        <div className="flex items-center justify-end">
                          <span>{dvAmount.toLocaleString("vi-VN")} đ</span>
                          {renderDelta(
                            dvAmount,
                            prevReport?.commission?.items?.find(
                              (i) => i.categoryKey === "HOA_HONG_DV",
                            )?.amount ??
                              prevReport?.commission?.auto?.dvCommission,
                            true,
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground">
                        {renderPrevVal(
                          prevReport?.commission?.items?.find(
                            (i) => i.categoryKey === "HOA_HONG_DV",
                          )?.amount ??
                            prevReport?.commission?.auto?.dvCommission,
                        )}
                      </td>
                    </tr>
                  );
                })()}

                {/* 4. Các khoản Hoa hồng nhập tay khác (nếu có) */}
                {(() => {
                  const manualItems = mergePnlItems(
                    report.commission?.manual?.items ||
                      (report.commission?.items || []).filter(
                        (i) =>
                          i.categoryKey !== "RATE_LAI_GOP_KY_GUI" &&
                          i.categoryKey !== "HOA_HONG_SALE" &&
                          i.categoryKey !== "HOA_HONG_DV",
                      ),
                    prevReport?.commission?.manual?.items ||
                      (prevReport?.commission?.items || []).filter(
                        (i) =>
                          i.categoryKey !== "RATE_LAI_GOP_KY_GUI" &&
                          i.categoryKey !== "HOA_HONG_SALE" &&
                          i.categoryKey !== "HOA_HONG_DV",
                      ),
                  );
                  if (manualItems.length === 0) return null;
                  return manualItems.map((item) => (
                    <tr
                      key={item.key}
                      className="text-muted-foreground bg-slate-50/40 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20"
                    >
                      <td className="py-2 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>{item.categoryName}</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
                          >
                            {t("pnl.manualCommissionBadge", "Nhập tay")}
                          </Badge>
                        </div>
                        {item.note && (
                          <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
                            ({item.note})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
                        {item.curOjAmount !== undefined &&
                        item.curOjAmount !== 0
                          ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
                          : "—"}
                      </td>
                      <td
                        className={`py-2 px-4 text-right tabular-nums font-mono font-medium ${
                          item.curAmount < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : ""
                        }`}
                      >
                        {item.curAmount !== 0
                          ? `${item.curAmount < 0 ? `- ${Math.abs(item.curAmount).toLocaleString("vi-VN")} đ` : `${item.curAmount.toLocaleString("vi-VN")} đ`}`
                          : "—"}
                      </td>
                      <td
                        className={`py-2 px-4 text-right tabular-nums font-mono text-muted-foreground ${
                          (item.prevAmount ?? 0) < 0
                            ? "text-rose-600/80 dark:text-rose-400/80"
                            : ""
                        }`}
                      >
                        {item.prevAmount !== undefined && item.prevAmount !== 0
                          ? `${item.prevAmount < 0 ? `- ${Math.abs(item.prevAmount).toLocaleString("vi-VN")} đ` : `${item.prevAmount.toLocaleString("vi-VN")} đ`}`
                          : "—"}
                      </td>
                    </tr>
                  ));
                })()}

                {/* VII. Lợi nhuận ròng (sau hoa hồng) */}
                <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 text-foreground font-bold border-t-2 border-emerald-500/40 dark:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-[13px] text-emerald-900 dark:text-emerald-200">
                      {t(
                        "pnl.netProfitAfterCommissionHeader",
                        "VII. Lợi nhuận ròng (sau hoa hồng)",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px] px-2 py-0.5 border-emerald-300 dark:border-emerald-700 bg-emerald-100/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                    >
                      {report.netMarginRate.toFixed(2)}% Doanh thu
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-foreground border-r border-border/40">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>
                        {(
                          report.oj?.netProfitAfterCommission || 0
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </span>
                      {Boolean(report.oj && report.oj.revenue > 0) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
                        >
                          {report.oj!.netMarginRate.toFixed(2)}% DT
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
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
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-semibold text-emerald-600/70 dark:text-emerald-400/70">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>
                        {renderPrevVal(prevReport?.netProfitAfterCommission)}
                      </span>
                      {prevReport?.netMarginRate !== undefined ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0.5 border-emerald-300/60 dark:border-emerald-800/50 text-emerald-700/80 dark:text-emerald-300/80 font-normal"
                        >
                          {prevReport.netMarginRate.toFixed(2)}% DT
                        </Badge>
                      ) : null}
                    </div>
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
