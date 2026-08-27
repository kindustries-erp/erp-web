import React from "react";
import { cn } from "@/shared/utils";
import {
  Building2,
  Wrench,
  ExternalLink,
  HelpCircle,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ClassificationMeta {
  value: string;
  label: string;
  subLabel?: string;
  colorClass: string;
  icon: React.ReactNode;
}

export const GARAGE_CASE_CLASSIFICATIONS: Record<string, ClassificationMeta> = {
  KY_GUI_NOI_BO: {
    value: "KY_GUI_NOI_BO",
    label: "Ký gửi / Nội bộ",
    subLabel: "Xe công ty, xe nội bộ hoặc nhận ký gửi xử lý kỹ thuật",
    colorClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/40",
    icon: <Building2 className="w-3 h-3 mr-1 shrink-0" />,
  },
  SUA_CHUA_CHUNG: {
    value: "SUA_CHUA_CHUNG",
    label: "Sửa chữa chung",
    subLabel: "Bảo dưỡng định kỳ, sửa chữa tổng quát cho khách hàng",
    colorClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/40",
    icon: <Wrench className="w-3 h-3 mr-1 shrink-0" />,
  },
  OJ: {
    value: "OJ",
    label: "OJ",
    subLabel: "Gia công ngoài hoặc bàn giao xưởng dịch vụ thứ 3",
    colorClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/40",
    icon: <ExternalLink className="w-3 h-3 mr-1 shrink-0" />,
  },
  OJ_NGOAI: {
    value: "OJ_NGOAI",
    label: "OJ Ngoài",
    subLabel: "Omoda & Jaecoo ghi nhận ngoài hệ thống",
    colorClass:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/40",
    icon: <ExternalLink className="w-3 h-3 mr-1 shrink-0" />,
  },
  KHAC: {
    value: "KHAC",
    label: "Khác",
    subLabel: "Các hạng mục nghiệp vụ phát sinh đặc thù khác",
    colorClass:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/40",
    icon: <HelpCircle className="w-3 h-3 mr-1 shrink-0" />,
  },
};

interface GarageCaseClassificationBadgeProps {
  classification?: string | null;
  className?: string;
  interactive?: boolean;
}

export function GarageCaseClassificationBadge({
  classification,
  className,
  interactive = false,
}: GarageCaseClassificationBadgeProps) {
  const { t } = useTranslation("garage");

  if (!classification || !GARAGE_CASE_CLASSIFICATIONS[classification]) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border border-dashed border-slate-300 dark:border-slate-700 text-muted-foreground/60 transition-colors",
          interactive &&
            "hover:border-primary/60 hover:text-primary hover:bg-primary/5",
          className,
        )}
      >
        <Plus className="w-2.5 h-2.5 mr-1 opacity-70" />
        {t("cases.classification.unclassified", "Chưa phân loại")}
      </span>
    );
  }

  const meta = GARAGE_CASE_CLASSIFICATIONS[classification];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border transition-all select-none",
        meta.colorClass,
        interactive && "hover:opacity-85 hover:shadow-xs",
        className,
      )}
    >
      {meta.icon}
      {t(`cases.classification.${meta.value}`, meta.label)}
    </span>
  );
}
