import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/utils";
import type { PnlViewModeSwitchProps } from "./PnlViewModeSwitch.type";

export function PnlViewModeSwitch({
  isOjOnly,
  onChange,
  className,
  disabled = false,
}: PnlViewModeSwitchProps) {
  const { t } = useTranslation("garage");

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 flex-shrink-0 select-none",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs cursor-pointer transition-colors",
          !isOjOnly
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => !disabled && onChange(false)}
      >
        {t("pnl.viewModeAll", "Toàn bộ")}
      </span>
      <Switch
        checked={isOjOnly}
        onCheckedChange={(checked) => !disabled && onChange(checked)}
        disabled={disabled}
        aria-label={t(
          "pnl.viewModeAriaLabel",
          "Chuyển đổi xem Kết quả kinh doanh Toàn bộ hoặc Riêng OJ",
        )}
      />
      <span
        className={cn(
          "text-xs cursor-pointer transition-colors",
          isOjOnly
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => !disabled && onChange(true)}
      >
        {t("pnl.viewModeOj", "Riêng OJ")}
      </span>
    </div>
  );
}
