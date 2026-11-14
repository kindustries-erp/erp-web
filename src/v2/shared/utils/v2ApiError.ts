interface ApiErrorBody {
  code?: string;
  message?: string | string[];
  dependencies?: string[];
  currentStatus?: string;
}

const errorBody = (error: unknown): ApiErrorBody | undefined =>
  (error as { response?: { status?: number; data?: ApiErrorBody } })?.response
    ?.data;

/**
 * Lấy thông báo lỗi từ body API (NestJS trả `message` là string hoặc string[]).
 * Không có thông báo từ server thì dùng `fallback` đã được dịch bởi caller.
 */
export function extractV2ApiError(error: unknown, fallback: string): string {
  const message = errorBody(error)?.message;

  if (Array.isArray(message)) return message.join("; ");
  return message || fallback;
}

/** 403: người dùng không có quyền với tài nguyên này; thử lại không giúp được gì. */
export const isForbiddenError = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 403;

export const isDocumentInUseError = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 409 &&
  errorBody(error)?.code === "DOCUMENT_IN_USE";

/** 409 do chứng từ đã đổi trạng thái (ví dụ đã duyệt rồi) so với lúc người dùng thao tác. */
export const isStatusConflictError = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 409 &&
  errorBody(error)?.code === "INVALID_STATUS_TRANSITION";

export const readCurrentStatus = (error: unknown): string | null => {
  const status = errorBody(error)?.currentStatus;
  return typeof status === "string" ? status : null;
};

export const readDocumentDependencies = (
  error: unknown,
): { message: string | undefined; dependencies: string[] } => {
  const body = errorBody(error);
  return {
    message: typeof body?.message === "string" ? body.message : undefined,
    dependencies: body?.dependencies ?? [],
  };
};
