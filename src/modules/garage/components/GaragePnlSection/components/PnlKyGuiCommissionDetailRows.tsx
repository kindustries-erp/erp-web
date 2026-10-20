import React from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlKyGuiCommissionDetailRowsProps {
  kyGuiProfit: number;
  grossProfit: number;
  rate0: number;
  rate1?: number;
  rate2?: number;
  sale0: number;
  sale1?: number;
  sale2?: number;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlKyGuiCommissionDetailRows({
  kyGuiProfit,
  grossProfit,
  rate0,
  rate1,
  rate2,
  sale0,
  sale1,
  sale2,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlKyGuiCommissionDetailRowsProps) {
  const { t } = useTranslation("garage");
  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 4.1.1. Tỷ lệ lãi gộp ký gửi / Lãi gộp */}
      <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
        <td className="py-1.5 pl-14 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] italic">
              {t(
                "pnl.kyGuiProfitRate",
                "4.1.1. Tỷ lệ lãi gộp ký gửi / Lãi gộp",
              )}
            </span>
            <Tooltip
              content={
                <div className="text-[11px] space-y-1 py-0.5">
                  <div className="font-semibold text-purple-300">
                    {t("pnl.kyGuiAllocationBadge", "Tỷ trọng phân bổ Sale")}
                  </div>
                  <div>
                    Lãi gộp Ký gửi: {kyGuiProfit.toLocaleString("vi-VN")} đ
                  </div>
                  <div>
                    Tổng lãi gộp: {grossProfit.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              }
              side="right"
            >
              <span className="cursor-help inline-flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <Info className="w-3 h-3" />
              </span>
            </Tooltip>
          </div>
        </td>
        <PnlAmountCell
          amount={rate0}
          prevAmount={rate1}
          isRatioOnly
          isLoadingPrev={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={rate1}
          prevAmount={rate2}
          isRatioOnly
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={rate2}
          isRatioOnly
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>

      {/* 4.1.2. Hoa hồng Sale tính toán */}
      <tr className="text-muted-foreground hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t(
              "pnl.saleCommissionCalculated",
              "4.1.2. Hoa hồng Sale từ xe Ký gửi / Nội bộ (10% × LN ròng × Tỷ lệ Ký gửi)",
            )}
          </span>
        </td>
        <PnlAmountCell
          amount={sale0}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={sale1}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={sale2}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>
    </>
  );
}
