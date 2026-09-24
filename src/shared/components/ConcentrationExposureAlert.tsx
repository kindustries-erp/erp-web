import React from "react";
import { Building2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/shared/utils";

export interface ConcentrationExposureAlertProps {
  partnerCount: number;
  sharePercentage: number;
  variant?: "warning" | "danger" | "info";
  message?: string;
  className?: string;
}

export function ConcentrationExposureAlert({
  partnerCount,
  sharePercentage,
  variant = "warning",
  message,
  className,
}: ConcentrationExposureAlertProps) {
  const variantStyles = {
    warning:
      "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300",
    danger:
      "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300",
    info: "bg-sky-500/10 border-sky-500/20 text-sky-800 dark:text-sky-300",
  };

  const Icon =
    variant === "danger"
      ? AlertTriangle
      : variant === "info"
        ? Info
        : Building2;

  const defaultMessage = `Top ${partnerCount} đối tác chi phối ${sharePercentage}% dòng tiền`;

  return (
    <div
      className={cn(
        "p-2.5 rounded-lg border text-xs transition-all",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-center gap-1.5 font-semibold text-[11px]">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{message || defaultMessage}</span>
      </div>
    </div>
  );
}
