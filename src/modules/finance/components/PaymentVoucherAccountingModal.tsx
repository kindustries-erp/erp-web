import { useEffect, useMemo, useState } from "react";
import {
  DrawerModal,
  DrawerField,
  inputCls,
  DEFAULT_STACK_OFFSET,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import type { ChartOfAccount } from "@/modules/accounting/api/catalogApi";
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
import { CashBankTagPresetCards } from "@/modules/finance/components/CashBankTagPresetCards";

interface Props {
  open: boolean;
  onClose: () => void;
  voucher: PaymentVoucher | null;
  accounts: ChartOfAccount[];
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

  useEffect(() => {
    if (!open || !voucher) return;
    setSaving(false);
    setError("");
    setSelectedPresetId("");
    setDate(defaultDate || new Date().toISOString().slice(0, 10));
    setDescription(
      defaultDescription || voucher.description || voucher.voucher_no,
    );
    setLine({
      ...emptySimpleLine(),
      debit_account_id: defaultDebitAccountId,
      credit_account_id: defaultCreditAccountId,
      amount: String(defaultAmount || Number(voucher.amount || 0) || 0),
      description:
        defaultDescription || voucher.description || voucher.voucher_no,
    });
  }, [
    open,
    voucher,
    defaultDebitAccountId,
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
      debit_account_id: preset.debit_account_id ?? "",
      credit_account_id: preset.credit_account_id ?? "",
      description: preset.description || prev.description,
    }));
    if (preset.description) setDescription(preset.description);
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
        "Vui lòng nhập đủ ngày hạch toán, TK Nợ, TK Có và số tiền hợp lệ",
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
      setError((e as Error)?.message || "Hạch toán thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (!voucher) return null;

  const actions: DrawerAction[] = [
    { label: "Đóng", onClick: onClose, disabled: saving },
    {
      label: "Ghi sổ",
      primary: true,
      onClick: handleSubmit,
      loading: saving,
      disabled: saving,
    },
  ];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Hạch toán chứng từ"
      subtitle={voucher.voucher_no}
      panelClassName="w-[560px] max-w-[calc(100vw-24px)]"
      bodyClassName="p-4"
      actions={actions}
      stackOffset={-2.5}
      zIndex={500}
    >
      <div className="space-y-3">
        {error ? (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {error}
          </div>
        ) : null}

        {/* Nghiệp vụ nhanh */}
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-fg">
            Nghiệp vụ nhanh
          </div>
          <CashBankTagPresetCards
            presets={tagPresets}
            selectedId={selectedPresetId}
            debitAccountOpts={accountOptions}
            creditAccountOpts={accountOptions}
            disabled={saving}
            onSelect={handlePresetSelect}
          />
        </div>

        {/* Thông tin hạch toán */}
        <div className="grid grid-cols-2 gap-3">
          <DrawerField label="Số chứng từ">
            <input className={inputCls} value={voucher.voucher_no} disabled />
          </DrawerField>
          <DrawerField label="Ngày hạch toán" required>
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </DrawerField>
        </div>
        <DrawerField label="Diễn giải">
          <input
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DrawerField>
        <div className="grid grid-cols-2 gap-3">
          <DrawerField label="Tài khoản Nợ" required>
            <Combobox
              options={accountOptions}
              value={line.debit_account_id}
              onChange={(v) =>
                setLine((prev) => ({ ...prev, debit_account_id: v || "" }))
              }
              placeholder="Chọn TK Nợ"
            />
          </DrawerField>
          <DrawerField label="Tài khoản Có" required>
            <Combobox
              options={accountOptions}
              value={line.credit_account_id}
              onChange={(v) =>
                setLine((prev) => ({ ...prev, credit_account_id: v || "" }))
              }
              placeholder="Chọn TK Có"
            />
          </DrawerField>
        </div>
        <DrawerField label="Số tiền" required>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={line.amount}
            onChange={(e) =>
              setLine((prev) => ({ ...prev, amount: e.target.value }))
            }
          />
        </DrawerField>
      </div>
    </DrawerModal>
  );
}
