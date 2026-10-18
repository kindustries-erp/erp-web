import React from "react";
import { money } from "@/shared/utils/format";
import { Eye, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export interface TimeHorizonTopPartnersTabProps {
  topPartners: Array<{
    partnerCode: string;
    partnerName: string;
    partnerType: "CUSTOMER" | "SUPPLIER";
    balanceAmount: number;
    caseCount: number;
    sharePercentage: number;
  }>;
  isLoading?: boolean;
  onOpenCustomerDetail?: (code: string, name?: string) => void;
}

export const TimeHorizonTopPartnersTab: React.FC<
  TimeHorizonTopPartnersTabProps
> = ({ topPartners, isLoading = false, onOpenCustomerDetail }) => {
  if (topPartners.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs">
        <Users className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <p>Không có đối tác nào phát sinh nợ trong mốc thời gian này</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground mb-1">
        Danh sách top khách hàng / đối tác chiếm tỷ trọng dư nợ lớn nhất trong
        mốc này:
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topPartners.map((p, idx) => (
          <div
            key={p.partnerCode || idx}
            className="p-3 rounded-lg border border-border/70 bg-surface flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {p.partnerName}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Mã: {p.partnerCode} • {p.caseCount} phiếu DV
                </span>
              </div>

              {onOpenCustomerDetail && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onOpenCustomerDetail(p.partnerCode, p.partnerName)
                  }
                  className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-primary"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs tabular-nums">
              <span className="text-muted-foreground">Dư nợ:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {money(p.balanceAmount)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                  {p.sharePercentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
