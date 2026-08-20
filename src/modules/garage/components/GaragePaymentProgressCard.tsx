import React, { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  TrendingUp,
} from "lucide-react";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import {
  GarageCollectionSummary,
  GarageCostPaymentSummary,
  GarageTrendItem,
} from "../api/garageDashboardApi";

interface GaragePaymentProgressCardProps {
  collectionSummary?: GarageCollectionSummary;
  costPaymentSummary?: GarageCostPaymentSummary;
  trend?: GarageTrendItem[];
  loading?: boolean;
}

export function GaragePaymentProgressCard({
  collectionSummary,
  costPaymentSummary,
  trend = [],
  loading = false,
}: GaragePaymentProgressCardProps) {
  const [activeTab, setActiveTab] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");

  // Receipt (Collection) stats
  const totalBilled = collectionSummary?.totalBilled || 0;
  const totalPaid = collectionSummary?.totalPaid || 0;
  const totalReceivable = collectionSummary?.totalReceivable || 0;
  const collectionRate = collectionSummary?.collectionRate || 0;

  // Payment (Cost) stats
  const totalCost = costPaymentSummary?.totalCost || 0;
  const totalPaidCost = costPaymentSummary?.totalPaidCost || 0;
  const totalPayableCost = costPaymentSummary?.totalPayableCost || 0;
  const costPaymentRate = costPaymentSummary?.paymentRate || 0;

  const isReceipt = activeTab === "RECEIPT";
  const currentRate = isReceipt ? collectionRate : costPaymentRate;
  const currentTotal = isReceipt ? totalBilled : totalCost;
  const currentPaid = isReceipt ? totalPaid : totalPaidCost;
  const currentRemaining = isReceipt ? totalReceivable : totalPayableCost;

  // Rate badge color
  const getBadgeVariant = (rate: number) => {
    if (rate >= 90)
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    if (rate >= 70)
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    if (rate >= 50)
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-gradient-to-r from-emerald-500 to-teal-500";
    if (rate >= 70) return "bg-gradient-to-r from-blue-500 to-emerald-500";
    if (rate >= 50) return "bg-gradient-to-r from-amber-500 to-blue-500";
    return "bg-gradient-to-r from-rose-500 to-amber-500";
  };

  const formatMonth = (m: string) => {
    const parts = m.split("-");
    if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
    return m;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            {isReceipt ? (
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            Tiến độ Dòng tiền & Công nợ Dịch vụ
          </h4>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 gap-1">
          <button
            onClick={() => setActiveTab("RECEIPT")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              isReceipt
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Tiến độ Thu tiền (Khách hàng)
          </button>
          <button
            onClick={() => setActiveTab("PAYMENT")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !isReceipt
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Tiến độ Trả tiền (Chi phí NCC)
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-5 flex flex-col gap-4">
        {/* Progress Bar & Rate Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {isReceipt
                  ? "Tỷ lệ hoàn tất thu tiền dịch vụ"
                  : "Tỷ lệ hoàn tất chi trả chi phí / NCC"}
              </span>
              <Badge
                variant="outline"
                className={`font-semibold px-2 py-0.5 text-xs border ${getBadgeVariant(currentRate)}`}
              >
                {currentRate.toFixed(1)}% Hoàn tất
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {isReceipt ? "Đã thu" : "Đã trả"}{" "}
              <strong
                className={
                  isReceipt
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-blue-600 dark:text-blue-400 font-semibold"
                }
              >
                {money(currentPaid)}
              </strong>{" "}
              / Tổng {money(currentTotal)}
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(currentRate)}`}
              style={{
                width: `${loading ? 0 : Math.min(100, Math.max(0, currentRate))}%`,
              }}
            />
          </div>
        </div>

        {/* 4 Metric Sub-Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Card 1: Tổng phát sinh */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">
                {isReceipt ? "Tổng tiền dịch vụ" : "Tổng chi phí phát sinh"}
              </span>
              {isReceipt ? (
                <Wallet className="w-4 h-4 text-slate-500" />
              ) : (
                <Truck className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {loading ? "..." : money(currentTotal)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Từ 07/2026 (Đã hoàn thành)
              </span>
            </div>
          </div>

          {/* Card 2: Đã thanh toán */}
          <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="text-xs font-medium">
                {isReceipt
                  ? "Đã thanh toán (Thực thu)"
                  : "Đã chi trả (Thực chi)"}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : money(currentPaid)}
              </div>
              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                {currentRate.toFixed(1)}% trên tổng phát sinh (từ 07/2026)
              </span>
            </div>
          </div>

          {/* Card 3: Còn nợ */}
          <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-xs font-medium">
                {isReceipt
                  ? "Còn nợ (Phải thu khách)"
                  : "Còn nợ (Phải trả NCC)"}
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {loading ? "..." : money(currentRemaining)}
              </div>
              <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
                {(100 - currentRate).toFixed(1)}% công nợ còn lại
              </span>
            </div>
          </div>

          {/* Card 4: Hiệu suất dòng tiền */}
          <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-1">
              <span className="text-xs font-medium">
                {isReceipt ? "Tỷ lệ thu hồi tiền" : "Tỷ lệ chi trả chi phí"}
              </span>
              <Percent className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {loading ? "..." : `${currentRate.toFixed(1)}%`}
              </div>
              <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium">
                {currentRate >= 80 ? "Dòng tiền tốt" : "Cần theo dõi sát"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: So sánh Tỷ lệ hoàn tất qua từng tháng (Month-over-Month Comparison) */}
        {trend.length > 0 && (
          <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                So sánh {isReceipt ? "Tỷ lệ Thu tiền" : "Tỷ lệ Trả tiền"} theo
                từng tháng
              </span>
              <span className="text-[11px] text-muted-foreground">
                So sánh biến động MoM (% chênh lệch so với tháng trước)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {trend.map((t, idx) => {
                const monthRate = isReceipt
                  ? t.collectionRate
                  : t.costPaymentRate;
                const monthDiff = isReceipt
                  ? t.collectionRateDiff
                  : t.costPaymentRateDiff;
                const isPositive = monthDiff > 0;
                const isZero = monthDiff === 0 || idx === 0;

                return (
                  <div
                    key={t.label}
                    className="p-2.5 rounded-md bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatMonth(t.label)}
                      </span>
                      {!isZero ? (
                        <span
                          className={`inline-flex items-center text-[10px] font-bold ${
                            isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {isPositive ? `+${monthDiff}%` : `${monthDiff}%`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          —
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {monthRate.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {isReceipt ? money(t.paid) : money(t.paidCost)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footnote Note */}
        <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 italic bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
          <span>*</span>
          <span>
            {isReceipt
              ? "Tỷ lệ hoàn tất thu tiền dịch vụ được tính từ tháng 07/2026 trở đi (đồng bộ với mốc đối soát dòng tiền thực thu của phân hệ Khách hàng & Công nợ)."
              : "Tỷ lệ hoàn tất chi trả chi phí được tính từ tháng 07/2026 trở đi (dựa trên sao kê ngân hàng và sổ quỹ tiền mặt thực chi)."}
          </span>
        </div>
      </div>
    </div>
  );
}
