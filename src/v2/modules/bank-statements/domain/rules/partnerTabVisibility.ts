/**
 * Hai tab đối tác và biến động chỉ có ý nghĩa khi có tên hoặc tài khoản đối ứng.
 * Phiếu tiền mặt thường chỉ có tên người nộp/nhận, nên chỉ cần một trong hai.
 */
export function canShowPartnerTabs(correspondent: {
  correspondentAccount?: string | null;
  correspondentName?: string | null;
}): boolean {
  return Boolean(
    correspondent.correspondentAccount?.trim() ||
    correspondent.correspondentName?.trim(),
  );
}
