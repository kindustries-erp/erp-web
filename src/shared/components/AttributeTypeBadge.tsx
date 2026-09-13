import React from "react";
import { ShieldCheck, Tag } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils";

export type AttributeBadgeType = "system" | "custom";

export interface AttributeTypeBadgeProps {
  type?: AttributeBadgeType;
  label?: string;
  tooltip?: string;
  className?: string;
  showIcon?: boolean;
}

export function AttributeTypeBadge({
  type = "system",
  label,
  tooltip,
  className,
  showIcon = true,
}: AttributeTypeBadgeProps) {
  const { t } = useTranslation();

  const isSystem = type === "system";
  const displayLabel =
    label ||
    (isSystem
      ? t("common.default", "Mặc định")
      : t("common.custom", "Tùy chỉnh"));

  const defaultTooltip = isSystem
    ? t(
        "moduleConfig.systemAttributeTooltip",
        "Thuộc tính mặc định của hệ thống",
      )
    : t(
        "moduleConfig.customAttributeTooltip",
        "Trường tùy chỉnh do người dùng thêm vào",
      );

  const finalTooltip = tooltip || defaultTooltip;

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none select-none transition-colors",
        isSystem
          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
          : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900",
        className,
      )}
    >
      {showIcon &&
        (isSystem ? (
          <ShieldCheck className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400 shrink-0" />
        ) : (
          <Tag className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400 shrink-0" />
        ))}
      <span>{displayLabel}</span>
    </span>
  );

  if (!finalTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip content={finalTooltip}>
        <span className="inline-flex cursor-help">{badgeContent}</span>
      </Tooltip>
    </TooltipProvider>
  );
}
