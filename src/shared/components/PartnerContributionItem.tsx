import React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export interface PartnerContributionItemProps {
  partnerName: string;
  taxCode: string;
  invoiceCount?: number;
  amount: number;
  sharePercentage?: number;
  direction?: "IN" | "OUT";
  avgLagDays?: number;
  isOverdueLag?: boolean;
  overdueCarriedAmount?: number;
  overdueBadgeText?: string;
  onCycleBadgeText?: string;
  shareLabel?: string;
  onClick?: () => void;
  className?: string;
}

export function PartnerContributionItem({
  partnerName,
  taxCode,
  invoiceCount,
  amount,
  sharePercentage = 0,
  direction = "OUT",
  avgLagDays,
  isOverdueLag = false,
  overdueCarriedAmount = 0,
  overdueBadgeText = "Trôi sang",
  onCycleBadgeText = "Đúng chu kỳ",
  shareLabel = "Tỷ trọng",
  onClick,
  className,
}: PartnerContributionItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-2.5 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all space-y-1.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
            <span className="truncate">{partnerName}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-primary" />
          </div>
          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
            <span>{taxCode}</span>
            {invoiceCount !== undefined && (
              <>
                <span>•</span>
                <span>{invoiceCount} HĐ</span>
              </>
            )}
            {avgLagDays !== undefined && (
              <>
                <span>•</span>
                <span>Độ trễ: {avgLagDays}d</span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={cn(
              "font-mono text-xs font-semibold",
              direction === "OUT"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400",
            )}
          >
            {money(amount)}
          </div>
          {isOverdueLag ? (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 font-medium bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
            >
              {overdueBadgeText}: {money(overdueCarriedAmount)}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              {onCycleBadgeText}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar representing share percentage */}
      {sharePercentage > 0 && (
        <div className="space-y-0.5 pt-0.5 border-t border-border/40">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{shareLabel}</span>
            <span className="font-mono font-medium text-foreground">
              {sharePercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                direction === "OUT" ? "bg-emerald-500" : "bg-amber-500",
              )}
              style={{
                width: `${Math.min(100, sharePercentage)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
