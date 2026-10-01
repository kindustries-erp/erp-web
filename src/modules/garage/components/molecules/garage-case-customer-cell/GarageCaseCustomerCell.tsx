import React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { CopyButton } from "@/shared/components/CopyButton";
import { cn } from "@/shared/utils";
import type { GarageCaseCustomerCellProps } from "./GarageCaseCustomerCell.type";

export function GarageCaseCustomerCell({
  item,
  className,
}: GarageCaseCustomerCellProps) {
  const { t } = useTranslation(["garage", "common"]);
  const customerName = item.khachHangName?.trim() || "";
  const customerCode = item.khachHangCode?.trim() || "";

  if (!customerName && !customerCode) {
    return <span className="text-muted-foreground/50 select-none">—</span>;
  }

  return (
    <div className={cn("flex items-center gap-1.5 w-full min-w-0", className)}>
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-0 py-0">
        {/* Dòng 1: Tên khách hàng (đậm) + Nút Copy */}
        <div className="flex items-center gap-1 min-w-0 group/cname">
          <Tooltip content={customerName || "—"}>
            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight select-text">
              {customerName || "—"}
            </span>
          </Tooltip>
          {customerName && customerName !== "—" && (
            <CopyButton
              value={customerName}
              variant="hover-only"
              tooltip={t("cases.actions.copyCustomerName", "Copy tên")}
              copiedTooltip={t("cases.actions.copied", "Đã copy")}
              toastMessage={t(
                "cases.actions.copiedCustomerName",
                "Đã copy tên khách hàng",
              )}
              iconClassName="w-2.5 h-2.5"
              className="h-3.5 w-3.5 p-0"
            />
          )}
        </div>

        {/* Dòng 2: Mã khách hàng (mono mờ) + Nút Copy */}
        {customerCode && (
          <div className="flex items-center gap-1 min-w-0 group/ccode">
            <Tooltip content={`Mã KH: ${customerCode}`}>
              <span className="truncate text-[10.5px] font-normal font-mono text-muted-foreground leading-tight select-text">
                <span className="text-slate-400 font-sans mr-0.5">Mã:</span>
                {customerCode}
              </span>
            </Tooltip>
            <CopyButton
              value={customerCode}
              variant="hover-only"
              tooltip={t("cases.actions.copyCustomerCode", "Copy mã KH")}
              copiedTooltip={t("cases.actions.copied", "Đã copy")}
              toastMessage={t(
                "cases.actions.copiedCustomerCode",
                "Đã copy mã khách hàng",
              )}
              iconClassName="w-2.5 h-2.5"
              className="h-3 w-3 p-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GarageCaseCustomerCell;
