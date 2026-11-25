import * as React from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import type { WorkshopWorker } from "../domain/caseWorkshop.type";

export interface WorkshopDefaultWorker {
  workerId: string | null;
  workerName: string;
}

/**
 * Người làm mặc định cho dòng tiến độ mới: nhân viên của người đăng nhập (khớp mã nhân viên) trong danh
 * sách người làm của chi nhánh. Đã tìm thấy thì giữ cố định dù người dùng gõ tìm người khác.
 */
export function useWorkshopDefaultWorker(
  workers: WorkshopWorker[],
): WorkshopDefaultWorker | null {
  const code = useAuthStore((s) => s.employee?.employee_code ?? null);
  const [found, setFound] = React.useState<WorkshopDefaultWorker | null>(null);
  React.useEffect(() => {
    if (found || !code) return;
    const hit = workers.find((w) => w.code === code);
    if (hit) setFound({ workerId: hit.id, workerName: hit.fullName });
  }, [workers, code, found]);
  return found;
}
