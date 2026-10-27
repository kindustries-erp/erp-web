import { useQuery } from "@tanstack/react-query";
import { cashVouchersV2Api } from "../cashVouchersApi";
import { cashVouchersKeys } from "./cashVouchersKeys";

/** Danh sách sổ quỹ tiền mặt; chỉ tải khi drawer đang mở */
export function useCashBooksQuery(enabled: boolean) {
  return useQuery({
    queryKey: cashVouchersKeys.cashBooks,
    queryFn: () => cashVouchersV2Api.listCashBooks(),
    enabled,
  });
}
