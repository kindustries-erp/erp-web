import type { PostingAccountOption } from "@/v2/shared/components/organisms/v2-posting-lines-editor";
import type { PostingLineValue } from "@/v2/shared/components/organisms/v2-posting-lines-editor";
import type { JournalEntrySummary } from "../../../domain/rules/summarizeJournalEntry";
import type { CashDetailTranslate } from "../../molecules/cash-voucher-summary/CashVoucherSummary.type";

/** Trạng thái hạch toán đang soạn, do hook nháp giữ */
export interface CashPostingDraft {
  accountingEnabled: boolean;
  postingDate: string;
  description: string;
  lines: PostingLineValue[];
  isPosted: boolean;
  journalNo: string | null;
  summary: JournalEntrySummary | null;
}

export interface CashPostingSectionProps {
  posting: CashPostingDraft;
  editMode: boolean;
  accounts: PostingAccountOption[];
  onToggleAccounting: (enabled: boolean) => void;
  onPostingDateChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLinesChange: (lines: PostingLineValue[]) => void;
  t: CashDetailTranslate;
}
