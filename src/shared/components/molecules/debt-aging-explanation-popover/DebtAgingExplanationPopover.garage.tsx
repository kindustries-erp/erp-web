import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, Clock, AlertTriangle, AlertOctagon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface GarageBucketConfig {
  key: string;
  titleDefault: string;
  badgeDefault: string;
  descDefault: string;
  icon: LucideIcon;
  tone: string;
  iconTone: string;
  titleTone: string;
}

/** 5 nhóm tuổi nợ garage, khớp 5 thẻ trên dashboard (không chồng lấn). */
const GARAGE_BUCKETS: GarageBucketConfig[] = [
  {
    key: "fresh7",
    titleDefault: "Mới phát sinh (≤ 7 ngày)",
    badgeDefault: "Mới",
    descDefault:
      "Phiếu dịch vụ mới nghiệm thu bàn giao xe, còn trong chu kỳ thanh toán tiêu chuẩn.",
    icon: Calendar,
    tone: "border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20",
    iconTone: "text-emerald-600",
    titleTone: "text-emerald-800 dark:text-emerald-300",
  },
  {
    key: "standard8To30",
    titleDefault: "Trong hạn chuẩn (8–30 ngày)",
    badgeDefault: "Chuẩn",
    descDefault:
      "Phiếu đã quá giai đoạn mới phát sinh nhưng còn trong 30 ngày kể từ ngày nghiệm thu.",
    icon: Clock,
    tone: "border-slate-200/80 bg-slate-50/30 dark:bg-slate-950/20",
    iconTone: "text-slate-600",
    titleTone: "text-slate-800 dark:text-slate-300",
  },
  {
    key: "overdue31To60",
    titleDefault: "Quá hạn 31-60 ngày",
    badgeDefault: "Đôn đốc",
    descDefault:
      "Quá hạn chu kỳ chuẩn. Kế toán gửi thư nhắc nợ hoặc đối chiếu sao kê với khách hàng.",
    icon: AlertTriangle,
    tone: "border-orange-200/80 bg-orange-50/30 dark:bg-orange-950/20",
    iconTone: "text-orange-600",
    titleTone: "text-orange-800 dark:text-orange-300",
  },
  {
    key: "overdue61To90",
    titleDefault: "Quá hạn 61-90 ngày",
    badgeDefault: "Nguy cơ",
    descDefault:
      "Nợ quá hạn kéo dài, cần phòng kế toán và thu hồi nợ liên hệ đôn đốc thanh toán sớm.",
    icon: AlertTriangle,
    tone: "border-amber-200/80 bg-amber-50/30 dark:bg-amber-950/20",
    iconTone: "text-amber-600",
    titleTone: "text-amber-800 dark:text-amber-300",
  },
  {
    key: "over90",
    titleDefault: "Quá hạn >90 ngày",
    badgeDefault: "Cảnh báo",
    descDefault:
      "Nợ quá hạn nặng có rủi ro khó đòi, yêu cầu kích hoạt biện pháp thu hồi nợ chuyên trách.",
    icon: AlertOctagon,
    tone: "border-rose-200/80 bg-rose-50/30 dark:bg-rose-950/20",
    iconTone: "text-rose-600",
    titleTone: "text-rose-800 dark:text-rose-300",
  },
];

/** Nội dung "Quy tắc tính" của dashboard công nợ garage: 5 nhóm tuổi nợ. */
export const GarageAgingBucketsContent: React.FC = () => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
    <div className="space-y-2">
      {GARAGE_BUCKETS.map((b) => {
        const Icon = b.icon;
        return (
          <div key={b.key} className={`p-2 rounded border ${b.tone}`}>
            <div className="flex items-center justify-between mb-0.5">
              <span
                className={`font-semibold text-xs flex items-center gap-1 ${b.titleTone}`}
              >
                <Icon className={`w-3 h-3 ${b.iconTone}`} />
                {t(
                  `debts:agingExplanation.garage.${b.key}Title`,
                  b.titleDefault,
                )}
              </span>
              <Badge variant="outline" className="text-[10px] py-0">
                {t(
                  `debts:agingExplanation.garage.${b.key}Badge`,
                  b.badgeDefault,
                )}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t(`debts:agingExplanation.garage.${b.key}Desc`, b.descDefault)}
            </p>
          </div>
        );
      })}
    </div>
  );
};
