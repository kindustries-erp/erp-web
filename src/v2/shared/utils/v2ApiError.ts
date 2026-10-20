interface ApiErrorBody {
  code?: string;
  message?: string | string[];
  dependencies?: string[];
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

export const isDocumentInUseError = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 409 &&
  errorBody(error)?.code === "DOCUMENT_IN_USE";

export const readDocumentDependencies = (
  error: unknown,
): { message: string | undefined; dependencies: string[] } => {
  const body = errorBody(error);
  return {
    message: typeof body?.message === "string" ? body.message : undefined,
    dependencies: body?.dependencies ?? [],
  };
};
