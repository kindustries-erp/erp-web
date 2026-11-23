/** Một dòng nhật ký theo DTO `/api/v2/audit-logs` (lõi audit tự định nghĩa, không dùng chung với V1). */
export interface AuditLogRow {
  id: string;
  requestId: string | null;
  actorUserId: string | null;
  actorEmail: string | null;
  actorEmployeeId: string | null;
  actionType: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  route: string | null;
  httpMethod: string | null;
  status: string;
  message: string | null;
  uiScreen: string | null;
  uiAction: string | null;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  errorSnapshot: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditListResult {
  items: AuditLogRow[];
  total: number;
}
