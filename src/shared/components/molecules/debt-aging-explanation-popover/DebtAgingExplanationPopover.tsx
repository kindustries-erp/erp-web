import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "@/core/components/ui/Popover";
import { cn } from "@/shared/utils";
import { HelpCircle, Clock, Sparkles, Brain } from "lucide-react";
import type { DebtAgingExplanationPopoverProps } from "./DebtAgingExplanationPopover.type";
import {
  AgingBucketsContent,
  AgingAlgorithmsContent,
} from "./DebtAgingExplanationPopover.content";

export const DebtAgingExplanationPopover: React.FC<
  DebtAgingExplanationPopoverProps
> = ({ className, context = "garage", title, subtitle }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [activeTab, setActiveTab] = useState<"buckets" | "algorithms">(
    "buckets",
  );
  const [open, setOpen] = useState(false);

  const resolvedTitle =
    title ??
    (context === "garage"
      ? t(
          "garage:debts.agingExplanation.title",
          "Quy Tắc Phân Tầng Tuổi Nợ Garage",
        )
      : t(
          "debts:agingExplanation.title",
          "Phương Pháp Luận & Diễn Giải Thuật Toán",
        ));

  const resolvedSubtitle =
    subtitle ??
    (context === "garage"
      ? t(
          "garage:debts.agingExplanation.subtitle",
          "Tính từ ngày hoàn thành công việc phiếu dịch vụ (ngay_hoan_thanh_cong_viec)",
        )
      : t(
          "debts:agingExplanation.subtitle",
          "Mô hình phân bổ 4 tầng rủi ro & thuật toán dự báo dòng tiền",
        ));

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
              <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Sparkles className="w-3 h-3" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">
                  {resolvedTitle}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {resolvedSubtitle}
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
                <span>
                  {t("debts:agingExplanation.tabBuckets", "4 Nhóm Tuổi Nợ")}
                </span>
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
                <span>
                  {t(
                    "debts:agingExplanation.tabAlgorithms",
                    "Dự Báo Thuật Toán",
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
            {activeTab === "buckets" ? (
              <AgingBucketsContent context={context} />
            ) : (
              <AgingAlgorithmsContent />
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
        <span>{t("debts:agingExplanation.btn", "Quy tắc tính")}</span>
      </button>
    </Popover>
  );
};
