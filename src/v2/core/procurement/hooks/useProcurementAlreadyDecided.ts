import * as React from "react";

/** Chứng từ đã được xử lý trước đó (đã duyệt, từ chối...) nên không thể thao tác tiếp. */
export interface ProcurementAlreadyDecidedTarget {
  /** Nhãn chứng từ hiển thị, ví dụ "PR-2026-001" */
  rowLabel: string;
  /** Trạng thái hiện tại từ server, ví dụ "APPROVED" */
  status: string | null;
}

export interface ProcurementAlreadyDecidedState {
  alreadyDecided: ProcurementAlreadyDecidedTarget | null;
  showAlreadyDecided: (target: ProcurementAlreadyDecidedTarget) => void;
  closeAlreadyDecided: () => void;
}

/** Trạng thái modal "đã duyệt rồi" của màn danh sách procurement. */
export function useProcurementAlreadyDecided(): ProcurementAlreadyDecidedState {
  const [alreadyDecided, setAlreadyDecided] =
    React.useState<ProcurementAlreadyDecidedTarget | null>(null);

  const showAlreadyDecided = React.useCallback(
    (target: ProcurementAlreadyDecidedTarget) => setAlreadyDecided(target),
    [],
  );
  const closeAlreadyDecided = React.useCallback(
    () => setAlreadyDecided(null),
    [],
  );

  return { alreadyDecided, showAlreadyDecided, closeAlreadyDecided };
}
