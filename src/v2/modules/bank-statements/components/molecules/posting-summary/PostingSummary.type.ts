import type { JournalEntrySummary } from "../../../domain/rules/summarizeJournalEntry";
import type { CashDetailTranslate } from "../cash-voucher-summary/CashVoucherSummary.type";

export interface PostingSummaryProps {
  summary: JournalEntrySummary | null;
  isPosted: boolean;
  journalNo: string | null | undefined;
  /** Nhãn tài khoản "mã - tên", rơi về mã nếu chưa có danh mục */
  accountLabel: (accountId: string) => string;
  t: CashDetailTranslate;
}
