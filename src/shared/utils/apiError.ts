export function extractApiError(
  e: unknown,
  fallback = "Lưu thất bại.",
): string {
  const msg = (e as { response?: { data?: { message?: string } } })?.response
    ?.data?.message;
  return msg ?? fallback;
}
