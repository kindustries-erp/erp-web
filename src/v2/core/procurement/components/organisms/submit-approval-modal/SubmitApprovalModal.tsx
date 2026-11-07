import * as React from "react";
import { V2Button, V2Modal, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ApproverPicker } from "../../molecules/approver-picker";
import type { ProcurementApprover } from "../../../procurement.types";

export interface SubmitApprovalModalProps {
  open: boolean;
  /** Tên chứng từ đang gửi duyệt, hiển thị trong tiêu đề */
  rowLabel: string;
  approvers: ProcurementApprover[];
  loading?: boolean;
  submitting?: boolean;
  onConfirm: (approverId: string) => void;
  onCancel: () => void;
}

/** Modal gửi duyệt: bắt buộc chọn đúng một người duyệt trước khi xác nhận. */
export function SubmitApprovalModal({
  open,
  rowLabel,
  approvers,
  loading = false,
  submitting = false,
  onConfirm,
  onCancel,
}: SubmitApprovalModalProps) {
  const { t } = useV2Translation();
  const [approverId, setApproverId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) setApproverId(null);
  }, [open]);

  return (
    <V2Modal
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      size="sm"
      title={t("v2.procurementApproval.submitTitle", "Gửi duyệt")}
      description={rowLabel}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <V2Button variant="outline" onClick={onCancel} disabled={submitting}>
            {t("v2.common.cancel", "Hủy")}
          </V2Button>
          <V2Button
            disabled={!approverId || submitting}
            isLoading={submitting}
            onClick={() => approverId && onConfirm(approverId)}
          >
            {t("v2.procurement.actions.submit", "Gửi duyệt")}
          </V2Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <V2Text variant="body" weight="medium">
          {t("v2.procurementApproval.approver", "Người duyệt")}
        </V2Text>
        <ApproverPicker
          value={approverId}
          options={approvers}
          loading={loading}
          disabled={submitting}
          onChange={setApproverId}
        />
      </div>
    </V2Modal>
  );
}
