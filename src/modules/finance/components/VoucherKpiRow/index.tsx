import type { ReactNode } from "react";
import { KpiCard } from "@/shared/components/KpiCard";
import { useT } from "@/core/i18n";

interface VoucherKpiRowProps {
  openingLoading: boolean;
  summaryLoading: boolean;
  openingBal: number | null;
  closingBal: number | null;
  receiptTotal: number | null;
  paymentTotal: number | null;
  fmtAmount: (n: number) => string;
  openingIcon: ReactNode;
  receiptIcon: ReactNode;
  paymentIcon: ReactNode;
  closingIcon: ReactNode;
  openingLabel?: string;
  receiptLabel?: string;
  paymentLabel?: string;
  closingLabel?: string;
}

/**
 * VoucherKpiRow — Organism: 4 KPI cards hiển thị tồn đầu, thu, chi, tồn cuối.
 * Dùng chung cho TienMat và TienGui.
 */
export function VoucherKpiRow({
  openingLoading,
  summaryLoading,
  openingBal,
  closingBal,
  receiptTotal,
  paymentTotal,
  fmtAmount,
  openingIcon,
  receiptIcon,
  paymentIcon,
  closingIcon,
  openingLabel,
  receiptLabel,
  paymentLabel,
  closingLabel,
}: VoucherKpiRowProps) {
  const t = useT();
  
  const finalOpeningLabel = openingLabel ?? t("voucher.kpi.opening");
  const finalReceiptLabel = receiptLabel ?? t("voucher.kpi.receipt");
  const finalPaymentLabel = paymentLabel ?? t("voucher.kpi.payment");
  const finalClosingLabel = closingLabel ?? t("voucher.kpi.closing");

  const loading = "...";
  return (
    <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 mb-4">
      <KpiCard
        label={finalOpeningLabel}
        value={openingLoading ? loading : openingBal !== null ? fmtAmount(openingBal) : "—"}
        icon={openingIcon}
      />
      <KpiCard
        label={finalReceiptLabel}
        value={summaryLoading ? loading : receiptTotal !== null ? fmtAmount(receiptTotal) : "—"}
        icon={receiptIcon}
      />
      <KpiCard
        label={finalPaymentLabel}
        value={summaryLoading ? loading : paymentTotal !== null ? fmtAmount(paymentTotal) : "—"}
        icon={paymentIcon}
      />
      <KpiCard
        label={finalClosingLabel}
        value={
          openingLoading || summaryLoading
            ? loading
            : closingBal !== null
              ? fmtAmount(closingBal)
              : "—"
        }
        icon={closingIcon}
      />
    </div>
  );
}
