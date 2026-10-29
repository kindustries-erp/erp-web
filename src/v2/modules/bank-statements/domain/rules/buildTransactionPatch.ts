import {
  toPartnerOptionValue,
  toPartnerSelectionPayload,
} from "@/v2/modules/business-partners/domain/rules/partnerSelection";
import type {
  CashTransactionDto,
  CashTransactionUpdateDto,
} from "../../api/dtos/cashTransaction.dto";
import type { CashClassificationDraft } from "../entities/cashTransaction";
import { isSameBranchIds, resolveBranchIds } from "@/v2/shared/utils/branchIds";

export interface TransactionDraft extends CashClassificationDraft {
  branchIds: string[];
  partnerValue: string | null;
  description: string;
}

/** Giá trị đối tượng hiện tại của giao dịch, dạng mã hóa cho ô chọn */
export const resolvePartnerValue = (
  tx: Pick<CashTransactionDto, "partner">,
): string | null =>
  tx.partner?.id
    ? toPartnerOptionValue({
        partnerId: tx.partner.id,
        name: tx.partner.name ?? "",
        taxCode: tx.partner.taxCode ?? null,
        source: "MASTER",
      })
    : null;

/**
 * Chỉ gửi trường đã đổi, tránh xóa nhầm chi nhánh khi chỉ sửa ghi chú.
 * Trả về null khi không có gì thay đổi (không cần gọi PATCH).
 */
export function buildTransactionPatch(
  tx: CashTransactionDto,
  draft: TransactionDraft,
  originalPartnerValue: string | null = resolvePartnerValue(tx),
): CashTransactionUpdateDto | null {
  const branchChanged = !isSameBranchIds(draft.branchIds, resolveBranchIds(tx));
  const partnerChanged = draft.partnerValue !== originalPartnerValue;
  const noteChanged = draft.description !== (tx.note || "");
  const classificationChanged =
    draft.classification !== (tx.cashflowClassification ?? null);
  const purposeChanged = draft.purpose !== (tx.cashflowPurpose ?? null);

  if (
    !branchChanged &&
    !partnerChanged &&
    !noteChanged &&
    !classificationChanged &&
    !purposeChanged
  )
    return null;

  const direction = Number(tx.creditAmount) > 0 ? "OUT" : "IN";
  return {
    ...(branchChanged ? { branchIds: draft.branchIds } : {}),
    ...(partnerChanged
      ? toPartnerSelectionPayload(draft.partnerValue, direction)
      : {}),
    note: draft.description,
    cashflowClassification: draft.classification,
    cashflowPurpose: draft.classification ? draft.purpose : null,
  };
}
