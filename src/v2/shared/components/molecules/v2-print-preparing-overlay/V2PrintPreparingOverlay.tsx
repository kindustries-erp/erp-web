import {
  V2Loading,
  V2LoadingSize,
  V2LoadingTextPosition,
  V2LoadingVariant,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2PrintPreparingOverlayProps } from "./V2PrintPreparingOverlay.type";

/**
 * Lớp phủ chặn thao tác khi đang dựng bản in (ví dụ dựng QR trước khi mở hộp thoại in).
 */
export function V2PrintPreparingOverlay({
  open,
  label,
}: V2PrintPreparingOverlayProps) {
  const { t } = useV2Translation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex cursor-wait items-center justify-center bg-black/30">
      <V2Loading
        variant={V2LoadingVariant.TAIL_SPIN}
        size={V2LoadingSize.MD}
        textPosition={V2LoadingTextPosition.BOTTOM}
        text={label ?? t("v2.print.preparing")}
        className="rounded-xl bg-card px-6 py-4 shadow-lg"
      />
    </div>
  );
}
