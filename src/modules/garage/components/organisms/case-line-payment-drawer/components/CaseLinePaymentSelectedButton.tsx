import React from "react";
import { useTranslation } from "react-i18next";
import { CheckSquare } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";

export interface CaseLinePaymentSelectedButtonProps {
  selectedCount: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function CaseLinePaymentSelectedButton({
  selectedCount,
  isActive,
  onClick,
  className,
}: CaseLinePaymentSelectedButtonProps) {
  const { t } = useTranslation(["garage", "common"]);

  if (selectedCount <= 0) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isActive ? "primary" : "secondary"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-6 px-2 text-xs font-medium gap-1.5 rounded-md transition-all shadow-none",
        isActive
          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
          : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border",
        className,
      )}
      aria-pressed={isActive}
    >
      <CheckSquare className="h-3 w-3 shrink-0" />
      <span>{t("cases.financials.presetSelected", "Đang chọn")}</span>
      <span
        className={cn(
          "h-4 min-w-4 px-1 rounded-full text-[10px] font-bold leading-none flex items-center justify-center",
          isActive
            ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-900"
            : "bg-muted text-muted-foreground",
        )}
      >
        {selectedCount}
      </span>
    </Button>
  );
}
