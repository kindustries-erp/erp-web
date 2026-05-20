import { useEffect, useMemo, useState } from "react";
import {
  DrawerModal,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import type {
  ChartOfAccount,
  CompanyBankAccount,
} from "@/modules/accounting/api/catalogApi";
import type {
  PaymentVoucher,
  CashBankTagPreset,
} from "@/modules/finance/api/financeApi";
import type { SimpleJournalEntryFormLine } from "@/modules/accounting/types/journalEntry";
import {
  buildCreatePayloadFromSimple,
  emptySimpleLine,
  money,
} from "@/modules/accounting/utils/journalEntryUtils";
import { postPaymentVoucherToJournalApi } from "@/modules/finance/api/financeApi";
import { getJournalEntryApi } from "@/modules/accounting/api/journalEntriesApi";
import { CashBankTagPresetCards } from "@/modules/finance/components/CashBankTagPresetCards";
import {
  formatMoneyInput,
  moneyToVietnameseWords,
} from "@/modules/finance/utils/financeHelpers";

interface Props {
  open: boolean;
  onClose: () => void;
  voucher: PaymentVoucher | null;
  accounts: ChartOfAccount[];
  companyBankAccounts?: CompanyBankAccount[];
  tagPresets?: CashBankTagPreset[];
  defaultDebitAccountId?: string;
  defaultCreditAccountId?: string;
  defaultDescription?: string;
  defaultDate?: string;
  defaultAmount?: number;
  onSuccess: () => void;
}

export function PaymentVoucherAccountingModal({
  open,
  onClose,
  voucher,
  accounts,
  companyBankAccounts = [],
  tagPresets = [],
  defaultDebitAccountId = "",
  defaultCreditAccountId = "",
  defaultDescription = "",
  defaultDate = "",
  defaultAmount = 0,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [line, setLine] =
    useState<SimpleJournalEntryFormLine>(emptySimpleLine());
  const [isDirty, setIsDirty] = useState(false);

  // Resolve debit account from voucher's bank account
  const bankLinkedDebitAccountId = useMemo(() => {
    if (!voucher?.company_bank_account_id) return defaultDebitAccountId;
    const bank = companyBankAccounts.find(
      (b) => b.id === voucher.company_bank_account_id,
    );
    return bank?.accounting_account_id ?? defaultDebitAccountId;
  }, [voucher, companyBankAccounts, defaultDebitAccountId]);

  useEffect(() => {
    if (!open || !voucher) return;
    setSaving(false);
    setError("");
    setSelectedPresetId("");
    setIsDirty(false);

    // Nếu đã có journal_entry_id, load dữ liệu cũ để sửa
    if (voucher.journal_entry_id) {
      setDate(defaultDate || new Date().toISOString().slice(0, 10));
      setDescription(
        defaultDescription || voucher.description || voucher.voucher_no,
      );
      setLine({
        ...emptySimpleLine(),
        debit_account_id: bankLinkedDebitAccountId,
        credit_account_id: defaultCreditAccountId,
        amount: String(defaultAmount || Number(voucher.amount || 0) || 0),
        description:
          defaultDescription || voucher.description || voucher.voucher_no,
      });
      // Fetch journal entry cũ để pre-populate
      getJournalEntryApi(String(voucher.journal_entry_id))
        .then((je) => {
          if (je.date) setDate(je.date);
          if (je.description) setDescription(je.description);
          const debitLine = je.lines?.find((l) => Number(l.debit) > 0);
          const creditLine = je.lines?.find((l) => Number(l.credit) > 0);
          if (debitLine || creditLine) {
            const amount = debitLine
              ? String(Number(debitLine.debit) || 0)
              : String(Number(creditLine?.credit) || 0);
            const creditAccountId =
              typeof creditLine?.account_id === "string"
                ? creditLine.account_id
                : ((creditLine?.account_id as { id: string })?.id ?? "");
            setLine((prev) => ({
              ...prev,
              debit_account_id: bankLinkedDebitAccountId,
              credit_account_id: creditAccountId || prev.credit_account_id,
              amount,
              description:
                debitLine?.description ?? je.description ?? prev.description,
            }));
          }
        })
        .catch(() => {
          // Không load được cũ → giữ default
        });
      return;
    }

    setDate(defaultDate || new Date().toISOString().slice(0, 10));
    setDescription(
      defaultDescription || voucher.description || voucher.voucher_no,
    );
    setLine({
      ...emptySimpleLine(),
      debit_account_id: bankLinkedDebitAccountId,
      credit_account_id: defaultCreditAccountId,
      amount: String(defaultAmount || Number(voucher.amount || 0) || 0),
      description:
        defaultDescription || voucher.description || voucher.voucher_no,
    });
  }, [
    open,
    voucher,
    bankLinkedDebitAccountId,
    defaultCreditAccountId,
    defaultDescription,
    defaultDate,
    defaultAmount,
  ]);

  const accountOptions = useMemo(
    () =>
      accounts.map((a) => ({
        value: a.id,
        label: [a.account_code, a.account_name].filter(Boolean).join(" — "),
      })),
    [accounts],
  );

  function handlePresetSelect(preset: CashBankTagPreset) {
    setSelectedPresetId(preset.id);
    setLine((prev) => ({
      ...prev,
      // Debit account is locked to bank's accounting account — only update credit
      credit_account_id: preset.credit_account_id ?? "",
      description: preset.description || prev.description,
    }));
    if (preset.description) setDescription(preset.description);
    setIsDirty(true);
  }

  const valid =
    !!voucher &&
    !!date &&
    !!line.debit_account_id &&
    !!line.credit_account_id &&
    money(line.amount) > 0;

  async function handleSubmit() {
    if (!voucher) return;
    if (!valid) {
      setError(
        "Vui lòng nhập đủ ngày bút toán, TK Nợ, TK Có và số tiền hợp lệ",
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = buildCreatePayloadFromSimple({
        voucher_no: voucher.voucher_no,
        date,
        period_id: "",
        description: description.trim() || voucher.voucher_no,
        lines: [
          {
            ...line,
            description:
              line.description.trim() ||
              description.trim() ||
              voucher.voucher_no,
          },
        ],
      });
      await postPaymentVoucherToJournalApi(voucher.id, payload);
      onSuccess();
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Ghi nhận bút toán thất bại");
    } finally {
      setSaving(false);
    }
  }

  const actions: DrawerAction[] = voucher
    ? [
        { label: "Đóng", onClick: onClose, disabled: saving },
        {
          label: voucher.journal_entry_id
            ? "Lưu bút toán"
            : "Ghi nhận bút toán",
          primary: true,
          onClick: handleSubmit,
          loading: saving,
          disabled: saving,
        },
      ]
    : [];

  return (
    <DrawerModal
      open={open && !!voucher}
      onClose={onClose}
      confirmOnClose={isDirty}
      title={
        voucher?.journal_entry_id
          ? "Sửa bút toán chứng từ"
          : "Ghi nhận bút toán"
      }
      subtitle={voucher?.voucher_no ?? ""}
      panelClassName="w-[560px] max-w-[calc(100vw-24px)] max-[500px]:w-screen"
      bodyClassName="p-4 max-[500px]:p-3"
      actions={actions}
      stackOffset={-2.5}
      zIndex={500}
    >
      {voucher && (
        <div className="space-y-4">
          {error ? (
            <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
              {error}
            </div>
          ) : null}

          {/* Nghiệp vụ nhanh — distinct card with horizontal scroll */}
          <div className="rounded-xl border border-border bg-surface p-3 card-shadow">
            <div className="mb-1 text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em]">
              Nghiệp vụ nhanh
            </div>
            <p className="text-[11px] text-muted-fg mb-2">
              Chọn nghiệp vụ nhanh để tự điền tài khoản
            </p>
            <CashBankTagPresetCards
              presets={tagPresets}
              selectedId={selectedPresetId}
              debitAccountOpts={accountOptions}
              creditAccountOpts={accountOptions}
              disabled={saving}
              onSelect={handlePresetSelect}
              horizontal
            />
          </div>

          {/* Thông tin bút toán */}
          <div className="rounded-xl border border-border bg-surface p-3 card-shadow">
            <div className="text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em] mb-[10px] pb-[6px] border-b border-border">
              Thông tin bút toán
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 max-[500px]:grid-cols-1 gap-3">
                <DrawerField label="Số chứng từ">
                  <input
                    className={inputCls}
                    value={voucher.voucher_no}
                    disabled
                  />
                </DrawerField>
                <DrawerField label="Ngày bút toán" required>
                  <DatePicker
                    value={date}
                    onChange={(v) => {
                      setDate(v);
                      setIsDirty(true);
                    }}
                    className="w-full min-w-0"
                  />
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 max-[500px]:grid-cols-1 gap-3">
                <DrawerField label="Tài khoản Nợ" required>
                  <Combobox
                    options={accountOptions}
                    value={line.debit_account_id}
                    onChange={() => {}}
                    placeholder="Chọn TK Nợ"
                    disabled
                  />
                </DrawerField>
                <DrawerField label="Tài khoản Có" required>
                  <Combobox
                    options={accountOptions}
                    value={line.credit_account_id}
                    onChange={(v) => {
                      setLine((prev) => ({
                        ...prev,
                        credit_account_id: v || "",
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="Chọn TK Có"
                  />
                </DrawerField>
              </div>

              {/* Số tiền + Bằng chữ cùng hàng */}
              <div className="grid grid-cols-[1fr_1.5fr] max-[500px]:grid-cols-1 gap-3">
                <DrawerField label="Số tiền" required>
                  <input
                    className={inputCls}
                    value={formatMoneyInput(line.amount)}
                    disabled
                  />
                </DrawerField>
                <DrawerField label="Bằng chữ">
                  <input
                    className={inputCls}
                    value={moneyToVietnameseWords(line.amount)}
                    disabled
                  />
                </DrawerField>
              </div>

              <DrawerField label="Diễn giải">
                <textarea
                  className={inputCls}
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Nhập diễn giải bút toán..."
                />
              </DrawerField>
            </div>
          </div>
        </div>
      )}
    </DrawerModal>
  );
}
