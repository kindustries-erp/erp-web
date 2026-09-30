import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Building2,
  Coins,
  Split,
  AlertCircle,
} from "lucide-react";

export interface SuggestionBadgeConfig {
  key: string;
  label: string;
  shortLabel: string;
  tooltipText: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClasses: string;
  glowClasses: string;
  dotClasses: string;
  isActionable: boolean;
  warningKey?: string;
  warningText?: string;
}

export const BADGE_CONFIG_MAP: Record<
  "PERFECT" | "HIGH" | "LIKELY" | "POSSIBLE" | "NOTICE_STRONG" | "NOTICE",
  SuggestionBadgeConfig
> = {
  PERFECT: {
    key: "smartSuggestion.badge.perfect",
    label: "Tiền + Số HĐ/CT + Đối tác",
    shortLabel: "Hoàn hảo",
    tooltipText:
      "Khớp hoàn hảo 100%: Số tiền + Số HĐ/CT/Ký hiệu mẫu + Tên đối tác & MST",
    icon: Sparkles,
    badgeClasses:
      "text-emerald-800 bg-emerald-100/90 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    glowClasses: "bg-emerald-500",
    dotClasses: "bg-emerald-600",
    isActionable: true,
  },
  HIGH: {
    key: "smartSuggestion.badge.high",
    label: "Tiền + Số HĐ/CT",
    shortLabel: "Khớp số HĐ",
    tooltipText:
      "Độ tin cậy cao: Khớp Số tiền + Số HĐ/Ký hiệu mẫu số/Biển số xe",
    icon: CheckCircle2,
    badgeClasses:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    glowClasses: "bg-emerald-400",
    dotClasses: "bg-emerald-500",
    isActionable: true,
  },
  LIKELY: {
    key: "smartSuggestion.badge.likely",
    label: "Tiền + Tên đối tác",
    shortLabel: "Khớp đối tác",
    tooltipText:
      "Khả năng cao: Khớp Số tiền + Tên đối tác kinh doanh / Mã số thuế",
    icon: Building2,
    badgeClasses:
      "text-teal-800 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    glowClasses: "bg-teal-400",
    dotClasses: "bg-teal-500",
    isActionable: true,
  },
  POSSIBLE: {
    key: "smartSuggestion.badge.possible",
    label: "Chỉ khớp số tiền",
    shortLabel: "Khớp tiền",
    tooltipText:
      "Chỉ khớp số tiền: Chưa tìm thấy số HĐ hoặc tên đối tác trong nội dung sao kê (Vui lòng kiểm tra kỹ)",
    icon: Coins,
    badgeClasses:
      "text-amber-800 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    glowClasses: "bg-amber-400",
    dotClasses: "bg-amber-500",
    isActionable: true,
    warningKey: "smartSuggestion.warning.possible",
    warningText: "Chỉ khớp số tiền, vui lòng kiểm tra kỹ",
  },
  NOTICE_STRONG: {
    key: "smartSuggestion.badge.noticeStrong",
    label: "Số HĐ/CT + Đối tác (khác tiền)",
    shortLabel: "Khác tiền",
    tooltipText:
      "Khớp Số HĐ & Đối tác (khác tiền): Khớp thông tin nhận diện nhưng số tiền lệch (có thể trả góp hoặc gộp nhiều HĐ)",
    icon: Split,
    badgeClasses:
      "text-orange-800 bg-orange-100 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    glowClasses: "bg-orange-500",
    dotClasses: "bg-orange-600",
    isActionable: false,
  },
  NOTICE: {
    key: "smartSuggestion.badge.notice",
    label: "Khớp Số HĐ/CT (khác tiền)",
    shortLabel: "Khác tiền",
    tooltipText:
      "Khớp Số HĐ (khác tiền): Tìm thấy số hóa đơn trong nội dung sao kê nhưng số tiền không khớp chính xác",
    icon: AlertCircle,
    badgeClasses:
      "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    glowClasses: "bg-orange-400",
    dotClasses: "bg-orange-500",
    isActionable: false,
  },
};

export interface SuggestionBadgePillProps {
  badgeType?:
    | "PERFECT"
    | "HIGH"
    | "LIKELY"
    | "POSSIBLE"
    | "NOTICE_STRONG"
    | "NOTICE";
  className?: string;
  showShortLabel?: boolean;
  customTooltip?: React.ReactNode;
}

export interface SmartSuggestionCardProps {
  txn?: {
    id: string;
    transDate?: string;
    referenceNumber?: string;
    seqNo?: string;
    description?: string;
    debitAmount?: number;
    creditAmount?: number;
    sourceType?: string;
    correspondentName?: string;
    bankAccount?: {
      bankName?: string;
      accountNumber?: string;
    };
    cashBook?: {
      name?: string;
    };
    remainingAmount?: number;
    alreadySettledForThisCase?: boolean;
  };
  amount: number;
  isSuggestion?: boolean;
  badgeType?:
    | "PERFECT"
    | "HIGH"
    | "LIKELY"
    | "POSSIBLE"
    | "NOTICE_STRONG"
    | "NOTICE";
  matchedKeywords?: string[];
  onAccept?: () => void;
  netOffProps?: {
    value: number;
    maxValue?: number;
    onChange: (val: number) => void;
    onRemove: () => void;
  };
  onViewDetail?: (txnId: string) => void;
}
