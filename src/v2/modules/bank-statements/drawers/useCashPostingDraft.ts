import * as React from "react";
import {
  createPostingLine,
  type PostingLineValue,
} from "@/v2/shared/components/organisms/v2-posting-lines-editor";
import type {
  CashTransactionDto,
  CashTransactionPostRequestDto,
} from "../api/dtos/cashTransaction.dto";
import type { CashPostingDraft } from "../components/organisms/cash-posting-section/CashPostingSection.type";
import type { PostingValidationError } from "../domain/entities/cashTransaction";
import { buildDefaultPostingLines } from "../domain/rules/buildDefaultPostingLines";
import { summarizeJournalEntry } from "../domain/rules/summarizeJournalEntry";
import {
  normalizePostingLines,
  validatePosting,
} from "../domain/rules/validatePosting";

export type PostingRequest =
  | { mode: "POST"; payload: CashTransactionPostRequestDto }
  | { mode: "UNPOST" }
  | { mode: "SKIP" };

interface PostingForm {
  accountingEnabled: boolean;
  postingDate: string;
  description: string;
  lines: PostingLineValue[];
}

const EMPTY: PostingForm = {
  accountingEnabled: false,
  postingDate: "",
  description: "",
  lines: [],
};

const toLines = (
  lines: {
    accountId?: string | null;
    debit?: number | string;
    credit?: number | string;
    description?: string | null;
  }[],
): PostingLineValue[] =>
  lines.map((l) =>
    createPostingLine({
      accountId: l.accountId ?? "",
      debit: Number(l.debit || 0),
      credit: Number(l.credit || 0),
      description: l.description ?? "",
    }),
  );

/** Nháp hạch toán từ giao dịch: đã ghi sổ thì dùng bút toán có sẵn, chưa thì dựng bút toán mặc định */
export const toPostingForm = (tx: CashTransactionDto): PostingForm => {
  const base = tx.note || tx.description || tx.referenceNumber || "";
  const defaultDate = tx.transDate.slice(0, 10);
  if (tx.postingStatus === "POSTED") {
    return {
      accountingEnabled: true,
      postingDate: tx.postingDate?.slice(0, 10) ?? defaultDate,
      description: tx.postingDescription ?? base,
      lines: toLines(tx.lines ?? []),
    };
  }
  return {
    accountingEnabled: false,
    postingDate: defaultDate,
    description: base,
    lines: toLines(
      buildDefaultPostingLines(tx, base, () => createPostingLine().id),
    ),
  };
};

/**
 * Quyết định việc hạch toán khi lưu. Bật hạch toán thì kiểm tra rồi POST;
 * tắt hạch toán mà đang ghi sổ thì UNPOST; còn lại bỏ qua.
 */
export function buildPostingRequest(
  form: PostingForm,
  isPosted: boolean,
): { request?: PostingRequest; error?: PostingValidationError } {
  if (!form.accountingEnabled) {
    return { request: { mode: isPosted ? "UNPOST" : "SKIP" } };
  }
  const check = validatePosting(form.postingDate, form.lines, form.description);
  if (!check.ok) return { error: check.error };
  return {
    request: {
      mode: "POST",
      payload: {
        postingDate: form.postingDate,
        description: form.description,
        lines: normalizePostingLines(form.lines, form.description),
      },
    },
  };
}

export function useCashPostingDraft() {
  const [form, setForm] = React.useState<PostingForm>(EMPTY);
  const [initial, setInitial] = React.useState<PostingForm>(EMPTY);

  const hydrate = React.useCallback((tx: CashTransactionDto) => {
    const next = toPostingForm(tx);
    setForm(next);
    setInitial(next);
  }, []);

  const update = <K extends keyof PostingForm>(key: K, value: PostingForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setAccountingEnabled = (enabled: boolean) =>
    update("accountingEnabled", enabled);

  return {
    form,
    dirty: JSON.stringify(form) !== JSON.stringify(initial),
    hydrate,
    setPostingDate: (value: string) => update("postingDate", value),
    setDescription: (value: string) => update("description", value),
    setLines: (lines: PostingLineValue[]) => update("lines", lines),
    setAccountingEnabled,
    /** Đặt lại theo giao dịch đã lưu (dùng khi hủy sửa) */
    reset: hydrate,
    buildRequest: (isPosted: boolean) => buildPostingRequest(form, isPosted),
  };
}

/** Trạng thái hiển thị của tab hạch toán từ giao dịch đã tải */
export const postingViewOf = (
  tx: CashTransactionDto | undefined,
  form: PostingForm,
): CashPostingDraft => {
  const isPosted = tx?.postingStatus === "POSTED";
  return {
    accountingEnabled: form.accountingEnabled,
    postingDate: form.postingDate,
    description: form.description,
    lines: form.lines,
    isPosted,
    journalNo: tx?.journalEntryId ?? null,
    summary: isPosted ? summarizeJournalEntry(tx?.lines ?? []) : null,
  };
};
