export const BANK_STATEMENT_TABS = ["dashboard", "bank", "cash"] as const;

export type BankStatementTab = (typeof BANK_STATEMENT_TABS)[number];

/** Đọc `?tab=` từ một URL (có hoặc không có origin); tab không hợp lệ trả về null */
export function readBankStatementTab(
  url: string | null | undefined,
): BankStatementTab | null {
  const query = url?.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
  const tab = new URLSearchParams(query).get("tab");
  return BANK_STATEMENT_TABS.find((key) => key === tab) ?? null;
}
