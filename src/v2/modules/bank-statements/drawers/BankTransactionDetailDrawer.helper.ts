import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";
import { CashTransactionSaveError } from "../api/mutations/cashTransactionSaveError";
import type { BankGeneralDraft } from "../components/organisms/bank-general-info";
import { buildAuditItems } from "../domain/rules/buildAuditItems";
import { resolvePartnerValue } from "../domain/rules/buildTransactionPatch";
import { isSameBranchIds, resolveBranchIds } from "@/v2/shared/utils/branchIds";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import type {
  BankDetailsSubTabKey,
  BankTopTabKey,
} from "./BankTransactionDetailDrawer.type";

export interface ResolvedInitialTabs {
  topTab: BankTopTabKey;
  detailsSubTab: BankDetailsSubTabKey;
}

export function resolveInitialDrawerTabs(
  defaultTabKey?: string | null,
): ResolvedInitialTabs {
  if (defaultTabKey === "accounting") {
    return { topTab: "details", detailsSubTab: "accounting" };
  }
  if (defaultTabKey === "traceability") {
    return { topTab: "details", detailsSubTab: "traceability" };
  }
  if (defaultTabKey === "partner" || defaultTabKey === "txn_partner") {
    return { topTab: "partner", detailsSubTab: "details" };
  }
  if (defaultTabKey === "history") {
    return { topTab: "history", detailsSubTab: "details" };
  }
  return { topTab: "details", detailsSubTab: "details" };
}

export const STEP_KEY = {
  UPDATE_INFO: "updateInfo",
  POST: "post",
  UNPOST: "unpost",
} as const;

export const toDraft = (tx: CashTransactionDto): BankGeneralDraft => ({
  branchIds: resolveBranchIds(tx),
  partnerValue: resolvePartnerValue(tx),
  partnerLabel: tx.partner?.name ?? null,
  description: tx.note ?? "",
  classification: tx.cashflowClassification ?? null,
  purpose: tx.cashflowPurpose ?? null,
});

export const isDraftDirty = (
  draft: BankGeneralDraft,
  initial: BankGeneralDraft,
): boolean =>
  !isSameBranchIds(draft.branchIds, initial.branchIds) ||
  draft.partnerValue !== initial.partnerValue ||
  draft.description !== initial.description ||
  draft.classification !== initial.classification ||
  draft.purpose !== initial.purpose;

export function stepMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof CashTransactionSaveError) {
    const base = t(
      `v2.bankStatements.bankDetail.error.${STEP_KEY[error.step]}`,
    );
    return error.serverMessage ? `${base}: ${error.serverMessage}` : base;
  }
  return t("v2.bankStatements.bankDetail.error.updateInfo");
}

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
        `v2.bankStatements.bankDetail.history.${created ? "created" : "posted"}`,
      ),
      timestamp: entry.timestamp,
      details: t(
        `v2.bankStatements.bankDetail.history.${created ? "createdMessage" : "postedMessage"}`,
        { reference: entry.reference },
      ),
      variant: created ? "default" : "success",
    };
  });
}

export const POSTING_ERROR_KEY = {
  MISSING_POSTING_DATE: "missingPostingDate",
  NO_LINES: "noLines",
  MISSING_ACCOUNT: "missingAccount",
  UNBALANCED: "unbalanced",
} as const;

export const toAccountOptions = (
  accounts: { id: string; accountCode: string; accountName: string }[],
) =>
  accounts.map((a) => ({
    value: a.id,
    label: `${a.accountCode} - ${a.accountName}`,
  }));

export const postingErrorMessage = (
  code: keyof typeof POSTING_ERROR_KEY,
  t: (key: string) => string,
): string =>
  t(`v2.bankStatements.cashDetail.posting.errors.${POSTING_ERROR_KEY[code]}`);

export const netOffCapacityOf = (tx: CashTransactionDto): number => {
  const amount = Math.max(
    Number(tx.creditAmount || 0),
    Number(tx.debitAmount || 0),
  );
  const used = (tx.invoiceNetOffs ?? []).reduce(
    (sum, n) => sum + Number(n.netOffAmount || 0),
    0,
  );
  return Math.max(0, amount - used);
};

export const existingInvoiceIdsOf = (tx: CashTransactionDto): string[] =>
  (tx.invoiceNetOffs ?? [])
    .map((n) => n.invoiceId || n.invoice?.id)
    .filter((id): id is string => Boolean(id));
