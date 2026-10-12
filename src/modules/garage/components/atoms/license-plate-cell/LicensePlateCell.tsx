import React from "react";
import { useTranslation } from "react-i18next";
import { CopyButton } from "@/shared/components/CopyButton";
import { cn } from "@/shared/utils";
import { Car } from "lucide-react";
import type { LicensePlateCellProps } from "./LicensePlateCell.type";

export const LicensePlateCell: React.FC<LicensePlateCellProps> = ({
  licensePlate,
  className,
}) => {
  const { t } = useTranslation(["garage", "common"]);
  const lp = licensePlate?.trim();

  if (!lp) {
    return (
      <span
        className={cn(
          "text-muted-foreground/50 italic select-none text-xs",
          className,
        )}
      >
        {t("customers.emptyLicensePlate", "— (Chưa có BKS)")}
      </span>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1.5 min-w-0 group/lp", className)}
    >
      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="truncate font-mono font-medium text-xs text-foreground select-text">
        {lp}
      </span>
      <CopyButton
        value={lp}
        variant="hover-only"
        tooltip={t("customers.actions.copyLicensePlate", "Copy biển số")}
        copiedTooltip={t("customers.actions.copied", "Đã copy")}
        iconClassName="w-2.5 h-2.5"
        className="h-3.5 w-3.5 p-0"
      />
    </div>
  );
};
