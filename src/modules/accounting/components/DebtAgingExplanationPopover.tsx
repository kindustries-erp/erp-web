import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "@/core/components/ui/Popover";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import {
  HelpCircle,
  Calendar,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Calculator,
  LineChart,
  Brain,
  Info,
} from "lucide-react";

export function DebtAgingExplanationPopover() {
  const { t } = useTranslation(["debts", "common"]);
  const [activeTab, setActiveTab] = useState<"buckets" | "algorithms">(
    "buckets",
  );
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      sideOffset={8}
      glass={true}
      className="w-[450px] sm:w-[480px] p-0 overflow-hidden text-foreground text-xs"
      content={
        <div className="flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="p-3.5 border-b border-border/70 bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    {t(
                      "debts:agingExplanation.title",
                      "Phương Pháp Luận & Diễn Giải Thuật Toán",
                    )}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {t(
                      "debts:agingExplanation.subtitle",
                      "Giải thích chi tiết 4 nhóm phân tầng tuổi nợ và các mô hình dự báo dòng tiền thông minh",
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-1 p-0.5 mt-3 rounded-lg bg-muted/50 border border-border/50">
              <button
                type="button"
                onClick={() => setActiveTab("buckets")}
                className={cn(
                  "py-1 px-2 text-[11px] font-medium rounded-md transition-all text-center flex items-center justify-center gap-1.5",
                  activeTab === "buckets"
                    ? "bg-surface text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Clock className="w-3 h-3 text-emerald-600" />
                {t(
                  "debts:agingExplanation.tabBuckets",
                  "1. Bản chất 4 Nhóm Tuổi Nợ",
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("algorithms")}
                className={cn(
                  "py-1 px-2 text-[11px] font-medium rounded-md transition-all text-center flex items-center justify-center gap-1.5",
                  activeTab === "algorithms"
                    ? "bg-surface text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Brain className="w-3 h-3 text-primary" />
                {t(
                  "debts:agingExplanation.tabAlgorithms",
                  "2. Thuật Toán Dự Báo",
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin">
            {activeTab === "buckets" ? (
              <div className="space-y-2.5">
                {/* Bucket 1: <= 7 days */}
                <div className="p-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {t(
                        "debts:agingExplanation.bucket1Title",
                        "Mới phát sinh (≤ 7 ngày)",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-medium"
                    >
                      Tồn mới
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.bucket1Desc",
                      "Hóa đơn mới phát hành trong vòng 7 ngày qua, đang trong chu kỳ luân chuyển và đối chiếu chứng từ gốc.",
                    )}
                  </p>
                </div>

                {/* Bucket 2: <= 30 days */}
                <div className="p-2.5 rounded-lg border border-border/80 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {t(
                        "debts:agingExplanation.bucket2Title",
                        "Trong hạn chuẩn (≤ 30 ngày)",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] px-1.5 py-0 font-medium"
                    >
                      Trong hạn
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.bucket2Desc",
                      "Nợ nằm trong chu kỳ công nợ thương mại tiêu chuẩn (Net 30), hoạt động thu chi diễn ra bình thường.",
                    )}
                  </p>
                </div>

                {/* Bucket 3: 31-90 days */}
                <div className="p-2.5 rounded-lg border border-orange-200/80 bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                      {t(
                        "debts:agingExplanation.bucket3Title",
                        "Quá hạn 31-90 ngày",
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] px-1.5 py-0 font-medium"
                    >
                      Đôn đốc
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.bucket3Desc",
                      "Nợ đã trễ hạn từ 1 đến 3 tháng. Kế toán cần gửi thư nhắc nợ, đối soát và lên lịch đôn đốc thu hồi.",
                    )}
                  </p>
                </div>

                {/* Bucket 4: >90 days */}
                <div className="p-2.5 rounded-lg border border-rose-200/80 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                      {t(
                        "debts:agingExplanation.bucket4Title",
                        "Quá hạn >90 ngày",
                      )}
                    </span>
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1.5 py-0 font-medium"
                    >
                      Cảnh báo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.bucket4Desc",
                      "Nợ tồn đọng lâu ngày có nguy cơ trở thành nợ khó đòi. Cần kích hoạt quy trình thu hồi đặc biệt hoặc trích lập dự phòng rủi ro.",
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Algo 1: Weighted Partner Lag */}
                <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-1.5 mb-1 text-primary font-semibold text-xs">
                    <Calculator className="w-3.5 h-3.5" />
                    {t(
                      "debts:agingExplanation.algo1Title",
                      "1. Thuật toán Weighted Partner Lag (DSO/DPO)",
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.algo1Desc",
                      "Hệ thống học thói quen thanh toán lịch sử của từng khách hàng để dự báo chính xác ngày tiền về thực tế thay vì nhìn vào kỳ hạn lý thuyết.",
                    )}
                  </p>
                  <div className="mt-1.5 text-[10px] font-mono bg-background/80 px-2 py-1 rounded border border-border/60 text-foreground/90">
                    Ngày dự báo = Ngày HĐ + Độ trễ trung bình của Đối tác
                  </div>
                </div>

                {/* Algo 2: IFRS 9 Roll Rate */}
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex items-center gap-1.5 mb-1 text-foreground font-semibold text-xs">
                    <Brain className="w-3.5 h-3.5 text-amber-600" />
                    {t(
                      "debts:agingExplanation.algo2Title",
                      "2. Ma trận Xác suất Thu hồi (IFRS 9 / Roll Rate)",
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.algo2Desc",
                      "Dòng tiền kỳ vọng được tính theo trọng số xác suất thu hồi giảm dần theo từng nhóm tuổi nợ (0-30d: 85%, 31-60d: 60%, 61-90d: 30%, >90d: 10%).",
                    )}
                  </p>
                  <div className="mt-1.5 text-[10px] font-mono bg-background/80 px-2 py-1 rounded border border-border/60 text-foreground/90">
                    Dòng tiền kỳ vọng = Σ (Dư nợ x Xác suất thu hồi)
                  </div>
                </div>

                {/* Algo 3: Bank Time Series */}
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20">
                  <div className="flex items-center gap-1.5 mb-1 text-foreground font-semibold text-xs">
                    <LineChart className="w-3.5 h-3.5 text-emerald-600" />
                    {t(
                      "debts:agingExplanation.algo3Title",
                      "3. Chuỗi thời gian Dòng tiền Ngân hàng",
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      "debts:agingExplanation.algo3Desc",
                      "Phân tích chu kỳ thu/chi thực tế qua sao kê ngân hàng theo từng khoảng thời gian trong tháng để dự phóng biến động số dư tiền mặt.",
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 px-3.5 border-t border-border/60 bg-muted/10 text-[10px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-primary" />
              Click từng thẻ để xem danh sách HĐ & đối tác chi tiết
            </span>
          </div>
        </div>
      }
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        aria-label={t(
          "debts:agingExplanation.title",
          "Phương Pháp Luận & Diễn Giải Thuật Toán",
        )}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    </Popover>
  );
}
