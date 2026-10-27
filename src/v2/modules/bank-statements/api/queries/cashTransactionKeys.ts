/**
 * Khóa React Query dùng chung với V1 (`bank-transaction`, `bank-transactions`) để làm mới đồng bộ
 * khi một trong hai màn thay đổi giao dịch.
 */
export const cashTransactionKeys = {
  all: ["bank-transactions"] as const,
  detail: (id: string | null | undefined) => ["bank-transaction", id] as const,
  partnerCount: (correspondentAccount: string, correspondentName: string) =>
    [
      "partner-bank-transactions-count",
      correspondentAccount,
      correspondentName,
    ] as const,
  traceability: (id: string | null | undefined) =>
    ["bank-traceability-graph", id] as const,
};
