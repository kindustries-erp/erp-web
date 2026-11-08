import * as React from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import {
  applyApprovalGate,
  requiresApproverPick,
  type ApprovalGate,
  type ApprovalSubject,
} from "../approval/approval.gate";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { useApprovalSettingQuery } from "./useApprovalSettingQuery";
import { useApproversQuery } from "./useApproversQuery";

/** Lấy người duyệt và người tạo từ dòng danh sách (PR/PO đều có; dòng khác thì trả null). */
const approvalSubjectOf = (row: object): ApprovalSubject => {
  const r = row as Partial<ApprovalSubject> & {
    approval?: { approverId?: string | null };
  };
  return {
    approverId: r.approval?.approverId ?? null,
    createdBy: r.createdBy ?? null,
  };
};

/**
 * Ghép khóa duyệt vào màn danh sách: lọc hành động theo khóa và người duyệt,
 * và mở modal chọn người khi gửi duyệt. Core dùng chung cho mọi họ có `approvalConfigPath`.
 */
export function useProcurementApprovalGate<T extends { id: string }>(
  config: ProcurementListConfig<T>,
) {
  const configPath = config.approvalConfigPath;
  const currentUserId = useAuthStore((s) => s.profile?.id ?? null);
  const setting = useApprovalSettingQuery(configPath);
  const configured = Boolean(configPath);
  const enabled = setting.data?.approvalEnabled ?? true;
  const gate = React.useMemo<ApprovalGate>(
    () => ({ configured, enabled, currentUserId }),
    [configured, enabled, currentUserId],
  );
  const [submitTarget, setSubmitTarget] = React.useState<T | null>(null);
  const approvers = useApproversQuery(configPath, Boolean(submitTarget));

  const approvalConfig = React.useMemo<ProcurementListConfig<T>>(
    () => ({
      ...config,
      availableActions: (row) =>
        applyApprovalGate(
          config.availableActions(row),
          gate,
          approvalSubjectOf(row),
        ),
    }),
    [config, gate],
  );

  /** Trả true nếu hành động đã được chuyển sang modal chọn người duyệt. */
  const requestSubmit = React.useCallback(
    (row: T, action: ProcurementActionKey): boolean => {
      if (!requiresApproverPick(gate, action)) return false;
      setSubmitTarget(row);
      return true;
    },
    [gate],
  );

  return {
    gate,
    approvalConfig,
    approvers: approvers.data ?? [],
    approversLoading: approvers.isFetching,
    submitTarget,
    requestSubmit,
    closeSubmit: () => setSubmitTarget(null),
  };
}
