import type { CashTransactionDto } from "../../api/dtos/cashTransaction.dto";

export type AuditKind = "CREATED" | "POSTED";

/** Mốc thao tác của giao dịch; nhãn và thông điệp hiển thị do UI tự dịch theo `kind` */
export interface AuditEntry {
  id: "created" | "posted";
  kind: AuditKind;
  timestamp: string;
  reference: string;
}

/** Nhật ký thao tác suy ra từ mốc tạo và mốc ghi sổ của giao dịch */
export function buildAuditItems(
  tx: Pick<
    CashTransactionDto,
    "id" | "createdAt" | "referenceNumber" | "postingDate" | "journalEntryId"
  >,
): AuditEntry[] {
  const items: AuditEntry[] = [];
  if (tx.createdAt)
    items.push({
      id: "created",
      kind: "CREATED",
      timestamp: tx.createdAt,
      reference: tx.referenceNumber || tx.id,
    });
  if (tx.postingDate)
    items.push({
      id: "posted",
      kind: "POSTED",
      timestamp: tx.postingDate,
      reference: tx.journalEntryId || "",
    });
  return items;
}
