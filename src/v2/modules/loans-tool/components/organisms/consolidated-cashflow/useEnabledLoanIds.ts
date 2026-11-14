import { useEffect, useRef, useState } from "react";
import type { CashflowLoanItem } from "./CashflowLoanFilterPanel";

/**
 * Quản lý tập khoản vay đang bật trong bộ lọc projection.
 * Khoản mới (id chưa từng thấy) tự được bật; khoản người dùng đã tắt giữ nguyên.
 */
export function useEnabledLoanIds(loans: CashflowLoanItem[]) {
  const [enabledLoanIds, setEnabledLoanIds] = useState<Set<string>>(new Set());
  const knownLoanIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newIds = loans
      .map((l) => l.id)
      .filter((id) => !knownLoanIds.current.has(id));
    if (newIds.length === 0) return;

    newIds.forEach((id) => knownLoanIds.current.add(id));
    setEnabledLoanIds((prev) => new Set([...prev, ...newIds]));
  }, [loans]);

  return { enabledLoanIds, setEnabledLoanIds };
}
