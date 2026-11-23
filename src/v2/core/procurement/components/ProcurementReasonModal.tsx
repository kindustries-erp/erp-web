import * as React from "react";
import { V2Button, V2Modal, V2Textarea } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cleanProcurementReason } from "../procurement.rules";

export interface ProcurementReasonModalProps {
  open: boolean;
  title: string;
  isLoading?: boolean;
  onCancel: () => void;
  /** Chỉ gọi khi lý do đã được nhập (không rỗng sau khi cắt khoảng trắng). */
  onConfirm: (reason: string) => void;
}

/** Modal xác nhận hành động bắt buộc lý do (từ chối, hủy, đóng chứng từ). */
export function ProcurementReasonModal({
  open,
  title,
  isLoading = false,
  onCancel,
  onConfirm,
}: ProcurementReasonModalProps) {
  const { t } = useV2Translation();
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const submit = () => {
    const cleaned = cleanProcurementReason(reason);
    if (!cleaned) {
      setError(
        t("v2.procurement.confirm.reasonRequired", "Vui lòng nhập lý do"),
      );
      return;
    }
    onConfirm(cleaned);
  };

  return (
    <V2Modal
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <V2Button size="sm" variant="outline" onClick={onCancel}>
            {t("v2.common.cancel", "Hủy")}
          </V2Button>
          <V2Button size="sm" onClick={submit} disabled={isLoading}>
            {t("v2.common.confirm", "Xác nhận")}
          </V2Button>
        </div>
      }
    >
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("v2.procurement.confirm.reasonLabel", "Lý do")}</span>
        <V2Textarea
          value={reason}
          rows={3}
          placeholder={t(
            "v2.procurement.confirm.reasonPlaceholder",
            "Nhập lý do",
          )}
          onChange={(e) => {
            setReason(e.target.value);
            setError(null);
          }}
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </V2Modal>
  );
}
