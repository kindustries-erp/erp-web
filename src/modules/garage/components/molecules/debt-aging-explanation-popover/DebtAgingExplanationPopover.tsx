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
  Brain,
} from "lucide-react";
import type { DebtAgingExplanationPopoverProps } from "./DebtAgingExplanationPopover.type";

export const DebtAgingExplanationPopover: React.FC<
  DebtAgingExplanationPopoverProps
> = ({ className }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [activeTab, setActiveTab] = useState<"buckets" | "algorithms">(
    "buckets",
  );
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      sideOffset={8}
      glass={true}
      className={cn(
        "w-[420px] sm:w-[460px] p-0 overflow-hidden text-foreground text-xs",
        className,
      )}
      content={
        <div className="flex flex-col max-h-[460px]">
          {/* Header */}
          <div className="p-3 border-b border-border/70 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-3 h-3" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">
                  {t(
                    "garage:debts.agingExplanation.title",
                    "Quy Tắc Phân Tầng Tuổi Nợ Garage",
                  )}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {t(
                    "garage:debts.agingExplanation.subtitle",
                    "Tính từ ngày hoàn thành công việc phiếu dịch vụ (ngay_hoan_thanh_cong_viec)",
                  )}
                </p>
              </div>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-md bg-muted/50 border border-border/50 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("buckets")}
                className={cn(
                  "py-1 px-2 font-medium rounded transition-all text-center flex items-center justify-center gap-1.5",
                  activeTab === "buckets"
                    ? "bg-surface text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Clock className="w-3 h-3 text-emerald-600" />
                {t(
                  "garage:debts.agingExplanation.tabBuckets",
                  "4 Nhóm Tuổi Nợ",
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("algorithms")}
                className={cn(
                  "py-1 px-2 font-medium rounded transition-all text-center flex items-center justify-center gap-1.5",
                  activeTab === "algorithms"
                    ? "bg-surface text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Brain className="w-3 h-3 text-primary" />
                {t(
                  "garage:debts.agingExplanation.tabAlgorithms",
                  "Dự Báo Thuật Toán",
                )}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
            {activeTab === "buckets" ? (
              <div className="space-y-2">
                <div className="p-2 rounded border border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      Mới phát sinh (≤ 7 ngày)
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      Tồn mới
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Phiếu dịch vụ mới bàn giao xe trong tuần qua, đang trong chu
                    kỳ đối chiếu nghiệm thu.
                  </p>
                </div>

                <div className="p-2 rounded border border-border/80 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      Trong hạn chuẩn (≤ 30 ngày)
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      Trong hạn
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Chu kỳ công nợ chuẩn 30 ngày cho các đội xe, đối tác bảo
                    hiểm và khách hàng garage.
                  </p>
                </div>

                <div className="p-2 rounded border border-orange-200/80 bg-orange-50/30 dark:bg-orange-950/20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs text-orange-800 dark:text-orange-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      Quá hạn 31-90 ngày
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      Đôn đốc
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cần phòng kế toán & thu hồi nợ liên hệ đôn đốc thanh toán
                    hoặc cấn trừ hóa đơn VAT.
                  </p>
                </div>

                <div className="p-2 rounded border border-rose-200/80 bg-rose-50/30 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-rose-600" />
                      Quá hạn sâu (&gt; 90 ngày)
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      Cảnh báo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Nợ quá hạn nặng có rủi ro khó đòi, yêu cầu kích hoạt biện
                    pháp thu hồi nợ chuyên trách.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2 rounded border border-border/80 bg-surface">
                  <h5 className="font-semibold text-xs text-primary mb-1">
                    1. Dự báo dòng tiền (T+7 / T+30)
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    Thuật toán dự báo ngày dòng tiền về tài khoản dựa trên độ
                    trễ thanh toán bình quân lịch sử của khách hàng.
                  </p>
                </div>

                <div className="p-2 rounded border border-border/80 bg-surface">
                  <h5 className="font-semibold text-xs text-violet-700 dark:text-violet-400 mb-1">
                    2. Dòng tiền kỳ vọng & Dự phòng (IFRS 9)
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    Mô hình tổn thất tín dụng dự kiến (ECL): Phân bổ xác suất
                    thu hồi giảm dần theo từng khung tuổi nợ (85% $\rightarrow$
                    60% $\rightarrow$ 30% $\rightarrow$ 10%).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      }
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border/60 hover:bg-muted/40 transition-colors"
      >
        <HelpCircle className="w-3 h-3 text-primary" />
        <span>{t("garage:debts.agingExplanation.btn", "Quy tắc tính")}</span>
      </button>
    </Popover>
  );
};
