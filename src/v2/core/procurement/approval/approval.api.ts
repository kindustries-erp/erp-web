import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  ProcurementApprovalSetting,
  ProcurementApprover,
} from "../procurement.types";

/** Đọc khóa duyệt hiện tại của một họ (API cấu hình duyệt của module). */
export async function fetchApprovalSetting(
  configPath: string,
): Promise<ProcurementApprovalSetting> {
  const { data } = await v2HttpClient.get<ProcurementApprovalSetting>(
    `${configPath}/setting`,
  );
  return data;
}

/** Người có đủ quyền duyệt, không gồm người đang đăng nhập. */
export async function fetchApprovers(
  configPath: string,
): Promise<ProcurementApprover[]> {
  const { data } = await v2HttpClient.get<ProcurementApprover[]>(
    `${configPath}/approvers`,
  );
  return data;
}
