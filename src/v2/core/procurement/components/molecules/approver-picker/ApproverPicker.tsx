import * as React from "react";
import { V2Combobox } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementApprover } from "../../../procurement.types";

export interface ApproverPickerProps {
  value: string | null;
  options: ProcurementApprover[];
  loading?: boolean;
  disabled?: boolean;
  onChange: (approverId: string | null) => void;
}

/**
 * Chọn người duyệt từ danh sách người có quyền duyệt. Chỉ hiển thị dữ liệu
 * nhận qua props (không gọi API), nên dùng được trong mọi modal procurement.
 */
export function ApproverPicker({
  value,
  options,
  loading = false,
  disabled = false,
  onChange,
}: ApproverPickerProps) {
  const { t } = useV2Translation();
  const comboOptions = React.useMemo(
    () => options.map((a) => ({ value: a.id, label: a.email })),
    [options],
  );
  return (
    <V2Combobox
      aria-label={t("v2.procurementApproval.approver", "Người duyệt")}
      placeholder={t(
        "v2.procurementApproval.selectApprover",
        "Chọn người duyệt",
      )}
      options={comboOptions}
      loading={loading}
      disabled={disabled}
      value={value}
      onValueChange={(v) => onChange(v)}
    />
  );
}
