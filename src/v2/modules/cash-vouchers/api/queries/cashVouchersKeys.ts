/** Khóa React Query; `transactions` trùng khóa V1 để làm mới đồng bộ danh sách sao kê */
export const cashVouchersKeys = {
  cashBooks: ["cash-books"] as const,
  transactions: ["bank-transactions"] as const,
};
