import axiosInstance from "./axiosInstance";

export type SystemOperationModule =
  | "INVENTORY"
  | "PRODUCTION"
  | "INVOICES"
  | "ACCOUNTING"
  | "SYSTEM_JOBS";

export type SystemOperationStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface ErpSystemOperationDto {
  id: string;
  operationCode: string;
  operationName: string;
  module: SystemOperationModule;
  operationType: string;
  scopeType: "GLOBAL" | "MODULE" | "DOCUMENT";
  targetId?: string | null;
  targetNo?: string | null;
  status: SystemOperationStatus;
  userId?: string | null;
  userName?: string | null;
  progressPercent: number;
  progressMessage?: string | null;
  isBlockingUi: boolean;
  blockedActions?: string[] | null;
  startedAt?: string | null;
  completedAt?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, any> | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckActionResponse {
  isBlocked: boolean;
  blockedReason?: string;
  operation?: ErpSystemOperationDto;
}

export interface ActiveOperationsResponse {
  isLocked: boolean;
  total: number;
  items: ErpSystemOperationDto[];
  primaryLock: ErpSystemOperationDto | null;
}

export async function getActiveSystemOperationsApi(
  module?: string,
): Promise<ErpSystemOperationDto[]> {
  const res = await axiosInstance.get<ActiveOperationsResponse>(
    "/api/v1/system-operations/active",
    {
      params: { module },
      _silentError: true,
    },
  );
  return (
    res.data?.items ||
    (res.data as any)?.data ||
    (Array.isArray(res.data) ? res.data : [])
  );
}

export async function checkSystemActionApi(
  actionName: string,
  module?: string,
  targetId?: string,
): Promise<CheckActionResponse> {
  const res = await axiosInstance.get<{
    message: string;
    data: CheckActionResponse;
  }>("/api/v1/system-operations/check-action", {
    params: { actionName, module, targetId },
    _silentError: true,
  });
  return res.data?.data || { isBlocked: false };
}

export async function releaseSystemOperationApi(
  id: string,
): Promise<ErpSystemOperationDto> {
  const res = await axiosInstance.post<{
    message: string;
    data: ErpSystemOperationDto;
  }>(`/api/v1/system-operations/admin/release/${id}`);
  return res.data?.data;
}
