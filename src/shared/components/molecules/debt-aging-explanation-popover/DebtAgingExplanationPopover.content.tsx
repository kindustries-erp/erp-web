import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import {
  Calendar,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Calculator,
  Brain,
} from "lucide-react";

export const AgingBucketsContent: React.FC<{
  context?: "garage" | "invoice";
}> = ({ context = "garage" }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
    <div className="space-y-2">
      {/* Bucket 1 */}
      <div className="p-2 rounded border border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-600" />
            {t(
              "debts:agingExplanation.bucket1Title",
              "Mới phát sinh (≤ 7-30 ngày)",
            )}
          </span>
          <Badge variant="outline" className="text-[10px] py-0">
            {t("debts:agingExplanation.bucket1Badge", "Trong hạn")}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {context === "garage"
            ? t(
                "garage:debts.agingExplanation.bucket1Desc",
                "Phiếu dịch vụ mới nghiệm thu bàn giao xe trong chu kỳ thanh toán tiêu chuẩn.",
              )
            : t(
                "debts:agingExplanation.bucket1Desc",
                "Hóa đơn trong hạn thanh toán chuẩn, đang trong chu kỳ đối soát công nợ.",
              )}
        </p>
      </div>

      {/* Bucket 2 */}
      <div className="p-2 rounded border border-amber-200/80 bg-amber-50/30 dark:bg-amber-950/20">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            {t(
              "debts:agingExplanation.bucket2Title",
              "Cần theo dõi (31-60 ngày)",
            )}
          </span>
          <Badge variant="outline" className="text-[10px] py-0">
            {t("debts:agingExplanation.bucket2Badge", "Theo dõi")}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "debts:agingExplanation.bucket2Desc",
            "Chớm quá hạn chu kỳ chuẩn. Bộ phận kế toán gửi thư nhắc nợ định kỳ hoặc đối chiếu sao kê.",
          )}
        </p>
      </div>

      {/* Bucket 3 */}
      <div className="p-2 rounded border border-orange-200/80 bg-orange-50/30 dark:bg-orange-950/20">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-xs text-orange-800 dark:text-orange-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            {t("debts:agingExplanation.bucket3Title", "Quá hạn (61-90 ngày)")}
          </span>
          <Badge variant="outline" className="text-[10px] py-0">
            {t("debts:agingExplanation.bucket3Badge", "Đôn đốc")}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "debts:agingExplanation.bucket3Desc",
            "Cần phòng kế toán & thu hồi nợ liên hệ đôn đốc thanh toán hoặc cấn trừ hóa đơn VAT.",
          )}
        </p>
      </div>

      {/* Bucket 4 */}
      <div className="p-2 rounded border border-rose-200/80 bg-rose-50/30 dark:bg-rose-950/20">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            {t(
              "debts:agingExplanation.bucket4Title",
              "Quá hạn sâu (> 90 ngày)",
            )}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] py-0 text-rose-700 border-rose-200"
          >
            {t("debts:agingExplanation.bucket4Badge", "Cảnh báo")}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "debts:agingExplanation.bucket4Desc",
            "Nợ quá hạn nặng có rủi ro khó đòi, yêu cầu kích hoạt biện pháp thu hồi nợ chuyên trách.",
          )}
        </p>
      </div>
    </div>
  );
};

export const AgingAlgorithmsContent: React.FC = () => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
    <div className="space-y-2">
      <div className="p-2 rounded border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-1.5 mb-1 text-primary font-semibold text-xs">
          <Calculator className="w-3.5 h-3.5" />
          <span>
            {t(
              "debts:agingExplanation.algo1Title",
              "1. Dự báo dòng tiền (T+7 / T+30)",
            )}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "debts:agingExplanation.algo1Desc",
            "Thuật toán dự báo ngày dòng tiền về tài khoản dựa trên độ trễ thanh toán bình quân lịch sử của đối tác.",
          )}
        </p>
      </div>

      <div className="p-2 rounded border border-border/80 bg-surface">
        <div className="flex items-center gap-1.5 mb-1 text-violet-700 dark:text-violet-400 font-semibold text-xs">
          <Brain className="w-3.5 h-3.5" />
          <span>
            {t(
              "debts:agingExplanation.algo2Title",
              "2. Dòng tiền kỳ vọng & Dự phòng (IFRS 9)",
            )}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "debts:agingExplanation.algo2Desc",
            "Mô hình tổn thất tín dụng dự kiến (ECL): Phân bổ xác suất thu hồi giảm dần theo từng khung tuổi nợ (85% → 60% → 30% → 10%).",
          )}
        </p>
      </div>
    </div>
  );
};
