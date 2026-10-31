import * as React from "react";
import { Sliders, RotateCcw, Check, AlertCircle } from "lucide-react";
import { V2Button, V2Text, V2Icon } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2MobileNavCustomizeBarProps } from "./V2MobileNavCustomizeBar.type";

export const V2MobileNavCustomizeBar: React.FC<
  V2MobileNavCustomizeBarProps
> = ({
  currentCount,
  maxCount,
  isCustomizing,
  limitWarning,
  onStartCustomize,
  onFinishCustomize,
  onResetDefault,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <V2Icon icon={Sliders} size={14} className="text-primary" />
            <V2Text variant="caption" weight="semibold">
              {t("v2.nav.customize", "Tùy chỉnh lối tắt")}{" "}
              <V2Text as="span" variant="caption" color="muted" weight="normal">
                ({currentCount}/{maxCount})
              </V2Text>
            </V2Text>
          </div>
          <V2Text
            variant="caption"
            color="muted"
            className="text-[11px] mt-0.5"
          >
            {isCustomizing
              ? t(
                  "v2.nav.customizeShortcutsHint",
                  "Chọn tối đa 4 mục thao tác nhanh ngoài Bottom Nav",
                )
              : t("v2.nav.pinnedShortcutsCount", {
                  defaultValue: `Đang ghim ${currentCount} mục lối tắt ở Bottom Nav`,
                  count: currentCount,
                })}
          </V2Text>
        </div>
        <div className="flex items-center gap-1.5">
          {isCustomizing ? (
            <>
              <V2Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-fg"
                onClick={onResetDefault}
                title={t("v2.nav.resetDefault", "Khôi phục mặc định")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </V2Button>
              <V2Button
                size="sm"
                variant="default"
                className="h-8 px-3 text-xs gap-1"
                onClick={onFinishCustomize}
              >
                <Check className="h-3.5 w-3.5" />
                <V2Text as="span" variant="caption" weight="medium">
                  {t("v2.common.done", "Xong")}
                </V2Text>
              </V2Button>
            </>
          ) : (
            <V2Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
              onClick={onStartCustomize}
            >
              <Sliders className="h-3.5 w-3.5" />
              <V2Text as="span" variant="caption" weight="medium">
                {t("v2.common.edit", "Sửa")}
              </V2Text>
            </V2Button>
          )}
        </div>
      </div>

      {limitWarning && (
        <div
          data-testid="limit-warning-banner"
          className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2 animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <V2Text
            as="span"
            variant="caption"
            className="text-destructive font-medium"
          >
            {limitWarning}
          </V2Text>
        </div>
      )}
    </div>
  );
};

V2MobileNavCustomizeBar.displayName = "V2MobileNavCustomizeBar";
