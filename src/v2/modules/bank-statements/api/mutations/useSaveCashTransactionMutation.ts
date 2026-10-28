import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashTransactionApi } from "../cashTransactionApi";
import type {
  CashTransactionDto,
  CashTransactionPostRequestDto,
  CashTransactionUpdateDto,
} from "../dtos/cashTransaction.dto";
import { cashTransactionKeys } from "../queries/cashTransactionKeys";
import { CashTransactionSaveError } from "./cashTransactionSaveError";

export interface SaveCashTransactionInput {
  transactionId: string;
  /** Null khi không có thay đổi thông tin (không gọi PATCH) */
  infoPatch: CashTransactionUpdateDto | null;
  /** Hạch toán: bật thì POST, tắt khi đã ghi sổ thì UNPOST, tắt khi chưa ghi thì bỏ qua */
  accounting:
    | { mode: "POST"; payload: CashTransactionPostRequestDto }
    | { mode: "UNPOST" }
    | { mode: "SKIP" };
}

/** Thông điệp gốc từ API (nếu có); UI tự dịch theo bước lỗi */
const serverMessage = (error: unknown): string | undefined =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ||
  (error as { message?: string })?.message ||
  undefined;

/**
 * Lưu thông tin rồi hạch toán. Hai bước không nguyên tử: nếu bước sau lỗi thì bước trước đã lưu,
 * nên lỗi mang theo `step` và luôn làm mới giao dịch để UI hiển thị đúng trạng thái thực.
 */
export function useSaveCashTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      infoPatch,
      accounting,
    }: SaveCashTransactionInput): Promise<CashTransactionDto | undefined> => {
      if (infoPatch) {
        try {
          await cashTransactionApi.updateTransaction(transactionId, infoPatch);
        } catch (error) {
          throw new CashTransactionSaveError(
            "UPDATE_INFO",
            serverMessage(error),
            error,
          );
        }
      }

      if (accounting.mode === "SKIP") return undefined;
      try {
        if (accounting.mode === "UNPOST")
          return await cashTransactionApi.unpostTransaction(transactionId);
        return await cashTransactionApi.postTransaction(
          transactionId,
          accounting.payload,
        );
      } catch (error) {
        throw new CashTransactionSaveError(
          accounting.mode,
          serverMessage(error),
          error,
        );
      }
    },
    onSettled: async (_data, _error, { transactionId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cashTransactionKeys.detail(transactionId),
        }),
        queryClient.invalidateQueries({ queryKey: cashTransactionKeys.all }),
      ]);
    },
  });
}
