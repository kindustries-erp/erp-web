import React, { useEffect, useRef } from "react";
import { CreditCard, X, Check } from "lucide-react";
import { V2Text, V2Button, V2Tooltip, V2Badge } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import type { LoanChartItem } from "../../organisms/loan-cashflow-chart/LoanCashflowChart.type";

export interface LoanCashflowContextMenuProps {
  open: boolean;
  period: LoanChartItem | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onRecordPayment: (
    loanId: string,
    loanName: string,
    periodNumber?: number,
    dueDate?: string,
    principalDue?: number,
    interestDue?: number,
  ) => void;
}

export const LoanCashflowContextMenu: React.FC<
  LoanCashflowContextMenuProps
> = ({ open, period, position, onClose, onRecordPayment }) => {
  const { t } = useV2Translation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open || !period || !position) return null;

  const title =
    period.monthKey ||
    period.month ||
    (period.periodNumber ? `Kỳ ${period.periodNumber}` : "");
  const breakdown = period.breakdown || [];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 rounded-xl border border-border bg-card p-3 shadow-xl animate-in fade-in zoom-in-95"
      style={{
        left: Math.min(position.x, window.innerWidth - 300),
        top: Math.min(position.y + 10, window.innerHeight - 320),
      }}
    >
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <div className="flex flex-col gap-0.5 min-w-0 pr-2">
          <V2Text
            as="div"
            variant="caption"
            className="font-semibold text-foreground truncate"
          >
            {title}
          </V2Text>
          <V2Text
            as="div"
            variant="caption"
            className="text-[11px] text-muted-foreground"
          >
            {t(
              "v2.loans.cashflow.quickPayHint",
              "Chọn khoản vay để ghi nhận thanh toán",
            )}
          </V2Text>
        </div>
        <V2Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </V2Button>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto">
        {breakdown.length > 0 ? (
          breakdown.map((b) => {
            const schedP = b.scheduledPrincipal ?? b.principalDue;
            const schedI = b.scheduledInterest ?? b.interestDue;
            return (
              <div
                key={b.loanId}
                className="rounded-lg border border-border bg-muted/30 p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <V2Text as="span" className="font-medium text-foreground">
                    {b.loanName}
                  </V2Text>
                  {b.isPaid && (
                    <V2Badge
                      variant="success"
                      size="xs"
                      className="gap-1 font-medium"
                    >
                      <Check className="h-3 w-3" />
                      {t("v2.loans.table.statusPaid", "Đã trả")}
                    </V2Badge>
                  )}
                </div>
                <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
                  <V2Text
                    as="span"
                    variant="caption"
                    className="font-mono text-[11px]"
                  >
                    Gốc: {formatVndCurrency(schedP)}
                  </V2Text>
                  <V2Text
                    as="span"
                    variant="caption"
                    className="font-mono text-[11px]"
                  >
                    Lãi: {formatVndCurrency(schedI)}
                  </V2Text>
                </div>
                <div className="mt-2 flex justify-end">
                  <V2Tooltip
                    content={
                      b.isPaid
                        ? t(
                            "v2.loans.table.alreadyPaidTooltip",
                            "Kỳ này đã hoàn tất thanh toán",
                          )
                        : undefined
                    }
                    disabled={!b.isPaid}
                    side="top"
                  >
                    <span className="inline-block">
                      <V2Button
                        size="sm"
                        disabled={b.isPaid}
                        variant={b.isPaid ? "outline" : "primary"}
                        className="h-6 px-2 text-[11px]"
                        onClick={() => {
                          onRecordPayment(
                            b.loanId,
                            b.loanName,
                            period.periodNumber,
                            b.dueDate,
                            schedP,
                            schedI,
                          );
                          onClose();
                        }}
                      >
                        <CreditCard className="mr-1 h-3 w-3" />
                        {t("v2.loans.table.actionPay", "Thanh toán")}
                      </V2Button>
                    </span>
                  </V2Tooltip>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-2 text-xs">
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
              <V2Text
                as="span"
                variant="caption"
                className="font-mono text-[11px]"
              >
                Gốc: {formatVndCurrency(period.principalDue)}
              </V2Text>
              <V2Text
                as="span"
                variant="caption"
                className="font-mono text-[11px]"
              >
                Lãi: {formatVndCurrency(period.interestDue)}
              </V2Text>
            </div>
            <div className="mt-2 flex justify-end">
              <V2Tooltip
                content={
                  period.isPaid
                    ? t(
                        "v2.loans.table.alreadyPaidTooltip",
                        "Kỳ này đã hoàn tất thanh toán",
                      )
                    : undefined
                }
                disabled={!period.isPaid}
                side="top"
              >
                <span className="inline-block">
                  <V2Button
                    size="sm"
                    disabled={period.isPaid}
                    variant="primary"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => {
                      onRecordPayment(
                        "",
                        "",
                        period.periodNumber,
                        period.dueDate,
                        period.principalDue,
                        period.interestDue,
                      );
                      onClose();
                    }}
                  >
                    <CreditCard className="mr-1 h-3 w-3" />
                    {t("v2.loans.table.actionPay", "Thanh toán")}
                  </V2Button>
                </span>
              </V2Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
LoanCashflowContextMenu.displayName = "LoanCashflowContextMenu";
