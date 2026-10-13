import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useT } from "@/core/i18n";
import {
  garageCashflowApi,
  type CashflowDuplicateParams,
  type CashflowDuplicateResult,
} from "../../../api/garageCashflowApi";

export function hasDuplicates(r: CashflowDuplicateResult): boolean {
  return r.nearbyDate.total + r.sameCase.total + r.samePlate.total > 0;
}

interface Pending {
  params: CashflowDuplicateParams;
  result: CashflowDuplicateResult;
  proceed: () => void;
}

/**
 * Kiểm tra phiếu trùng trước khi lưu. Có trùng → chờ user xác nhận;
 * không trùng hoặc check lỗi (fail-open) → lưu ngay.
 */
export function useGarageCashflowDuplicateGuard() {
  const t = useT();
  const [pending, setPending] = useState<Pending | null>(null);
  const checkMutation = useMutation({
    mutationFn: garageCashflowApi.checkDuplicates,
  });

  const guard = useCallback(
    (params: CashflowDuplicateParams, proceed: () => void) => {
      checkMutation.mutate(params, {
        onSuccess: (result) => {
          if (hasDuplicates(result)) setPending({ params, result, proceed });
          else proceed();
        },
        onError: () => {
          toast(
            t(
              "garage:cashflowDuplicate.checkFailed",
              "Không kiểm tra được phiếu trùng, tiếp tục lưu.",
            ),
          );
          proceed();
        },
      });
    },
    [checkMutation, t],
  );

  const confirm = useCallback(() => {
    const p = pending;
    setPending(null);
    p?.proceed();
  }, [pending]);

  const cancel = useCallback(() => setPending(null), []);

  return {
    guard,
    confirm,
    cancel,
    pending,
    isChecking: checkMutation.isPending,
  };
}
