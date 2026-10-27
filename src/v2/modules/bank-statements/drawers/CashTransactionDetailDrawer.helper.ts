import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";
import { CashTransactionSaveError } from "../api/mutations/cashTransactionSaveError";
import type { CashGeneralDraft } from "../components/organisms/cash-general-info/CashGeneralInfo.type";
import { buildAuditItems } from "../domain/rules/buildAuditItems";
import { resolvePartnerValue } from "../domain/rules/buildTransactionPatch";
import { isSameBranchIds, resolveBranchIds } from "@/v2/shared/utils/branchIds";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";

export const STEP_KEY = {
  UPDATE_INFO: "updateInfo",
  POST: "post",
  UNPOST: "unpost",
} as const;

export const toDraft = (tx: CashTransactionDto): CashGeneralDraft => ({
  branchIds: resolveBranchIds(tx),
  partnerValue: resolvePartnerValue(tx),
  partnerLabel: tx.partner?.name ?? null,
  description: tx.note ?? "",
  classification: tx.cashflowClassification ?? null,
  purpose: tx.cashflowPurpose ?? null,
});

export const isDraftDirty = (
  draft: CashGeneralDraft,
  initial: CashGeneralDraft,
): boolean =>
  !isSameBranchIds(draft.branchIds, initial.branchIds) ||
  draft.partnerValue !== initial.partnerValue ||
  draft.description !== initial.description ||
  draft.classification !== initial.classification ||
  draft.purpose !== initial.purpose;

export /** Thông điệp lỗi theo bước: bước nào lỗi thì báo đúng bước đó, kèm thông điệp gốc của API nếu có */
function stepMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof CashTransactionSaveError) {
    const base = t(
      `v2.bankStatements.cashDetail.error.${STEP_KEY[error.step]}`,
    );
    return error.serverMessage ? `${base}: ${error.serverMessage}` : base;
  }
  return t("v2.bankStatements.cashDetail.error.updateInfo");
}

/** Lịch sử thao tác hiển thị ở tab Lịch sử, nhãn lấy từ i18n */
export function buildHistoryItems(
  tx: CashTransactionDto | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): DrawerAuditItem[] {
  if (!tx) return [];
  return buildAuditItems(tx).map((entry) => {
    const created = entry.kind === "CREATED";
    return {
      id: entry.id,
      action: t(
        `v2.bankStatements.cashDetail.history.${created ? "created" : "posted"}`,
      ),
      timestamp: entry.timestamp,
      details: t(
        `v2.bankStatements.cashDetail.history.${created ? "createdMessage" : "postedMessage"}`,
        { reference: entry.reference },
      ),
      variant: created ? "default" : "success",
    };
  });
}
