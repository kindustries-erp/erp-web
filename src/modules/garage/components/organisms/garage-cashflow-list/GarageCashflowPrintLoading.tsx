import { useT } from "@/core/i18n";
import {
  V2Loading,
  V2LoadingSize,
  V2LoadingTextPosition,
  V2LoadingVariant,
} from "@/v2/shared/components/atoms/v2-loading";

export interface GarageCashflowPrintLoadingProps {
  open: boolean;
}

/**
 * Lớp phủ chặn thao tác trong lúc chuẩn bị bản in phiếu thu chi (dựng QR, dữ liệu phiếu).
 * Phủ được cả 3 điểm bấm In: menu hàng, footer drawer, nút In phiếu QR.
 */
export function GarageCashflowPrintLoading({
  open,
}: GarageCashflowPrintLoadingProps) {
  const t = useT();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex cursor-wait items-center justify-center bg-slate-900/30">
      <V2Loading
        variant={V2LoadingVariant.TAIL_SPIN}
        size={V2LoadingSize.MD}
        textPosition={V2LoadingTextPosition.BOTTOM}
        text={t("garage.cashflow.print.preparing", "Đang chuẩn bị bản in…")}
        className="rounded-xl bg-white px-6 py-4 shadow-lg"
      />
    </div>
  );
}
