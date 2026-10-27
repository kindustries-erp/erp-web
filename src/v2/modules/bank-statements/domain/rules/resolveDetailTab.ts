export type CashDetailTab = "details" | "accounting" | "partner" | "history";

/**
 * Đổi khóa tab từ nơi mở drawer sang tab V2.
 * Khóa V1 (`txn_details`, `txn_partner`) và khóa cũ `partner` đều được nhận; không khớp thì về tab Chi tiết.
 */
export function resolveDetailTab(
  key: string | null | undefined,
): CashDetailTab {
  switch (key) {
    case "accounting":
      return "accounting";
    case "partner":
    case "txn_partner":
      return "partner";
    case "history":
      return "history";
    default:
      return "details";
  }
}
