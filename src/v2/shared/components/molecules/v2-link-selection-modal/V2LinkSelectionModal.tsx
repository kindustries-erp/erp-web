import React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2LinkSelectionModalProps } from "./V2LinkSelectionModal.type";

/**
 * Khung modal chọn chứng từ để ghép nối. Dùng Radix Dialog của V2 nên lồng đúng
 * trong drawer V2 (không bị chặn tương tác như khi mở modal V1 từ drawer V2).
 */
export function V2LinkSelectionModal({
  open,
  onClose,
  title,
  description,
  children,
  footerActions,
}: V2LinkSelectionModalProps) {
  const { t } = useV2Translation();
  return (
    <V2Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={title}
      description={description}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <V2Button type="button" variant="secondary" onClick={onClose}>
            {t("v2.common.cancel")}
          </V2Button>
          {footerActions}
        </div>
      }
    >
      <div className="flex flex-col gap-3">{children}</div>
    </V2Modal>
  );
}
