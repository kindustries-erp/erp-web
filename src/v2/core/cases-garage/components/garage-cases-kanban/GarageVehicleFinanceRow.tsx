import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { money } from "@/shared/utils/format";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface GarageVehicleFinanceRowProps {
  totalBilled: number;
  totalRemaining: number;
}

/** Hàng chỉ số tài chính cuối thẻ: phát sinh và còn nợ (hoặc đã thu đủ). */
export const GarageVehicleFinanceRow: React.FC<
  GarageVehicleFinanceRowProps
> = ({ totalBilled, totalRemaining }) => {
  const { t } = useV2Translation();

  return (
    <div className="pt-2 border-t border-border/40 dark:border-white/[0.06] flex items-center justify-between text-xs">
      <div className="flex flex-col">
        <V2Text
          variant="caption"
          className="text-[10px] text-muted-fg uppercase font-medium"
        >
          {t("v2.garageCases.kanban.totalBilled", "Phát sinh")}
        </V2Text>
        <V2Text
          variant="numeric"
          className="font-mono font-bold text-foreground text-xs tabular-nums"
        >
          {money(totalBilled)}
        </V2Text>
      </div>

      {totalRemaining > 0 ? (
        <div className="flex flex-col items-end">
          <V2Text
            variant="caption"
            className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-medium"
          >
            {t("v2.garageCases.kanban.remaining", "Còn nợ")}
          </V2Text>
          <V2Text
            variant="numeric"
            className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs tabular-nums"
          >
            {money(totalRemaining)}
          </V2Text>
        </div>
      ) : (
        <V2Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-medium gap-1"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>{t("v2.garageCases.kanban.paidInFull", "Đã thu đủ")}</span>
        </V2Badge>
      )}
    </div>
  );
};
